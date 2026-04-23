import type { Settings } from "../../../lib/types";
import { renderTemplate, sampleVars } from "./tokens";

export function TemplatePreview({ template, settings }: { template: string; settings: Settings }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-1 text-xs font-medium text-slate-500">Preview</div>
      <pre className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-200">
        {renderTemplate(template, sampleVars(settings)) || (
          <span className="italic text-slate-400">(empty)</span>
        )}
      </pre>
    </div>
  );
}
