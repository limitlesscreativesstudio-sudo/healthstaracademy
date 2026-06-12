import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";

type Require = "auth" | "instructor" | "admin";

interface Props {
  children: ReactNode;
  require?: Require;
  /** Where to send unauthorised but logged-in users. Defaults to /portal (student home). */
  fallback?: string;
}

/**
 * Route guard for the student / instructor portal.
 *
 *  - require="auth"        → any logged-in user
 *  - require="instructor"  → instructor OR admin only
 *  - require="admin"       → admin only
 *
 * Unauthenticated visitors are bounced to /portal/login (handled by
 * usePortalAuth). Authenticated visitors with the wrong role are sent
 * to the `fallback` route with a friendly toast.
 */
const RoleGuard = ({ children, require = "auth", fallback = "/portal" }: Props) => {
  const { user, loading, isInstructor, isAdmin } = usePortalAuth(true);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) return null; // usePortalAuth already redirects to /portal/login

  const allowed =
    require === "auth" ||
    (require === "instructor" && isInstructor) ||
    (require === "admin" && isAdmin);

  if (!allowed) {
    // Send students hitting /portal/teach back to their dashboard; send
    // anyone hitting an admin-only screen back to the portal home.
    return <Navigate to={fallback} replace state={{ from: location.pathname, denied: true }} />;
  }

  return <>{children}</>;
};

export default RoleGuard;
