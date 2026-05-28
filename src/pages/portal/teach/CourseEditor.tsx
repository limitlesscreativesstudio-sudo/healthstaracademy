import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, Eye, EyeOff, ArrowLeft, Sparkles, ListPlus, ArrowUp, ArrowDown, GripVertical, Pencil, Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { COURSE_NAV_ITEMS, defaultNavOrder, type NavKey } from "@/lib/courseNav";

const CDPH_MODULES: { title: string; pdf: string }[] = [
  { title: "Module 1: Introduction to Nurse Assistant", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-1.pdf" },
  { title: "Module 2: Patient/Resident Rights", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-2.pdf" },
  { title: "Module 3: Communication/Interpersonal Skills", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-3.pdf" },
  { title: "Module 4: Prevention and Management of Catastrophe and Unusual Occurrences", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-4.pdf" },
  { title: "Module 5: Body Mechanics", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-5.pdf" },
  { title: "Module 6: Medical and Surgical Asepsis", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-6.pdf" },
  { title: "Module 7: Weights and Measures", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-7.pdf" },
  { title: "Module 8: Patient Care Skills", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-8.pdf" },
  { title: "Module 9: Patient Care Procedures", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-9.pdf" },
  { title: "Module 10: Vital Signs", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-10.pdf" },
  { title: "Module 11: Nutrition", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-11.pdf" },
  { title: "Module 12: Emergency Procedures", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-12.pdf" },
  { title: "Module 13: Long Term Care Patient/Resident", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-13.pdf" },
  { title: "Module 14: Rehabilitative Nursing", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-14.pdf" },
  { title: "Module 15: Observation and Charting", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-15.pdf" },
  { title: "Module 16: Death and Dying", pdf: "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-module-16.pdf" },
  { title: "Module 17: Abuse", pdf: "" },
];
const CDPH_INTRO_PDF = "https://coadn.org/public/uploads/images/cccco-na-model-curriculum-introduction-and-list-of-modules.pdf";
import { toast } from "@/hooks/use-toast";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import AssignmentsTab from "./AssignmentsTab";
import QuizzesTab from "./QuizzesTab";
import GradebookTab from "./GradebookTab";

const CourseEditor = () => {
  const { courseId } = useParams();
  const { user } = usePortalAuth();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    if (!courseId) return;
    const { data: c } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();
    setCourse(c);
    const { data: mods } = await supabase.from("modules").select("*").eq("course_id", courseId).order("position");
    setModules(mods ?? []);
    if (mods?.length) {
      const { data: its } = await supabase.from("module_items").select("*").in("module_id", mods.map(m => m.id)).order("position");
      setItems(its ?? []);
    }
  };

  useEffect(() => { load(); }, [courseId]);

  if (!course) return <PortalLayout><div className="p-6">Loading…</div></PortalLayout>;

  return (
    <PortalLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <Link to="/portal/teach" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold">{course.title}</h1>
            <p className="text-sm text-muted-foreground">{course.code} · {course.status}</p>
          </div>
          <Link to={`/portal/courses/${courseId}`}><Button variant="outline">Preview as Student</Button></Link>
        </div>

        <Tabs defaultValue="modules">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <ModulesEditor courseId={courseId!} modules={modules} items={items} reload={load} />
          </TabsContent>
          <TabsContent value="assignments">
            <AssignmentsTab courseId={courseId!} />
          </TabsContent>
          <TabsContent value="quizzes">
            <QuizzesTab courseId={courseId!} />
          </TabsContent>
          <TabsContent value="gradebook">
            <GradebookTab courseId={courseId!} />
          </TabsContent>
          <TabsContent value="roster">
            <RosterEditor courseId={courseId!} />
          </TabsContent>
          <TabsContent value="announcements">
            <AnnouncementsEditor courseId={courseId!} userId={user?.id} />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsEditor course={course} reload={load} />
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
};

const ModulesEditor = ({ courseId, modules, items, reload }: any) => {
  const [newModule, setNewModule] = useState("");

  const addModule = async () => {
    if (!newModule.trim()) return;
    const { error } = await supabase.from("modules").insert({
      course_id: courseId, title: newModule, position: modules.length, published: false,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setNewModule(""); reload(); }
  };

  const togglePublish = async (id: string, published: boolean) => {
    await supabase.from("modules").update({ published: !published }).eq("id", id);
    reload();
  };

  const deleteModule = async (id: string) => {
    if (!confirm("Delete this module and all its items?")) return;
    await supabase.from("modules").delete().eq("id", id);
    reload();
  };

  const seedCdph = async () => {
    if (modules.length > 0 && !confirm("Course already has modules. Add the CoADN CDPH curriculum anyway?")) return;
    const base = modules.length;
    const rows = CDPH_MODULES.map((m, i) => ({
      course_id: courseId, title: m.title, position: base + i, published: false,
    }));
    const { data: inserted, error } = await supabase.from("modules").insert(rows).select();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    // Auto-attach each official PDF as the first item in its module
    const items = (inserted ?? [])
      .map((mod, idx) => {
        const pdf = CDPH_MODULES[idx].pdf;
        if (!pdf) return null;
        return {
          module_id: mod.id,
          title: `${CDPH_MODULES[idx].title} — Official PDF`,
          item_type: "link",
          url: pdf,
          position: 0,
          published: true,
        };
      })
      .filter(Boolean) as any[];
    if (items.length) await supabase.from("module_items").insert(items);

    toast({ title: `Seeded ${CDPH_MODULES.length} modules + ${items.length} PDFs` });
    reload();
  };

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="pt-6 space-y-3">
        <div className="flex gap-2">
          <Input placeholder="New module title…" value={newModule} onChange={e => setNewModule(e.target.value)} onKeyDown={e => e.key === "Enter" && addModule()} />
          <Button onClick={addModule}><Plus className="h-4 w-4" /> Add</Button>
        </div>
        {modules.length === 0 && (
          <Button variant="purple-outline" onClick={seedCdph} className="w-full">
            <Sparkles className="h-4 w-4" /> Seed CDPH Curriculum (17 modules + official PDFs)
          </Button>
        )}
      </CardContent></Card>

      {modules.map((m: any) => (
        <Card key={m.id}>
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="font-semibold">{m.title}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => togglePublish(m.id, m.published)}>
                {m.published ? <><Eye className="h-4 w-4" /> Published</> : <><EyeOff className="h-4 w-4" /> Draft</>}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteModule(m.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <CardContent className="p-4 space-y-2">
            {items.filter((i: any) => i.module_id === m.id).map((i: any) => (
              <div key={i.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                <span className="text-xs px-2 py-0.5 bg-background rounded">{i.item_type}</span>
                <span className="flex-1 truncate">{i.title}</span>
                <Button size="sm" variant="ghost" onClick={async () => {
                  await supabase.from("module_items").update({ published: !i.published }).eq("id", i.id);
                  reload();
                }}>{i.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
                <Button size="sm" variant="ghost" onClick={async () => {
                  if (confirm("Delete?")) { await supabase.from("module_items").delete().eq("id", i.id); reload(); }
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <div className="flex gap-2">
              <AddItemDialog moduleId={m.id} courseId={courseId} position={items.filter((i: any) => i.module_id === m.id).length} reload={reload} />
              <BulkLinksDialog moduleId={m.id} startPosition={items.filter((i: any) => i.module_id === m.id).length} reload={reload} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const BulkLinksDialog = ({ moduleId, startPosition, reload }: { moduleId: string; startPosition: number; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setBusy(true);
    try {
      const rows = lines.map((line, idx) => {
        const [a, b] = line.split("|").map(s => s?.trim());
        const url = (b || a) ?? "";
        const title = (b ? a : (url.split("/").pop() || url)) || "Untitled";
        const isVideo = /youtube\.com|youtu\.be|vimeo\.com|\.mp4/i.test(url);
        return {
          module_id: moduleId,
          title,
          item_type: isVideo ? "video" : "link",
          url,
          position: startPosition + idx,
          published: false,
        };
      });
      const { error } = await supabase.from("module_items").insert(rows);
      if (error) throw error;
      toast({ title: `Added ${rows.length} item${rows.length === 1 ? "" : "s"}` });
      setOpen(false); setText(""); reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const count = text.split("\n").filter(l => l.trim()).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full"><ListPlus className="h-4 w-4" /> Bulk Add Links</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Bulk Add Links</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            One per line. Format: <code className="text-xs bg-muted px-1 rounded">Title | URL</code> or just a URL.
            YouTube / Vimeo / .mp4 links are auto-tagged as videos.
          </p>
          <Textarea
            rows={10}
            placeholder={"Intro Video | https://youtu.be/xxxxx\nPatient Rights PDF | https://drive.google.com/file/d/.../view\nhttps://example.com/handout.pdf"}
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <Button onClick={submit} disabled={busy || count === 0} className="w-full">
            {busy ? "Adding…" : `Add ${count} item${count === 1 ? "" : "s"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddItemDialog = ({ moduleId, courseId, position, reload }: any) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("page");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    let content_ref: string | null = null;
    try {
      if (type === "page") {
        const { data, error } = await supabase.from("lms_pages").insert({ course_id: courseId, title, body_html: body }).select().single();
        if (error) throw error;
        content_ref = data.id;
      } else if (type === "file" && file) {
        const path = `${courseId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("course-assets").upload(path, file);
        if (upErr) throw upErr;
        const { data: fileRow, error } = await supabase.from("lms_files").insert({
          course_id: courseId, name: file.name, mime_type: file.type, size_bytes: file.size,
          storage_provider: "cloud", storage_path: path,
        }).select().single();
        if (error) throw error;
        content_ref = fileRow.id;
      } else if (type === "file" && url) {
        // External (Google Drive share link, etc.)
        const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const { data: fileRow, error } = await supabase.from("lms_files").insert({
          course_id: courseId, name: title,
          storage_provider: driveMatch ? "drive" : "external",
          drive_file_id: driveMatch ? driveMatch[1] : null,
          external_url: driveMatch ? null : url,
        }).select().single();
        if (error) throw error;
        content_ref = fileRow.id;
      }
      const { error: itemErr } = await supabase.from("module_items").insert({
        module_id: moduleId, title, item_type: type, content_ref,
        url: (type === "link" || type === "video") ? url : null,
        position, published: false,
      });
      if (itemErr) throw itemErr;
      toast({ title: "Item added" });
      setOpen(false); setTitle(""); setUrl(""); setBody(""); setFile(null);
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="purple-outline" className="w-full"><Plus className="h-4 w-4" /> Add Item</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page (rich text)</SelectItem>
                <SelectItem value="file">File (upload or Drive link)</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
                <SelectItem value="video">Video (URL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          {type === "page" && (
            <div><Label>Content (HTML allowed)</Label><Textarea rows={6} value={body} onChange={e => setBody(e.target.value)} /></div>
          )}
          {type === "file" && (
            <>
              <div>
                <Label>Upload file (small assets, &lt;10 MB)</Label>
                <Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="text-xs text-muted-foreground text-center">— or —</div>
              <div>
                <Label>Paste Google Drive share link (for large files)</Label>
                <Input placeholder="https://drive.google.com/file/d/…/view" value={url} onChange={e => setUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Make sure the Drive file is set to "Anyone with the link can view".</p>
              </div>
            </>
          )}
          {(type === "link" || type === "video") && (
            <div><Label>URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></div>
          )}
          <Button onClick={submit} disabled={busy} className="w-full">{busy ? "Saving…" : "Add"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RosterEditor = ({ courseId }: { courseId: string }) => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const call = async (body: any) => {
    const { data, error } = await supabase.functions.invoke("course-roster", { body });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const load = async () => {
    try {
      const data = await call({ action: "list", courseId });
      setEnrollments(data.enrollments ?? []);
      setInvites(data.invites ?? []);
    } catch (e: any) {
      toast({ title: "Failed to load roster", description: e.message, variant: "destructive" });
    }
  };
  useEffect(() => { load(); }, [courseId]);

  const inviteStudent = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      const res = await call({ action: "invite", courseId, email, origin: window.location.origin });
      toast({
        title: res.enrolled ? "Student enrolled" : "Invitation sent",
        description: res.message ?? `${email} will receive an email to accept and set a password.`,
      });
      setEmail("");
      load();
    } catch (e: any) {
      toast({ title: "Invite failed", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const removeEnrollment = async (id: string) => {
    if (!confirm("Remove this student from the course?")) return;
    try {
      await call({ action: "remove", courseId, enrollmentId: id });
      load();
    } catch (e: any) {
      toast({ title: "Remove failed", description: e.message, variant: "destructive" });
    }
  };

  const revokeInvite = async (id: string) => {
    if (!confirm("Revoke this pending invitation?")) return;
    try {
      await call({ action: "revoke", courseId, inviteId: id });
      load();
    } catch (e: any) {
      toast({ title: "Revoke failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Card className="mt-4"><CardContent className="pt-6 space-y-6">
      <div>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && inviteStudent()}
          />
          <Button onClick={inviteStudent} disabled={busy}>{busy ? "Sending…" : "Send Invite"}</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          The student receives an email with a secure link to accept and create their password. Invites expire after 14 days.
        </p>
      </div>

      {invites.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Pending invitations ({invites.length})</h4>
          <ul className="space-y-1">
            {invites.map(i => (
              <li key={i.id} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{i.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Sent {new Date(i.created_at).toLocaleDateString()} · expires {new Date(i.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => revokeInvite(i.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Enrolled students ({enrollments.length})</h4>
        {enrollments.length === 0 ? <p className="text-sm text-muted-foreground">No students enrolled yet.</p> : (
          <ul className="space-y-1">
            {enrollments.map(e => (
              <li key={e.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.full_name ?? "(no name)"}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.email ?? e.user_id}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeEnrollment(e.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardContent></Card>
  );
};

const AnnouncementsEditor = ({ courseId, userId }: { courseId: string; userId?: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = () => supabase.from("lms_announcements").select("*").eq("course_id", courseId).order("posted_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, [courseId]);

  const post = async () => {
    if (!title.trim() || !body.trim()) return;
    const { error } = await supabase.from("lms_announcements").insert({ course_id: courseId, title, body, posted_by: userId });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setTitle(""); setBody(""); load(); toast({ title: "Posted" }); }
  };

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="pt-6 space-y-3">
        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Announcement body…" rows={4} value={body} onChange={e => setBody(e.target.value)} />
        <Button onClick={post}>Post Announcement</Button>
      </CardContent></Card>
      {items.map(a => (
        <Card key={a.id}><CardContent className="pt-6">
          <div className="flex justify-between"><h4 className="font-semibold">{a.title}</h4><span className="text-xs text-muted-foreground">{new Date(a.posted_at).toLocaleDateString()}</span></div>
          <p className="text-sm mt-2 whitespace-pre-wrap">{a.body}</p>
        </CardContent></Card>
      ))}
    </div>
  );
};

const SettingsEditor = ({ course, reload }: any) => {
  return (
    <div className="mt-4">
      <Tabs defaultValue="details">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <CourseDetailsSettings course={course} reload={reload} />
        </TabsContent>
        <TabsContent value="home">
          <HomePageSettings course={course} reload={reload} />
        </TabsContent>
        <TabsContent value="sections">
          <SectionsSettings courseId={course.id} />
        </TabsContent>
        <TabsContent value="navigation">
          <NavigationSettings course={course} reload={reload} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const HomePageSettings = ({ course, reload }: any) => {
  const [homeType, setHomeType] = useState(course.home_page_type ?? "modules");
  const [html, setHtml] = useState(course.front_page_html ?? "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("courses").update({
      home_page_type: homeType,
      front_page_html: html,
    }).eq("id", course.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Home page saved" }); reload(); }
  };
  return (
    <Card className="mt-4"><CardContent className="pt-6 space-y-4">
      <div>
        <Label>Choose Home Page</Label>
        <Select value={homeType} onValueChange={setHomeType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="front_page">Front Page (custom rich content)</SelectItem>
            <SelectItem value="modules">Course Modules</SelectItem>
            <SelectItem value="syllabus">Syllabus</SelectItem>
            <SelectItem value="assignments">Assignments List</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">Recent Announcements and the right-side "Coming Up" panel always appear on the home page.</p>
      </div>
      {homeType === "front_page" && (
        <div>
          <Label>Front Page Content (HTML supported)</Label>
          <Textarea rows={12} value={html} onChange={e => setHtml(e.target.value)}
            placeholder={'<h2>Welcome to the course!</h2>\n<p>Office hours, Zoom link, weekly overview, instructor photo, etc.</p>'} />
        </div>
      )}
      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Home Page"}</Button>
    </CardContent></Card>
  );
};

const TIME_ZONES = [
  "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "America/Phoenix", "America/Anchorage", "Pacific/Honolulu", "UTC",
];

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

const CourseDetailsSettings = ({ course, reload }: any) => {
  const [title, setTitle] = useState(course.title);
  const [code, setCode] = useState(course.code ?? "");
  const [term, setTerm] = useState(course.term ?? "");
  const [description, setDescription] = useState(course.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(course.cover_image_url ?? "");
  const [status, setStatus] = useState(course.status);
  const [startAt, setStartAt] = useState(toLocalInput(course.start_at));
  const [endAt, setEndAt] = useState(toLocalInput(course.end_at));
  const [timeZone, setTimeZone] = useState(course.time_zone ?? "America/Los_Angeles");
  const [license, setLicense] = useState(course.license ?? "private");
  const [visibility, setVisibility] = useState(course.visibility ?? "course");
  const [defaultView, setDefaultView] = useState(course.default_view ?? "modules");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("courses").update({
      title,
      code: code || null,
      term: term || null,
      description: description || null,
      cover_image_url: coverImageUrl || null,
      status,
      start_at: fromLocalInput(startAt),
      end_at: fromLocalInput(endAt),
      time_zone: timeZone,
      license,
      visibility,
      default_view: defaultView,
    }).eq("id", course.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Course details saved" }); reload(); }
  };

  return (
    <Card className="mt-4"><CardContent className="pt-6 space-y-4">
      <div><Label>Course Name</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Course Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="HSA-CNA-101" /></div>
        <div><Label>Term</Label><Input value={term} onChange={e => setTerm(e.target.value)} placeholder="Fall 2026" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Starts</Label><Input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} /></div>
        <div><Label>Ends</Label><Input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Time Zone</Label>
          <Select value={timeZone} onValueChange={setTimeZone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TIME_ZONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>License</Label>
          <Select value={license} onValueChange={setLicense}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private (Copyrighted)</SelectItem>
              <SelectItem value="cc_by">CC Attribution</SelectItem>
              <SelectItem value="cc_by_sa">CC Attribution Share Alike</SelectItem>
              <SelectItem value="cc_by_nc">CC Attribution Non-Commercial</SelectItem>
              <SelectItem value="public_domain">Public Domain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="course">Course (enrolled students only)</SelectItem>
              <SelectItem value="institution">Institution (any signed-in user)</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Note: only Course visibility is enforced today.</p>
        </div>
        <div>
          <Label>Default Home View</Label>
          <Select value={defaultView} onValueChange={setDefaultView}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="modules">Course Modules</SelectItem>
              <SelectItem value="syllabus">Syllabus</SelectItem>
              <SelectItem value="assignments">Assignments List</SelectItem>
              <SelectItem value="announcements">Announcements / Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Cover Image URL</Label><Input value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="https://…" /></div>
      <div><Label>Description</Label><Textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
      <div>
        <Label>Course Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Unpublished (hidden from students)</SelectItem>
            <SelectItem value="published">Published (visible to enrolled students)</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Update Course Details"}</Button>
    </CardContent></Card>
  );
};

const SectionsSettings = ({ courseId }: { courseId: string }) => {
  const [sections, setSections] = useState<any[]>([]);
  const [name, setName] = useState("");

  const load = () => supabase.from("course_sections").select("*").eq("course_id", courseId).order("created_at")
    .then(({ data }) => setSections(data ?? []));
  useEffect(() => { load(); }, [courseId]);

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("course_sections").insert({ course_id: courseId, name });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setName(""); load(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    await supabase.from("course_sections").delete().eq("id", id);
    load();
  };

  return (
    <Card className="mt-4"><CardContent className="pt-6 space-y-4">
      <p className="text-sm text-muted-foreground">
        Sections let you group enrolled students (e.g. by cohort or clinical site). Assignments and the gradebook can later be filtered by section.
      </p>
      <div className="flex gap-2">
        <Input placeholder="Section name (e.g. Stockton AM Cohort)" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <Button onClick={add}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sections yet.</p>
      ) : (
        <ul className="space-y-1">
          {sections.map(s => (
            <li key={s.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
              <span className="font-medium">{s.name}</span>
              <Button size="sm" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      )}
    </CardContent></Card>
  );
};

const NavigationSettings = ({ course, reload }: any) => {
  const initialOrder: NavKey[] = (Array.isArray(course.nav_order) && course.nav_order.length
    ? course.nav_order : defaultNavOrder()) as NavKey[];
  // Sanitize/repair against canonical list
  const repair = (arr: NavKey[]): NavKey[] => {
    const all = defaultNavOrder();
    const seen = new Set<NavKey>();
    const out: NavKey[] = [];
    for (const k of arr) if (all.includes(k) && !seen.has(k)) { out.push(k); seen.add(k); }
    for (const k of all) if (!seen.has(k)) out.push(k);
    return out;
  };

  const [order, setOrder] = useState<NavKey[]>(repair(initialOrder));
  const [visibility, setVisibility] = useState<Record<string, boolean>>(
    (course.nav_visibility && typeof course.nav_visibility === "object") ? course.nav_visibility : {}
  );
  const [saving, setSaving] = useState(false);

  const isVisible = (key: NavKey) => {
    const item = COURSE_NAV_ITEMS.find(i => i.key === key)!;
    const v = visibility[key];
    return v === undefined ? !item.hiddenByDefault : v;
  };

  const toggle = (key: NavKey) => {
    setVisibility(v => ({ ...v, [key]: !isVisible(key) }));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrder(next);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("courses").update({
      nav_order: order,
      nav_visibility: visibility,
    }).eq("id", course.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Navigation saved" }); reload(); }
  };

  return (
    <Card className="mt-4"><CardContent className="pt-6 space-y-4">
      <p className="text-sm text-muted-foreground">
        Reorder with the arrows. Click the eye to show or hide a tab from the student sidebar. Hidden tabs stay accessible to instructors via direct link. Every show/hide is recorded in the audit log below.
      </p>
      <ul className="border border-border rounded divide-y divide-border">
        {order.map((key, idx) => {
          const item = COURSE_NAV_ITEMS.find(i => i.key === key)!;
          const visible = isVisible(key);
          const Icon = item.icon;
          return (
            <li key={key} className={`flex items-center gap-2 px-3 py-2 ${visible ? "" : "bg-muted/40"}`}>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className={`flex-1 text-sm ${visible ? "" : "text-muted-foreground line-through"}`}>{item.label}</span>
              <Button size="sm" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === order.length - 1}><ArrowDown className="h-4 w-4" /></Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggle(key)}
                title={visible ? "Visible to students — click to hide" : "Hidden from students — click to show"}
                aria-label={visible ? `Hide ${item.label} from students` : `Show ${item.label} to students`}
              >
                {visible ? <Eye className="h-4 w-4 text-purple" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-2">
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Navigation"}</Button>
        <Link to={`/portal/courses/${course.id}`} className="text-sm text-purple hover:underline">
          Preview as student →
        </Link>
      </div>
      <NavAuditLog courseId={course.id} reloadKey={saving ? 1 : 0} />
    </CardContent></Card>
  );
};

const labelFor = (k: string) => COURSE_NAV_ITEMS.find(i => i.key === k)?.label ?? k;

const NavAuditLog = ({ courseId, reloadKey }: { courseId: string; reloadKey: number }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase.from("course_nav_audit").select("*")
      .eq("course_id", courseId).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, [courseId, reloadKey, open]);

  const summarize = (row: any): string => {
    const oldV = row.old_visibility || {};
    const newV = row.new_visibility || {};
    const keys = Array.from(new Set([...Object.keys(oldV), ...Object.keys(newV)]));
    const diffs: string[] = [];
    for (const k of keys) {
      const before = oldV[k];
      const after = newV[k];
      if (before !== after) {
        const becameVisible = after === true || (after === undefined && before === false);
        diffs.push(`${becameVisible ? "Showed" : "Hid"} ${labelFor(k)}`);
      }
    }
    if (JSON.stringify(row.old_order) !== JSON.stringify(row.new_order)) {
      diffs.push("Reordered tabs");
    }
    return diffs.length ? diffs.join(" · ") : "No visible change";
  };

  return (
    <div className="border border-border rounded">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold bg-muted/30 hover:bg-muted/50"
      >
        <span>Navigation Audit Log {rows.length > 0 && <span className="text-xs font-normal text-muted-foreground">({rows.length} entr{rows.length === 1 ? "y" : "ies"})</span>}</span>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="p-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-xs text-muted-foreground p-2">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-xs text-muted-foreground p-2">No changes recorded yet.</div>
          ) : (
            <ul className="divide-y divide-border text-xs">
              {rows.map(r => (
                <li key={r.id} className="px-2 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{summarize(r)}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-muted-foreground mt-0.5">by {r.changed_by_email || r.changed_by || "system"}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};



export default CourseEditor;
