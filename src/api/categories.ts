export type Category = {
    ID: number;
    name: string;
    color: string;
    icon?: string;
  };
  
  import { debug } from "../debug";

  export async function fetchCategories(): Promise<Category[]> {
    const token = localStorage.getItem("token");
  
    debug("FETCH /api/categories");
    debug("TOKEN", token);
  
    const res = await fetch("/api/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    debug("HTTP status", res.status);
  
    const text = await res.text();
    debug("RAW response text", text);
  
    if (!res.ok) {
      throw new Error(text);
    }
  
    const json = JSON.parse(text);
    debug("JSON parsed", json);
  
    return json;
  }
  
  
  export async function createCategory(data: {
    name: string;
    color?: string;
    icon?: string;
  }) {
    const token = localStorage.getItem("token");
  
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create category");
    }
  
    return res.json();
  }
  
  export async function updateCategory(
    id: number,
    data: {
      name?: string;
      color?: string;
      icon?: string;
    }
  ): Promise<Category> {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update category");
    }

    return res.json();
  }

  export async function deleteCategory(id: number) {
    const token = localStorage.getItem("token");
  
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete category");
    }
  }
  