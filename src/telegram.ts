export const tg = (window as any).Telegram?.WebApp;

export function initTelegram() {
  if (!tg) {
    console.warn("Telegram WebApp not found");
    return;
  }

  tg.ready();
  tg.expand();
}
