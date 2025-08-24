// ! NOTE: Do not deploy the site with DEBUG set to true
const DEBUG = false;

export default function debugLog(msg: string): void {
    if (DEBUG) {
        console.log(`[DEBUG]: ${msg}`);
    }
}
