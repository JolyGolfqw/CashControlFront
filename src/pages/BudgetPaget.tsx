import { useEffect, useState, FormEvent } from "react";
import BudgetSummary from "../components/BudgetSummary";
import BudgetWarning from "../components/BudgetWarning";
import { createBudget, updateBudget, deleteBudget } from "../api/budget";
import { useApp } from "../context/AppContext";

export default function BudgetPage() {
  const { budget, loading, errors, loadBudget, invalidateBudget } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  useEffect(() => {
    if (budget && !("empty" in budget)) {
      setAmount(budget.budget.amount.toString());
      setMonth(budget.budget.month);
      setYear(budget.budget.year);
    }
  }, [budget]);

  const empty = budget && "empty" in budget;
  const data = budget && !("empty" in budget) ? budget : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      if (data?.budget.ID) {
        await updateBudget(data.budget.ID, {
          amount: parseFloat(amount),
          month,
          year,
        });
      } else {
        await createBudget({
          amount: parseFloat(amount),
          month,
          year,
        });
      }
      setIsEditing(false);
      // Инвалидируем кеш и перезагружаем данные
      invalidateBudget();
      // Ждем загрузки новых данных перед сбросом saving
      await loadBudget(true);
    } catch (err: any) {
      alert(err?.message || "Ошибка сохранения бюджета");
      // При ошибке также перезагружаем данные
      invalidateBudget();
      loadBudget(true).catch(() => {});
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!data?.budget.ID) return;
    if (!confirm("Удалить бюджет?")) return;
    try {
      await deleteBudget(data.budget.ID);
      invalidateBudget();
      await loadBudget(true);
    } catch (err: any) {
      alert(err?.message || "Ошибка удаления бюджета");
    }
  }

  return (
    <section className="panel">
      <div className="panel__header-row">
        <div className="panel__header-group">
          <p className="panel__eyebrow">Бюджет</p>
          <h2 className="panel__title">
            {data
              ? `Бюджет за ${data.budget.month}.${data.budget.year}`
              : "Бюджет на месяц"}
          </h2>
        </div>
        <div className="panel__header-actions">
          {!isEditing && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setIsEditing(true)}
            >
              {empty ? "Создать" : "Изменить"}
            </button>
          )}
        </div>
      </div>

      {loading.budget && <p className="panel__empty">Загрузка...</p>}

      {!loading.budget && errors.budget && (
        <p className="form-error">{errors.budget}</p>
      )}

      {!loading.budget && !errors.budget && empty && !isEditing && (
        <p className="panel__empty">Бюджет на текущий месяц не задан</p>
      )}

      {isEditing && (
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Сумма</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span>Месяц</span>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString("ru-RU", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Год</span>
            <input
              type="number"
              min="2020"
              max="2100"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setIsEditing(false);
                if (data) {
                  setAmount(data.budget.amount.toString());
                  setMonth(data.budget.month);
                  setYear(data.budget.year);
                }
              }}
            >
              Отмена
            </button>
            {data?.budget.ID && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleDelete}
                style={{ color: "#ef4444" }}
              >
                Удалить
              </button>
            )}
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </form>
      )}

      {!empty && !isEditing && data && (
        <>
          <BudgetSummary
            spent={data.spent}
            remaining={data.remaining}
            percentage={data.percentage}
          />
          <BudgetWarning percentage={data.percentage} />
        </>
      )}
    </section>
  );
}
