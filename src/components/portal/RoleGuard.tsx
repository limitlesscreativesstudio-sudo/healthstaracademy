import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { showDeniedToast, logAuthEvent, RequiredRole } from "@/lib/authFeedback";

interface Props {
  children: ReactNode;
  require?: RequiredRole;
  fallback?: string;
}

const RoleGuard = ({ children, require = "auth", fallback = "/portal" }: Props) => {
  const { user, loading, isInstructor, isAdmin, roles } = usePortalAuth(true);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (!user) return null; // usePortalAuth redirects to /portal/login

  const allowed =
    require === "auth" ||
    (require === "instructor" && isInstructor) ||
    (require === "admin" && isAdmin);

  if (!allowed) {
    return (
      <DeniedRedirect
        to={fallback}
        require={require}
        from={location.pathname}
        userId={user.id}
        email={user.email ?? null}
        userRole={roles.join(",") || null}
      />
    );
  }

  return <>{children}</>;
};

const DeniedRedirect = ({
  to, require, from, userId, email, userRole,
}: {
  to: string; require: RequiredRole; from: string;
  userId: string; email: string | null; userRole: string | null;
}) => {
  useEffect(() => {
    showDeniedToast(require);
    logAuthEvent({
      eventType: "denied_route",
      userId, email,
      path: from,
      requiredRole: require,
      userRole,
    });
  }, [require, from, userId, email, userRole]);
  return <Navigate to={to} replace state={{ from, denied: true }} />;
};

export default RoleGuard;
