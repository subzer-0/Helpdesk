import { Field } from "../shared/Field";
import { Header } from "../shared/Header";
import { Toggle } from "../shared/Toggle";
import { TemplatePreview } from "../shared/TemplatePreview";
import { TOKENS } from "../shared/tokens";
import type { TabProps } from "../shared/types";
import { AiReplyMock } from "./AiReplyMock";

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">{children}</div>
  );
}

function TokenReference() {
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800">
      <div className="mb-2 font-medium text-slate-600 dark:text-slate-300">Available tokens</div>
      <div className="grid gap-1 sm:grid-cols-2">
        {TOKENS.map((t) => (
          <div key={t.token} className="flex items-center gap-2">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] dark:bg-slate-800">
              {t.token}
            </code>
            <span className="text-slate-500">{t.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResponsesTab({ draft, set }: TabProps) {
  return (
    <div className="space-y-6">
      <Header
        title="Response templates"
        sub="Templates used across all tickets. Customer-facing replies are delivered from your support email address."
      />

      <TokenReference />

      <Section>
        <div>
          <div className="text-sm font-medium">Reply signature</div>
          <p className="mt-0.5 text-xs text-slate-500">Appended to every public agent/AI reply sent to customers.</p>
        </div>
        <textarea
          className="input min-h-[90px] font-mono text-xs"
          value={draft.replySignature}
          onChange={(e) => set("replySignature", e.target.value)}
        />
        <TemplatePreview template={draft.replySignature} settings={draft} />
      </Section>

      <Section>
        <Toggle
          label="Auto-acknowledgement on new ticket"
          sub="Instantly confirm we received the ticket, regardless of intake source."
          checked={draft.autoAckEnabled}
          onChange={(v) => set("autoAckEnabled", v)}
        />
        <Field label="Auto-ack subject">
          <input
            className="input"
            value={draft.autoAckSubject}
            onChange={(e) => set("autoAckSubject", e.target.value)}
            disabled={!draft.autoAckEnabled}
          />
        </Field>
        <Field label="Auto-ack body">
          <textarea
            className="input min-h-[140px] font-mono text-xs"
            value={draft.autoAckBody}
            onChange={(e) => set("autoAckBody", e.target.value)}
            disabled={!draft.autoAckEnabled}
          />
        </Field>
        <TemplatePreview template={draft.autoAckBody} settings={draft} />
      </Section>

      <Section>
        <Toggle
          label="Out-of-hours auto-reply"
          sub="Send a courtesy reply when a ticket arrives outside business hours."
          checked={draft.outOfHoursEnabled}
          onChange={(v) => set("outOfHoursEnabled", v)}
        />
        <p className="text-xs text-slate-500">
          Uses the window set in Business hours ({draft.businessHoursStart}–{draft.businessHoursEnd}).
        </p>
        <Field label="Out-of-hours body">
          <textarea
            className="input min-h-[120px] font-mono text-xs"
            value={draft.outOfHoursBody}
            onChange={(e) => set("outOfHoursBody", e.target.value)}
            disabled={!draft.outOfHoursEnabled}
          />
        </Field>
        <TemplatePreview template={draft.outOfHoursBody} settings={draft} />
      </Section>

      <Section>
        <Toggle
          label="Follow-up on resolved tickets"
          sub="Send a short message when a ticket is marked resolved."
          checked={draft.resolvedFollowUpEnabled}
          onChange={(v) => set("resolvedFollowUpEnabled", v)}
        />
        <Field label="Resolved follow-up body">
          <textarea
            className="input min-h-[120px] font-mono text-xs"
            value={draft.resolvedFollowUpBody}
            onChange={(e) => set("resolvedFollowUpBody", e.target.value)}
            disabled={!draft.resolvedFollowUpEnabled}
          />
        </Field>
        <TemplatePreview template={draft.resolvedFollowUpBody} settings={draft} />
      </Section>

      <Section>
        <Toggle
          label="AI-drafted reply"
          sub="Let AI draft first responses. Agents can review and send, or auto-send when confidence exceeds your threshold."
          checked={draft.aiReplyEnabled}
          onChange={(v) => set("aiReplyEnabled", v)}
        />
        <Field label="Instructions to the AI (system prompt)">
          <textarea
            className="input min-h-[120px] font-mono text-xs"
            value={draft.aiReplyInstructions}
            onChange={(e) => set("aiReplyInstructions", e.target.value)}
            disabled={!draft.aiReplyEnabled}
            placeholder="Describe the voice, guardrails, and escalation rules for the AI…"
          />
        </Field>
        <AiReplyMock settings={draft} />
      </Section>
    </div>
  );
}
