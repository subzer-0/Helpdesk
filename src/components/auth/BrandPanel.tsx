import { Headphones, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Unified inbox",
    body: "Email, chat, and web tickets in one thread — nothing falls through the cracks.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted replies",
    body: "Drafts, summaries, and classification so your team spends time on the hard cases.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    body: "Admin and agent scopes — RBAC enforced server-side on every request.",
  },
];

export function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
          <Headphones size={20} />
        </div>
        <span className="text-lg font-semibold tracking-tight">HelpDesk</span>
      </div>

      <div className="relative max-w-lg">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight">
          The calm, modern support desk for teams that care.
        </h2>
        <p className="mt-4 text-brand-100/90">
          Resolve faster, write better, and keep every customer conversation in one place.
        </p>

        <ul className="mt-10 space-y-5">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                <f.icon size={18} />
              </div>
              <div>
                <p className="font-medium">{f.title}</p>
                <p className="text-sm text-brand-100/80">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-center justify-between text-xs text-brand-100/70">
        <span>&copy; {new Date().getFullYear()} HelpDesk, Inc.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
        </div>
      </div>
    </aside>
  );
}
