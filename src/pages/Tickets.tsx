import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import { store, useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { PriorityBadge, StatusBadge } from "../components/Badges";
import { Avatar } from "../components/Avatar";
import { relativeTime } from "../lib/format";
import { Modal } from "../components/Modal";
import type { TicketCategory, TicketPriority, TicketStatus } from "../lib/types";

export default function Tickets() {
  const { user } = useAuth();
  const tickets = useStore((s) => s.tickets);
  const users = useStore((s) => s.users);
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | TicketStatus>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");
  const [assignee, setAssignee] = useState<"all" | "unassigned" | string>("all");
  const [showNew, setShowNew] = useState(false);

  const visible = useMemo(() => {
    let arr = tickets;
    if (user?.role === "customer") arr = arr.filter((t) => t.customerId === user.id);
    if (status !== "all") arr = arr.filter((t) => t.status === status);
    if (priority !== "all") arr = arr.filter((t) => t.priority === priority);
    if (assignee === "unassigned") arr = arr.filter((t) => !t.assigneeId);
    else if (assignee !== "all") arr = arr.filter((t) => t.assigneeId === assignee);
    if (q) {
      const ql = q.toLowerCase();
      arr = arr.filter(
        (t) =>
          t.subject.toLowerCase().includes(ql) ||
          t.customerName.toLowerCase().includes(ql) ||
          t.tags.some((tag) => tag.includes(ql)) ||
          t.id.includes(ql),
      );
    }
    return arr;
  }, [tickets, q, status, priority, assignee, user]);

  const agents = users.filter((u) => u.role === "agent");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-slate-500">{visible.length} of {tickets.length}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> New ticket
        </button>
      </div>

      <div className="card p-3">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by subject, customer, tag, or ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {user?.role !== "customer" && (
            <select className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="all">All assignees</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Updated</th>
                {user?.role === "admin" && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visible.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => nav(`/tickets/${t.id}`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-xs text-slate-500">
                      {t.id} · {t.category.replace("_", " ")}
                      {t.tags.length > 0 && (
                        <span className="ml-2">
                          {t.tags.map((tag) => (
                            <span key={tag} className="badge mr-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={t.customerName} size={26} color="#64748b" />
                      <div className="min-w-0">
                        <div className="truncate text-sm">{t.customerName}</div>
                        <div className="truncate text-xs text-slate-500">{t.customerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {t.assigneeName ? (
                      <span className="text-sm">{t.assigneeName}</span>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{relativeTime(t.updatedAt)}</td>
                  {user?.role === "admin" && (
                    <td className="px-4 py-3 text-right">
                      <button
                        className="btn-ghost p-1 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ticket "${t.subject}"?`)) store.deleteTicket(t.id);
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                    No tickets match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewTicketModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}

function NewTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const users = useStore((s) => s.users);
  const customers = users.filter((u) => u.role === "customer");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [category, setCategory] = useState<TicketCategory>("general");
  const [customerId, setCustomerId] = useState(user?.role === "customer" ? user.id : customers[0]?.id ?? "");

  function submit() {
    const customer = users.find((u) => u.id === customerId);
    if (!customer || !subject.trim()) return;
    const t = store.createTicket({
      subject: subject.trim(),
      body: body.trim() || subject.trim(),
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      priority,
      category,
      source: "web",
    });
    // enqueue classify + summarize jobs
    store.enqueueJob({ type: "classify_ticket", payload: { ticketId: t.id } });
    store.enqueueJob({ type: "summarize_ticket", payload: { ticketId: t.id } });
    onClose();
    nav(`/tickets/${t.id}`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New ticket"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!subject.trim()}>Create</button>
        </>
      }
    >
      <div className="space-y-3">
        {user?.role !== "customer" && (
          <div>
            <label className="label">Customer</label>
            <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} · {c.email}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label">Subject</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Summarize the issue" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[120px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe what's going on…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)}>
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="bug">Bug</option>
              <option value="feature_request">Feature request</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          The AI will classify and summarize this ticket in the background.
        </p>
      </div>
    </Modal>
  );
}

