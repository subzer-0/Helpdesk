import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Ticket as TicketIcon, Clock, CheckCircle2, AlertTriangle, Activity, Sparkles } from "lucide-react";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { StatusBadge, PriorityBadge } from "../components/Badges";
import { Avatar } from "../components/Avatar";
import { relativeTime, shortDate } from "../lib/format";

const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6",
  pending: "#f59e0b",
  resolved: "#10b981",
  closed: "#94a3b8",
};

export default function Dashboard() {
  const { user } = useAuth();
  const tickets = useStore((s) => s.tickets);
  const [tick, setTick] = useState(0);

  // gentle live tick — refreshes "X minutes ago" labels and recent activity feel
  useEffect(() => {
    const i = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(i);
  }, []);

  const visible = useMemo(() => {
    if (!user) return [];
    if (user.role === "customer") return tickets.filter((t) => t.customerId === user.id);
    return tickets;
  }, [tickets, user]);

  const stats = useMemo(() => {
    const open = visible.filter((t) => t.status === "open").length;
    const pending = visible.filter((t) => t.status === "pending").length;
    const resolved = visible.filter((t) => t.status === "resolved").length;
    const urgent = visible.filter((t) => t.priority === "urgent" && t.status !== "closed" && t.status !== "resolved").length;
    return { open, pending, resolved, urgent, total: visible.length };
  }, [visible]);

  const perDay = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({ date: d.toISOString(), label: shortDate(d.toISOString()), count: 0 });
    }
    visible.forEach((t) => {
      const created = new Date(t.createdAt);
      created.setHours(0, 0, 0, 0);
      const idx = days.findIndex((d) => d.date === created.toISOString());
      if (idx >= 0) days[idx].count++;
    });
    return days;
  }, [visible, tick]);

  const statusBreakdown = useMemo(() => {
    return [
      { name: "open", value: stats.open },
      { name: "pending", value: stats.pending },
      { name: "resolved", value: stats.resolved },
      { name: "closed", value: visible.filter((t) => t.status === "closed").length },
    ].filter((s) => s.value > 0);
  }, [stats, visible]);

  const recent = visible.slice(0, 6);

  const cards = [
    { label: "Open", value: stats.open, icon: TicketIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-500/20" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-100 dark:bg-amber-500/20" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20" },
    { label: "Urgent open", value: stats.urgent, icon: AlertTriangle, color: "text-red-600 bg-red-100 dark:bg-red-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hi {user?.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">
            Here's the live state of your support workspace.
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600">
              <Activity size={14} /> live
            </span>
          </p>
        </div>
        <Link to="/tickets" className="btn-primary">
          <TicketIcon size={16} />
          View all tickets
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
              <c.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-semibold">{c.value}</div>
              <div className="text-xs text-slate-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Tickets per day</h2>
            <span className="text-xs text-slate-500">Last 14 days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: "rgba(99,102,241,0.08)" }} />
                <Bar dataKey="count" fill="#2447f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-semibold">Status breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusBreakdown.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent activity</h2>
          <Link to="/tickets" className="text-sm text-brand-600 hover:underline">
            See all →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent.map((t) => (
            <li key={t.id}>
              <Link
                to={`/tickets/${t.id}`}
                className="flex flex-wrap items-center gap-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg"
              >
                <Avatar name={t.customerName} size={32} color="#64748b" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{t.subject}</span>
                    {t.aiConfidence && (
                      <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                        <Sparkles size={10} /> AI
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.customerName} · {relativeTime(t.updatedAt)}
                  </div>
                </div>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </Link>
            </li>
          ))}
          {recent.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No tickets yet.</li>}
        </ul>
      </div>
    </div>
  );
}
