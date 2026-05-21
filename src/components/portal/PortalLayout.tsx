import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, BookOpen, Users, Home } from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";

const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isInstructor, loading } = usePortalAuth(true);
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/portal/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Global sidebar */}
      <aside className="w-16 md:w-56 bg-charcoal text-primary-foreground flex flex-col">
        <Link to="/portal" className="p-4 flex items-center gap-2 border-b border-white/10">
          <GraduationCap className="h-6 w-6 text-cyan shrink-0" />
          <span className="hidden md:inline font-semibold text-sm">HSA Portal</span>
        </Link>
        <nav className="flex-1 p-2 space-y-1">
          <NavItem to="/portal" icon={Home} label="Dashboard" />
          <NavItem to="/portal/courses" icon={BookOpen} label="Courses" />
          {isInstructor && <NavItem to="/portal/teach" icon={Users} label="Teach" />}
        </nav>
        <div className="p-2 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 text-sm">
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <Link to={to} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 text-sm">
    <Icon className="h-4 w-4 shrink-0" />
    <span className="hidden md:inline">{label}</span>
  </Link>
);

export default PortalLayout;
