import { useEffect, useState } from "react";
import ExpensesPage from "./pages/ExpensesPage";
import CategoriesPage from "./pages/CategoriesPage";
import AddExpenseForm from "./components/AddExpenseForm";
import AnalyticsPage from "./pages/AnalyticsPage";
import BudgetPage from "./pages/BudgetPaget";
import type { View } from "./types/View";
import { initTelegram } from "./telegram";
import { loginWithTelegram } from "./api";
import { useTelegramNavigation } from "./hooks/useTelegramNavigation";
import { useApp } from "./context/AppContext";
import { isDevMode, createMockTelegramWebApp } from "./utils/devMode";
import DevAuthForm from "./components/DevAuthForm";
import "./chart";
import "./App.css";
import DashboardPage from "./pages/DashboardPage";
import RecurringExpensesPage from "./pages/RecurringExpensesPage";

const NAV_ITEMS: Array<{
  view: View;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    view: "dashboard",
    label: "Обзор",
    icon: "📊",
    description: "Сводка по бюджету, аналитика и предупреждения",
  },
  {
    view: "expenses",
    label: "Расходы",
    icon: "💳",
    description: "Список расходов и возможность быстро обновить данные",
  },
  {
    view: "analytics",
    label: "Аналитика",
    icon: "📈",
    description: "Тренды и графики, которые помогают принимать решения",
  },
  {
    view: "categories",
    label: "Категории",
    icon: "🗂️",
    description: "Добавляйте и удаляйте категории расходов",
  },
  {
    view: "budget",
    label: "Бюджет",
    icon: "🎯",
    description: "Контролируйте лимиты и предупреждения",
  },
  {
    view: "recurring",
    label: "Повторы",
    icon: "🔁",
    description: "Регулярные списания и подписки",
  },
];

export default function App() {
  const [tg, setTg] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [isDev] = useState(() => isDevMode());
  const { categories, loadCategories } = useApp();

  useEffect(() => {
    // Автоматически определяем режим работы
    const hasTelegram = window.Telegram?.WebApp;
    
    if (isDev || !hasTelegram) {
      // Режим разработки - используем мок (автоматически для браузера)
      console.log('🔧 DEV MODE: Работаем в браузере');
      const mockTg = createMockTelegramWebApp();
      (window as any).Telegram = { WebApp: mockTg };
      setTg(mockTg);
      
      // Проверяем, есть ли сохраненный токен
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        loadCategories();
      }
    } else {
      // Обычный режим - используем Telegram (только в Mini App)
      initTelegram();
      const webApp = window.Telegram?.WebApp;
      
      if (webApp) {
        webApp.ready();
        webApp.expand();
        setTg(webApp);
      }
    }
  }, [isDev, loadCategories]);

  useEffect(() => {
    if (!tg || isDev) return;

    if (!tg.initData) {
      setError("Открой Mini App из Telegram");
      return;
    }

    loginWithTelegram(tg.initData)
      .then((data) => {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        // Загружаем категории после авторизации
        loadCategories();
      })
      .catch(() => setError("Ошибка авторизации"));
  }, [tg, isDev, loadCategories]);

  // Навигация Telegram только в продакшн режиме
  useTelegramNavigation(!isDev ? tg : null, view, setView);

  if (error && !isDev) {
    return (
      <div className="status-screen">
        <p className="status-screen__message">{error}</p>
        <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
          Для дебага добавьте <code>?dev=true</code> в URL
        </p>
      </div>
    );
  }

  if ((!tg || !token) && !isDev) {
    return (
      <div className="status-screen">
        <p className="status-screen__message">Авторизация…</p>
      </div>
    );
  }

  // В dev режиме показываем форму авторизации без токена
  if (isDev && !token) {
    return (
      <div className="status-screen">
        <div className="status-screen__message status-screen__message--wide">
          <p className="status-screen__title">🔧 Режим разработки</p>
          <p className="status-screen__subtitle">
            Войдите или зарегистрируйтесь для доступа к приложению
          </p>
          
          <DevAuthForm
            onSuccess={(newToken) => {
              setToken(newToken);
              loadCategories();
            }}
          />

          <div className="token-hint">
            <span>💡 Или используйте существующий токен:</span>
            <button
              className="token-hint__btn"
              onClick={() => {
                const devToken = prompt('Введите токен:');
                if (devToken && devToken.trim()) {
                  localStorage.setItem("token", devToken.trim());
                  setToken(devToken.trim());
                  loadCategories();
                }
              }}
            >
              Вставить токен
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeItem =
    NAV_ITEMS.find((item) => item.view === view) ?? NAV_ITEMS[0];

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <DashboardPage />;

      case "expenses":
        return <ExpensesPage onAdd={() => setView("add-expense")} />;

      case "add-expense":
        return (
          <div className="panel panel--accent">
            <div className="panel__header-group">
              <p className="panel__eyebrow">Новый расход</p>
              <h2 className="panel__title">Добавить расход</h2>
              <p className="panel__description">Сохраните трату в пару кликов</p>
            </div>
            <AddExpenseForm onCreated={() => setView("expenses")} />
          </div>
        );

      case "categories":
        return <CategoriesPage onChange={() => {}} />;

      case "analytics":
        return <AnalyticsPage />;

      case "budget":
        return <BudgetPage />;

      case "recurring":
        return <RecurringExpensesPage />;

      default:
        return null;
    }
  };

  const viewPanel = renderView();

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div>
          <p className="app-shell__eyebrow">CashControl MiniApp</p>
          <h1 className="app-shell__title">
            {activeItem.icon} {activeItem.label}
          </h1>
          <p className="app-shell__description">{activeItem.description}</p>
        </div>
        <div className="app-shell__header-meta">
          <span className="app-shell__tag">
            Категорий {categories.length}
          </span>
        </div>
      </header>

      <main className="app-shell__main" aria-live="polite">
        {isDev && (
          <div className="dev-alert">
            <span className="dev-alert__label">🔧 DEV MODE — Работа в браузере</span>
            <button 
              className="dev-alert__btn"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              Сбросить токен
            </button>
          </div>
        )}
        <section className="app-shell__view-panel" key={view}>
          {viewPanel}
        </section>
        <p className="app-shell__hint">
          {isDev ? "Режим разработки — используйте навигацию ниже" : "Переключайтесь через меню или кнопки Telegram"}
        </p>
      </main>

      <nav
        className="app-shell__nav"
        aria-label="Основная навигация"
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            type="button"
            className={`app-shell__nav-button ${view === item.view ? "app-shell__nav-button--active" : ""}`}
            onClick={() => setView(item.view)}
            aria-pressed={view === item.view}
            title={item.description}
          >
            <span className="app-shell__nav-icon">{item.icon}</span>
            <span className="app-shell__nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
