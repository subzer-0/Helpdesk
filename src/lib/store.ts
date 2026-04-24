import type { Email, Job, Message, Settings, Ticket, User } from "./types";
import { seedEmails, seedJobs, seedTickets, seedUsers } from "./seed";

const DEFAULT_SETTINGS: Settings = {
  orgName: "HelpDesk",
  supportEmail: "support@helpdesk.io",
  fromName: "HelpDesk Support",
  emailProvider: "resend",
  emailApiKey: "",
  inboundDomain: "helpdesk.io",
  aiEnabled: true,
  aiAutoResolveEnabled: true,
  aiAutoResolveThreshold: 0.8,
  aiDefaultTone: "friendly",
  notifyOnNewTicket: true,
  notifyOnUrgent: true,
  businessHoursStart: "09:00",
  businessHoursEnd: "17:00",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  replySignature: "— The HelpDesk team\n{{support_email}}",
  autoAckEnabled: true,
  autoAckSubject: "We got your message [#{{ticket_id}}]",
  autoAckBody:
    "Hi {{customer_name}},\n\nThanks for reaching out to {{org_name}}. We've opened ticket #{{ticket_id}} and a member of our team will get back to you shortly.\n\nIn the meantime, you can reply to this email and we'll add your message to the conversation.",
  outOfHoursEnabled: false,
  outOfHoursBody:
    "Hi {{customer_name}},\n\nThanks for your message — our team is currently outside of business hours. We'll reply as soon as we're back online tomorrow. Your ticket #{{ticket_id}} is logged and waiting.",
  resolvedFollowUpEnabled: true,
  resolvedFollowUpBody:
    "Hi {{customer_name}},\n\nGlad we could help — your ticket #{{ticket_id}} is now resolved. If anything else comes up, just reply to this email and we'll re-open it.\n\nHow did we do? We'd love your feedback.",
  aiReplyEnabled: true,
  aiReplyInstructions:
    "You are a support agent for {{org_name}}. Be friendly, concise, and solution-oriented. Greet the customer by first name. If you don't know the answer, say so and route to a human. Never invent policies or prices. Sign off with the team signature.",
};

type State = {
  users: User[];
  tickets: Ticket[];
  messages: Message[];
  emails: Email[];
  jobs: Job[];
  settings: Settings;
};

const KEY = "helpdesk_state_v1";

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      // backfill settings for older saved state
      return { ...parsed, settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) } };
    }
  } catch {
    // ignore
  }
  const { tickets, messages } = seedTickets();
  const initial: State = {
    users: seedUsers,
    tickets,
    messages,
    emails: seedEmails,
    jobs: seedJobs,
    settings: DEFAULT_SETTINGS,
  };
  localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const store = {
  getState: () => state,
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  resetSeed() {
    localStorage.removeItem(KEY);
    state = load();
    persist();
  },

  // ------------------ settings ------------------
  getSettings: () => state.settings,
  updateSettings(patch: Partial<Settings>) {
    state.settings = { ...state.settings, ...patch };
    persist();
  },

  // ------------------ users ------------------
  listUsers: () => [...state.users].sort((a, b) => a.name.localeCompare(b.name)),
  getUser: (id: string) => state.users.find((u) => u.id === id),
  findUserByEmail: (email: string) =>
    state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  createUser(user: Omit<User, "id" | "createdAt" | "avatarColor"> & { avatarColor?: string }) {
    const u: User = {
      ...user,
      id: `u_${Math.random().toString(36).slice(2, 9)}`,
      avatarColor: user.avatarColor ?? `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
      createdAt: new Date().toISOString(),
    };
    state.users.push(u);
    persist();
    return u;
  },
  updateUser(id: string, patch: Partial<User>) {
    state.users = state.users.map((u) => (u.id === id ? { ...u, ...patch } : u));
    persist();
  },
  deleteUser(id: string) {
    state.users = state.users.filter((u) => u.id !== id);
    persist();
  },

  // ------------------ tickets ------------------
  listTickets: () => [...state.tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  getTicket: (id: string) => state.tickets.find((t) => t.id === id),
  createTicket(input: {
    subject: string;
    body: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    priority?: Ticket["priority"];
    category?: Ticket["category"];
    source?: Ticket["source"];
  }) {
    const id = `t_${Date.now().toString(36)}`;
    const ticket: Ticket = {
      id,
      subject: input.subject,
      status: "open",
      priority: input.priority ?? "medium",
      category: input.category ?? "general",
      customerId: input.customerId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      assigneeId: null,
      assigneeName: null,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: input.source ?? "web",
      satisfactionScore: null,
    };
    state.tickets.unshift(ticket);
    state.messages.push({
      id: `m_${id}_1`,
      ticketId: id,
      authorId: input.customerId,
      authorName: input.customerName,
      authorRole: "customer",
      body: input.body,
      createdAt: ticket.createdAt,
      channel: ticket.source,
    });
    persist();
    return ticket;
  },
  updateTicket(id: string, patch: Partial<Ticket>) {
    state.tickets = state.tickets.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
    );
    persist();
  },
  deleteTicket(id: string) {
    state.tickets = state.tickets.filter((t) => t.id !== id);
    state.messages = state.messages.filter((m) => m.ticketId !== id);
    persist();
  },

  // ------------------ messages ------------------
  listMessages: (ticketId: string) =>
    state.messages
      .filter((m) => m.ticketId === ticketId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  addMessage(msg: Omit<Message, "id" | "createdAt"> & { createdAt?: string }) {
    const m: Message = {
      ...msg,
      id: `m_${Math.random().toString(36).slice(2, 10)}`,
      createdAt: msg.createdAt ?? new Date().toISOString(),
    };
    state.messages.push(m);
    state.tickets = state.tickets.map((t) =>
      t.id === msg.ticketId ? { ...t, updatedAt: m.createdAt } : t,
    );
    persist();
    return m;
  },

  // ------------------ emails ------------------
  listEmails: () => [...state.emails].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
  addEmail(email: Omit<Email, "id">) {
    const e: Email = { ...email, id: `e_${Math.random().toString(36).slice(2, 9)}` };
    state.emails.unshift(e);
    persist();
    return e;
  },
  updateEmail(id: string, patch: Partial<Email>) {
    state.emails = state.emails.map((e) => (e.id === id ? { ...e, ...patch } : e));
    persist();
  },

  // ------------------ jobs ------------------
  listJobs: () => [...state.jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  enqueueJob(job: Omit<Job, "id" | "status" | "attempts" | "createdAt" | "log">) {
    const j: Job = {
      ...job,
      id: `j_${Math.random().toString(36).slice(2, 9)}`,
      status: "queued",
      attempts: 0,
      createdAt: new Date().toISOString(),
      log: [],
    };
    state.jobs.unshift(j);
    persist();
    return j;
  },
  updateJob(id: string, patch: Partial<Job>) {
    state.jobs = state.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));
    persist();
  },
};

import { useEffect, useState } from "react";

export function useStore<T>(selector: (s: State) => T): T {
  const [value, setValue] = useState(() => selector(store.getState()));
  useEffect(() => {
    return store.subscribe(() => setValue(selector(store.getState())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
