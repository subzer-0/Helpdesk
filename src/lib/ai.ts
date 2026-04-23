import type { Message, Ticket, TicketCategory, TicketPriority } from "./types";

// Mocked AI helpers — these simulate model calls with simple heuristics so the
// frontend behaves convincingly without a backend. Swap each function body
// with a real fetch() call to your model provider when wiring up the backend.

function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

const KEYWORDS: Record<TicketCategory, string[]> = {
  billing: ["refund", "charge", "invoice", "payment", "subscription", "cancel", "billing"],
  technical: ["api", "rate limit", "webhook", "sso", "okta", "saml", "integration"],
  account: ["login", "password", "session", "account", "2fa", "two-factor"],
  feature_request: ["feature", "would love", "wishlist", "suggestion"],
  bug: ["bug", "broken", "doesn't work", "doesn’t work", "error", "crash", "missing", "not loading"],
  general: [],
};

export async function classify(subject: string, body: string): Promise<{
  category: TicketCategory;
  priority: TicketPriority;
  confidence: number;
  rationale: string;
}> {
  const text = `${subject} ${body}`.toLowerCase();
  let best: { category: TicketCategory; score: number } = { category: "general", score: 0 };
  (Object.keys(KEYWORDS) as TicketCategory[]).forEach((cat) => {
    const score = KEYWORDS[cat].reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
    if (score > best.score) best = { category: cat, score };
  });
  let priority: TicketPriority = "medium";
  if (/urgent|asap|outage|down|production/i.test(text)) priority = "urgent";
  else if (/(can't|cannot|broken|blocking)/i.test(text)) priority = "high";
  else if (/(question|how do i|wondering)/i.test(text)) priority = "low";
  const confidence = Math.min(0.5 + best.score * 0.15, 0.97);
  return delay({
    category: best.category,
    priority,
    confidence,
    rationale: `Matched ${best.score} keyword(s) for ${best.category}; tone suggests ${priority} priority.`,
  });
}

export async function summarize(ticket: Ticket, messages: Message[]): Promise<string> {
  const customerMsgs = messages.filter((m) => m.authorRole === "customer");
  const agentMsgs = messages.filter((m) => m.authorRole === "agent");
  const lastCustomer = customerMsgs[customerMsgs.length - 1]?.body ?? "";
  const lastAgent = agentMsgs[agentMsgs.length - 1]?.body ?? "(no agent response yet)";
  const summary =
    `Customer ${ticket.customerName} reports: "${ticket.subject}". ` +
    `Most recent customer message: "${lastCustomer.slice(0, 140)}${lastCustomer.length > 140 ? "…" : ""}". ` +
    `Most recent agent reply: "${lastAgent.slice(0, 140)}${lastAgent.length > 140 ? "…" : ""}". ` +
    `Status: ${ticket.status}, priority: ${ticket.priority}, ${messages.length} message(s) total.`;
  return delay(summary, 900);
}

export async function polish(draft: string, options?: { tone?: "friendly" | "formal" | "empathetic" }): Promise<string> {
  const tone = options?.tone ?? "friendly";
  const trimmed = draft.trim();
  if (!trimmed) return delay("", 300);
  const opener =
    tone === "formal"
      ? "Thank you for reaching out. "
      : tone === "empathetic"
      ? "I'm really sorry for the trouble this has caused — "
      : "Thanks so much for writing in! ";
  const closer =
    tone === "formal"
      ? "\n\nKind regards,\nThe HelpDesk team"
      : tone === "empathetic"
      ? "\n\nWe're here for you,\nThe HelpDesk team"
      : "\n\nCheers,\nThe HelpDesk team";
  // tighten double spaces, capitalize first letter, ensure trailing punctuation
  let body = trimmed.replace(/\s+/g, " ");
  body = body.charAt(0).toUpperCase() + body.slice(1);
  if (!/[.!?]$/.test(body)) body += ".";
  return delay(`${opener}${body}${closer}`, 800);
}

const AUTO_REPLIES: Array<{ match: RegExp; reply: string }> = [
  {
    match: /password|login|session expired|can'?t log in/i,
    reply:
      "We've sent you a fresh password-reset link to your registered email. The link is valid for 30 minutes. If you don't see it, please check your spam folder.",
  },
  {
    match: /invite|teammate|add user/i,
    reply:
      "You can invite teammates from Settings → Team → Invite. Each invite sends an email with a sign-up link that expires in 7 days.",
  },
  {
    match: /update billing email|change billing/i,
    reply:
      "Your billing email has been updated. You'll receive future invoices at the new address starting with the next billing cycle.",
  },
  {
    match: /cancel (my )?subscription/i,
    reply:
      "Your subscription has been set to cancel at the end of the current billing period. You'll retain access until then.",
  },
  {
    match: /dark mode/i,
    reply:
      "Good news — dark mode is now available! Toggle it from the navigation bar at the top of the app.",
  },
];

export async function autoResolve(ticket: Ticket, lastCustomerMessage: string): Promise<{
  canResolve: boolean;
  reply?: string;
  confidence: number;
  reason: string;
}> {
  for (const rule of AUTO_REPLIES) {
    if (rule.match.test(`${ticket.subject} ${lastCustomerMessage}`)) {
      return delay(
        {
          canResolve: true,
          reply: rule.reply,
          confidence: 0.88,
          reason: "Matched a known self-service pattern in our knowledge base.",
        },
        900,
      );
    }
  }
  return delay(
    {
      canResolve: false,
      confidence: 0.42,
      reason: "Ticket does not match any high-confidence resolution pattern. Routing to a human agent.",
    },
    900,
  );
}
