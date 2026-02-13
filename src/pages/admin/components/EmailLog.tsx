import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Mail } from "lucide-react";

interface EmailRecord {
  id: string;
  student_id: string;
  email_type: string;
  sent_at: string;
  status: string;
  metadata: {
    subject?: string;
    recipient?: string;
    student_name?: string;
  } | null;
}

const EMAIL_TYPE_LABELS: Record<string, string> = {
  disqualified: "Disqualified Notice",
  qualified_welcome: "Welcome / Qualified",
  livescan: "LiveScan Instructions",
  tuition_options: "Tuition & Payment",
  orientation: "Orientation Details",
  scrub_request: "Scrub Size Request",
  final_welcome: "Final Welcome",
};

const EmailLog = () => {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enrollment_emails")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEmails((data as EmailRecord[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmails(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">Email History</h2>
        <Button variant="outline" size="icon" onClick={fetchEmails} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_150px_100px_150px] gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <span>Recipient</span><span>Type</span><span>Status</span><span></span><span>Sent</span>
        </div>

        {emails.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {loading ? "Loading..." : "No emails sent yet."}
          </div>
        )}

        {emails.map(email => (
          <div key={email.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_150px_100px_150px] gap-2 md:gap-4 px-4 py-3 border-b border-border last:border-0 items-center">
            <div>
              <p className="text-sm font-medium text-foreground">{email.metadata?.student_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{email.metadata?.recipient || "—"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{EMAIL_TYPE_LABELS[email.email_type] || email.email_type}</span>
            </div>
            <Badge variant={email.status === "sent" ? "default" : email.status === "failed" ? "destructive" : "outline"} className="text-xs justify-center w-fit">
              {email.status}
            </Badge>
            <span></span>
            <span className="text-sm text-muted-foreground">
              {new Date(email.sent_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailLog;
