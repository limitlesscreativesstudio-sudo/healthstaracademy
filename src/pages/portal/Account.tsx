import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";

const Account = () => {
  const { user, isInstructor, isAdmin } = usePortalAuth(true);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      setFullName(data?.full_name ?? "");
      setAvatarUrl(data?.avatar_url ?? "");
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, full_name: fullName, avatar_url: avatarUrl || null },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  if (!user) return null;

  const initials = (fullName || user.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <PortalLayout>
      <div className="px-6 py-5 max-w-3xl mx-auto w-full">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-5">Account</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground">{user.email}</div>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded bg-purple/10 text-purple text-xs font-medium">
                      Admin
                    </span>
                  )}
                  {isInstructor && (
                    <span className="px-2 py-0.5 rounded bg-cyan/10 text-cyan text-xs font-medium">
                      Instructor
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">
                    Student
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground">
                Email is managed by your sign-in provider.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving || loading}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default Account;
