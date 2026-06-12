import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
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
    return <DeniedRedirect to={fallback} require={require} from={location.pathname} />;
  }

  return <>{children}</>;
};

const DeniedRedirect = ({ to, require, from }: { to: string; require: Require; from: string }) => {
  useEffect(() => {
    const msg =
      require === "admin"
        ? "Admin access required."
        : require === "instructor"
          ? "Instructor access required."
          : "You do not have access to that page.";
    toast.error(msg);
  }, [require]);
  return <Navigate to={to} replace state={{ from, denied: true }} />;
};

export default RoleGuard;
