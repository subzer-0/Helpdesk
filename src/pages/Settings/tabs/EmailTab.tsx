import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field } from "../shared/Field";
import { Header } from "../shared/Header";
import type { TabProps } from "../shared/types";
import type { Settings } from "../../../lib/types";

export function EmailTab({ draft, set }: TabProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-4">
      <Header
        title="Support channel"
        sub="All inbound messages (forms + email) become tickets in one queue. Public staff replies are sent from this support channel."
      />
      <Field label="Support email (shown to customers)">
        <input className="input" value={draft.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
      </Field>
      <Field label="Inbound domain">
        <input className="input" value={draft.inboundDomain} onChange={(e) => set("inboundDomain", e.target.value)} />
        <p className="mt-1 text-xs text-slate-500">
          Configure MX/webhook routing so customer replies are attached to the correct ticket thread.
        </p>
      </Field>
      <Field label="Provider">
        <select
          className="input"
          value={draft.emailProvider}
          onChange={(e) => set("emailProvider", e.target.value as Settings["emailProvider"])}
        >
          <option value="resend">Resend</option>
          <option value="postmark">Postmark</option>
          <option value="sendgrid">SendGrid</option>
          <option value="mailgun">Mailgun</option>
          <option value="smtp">Custom SMTP</option>
        </select>
      </Field>
      <Field label="API key">
        <div className="relative">
          <input
            className="input pr-10"
            type={showKey ? "text" : "password"}
            value={draft.emailApiKey}
            onChange={(e) => set("emailApiKey", e.target.value)}
            placeholder="re_xxx, psk_xxx, SG.xxx …"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Store real keys as server-side secrets and never expose them in browser state.
        </p>
      </Field>
    </div>
  );
}
