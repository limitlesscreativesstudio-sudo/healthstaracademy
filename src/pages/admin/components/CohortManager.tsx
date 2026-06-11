import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  RefreshCw, Users, Link2, Save, X, Plus, Copy, Trash2, Star,
} from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  capacity: number;
  status: string;
  program_type: string;
  paid_in_full_link: string;
  payment_plan_link: string;
  is_template: boolean;
  template_source_id: string | null;
  created_at: string;
}

const blankNew = (): {
  name: string; start_date: string; capacity: number; program_type: "daytime" | "weekend";
  paid_in_full_link: string; payment_plan_link: string;
} => ({
  name: "",
  start_date: "",
  capacity: 25,
  program_type: "daytime",
  paid_in_full_link: "",
  payment_plan_link: "",
});

const CohortManager = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCounts, setEnrolledCounts] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLinks, setEditLinks] = useState({ paid_in_full_link: "", payment_plan_link: "" });

  // Create / duplicate dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(blankNew());
  const [createSaving, setCreateSaving] = useState(false);
  const [createAsTemplate, setCreateAsTemplate] = useState(false);

  const [dupOpen, setDupOpen] = useState(false);
  const [dupTemplate, setDupTemplate] = useState<Cohort | null>(null);
  const [dupStartDate, setDupStartDate] = useState("");
  const [dupName, setDupName] = useState("");
  const [dupSaving, setDupSaving] = useState(false);

  const fetchCohorts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cohorts")
      .select("*")
      .order("is_template", { ascending: false })
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
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Cohort ${newStatus}` }); fetchCohorts(); }
  };

  const startEditing = (cohort: Cohort) => {
    setEditingId(cohort.id);
    setEditLinks({
      paid_in_full_link: cohort.paid_in_full_link || "",
      payment_plan_link: cohort.payment_plan_link || "",
    });
  };

  const saveLinks = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from("cohorts")
      .update({ paid_in_full_link: editLinks.paid_in_full_link, payment_plan_link: editLinks.payment_plan_link })
      .eq("id", editingId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Payment links updated" }); setEditingId(null); fetchCohorts(); }
  };

  const handleDelete = async (cohort: Cohort) => {
    const enrolled = enrolledCounts[cohort.id] || 0;
    if (enrolled > 0) {
      toast({
        title: "Cannot delete",
        description: `${enrolled} student${enrolled === 1 ? " is" : "s are"} enrolled. Remove them first.`,
        variant: "destructive",
      });
      return;
    }
    if (!confirm(`Delete ${cohort.is_template ? "template " : ""}"${cohort.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("cohorts").delete().eq("id", cohort.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Cohort deleted" }); fetchCohorts(); }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!createAsTemplate && !createForm.start_date) {
      toast({ title: "Start date is required for non-template cohorts", variant: "destructive" });
      return;
    }
    setCreateSaving(true);
    const { error } = await supabase.from("cohorts").insert({
      name: createForm.name.trim(),
      start_date: createForm.start_date || new Date().toISOString().slice(0, 10),
      capacity: createForm.capacity || 25,
      program_type: createForm.program_type,
      paid_in_full_link: createForm.paid_in_full_link || null,
      payment_plan_link: createForm.payment_plan_link || null,
      is_template: createAsTemplate,
      status: createAsTemplate ? "closed" : "open",
    });
    setCreateSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: createAsTemplate ? "Template created" : "Cohort created" });
    setCreateOpen(false);
    setCreateForm(blankNew());
    setCreateAsTemplate(false);
    fetchCohorts();
  };

  const openDuplicate = (template: Cohort) => {
    setDupTemplate(template);
    setDupStartDate("");
    setDupName("");
    setDupOpen(true);
  };

  const handleDuplicate = async () => {
    if (!dupTemplate || !dupStartDate) {
      toast({ title: "Start date is required", variant: "destructive" });
      return;
    }
    const niceDate = new Date(dupStartDate + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
    const finalName = dupName.trim() || `${dupTemplate.program_type === "weekend" ? "Weekend" : "Daytime"} — ${niceDate}`;

    setDupSaving(true);
    const { error } = await supabase.from("cohorts").insert({
      name: finalName,
      start_date: dupStartDate,
      capacity: dupTemplate.capacity,
      program_type: dupTemplate.program_type,
      paid_in_full_link: dupTemplate.paid_in_full_link,
      payment_plan_link: dupTemplate.payment_plan_link,
      status: "open",
      is_template: false,
      template_source_id: dupTemplate.id,
    });
    setDupSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Cohort created from template", description: finalName });
    setDupOpen(false);
    fetchCohorts();
  };

  const templates = cohorts.filter(c => c.is_template);
  const liveCohorts = cohorts.filter(c => !c.is_template);
  const daytimeCohorts = liveCohorts.filter(c => (c.program_type || "daytime") === "daytime");
  const weekendCohorts = liveCohorts.filter(c => c.program_type === "weekend");

  const renderCohortCard = (cohort: Cohort) => {
    const enrolled = enrolledCounts[cohort.id] || 0;
    const dateStr = new Date(cohort.start_date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
    const isEditing = editingId === cohort.id;
    const isTemplate = cohort.is_template;

    return (
      <div key={cohort.id} className={`bg-background rounded-lg border p-5 ${isTemplate ? "border-primary/40 border-2" : "border-border"}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isTemplate ? (
              <Badge className="bg-primary/15 text-primary border border-primary/30">
                <Star className="h-3 w-3 mr-1 inline" /> TEMPLATE
              </Badge>
            ) : (
              <Badge className={cohort.status === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {cohort.status.toUpperCase()}
              </Badge>
            )}
            {cohort.program_type === "weekend" && (
              <Badge className="bg-cyan-100 text-cyan-800">WEEKEND</Badge>
            )}
            {cohort.program_type === "daytime" && (
              <Badge className="bg-purple-100 text-purple-800">DAYTIME</Badge>
            )}
          </div>
          <div className="flex gap-1">
            {!isTemplate && (
              <Button variant="ghost" size="sm" onClick={() => toggleStatus(cohort)} className="h-7 text-xs">
                {cohort.status === "open" ? "Close" : "Open"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => handleDelete(cohort)} className="h-7 text-xs text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isTemplate ? (
          <h3 className="font-semibold text-foreground mb-1">{cohort.name}</h3>
        ) : (
          <>
            <h3 className="font-semibold text-foreground mb-1">{dateStr}</h3>
            <p className="text-sm text-muted-foreground mb-3">{cohort.name}</p>
          </>
        )}

        {!isTemplate && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{enrolled}</span>
              <span className="text-muted-foreground">/ {cohort.capacity} enrolled</span>
            </div>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (enrolled / cohort.capacity) * 100)}%` }} />
            </div>
          </>
        )}

        {isTemplate && (
          <div className="text-sm text-muted-foreground mb-3">
            Capacity: <span className="font-medium text-foreground">{cohort.capacity}</span> students
          </div>
        )}

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
            <div className="flex items-center justify-between gap-2">
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

        {isTemplate && (
          <Button
            onClick={() => openDuplicate(cohort)}
            className="w-full mt-3 h-8 text-xs"
            size="sm"
          >
            <Copy className="h-3 w-3 mr-1" /> Duplicate for new cohort
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-foreground">Cohort Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setCreateAsTemplate(true); setCreateOpen(true); }}>
            <Star className="h-4 w-4 mr-1" /> New Template
          </Button>
          <Button size="sm" onClick={() => { setCreateAsTemplate(false); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New Cohort
          </Button>
          <Button variant="outline" size="icon" onClick={fetchCohorts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Templates */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
        <Star className="h-3.5 w-3.5" /> Templates
      </h3>
      {templates.length === 0 ? (
        <div className="bg-muted/40 border border-dashed border-border rounded-lg p-6 text-center mb-8">
          <p className="text-sm text-muted-foreground mb-3">
            No templates yet. Create one Daytime and one Weekend template — then duplicate them for each new group of students.
          </p>
          <Button size="sm" onClick={() => { setCreateAsTemplate(true); setCreateOpen(true); }}>
            <Star className="h-4 w-4 mr-1" /> Create your first template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {templates.map(renderCohortCard)}
        </div>
      )}

      {/* Daytime cohorts */}
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

      {liveCohorts.length === 0 && templates.length > 0 && (
        <div className="bg-muted/40 border border-dashed border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No live cohorts yet. Click <strong>Duplicate for new cohort</strong> on a template above to create one.
          </p>
        </div>
      )}

      {/* CREATE dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createAsTemplate ? "New cohort template" : "New cohort"}
            </DialogTitle>
            <DialogDescription>
              {createAsTemplate
                ? "Templates store default settings (capacity, payment links, program type) that you reuse when starting new groups."
                : "Create a one-off cohort. For repeating groups, create a template instead and duplicate it."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name *</label>
              <Input
                value={createForm.name}
                onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                placeholder={createAsTemplate ? "e.g. Daytime Template" : "e.g. Daytime — Jan 12, 2026"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Program type *</label>
                <Select
                  value={createForm.program_type}
                  onValueChange={v => setCreateForm(p => ({ ...p, program_type: v as "daytime" | "weekend" }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daytime">Daytime</SelectItem>
                    <SelectItem value="weekend">Weekend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Capacity</label>
                <Input
                  type="number"
                  min={1}
                  value={createForm.capacity}
                  onChange={e => setCreateForm(p => ({ ...p, capacity: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {!createAsTemplate && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Start date *</label>
                <Input
                  type="date"
                  value={createForm.start_date}
                  onChange={e => setCreateForm(p => ({ ...p, start_date: e.target.value }))}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground">Paid in Full Link</label>
              <Input
                value={createForm.paid_in_full_link}
                onChange={e => setCreateForm(p => ({ ...p, paid_in_full_link: e.target.value }))}
                placeholder="https://buy.stripe.com/..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Payment Plan Link</label>
              <Input
                value={createForm.payment_plan_link}
                onChange={e => setCreateForm(p => ({ ...p, payment_plan_link: e.target.value }))}
                placeholder="https://buy.stripe.com/..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSaving}>
              {createSaving ? "Creating…" : createAsTemplate ? "Create Template" : "Create Cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DUPLICATE dialog */}
      <Dialog open={dupOpen} onOpenChange={setDupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate template</DialogTitle>
            <DialogDescription>
              Creates a fresh cohort with its own roster. Settings are copied from
              <strong> {dupTemplate?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Start date *</label>
              <Input
                type="date"
                value={dupStartDate}
                onChange={e => setDupStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cohort name (optional)</label>
              <Input
                value={dupName}
                onChange={e => setDupName(e.target.value)}
                placeholder={dupStartDate
                  ? `${dupTemplate?.program_type === "weekend" ? "Weekend" : "Daytime"} — ${new Date(dupStartDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "Auto-generated from start date"}
              />
            </div>
            <div className="text-xs text-muted-foreground bg-muted/40 rounded-md p-3">
              Will copy: capacity ({dupTemplate?.capacity}), program type ({dupTemplate?.program_type}), and payment links.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDupOpen(false)}>Cancel</Button>
            <Button onClick={handleDuplicate} disabled={dupSaving}>
              <Copy className="h-4 w-4 mr-1" />
              {dupSaving ? "Creating…" : "Create cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CohortManager;
