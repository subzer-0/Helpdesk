import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Workflow as WorkflowIcon,
  Mail,
  Cpu,
  LogOut,
  Sun,
  Moon,
  Headphones,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./Badges";
import type { Role } from "../lib/types";

type NavItem = { to: string; label: string; icon: React.ElementType; roles?: Role[] };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/users", label: "Users", icon: Users, roles: ["admin"] },
  { to: "/workflow", label: "Workflow", icon: WorkflowIcon, roles: ["admin", "agent"] },
  { to: "/email", label: "Email", icon: Mail, roles: ["admin", "agent"] },
  { to: "/jobs", label: "Background jobs", icon: Cpu, roles: ["admin", "agent"] },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  const visible = NAV.filter((n) => !n.roles || (user && n.roles.includes(user.role)));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Headphones size={18} />
            </div>
            <span className="text-lg font-semibold tracking-tight">HelpDesk</span>
          </NavLink>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {visible.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button className="btn-ghost p-2" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {user && (
              <>
                <div className="hidden items-center gap-2 sm:flex">
                  <Avatar name={user.name} color={user.avatarColor} size={28} />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium">{user.name}</span>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    logout();
                    nav("/login");
                  }}
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-200 px-4 py-2 md:hidden dark:border-slate-800">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <item.icon size={14} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-[1400px] px-4 py-6 text-center text-xs text-slate-500">
        HelpDesk · AI-powered customer support · Demo build
      </footer>
    </div>
  );
}
