import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Sparkles,
  FileText,
  Tag,
  Wand2,
  CheckCircle2,
  UserCheck,
  Mail,
  Bot,
} from "lucide-react";
import { store, useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { PriorityBadge, RoleBadge, StatusBadge } from "../components/Badges";
import { Avatar } from "../components/Avatar";
import { relativeTime } from "../lib/format";
import * as ai from "../lib/ai";
import type { TicketCategory, TicketPriority, TicketStatus } from "../lib/types";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const tickets = useStore((s) => s.tickets);
  const messages = useStore((s) => s.messages);
  const users = useStore((s) => s.users);

  const ticket = tickets.find((t) => t.id === id);
  const thread = useMemo(
    () => messages.filter((m) => m.ticketId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages, id],
  );
  const agents = users.filter((u) => u.role === "agent");

  const [draft, setDraft] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [aiBusy, setAiBusy] = useState<null | "summarize" | "classify" | "auto">(null);

  useEffect(() => setDraft(""), [id]);

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

  // RBAC: customers can only view their own tickets
  if (user?.role === "customer" && ticket.customerId !== user.id) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-500">You don't have access to this ticket.</p>
        <Link to="/tickets" className="btn-secondary mt-4 inline-flex">Back to tickets</Link>
      </div>
    );
  }

  function send(internal = false) {
    if (!ticket || !user) return;
    const body = draft.trim();
    if (!body) return;
    store.addMessage({
      ticketId: ticket.id,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      body,
      channel: ticket.source === "email" && user.role !== "customer" && !internal ? "email" : "web",
      internal,
    });
    if (ticket.source === "email" && user.role !== "customer" && !internal) {
      store.addEmail({
        from: "support@helpdesk.io",
        to: ticket.customerEmail,
        subject: `Re: ${ticket.subject}`,
        body,
        receivedAt: new Date().toISOString(),
        direction: "outbound",
        ticketId: ticket.id,
        status: "sent",
      });
      store.enqueueJob({ type: "send_email", payload: { ticketId: ticket.id, to: ticket.customerEmail } });
    }
    setDraft("");
  }

  async function polish() {
    if (!draft.trim()) return;
    setPolishing(true);
    const polished = await ai.polish(draft, { tone: "friendly" });
    setDraft(polished);
    setPolishing(false);
  }

  async function summarize() {
    if (!ticket) return;
    setAiBusy("summarize");
    const summary = await ai.summarize(ticket, thread);
    store.updateTicket(ticket.id, { aiSummary: summary });
    setAiBusy(null);
  }

  async function classify() {
    if (!ticket) return;
    setAiBusy("classify");
    const customer = thread.find((m) => m.authorRole === "customer");
    const result = await ai.classify(ticket.subject, customer?.body ?? "");
    store.updateTicket(ticket.id, {
      category: result.category,
      priority: result.priority,
      aiConfidence: result.confidence,
    });
    setAiBusy(null);
  }

  async function autoResolve() {
    if (!ticket) return;
    setAiBusy("auto");
    const lastCustomer = [...thread].reverse().find((m) => m.authorRole === "customer")?.body ?? "";
    const result = await ai.autoResolve(ticket, lastCustomer);
    if (result.canResolve && result.reply) {
      store.addMessage({
        ticketId: ticket.id,
        authorId: "ai",
        authorName: "HelpDesk AI",
        authorRole: "ai",
        body: result.reply,
        channel: "ai",
      });
      store.updateTicket(ticket.id, { status: "resolved", aiConfidence: result.confidence });
    } else {
      // route to a human
      const lightest = agents[0];
      if (lightest && !ticket.assigneeId) {
        store.updateTicket(ticket.id, {
          assigneeId: lightest.id,
          assigneeName: lightest.name,
          aiConfidence: result.confidence,
        });
      }
      store.addMessage({
        ticketId: ticket.id,
        authorId: "ai",
        authorName: "HelpDesk AI",
        authorRole: "ai",
        body: `I wasn't confident enough to auto-resolve this (${(result.confidence * 100).toFixed(0)}% conf). ${result.reason} Routing to ${lightest?.name ?? "the next available agent"}.`,
        channel: "ai",
        internal: true,
      });
    }
    setAiBusy(null);
  }

  const canEdit = user?.role !== "customer";

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
                {ticket.source === "email" && (
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Mail size={10} /> email
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </div>

        {ticket.aiSummary && (
          <div className="card border-purple-200 bg-purple-50/40 p-4 dark:border-purple-500/30 dark:bg-purple-500/5">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-200">
              <Sparkles size={14} /> AI summary
              {ticket.aiConfidence && (
                <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                  {(ticket.aiConfidence * 100).toFixed(0)}% conf
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200">{ticket.aiSummary}</p>
          </div>
        )}

        <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
          {thread.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 p-4 ${
                m.internal
                  ? "bg-amber-50/60 dark:bg-amber-500/5"
                  : m.authorRole === "ai"
                  ? "bg-purple-50/40 dark:bg-purple-500/5"
                  : ""
              }`}
            >
              {m.authorRole === "ai" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white">
                  <Bot size={16} />
                </div>
              ) : (
                <Avatar name={m.authorName} size={32} color={users.find((u) => u.id === m.authorId)?.avatarColor ?? "#64748b"} />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{m.authorName}</span>
                  {m.authorRole !== "ai" && m.authorRole !== "system" && (
                    <RoleBadge role={m.authorRole} />
                  )}
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
        </div>

        <div className="card p-4">
          <textarea
            className="input min-h-[120px]"
            placeholder={user?.role === "customer" ? "Reply to the support team…" : "Write a reply or note…"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className="btn-primary" onClick={() => send(false)} disabled={!draft.trim()}>
              <Send size={14} /> Send reply
            </button>
            {canEdit && (
              <button
                className="btn-secondary"
                onClick={() => send(true)}
                disabled={!draft.trim()}
                title="Visible only to your team"
              >
                Add internal note
              </button>
            )}
            {canEdit && (
              <button className="btn-ghost" onClick={polish} disabled={!draft.trim() || polishing}>
                <Wand2 size={14} /> {polishing ? "Polishing…" : "AI polish"}
              </button>
            )}
            <span className="ml-auto text-xs text-slate-500">
              {ticket.source === "email" && canEdit ? "Replies are sent to the customer's email." : "Replies post to the conversation."}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        {canEdit && (
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-semibold">AI tools</h2>
            <div className="space-y-2">
              <button className="btn-secondary w-full justify-start" onClick={summarize} disabled={aiBusy === "summarize"}>
                <FileText size={14} /> {aiBusy === "summarize" ? "Summarizing…" : "Summarize conversation"}
              </button>
              <button className="btn-secondary w-full justify-start" onClick={classify} disabled={aiBusy === "classify"}>
                <Tag size={14} /> {aiBusy === "classify" ? "Classifying…" : "Re-classify ticket"}
              </button>
              <button className="btn-secondary w-full justify-start" onClick={autoResolve} disabled={aiBusy === "auto"}>
                <Sparkles size={14} /> {aiBusy === "auto" ? "Trying…" : "Try AI auto-resolve"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              If the AI can't confidently resolve, it'll route the ticket to an available agent.
            </p>
          </div>
        )}

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
                  onChange={(e) => store.updateTicket(ticket.id, { status: e.target.value as TicketStatus })}
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
                  onChange={(e) => store.updateTicket(ticket.id, { priority: e.target.value as TicketPriority })}
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
            <Row label="Category">
              {canEdit ? (
                <select
                  className="input"
                  value={ticket.category}
                  onChange={(e) => store.updateTicket(ticket.id, { category: e.target.value as TicketCategory })}
                >
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                  <option value="bug">Bug</option>
                  <option value="feature_request">Feature request</option>
                </select>
              ) : (
                <span className="capitalize">{ticket.category.replace("_", " ")}</span>
              )}
            </Row>
            <Row label="Assignee">
              {canEdit ? (
                <select
                  className="input"
                  value={ticket.assigneeId ?? ""}
                  onChange={(e) => {
                    const a = agents.find((u) => u.id === e.target.value);
                    store.updateTicket(ticket.id, {
                      assigneeId: a?.id ?? null,
                      assigneeName: a?.name ?? null,
                    });
                  }}
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              ) : (
                <span>{ticket.assigneeName ?? "—"}</span>
              )}
            </Row>
            <Row label="Tags">
              <div className="flex flex-wrap gap-1">
                {ticket.tags.length === 0 && <span className="text-xs text-slate-400">none</span>}
                {ticket.tags.map((t) => (
                  <span key={t} className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{t}</span>
                ))}
              </div>
            </Row>
          </dl>
        </div>

        {canEdit && (
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
            <div className="space-y-2">
              <button
                className="btn-secondary w-full justify-start"
                onClick={() => store.updateTicket(ticket.id, { status: "resolved" })}
              >
                <CheckCircle2 size={14} /> Mark resolved
              </button>
              <button
                className="btn-secondary w-full justify-start"
                onClick={() => {
                  if (!user) return;
                  store.updateTicket(ticket.id, { assigneeId: user.id, assigneeName: user.name });
                }}
              >
                <UserCheck size={14} /> Assign to me
              </button>
              {user?.role === "admin" && (
                <button
                  className="btn-danger w-full justify-start"
                  onClick={() => {
                    if (confirm("Delete this ticket?")) {
                      store.deleteTicket(ticket.id);
                      nav("/tickets");
                    }
                  }}
                >
                  Delete ticket
                </button>
              )}
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
      <dt className="mb-1 text-xs font-medium text-slate-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
