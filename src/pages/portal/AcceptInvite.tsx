import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AcceptInvite = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!token) { setError("No invitation token in the link."); setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase.functions.invoke("accept-invite", {
        body: { action: "lookup", token },
      });
      if (error || data?.error) setError(data?.error ?? error?.message ?? "Invalid invitation");
      else { setInvitedEmail(data.email); setCourseTitle(data.courseTitle); }
      setLoading(false);
    })();
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("accept-invite", {
      body: { action: "accept", token, fullName, password },
    });
    if (error || data?.error) {
      toast({ title: "Could not accept", description: data?.error ?? error?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    // Auto-sign-in
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: invitedEmail, password });
    setSubmitting(false);
    if (signErr) {
      toast({ title: "Account created", description: "Please sign in with your new password." });
      navigate("/portal/login");
    } else {
      toast({ title: "Welcome!", description: `You're enrolled in ${courseTitle}.` });
      navigate("/portal");
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple/10 flex items-center justify-center mb-2">
            <GraduationCap className="h-6 w-6 text-purple" />
          </div>
          <CardTitle>Accept Your Invitation</CardTitle>
          <CardDescription>Health Star Academy Learning Portal</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/portal/login")}>Go to Sign In</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="rounded-md bg-muted/50 p-3 text-sm flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <div>
                  You've been invited to <strong>{courseTitle}</strong>. Create your password to accept and access the course.
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input value={invitedEmail} disabled />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input required value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <Label>Create Password</Label>
                <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">At least 6 characters.</p>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept & Create Account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
