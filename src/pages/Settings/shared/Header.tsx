export function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}
