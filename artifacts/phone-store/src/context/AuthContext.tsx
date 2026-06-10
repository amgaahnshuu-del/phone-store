import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AuthUser = {
  id: number;
  username: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function authenticate(
  path: string,
  username: string,
  password: string,
  fallbackError: string,
): Promise<AuthUser> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || fallbackError);
  }

  return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const data = await authenticate("/api/auth/login", username, password, "Нэвтрэх үед алдаа гарлаа");
    setUser(data);
    return data;
  };

  const register = async (username: string, password: string): Promise<AuthUser> => {
    const data = await authenticate("/api/auth/register", username, password, "Бүртгүүлэх үед алдаа гарлаа");
    setUser(data);
    return data;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
