/**
 * @fileoverview Debug logging utility for development
 * Provides colored console output for debugging with production safety
 */

// ! NOTE: Do not deploy the site with DEBUG set to true
const DEBUG = false;

/**
 * Logs debug messages with color-coded levels when DEBUG is enabled.
 * Messages are completely suppressed in production when DEBUG is false.
 * 
 * @param msg - The message to log
 * @param level - Log level affecting console color: "info" (green), "warn" (orange), "error" (red)
 */
export default function debugLog(msg: string, level: "info" | "warn" | "error" = "info"): void {
    const color = level === "error" ? "red" : level === "warn" ? "orange" : "green";

    if (DEBUG) {
        console.log(`%c[DEBUG | ${level.toUpperCase()}]: ${msg}`, `color: ${color}`);
    }
}
