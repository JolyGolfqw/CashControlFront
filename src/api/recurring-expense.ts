export type RecurringExpenseType = "daily" | "weekly" | "monthly" | "yearly";

export type RecurringExpense = {
  ID: number;
  user_id: number;
  category_id: number;
  amount: number;
  description: string;
  type: RecurringExpenseType;
  day_of_month?: number;
  day_of_week?: number;
  is_active: boolean;
  next_date: string;
  category?: {
    ID: number;
    name: string;
    color?: string;
    icon?: string;
  };
  created_at?: string;
  updated_at?: string;
};

function getUserIdFromToken(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    const userId = decoded.user_id;
    return userId ? Number(userId) : null;
  } catch {
    return null;
  }
}

export async function fetchRecurringExpenses(): Promise<RecurringExpense[]> {
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();
  const url = userId ? `/api/recurring-expenses?user_id=${userId}` : "/api/recurring-expenses";

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load recurring expenses");
  }

  return res.json();
}

export async function fetchActiveRecurringExpenses(): Promise<RecurringExpense[]> {
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();
  const url = userId ? `/api/recurring-expenses/active?user_id=${userId}` : "/api/recurring-expenses/active";

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load active recurring expenses");
  }

  return res.json();
}

export async function fetchRecurringExpense(id: number): Promise<RecurringExpense> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/recurring-expenses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to load recurring expense");
  }

  return res.json();
}

export async function createRecurringExpense(data: {
  category_id: number;
  amount: number;
  description?: string;
  type: RecurringExpenseType;
  day_of_month?: number;
  day_of_week?: number;
}): Promise<RecurringExpense> {
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();
  const url = userId ? `/api/recurring-expenses?user_id=${userId}` : "/api/recurring-expenses";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create recurring expense");
  }

  return res.json();
}

export async function updateRecurringExpense(
  id: number,
  data: {
    category_id?: number;
    amount?: number;
    description?: string;
    type?: RecurringExpenseType;
    day_of_month?: number;
    day_of_week?: number;
    is_active?: boolean;
  }
): Promise<RecurringExpense> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/recurring-expenses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update recurring expense");
  }

  return res.json();
}

export async function deleteRecurringExpense(id: number): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/recurring-expenses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete recurring expense");
  }
}

export async function activateRecurringExpense(id: number): Promise<RecurringExpense> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/recurring-expenses/${id}/activate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to activate recurring expense");
  }

  return res.json();
}

export async function deactivateRecurringExpense(id: number): Promise<RecurringExpense> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/recurring-expenses/${id}/deactivate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to deactivate recurring expense");
  }

  return res.json();
}

