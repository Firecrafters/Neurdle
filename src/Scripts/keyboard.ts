import { getFaces, setTile, setTileStatus, evaluate } from "./tile.js";
import { showFinishScreen } from "./finish.js";
import showToast from "./toast.js";
import spellCheck from "./spellcheck.js";
import * as Config from "./config.js";
import type { State, KeyboardStatus } from "./types";

function updateKeyboard(guess: string, statuses: string[], wordLength: number, state: State) {
    const rank: Record<KeyboardStatus, number> = { "absent": 0, "present": 1, "correct": 2 };

    for (let i = 0; i < wordLength; i++) {
        const ch = guess[i] as string;
        const s = statuses[i] as KeyboardStatus;

        const prev = state.keyboard[ch];
        if (!prev || rank[s] > rank[prev as KeyboardStatus]) {
            state.keyboard[ch] = s;
        }
    }

    document.querySelectorAll(".key[data-key]").forEach(btn => {
        const ch = btn.getAttribute("data-key");
        if (ch === null || ch === "") return;

        btn.classList.remove("correct", "present", "absent");
        const status = state.keyboard[ch];
        if (status) {
            btn.classList.add(status);
        }
    });
}

function commitRow(state: State, wordLength: number, toast: HTMLElement, answer: string, shareGrid: HTMLElement, finishTitle: HTMLElement, finishScreen: HTMLElement, useSpellcheck: boolean, showAnswer: boolean) {
    const guess = (state.rows[state.row] || []).join("");
    if (useSpellcheck && !spellCheck(guess)) {
        showToast(`You must guess actual words or Neuro-themed words.`, toast);
        return;
    }
    if (guess.length < wordLength) {
        showToast(`You need to fill all ${wordLength} letters to make a guess!`, toast);
        return;
    }

    // Set animating flag to prevent multiple commitRow calls
    state.animating = true;

    const statuses = evaluate(guess.toUpperCase(), answer, wordLength);
    for (let c = 0; c < wordLength; c++) setTileStatus(state.row, c, statuses[c], state);
    for (let c = 0; c < wordLength; c++) {
        const { inner } = getFaces(state.row, c);
        setTimeout(() => { inner.classList.add("flip"); }, c * Config.STAGGER_MS);
    }
    const totalDelay = (wordLength - 1) * Config.STAGGER_MS + Config.FLIP_MS + 10;
    setTimeout(() => {
        updateKeyboard(guess.toUpperCase(), statuses, wordLength, state);
        const win = statuses.every(s => s === "correct");
        state.win = win;
        state.done = win || state.row === Config.MAX_ROWS - 1;

        // Clear animating flag before potentially showing finish screen or advancing row
        state.animating = false;

        if (state.done) showFinishScreen(state, Config.MAX_ROWS, wordLength, shareGrid, finishTitle, finishScreen, answer, showAnswer);
        else { state.row++; state.col = 0; }
    }, totalDelay);
}

export function handleKey(ch: string, state: State, wordLength: number, toast: HTMLElement, answer: string, shareGrid: HTMLElement, finishTitle: HTMLElement, finishScreen: HTMLElement, useSpellcheck: boolean, showAnswer: boolean) {
    if (state.done || state.animating) return;

    if (ch === "ENTER") { commitRow(state, wordLength, toast, answer, shareGrid, finishTitle, finishScreen, useSpellcheck, showAnswer); return; }
    if (ch === "BACKSPACE") {
        if (state.col > 0) {
            state.col--;
            const currentRow = state.rows[state.row];
            if (currentRow !== undefined) {
                currentRow[state.col] = "";
                setTile(state.row, state.col, "");
            }
        }
        return;
    }
    if (!/^[A-Z]$/.test(ch)) return;
    if (state.col >= wordLength) return;
    const currentRow = state.rows[state.row];
    if (currentRow !== undefined) {
        currentRow[state.col] = ch;
    }
    setTile(state.row, state.col, ch);
    state.col++;
}
