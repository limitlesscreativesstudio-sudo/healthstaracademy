import { Badge } from "@/components/ui/badge";
import { Activity, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const WEBHOOK_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrollment-webhook`;

const WebhookInfo = () => {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(WEBHOOK_BASE);
    setCopied(true);
    toast({ title: "Copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const eventTypes = [
    {
      event: "pre_qualification",
      description: "New student from Google Sheets pre-qualification form. Triggers qualification logic and sends welcome or disqualification email.",
      fields: "first_name, last_name, email, phone, is_over_18, has_diploma, has_valid_id, has_ssn, can_pass_background, has_health_proof, has_transportation, selected_cohort_date",
    },
    {
      event: "documents_received",
      description: "Triggered when enrollment documents are received. Sends LiveScan instructions email.",
      fields: "student_id",
    },
    {
      event: "tuition_request",
      description: "Sends tuition/payment options email after LiveScan clears.",
      fields: "student_id",
    },
    {
      event: "payment_complete",
      description: "Triggered when tuition payment is confirmed. Sends orientation and scrub request emails.",
      fields: "student_id",
    },
    {
      event: "final_welcome",
      description: "Sends final welcome email (Friday before cohort start).",
      fields: "student_id",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Zapier Webhook Setup</h2>
        <p className="text-muted-foreground text-sm">Configure your Zapier zaps to send POST requests to the webhook URL below with the appropriate event_type.</p>
      </div>

      <div className="bg-background rounded-lg border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground text-sm">Webhook URL</span>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
          <code className="text-sm flex-1 break-all text-foreground">{WEBHOOK_BASE}</code>
          <Button variant="ghost" size="icon" onClick={copyUrl}>
            {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Send JSON POST requests with <code className="bg-muted px-1 rounded">Content-Type: application/json</code>
        </p>
      </div>

      <h3 className="font-semibold text-foreground mb-4">Event Types</h3>
      <div className="space-y-4">
        {eventTypes.map(et => (
          <div key={et.event} className="bg-background rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-xs">{et.event}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{et.description}</p>
            <div>
              <span className="text-xs font-medium text-foreground">Required fields: </span>
              <span className="text-xs text-muted-foreground font-mono">{et.fields}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-muted/50 rounded-lg p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-2">Zapier Configuration Steps</h3>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Create a new Zap in Zapier</li>
          <li>Set trigger: <strong>Google Sheets → New Spreadsheet Row</strong></li>
          <li>Map spreadsheet columns A–N to the required JSON fields above</li>
          <li>Add action: <strong>Webhooks by Zapier → POST</strong></li>
          <li>Set URL to the webhook URL above</li>
          <li>Set payload type to JSON and map fields from the trigger</li>
          <li>Include <code className="bg-background px-1 rounded">event_type: "pre_qualification"</code> in the payload</li>
          <li>Test and turn on your Zap!</li>
        </ol>
      </div>
    </div>
  );
};

export default WebhookInfo;
