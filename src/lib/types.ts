export type Role = "admin" | "agent" | "customer";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // mock — never do this in real life
  role: Role;
  avatarColor: string;
  createdAt: string;
};

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
  | "billing"
  | "technical"
  | "account"
  | "feature_request"
  | "bug"
  | "general";

export type Message = {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: Role | "ai" | "system";
  body: string;
  createdAt: string;
  channel: "web" | "email" | "ai";
  internal?: boolean;
};

export type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  customerId: string;
  customerName: string;
  customerEmail: string;
  assigneeId: string | null;
  assigneeName: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  aiSummary?: string;
  aiConfidence?: number;
  source: "web" | "email";
  satisfactionScore?: number | null;
};

export type Email = {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: string;
  direction: "inbound" | "outbound";
  ticketId?: string;
  status: "received" | "ingested" | "sent" | "failed";
};

export type Settings = {
  orgName: string;
  supportEmail: string;
  fromName: string;
  emailProvider: "resend" | "postmark" | "sendgrid" | "mailgun" | "smtp";
  emailApiKey: string;
  inboundDomain: string;
  aiEnabled: boolean;
  aiAutoResolveEnabled: boolean;
  aiAutoResolveThreshold: number; // 0..1
  aiDefaultTone: "friendly" | "formal" | "empathetic";
  notifyOnNewTicket: boolean;
  notifyOnUrgent: boolean;
  businessHoursStart: string; // "09:00"
  businessHoursEnd: string; // "17:00"
  timezone: string;
  replySignature: string;
  autoAckEnabled: boolean;
  autoAckSubject: string;
  autoAckBody: string;
  outOfHoursEnabled: boolean;
  outOfHoursBody: string;
  resolvedFollowUpEnabled: boolean;
  resolvedFollowUpBody: string;
  aiReplyEnabled: boolean;
  aiReplyInstructions: string;
};

export type Job = {
  id: string;
  type:
    | "classify_ticket"
    | "summarize_ticket"
    | "auto_resolve"
    | "send_email"
    | "ingest_email"
    | "polish_reply";
  payload: Record<string, unknown>;
  status: "queued" | "running" | "succeeded" | "failed";
  attempts: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  log: string[];
};
