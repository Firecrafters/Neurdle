/**
 * @fileoverview Tile management system for the game board
 * Handles tile DOM manipulation, letter evaluation, and visual state updates
 */

import type { State } from "./types";

/**
 * Retrieves all DOM elements for a specific tile on the game board.
 * Each tile has a flip animation with front and back faces.
 * 
 * @param row - Zero-based row index of the tile
 * @param col - Zero-based column index of the tile
 * @returns Object containing references to tile DOM elements
 * @throws Error if tile or its child elements are not found
 */
export function getFaces(row: number, col: number) {
    const tile = document.getElementById(`tile-${row}-${col}`);
    if (!tile) {
        throw new Error(`Tile not found: tile-${row}-${col}`);
    }
    const inner = tile.querySelector(".inner");
    const front = tile.querySelector(".front");
    const back = tile.querySelector(".back");
    if (!inner || !front || !back) {
        throw new Error(`Tile elements not found for tile-${row}-${col}`);
    }
    return {
        tile: tile as HTMLElement,
        inner: inner as HTMLElement,
        front: front as HTMLElement,
        back: back as HTMLElement
    };
}

/**
 * Sets the character content of a tile on both its front and back faces.
 * Also manages the "filled" CSS class for styling empty vs filled tiles.
 * 
 * @param row - Zero-based row index of the tile
 * @param col - Zero-based column index of the tile  
 * @param char - The character to display, or empty string to clear
 */
export function setTile(row: number, col: number, char: string) {
    try {
        const { tile, front, back } = getFaces(row, col);
        front.textContent = char;
        back.textContent = char;
        if (char) tile.classList.add("filled");
        else tile.classList.remove("filled");
    } catch (error) {
        console.error(`Error setting tile ${row},${col}:`, error);
    }
}

/**
 * Evaluates a guess against the target answer using Wordle-style logic.
 * Returns status array indicating correct, present, or absent for each letter.
 * Handles duplicate letters correctly by tracking letter counts.
 * 
 * @param guess - The guessed word (should be same length as answer)
 * @param answer - The target word to compare against
 * @param wordLength - Expected length of both words
 * @returns Array of status strings: "correct", "present", or "absent" for each position
 */
export function evaluate(guess: string, answer: string, wordLength: number) {
    const res = Array(wordLength).fill("absent");
    const a = answer.split("");
    const g = guess.split("");
    
    // Count occurrences of each letter in the answer
    const counts: Record<string, number> = {};
    for (let i = 0; i < wordLength; i++) counts[a[i] as string] = (counts[a[i] as string] || 0) + 1;
    
    // First pass: mark correct positions and decrement counts
    for (let i = 0; i < wordLength; i++) if (g[i] === a[i]) { res[i] = "correct"; (counts[g[i] as string] as number)--; }
    
    // Second pass: mark present letters if count allows
    for (let i = 0; i < wordLength; i++) if (res[i] !== "correct") { const ch = g[i] as string; if ((counts[ch] as number) > 0) { res[i] = "present"; (counts[ch] as number)--; } }
    
    return res;
}

/**
 * Enum defining the possible status values for tiles and letters.
 * Used for CSS class names and state tracking.
 */
const enum Status {
    CORRECT = "correct",
    PRESENT = "present", 
    ABSENT = "absent"
}

/**
 * Updates the visual status of a tile by setting CSS classes on its back face.
 * Also updates the game state to track the tile's evaluation status.
 * 
 * @param r - Zero-based row index of the tile
 * @param c - Zero-based column index of the tile
 * @param newStatus - The new status to apply ("correct", "present", or "absent")
 * @param state - The game state object to update
 */
export function setTileStatus(r: number, c: number, newStatus: Status, state: State) {
    if (!state.status[r] || state.status[r][c] === undefined) {
        console.error(`Invalid tile position: row ${r}, col ${c}`);
        return;
    }

    state.status[r][c] = newStatus;

    try {
        const { back } = getFaces(r, c);
        back.classList.remove(Status.CORRECT, Status.PRESENT, Status.ABSENT);
        if (newStatus) back.classList.add(newStatus);
    } catch (error) {
        console.error(`Error setting tile status for ${r},${c}:`, error);
    }
}
