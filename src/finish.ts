import type { State } from "./types";

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

export function showFinishScreen(state: State, maxRows: number, wordLength: number, shareGrid: HTMLElement, finishTitle: HTMLElement, finishScreen: HTMLElement, answer: string): void {
    const shareText = generateShareText(state, maxRows, wordLength);
    shareGrid.textContent = shareText;

    if (state.win) {
        finishTitle.textContent = "🎉 You got it!";
        createConfetti();
    } else {
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

export function generateShareText(state: State, maxRows: number, wordLength: number): string {
    const emojiMap = {
        "correct": "🟩",
        "present": "🟧",
        "absent": "⬛"
    };

    let shareText = `Firecrafter28.github.io/Neurdle\n ${state.win ? state.row + 1 : "X"}/${maxRows}\n\n`;

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

export function copyToClipboard(state: State, maxRows: number, wordLength: number, copyButton: HTMLElement) {
    const shareText = generateShareText(state, maxRows, wordLength);
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
