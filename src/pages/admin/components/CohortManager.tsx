import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Users, Link2, Save, X } from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  capacity: number;
  status: string;
  program_type: string;
  paid_in_full_link: string;
  payment_plan_link: string;
  created_at: string;
}

const CohortManager = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCounts, setEnrolledCounts] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLinks, setEditLinks] = useState({ paid_in_full_link: "", payment_plan_link: "" });

  const fetchCohorts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cohorts")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCohorts((data as Cohort[]) || []);
      const { data: students } = await supabase
        .from("students")
        .select("cohort_id")
        .not("enrollment_status", "eq", "disqualified");

      const counts: Record<string, number> = {};
      students?.forEach((s: { cohort_id: string | null }) => {
        if (s.cohort_id) counts[s.cohort_id] = (counts[s.cohort_id] || 0) + 1;
      });
      setEnrolledCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCohorts(); }, []);

  const toggleStatus = async (cohort: Cohort) => {
    const newStatus = cohort.status === "open" ? "closed" : "open";
    const { error } = await supabase.from("cohorts").update({ status: newStatus }).eq("id", cohort.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Cohort ${newStatus}` });
      fetchCohorts();
    }
  };

  const startEditing = (cohort: Cohort) => {
    setEditingId(cohort.id);
    setEditLinks({ paid_in_full_link: cohort.paid_in_full_link || "", payment_plan_link: cohort.payment_plan_link || "" });
  };

  const saveLinks = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from("cohorts")
      .update({ paid_in_full_link: editLinks.paid_in_full_link, payment_plan_link: editLinks.payment_plan_link })
      .eq("id", editingId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment links updated" });
      setEditingId(null);
      fetchCohorts();
    }
  };

  const daytimeCohorts = cohorts.filter(c => (c.program_type || "daytime") === "daytime");
  const weekendCohorts = cohorts.filter(c => c.program_type === "weekend");

  const renderCohortCard = (cohort: Cohort) => {
    const enrolled = enrolledCounts[cohort.id] || 0;
    const dateStr = new Date(cohort.start_date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
    const isEditing = editingId === cohort.id;

    return (
      <div key={cohort.id} className="bg-background rounded-lg border border-border p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Badge className={cohort.status === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {cohort.status.toUpperCase()}
            </Badge>
            {cohort.program_type === "weekend" && (
              <Badge className="bg-cyan/20 text-cyan">WEEKEND</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => toggleStatus(cohort)}>
            {cohort.status === "open" ? "Close" : "Open"}
          </Button>
        </div>
        <h3 className="font-semibold text-foreground mb-1">{dateStr}</h3>
        <p className="text-sm text-muted-foreground mb-3">{cohort.name}</p>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{enrolled}</span>
          <span className="text-muted-foreground">/ {cohort.capacity} enrolled</span>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (enrolled / cohort.capacity) * 100)}%` }} />
        </div>

        {/* Payment Links */}
        <div className="mt-4 border-t border-border pt-3">
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Paid in Full Link</label>
                <Input
                  value={editLinks.paid_in_full_link}
                  onChange={e => setEditLinks(prev => ({ ...prev, paid_in_full_link: e.target.value }))}
                  placeholder="https://buy.stripe.com/..."
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Payment Plan Link</label>
                <Input
                  value={editLinks.payment_plan_link}
                  onChange={e => setEditLinks(prev => ({ ...prev, payment_plan_link: e.target.value }))}
                  placeholder="https://buy.stripe.com/..."
                  className="text-xs h-8"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveLinks} className="h-7 text-xs">
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground truncate flex-1">
                <Link2 className="h-3 w-3 inline mr-1" />
                {cohort.paid_in_full_link ? "Links configured" : "No payment links"}
              </div>
              <Button variant="ghost" size="sm" onClick={() => startEditing(cohort)} className="h-7 text-xs">
                Edit Links
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">Cohort Management</h2>
        <Button variant="outline" size="icon" onClick={fetchCohorts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {daytimeCohorts.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Daytime Cohorts</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {daytimeCohorts.map(renderCohortCard)}
          </div>
        </>
      )}

      {weekendCohorts.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Weekend Cohorts</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weekendCohorts.map(renderCohortCard)}
          </div>
        </>
      )}
    </div>
  );
};

export default CohortManager;
