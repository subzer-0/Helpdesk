import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../lib/auth";
import type { Role } from "../lib/types";

export function Protected({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // Only staff roles (admin, agent) can reach protected routes.
  if (user.role !== "admin" && user.role !== "agent") {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
