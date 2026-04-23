export function Toggle({
  label,
  sub,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800 ${
        disabled ? "opacity-60" : "cursor-pointer"
      }`}
    >
      <div>
        <div className="text-sm font-medium">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
