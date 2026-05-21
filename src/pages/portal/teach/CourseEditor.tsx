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
import { Plus, Trash2, Upload, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePortalAuth } from "@/hooks/usePortalAuth";

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
          <TabsList>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <ModulesEditor courseId={courseId!} modules={modules} items={items} reload={load} />
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

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="pt-6 flex gap-2">
        <Input placeholder="New module title…" value={newModule} onChange={e => setNewModule(e.target.value)} onKeyDown={e => e.key === "Enter" && addModule()} />
        <Button onClick={addModule}><Plus className="h-4 w-4" /> Add</Button>
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
                <span className="flex-1">{i.title}</span>
                <Button size="sm" variant="ghost" onClick={async () => {
                  await supabase.from("module_items").update({ published: !i.published }).eq("id", i.id);
                  reload();
                }}>{i.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
                <Button size="sm" variant="ghost" onClick={async () => {
                  if (confirm("Delete?")) { await supabase.from("module_items").delete().eq("id", i.id); reload(); }
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <AddItemDialog moduleId={m.id} courseId={courseId} position={items.filter((i: any) => i.module_id === m.id).length} reload={reload} />
          </CardContent>
        </Card>
      ))}
    </div>
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
  const [email, setEmail] = useState("");

  const load = async () => {
    const { data } = await supabase.from("enrollments").select("*").eq("course_id", courseId);
    if (!data) return setEnrollments([]);
    const userIds = data.map(e => e.user_id);
    const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
    setEnrollments(data.map(e => ({ ...e, full_name: profs?.find(p => p.user_id === e.user_id)?.full_name })));
  };
  useEffect(() => { load(); }, [courseId]);

  const addStudent = async () => {
    if (!email.trim()) return;
    // Look up user by email via profiles isn't possible (no email column). Use lookup edge function pattern: try the existing student_lookup-style approach with admin RPC.
    // Simpler approach: search profiles where full_name matches OR ask admin to look up via Cloud
    toast({
      title: "Manual enrollment needed",
      description: "Student must have created a portal account first. Ask an admin to enroll them by user ID from the admin dashboard. (CSV/email invite coming in next phase.)",
    });
    setEmail("");
  };

  const removeEnrollment = async (id: string) => {
    await supabase.from("enrollments").delete().eq("id", id);
    load();
  };

  return (
    <Card className="mt-4"><CardContent className="pt-6 space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Student email…" value={email} onChange={e => setEmail(e.target.value)} />
        <Button onClick={addStudent}>Enroll</Button>
      </div>
      <div className="text-sm">
        {enrollments.length === 0 ? <p className="text-muted-foreground">No students enrolled.</p> : (
          <ul className="space-y-1">
            {enrollments.map(e => (
              <li key={e.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>{e.full_name ?? e.user_id}</span>
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
