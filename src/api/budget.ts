export type Budget = {
  ID: number;
  amount: number;
  month: number;
  year: number;
  created_at?: string;
  updated_at?: string;
};

export type BudgetStatus = {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  is_exceeded: boolean;
  is_near_limit: boolean;
};

export type CurrentBudgetResponse = { empty: true } | BudgetStatus;

// Helper function to extract user_id from JWT token
function getUserIdFromToken(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    // JWT stores numbers as float, so we need to convert
    const userId = decoded.user_id;
    return userId ? Number(userId) : null;
  } catch {
    return null;
  }
}

export async function fetchBudgets(): Promise<Budget[]> {
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();
  const url = `/api/budgets${userId ? `?user_id=${userId}` : ""}`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load budgets");
  }

  return res.json();
}

export async function fetchBudget(id: number): Promise<Budget> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/budgets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to load budget");
  }

  return res.json();
}

export async function fetchCurrentBudget(): Promise<CurrentBudgetResponse> {
  const res = await fetch("/api/budgets/current", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!res.ok) {
    throw new Error("No budget");
  }

  return res.json();
}

export async function createBudget(data: {
  amount: number;
  month: number;
  year: number;
}): Promise<Budget> {
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();
  
  if (!userId) {
    throw new Error("User ID not found in token");
  }
  
  const url = `/api/budgets?user_id=${userId}`;
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
    throw new Error(err.error || "Failed to create budget");
  }

  return res.json();
}

export async function updateBudget(
  id: number,
  data: {
    amount?: number;
    month?: number;
    year?: number;
  }
): Promise<Budget> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/budgets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update budget");
  }

  return res.json();
}

export async function deleteBudget(id: number): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/budgets/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete budget");
  }
}
