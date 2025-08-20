import answerList from "./answers.js";
const FLIP_MS = 600;
const STAGGER_MS = 240;
const MAX_ROWS = 6;
var rand = Math.floor(Math.random() * answerList.length);
const ANSWER = answerList[rand] || "ERROR";
if (!ANSWER)
    console.error("An error occured while getting the answer.");
const WORD_LEN = ANSWER?.length || 5;
const board = document.getElementById("board");
// Change the board grid dynamically
board.style.aspectRatio = `${WORD_LEN} / ${MAX_ROWS}`;
board.style.gridTemplateRows = `repeat(${MAX_ROWS}, 1fr)`;
board.style.gridTemplateColumns = `repeat(${WORD_LEN}, 1fr)`;
const toast = document.getElementById("toast");
const finishScreen = document.getElementById("finish-screen");
const finishTitle = document.getElementById("finish-title");
const shareGrid = document.getElementById("share-grid");
const copyButton = document.getElementById("copy-button");
let state = {
    rows: Array.from({ length: MAX_ROWS }, () => Array(WORD_LEN).fill("")),
    row: 0,
    col: 0,
    status: Array.from({ length: MAX_ROWS }, () => Array(WORD_LEN).fill("")),
    done: false,
    win: false,
    keyboard: {},
};
function buildBoard() {
    board.innerHTML = "";
    for (let r = 0; r < MAX_ROWS; r++) {
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
function getFaces(row, col) {
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
        tile: tile,
        inner: inner,
        front: front,
        back: back
    };
}
function setTile(row, col, char) {
    try {
        const { tile, front, back } = getFaces(row, col);
        front.textContent = char;
        back.textContent = char;
        if (char)
            tile.classList.add("filled");
        else
            tile.classList.remove("filled");
    }
    catch (error) {
        console.error(`Error setting tile ${row},${col}:`, error);
    }
}
var Status;
(function (Status) {
    Status["CORRECT"] = "correct";
    Status["PRESENT"] = "present";
    Status["ABSENT"] = "absent";
})(Status || (Status = {}));
function setTileStatus(r, c, newStatus) {
    if (!state.status[r] || state.status[r][c] === undefined) {
        console.error(`Invalid tile position: row ${r}, col ${c}`);
        return;
    }
    state.status[r][c] = newStatus;
    try {
        const { back } = getFaces(r, c);
        back.classList.remove(Status.CORRECT, Status.PRESENT, Status.ABSENT);
        if (newStatus)
            back.classList.add(newStatus);
    }
    catch (error) {
        console.error(`Error setting tile status for ${r},${c}:`, error);
    }
}
const showToast = function (msg, ms = 1200) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
};
function evaluate(guess, answer) {
    const res = Array(WORD_LEN).fill("absent");
    const a = answer.split("");
    const g = guess.split("");
    const counts = {};
    for (let i = 0; i < WORD_LEN; i++)
        counts[a[i]] = (counts[a[i]] || 0) + 1;
    for (let i = 0; i < WORD_LEN; i++)
        if (g[i] === a[i]) {
            res[i] = "correct";
            counts[g[i]]--;
        }
    for (let i = 0; i < WORD_LEN; i++)
        if (res[i] !== "correct") {
            const ch = g[i];
            if (counts[ch] > 0) {
                res[i] = "present";
                counts[ch]--;
            }
        }
    return res;
}
function updateKeyboard(guess, statuses) {
    const rank = { "absent": 0, "present": 1, "correct": 2 };
    for (let i = 0; i < WORD_LEN; i++) {
        const ch = guess[i];
        const s = statuses[i];
        const prev = state.keyboard[ch];
        if (!prev || rank[s] > rank[prev]) {
            state.keyboard[ch] = s;
        }
    }
    document.querySelectorAll(".key[data-key]").forEach(btn => {
        const ch = btn.getAttribute("data-key");
        if (ch === null || ch === "")
            return;
        btn.classList.remove("correct", "present", "absent");
        const status = state.keyboard[ch];
        if (status) {
            btn.classList.add(status);
        }
    });
}
function commitRow() {
    const guess = (state.rows[state.row] || []).join("");
    if (guess.length < WORD_LEN) {
        showToast("You need to fill all 5 letters to make a guess!");
        return;
    }
    const statuses = evaluate(guess.toUpperCase(), ANSWER);
    for (let c = 0; c < WORD_LEN; c++)
        setTileStatus(state.row, c, statuses[c]);
    for (let c = 0; c < WORD_LEN; c++) {
        const { inner } = getFaces(state.row, c);
        setTimeout(() => { inner.classList.add("flip"); }, c * STAGGER_MS);
    }
    const totalDelay = (WORD_LEN - 1) * STAGGER_MS + FLIP_MS + 10;
    setTimeout(() => {
        updateKeyboard(guess.toUpperCase(), statuses);
        const win = statuses.every(s => s === "correct");
        state.win = win;
        state.done = win || state.row === MAX_ROWS - 1;
        if (state.done)
            showFinishScreen();
        else {
            state.row++;
            state.col = 0;
        }
    }, totalDelay);
}
function generateShareText() {
    const emojiMap = {
        "correct": "🟩",
        "present": "🟧",
        "absent": "⬛"
    };
    let shareText = `Firecrafter28.github.io/Neurdle\n ${state.win ? state.row + 1 : "X"}/${MAX_ROWS}\n\n`;
    for (let r = 0; r <= (state.win ? state.row : MAX_ROWS - 1); r++) {
        for (let c = 0; c < WORD_LEN; c++) {
            const status = state.status[r]?.[c];
            if (status) {
                shareText += emojiMap[status];
            }
            else {
                shareText += "⬛";
            }
        }
        shareText += "\n";
    }
    return shareText;
}
function createConfetti() {
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
function showFinishScreen() {
    const shareText = generateShareText();
    shareGrid.textContent = shareText;
    if (state.win) {
        finishTitle.textContent = "🎉 You got it!";
        createConfetti();
    }
    else {
        finishTitle.textContent = `Better luck next time!`;
    }
    finishScreen.setAttribute("aria-hidden", "false");
    const finishMessage = document.getElementById("finish-message");
    finishMessage.textContent = `The word was: ${ANSWER}`;
    setTimeout(() => {
        finishScreen.classList.add("show");
        finishScreen.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 800);
    const boardContainer = document.getElementById("board-container");
    const keyboard = document.getElementById("keyboard");
    setTimeout(() => {
        boardContainer.style.visibility = "hidden";
        keyboard.style.visibility = "hidden";
    }, 100);
}
function handleKey(ch) {
    if (state.done)
        return;
    if (ch === "ENTER") {
        commitRow();
        return;
    }
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
    if (!/^[A-Z]$/.test(ch))
        return;
    if (state.col >= WORD_LEN)
        return;
    const currentRow = state.rows[state.row];
    if (currentRow !== undefined) {
        currentRow[state.col] = ch;
    }
    setTile(state.row, state.col, ch);
    state.col++;
}
function onKeydown(e) {
    const key = e.key;
    if (key === "Enter") {
        handleKey("ENTER");
    }
    else if (key === "Backspace" || key === "Delete") {
        handleKey("BACKSPACE");
    }
    else if (/^[a-z]$/i.test(key)) {
        handleKey(key.toUpperCase());
    }
}
function buildKeyboard() {
    const rows = [
        { el: document.getElementById("kb-row-1"), keys: "QWERTYUIOP".split("") },
        { el: document.getElementById("kb-row-2"), keys: "ASDFGHJKL".split("") },
        { el: document.getElementById("kb-row-3"), keys: ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"] },
    ];
    for (const row of rows) {
        row.el.innerHTML = "";
        for (const key of row.keys) {
            const button = document.createElement("button");
            button.className = "key" + ((key === "ENTER" || key === "BACKSPACE") ? " wide" : "");
            button.type = "button";
            button.setAttribute("data-key", key.length === 1 ? key : "");
            button.setAttribute("aria-label", key === "BACKSPACE" ? "Backspace" : (key === "ENTER" ? "Enter" : key));
            button.textContent = key === "BACKSPACE" ? "⌫" : (key === "ENTER" ? "Enter" : key);
            button.addEventListener("click", () => handleKey(key));
            row.el.appendChild(button);
        }
    }
}
function copyToClipboard() {
    const shareText = generateShareText();
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
        }
        catch (err) {
            console.error("Could not copy text: ", err);
        }
        document.body.removeChild(textArea);
    });
}
window.addEventListener("keydown", onKeydown);
copyButton.addEventListener("click", copyToClipboard);
buildBoard();
buildKeyboard();
//# sourceMappingURL=script.js.map