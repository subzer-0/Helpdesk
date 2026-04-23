import { ArrowRight, Mail, Sparkles, Bot, UserCheck, Wand2, Send, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    icon: Mail,
    title: "1. Inbound",
    body: "Customer sends an email or opens a ticket on the web. The email integration ingests it and creates a ticket record with `source = email`.",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  },
  {
    icon: Sparkles,
    title: "2. AI classify",
    body: "A background job classifies the ticket: category, priority, and confidence. The AI writes a 1-paragraph summary so agents have instant context.",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200",
  },
  {
    icon: Bot,
    title: "3. Try AI auto-resolve",
    body: "If the ticket matches a known self-service pattern with high confidence, the AI replies directly and marks the ticket resolved.",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  {
    icon: UserCheck,
    title: "4. Route to agent",
    body: "If confidence is low, the ticket is auto-assigned to the next available agent. An internal note explains why the AI handed off.",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  },
  {
    icon: Wand2,
    title: "5. Agent drafts → AI polish",
    body: "The agent writes a quick reply. AI polish rewrites it with the right tone (friendly / formal / empathetic) before it's sent.",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200",
  },
  {
    icon: Send,
    title: "6. Send & log",
    body: "Reply goes back via email (for email tickets) or via the web. The send is processed by the background job queue with retries.",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  },
  {
    icon: CheckCircle2,
    title: "7. Resolve & measure",
    body: "Ticket is marked resolved/closed. Customer satisfaction is captured and rolls into dashboard metrics.",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
];

export default function Workflow() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workflow</h1>
        <p className="text-sm text-slate-500">
          End-to-end lifecycle of a ticket through HelpDesk — from inbound email to AI auto-resolve or agent reply.
        </p>
      </div>

      <div className="card p-6">
        <ol className="grid gap-4 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div className="min-w-0">
                <div className="font-medium">{s.title}</div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight
                  size={18}
                  className="absolute -bottom-3 right-3 hidden text-slate-300 md:block dark:text-slate-700"
                />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-semibold">Triggers</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>• New inbound email → enqueue <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">ingest_email</code></li>
            <li>• New ticket created → enqueue <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">classify_ticket</code> + <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">summarize_ticket</code></li>
            <li>• Classify confidence high & matches KB → enqueue <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">auto_resolve</code></li>
            <li>• Agent sends reply on email ticket → enqueue <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">send_email</code></li>
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold">Roles</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>• <span className="font-medium">Admin</span> — manage users, see everything, delete records</li>
            <li>• <span className="font-medium">Agent</span> — handle tickets, use AI tools, reply to customers</li>
            <li>• <span className="font-medium">Customer</span> — open & reply to their own tickets only</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
