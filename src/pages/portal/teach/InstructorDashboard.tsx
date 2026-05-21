import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BookOpen, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePortalAuth } from "@/hooks/usePortalAuth";

const InstructorDashboard = () => {
  const { user, isInstructor, isAdmin, loading } = usePortalAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [term, setTerm] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("courses").select("*").eq("instructor_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setCourses(data ?? []));
  }, [user]);

  if (loading) return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;

  if (!isInstructor) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h2 className="font-semibold mb-2">Instructor access required</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Your account doesn't have instructor permissions. Contact an administrator to be granted instructor access.
              </p>
              {isAdmin && <p className="text-xs text-muted-foreground">You are an admin — you can grant yourself or others the instructor role from the admin dashboard.</p>}
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const createCourse = async () => {
    if (!user || !title.trim()) return;
    const { data, error } = await supabase.from("courses").insert({
      title, code: code || null, term: term || null, description: description || null,
      instructor_id: user.id, status: "draft",
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Course created" });
    setOpen(false);
    navigate(`/portal/teach/courses/${data.id}`);
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold">Teach</h1>
            <p className="text-muted-foreground">Manage your courses</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New Course</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. CNA Fundamentals" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="CNA-101" /></div>
                  <div><Label>Term</Label><Input value={term} onChange={e => setTerm(e.target.value)} placeholder="Spring 2026" /></div>
                </div>
                <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
                <Button onClick={createCourse} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {courses.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No courses yet. Click "New Course" to create your first one.</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c => (
              <Link key={c.id} to={`/portal/teach/courses/${c.id}`}>
                <Card className="hover:shadow-medium transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${c.status === "published" ? "bg-cyan/20 text-cyan-dark" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
                      {c.code && <span className="text-xs font-mono text-muted-foreground">{c.code}</span>}
                    </div>
                    <h3 className="font-semibold mb-1">{c.title}</h3>
                    {c.term && <p className="text-xs text-muted-foreground">{c.term}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default InstructorDashboard;
