export interface State {
    rows: string[][],
    row: number;
    col: number;
    status: string[][],
    done: boolean,
    win: boolean,
    keyboard: Record<string, KeyboardStatus>
}

export type KeyboardStatus = "absent" | "present" | "correct";
