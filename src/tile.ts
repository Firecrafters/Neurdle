import type { State } from "./types";

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

export function evaluate(guess: string, answer: string, wordLength: number) {
    const res = Array(wordLength).fill("absent");
    const a = answer.split("");
    const g = guess.split("");
    const counts: Record<string, number> = {};
    for (let i = 0; i < wordLength; i++) counts[a[i] as string] = (counts[a[i] as string] || 0) + 1;
    for (let i = 0; i < wordLength; i++) if (g[i] === a[i]) { res[i] = "correct"; (counts[g[i] as string] as number)--; }
    for (let i = 0; i < wordLength; i++) if (res[i] !== "correct") { const ch = g[i] as string; if ((counts[ch] as number) > 0) { res[i] = "present"; (counts[ch] as number)--; } }
    return res;
}

const enum Status {
    CORRECT = "correct",
    PRESENT = "present",
    ABSENT = "absent"
}

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
