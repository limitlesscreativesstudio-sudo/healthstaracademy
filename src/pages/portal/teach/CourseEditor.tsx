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
import { Plus, Trash2, Upload, Eye, EyeOff, ArrowLeft, Sparkles, ListPlus } from "lucide-react";

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
    if (modules.length > 0 && !confirm("Course already has modules. Add the 17 CDPH modules anyway?")) return;
    const base = modules.length;
    const rows = CDPH_MODULES.map((title, i) => ({
      course_id: courseId, title, position: base + i, published: false,
    }));
    const { error } = await supabase.from("modules").insert(rows);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Seeded 17 CDPH modules" }); reload(); }
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
            <Sparkles className="h-4 w-4" /> Seed 17 CDPH Modules
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
  const [title, setTitle] = useState(course.title);
  const [code, setCode] = useState(course.code ?? "");
  const [term, setTerm] = useState(course.term ?? "");
  const [description, setDescription] = useState(course.description ?? "");
  const [status, setStatus] = useState(course.status);

  const save = async () => {
    const { error } = await supabase.from("courses").update({ title, code: code || null, term: term || null, description: description || null, status }).eq("id", course.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved" }); reload(); }
  };

  return (
    <Card className="mt-4"><CardContent className="pt-6 space-y-3">
      <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} /></div>
        <div><Label>Term</Label><Input value={term} onChange={e => setTerm(e.target.value)} /></div>
      </div>
      <div><Label>Description</Label><Textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft (hidden from students)</SelectItem>
            <SelectItem value="published">Published (visible to enrolled students)</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={save}>Save Changes</Button>
    </CardContent></Card>
  );
};

export default CourseEditor;
