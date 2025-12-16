import { FormEvent, useEffect, useState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";
import { useApp } from "../context/AppContext";
import { debug } from "../debug";

type Props = {
  onChange: (cats: string[]) => void;
};

export default function CategoriesPage({ onChange }: Props) {
  const { 
    categories, 
    loading, 
    loadCategories, 
    addCategory, 
    removeCategory: removeCategoryState,
    updateCategory: updateCategoryState,
    invalidateCategories
  } = useApp();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const names = categories.map((c) => ({
      id: c.ID,
      name: c.name,
      icon: c.icon,
      color: c.color,
    }));

    debug("PARSED categories", names);
    localStorage.setItem("categories", JSON.stringify(names));
    onChange(names.map((c) => `${c.icon ?? ""} ${c.name} (${c.id})`));
  }, [categories, onChange]);

  function startEdit(category: Category) {
    setEditingId(category.ID);
    setName(category.name);
    setColor(category.color || "#3B82F6");
    setIcon(category.icon || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setColor("#3B82F6");
    setIcon("");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        // Оптимистичное обновление - сразу обновляем в UI
        updateCategoryState(editingId, { name, color, icon });
        const updated = await updateCategory(editingId, { name, color, icon });
        // Обновляем реальными данными с сервера (на случай если сервер вернул другие данные)
        updateCategoryState(editingId, updated);
        cancelEdit();
        // Инвалидируем кеш для следующей загрузки
        invalidateCategories();
      } else {
        const newCategory = await createCategory({ name, color, icon });
        // Оптимистичное обновление - сразу добавляем в UI
        addCategory(newCategory);
        setName("");
        setIcon("");
        // Инвалидируем кеш для следующей загрузки
        invalidateCategories();
      }
    } catch (err: any) {
      alert(err?.message || "Ошибка сохранения");
      // При ошибке перезагружаем данные
      loadCategories(true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить категорию?")) return;
    
    // Оптимистичное обновление - сразу удаляем из UI
    removeCategoryState(id);
    
    try {
      await deleteCategory(id);
      // Инвалидируем кеш для следующей загрузки
      invalidateCategories();
    } catch (err: any) {
      alert(err?.message || "Ошибка удаления");
      // При ошибке возвращаем данные через перезагрузку
      loadCategories(true);
    }
  }

  return (
    <section className="panel">
      <div className="panel__header-group">
        <p className="panel__eyebrow">Категории</p>
        <h2 className="panel__title">Категории расходов</h2>
      </div>

      <form className="form-grid" onSubmit={submit}>
        <label className="form-field">
          <span>Название</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Питание"
            required
          />
        </label>

        <label className="form-field">
          <span>Цвет</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Иконка</span>
          <input
            placeholder="🍔"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </label>

        <div className="form-actions">
          {editingId && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={cancelEdit}
            >
              Отмена
            </button>
          )}
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving
              ? "Сохраняем..."
              : editingId
              ? "Сохранить изменения"
              : "Добавить категорию"}
          </button>
        </div>
      </form>

      {categories.length === 0 ? (
        <p className="panel__empty">Категорий пока нет</p>
      ) : (
        <ul className="list list--categories">
          {categories.map((cat) => (
            <li key={cat.ID} className="category-row">
              <div className="category-row__badge">
                <span
                  className="category-row__color"
                  style={{ background: cat.color }}
                />
                <span>
                  {cat.icon} {cat.name}
                </span>
              </div>
              <div className="category-row__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => startEdit(cat)}
                  style={{ fontSize: "0.875rem", padding: "0.5rem 0.75rem" }}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => remove(cat.ID)}
                  style={{ fontSize: "0.875rem", padding: "0.5rem 0.75rem", color: "#ef4444" }}
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
