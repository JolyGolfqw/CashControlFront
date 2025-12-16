import { useEffect, useState, useMemo } from "react";
import { deleteExpense, type Expense } from "../api/expense";
import { useApp } from "../context/AppContext";

type Props = {
  onAdd: () => void;
  onEdit?: (expense: any) => void;
};

type PeriodFilter = "all" | "today" | "week" | "month" | "year";

const ITEMS_PER_PAGE = 20;

export default function ExpensesPage({ onAdd, onEdit }: Props) {
  const { expenses, loading, errors, loadExpenses, removeExpense } = useApp();
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  async function handleDelete(id: number) {
    if (!confirm("Удалить этот расход?")) return;
    
    // Оптимистичное обновление - сразу удаляем из UI
    removeExpense(id);
    
    try {
      await deleteExpense(id);
      // Кеш уже обновлен в removeExpense, ничего не делаем
    } catch (err: any) {
      // Если ошибка - возвращаем данные через перезагрузку
      alert(err?.message || "Ошибка удаления");
      loadExpenses(true);
    }
  }

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Сбрасываем страницу при изменении фильтра
  useEffect(() => {
    setCurrentPage(1);
  }, [periodFilter, sortOrder]);

  const getExpenseId = (expense: Expense) => {
    if ('ID' in expense && expense.ID) return expense.ID;
    if ('id' in expense && expense.id) return expense.id;
    return 0;
  };

  // Получаем даты для фильтра по периоду
  const getPeriodDates = (period: PeriodFilter): { start: Date | null; end: Date | null } => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Конец текущего дня
    
    switch (period) {
      case "today": {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
      }
      case "week": {
        const start = new Date(now);
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Понедельник
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
      }
      case "month": {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
      }
      case "year": {
        const start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
      }
      default:
        return { start: null, end: null };
    }
  };

  // Фильтруем и сортируем расходы
  const filteredAndSortedExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    
    // Фильтруем по периоду
    let filtered = [...expenses];
    if (periodFilter !== "all") {
      const { start, end } = getPeriodDates(periodFilter);
      if (start && end) {
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= start && expenseDate <= end;
        });
      }
    }
    
    // Сортируем по дате (поле date), а при равенстве - по CreatedAt
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      let timeA = dateA.getTime();
      let timeB = dateB.getTime();
      
      // Если даты равны (что часто бывает, так как все в 00:00:00Z),
      // используем CreatedAt для дополнительной сортировки
      if (timeA === timeB) {
        const createdAtA = (a as any).CreatedAt ? new Date((a as any).CreatedAt).getTime() : 0;
        const createdAtB = (b as any).CreatedAt ? new Date((b as any).CreatedAt).getTime() : 0;
        
        if (createdAtA && createdAtB) {
          timeA = createdAtA;
          timeB = createdAtB;
        } else {
          // Если CreatedAt нет, используем ID
          const idA = (a.ID || a.id || 0) as number;
          const idB = (b.ID || b.id || 0) as number;
          timeA = idA;
          timeB = idB;
        }
      }
      
      // Новые сверху: более поздняя дата идет первым
      // Старые сверху: более ранняя дата идет первым
      if (sortOrder === "newest") {
        return timeB - timeA; // Убывание: новые сверху
      } else {
        return timeA - timeB; // Возрастание: старые сверху
      }
    });
    
    return filtered;
  }, [expenses, sortOrder, periodFilter]);

  // Пагинация
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExpenses = filteredAndSortedExpenses.slice(startIndex, endIndex);

  return (
    <section className="panel">
      <div className="panel__header-row">
        <div className="panel__header-group">
          <p className="panel__eyebrow">Расходы</p>
          <h2 className="panel__title">Мои расходы</h2>
        </div>
        <div className="panel__header-actions">
          <button type="button" className="btn btn--primary" onClick={onAdd}>
            + Добавить
          </button>
        </div>
      </div>

      {/* Фильтры и сортировка */}
      <div className="filters-bar">
        <label className="form-field filters-bar__field">
          <span>Период</span>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
          >
            <option value="all">Все</option>
            <option value="today">Сегодня</option>
            <option value="week">Эта неделя</option>
            <option value="month">Этот месяц</option>
            <option value="year">Этот год</option>
          </select>
        </label>
        
        <label className="form-field filters-bar__field">
          <span>Сортировка</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
          >
            <option value="newest">Новые сверху</option>
            <option value="oldest">Старые сверху</option>
          </select>
        </label>

        {filteredAndSortedExpenses.length > 0 && (
          <div className="filters-bar__meta">
            <span>
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedExpenses.length)} из {filteredAndSortedExpenses.length}
            </span>
          </div>
        )}
      </div>

      {loading.expenses && <p className="panel__empty">Загрузка...</p>}

      {!loading.expenses && errors.expenses && (
        <p className="form-error" role="status">
          {errors.expenses}
        </p>
      )}

      {!loading.expenses && !errors.expenses && expenses.length === 0 && (
        <p className="panel__empty">Расходов пока нет</p>
      )}

      {!loading.expenses && !errors.expenses && expenses.length > 0 && filteredAndSortedExpenses.length === 0 && (
        <p className="panel__empty">Нет расходов за выбранный период</p>
      )}

      {!loading.expenses && !errors.expenses && paginatedExpenses.length > 0 && (
        <>
          {/* Отступ снизу для фиксированной пагинации */}
          <ul className="list list--expenses" style={{ paddingBottom: totalPages > 1 ? "80px" : "0" }}>
            {paginatedExpenses.map((expense) => {
            const expenseId = getExpenseId(expense);
            return (
              <li key={expenseId} className="expense-card">
                <div>
              <div>
                <div className="expense-card__amount">
                  {expense.amount.toLocaleString("ru-RU", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  ₽
                </div>
                <div className="expense-card__category">
                      {expense.category?.name || "Без категории"}
                </div>
              </div>
                  <div className="expense-card__meta">
                    <span>
                      {new Date(expense.date).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      {(expense as any).CreatedAt && (
                        <>{" "}{new Date((expense as any).CreatedAt).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}</>
                      )}
                    </span>
                    {expense.description && (
                      <span>
                        {expense.description}
                      </span>
                    )}
                  </div>
                </div>
                {(onEdit || true) && (
                  <div className="expense-card__actions">
                    {onEdit && (
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => onEdit(expense)}
                        style={{ 
                          fontSize: "0.875rem", 
                          padding: "0.625rem 0.875rem",
                          minWidth: "auto"
                        }}
                        title="Изменить"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => handleDelete(expenseId)}
                      style={{ 
                        fontSize: "0.875rem", 
                        padding: "0.625rem 0.875rem",
                        color: "#ef4444",
                        minWidth: "auto"
                      }}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </li>
            );
            })}
          </ul>
        </>
      )}

      {/* Пагинация - фиксированная внизу экрана */}
      {!loading.expenses && !errors.expenses && totalPages > 1 && (
        <div className="pagination pagination--floating">
          <button
            type="button"
            className="pagination__btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </button>

          <div className="pagination__pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`pagination__page ${currentPage === pageNum ? "is-active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="pagination__btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед →
          </button>
        </div>
      )}
    </section>
  );
}
