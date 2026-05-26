import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Plus, MoreVertical, Pencil, Trash2, Home, ScrollText, Copy as CopyIcon,
  ArrowLeft, FileText, Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type Page = {
  id: string; course_id: string; title: string; body_html: string;
  created_at: string; updated_at: string;
};

const PagesTab = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lms_pages")
      .select("*")
      .eq("course_id", courseId)
      .order("updated_at", { ascending: false });
    setPages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  if (editing || creating) {
    return (
      <PageEditor
        page={editing}
        courseId={courseId}
        onCancel={() => { setEditing(null); setCreating(false); }}
        onSaved={() => { setEditing(null); setCreating(false); load(); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3 mb-4">
        <h2 className="font-heading text-2xl font-bold">Pages</h2>
        {isInstructor && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Page
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground p-4">Loading…</div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              {isInstructor ? "No pages yet. Create your first page." : "No pages have been published."}
            </p>
            {isInstructor && (
              <Button onClick={() => setCreating(true)} className="bg-purple text-white hover:bg-purple/90">
                <Plus className="h-4 w-4" /> Create a Page
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <div className="grid grid-cols-[1fr_180px_60px] bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <div className="px-4 py-2">Page Title</div>
            <div className="px-4 py-2">Last Edited</div>
            <div className="px-4 py-2"></div>
          </div>
          {pages.map(p => (
            <PageRow key={p.id} page={p} isInstructor={isInstructor}
              onEdit={() => setEditing(p)} onReload={load} />
          ))}
        </div>
      )}
    </div>
  );
};

const PageRow = ({ page, isInstructor, onEdit, onReload }: {
  page: Page; isInstructor: boolean; onEdit: () => void; onReload: () => void;
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const useAsFrontPage = async () => {
    await supabase.from("courses").update({
      home_page_type: "front_page",
      front_page_html: page.body_html,
    }).eq("id", page.course_id);
    toast({ title: "Set as Home Page", description: `"${page.title}" now shows on the course home.` });
  };

  const useAsSyllabus = async () => {
    await supabase.from("courses").update({
      syllabus_html: page.body_html,
    }).eq("id", page.course_id);
    toast({ title: "Set as Syllabus", description: `"${page.title}" copied into the Syllabus.` });
  };

  const duplicate = async () => {
    await supabase.from("lms_pages").insert({
      course_id: page.course_id,
      title: `${page.title} (Copy)`,
      body_html: page.body_html,
    });
    toast({ title: "Page duplicated" });
    onReload();
  };

  const remove = async () => {
    await supabase.from("lms_pages").delete().eq("id", page.id);
    toast({ title: "Page deleted" });
    onReload();
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_180px_60px] border-t border-border hover:bg-muted/30 text-sm items-center">
        <button onClick={() => setPreviewOpen(true)} className="px-4 py-3 text-left flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-purple shrink-0" />
          <span className="font-medium truncate hover:underline">{page.title}</span>
        </button>
        <div className="px-4 py-3 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
        </div>
        <div className="px-2 py-3 text-right">
          {isInstructor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 hover:bg-muted rounded" aria-label="Page options">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={duplicate}>
                  <CopyIcon className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={useAsFrontPage}>
                  <Home className="h-4 w-4 mr-2" /> Use as Front Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={useAsSyllabus}>
                  <ScrollText className="h-4 w-4 mr-2" /> Use as Syllabus
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{page.title}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the page permanently. Any module items pointing to it will become empty links.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {previewOpen && (
        <PagePreview page={page} onClose={() => setPreviewOpen(false)} onEdit={onEdit} isInstructor={isInstructor} />
      )}
    </>
  );
};

const PagePreview = ({ page, onClose, onEdit, isInstructor }: {
  page: Page; onClose: () => void; onEdit: () => void; isInstructor: boolean;
}) => {
  const sanitized = DOMPurify.sanitize(page.body_html || "<p><em>This page is empty.</em></p>");
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" /> Back to Pages
          </Button>
          {isInstructor && (
            <Button size="sm" variant="outline" onClick={() => { onClose(); onEdit(); }}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>
        <h1 className="font-heading text-3xl font-bold mb-6">{page.title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitized }} />
      </div>
    </div>
  );
};

const PageEditor = ({ page, courseId, onCancel, onSaved }: {
  page: Page | null; courseId: string; onCancel: () => void; onSaved: () => void;
}) => {
  const [title, setTitle] = useState(page?.title ?? "");
  const [body, setBody] = useState(page?.body_html ?? "");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (page) {
      const { error } = await supabase.from("lms_pages")
        .update({ title: title.trim(), body_html: body })
        .eq("id", page.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Page updated" });
    } else {
      const { error } = await supabase.from("lms_pages")
        .insert({ course_id: courseId, title: title.trim(), body_html: body });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Page created" });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h2 className="font-heading text-xl font-bold">{page ? "Edit Page" : "New Page"}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4" /> {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : page ? "Save Page" : "Create Page"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Page Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Course Overview, Week 1 Reading" />
          </div>

          {showPreview ? (
            <div>
              <Label>Preview</Label>
              <div className="border border-border rounded-md p-4 min-h-[400px] prose max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body || "<p><em>Nothing to preview yet.</em></p>") }} />
            </div>
          ) : (
            <div>
              <Label>Body (HTML supported)</Label>
              <Textarea
                rows={20}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your content here. You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;a href&gt;, &lt;strong&gt;, &lt;img src&gt;, &lt;iframe&gt; (for videos), etc."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Once saved, use the page menu to publish it as your course Home Page, copy it to the Syllabus, or attach it to a Module item.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PagesTab;
