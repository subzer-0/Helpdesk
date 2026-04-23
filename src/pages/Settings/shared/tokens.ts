import type { Settings } from "../../../lib/types";

export const TOKENS: { token: string; desc: string }[] = [
  { token: "{{customer_name}}", desc: "Customer's display name" },
  { token: "{{customer_email}}", desc: "Customer's email address" },
  { token: "{{ticket_id}}", desc: "Ticket ID, e.g. t_1000" },
  { token: "{{ticket_subject}}", desc: "Ticket subject line" },
  { token: "{{agent_name}}", desc: "Name of the replying agent" },
  { token: "{{org_name}}", desc: "Your organization's name" },
  { token: "{{support_email}}", desc: "Your support address" },
];

export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

export function sampleVars(settings: Settings): Record<string, string> {
  return {
    customer_name: "Maya Patel",
    customer_email: "maya@example.com",
    ticket_id: "t_1000",
    ticket_subject: "Cannot log in to my account",
    agent_name: "Sam Carter",
    org_name: settings.orgName,
    support_email: settings.supportEmail,
  };
}
