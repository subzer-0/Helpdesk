const DEMO = [
  { label: "Admin", email: "admin@helpdesk.io", password: "admin123" },
  { label: "Agent", email: "sam@helpdesk.io", password: "agent123" },
];

interface Props {
  onSelect: (email: string, password: string) => void;
}

export function DemoAccountsCard({ onSelect }: Props) {
  return (
    <div className="card p-4">
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Staff demo accounts — click to pre-fill credentials.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {DEMO.map((d) => (
          <button
            key={d.email}
            type="button"
            className="btn-secondary justify-center"
            onClick={() => onSelect(d.email, d.password)}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
