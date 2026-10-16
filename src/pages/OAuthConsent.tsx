import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

const scopeLabel = (s: string) =>
  s === "openid" ? "Confirm your identity" : s === "email" ? "Share your email address" : s === "profile" ? "Share your basic profile" : `Additional permission requested: ${s}`;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("This connection link is missing or invalid.");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/portal/teach/login?redirect=" + encodeURIComponent(next);
        return;
      }
      setEmail(sess.session.user.email ?? "");
      try {
        const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) return setError(error.message);
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) { window.location.href = immediate; return; }
        setDetails(data);
      } catch (e: any) {
        if (active) setError(e?.message ?? "This connection request has expired.");
      }
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth().approveAuthorization(authorizationId)
        : await oauth().denyAuthorization(authorizationId);
      if (error) throw new Error(error.message);
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) throw new Error("No redirect was returned.");
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(`${approve ? "Approval" : "Cancelling"} failed: ${e?.message ?? e}`);
    }
  }

  const client = details?.client?.name ?? "An app";
  const scopes: string[] = String(details?.scope ?? details?.scopes ?? "").split(/[\s,]+/).filter(Boolean);

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
        {error ? (
          <p role="alert" className="text-sm text-destructive">Could not load this connection request: {error}</p>
        ) : !details ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-2">Connect {client} to Health Star Academy</h1>
            {email && <p className="text-sm text-muted-foreground mb-3">Signed in as {email}</p>}
            <p className="text-sm mb-3">{client} will be able to use this app's enabled tools as you.</p>
            {details?.redirect_uri && <p className="text-xs text-muted-foreground mb-3 break-all">Returns to: {details.redirect_uri}</p>}
            {scopes.length > 0 && (
              <ul className="text-sm list-disc pl-5 mb-3">{scopes.map((s) => <li key={s}>{scopeLabel(s)}</li>)}</ul>
            )}
            <p className="text-xs text-muted-foreground mb-5">This does not bypass this app's permissions or backend policies.</p>
            <div className="flex gap-2">
              <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>Approve</Button>
              <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>Cancel connection</Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
