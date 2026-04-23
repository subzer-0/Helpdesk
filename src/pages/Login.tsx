import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Headphones, LogIn } from "lucide-react";
import { useAuth } from "../lib/auth";

const DEMO = [
  { label: "Admin", email: "admin@helpdesk.io", password: "admin123" },
  { label: "Agent", email: "sam@helpdesk.io", password: "agent123" },
  { label: "Customer", email: "maya@example.com", password: "customer123" },
];

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 to-brand-50 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow">
            <Headphones />
          </div>
          <h1 className="text-2xl font-semibold">Welcome to HelpDesk</h1>
          <p className="text-sm text-slate-500">Sign in to your support workspace</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            <LogIn size={16} />
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link to="/signup" className="text-brand-600 hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        <div className="card p-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Demo accounts (click to fill)</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO.map((d) => (
              <button
                key={d.email}
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
