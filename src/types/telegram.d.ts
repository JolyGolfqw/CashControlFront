export {};

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  MainButton: {
    show(): void;
    hide(): void;
    setText(text: string): void;
    onClick(cb: () => void): void;
    offClick(cb?: () => void): void;
  };
}
