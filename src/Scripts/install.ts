/**
 * @fileoverview Progressive Web App installation functionality
 * Handles PWA installation prompts and browser compatibility checks
 */

import type { BeforeInstallPromptEvent } from "./types";

/** Stores the deferred install prompt event for later use */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/** The install button element that triggers PWA installation */
const installButton = document.getElementById('install-btn') as HTMLButtonElement;

/**
 * Detects if the current browser is Chromium-based.
 * PWA installation is primarily supported in Chromium browsers.
 * 
 * @returns True if the browser is Chromium-based, false otherwise
 */
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

// Hide install button if browser doesn't support PWA installation
if (installButton && !isChromiumBrowser()) {
    installButton.style.display = 'none';
}

/**
 * Event listener for the beforeinstallprompt event.
 * Captures the installation prompt and shows the install button.
 */
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    if (installButton) installButton.hidden = false;
});

/**
 * Click handler for the install button.
 * Triggers the PWA installation prompt when clicked.
 */
if (installButton) {
    installButton.addEventListener("click", async() => {
        installButton.hidden = true;
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
    });
}
