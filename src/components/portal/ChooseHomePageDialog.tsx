import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Home as HomeIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type HomeType = "modules" | "front_page" | "syllabus" | "assignments" | "activity";

const OPTIONS: { value: HomeType; label: string; help: string }[] = [
  { value: "activity", label: "Course Activity Stream", help: "Recent announcements and activity for the course." },
  { value: "front_page", label: "Pages Front Page", help: "Display a Page you've created in Pages and marked as Front Page." },
  { value: "modules", label: "Course Modules", help: "Show the list of Modules (the default Canvas view)." },
  { value: "assignments", label: "Assignments List", help: "Show students every assignment in the course." },
  { value: "syllabus", label: "Syllabus", help: "Show the syllabus content and upcoming events." },
];

export default function ChooseHomePageDialog({
  courseId, current, hasFrontPage, onChanged, trigger,
}: {
  courseId: string;
  current: string;
  hasFrontPage: boolean;
  onChanged: (next: HomeType) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<HomeType>((current as HomeType) || "modules");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (value === "front_page" && !hasFrontPage) {
      toast.error("You need to mark a Page as the Front Page first (Pages → ⋯ → Use as Front Page).");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("courses").update({ home_page_type: value }).eq("id", courseId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Home page updated");
    onChanged(value);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <HomeIcon className="h-4 w-4" /> Choose Home Page
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Course Home Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          {OPTIONS.map(o => {
            const disabled = o.value === "front_page" && !hasFrontPage;
            const isCurrent = (current as HomeType) === o.value;
            return (
              <label
                key={o.value}
                className={`flex gap-3 items-start p-3 rounded border transition ${
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                } ${value === o.value ? "border-purple bg-purple/5" : "border-border hover:bg-muted/50"}`}
              >
                <input
                  type="radio"
                  name="home"
                  className="mt-1"
                  checked={value === o.value}
                  disabled={disabled}
                  onChange={() => setValue(o.value)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {o.label}
                    {isCurrent && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{o.help}</div>
                  {disabled && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
                      <AlertCircle className="h-3 w-3" /> Mark a Page as Front Page in the Pages tab to enable this option.
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
