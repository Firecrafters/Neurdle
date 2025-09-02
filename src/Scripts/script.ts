import type { State, KeyboardStatus } from "./types.js";
import { copyToClipboard } from "./finish.js";
import SettingsPopup from "./settings.js";
import generateDailyWord from "./daily.js";
import answerList from "./answers.js";
import debugLog from "./logger.js";
import * as Keyboard from "./keyboard.js";
import * as Config from "./config.js";

// If the debug log is enabled give a warning
debugLog("Debug log is enabled. Do not deploy the site without disabling it.", "warn");


// The loading screen (visible until DOMContentLoaded)
const loadingScreen = document.getElementById("loading-display") as HTMLElement;
document.addEventListener("DOMContentLoaded", () => loadingScreen.style.display = "none");

const enum Mode {
    DAILY = 1,
    RANDOM = 2
}

const urlMode = location.href.split("?")[1]?.split("=")[1];
const urlModeNum = urlMode == "daily" ? Mode.DAILY :
urlMode == "random" ? Mode.RANDOM : undefined;

let mode: Mode = urlModeNum || Mode.RANDOM;

function setMode(newMode: string): void {
    let newUrl = location.href;
    if (newUrl.includes("?")) {
        newUrl = newUrl.split("?")[0] as string;
    }
    newUrl += `?mode=${newMode}`;

    location.href = newUrl;
}

const restartButton = document.getElementById("restart-button") as HTMLElement;
if (mode == Mode.DAILY) restartButton.style.display = "none";

// Button to switch to random challenge
const randomButton = document.getElementById("option-mode-random") as HTMLElement;
randomButton.addEventListener("click", () => setMode("random"));

// Button to switch to daily challenge
const dailyButton = document.getElementById("option-mode-daily") as HTMLElement;
dailyButton.addEventListener("click", () => setMode("daily"));

// Hide the button for the current mode
switch (mode) {
    case Mode.DAILY:
        dailyButton.style.display = "none";
        break;
    case Mode.RANDOM:
        randomButton.style.display = "none";
        break;
}

// Button to switch to a random challenge
const playRandomButton = document.getElementById("random-button") as HTMLButtonElement;
playRandomButton.addEventListener("click", () => setMode("random"));
if (mode == Mode.RANDOM) playRandomButton.style.display = "none";

// The settings menu
const popup = document.getElementById("settings-popup") as HTMLElement;
const settingsPopup = new SettingsPopup(popup);
settingsPopup.close();

// Button to open the settings menu
const settingsButton = document.getElementById("option-settings") as HTMLButtonElement;
settingsButton.addEventListener("click", () => {
    settingsPopup.open();
    settingsButton.disabled = true;
});

// Listen for menu actions from Electron main process
if (window.api?.onMenuAction) {
    window.api.onMenuAction((_event: Event, action: string) => {
        switch (action) {
            case 'settings':
                settingsButton.click();
                break;
            // Add more cases for other menu actions as needed
        }
    });
}

// Button to close the settings menu
const settingsCloseButton = document.getElementById("popup-close-btn") as HTMLButtonElement;
settingsCloseButton.addEventListener("click", () => {
    settingsPopup.close();
    settingsButton.disabled = false;
});

// Spellcheck option in settings
export enum SpellcheckState {
    DISABLED = "0",
    ENABLED = "1"
}

let spellcheckEnabled: string = localStorage.getItem("spellcheck") || SpellcheckState.ENABLED;

const spellcheckSetting = document.getElementById("setting-spellcheck") as HTMLInputElement;

// Toggle spellcheck setting
spellcheckSetting.addEventListener("click", () => {
    if (spellcheckEnabled == SpellcheckState.ENABLED) {
        spellcheckEnabled = SpellcheckState.DISABLED;
    } else {
        spellcheckEnabled = SpellcheckState.ENABLED;
    }

    localStorage.setItem("spellcheck", spellcheckEnabled);
    updateSettings();
});

// Theme setting
enum Theme {
    DARK = "dark",
    LIGHT = "light",
}

// Get the theme from localstorage. If it is not found, set the theme to dark
let themeValue: string = localStorage.getItem("theme") || Theme.DARK;

// Theme option in settings
const themeSetting = document.getElementById("setting-theme") as HTMLInputElement;

themeSetting.addEventListener("click", () => {
    // Toggle the theme value
    if (themeValue == Theme.DARK) {
        themeValue = Theme.LIGHT;
    } else {
        themeValue = Theme.DARK;
    }

    localStorage.setItem("theme", themeValue);
    updateSettings();
});

// Update the settings options and apply the settings
function updateSettings(): void {
    const spellcheck: boolean = (spellcheckEnabled == SpellcheckState.ENABLED);
    spellcheckSetting.checked = spellcheck;

    const theme: boolean = (themeValue == Theme.DARK);
    themeSetting.checked = !theme;
    document.body.className = themeValue;
}

updateSettings();

let rand = Math.floor(Math.random() * answerList.length);
let ans: string;

if (mode == Mode.RANDOM) {
    ans = answerList[rand] as string;
} else {
    ans = generateDailyWord();
}

const ANSWER = ans;
const WORD_LEN = ANSWER.length;

const board: HTMLElement = document.getElementById("board") as HTMLElement;

// Change the board grid dynamically
board.style.aspectRatio = `${WORD_LEN} / ${Config.MAX_ROWS}`;
board.style.gridTemplateRows = `repeat(${Config.MAX_ROWS}, 1fr)`;
board.style.gridTemplateColumns = `repeat(${WORD_LEN}, 1fr)`;


const toast: HTMLElement = document.getElementById("toast") as HTMLElement;
const finishScreen: HTMLElement = document.getElementById("finish-screen") as HTMLElement;
const finishTitle: HTMLElement = document.getElementById("finish-title") as HTMLElement;
const shareGrid: HTMLElement = document.getElementById("share-grid") as HTMLElement;
const copyButton: HTMLElement = document.getElementById("copy-button") as HTMLElement;


let state: State = {
    rows: Array.from({ length: Config.MAX_ROWS }, () => Array(WORD_LEN).fill("")),
    row: 0,
    col: 0,
    status: Array.from({ length: Config.MAX_ROWS }, () => Array(WORD_LEN).fill("")),
    done: false,
    win: false,
    animating: false,
    keyboard: {} as Record<string, KeyboardStatus>,
};

// Function to create the game board
function buildBoard() {
    board.innerHTML = "";
    for (let r = 0; r < Config.MAX_ROWS; r++) {
        for (let c = 0; c < WORD_LEN; c++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.id = `tile-${r}-${c}`;
            const inner = document.createElement("div");
            inner.className = "inner";
            const front = document.createElement("div");
            front.className = "face front";
            const back = document.createElement("div");
            back.className = "face back";
            inner.appendChild(front);
            inner.appendChild(back);
            tile.appendChild(inner);
            board.appendChild(tile);
        }
    }
}

// Function to handle key presses
function handleKey(ch: string): void {
    const spellcheck: boolean = (spellcheckEnabled == SpellcheckState.ENABLED);
    Keyboard.handleKey(ch, state, WORD_LEN, toast, ANSWER, shareGrid, finishTitle, finishScreen, spellcheck, mode == Mode.RANDOM);
}

// Function to handle physical keyboard input
export function onKeydown(e: KeyboardEvent) {
    const key = e.key;
    if (key === "Enter") {
        handleKey("ENTER");
    } else if (key === "Backspace" || key === "Delete") {
        handleKey("BACKSPACE");
    } else if (/^[a-z]$/i.test(key)) {
        handleKey(key.toUpperCase());
    }
}

// Function to create the virtual keyboard
export function buildKeyboard() {
    const rows = [
        { el: document.getElementById("kb-row-1"), keys: "QWERTYUIOP".split("") },
        { el: document.getElementById("kb-row-2"), keys: "ASDFGHJKL".split("") },
        { el: document.getElementById("kb-row-3"), keys: ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"] },
    ];
    for (const row of rows) {
        (row.el as HTMLElement).innerHTML = "";
        for (const key of row.keys) {
            const button = document.createElement("button");
            button.className = "key" + ((key === "ENTER" || key === "BACKSPACE") ? " wide" : "");
            button.type = "button";
            button.setAttribute("data-key", key.length === 1 ? key : "");
            button.setAttribute("aria-label", key === "BACKSPACE" ? "Backspace" : (key === "ENTER" ? "Enter" : key));
            button.textContent = key === "BACKSPACE" ? "⌫" : (key === "ENTER" ? "Enter" : key);
            button.addEventListener("click", () => handleKey(key));
            (row.el as HTMLElement).appendChild(button);
        }
    }
}

// Get physical keyboard input
window.addEventListener("keydown", (e: KeyboardEvent): void  => onKeydown(e));
// Button to copy the results
copyButton.addEventListener("click", (): void => copyToClipboard(state, Config.MAX_ROWS, WORD_LEN, copyButton, ANSWER, mode == Mode.RANDOM));

// Build the game board and keyboard
buildBoard();
buildKeyboard();
