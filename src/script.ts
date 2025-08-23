import type { State, KeyboardStatus } from "./types.js";
import { copyToClipboard } from "./finish.js";
import SettingsPopup from "./settings.js";
import answerList from "./answers.js";
import * as Keyboard from "./keyboard.js";
import * as Config from "./config.js";

const popup = document.getElementById("settings-popup") as HTMLElement;
const settingsPopup = new SettingsPopup(popup);
settingsPopup.close();

const settingsButton = document.getElementById("option-settings") as HTMLButtonElement;
settingsButton.addEventListener("click", () => {
    settingsPopup.open();
    settingsButton.disabled = true;
});

const settingsCloseButton = document.getElementById("popup-close-btn") as HTMLButtonElement;
settingsCloseButton.addEventListener("click", () => {
    settingsPopup.close();
    settingsButton.disabled = false
});

export enum SpellcheckState {
    DISABLED = "0",
    ENABLED = "1"
}

let spellcheckEnabled: string = localStorage.getItem("spellcheck") || SpellcheckState.ENABLED;

const spellcheckSetting = document.getElementById("setting-spellcheck") as HTMLInputElement;

function updateSettings(): void {
    const spellcheck: boolean = (spellcheckEnabled == SpellcheckState.ENABLED);
    spellcheckSetting.checked = spellcheck;
}

updateSettings();

spellcheckSetting.addEventListener("click", () => {
    if (spellcheckEnabled == SpellcheckState.ENABLED) {
        spellcheckEnabled = SpellcheckState.DISABLED;
    } else {
        spellcheckEnabled = SpellcheckState.ENABLED;
    }

    localStorage.setItem("spellcheck", spellcheckEnabled);
    updateSettings();
});

let rand = Math.floor(Math.random() * answerList.length);
const ANSWER = answerList[rand] || "ERROR";
if (!ANSWER) console.error("An error occured while getting the answer.");
const WORD_LEN: number = ANSWER?.length || 5;

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
    keyboard: {} as Record<string, KeyboardStatus>,
};

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

function handleKey(ch: string): void {
    const spellcheck: boolean = (spellcheckEnabled == SpellcheckState.ENABLED);
    Keyboard.handleKey(ch, state, WORD_LEN, toast, ANSWER, shareGrid, finishTitle, finishScreen, spellcheck);
}

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


window.addEventListener("keydown", (e: KeyboardEvent): void  => onKeydown(e));
copyButton.addEventListener("click", (): void => copyToClipboard(state, Config.MAX_ROWS, WORD_LEN, copyButton, ANSWER));

buildBoard();
buildKeyboard();
