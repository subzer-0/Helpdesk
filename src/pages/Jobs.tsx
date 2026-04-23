import { Cpu, RefreshCw, Trash } from "lucide-react";
import { store, useStore } from "../lib/store";
import { relativeTime } from "../lib/format";
import type { Job } from "../lib/types";

const STATUS_COLORS: Record<Job["status"], string> = {
  queued: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  running: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  succeeded: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  failed: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
};

export default function Jobs() {
  const jobs = useStore((s) => s.jobs);
  const counts = {
    queued: jobs.filter((j) => j.status === "queued").length,
    running: jobs.filter((j) => j.status === "running").length,
    succeeded: jobs.filter((j) => j.status === "succeeded").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Background jobs</h1>
          <p className="text-sm text-slate-500">Queue runs every 1.5s, processing up to 2 jobs per tick.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            onClick={() => {
              store.enqueueJob({ type: "summarize_ticket", payload: { ticketId: "t_1000" } });
            }}
          >
            <RefreshCw size={14} /> Enqueue test job
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {(["queued", "running", "succeeded", "failed"] as const).map((s) => (
          <div key={s} className="card flex items-center gap-3 p-4">
            <Cpu size={18} className="text-slate-400" />
            <div>
              <div className="text-2xl font-semibold">{counts[s]}</div>
              <div className="text-xs capitalize text-slate-500">{s}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Attempts</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{j.id}</td>
                <td className="px-4 py-3">{j.type}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_COLORS[j.status]}`}>{j.status}</span>
                </td>
                <td className="px-4 py-3">{j.attempts}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{relativeTime(j.createdAt)}</td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                  {j.log[j.log.length - 1] ?? <span className="text-slate-400">—</span>}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No jobs in the queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-right">
        <button
          className="btn-ghost text-red-600"
          onClick={() => {
            if (confirm("Reset all seed data? This will clear tickets, users, jobs, and emails.")) {
              store.resetSeed();
              location.reload();
            }
          }}
        >
          <Trash size={14} /> Reset seed data
        </button>
      </div>
    </div>
  );
}
