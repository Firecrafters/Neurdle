export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface ElectronAPI {
  isDesktop: boolean;
  platform: string;
  allowAnalytics: boolean;
  onMenuAction: (callback: (event: Event, action: string) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    api?: ElectronAPI;
  }
}

export interface State {
    rows: string[][],
    row: number;
    col: number;
    status: string[][],
    done: boolean,
    win: boolean,
    animating: boolean,
    keyboard: Record<string, KeyboardStatus>
}

export type KeyboardStatus = "absent" | "present" | "correct";
