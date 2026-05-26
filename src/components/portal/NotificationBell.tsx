import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Megaphone, Inbox as InboxIcon, Info, Check } from "lucide-react";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const iconFor = (kind: string) => {
  if (kind === "announcement") return Megaphone;
  if (kind === "submission") return InboxIcon;
  return Info;
};

const NotificationBell = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id, kind, title, body, link, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(15);
    setItems(data ?? []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`notif-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unread = items.filter(i => !i.read_at).length;

  const markAllRead = async () => {
    const ids = items.filter(i => !i.read_at).map(i => i.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    load();
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    load();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded hover:bg-muted"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="font-semibold text-sm">Notifications</div>
          {unread > 0 && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={markAllRead}>
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">You're all caught up.</div>
          ) : items.map(n => {
            const Icon = iconFor(n.kind);
            const Body = (
              <div className={`flex gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/40 ${!n.read_at ? "bg-purple/5" : ""}`}>
                <div className="mt-0.5"><Icon className={`h-4 w-4 ${!n.read_at ? "text-purple" : "text-muted-foreground"}`} /></div>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm leading-snug ${!n.read_at ? "font-semibold text-foreground" : "text-foreground/80"}`}>{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>}
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => { setOpen(false); markRead(n.id); }}>{Body}</Link>
            ) : (
              <button key={n.id} className="w-full text-left" onClick={() => markRead(n.id)}>{Body}</button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
