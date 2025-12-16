import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import BudgetSummary from "../components/BudgetSummary";
import BudgetWarning from "../components/BudgetWarning";
import AnalyticsChart from "../components/AnalyticsChart";
import CategoryPieChart from "../components/CategoryPieChart";

export type CategoryChartItem = {
  category: string;
  amount: number;
  color?: string;
};

export default function DashboardPage() {
  const {
    budget,
    analytics,
    statistics,
    loading,
    errors,
    loadBudget,
    loadAnalytics,
    loadStatistics,
  } = useApp();

  const hasLoadedRef = useRef(false);

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .slice(0, 10);

  useEffect(() => {
    // Предотвращаем повторную загрузку при повторных рендерах
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    // Загружаем данные параллельно
    Promise.all([
      loadBudget(),
      loadAnalytics("day", monthStart, today),
      loadStatistics("month"),
    ]).catch((error) => {
      console.error("Ошибка загрузки данных на Dashboard:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Разрешаем показывать страницу, если хотя бы статистика загружена
  // Бюджет может загружаться дольше из-за расчета потраченной суммы
  const isLoadingCritical = loading.analytics && loading.statistics;
  const hasError = errors.budget || errors.analytics || (errors.statistics && !statistics);

  if (isLoadingCritical) {
    return (
      <section className="panel">
        <div className="panel__header-group">
          <p className="panel__eyebrow">Обзор</p>
          <h2 className="panel__title">Подготовка данных</h2>
        </div>
        <p className="panel__empty">Загрузка...</p>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="panel">
        <div className="panel__header-group">
          <p className="panel__eyebrow">Обзор</p>
          <h2 className="panel__title">Что-то пошло не так</h2>
        </div>
        <p className="form-error" role="status">
          {errors.budget || errors.analytics || errors.statistics}
        </p>
      </section>
    );
  }

  const budgetEmpty = budget && "empty" in budget;
  const categoryStats =
    statistics && Array.isArray(statistics.by_category)
      ? statistics.by_category.filter((c) => c.total_amount > 0)
      : [];
  const totalCategoryAmount = categoryStats.reduce(
    (sum, c) => sum + (c.total_amount || 0),
    0
  );

  return (
    <section className="panel panel--accent">
      <div className="panel__header-row">
        <div className="panel__header-group">
          <p className="panel__eyebrow">Обзор</p>
          <h2 className="panel__title">Финансовое состояние</h2>
        </div>
      </div>

      {loading.budget && (
        <p className="panel__empty" style={{ fontStyle: "italic", opacity: 0.7 }}>Загрузка бюджета...</p>
      )}

      {!loading.budget && budget && !("empty" in budget) && (
        <>
          <BudgetSummary
            spent={budget.spent}
            remaining={budget.remaining}
            percentage={budget.percentage}
          />
          <BudgetWarning percentage={budget.percentage} />
        </>
      )}

      {!loading.budget && budgetEmpty && (
        <p className="panel__empty">Бюджет на текущий месяц не задан</p>
      )}

      {(Array.isArray(analytics) && analytics.length > 0) && (
        <>
          <div style={{ marginTop: "2rem" }}>
            <p className="panel__title panel__title--small" style={{ marginBottom: "1rem" }}>Тренды расходов</p>
            <AnalyticsChart data={analytics} />
          </div>
        </>
      )}

      {categoryStats.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <p className="panel__title panel__title--small" style={{ marginBottom: "1rem" }}>
            Расходы по категориям
          </p>

          <div className="insight-grid">
            <div className="insight-card">
              <CategoryPieChart
                categories={categoryStats.map((c) => ({
                  category: c.category_name || "Без категории",
                  amount: c.total_amount,
                  color: c.category_color || "#94a3b8",
                }))}
              />
            </div>

            <div className="insight-card insight-card--list">
              <ul className="category-stats-list">
                {categoryStats.map((c, index) => {
                  const percentage =
                    totalCategoryAmount > 0
                      ? (c.total_amount / totalCategoryAmount) * 100
                      : 0;

                  return (
                    <li
                      key={`${c.category_name || "Без категории"}-${c.category_color || "no-color"}-${index}`}
                      className="category-stats-list__item"
                    >
                      <div className="category-stats-list__label">
                        <span
                          className="category-stats-list__dot"
                          style={{ background: c.category_color || "#94a3b8" }}
                        />
                        <span className="category-stats-list__name">
                          {c.category_name || "Без категории"}
                        </span>
                      </div>
                      <div className="category-stats-list__value">
                        <span>{c.total_amount.toLocaleString("ru-RU")} ₽</span>
                        <span className="category-stats-list__percent">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!loading.statistics && categoryStats.length === 0 && !errors.statistics && (
        <div style={{ marginTop: "2rem" }}>
          <p className="panel__empty">Нет расходов по категориям за этот период</p>
        </div>
      )}

      {!loading.statistics && errors.statistics && (
        <div style={{ marginTop: "2rem" }}>
          <p className="panel__empty" style={{ color: "#ef4444" }}>
            Ошибка загрузки статистики: {errors.statistics}
          </p>
        </div>
      )}
    </section>
  );
}
