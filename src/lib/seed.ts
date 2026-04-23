import type { Email, Job, Message, Ticket, User } from "./types";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
const pickColor = (i: number) => COLORS[i % COLORS.length];

const now = Date.now();
const days = (n: number) => new Date(now - n * 86400000).toISOString();
const hours = (n: number) => new Date(now - n * 3600000).toISOString();
const minutes = (n: number) => new Date(now - n * 60000).toISOString();

export const seedUsers: User[] = [
  {
    id: "u_admin",
    name: "Avery Admin",
    email: "admin@helpdesk.io",
    password: "admin123",
    role: "admin",
    avatarColor: pickColor(0),
    createdAt: days(120),
  },
  {
    id: "u_agent_1",
    name: "Sam Carter",
    email: "sam@helpdesk.io",
    password: "agent123",
    role: "agent",
    avatarColor: pickColor(1),
    createdAt: days(90),
  },
  {
    id: "u_agent_2",
    name: "Riley Park",
    email: "riley@helpdesk.io",
    password: "agent123",
    role: "agent",
    avatarColor: pickColor(2),
    createdAt: days(80),
  },
  {
    id: "u_agent_3",
    name: "Jordan Lee",
    email: "jordan@helpdesk.io",
    password: "agent123",
    role: "agent",
    avatarColor: pickColor(3),
    createdAt: days(70),
  },
  {
    id: "u_cust_1",
    name: "Maya Patel",
    email: "maya@example.com",
    password: "customer123",
    role: "customer",
    avatarColor: pickColor(4),
    createdAt: days(60),
  },
  {
    id: "u_cust_2",
    name: "Diego Alvarez",
    email: "diego@example.com",
    password: "customer123",
    role: "customer",
    avatarColor: pickColor(5),
    createdAt: days(40),
  },
  {
    id: "u_cust_3",
    name: "Wei Chen",
    email: "wei@example.com",
    password: "customer123",
    role: "customer",
    avatarColor: pickColor(6),
    createdAt: days(20),
  },
  {
    id: "u_cust_4",
    name: "Nora Iqbal",
    email: "nora@example.com",
    password: "customer123",
    role: "customer",
    avatarColor: pickColor(7),
    createdAt: days(10),
  },
];

const ticketTemplates: Array<{
  subject: string;
  category: Ticket["category"];
  priority: Ticket["priority"];
  status: Ticket["status"];
  body: string;
  source: Ticket["source"];
  tags: string[];
}> = [
  {
    subject: "Cannot log in to my account",
    category: "account",
    priority: "high",
    status: "open",
    body: "Hi — every time I try to log in, I get a 'session expired' message. I tried resetting my password twice. Help!",
    source: "email",
    tags: ["login", "auth"],
  },
  {
    subject: "Refund for duplicate charge on April 14",
    category: "billing",
    priority: "high",
    status: "pending",
    body: "I was charged twice for the Pro plan on April 14. Please refund the duplicate.",
    source: "web",
    tags: ["billing", "refund"],
  },
  {
    subject: "Export to CSV is missing columns",
    category: "bug",
    priority: "medium",
    status: "open",
    body: "When I export my report, the 'created_at' and 'owner' columns are missing.",
    source: "web",
    tags: ["export", "report"],
  },
  {
    subject: "Feature request: dark mode",
    category: "feature_request",
    priority: "low",
    status: "open",
    body: "Would love a dark mode for the dashboard. Late nights, you know.",
    source: "web",
    tags: ["ui"],
  },
  {
    subject: "How do I invite teammates?",
    category: "general",
    priority: "low",
    status: "resolved",
    body: "Can someone walk me through inviting my team?",
    source: "email",
    tags: ["onboarding"],
  },
  {
    subject: "API rate limit too low for our use case",
    category: "technical",
    priority: "urgent",
    status: "open",
    body: "We're hitting 429s constantly. We need at least 1000 req/min on our enterprise plan.",
    source: "email",
    tags: ["api", "limits"],
  },
  {
    subject: "Webhook not firing on payment.success",
    category: "technical",
    priority: "high",
    status: "pending",
    body: "Our webhook endpoint isn't receiving payment.success events. Other events come through fine.",
    source: "web",
    tags: ["webhook", "payments"],
  },
  {
    subject: "Update billing email",
    category: "billing",
    priority: "low",
    status: "resolved",
    body: "Please change our billing contact to finance@acme.com.",
    source: "email",
    tags: ["billing"],
  },
  {
    subject: "Two-factor auth not working on iOS",
    category: "bug",
    priority: "high",
    status: "open",
    body: "The 2FA prompt won't accept any code on the iOS app — works fine on web.",
    source: "web",
    tags: ["mobile", "2fa"],
  },
  {
    subject: "Cancel subscription",
    category: "billing",
    priority: "medium",
    status: "closed",
    body: "Please cancel my subscription effective end of month.",
    source: "email",
    tags: ["billing", "churn"],
  },
  {
    subject: "Question about SSO setup with Okta",
    category: "technical",
    priority: "medium",
    status: "open",
    body: "We're trying to enable SSO via Okta. Where do I find the SAML metadata URL?",
    source: "email",
    tags: ["sso", "okta"],
  },
  {
    subject: "Dashboard graph not loading",
    category: "bug",
    priority: "medium",
    status: "open",
    body: "The analytics chart spins forever and never loads. Tried Chrome and Firefox.",
    source: "web",
    tags: ["analytics", "ui"],
  },
];

export function seedTickets(): { tickets: Ticket[]; messages: Message[] } {
  const customers = seedUsers.filter((u) => u.role === "customer");
  const agents = seedUsers.filter((u) => u.role === "agent");
  const tickets: Ticket[] = [];
  const messages: Message[] = [];

  ticketTemplates.forEach((t, i) => {
    const customer = customers[i % customers.length];
    const assignee = i % 3 === 0 ? null : agents[i % agents.length];
    const created = days(15 - i);
    const updated = hours(36 - i * 2);
    const id = `t_${1000 + i}`;
    tickets.push({
      id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      category: t.category,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      assigneeId: assignee?.id ?? null,
      assigneeName: assignee?.name ?? null,
      tags: t.tags,
      createdAt: created,
      updatedAt: updated,
      source: t.source,
      satisfactionScore: t.status === "resolved" || t.status === "closed" ? (i % 3 === 0 ? 4 : 5) : null,
    });
    messages.push({
      id: `m_${id}_1`,
      ticketId: id,
      authorId: customer.id,
      authorName: customer.name,
      authorRole: "customer",
      body: t.body,
      createdAt: created,
      channel: t.source,
    });
    if (assignee) {
      messages.push({
        id: `m_${id}_2`,
        ticketId: id,
        authorId: assignee.id,
        authorName: assignee.name,
        authorRole: "agent",
        body: `Hi ${customer.name.split(" ")[0]}, thanks for reaching out — taking a look now.`,
        createdAt: hours(40 - i * 2),
        channel: "web",
      });
    }
  });

  // Spread some additional tickets across the past 14 days for the chart
  for (let i = 0; i < 22; i++) {
    const t = ticketTemplates[i % ticketTemplates.length];
    const customer = customers[i % customers.length];
    const assignee = agents[i % agents.length];
    const created = days(Math.floor(Math.random() * 14));
    const id = `t_${2000 + i}`;
    const status: Ticket["status"] = (["open", "pending", "resolved", "closed"] as const)[i % 4];
    tickets.push({
      id,
      subject: t.subject,
      status,
      priority: t.priority,
      category: t.category,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      tags: t.tags,
      createdAt: created,
      updatedAt: created,
      source: t.source,
      satisfactionScore: status === "resolved" || status === "closed" ? (i % 4 === 0 ? 3 : 5) : null,
    });
    messages.push({
      id: `m_${id}_1`,
      ticketId: id,
      authorId: customer.id,
      authorName: customer.name,
      authorRole: "customer",
      body: t.body,
      createdAt: created,
      channel: t.source,
    });
  }

  return { tickets, messages };
}

export const seedEmails: Email[] = [
  {
    id: "e_1",
    from: "maya@example.com",
    to: "support@helpdesk.io",
    subject: "Cannot log in to my account",
    body: "Hi — every time I try to log in, I get a 'session expired' message.",
    receivedAt: hours(4),
    direction: "inbound",
    ticketId: "t_1000",
    status: "ingested",
  },
  {
    id: "e_2",
    from: "diego@example.com",
    to: "support@helpdesk.io",
    subject: "Refund for duplicate charge",
    body: "I was charged twice on April 14.",
    receivedAt: hours(20),
    direction: "inbound",
    ticketId: "t_1001",
    status: "ingested",
  },
  {
    id: "e_3",
    from: "support@helpdesk.io",
    to: "maya@example.com",
    subject: "Re: Cannot log in to my account",
    body: "Hi Maya — we've reset your session and sent you a recovery link.",
    receivedAt: minutes(30),
    direction: "outbound",
    ticketId: "t_1000",
    status: "sent",
  },
];

export const seedJobs: Job[] = [
  {
    id: "j_1",
    type: "classify_ticket",
    payload: { ticketId: "t_1000" },
    status: "succeeded",
    attempts: 1,
    createdAt: hours(4),
    startedAt: hours(4),
    finishedAt: hours(4),
    log: ["classified as account/login with 0.92 confidence"],
  },
  {
    id: "j_2",
    type: "summarize_ticket",
    payload: { ticketId: "t_1001" },
    status: "succeeded",
    attempts: 1,
    createdAt: hours(20),
    startedAt: hours(20),
    finishedAt: hours(20),
    log: ["summary generated"],
  },
  {
    id: "j_3",
    type: "send_email",
    payload: { to: "maya@example.com", ticketId: "t_1000" },
    status: "succeeded",
    attempts: 1,
    createdAt: minutes(30),
    startedAt: minutes(30),
    finishedAt: minutes(30),
    log: ["sent via SMTP"],
  },
  {
    id: "j_4",
    type: "auto_resolve",
    payload: { ticketId: "t_1004" },
    status: "queued",
    attempts: 0,
    createdAt: minutes(2),
    log: [],
  },
];
