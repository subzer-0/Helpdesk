import { Field } from "../shared/Field";
import { Header } from "../shared/Header";
import { Toggle } from "../shared/Toggle";
import type { TabProps } from "../shared/types";

const TONES = ["friendly", "formal", "empathetic"] as const;

export function AiTab({ draft, set }: TabProps) {
  return (
    <div className="space-y-4">
      <Header title="AI features" sub="Control how the AI assists agents and resolves tickets." />
      <Toggle
        label="AI features enabled"
        sub="Summarize, classify, polish replies, and auto-resolve."
        checked={draft.aiEnabled}
        onChange={(v) => set("aiEnabled", v)}
      />
      <Toggle
        label="Auto-resolve common requests"
        sub="Let the AI reply directly when it matches a self-service pattern."
        checked={draft.aiAutoResolveEnabled && draft.aiEnabled}
        disabled={!draft.aiEnabled}
        onChange={(v) => set("aiAutoResolveEnabled", v)}
      />
      <Field label={`Auto-resolve confidence threshold — ${Math.round(draft.aiAutoResolveThreshold * 100)}%`}>
        <input
          type="range"
          min={0.5}
          max={0.99}
          step={0.01}
          value={draft.aiAutoResolveThreshold}
          onChange={(e) => set("aiAutoResolveThreshold", parseFloat(e.target.value))}
          disabled={!draft.aiEnabled || !draft.aiAutoResolveEnabled}
          className="w-full"
        />
        <p className="mt-1 text-xs text-slate-500">
          Tickets below this confidence get routed to an agent instead.
        </p>
      </Field>
      <Field label="Default reply tone">
        <div className="grid grid-cols-3 gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("aiDefaultTone", t)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                draft.aiDefaultTone === t
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}
