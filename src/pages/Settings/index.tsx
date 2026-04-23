import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  Clock,
  Mail,
  MessageSquareReply,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { store, useStore } from "../../lib/store";
import type { Settings } from "../../lib/types";
import type { TabId } from "./shared/types";
import { OrganizationTab } from "./tabs/OrganizationTab";
import { EmailTab } from "./tabs/EmailTab";
import { ResponsesTab } from "./tabs/ResponsesTab";
import { AiTab } from "./tabs/AiTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { HoursTab } from "./tabs/HoursTab";
import { DangerTab } from "./tabs/DangerTab";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "org", label: "Organization", icon: Building2 },
  { id: "email", label: "Email", icon: Mail },
  { id: "responses", label: "Email responses", icon: MessageSquareReply },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "hours", label: "Business hours", icon: Clock },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
];

export default function SettingsPage() {
  const saved = useStore((s) => s.settings);
  const [draft, setDraft] = useState<Settings>(saved);
  const [tab, setTab] = useState<TabId>("org");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setDraft(saved), [saved]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function save() {
    store.updateSettings(draft);
    setToast("Settings saved.");
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500">Manage how HelpDesk is configured for your team.</p>
        </div>
        <div className="flex items-center gap-2">
          {toast && (
            <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
              {toast}
            </span>
          )}
          <button className="btn-ghost" onClick={() => setDraft(saved)} disabled={!dirty}>
            <RotateCcw size={14} /> Revert
          </button>
          <button className="btn-primary" onClick={save} disabled={!dirty}>
            <Save size={14} /> Save changes
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="card p-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                tab === t.id
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </aside>

        <section className="card p-6">
          {tab === "org" && <OrganizationTab draft={draft} set={set} />}
          {tab === "email" && <EmailTab draft={draft} set={set} />}
          {tab === "responses" && <ResponsesTab draft={draft} set={set} />}
          {tab === "ai" && <AiTab draft={draft} set={set} />}
          {tab === "notifications" && <NotificationsTab draft={draft} set={set} />}
          {tab === "hours" && <HoursTab draft={draft} set={set} />}
          {tab === "danger" && <DangerTab />}
        </section>
      </div>
    </div>
  );
}
