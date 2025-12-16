import { useEffect } from "react";
import type { View } from "../types/View";

export function useTelegramNavigation(
  tg: any,
  view: View,
  setView: (v: View) => void
) {
  useEffect(() => {
    if (!tg) return; // Не выполняем, если tg === null (dev режим)

    tg.MainButton.offClick();

    switch (view) {
      case "expenses":
        tg.MainButton.setText("➕ Добавить расход");
        tg.MainButton.show();
        tg.MainButton.onClick(() => setView("add-expense"));
        break;

      case "add-expense":
      case "categories":
      case "budget":
      case "dashboard":
        tg.MainButton.setText("➕ Добавить расход");
        tg.MainButton.onClick(() => setView("add-expense"));
        break;

      case "analytics":
        tg.MainButton.setText("← Назад");
        tg.MainButton.show();
        tg.MainButton.onClick(() => setView("expenses"));
        break;
    }

    return () => tg.MainButton.offClick();
  }, [tg, view]);
}
