import { useState } from "react";
import type { FormEvent } from "react";
import { register, login } from "../api";

type Props = {
  onSuccess: (token: string) => void;
};

export default function DevAuthForm({ onSuccess }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (mode === "register") {
        response = await register(email, username, password);
      } else {
        response = await login(email, password);
      }

      if (response.token) {
        localStorage.setItem("token", response.token);
        onSuccess(response.token);
      } else {
        setError("Токен не получен");
      }
    } catch (err: any) {
      setError(err?.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <div className="segmented-control">
        <button
          type="button"
          className={`segmented-control__item ${mode === "login" ? "is-active" : ""}`}
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Вход
        </button>
        <button
          type="button"
          className={`segmented-control__item ${mode === "register" ? "is-active" : ""}`}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Регистрация
        </button>
      </div>

      <label className="form-field form-field--soft">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@example.com"
          required
        />
      </label>

      {mode === "register" && (
        <label className="form-field form-field--soft">
          <span>Имя пользователя</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            required
            minLength={3}
          />
        </label>
      )}

      <label className="form-field form-field--soft">
        <span>Пароль</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={mode === "register" ? 6 : 1}
        />
      </label>

      {error && <div className="auth-card__error">{error}</div>}

      <button
        type="submit"
        className="btn btn--primary"
        disabled={loading}
      >
        {loading ? "Обработка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
      </button>

      <p className="auth-card__hint">
        {mode === "login"
          ? "Нет аккаунта? Переключитесь на регистрацию"
          : "Уже есть аккаунт? Переключитесь на вход"}
      </p>
    </form>
  );
}

