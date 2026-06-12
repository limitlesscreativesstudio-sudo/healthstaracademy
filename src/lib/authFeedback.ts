import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type AuthEventType =
  | "login_success"
  | "denied_route"
  | "password_reset_requested"
  | "password_reset_completed"
  | "logout";

export type RequiredRole = "auth" | "instructor" | "admin";

const ROLE_DENY_MESSAGES: Record<RequiredRole, string> = {
  auth: "You must be signed in to access that page.",
  instructor: "Instructor access required.",
  admin: "Admin access required.",
};

export const deniedMessage = (require: RequiredRole) => ROLE_DENY_MESSAGES[require];

/** Show a consistent error toast for denied access. */
export const showDeniedToast = (require: RequiredRole) => {
  toast.error(deniedMessage(require));
};

/** Standard success toast. */
export const showAuthSuccess = (msg: string) => toast.success(msg);

/** Standard error toast with optional underlying error. */
export const showAuthError = (msg: string, err?: { message?: string } | null) => {
  toast.error(err?.message ? `${msg}: ${err.message}` : msg);
};

interface LogEventArgs {
  eventType: AuthEventType;
  userId?: string | null;
  email?: string | null;
  path?: string | null;
  requiredRole?: string | null;
  userRole?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Record an auth event to the audit log. Best-effort: failures are swallowed
 * so they never block UX. RLS allows authenticated users to insert their own
 * row; anonymous denied attempts will silently no-op (which is intended —
 * unauth visitors get redirected to /portal/login).
 */
export const logAuthEvent = async ({
  eventType,
  userId,
  email,
  path,
  requiredRole,
  userRole,
  metadata,
}: LogEventArgs) => {
  try {
    await supabase.from("auth_audit_log").insert({
      user_id: userId ?? null,
      email: email ?? null,
      event_type: eventType,
      path: path ?? null,
      required_role: requiredRole ?? null,
      user_role: userRole ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    console.debug("[authFeedback] audit log failed", err);
  }
};
