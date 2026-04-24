import type { TicketPriority, TicketStatus, UserRole } from "../lib/types";

const STATUS: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  closed: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

const PRIORITY: Record<TicketPriority, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200",
  urgent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
};

const ROLE: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200",
  agent: "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200",
  customer: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`badge ${STATUS[status]}`}>{status}</span>;
}
export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={`badge ${PRIORITY[priority]}`}>{priority}</span>;
}
export function RoleBadge({ role }: { role: UserRole }) {
  return <span className={`badge ${ROLE[role]}`}>{role}</span>;
}
