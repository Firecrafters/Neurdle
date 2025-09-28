/**
 * @fileoverview End-game screen functionality and sharing system
 * Handles game completion display, confetti animation, and result sharing
 */

import type { State } from "./types";
import debugLog from "./logger.js";

/**
 * Creates an animated confetti effect for game completion celebrations.
 * Spawns colored squares and circles that fall from top of screen with physics.
 * Elements are automatically cleaned up after animation completes.
 */
function createConfetti(): void {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"];
    const shapes = ["square", "circle"];
    const totalConfetti = 150;
    const initialDelay = 400;
    const spawnDuration = 3000;

    for (let i = 0; i < totalConfetti; i++) {
        const spawnDelay = initialDelay + (i / totalConfetti) * spawnDuration;

        setTimeout(() => {
            const confetti = document.createElement("div");
            confetti.setAttribute("aria-hidden", "true");
            confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)] || "red";
            confetti.style.left = Math.random() * 100 + "vw";
            confetti.style.top = "-10px";

            document.body.appendChild(confetti);

            const animation = confetti.animate([
                {
                    transform: `translateY(-10px) translateX(0px) rotate(0deg)`,
                    opacity: 1
                },
                {
                    transform: `translateY(100vh) translateX(${(Math.random() - 0.5) * 300}px) rotate(${Math.random() * 720}deg)`,
                    opacity: 0
                }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                fill: "forwards"
            });

            animation.addEventListener("finish", () => {
                confetti.remove();
            });
        }, spawnDelay);
    }
}

/**
 * Displays the finish screen when the game ends (win or lose).
 * Shows appropriate message, generates share text, triggers confetti for wins,
 * and hides the game board and keyboard.
 * 
 * @param state - Current game state containing win/lose status
 * @param maxRows - Maximum number of allowed guesses
 * @param wordLength - Length of the target word
 * @param shareGrid - Element to display the shareable grid
 * @param finishTitle - Element for the finish message title
 * @param finishScreen - Container element for the entire finish screen
 * @param answer - The correct word
 * @param showAnswer - Whether to include the answer in the share text
 */
export function showFinishScreen(state: State, maxRows: number, wordLength: number, shareGrid: HTMLElement, finishTitle: HTMLElement, finishScreen: HTMLElement, answer: string, showAnswer: boolean): void {
    debugLog("Game finished");
    const shareText = generateShareText(state, maxRows, wordLength, answer, showAnswer);
    shareGrid.textContent = shareText;

    if (state.win) {
        debugLog("Player won");
        finishTitle.textContent = "🎉 You got it!";
        createConfetti();
    } else {
        debugLog("Player lost");
        finishTitle.textContent = `Better luck next time!`;
    }

    finishScreen.setAttribute("aria-hidden", "false");

    const finishMessage: HTMLElement = document.getElementById("finish-message") as HTMLElement;
    finishMessage.textContent = `The word was: ${answer}`;

    setTimeout(() => {
        finishScreen.classList.add("show");
        finishScreen.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 800);

    const boardContainer: HTMLElement = document.getElementById("board-container") as HTMLElement;
    const keyboard: HTMLElement = document.getElementById("keyboard") as HTMLElement;

    if (boardContainer && keyboard) {
        boardContainer.classList.add("hidden");
        keyboard.classList.add("hidden");
    }

}

/**
 * Generates shareable text representation of the game results using emojis.
 * Creates a grid showing the pattern of correct/present/absent guesses
 * in the same format as Wordle sharing.
 * 
 * @param state - Game state containing the guess results
 * @param maxRows - Maximum number of guess attempts allowed
 * @param wordLength - Length of the target word
 * @param answer - The correct word
 * @param showAnswer - Whether to include the actual answer in the share text
 * @returns Formatted string ready for sharing on social media
 */
export function generateShareText(state: State, maxRows: number, wordLength: number, answer: string, showAnswer: boolean): string {
    const emojiMap = {
        "correct": "🟩",   // Green square for correct letter in correct position
        "present": "🟧",   // Orange square for correct letter in wrong position  
        "absent": "⬛"     // Black square for letter not in word
    };

    let shareText = `https://firecrafter28.github.io/Neurdle\n`;
    if (showAnswer) shareText += `The word was "${answer}"\n`;
    shareText += (state.win ? `${state.row + 1}/${maxRows}` : "Failed");
    shareText += "\n\n"

    // Generate emoji grid for all completed rows
    for (let r = 0; r <= (state.win ? state.row : maxRows - 1); r++) {
        for (let c = 0; c < wordLength; c++) {
            const status = state.status[r]?.[c];
            if (status) {
                shareText += emojiMap[status as keyof typeof emojiMap];
            } else {
                shareText += "⬛";
            }
        }
        shareText += "\n";
    }
    return shareText;
}

/**
 * Copies the game results to the user's clipboard with fallback support.
 * First tries modern clipboard API, falls back to legacy execCommand method.
 * Provides visual feedback by temporarily changing button text and style.
 * 
 * @param state - Current game state for generating share text
 * @param maxRows - Maximum number of allowed guesses
 * @param wordLength - Length of the target word  
 * @param copyButton - Button element to provide visual feedback
 * @param answer - The correct word
 * @param showAnswer - Whether to include the answer in the share text
 */
export function copyToClipboard(state: State, maxRows: number, wordLength: number, copyButton: HTMLElement, answer: string, showAnswer: boolean) {
    const shareText = generateShareText(state, maxRows, wordLength, answer, showAnswer);
    
    // Try modern clipboard API first
    navigator.clipboard.writeText(shareText).then(() => {
        copyButton.textContent = "Copied!";
        copyButton.classList.add("copied");
        setTimeout(() => {
            copyButton.textContent = "Copy to clipboard";
            copyButton.classList.remove("copied");
        }, 2000);
    }).catch(() => {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
            copyButton.textContent = "Copied!";
            copyButton.classList.add("copied");
            setTimeout(() => {
                copyButton.textContent = "Copy to clipboard";
                copyButton.classList.remove("copied");
            }, 2000);
        } catch (err) {
            console.error("Could not copy text: ", err);
        }
        document.body.removeChild(textArea);
    });
}
