export async function loginWithTelegram(initData: string) {
    const res = await fetch("/api/auth/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        init_data: initData,
      }),
    });
  
    if (!res.ok) {
      throw new Error("Telegram auth failed");
    }
  
    return res.json();
}

export async function register(email: string, username: string, password: string) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      username,
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }

  return res.json();
}
  
