import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { store } from "./store";
import type { Role, User } from "./types";

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: { name: string; email: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "helpdesk_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const id = JSON.parse(raw) as string;
      const u = store.getUser(id);
      if (u) setUser(u);
    }
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      async login(email, password) {
        const u = store.findUserByEmail(email);
        if (!u) return { ok: false, error: "No account with that email." };
        if (u.password !== password) return { ok: false, error: "Wrong password." };
        localStorage.setItem(KEY, JSON.stringify(u.id));
        setUser(u);
        return { ok: true };
      },
      async signup(input) {
        if (store.findUserByEmail(input.email)) return { ok: false, error: "Email already in use." };
        const u = store.createUser({
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
        });
        localStorage.setItem(KEY, JSON.stringify(u.id));
        setUser(u);
        return { ok: true };
      },
      logout() {
        localStorage.removeItem(KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
