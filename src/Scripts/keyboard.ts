/**
 * @fileoverview Keyboard input handling and game logic processing
 * Manages letter input, guess validation, row completion, and keyboard state updates
 */

import { getFaces, setTile, setTileStatus, evaluate } from "./tile.js";
import { showFinishScreen } from "./finish.js";
import showToast from "./toast.js";
import spellCheck from "./spellcheck.js";
import * as Config from "./config.js";
import type { State, KeyboardStatus } from "./types";

/**
 * Updates the visual state of virtual keyboard keys based on guess results.
 * Uses a ranking system to ensure better information (correct > present > absent)
 * is never overwritten by worse information.
 * 
 * @param guess - The guessed word (uppercase)
 * @param statuses - Array of status strings for each letter position
 * @param wordLength - Length of the target word
 * @param state - Game state to update with keyboard status
 */
function updateKeyboard(guess: string, statuses: string[], wordLength: number, state: State) {
    // Ranking system: correct status trumps present which trumps absent
    const rank: Record<KeyboardStatus, number> = { "absent": 0, "present": 1, "correct": 2 };

    // Update keyboard state with better information only
    for (let i = 0; i < wordLength; i++) {
        const ch = guess[i] as string;
        const s = statuses[i] as KeyboardStatus;

        const prev = state.keyboard[ch];
        if (!prev || rank[s] > rank[prev as KeyboardStatus]) {
            state.keyboard[ch] = s;
        }
    }

    // Apply visual styles to keyboard keys
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

/**
 * Processes a completed row of guesses with validation and animations.
 * Validates the guess, evaluates against answer, triggers tile flip animations,
 * updates keyboard state, and checks for win/lose conditions.
 * 
 * @param state - Current game state
 * @param wordLength - Length of the target word
 * @param toast - Toast element for showing error messages
 * @param answer - The correct word
 * @param shareGrid - Element for displaying shareable results  
 * @param finishTitle - Element for finish screen title
 * @param finishScreen - Container for finish screen
 * @param useSpellcheck - Whether to validate words against dictionary
 * @param showAnswer - Whether to reveal answer in finish screen
 */
function commitRow(state: State, wordLength: number, toast: HTMLElement, answer: string, shareGrid: HTMLElement, finishTitle: HTMLElement, finishScreen: HTMLElement, useSpellcheck: boolean, showAnswer: boolean) {
    const guess = (state.rows[state.row] || []).join("");
    
    // Validate guess if spellcheck is enabled
    if (useSpellcheck && !spellCheck(guess)) {
        showToast(`You must guess actual words or Neuro-themed words.`, toast);
        return;
    }
    
    // Check if guess is complete
    if (guess.length < wordLength) {
        showToast(`You need to fill all ${wordLength} letters to make a guess!`, toast);
        return;
    }

    // Prevent multiple simultaneous commits during animations
    state.animating = true;

    // Evaluate guess and update tile statuses
    const statuses = evaluate(guess.toUpperCase(), answer, wordLength);
    for (let c = 0; c < wordLength; c++) setTileStatus(state.row, c, statuses[c], state);
    
    // Trigger staggered flip animations
    for (let c = 0; c < wordLength; c++) {
        const { inner } = getFaces(state.row, c);
        setTimeout(() => { inner.classList.add("flip"); }, c * Config.STAGGER_MS);
    }
    
    // Process results after all animations complete
    const totalDelay = (wordLength - 1) * Config.STAGGER_MS + Config.FLIP_MS + 10;
    setTimeout(() => {
        updateKeyboard(guess.toUpperCase(), statuses, wordLength, state);
        const win = statuses.every(s => s === "correct");
        state.win = win;
        state.done = win || state.row === Config.MAX_ROWS - 1;

        // Clear animation flag before proceeding
        state.animating = false;

        if (state.done) showFinishScreen(state, Config.MAX_ROWS, wordLength, shareGrid, finishTitle, finishScreen, answer, showAnswer);
        else { state.row++; state.col = 0; }
    }, totalDelay);
}

/**
 * Main keyboard input handler for the game.
 * Processes different types of input (letters, backspace, enter) and
 * delegates to appropriate handling functions.
 * 
 * @param ch - The input character or special key ("ENTER", "BACKSPACE", or A-Z)
 * @param state - Current game state
 * @param wordLength - Length of the target word
 * @param toast - Toast element for showing messages
 * @param answer - The correct word
 * @param shareGrid - Element for displaying results
 * @param finishTitle - Element for finish screen title
 * @param finishScreen - Container for finish screen
 * @param useSpellcheck - Whether to validate guesses against dictionary
 * @param showAnswer - Whether to reveal answer in finish screen
 */
export function handleKey(ch: string, state: State, wordLength: number, toast: HTMLElement, answer: string, shareGrid: HTMLElement, finishTitle: HTMLElement, finishScreen: HTMLElement, useSpellcheck: boolean, showAnswer: boolean) {
    // Ignore input if game is done or animations are playing
    if (state.done || state.animating) return;

    // Handle enter key - commit the current row
    if (ch === "ENTER") { commitRow(state, wordLength, toast, answer, shareGrid, finishTitle, finishScreen, useSpellcheck, showAnswer); return; }
    
    // Handle backspace - remove last letter
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
    
    // Handle letter input - add letter if space available
    if (!/^[A-Z]$/.test(ch)) return;
    if (state.col >= wordLength) return;
    const currentRow = state.rows[state.row];
    if (currentRow !== undefined) {
        currentRow[state.col] = ch;
    }
    setTile(state.row, state.col, ch);
    state.col++;
}
