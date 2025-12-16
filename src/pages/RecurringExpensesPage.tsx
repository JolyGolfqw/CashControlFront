import { useEffect, useState, type FormEvent } from "react";
import {
  createRecurringExpense,
  updateRecurringExpense as apiUpdateRecurringExpense,
  deleteRecurringExpense,
  activateRecurringExpense,
  deactivateRecurringExpense,
  type RecurringExpenseType,
} from "../api/recurring-expense";
import { useApp } from "../context/AppContext";

type FormState = {
  category_id: number | "";
  amount: string;
  description: string;
  type: RecurringExpenseType;
  day_of_month?: number;
  day_of_week?: number;
};

const DEFAULT_FORM: FormState = {
  category_id: "",
  amount: "",
  description: "",
  type: "monthly",
  day_of_month: 1,
  day_of_week: 1,
};

function typeLabel(type: RecurringExpenseType) {
  switch (type) {
    case "daily":
      return "Каждый день";
    case "weekly":
      return "Раз в неделю";
    case "monthly":
      return "Раз в месяц";
    case "yearly":
      return "Раз в год";
  }
}

function scheduleLabel(type: RecurringExpenseType, day_of_week?: number, day_of_month?: number) {
  if (type === "weekly" && day_of_week) {
    const weekday = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][Math.min(Math.max(day_of_week - 1, 0), 6)];
    return `Каждую ${weekday}`;
  }
  if (type === "monthly" && day_of_month) {
    return `Каждое ${day_of_month} число`;
  }
  if (type === "yearly" && day_of_month) {
    return `Ежегодно, день ${day_of_month}`;
  }
  return "По расписанию";
}

export default function RecurringExpensesPage() {
  const {
    categories,
    recurringExpenses,
    loading,
    errors,
    loadCategories,
    loadRecurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    removeRecurringExpense,
    invalidateRecurring,
  } = useApp();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
    loadRecurringExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.category_id) return;

    setSaving(true);
    try {
      if (editingId) {
        const updated = await apiUpdateRecurringExpense(editingId, {
          category_id: Number(form.category_id),
          amount: parseFloat(form.amount),
          description: form.description,
          type: form.type,
          day_of_month: form.type === "monthly" || form.type === "yearly" ? form.day_of_month : undefined,
          day_of_week: form.type === "weekly" ? form.day_of_week : undefined,
        });
        updateRecurringExpense(editingId, updated);
      } else {
        const created = await createRecurringExpense({
          category_id: Number(form.category_id),
          amount: parseFloat(form.amount),
          description: form.description,
          type: form.type,
          day_of_month: form.type === "monthly" || form.type === "yearly" ? form.day_of_month : undefined,
          day_of_week: form.type === "weekly" ? form.day_of_week : undefined,
        });
        addRecurringExpense(created);
      }
      setForm(DEFAULT_FORM);
      setEditingId(null);
      invalidateRecurring();
      loadRecurringExpenses(true);
    } catch (err: any) {
      alert(err?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить повторяющийся расход?")) return;
    setBusyId(id);
    try {
      removeRecurringExpense(id);
      await deleteRecurringExpense(id);
      invalidateRecurring();
      loadRecurringExpenses(true);
    } catch (err: any) {
      alert(err?.message || "Ошибка удаления");
      loadRecurringExpenses(true);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    setBusyId(id);
    try {
      const updated = isActive
        ? await deactivateRecurringExpense(id)
        : await activateRecurringExpense(id);
      updateRecurringExpense(id, updated);
      invalidateRecurring();
      loadRecurringExpenses(true);
    } catch (err: any) {
      alert(err?.message || "Не удалось обновить статус");
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (id: number) => {
    const item = recurringExpenses.find((r) => r.ID === id);
    if (!item) return;
    setEditingId(id);
    setForm({
      category_id: item.category_id,
      amount: item.amount.toString(),
      description: item.description || "",
      type: item.type,
      day_of_month: item.day_of_month,
      day_of_week: item.day_of_week,
    });
  };

  return (
    <section className="panel">
      <div className="panel__header-row">
        <div className="panel__header-group">
          <p className="panel__eyebrow">Регулярные расходы</p>
          <h2 className="panel__title">Автоматические списания</h2>
        </div>
        <div className="panel__header-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => loadRecurringExpenses(true)}
            disabled={loading.recurring}
          >
            Обновить
          </button>
        </div>
      </div>

      {errors.recurring && <p className="form-error">{errors.recurring}</p>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Категория</span>
          <select
            required
            value={form.category_id}
            onChange={(e) => setForm((prev) => ({ ...prev, category_id: Number(e.target.value) }))}
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat.ID} value={cat.ID}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Сумма</span>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="Например, 1200"
          />
        </label>

        <label className="form-field">
          <span>Описание</span>
          <input
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Например, подписка"
          />
        </label>

        <label className="form-field">
          <span>Тип</span>
          <select
            value={form.type}
            onChange={(e) => {
              const type = e.target.value as RecurringExpenseType;
              setForm((prev) => ({
                ...prev,
                type,
                day_of_week: type === "weekly" ? prev.day_of_week ?? 1 : undefined,
                day_of_month: type === "monthly" || type === "yearly" ? prev.day_of_month ?? 1 : undefined,
              }));
            }}
          >
            <option value="daily">Каждый день</option>
            <option value="weekly">Раз в неделю</option>
            <option value="monthly">Раз в месяц</option>
            <option value="yearly">Раз в год</option>
          </select>
        </label>

        {(form.type === "monthly" || form.type === "yearly") && (
          <label className="form-field">
            <span>День месяца</span>
            <input
              type="number"
              min="1"
              max="28"
              value={form.day_of_month ?? 1}
              onChange={(e) => setForm((prev) => ({ ...prev, day_of_month: Number(e.target.value) }))}
            />
          </label>
        )}

        {form.type === "weekly" && (
          <label className="form-field">
            <span>День недели</span>
            <select
              value={form.day_of_week ?? 1}
              onChange={(e) => setForm((prev) => ({ ...prev, day_of_week: Number(e.target.value) }))}
            >
              <option value={1}>Понедельник</option>
              <option value={2}>Вторник</option>
              <option value={3}>Среда</option>
              <option value={4}>Четверг</option>
              <option value={5}>Пятница</option>
              <option value={6}>Суббота</option>
              <option value={7}>Воскресенье</option>
            </select>
          </label>
        )}

        <div className="form-actions">
          {editingId && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setEditingId(null);
                setForm(DEFAULT_FORM);
              }}
            >
              Отмена
            </button>
          )}
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Сохраняем..." : editingId ? "Сохранить изменения" : "Добавить"}
          </button>
        </div>
      </form>

      {loading.recurring && <p className="panel__empty">Загрузка регулярных расходов...</p>}

      {!loading.recurring && recurringExpenses.length === 0 && (
        <p className="panel__empty">Регулярных расходов пока нет</p>
      )}

      {recurringExpenses.length > 0 && (
        <ul className="list" style={{ marginTop: "1rem" }}>
          {recurringExpenses.map((item) => (
            <li key={item.ID} className="category-row">
              <div className="category-row__badge">
                <span
                  className="category-row__color"
                  style={{ background: item.category?.color || "#94a3b8" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <strong>{item.category?.icon} {item.category?.name || "Без категории"}</strong>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                    {item.amount.toLocaleString("ru-RU")} ₽ • {typeLabel(item.type)}
                  </span>
                  <span style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>
                    {scheduleLabel(item.type, item.day_of_week, item.day_of_month)}
                    {item.next_date ? ` • След.: ${new Date(item.next_date).toLocaleDateString("ru-RU")}` : ""}
                  </span>
                </div>
              </div>

              <div className="category-row__actions" style={{ gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => handleToggle(item.ID, item.is_active)}
                  disabled={busyId === item.ID}
                  style={{ fontSize: "0.85rem" }}
                >
                  {item.is_active ? "Пауза" : "Включить"}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => startEdit(item.ID)}
                  style={{ fontSize: "0.85rem" }}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => handleDelete(item.ID)}
                  disabled={busyId === item.ID}
                  style={{ fontSize: "0.85rem", color: "#ef4444" }}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

