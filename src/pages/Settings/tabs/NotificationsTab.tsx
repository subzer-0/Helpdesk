import { Header } from "../shared/Header";
import { Toggle } from "../shared/Toggle";
import type { TabProps } from "../shared/types";

export function NotificationsTab({ draft, set }: TabProps) {
  return (
    <div className="space-y-4">
      <Header title="Notifications" sub="When to ping agents about activity." />
      <Toggle
        label="New ticket opened"
        sub="Notify all on-duty agents when a ticket is created."
        checked={draft.notifyOnNewTicket}
        onChange={(v) => set("notifyOnNewTicket", v)}
      />
      <Toggle
        label="Urgent ticket flagged"
        sub="Page the whole team when priority is set to urgent."
        checked={draft.notifyOnUrgent}
        onChange={(v) => set("notifyOnUrgent", v)}
      />
    </div>
  );
}
