import { useState } from "react";
import { Inbox, Send, RefreshCw, Sparkles, X, Archive, AlertTriangle, ArrowRight, CornerUpLeft } from "lucide-react";
import { store, useStore } from "../lib/store";
import { relativeTime } from "../lib/format";
import { Modal } from "../components/Modal";
import type { Email } from "../lib/types";

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
  const emails = [...useStore((s) => s.emails)].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  const tickets = useStore((s) => s.tickets);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const selectedEmail = emails.find((e) => e.id === selectedEmailId);

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
    <div className="flex h-[calc(100vh-100px)] flex-col space-y-4">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
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

      <div className={`grid min-h-0 flex-1 gap-6 ${selectedEmail ? 'lg:grid-cols-[380px_1fr]' : 'grid-cols-1'}`}>
        <div className="card flex flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-900">
            <span className="flex items-center gap-2">
              <Inbox size={16} /> All mail
            </span>
            <span className="text-xs text-slate-500">{emails.length} messages</span>
          </div>
          <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {emails.map((e) => {
              const ticket = tickets.find((t) => t.id === e.ticketId);
              const isSelected = e.id === selectedEmailId;
              return (
                <li
                  key={e.id}
                  className={`cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    isSelected ? 'bg-slate-50 dark:bg-slate-800/50 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brand-500' : ''
                  }`}
                  onClick={() => setSelectedEmailId(e.id)}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`badge shrink-0 ${
                        e.direction === "inbound"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                      }`}
                    >
                      {e.direction}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{e.subject}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{e.from}</div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{e.body}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span>{relativeTime(e.receivedAt)}</span>
                        <span>·</span>
                        <span className="capitalize">{e.status}</span>
                        {ticket && (
                          <>
                            <span>·</span>
                            <span className="text-brand-600">Ticket #{ticket.id.split('_').pop()}</span>
                          </>
                        )}
                      </div>
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

        {selectedEmail && (
          <EmailDetail
            email={selectedEmail}
            ticket={tickets.find(t => t.id === selectedEmail.ticketId) || null}
            onClose={() => setSelectedEmailId(null)}
          />
        )}
      </div>

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  );
}

function EmailDetail({
  email,
  ticket,
  onClose,
}: {
  email: Email;
  ticket: any;
  onClose: () => void;
}) {
  const [replyDraft, setReplyDraft] = useState("");

  const handleCreateTicket = () => {
    let customer = store.findUserByEmail(email.from);
    if (!customer) {
      customer = store.createUser({
        name: email.from.split("@")[0],
        email: email.from,
        password: "—",
        role: "customer",
      });
    }

    const newTicket = store.createTicket({
      subject: email.subject,
      body: email.body,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      source: "email",
    });

    store.updateEmail(email.id, { status: "ingested", ticketId: newTicket.id });
    store.enqueueJob({ type: "ingest_email", payload: { emailId: email.id, ticketId: newTicket.id } });
  };

  const handleReply = () => {
    if (!replyDraft.trim()) return;
    
    // Check if it's already a ticket, we add the message to the ticket. 
    // If not, we could create a ticket first, then add the message.
    if (ticket) {
      store.addMessage({
        ticketId: ticket.id,
        authorId: "system", // Or current user if available
        authorName: "Support Agent",
        authorRole: "agent",
        body: replyDraft,
        channel: "email",
      });
    }
    
    store.addEmail({
      from: "support@helpdesk.io",
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: replyDraft,
      receivedAt: new Date().toISOString(),
      direction: "outbound",
      status: "sent",
      ticketId: ticket?.id,
    });
    
    setReplyDraft("");
  };

  return (
    <div className="card flex flex-col overflow-hidden relative w-full h-full max-h-full">
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="flex gap-2">
          {ticket ? (
            <a href={`/tickets/${ticket.id}`} className="btn-secondary h-8 hover:!bg-brand-50 hover:!text-brand-600 hover:!border-brand-200">
              <Sparkles size={14} /> Open Ticket
            </a>
          ) : (
            <button className="btn-primary h-8" onClick={handleCreateTicket}>
              <CornerUpLeft size={14} /> Create Ticket
            </button>
          )}
          <button className="btn-secondary h-8" title="Archive">
            <Archive size={14} />
          </button>
          <button className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-900/30 h-8" title="Mark Spam">
            <AlertTriangle size={14} />
          </button>
        </div>
        <button className="btn-ghost h-8 w-8 !p-0" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{email.subject}</h2>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-sm">
              {email.from.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{email.from}</div>
              <div className="text-xs text-slate-500">to {email.to}</div>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {new Date(email.receivedAt).toLocaleString()}
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {email.body}
        </div>
      </div>

      {/* Reply Area (Only for Inbound) */}
      {email.direction === "inbound" && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex-none">
          <textarea
            className="input min-h-[100px] mb-3 bg-white dark:bg-slate-950"
            placeholder={`Reply to ${email.from}...`}
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              {ticket ? <span>Will be linked to Ticket #{ticket.id.split('_').pop()}</span> : <span>Replies outside a ticket won't appear on the dashboard.</span>}
            </div>
            <button 
              className="btn-primary" 
              disabled={!replyDraft.trim()} 
              onClick={handleReply}
            >
              <Send size={14} /> Send Reply
            </button>
          </div>
        </div>
      )}
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
