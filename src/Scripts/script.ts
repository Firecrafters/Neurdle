/**
 * @fileoverview Main game initialization and control logic for Neurdle
 * Sets up game modes, UI components, settings, and coordinates all game functionality
 */

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

// Hide loading screen when DOM is ready
const loadingScreen = document.getElementById("loading-display") as HTMLElement;
document.addEventListener("DOMContentLoaded", () => loadingScreen.style.display = "none");

/**
 * Game mode enumeration defining the two play styles available
 */
const enum Mode {
    /** Daily challenge with consistent word for all players */
    DAILY = 1,
    /** Random word from answer list for practice */
    RANDOM = 2
}

// Parse game mode from URL parameters
const urlMode = location.href.split("?")[1]?.split("=")[1];
const urlModeNum = urlMode == "daily" ? Mode.DAILY :
urlMode == "random" ? Mode.RANDOM : undefined;

let mode: Mode = urlModeNum || Mode.RANDOM;

/**
 * Changes the game mode by updating the URL and reloading the page.
 * This ensures a fresh game state with the new mode.
 * 
 * @param newMode - The mode string ("daily" or "random")
 */
function setMode(newMode: string): void {
    let newUrl = location.href;
    if (newUrl.includes("?")) {
        newUrl = newUrl.split("?")[0] as string;
    }
    newUrl += `?mode=${newMode}`;

    location.href = newUrl;
}

// Configure UI based on current mode
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

// Button to switch to a random challenge from finish screen
const playRandomButton = document.getElementById("random-button") as HTMLButtonElement;
playRandomButton.addEventListener("click", () => setMode("random"));
if (mode == Mode.RANDOM) playRandomButton.style.display = "none";

// Initialize settings popup
const popup = document.getElementById("settings-popup") as HTMLElement;
const settingsPopup = new SettingsPopup(popup);
settingsPopup.close();

// Button to open the settings menu
const settingsButton = document.getElementById("option-settings") as HTMLButtonElement;
settingsButton.addEventListener("click", () => {
    settingsPopup.open();
    settingsButton.disabled = true;
});

// Button to close the settings menu
const settingsCloseButton = document.getElementById("popup-close-btn") as HTMLButtonElement;
settingsCloseButton.addEventListener("click", () => {
    settingsPopup.close();
    settingsButton.disabled = false;
});

/**
 * Spellcheck setting states for localStorage persistence
 */
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

/**
 * Theme options for the game interface
 */
enum Theme {
    DARK = "dark",
    LIGHT = "light",
}

// Get the theme from localStorage. If it is not found, set the theme to dark
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

/**
 * Updates the UI to reflect current settings values.
 * Applies theme to document body and updates checkbox states.
 */
function updateSettings(): void {
    const spellcheck: boolean = (spellcheckEnabled == SpellcheckState.ENABLED);
    spellcheckSetting.checked = spellcheck;

    const theme: boolean = (themeValue == Theme.DARK);
    themeSetting.checked = !theme;
    document.body.className = themeValue;
}

updateSettings();

// Generate the target word based on game mode
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

// Configure board grid layout dynamically based on word length
board.style.aspectRatio = `${WORD_LEN} / ${Config.MAX_ROWS}`;
board.style.gridTemplateRows = `repeat(${Config.MAX_ROWS}, 1fr)`;
board.style.gridTemplateColumns = `repeat(${WORD_LEN}, 1fr)`;

// Get references to key UI elements
const toast: HTMLElement = document.getElementById("toast") as HTMLElement;
const finishScreen: HTMLElement = document.getElementById("finish-screen") as HTMLElement;
const finishTitle: HTMLElement = document.getElementById("finish-title") as HTMLElement;
const shareGrid: HTMLElement = document.getElementById("share-grid") as HTMLElement;
const copyButton: HTMLElement = document.getElementById("copy-button") as HTMLElement;

/**
 * Initialize the game state with empty grid and default values
 */
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

/**
 * Creates the game board DOM structure with tiles for each letter position.
 * Each tile contains inner structure for flip animations with front and back faces.
 */
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

/**
 * Internal key handler that applies current settings and delegates to keyboard module.
 * 
 * @param ch - The key character or command to handle
 */
function handleKey(ch: string): void {
    const spellcheck: boolean = (spellcheckEnabled == SpellcheckState.ENABLED);
    Keyboard.handleKey(ch, state, WORD_LEN, toast, ANSWER, shareGrid, finishTitle, finishScreen, spellcheck, mode == Mode.RANDOM);
}

/**
 * Handles physical keyboard input by converting KeyboardEvent to game input.
 * Maps physical keys to game commands and normalizes letter input to uppercase.
 * 
 * @param e - The keyboard event from user input
 */
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

/**
 * Creates the virtual keyboard UI with three rows of keys.
 * Generates buttons for each key with appropriate styling and event handlers.
 * Includes special handling for ENTER and BACKSPACE keys.
 */
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

// Set up event listeners
window.addEventListener("keydown", (e: KeyboardEvent): void  => onKeydown(e));
copyButton.addEventListener("click", (): void => copyToClipboard(state, Config.MAX_ROWS, WORD_LEN, copyButton, ANSWER, mode == Mode.RANDOM));

// Initialize the game
buildBoard();
buildKeyboard();
