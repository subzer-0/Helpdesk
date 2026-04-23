import { Field } from "../shared/Field";
import { Header } from "../shared/Header";
import type { TabProps } from "../shared/types";

export function OrganizationTab({ draft, set }: TabProps) {
  return (
    <div className="space-y-4">
      <Header title="Organization" sub="Basic branding shown to customers and teammates." />
      <Field label="Organization name">
        <input className="input" value={draft.orgName} onChange={(e) => set("orgName", e.target.value)} />
      </Field>
      <Field label="From name (on outgoing mail)">
        <input className="input" value={draft.fromName} onChange={(e) => set("fromName", e.target.value)} />
      </Field>
      <Field label="Timezone">
        <input className="input" value={draft.timezone} onChange={(e) => set("timezone", e.target.value)} />
      </Field>
    </div>
  );
}
