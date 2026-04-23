import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Headphones, UserPlus } from "lucide-react";
import { useAuth } from "../lib/auth";
import type { Role } from "../lib/types";

export default function Signup() {
  const { user, signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signup({ name, email, password, role });
    setLoading(false);
    if (result.ok) nav("/dashboard");
    else setError(result.error ?? "Could not create account.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 to-brand-50 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow">
            <Headphones />
          </div>
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-slate-500">Join the HelpDesk workspace</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="label">I am a…</label>
            <div className="grid grid-cols-3 gap-2">
              {(["customer", "agent", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                    role === r
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Creating…" : "Create account"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
