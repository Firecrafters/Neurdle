/**
 * Extended Event interface for PWA installation prompt handling.
 * This interface provides access to the browser's native app installation prompt.
 */
export interface BeforeInstallPromptEvent extends Event {
  /** Array of platform names where the app can be installed */
  readonly platforms: string[];
  /** Promise that resolves with user's choice about the installation */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  /** Shows the installation prompt to the user */
  prompt(): Promise<void>;
}

/**
 * Represents the complete game state for the Neurdle word guessing game.
 * Contains all information needed to track game progress and UI state.
 */
export interface State {
    /** 2D array storing all letter guesses, organized by row and column */
    rows: string[][],
    /** Current row index (0-based) where the player is entering letters */
    row: number;
    /** Current column index (0-based) within the current row */
    col: number;
    /** 2D array storing the status of each guessed letter ("correct", "present", "absent") */
    status: string[][],
    /** Whether the game has finished (either won or lost) */
    done: boolean,
    /** Whether the player has successfully guessed the word */
    win: boolean,
    /** Whether tile animations are currently in progress (prevents input during animations) */
    animating: boolean,
    /** Tracks the status of each keyboard key for visual feedback */
    keyboard: Record<string, KeyboardStatus>
}

/**
 * Possible states for each letter on the virtual keyboard and in guesses.
 * - "absent": Letter is not in the target word
 * - "present": Letter is in the target word but in wrong position  
 * - "correct": Letter is in the target word and in correct position
 */
export type KeyboardStatus = "absent" | "present" | "correct";
