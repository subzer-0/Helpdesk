import { initials } from "../lib/format";

export function Avatar({ name, color, size = 32 }: { name: string; color?: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color ?? "#64748b", fontSize: size * 0.4 }}
      title={name}
    >
      {initials(name) || "?"}
    </div>
  );
}
