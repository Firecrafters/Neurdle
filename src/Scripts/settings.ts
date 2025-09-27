/**
 * @fileoverview Settings popup management class
 * Provides simple show/hide functionality for the game settings modal
 */

/**
 * Manages the display state of the settings popup modal.
 * Provides a clean API for opening and closing the settings interface.
 */
export default class SettingsPopup {
    /** The HTML element containing the settings popup */
    private readonly popup: HTMLElement;

    /**
     * Creates a new SettingsPopup instance.
     * @param popup - The HTML element that serves as the popup container
     */
    public constructor(popup: HTMLElement) {
        this.popup = popup;
    }

    /**
     * Shows the settings popup by making it visible.
     */
    public open(): void {
        this.popup.style.display = "unset";
    }

    /**
     * Hides the settings popup by setting display to none.
     */
    public close(): void {
        this.popup.style.display = "none";
    }

}
