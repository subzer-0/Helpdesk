import { useState } from "react";
import { Inbox, Send, RefreshCw, Sparkles } from "lucide-react";
import { store, useStore } from "../lib/store";
import { relativeTime } from "../lib/format";
import { Modal } from "../components/Modal";

const SAMPLE_INBOUND = [
  {
    from: "newcustomer@example.com",
    subject: "Trouble exporting CSV",
    body: "Hi, when I try to export a CSV from the dashboard nothing downloads. I'm on Chrome on Mac.",
  },
  {
    from: "ops@acme.io",
    subject: "Urgent: production webhooks not firing",
    body: "Our production environment is missing webhook events since this morning. This is blocking our checkout flow!",
  },
  {
    from: "happycustomer@example.com",
    subject: "How do I add a teammate?",
    body: "Quick question — how do I invite a teammate to my workspace?",
  },
];

export default function EmailPage() {
  const emails = useStore((s) => s.emails);
  const tickets = useStore((s) => s.tickets);
  const [composeOpen, setComposeOpen] = useState(false);

  function ingestRandom() {
    const sample = SAMPLE_INBOUND[Math.floor(Math.random() * SAMPLE_INBOUND.length)];
    // 1) record the inbound email
    const email = store.addEmail({
      from: sample.from,
      to: "support@helpdesk.io",
      subject: sample.subject,
      body: sample.body,
      receivedAt: new Date().toISOString(),
      direction: "inbound",
      status: "received",
    });
    // 2) materialize the customer if needed
    let customer = store.findUserByEmail(sample.from);
    if (!customer) {
      customer = store.createUser({
        name: sample.from.split("@")[0],
        email: sample.from,
        password: "—",
        role: "customer",
      });
    }
    // 3) open a ticket from the email
    const ticket = store.createTicket({
      subject: sample.subject,
      body: sample.body,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      source: "email",
    });
    // 4) link & enqueue AI jobs
    store.updateEmail(email.id, { status: "ingested", ticketId: ticket.id });
    store.enqueueJob({ type: "ingest_email", payload: { emailId: email.id, ticketId: ticket.id } });
    store.enqueueJob({ type: "classify_ticket", payload: { ticketId: ticket.id } });
    store.enqueueJob({ type: "summarize_ticket", payload: { ticketId: ticket.id } });
    store.enqueueJob({ type: "auto_resolve", payload: { ticketId: ticket.id } });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Email</h1>
          <p className="text-sm text-slate-500">Inbound email is auto-ingested into tickets. Outbound replies go through the queue.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={ingestRandom}>
            <RefreshCw size={14} /> Simulate inbound
          </button>
          <button className="btn-primary" onClick={() => setComposeOpen(true)}>
            <Send size={14} /> Compose
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-900">
          <Inbox size={16} /> All mail
          <span className="ml-auto text-xs text-slate-500">{emails.length} messages</span>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {emails.map((e) => {
            const ticket = tickets.find((t) => t.id === e.ticketId);
            return (
              <li key={e.id} className="flex flex-wrap items-start gap-3 p-4">
                <span
                  className={`badge ${
                    e.direction === "inbound"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                  }`}
                >
                  {e.direction}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{e.subject}</span>
                    <span className="text-xs text-slate-500">{e.from} → {e.to}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{e.body}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{relativeTime(e.receivedAt)}</span>
                    <span>·</span>
                    <span className="capitalize">{e.status}</span>
                    {ticket && (
                      <>
                        <span>·</span>
                        <a href={`/tickets/${ticket.id}`} className="text-brand-600 hover:underline">
                          {ticket.id}
                        </a>
                      </>
                    )}
                    {e.status === "ingested" && (
                      <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                        <Sparkles size={10} /> AI processing
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          {emails.length === 0 && (
            <li className="p-8 text-center text-sm text-slate-500">No emails yet.</li>
          )}
        </ul>
      </div>

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );
}

function ComposeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  function submit() {
    store.addEmail({
      from: "support@helpdesk.io",
      to,
      subject,
      body,
      receivedAt: new Date().toISOString(),
      direction: "outbound",
      status: "sent",
    });
    store.enqueueJob({ type: "send_email", payload: { to, subject } });
    setTo("");
    setSubject("");
    setBody("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compose email"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!to || !subject || !body} onClick={submit}>
            <Send size={14} /> Send
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="label">To</label>
          <input className="input" type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="customer@example.com" />
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="label">Body</label>
          <textarea className="input min-h-[140px]" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
