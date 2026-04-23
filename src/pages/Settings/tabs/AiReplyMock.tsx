import { useState } from "react";
import { Bot, Sparkles, Wand2 } from "lucide-react";
import type { Settings } from "../../../lib/types";
import { renderTemplate } from "../shared/tokens";

type Sample = { subject: string; body: string; customer: string; reply: string };

const SAMPLE_TICKETS: Sample[] = [
  {
    subject: "Cannot log in to my account",
    body: "Every time I try to log in I get a 'session expired' error. I've reset my password twice already.",
    customer: "Maya",
    reply:
      "I've cleared the stuck session on your account and sent you a fresh password-reset link — it's valid for 30 minutes. Please try logging in after resetting, and let me know if the issue comes back. If it does, I'll dig into the auth logs on my side and get this sorted.",
  },
  {
    subject: "Refund for duplicate charge on April 14",
    body: "I was charged twice for the Pro plan on April 14. Please refund the duplicate.",
    customer: "Diego",
    reply:
      "Thanks for flagging this — I can see both charges on April 14 for the Pro plan. I've refunded the duplicate just now; you should see it back on your card within 3–5 business days depending on your bank. I've also added a note to your account to make sure this doesn't happen again.",
  },
  {
    subject: "How do I invite teammates?",
    body: "Quick question — how do I invite a teammate to my workspace?",
    customer: "Wei",
    reply:
      "Great question! You can invite teammates from Settings → Team → Invite. Drop in their email, choose a role (Admin or Agent), and we'll send them a sign-up link that's valid for 7 days. Let me know if they don't receive it and I'll re-send from my side.",
  },
];

export function AiReplyMock({ settings }: { settings: Settings }) {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const sample = SAMPLE_TICKETS[sampleIdx];

  function generate() {
    if (!settings.aiReplyEnabled) return;
    setGenerating(true);
    setOutput(null);
    setTimeout(() => {
      const openerByTone = {
        friendly: `Hi ${sample.customer}! `,
        formal: `Hello ${sample.customer}, `,
        empathetic: `Hi ${sample.customer} — I'm sorry for the trouble. `,
      };
      const opener = openerByTone[settings.aiDefaultTone];
      const signature = renderTemplate(settings.replySignature, {
        customer_name: sample.customer,
        customer_email: "maya@example.com",
        ticket_id: "t_1000",
        ticket_subject: sample.subject,
        agent_name: "HelpDesk AI",
        org_name: settings.orgName,
        support_email: settings.supportEmail,
      });
      setConfidence(0.6 + Math.random() * 0.35);
      setOutput(`${opener}${sample.reply}\n\n${signature}`);
      setGenerating(false);
    }, 900);
  }

  const willAutoSend =
    confidence !== null &&
    settings.aiReplyEnabled &&
    settings.aiAutoResolveEnabled &&
    confidence >= settings.aiAutoResolveThreshold;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-500/30 dark:bg-purple-500/5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
            <Bot size={10} /> AI reply mock
          </span>
          <span className="text-xs text-slate-500">
            Simulated output — wire this to your model provider in{" "}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">src/lib/ai.ts</code>.
          </span>
        </div>

        <div className="mb-2">
          <label className="label">Sample inbound ticket</label>
          <select
            className="input"
            value={sampleIdx}
            onChange={(e) => {
              setSampleIdx(Number(e.target.value));
              setOutput(null);
              setConfidence(null);
            }}
          >
            {SAMPLE_TICKETS.map((s, i) => (
              <option key={i} value={i}>
                {s.subject}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-1 font-medium text-slate-500">From {sample.customer}:</div>
          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{sample.body}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={generate}
            disabled={!settings.aiReplyEnabled || generating}
          >
            <Wand2 size={14} /> {generating ? "Drafting…" : "Generate sample reply"}
          </button>
          {output && confidence !== null && (
            <>
              <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                {(confidence * 100).toFixed(0)}% confidence
              </span>
              <span
                className={`badge ${
                  willAutoSend
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
                }`}
              >
                {willAutoSend ? "Will auto-send" : "Agent will review first"}
              </span>
            </>
          )}
        </div>

        {output && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-200">
              <Sparkles size={12} /> AI draft
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
