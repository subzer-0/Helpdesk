import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Wand2,
  CheckCircle2,
  HandMetal,
  Mail,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { PriorityBadge, RoleBadge, StatusBadge } from "../components/Badges";
import { Avatar } from "../components/Avatar";
import { relativeTime } from "../lib/format";
import * as ai from "../lib/ai";
import { api } from "../lib/api";
import type { Message, Ticket, TicketPriority, TicketStatus, User } from "../lib/types";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  const agents = users.filter((u) => u.role === "agent" || u.role === "admin");
  const canEdit = user?.role !== "customer";

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [t, msgs, us] = await Promise.all([
        api.getTicket(id),
        api.listMessages(id),
        api.listUsers().catch(() => []),
      ]);
      setTicket(t);
      setThread(msgs);
      setUsers(us);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sortedThread = useMemo(
    () => [...thread].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [thread],
  );

  async function send(internal = false) {
    if (!ticket || !draft.trim()) return;
    try {
      const created = await api.createMessage(ticket.id, {
        body: draft.trim(),
        isInternal: internal,
      });
      setThread((prev) => [...prev, created]);
      setDraft("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function updateTicket(patch: { status?: TicketStatus; priority?: TicketPriority; assigneeId?: string | null }) {
    if (!ticket) return;
    setSavingMeta(true);
    try {
      const updated = await api.updateTicket(ticket.id, patch);
      setTicket(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingMeta(false);
    }
  }

  async function polish() {
    if (!draft.trim()) return;
    setPolishing(true);
    const polished = await ai.polish(draft, { tone: "friendly" });
    setDraft(polished);
    setPolishing(false);
  }

  if (loading) {
    return <div className="card p-8 text-center text-slate-500">Loading ticket...</div>;
  }

  if (error) {
    return <div className="card p-8 text-center text-red-600">{error}</div>;
  }

  if (!ticket) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-500">Ticket not found.</p>
        <Link to="/tickets" className="btn-secondary mt-4 inline-flex">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div>
          <Link to="/tickets" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
            <ArrowLeft size={14} /> All tickets
          </Link>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{ticket.subject}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{ticket.id}</span>
                <span>·</span>
                <span>{ticket.customerName}</span>
                <span>·</span>
                <span>opened {relativeTime(ticket.createdAt)}</span>
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Mail size={10} /> unified support channel
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && ticket.assigneeId !== user?.id && (
                <button
                  className="btn-ghost"
                  onClick={() => void updateTicket({ assigneeId: user?.id ?? null })}
                  title="Assign to me"
                  disabled={savingMeta}
                >
                  <HandMetal size={14} /> Claim Ticket
                </button>
              )}
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </div>

        <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
          {sortedThread.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 p-4 ${m.internal ? "bg-amber-50/60 dark:bg-amber-500/5" : ""}`}
            >
              <Avatar name={m.authorName} size={32} color={users.find((u) => u.id === m.authorId)?.avatarColor ?? "#64748b"} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{m.authorName}</span>
                  {m.authorRole !== "system" && <RoleBadge role={m.authorRole === "customer" ? "customer" : m.authorRole} />}
                  {m.internal && (
                    <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                      internal note
                    </span>
                  )}
                  {m.channel === "email" && (
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Mail size={10} /> email
                    </span>
                  )}
                  <span className="ml-auto text-xs text-slate-500">{relativeTime(m.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{m.body}</p>
              </div>
            </div>
          ))}
          {sortedThread.length === 0 && (
            <div className="p-6 text-sm text-slate-500">No messages yet.</div>
          )}
        </div>

        <div className="card p-4">
          <textarea
            className="input min-h-[120px]"
            placeholder={user?.role === "customer" ? "Reply to the support team..." : "Write a reply or note..."}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className="btn-primary" onClick={() => void send(false)} disabled={!draft.trim()}>
              <Send size={14} /> Send reply
            </button>
            {canEdit && (
              <button
                className="btn-secondary"
                onClick={() => void send(true)}
                disabled={!draft.trim()}
                title="Visible only to your team"
              >
                Add internal note
              </button>
            )}
            {canEdit && (
              <button className="btn-ghost" onClick={() => void polish()} disabled={!draft.trim() || polishing}>
                <Wand2 size={14} /> {polishing ? "Polishing..." : "AI polish"}
              </button>
            )}
            <span className="ml-auto text-xs text-slate-500">
              {canEdit ? `Replies are sent from support@helpdesk.io to ${ticket.customerEmail}.` : "Replies post to the conversation."}
            </span>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Details</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Customer">
              <div className="flex items-center gap-2">
                <Avatar name={ticket.customerName} size={20} color="#64748b" />
                <span>{ticket.customerName}</span>
              </div>
              <div className="text-xs text-slate-500">{ticket.customerEmail}</div>
            </Row>
            <Row label="Status">
              {canEdit ? (
                <select
                  className="input"
                  value={ticket.status}
                  onChange={(e) => void updateTicket({ status: e.target.value as TicketStatus })}
                  disabled={savingMeta}
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              ) : (
                <StatusBadge status={ticket.status} />
              )}
            </Row>
            <Row label="Priority">
              {canEdit ? (
                <select
                  className="input"
                  value={ticket.priority}
                  onChange={(e) => void updateTicket({ priority: e.target.value as TicketPriority })}
                  disabled={savingMeta}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <PriorityBadge priority={ticket.priority} />
              )}
            </Row>
            <Row label="Assignee">
              {canEdit ? (
                <select
                  className="input"
                  value={ticket.assigneeId ?? ""}
                  onChange={(e) => void updateTicket({ assigneeId: e.target.value || null })}
                  disabled={savingMeta}
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              ) : (
                <span>{ticket.assigneeName ?? "-"}</span>
              )}
            </Row>
          </dl>
        </div>

        {canEdit && (
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
            <div className="space-y-2">
              <button className="btn-secondary w-full justify-start" onClick={() => void updateTicket({ status: "resolved" })}>
                <CheckCircle2 size={14} /> Mark resolved
              </button>
              <button
                className="btn-secondary w-full justify-start"
                onClick={() => void updateTicket({ assigneeId: user?.id ?? null })}
              >
                <HandMetal size={14} /> Assign to me
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-1 text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
