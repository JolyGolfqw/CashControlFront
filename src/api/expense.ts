export type Expense = {
  ID?: number;
  id?: number;
  amount: number;
  description: string;
  date: string;
  category_id: number;
  category?: {
    ID?: number;
    id?: number;
    name: string;
    color?: string;
    icon?: string;
  };
};

export type ExpenseFilter = {
  category_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
};

export async function fetchExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  const token = localStorage.getItem("token");
  
  const params = new URLSearchParams();
  if (filter?.category_id) params.append("category_id", filter.category_id.toString());
  if (filter?.start_date) params.append("start_date", filter.start_date);
  if (filter?.end_date) params.append("end_date", filter.end_date);
  if (filter?.limit) params.append("limit", filter.limit.toString());
  if (filter?.offset) params.append("offset", filter.offset.toString());

  const url = `/api/expenses${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load expenses");
  }

  return res.json();
}

export async function fetchExpense(id: number): Promise<Expense> {
  const token = localStorage.getItem("token");

  const res = await fetch(`/api/expenses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to load expense");
  }

  return res.json();
}

export async function createExpense(data: {
  category_id: number;
  amount: number;
  description?: string;
  date: string;
}): Promise<Expense> {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create expense");
  }

  return res.json();
}

export async function updateExpense(
  id: number,
  data: {
    category_id?: number;
    amount?: number;
    description?: string;
    date?: string;
  }
): Promise<Expense> {
  const token = localStorage.getItem("token");

  const res = await fetch(`/api/expenses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update expense");
  }

  return res.json();
}

export async function deleteExpense(id: number): Promise<void> {
  const token = localStorage.getItem("token");

  const res = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete expense");
  }
}
  