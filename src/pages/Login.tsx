import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Headphones, LogIn, Mail } from "lucide-react";
import { useAuth } from "../lib/auth";
import { BrandPanel } from "../components/auth/BrandPanel";
import { IconInput } from "../components/auth/IconInput";
import { PasswordInput } from "../components/auth/PasswordInput";
import { DemoAccountsCard } from "./login/DemoAccountsCard";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) nav("/dashboard");
    else setError(result.error ?? "Could not sign in.");
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Headphones size={18} />
            </div>
            <span className="text-base font-semibold tracking-tight">HelpDesk</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Sign in to your workspace
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Welcome back. Enter your details below to continue.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="label">
                Work email
              </label>
              <IconInput
                id="email"
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="label !mb-0">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
              />
              Keep me signed in for 30 days
            </label>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200"
              >
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                  <ArrowRight size={16} className="ml-auto" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Staff-only workspace. Tickets are created automatically from email and
              web forms — customers do not sign in here.
            </p>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400 dark:bg-slate-950 dark:text-slate-500">
                Demo access
              </span>
            </div>
          </div>

          <DemoAccountsCard onSelect={fillDemo} />
        </div>
      </main>
    </div>
  );
}
