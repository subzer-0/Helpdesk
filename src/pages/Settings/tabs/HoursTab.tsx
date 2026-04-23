import { Field } from "../shared/Field";
import { Header } from "../shared/Header";
import type { TabProps } from "../shared/types";

export function HoursTab({ draft, set }: TabProps) {
  return (
    <div className="space-y-4">
      <Header
        title="Business hours"
        sub="Used for auto-responses outside hours and first-response-time metrics."
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start">
          <input
            type="time"
            className="input"
            value={draft.businessHoursStart}
            onChange={(e) => set("businessHoursStart", e.target.value)}
          />
        </Field>
        <Field label="End">
          <input
            type="time"
            className="input"
            value={draft.businessHoursEnd}
            onChange={(e) => set("businessHoursEnd", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
