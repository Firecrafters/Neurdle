export default class SettingsPopup {
    private readonly popup: HTMLElement;

    public constructor(popup: HTMLElement) {
        this.popup = popup;
    }

    public open(): void {
        this.popup.style.display = "unset";
    }

    public close(): void {
        this.popup.style.display = "none";
    }

}
