import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "./api";
import type { Role, User } from "./types";

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: { name: string; email: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.me().then(
      (u) => setUser(u),
      () => setUser(null),
    );
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      async login(email, password) {
        try {
          const u = await api.login(email, password);
          if (u.role !== "admin" && u.role !== "agent") {
            await api.logout();
            return { ok: false, error: "This workspace is staff-only." };
          }
          setUser(u);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: (e as Error).message || "Invalid credentials." };
        }
      },
      async signup(input) {
        void input;
        return { ok: false, error: "Signup is disabled in this staff workspace." };
      },
      logout() {
        api.logout().finally(() => setUser(null));
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
