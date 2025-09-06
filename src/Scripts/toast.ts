interface ShowToastFunction {
    (msg: string, toast: HTMLElement, ms?: number): void;
    _t?: number;
}

const showToast: ShowToastFunction = function(msg: string, toast: HTMLElement, ms = 1200) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
}

export default showToast;
