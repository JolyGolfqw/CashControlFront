import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchExpenses, type Expense } from '../api/expense';
import { fetchCategories, type Category } from '../api/categories';
import { fetchCurrentBudget, type CurrentBudgetResponse } from '../api/budget';
import { fetchAnalytics, type AnalyticsPoint } from '../api/analytics';
import { fetchStatistics, type StatisticsResponse } from '../api/statistics';
import {
  fetchRecurringExpenses,
  type RecurringExpense,
} from '../api/recurring-expense';

type AppState = {
  expenses: Expense[];
  categories: Category[];
  budget: CurrentBudgetResponse | null;
  analytics: AnalyticsPoint[];
  statistics: StatisticsResponse | null;
  recurringExpenses: RecurringExpense[];
  
  // Loading states
  loading: {
    expenses: boolean;
    categories: boolean;
    budget: boolean;
    analytics: boolean;
    statistics: boolean;
    recurring: boolean;
  };
  
  // Error states
  errors: {
    expenses: string | null;
    categories: string | null;
    budget: string | null;
    analytics: string | null;
    statistics: string | null;
    recurring: string | null;
  };
  
  // Cache timestamps
  cache: {
    expenses: number | null;
    categories: number | null;
    budget: number | null;
    analytics: number | null;
    statistics: number | null;
    recurring: number | null;
  };
};

type AppContextType = AppState & {
  // Actions
  loadExpenses: (force?: boolean) => Promise<void>;
  loadCategories: (force?: boolean) => Promise<void>;
  loadBudget: (force?: boolean) => Promise<void>;
  loadAnalytics: (period: "day" | "week" | "month", start: string, end: string, force?: boolean) => Promise<void>;
  loadStatistics: (period: "day" | "week" | "month" | "year", force?: boolean) => Promise<void>;
  loadRecurringExpenses: (force?: boolean) => Promise<void>;
  
  // Optimistic updates
  addExpense: (expense: Expense) => void;
  removeExpense: (id: number) => void;
  updateExpense: (id: number, expense: Partial<Expense>) => void;
  addCategory: (category: Category) => void;
  removeCategory: (id: number) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  addRecurringExpense: (item: RecurringExpense) => void;
  removeRecurringExpense: (id: number) => void;
  updateRecurringExpense: (id: number, item: Partial<RecurringExpense>) => void;
  
  // Invalidate cache
  invalidateExpenses: () => void;
  invalidateCategories: () => void;
  invalidateBudget: () => void;
  invalidateAnalytics: () => void;
  invalidateStatistics: () => void;
  invalidateRecurring: () => void;
  
  // Clear all
  clearAll: () => void;
};

const CACHE_DURATION = 30 * 1000; // 30 seconds

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    expenses: [],
    categories: [],
    budget: null,
    analytics: [],
    statistics: null,
    recurringExpenses: [],
    loading: {
      expenses: false,
      categories: false,
      budget: false,
      analytics: false,
      statistics: false,
      recurring: false,
    },
    errors: {
      expenses: null,
      categories: null,
      budget: null,
      analytics: null,
      statistics: null,
      recurring: null,
    },
    cache: {
      expenses: null,
      categories: null,
      budget: null,
      analytics: null,
      statistics: null,
      recurring: null,
    },
  });

  const isCacheValid = useCallback((timestamp: number | null, force: boolean): boolean => {
    if (force) return false;
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  const loadExpenses = useCallback(async (force = false) => {
    // Если force = true, сразу загружаем
    if (force) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, expenses: true },
        errors: { ...prev.errors, expenses: null },
      }));
    } else {
      // Проверяем кеш только если не форсируем загрузку
      let shouldLoad = false;
      setState(prev => {
        if (isCacheValid(prev.cache.expenses, force)) {
          shouldLoad = false;
          return prev;
        }
        shouldLoad = true;
        return {
          ...prev,
          loading: { ...prev.loading, expenses: true },
          errors: { ...prev.errors, expenses: null },
        };
      });

      if (!shouldLoad) return;
    }

    try {
      const data = await fetchExpenses();
      setState(prev => ({
        ...prev,
        expenses: data, // Не сортируем здесь - сортировка в UI
        loading: { ...prev.loading, expenses: false },
        cache: { ...prev.cache, expenses: Date.now() },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, expenses: false },
        errors: { ...prev.errors, expenses: error?.message || 'Ошибка загрузки расходов' },
      }));
    }
  }, [isCacheValid]);

  const loadCategories = useCallback(async (force = false) => {
    let shouldLoad = false;
    setState(prev => {
      if (isCacheValid(prev.cache.categories, force)) {
        shouldLoad = false;
        return prev;
      }
      shouldLoad = true;
      return {
        ...prev,
        loading: { ...prev.loading, categories: true },
        errors: { ...prev.errors, categories: null },
      };
    });

    if (!shouldLoad) return;

    try {
      const data = await fetchCategories();
      setState(prev => ({
        ...prev,
        categories: data,
        loading: { ...prev.loading, categories: false },
        cache: { ...prev.cache, categories: Date.now() },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, categories: false },
        errors: { ...prev.errors, categories: error?.message || 'Ошибка загрузки категорий' },
      }));
    }
  }, [isCacheValid]);

  const loadBudget = useCallback(async (force = false) => {
    // Проверяем кеш синхронно ДО установки loading
    let shouldSkip = false;
    setState(prev => {
      if (!force && isCacheValid(prev.cache.budget, force)) {
        shouldSkip = true;
        // Сбрасываем loading, если он был установлен ранее
        return {
          ...prev,
          loading: { ...prev.loading, budget: false },
        };
      }
      return {
        ...prev,
        loading: { ...prev.loading, budget: true },
        errors: { ...prev.errors, budget: null },
      };
    });

    if (shouldSkip) {
      return;
    }

    try {
      const data = await fetchCurrentBudget();
      setState(prev => ({
        ...prev,
        budget: data,
        loading: { ...prev.loading, budget: false },
        cache: { ...prev.cache, budget: Date.now() },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, budget: false },
        errors: { ...prev.errors, budget: error?.message || 'Ошибка загрузки бюджета' },
      }));
    }
  }, [isCacheValid]);

  const loadAnalytics = useCallback(async (
    period: "day" | "week" | "month",
    start: string,
    end: string,
    force = false
  ) => {
    // Проверяем кеш используя функциональное обновление
    let shouldSkip = false;
    setState(prev => {
      if (!force && isCacheValid(prev.cache.analytics, force)) {
        shouldSkip = true;
        return prev;
      }
      return {
        ...prev,
        loading: { ...prev.loading, analytics: true },
        errors: { ...prev.errors, analytics: null },
      };
    });
    
    if (shouldSkip) {
      return;
    }

    try {
      const data = await fetchAnalytics({ period, start, end });
      setState(prev => ({
        ...prev,
        analytics: data,
        loading: { ...prev.loading, analytics: false },
        cache: { ...prev.cache, analytics: Date.now() },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, analytics: false },
        errors: { ...prev.errors, analytics: error?.message || 'Ошибка загрузки аналитики' },
      }));
    }
  }, [isCacheValid]);

  const loadStatistics = useCallback(async (
    period: "day" | "week" | "month" | "year",
    force = false
  ) => {
    // Проверяем кеш используя функциональное обновление
    let shouldSkip = false;
    setState(prev => {
      if (!force && isCacheValid(prev.cache.statistics, force)) {
        shouldSkip = true;
        return prev;
      }
      return {
        ...prev,
        loading: { ...prev.loading, statistics: true },
        errors: { ...prev.errors, statistics: null },
      };
    });
    
    if (shouldSkip) {
      return;
    }

    try {
      const data = await fetchStatistics(period);
      setState(prev => ({
        ...prev,
        statistics: data,
        loading: { ...prev.loading, statistics: false },
        cache: { ...prev.cache, statistics: Date.now() },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, statistics: false },
        errors: { ...prev.errors, statistics: error?.message || 'Ошибка загрузки статистики' },
      }));
    }
  }, [isCacheValid]);

  const loadRecurringExpenses = useCallback(async (force = false) => {
    let shouldLoad = false;
    setState(prev => {
      if (isCacheValid(prev.cache.recurring, force)) {
        return prev;
      }
      shouldLoad = true;
      return {
        ...prev,
        loading: { ...prev.loading, recurring: true },
        errors: { ...prev.errors, recurring: null },
      };
    });

    if (!shouldLoad) return;

    try {
      const data = await fetchRecurringExpenses();
      setState(prev => ({
        ...prev,
        recurringExpenses: data,
        loading: { ...prev.loading, recurring: false },
        cache: { ...prev.cache, recurring: Date.now() },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, recurring: false },
        errors: { ...prev.errors, recurring: error?.message || 'Ошибка загрузки регулярных расходов' },
      }));
    }
  }, [isCacheValid]);

  const invalidateExpenses = useCallback(() => {
    setState(prev => ({
      ...prev,
      cache: { ...prev.cache, expenses: null },
    }));
  }, []);

  const invalidateCategories = useCallback(() => {
    setState(prev => ({
      ...prev,
      cache: { ...prev.cache, categories: null },
    }));
  }, []);

  const invalidateBudget = useCallback(() => {
    setState(prev => ({
      ...prev,
      cache: { ...prev.cache, budget: null },
    }));
  }, []);

  const invalidateAnalytics = useCallback(() => {
    setState(prev => ({
      ...prev,
      cache: { ...prev.cache, analytics: null },
    }));
  }, []);

  const invalidateStatistics = useCallback(() => {
    setState(prev => ({
      ...prev,
      cache: { ...prev.cache, statistics: null },
    }));
  }, []);

  const invalidateRecurring = useCallback(() => {
    setState(prev => ({
      ...prev,
      cache: { ...prev.cache, recurring: null },
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      expenses: [],
      categories: [],
      budget: null,
      analytics: [],
      statistics: null,
      recurringExpenses: [],
      cache: {
        expenses: null,
        categories: null,
        budget: null,
        analytics: null,
        statistics: null,
        recurring: null,
      },
    }));
  }, []);

  // Optimistic updates for expenses
  const addExpense = useCallback((expense: Expense) => {
    setState(prev => {
      // ВСЕГДА находим категорию по category_id из загруженных категорий
      let expenseWithCategory = expense;
      if (expense.category_id) {
        const category = prev.categories.find(
          cat => cat.ID === expense.category_id
        );
        if (category) {
          expenseWithCategory = {
            ...expense,
            category: {
              ID: category.ID,
              name: category.name,
              color: category.color,
              icon: category.icon,
            },
          };
        }
      }

      // Добавляем новый расход в начало массива
      // Сортировка будет применена в UI компоненте
      return {
        ...prev,
        expenses: [expenseWithCategory, ...prev.expenses],
        // Обновляем кеш, чтобы он оставался валидным после добавления
        cache: { ...prev.cache, expenses: Date.now() },
        // Сбрасываем loading, чтобы не было загрузки после добавления
        loading: { ...prev.loading, expenses: false },
      };
    });
  }, []);

  const removeExpense = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.filter(exp => {
        const expId = 'ID' in exp ? exp.ID : exp.id;
        return expId !== id;
      }),
      // Обновляем кеш, чтобы он оставался валидным после удаления
      cache: { ...prev.cache, expenses: Date.now() },
      // Сбрасываем loading, чтобы не было загрузки после удаления
      loading: { ...prev.loading, expenses: false },
    }));
  }, []);

  const updateExpense = useCallback((id: number, updated: Partial<Expense>) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp => {
        const expId = 'ID' in exp ? exp.ID : exp.id;
        if (expId === id) {
          return { ...exp, ...updated };
        }
        return exp;
      }),
      // Обновляем кеш, чтобы он оставался валидным после обновления
      cache: { ...prev.cache, expenses: Date.now() },
      // Сбрасываем loading, чтобы не было загрузки после обновления
      loading: { ...prev.loading, expenses: false },
    }));
  }, []);

  // Optimistic updates for categories
  const addCategory = useCallback((category: Category) => {
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, category],
    }));
  }, []);

  const removeCategory = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.ID !== id),
    }));
  }, []);

  const updateCategoryState = useCallback((id: number, updated: Partial<Category>) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.ID === id ? { ...cat, ...updated } : cat
      ),
    }));
  }, []);

  const addRecurringExpense = useCallback((item: RecurringExpense) => {
    setState(prev => {
      const category = prev.categories.find(cat => cat.ID === item.category_id);
      const withCategory = category
        ? { ...item, category: { ID: category.ID, name: category.name, color: category.color, icon: category.icon } }
        : item;
      return {
        ...prev,
        recurringExpenses: [withCategory, ...prev.recurringExpenses],
      };
    });
  }, []);

  const removeRecurringExpense = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.filter(item => item.ID !== id),
    }));
  }, []);

  const updateRecurringExpense = useCallback((id: number, updated: Partial<RecurringExpense>) => {
    setState(prev => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.map(item => {
        if (item.ID !== id) return item;
        const merged = { ...item, ...updated };
        if (merged.category_id) {
          const category = prev.categories.find(cat => cat.ID === merged.category_id);
          if (category) {
            merged.category = { ID: category.ID, name: category.name, color: category.color, icon: category.icon };
          }
        }
        return merged;
      }),
    }));
  }, []);

  const value: AppContextType = {
    ...state,
    loadExpenses,
    loadCategories,
    loadBudget,
    loadAnalytics,
    loadStatistics,
    loadRecurringExpenses,
    addExpense,
    removeExpense,
    updateExpense,
    addCategory,
    removeCategory,
    updateCategory: updateCategoryState,
    addRecurringExpense,
    removeRecurringExpense,
    updateRecurringExpense,
    invalidateExpenses,
    invalidateCategories,
    invalidateBudget,
    invalidateAnalytics,
    invalidateStatistics,
    invalidateRecurring,
    clearAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

