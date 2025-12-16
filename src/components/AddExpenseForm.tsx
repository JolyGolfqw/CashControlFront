import { type FormEvent, useState } from "react";
import { createExpense } from "../api/expense";
import { useApp } from "../context/AppContext";

type Props = {
  onCreated: () => void;
};

export default function AddExpenseForm({ onCreated }: Props) {
  const { categories, addExpense, loadExpenses } = useApp();
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!categoryId) {
      setError("Выберите категорию");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const newExpense = await createExpense({
        category_id: Number(categoryId),
        amount: Number(amount),
        description,
        date: new Date(date).toISOString(),
      });

      // addExpense сам найдет категорию по category_id из уже загруженных категорий
      addExpense(newExpense);

      localStorage.setItem("category", categoryId);
      setAmount("");
      setDescription("");
      setCategoryId("");
      
      // НЕ инвалидируем кеш - данные уже в state, они актуальны
      // Кеш обновим при следующей обычной загрузке
      
      // Закрываем форму сразу
      onCreated();
    } catch (err: any) {
      setError(err?.message ?? "Ошибка сохранения");
      // При ошибке перезагружаем для синхронизации
      loadExpenses(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="form-field">
        <span>Категория</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Выберите категорию</option>
          {categories.map((c) => (
            <option key={c.ID} value={c.ID}>
              {c.icon} {c.name}
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
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      <label className="form-field">
        <span>Дата</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <label className="form-field">
        <span>Описание</span>
        <input
          type="text"
          placeholder="Например, поход в кафе"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {error && (
        <p className="form-error" role="status">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Сохраняем..." : "Сохранить расход"}
        </button>
      </div>
    </form>
  );
}
