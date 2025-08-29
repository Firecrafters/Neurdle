// ! NOTE: Do not deploy the site with DEBUG set to true
const DEBUG = false;

export default function debugLog(msg: string, level: "info" | "warn" | "error" = "info"): void {
    const color = level === "error" ? "red" : level === "warn" ? "orange" : "green";

    if (DEBUG) {
        console.log(`%c[DEBUG | ${level.toUpperCase()}]: ${msg}`, `color: ${color}`);
    }
}
