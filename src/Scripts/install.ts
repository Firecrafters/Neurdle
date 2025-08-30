import type { BeforeInstallPromptEvent } from "./types";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installButton = document.getElementById('install-btn') as HTMLButtonElement;

// Hide install button for non-Chromium browsers
function isChromiumBrowser(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();

    // Check for specific Chromium-based browsers
    const chromiumBrowsers = [
        'chrome',
        'edge',
        'opera',
        'brave',
        'vivaldi',
        'yandex'
    ];

    // Also check for general Chromium indicators
    const hasChromiumIndicators =
        userAgent.includes('chrome') ||
        userAgent.includes('chromium') ||
        userAgent.includes('crios'); // Chrome on iOS

    return chromiumBrowsers.some(browser => userAgent.includes(browser)) || hasChromiumIndicators;
}

// Hide button if not Chromium-based
if (installButton && !isChromiumBrowser()) {
    installButton.style.display = 'none';
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    if (installButton) installButton.hidden = false;
});

if (installButton) {
    installButton.addEventListener("click", async() => {
        installButton.hidden = true;
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
    });
}
