import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, BookOpen, Users, LayoutDashboard, Calendar, Inbox, History, HelpCircle, User, TrendingUp, ArrowLeft } from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import NotificationBell from "./NotificationBell";



const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isInstructor, loading } = usePortalAuth(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Track recent page visits for History page
  if (typeof window !== 'undefined') {
    try {
      const key = 'hsa.recent.pages';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const label = document?.title || location.pathname;
      const path = location.pathname + location.hash;
      if (!list[0] || list[0].path !== path) {
        list.unshift({ path, label, visited_at: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(list.slice(0, 30)));
      }
    } catch {}
  }

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/portal/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Canvas-style icon rail */}
      <aside className="w-[72px] bg-charcoal text-primary-foreground flex flex-col items-center py-3 shrink-0">
        <Link to="/portal" className="mb-2 p-2 rounded hover:bg-white/10" title="Health Star Academy">
          <GraduationCap className="h-7 w-7 text-cyan" />
        </Link>
        <Link
          to="/portal"
          className="mb-3 w-10 h-10 flex items-center justify-center rounded-lg bg-cyan text-charcoal hover:bg-cyan/90"
          title="Back to Dashboard"
        >
          <LayoutDashboard className="h-5 w-5" />
        </Link>
        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          <RailItem to="/portal/account" icon={User} label="Account" />
          <RailItem to="/portal" icon={LayoutDashboard} label="Dashboard" exact />
          <RailItem to="/portal/courses" icon={BookOpen} label="Courses" />
          <RailItem to="/portal/career" icon={TrendingUp} label="Career" />
          <RailItem to="/portal/calendar" icon={Calendar} label="Calendar" />
          <RailItem to="/portal/inbox" icon={Inbox} label="Inbox" />
          <RailItem to="/portal/history" icon={History} label="History" />
          <RailItem to="/portal/help" icon={HelpCircle} label="Help" />
          {isInstructor && <RailItem to="/portal/teach" icon={Users} label="Teach" />}
        </nav>
        <div className="flex flex-col items-center gap-1 w-full px-2">
          <button onClick={logout} className="group relative w-full flex flex-col items-center gap-0.5 py-2 rounded hover:bg-white/10" title="Sign Out">
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] leading-tight">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-x-hidden min-w-0">
        <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="text-sm text-muted-foreground truncate">{user.email}</div>
          <div className="flex items-center gap-1">
            <NotificationBell userId={user.id} />
            <Button size="sm" variant="ghost" onClick={logout} className="gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-background">{children}</div>
      </main>
    </div>
  );
};

const RailItem = ({ to, icon: Icon, label, exact }: { to: string; icon: any; label: string; exact?: boolean }) => {
  const location = useLocation();
  const active = exact ? location.pathname === to : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`w-full flex flex-col items-center gap-0.5 py-2 rounded text-center ${active ? "bg-white/15 text-cyan" : "hover:bg-white/10"}`}
      title={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] leading-tight">{label}</span>
    </Link>
  );
};

export default PortalLayout;
