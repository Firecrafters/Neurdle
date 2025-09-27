/**
 * @fileoverview Toast notification system for displaying temporary messages
 * Provides a simple API for showing user feedback messages
 */

/**
 * Interface for the showToast function with an optional timeout property
 * The _t property stores the current timeout to allow clearing previous toasts
 */
interface ShowToastFunction {
    (msg: string, toast: HTMLElement, ms?: number): void;
    _t?: number;
}

/**
 * Displays a temporary toast notification message.
 * Automatically hides any currently shown toast and shows the new one.
 * 
 * @param msg - The message text to display
 * @param toast - The HTML element that will contain and display the toast
 * @param ms - Duration in milliseconds to show the toast (default: 1200ms)
 */
const showToast: ShowToastFunction = function(msg: string, toast: HTMLElement, ms = 1200) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
}

export default showToast;
