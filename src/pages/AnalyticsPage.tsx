import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import AnalyticsChart from "../components/AnalyticsChart";

export default function AnalyticsPage() {
  const { analytics, loading, errors, loadAnalytics } = useApp();
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);

  useEffect(() => {
    loadAnalytics(period, monthAgo, today);
  }, [period, monthAgo, today, loadAnalytics]);

  return (
    <section className="panel">
      <div className="panel__header-row">
        <div className="panel__header-group">
          <p className="panel__eyebrow">Аналитика</p>
          <h2 className="panel__title">Тренды расходов</h2>
        </div>
        <div className="panel__controls">
          <label className="form-field">
            <span>Период</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "day" | "week" | "month")}
            >
              <option value="day">По дням</option>
              <option value="week">По неделям</option>
              <option value="month">По месяцам</option>
            </select>
          </label>
        </div>
      </div>

      {loading.analytics && <p className="panel__empty">Загрузка...</p>}

      {!loading.analytics && errors.analytics && (
        <p className="form-error">{errors.analytics}</p>
      )}

      {!loading.analytics && !errors.analytics && analytics.length === 0 && (
        <p className="panel__empty">Нет данных</p>
      )}

      {!loading.analytics && !errors.analytics && analytics.length > 0 && (
        <AnalyticsChart data={analytics} />
      )}
    </section>
  );
}
