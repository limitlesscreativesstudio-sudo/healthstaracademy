import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Users } from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  capacity: number;
  status: string;
  created_at: string;
}

const CohortManager = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCounts, setEnrolledCounts] = useState<Record<string, number>>({});

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

      // Get enrolled counts per cohort
      const { data: students } = await supabase
        .from("students")
        .select("cohort_id")
        .not("enrollment_status", "eq", "disqualified");

      const counts: Record<string, number> = {};
      students?.forEach((s: { cohort_id: string | null }) => {
        if (s.cohort_id) {
          counts[s.cohort_id] = (counts[s.cohort_id] || 0) + 1;
        }
      });
      setEnrolledCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCohorts(); }, []);

  const toggleStatus = async (cohort: Cohort) => {
    const newStatus = cohort.status === "open" ? "closed" : "open";
    const { error } = await supabase
      .from("cohorts")
      .update({ status: newStatus })
      .eq("id", cohort.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Cohort ${newStatus}` });
      fetchCohorts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">2026 Cohorts</h2>
        <Button variant="outline" size="icon" onClick={fetchCohorts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cohorts.map(cohort => {
          const enrolled = enrolledCounts[cohort.id] || 0;
          const dateStr = new Date(cohort.start_date + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          });

          return (
            <div key={cohort.id} className="bg-background rounded-lg border border-border p-5">
              <div className="flex justify-between items-start mb-3">
                <Badge className={cohort.status === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {cohort.status.toUpperCase()}
                </Badge>
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
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, (enrolled / cohort.capacity) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CohortManager;
