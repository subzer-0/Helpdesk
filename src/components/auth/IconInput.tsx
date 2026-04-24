import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  trailing?: ReactNode;
}

export const IconInput = forwardRef<HTMLInputElement, Props>(
  ({ icon: Icon, trailing, className = "", ...rest }, ref) => (
    <div className="relative">
      <Icon
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={ref}
        className={`input pl-10 ${trailing ? "pr-10" : ""} ${className}`.trim()}
        {...rest}
      />
      {trailing && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
      )}
    </div>
  ),
);

IconInput.displayName = "IconInput";
