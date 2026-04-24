import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { IconInput } from "./IconInput";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput(props: Props) {
  const [show, setShow] = useState(false);
  return (
    <IconInput
      {...props}
      type={show ? "text" : "password"}
      icon={Lock}
      trailing={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}
