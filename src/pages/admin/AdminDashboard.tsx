import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LogOut, Users, GraduationCap, Mail, Activity, RefreshCw, LayoutDashboard } from "lucide-react";
import StudentPipeline from "./components/StudentPipeline";
import CohortManager from "./components/CohortManager";
import CohortOpsHub from "./components/CohortOpsHub";
import EmailLog from "./components/EmailLog";
import WebhookInfo from "./components/WebhookInfo";

type Tab = "pipeline" | "cohorts" | "cohort_hub" | "emails" | "webhooks";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("pipeline");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { id: "pipeline" as Tab, label: "Student Pipeline", icon: Users },
    { id: "cohorts" as Tab, label: "Cohorts", icon: GraduationCap },
    { id: "cohort_hub" as Tab, label: "Cohort Hub", icon: LayoutDashboard },
    { id: "emails" as Tab, label: "Email Log", icon: Mail },
    { id: "webhooks" as Tab, label: "Zapier Setup", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Top bar */}
      <header className="bg-background border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-xl font-bold text-foreground">HSA Admin</h1>
          <span className="text-muted-foreground text-sm hidden md:inline">Enrollment Management</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-background">
        <div className="flex gap-1 px-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === "pipeline" && <StudentPipeline />}
        {activeTab === "cohorts" && <CohortManager />}
        {activeTab === "cohort_hub" && <CohortOpsHub />}
        {activeTab === "emails" && <EmailLog />}
        {activeTab === "webhooks" && <WebhookInfo />}
      </div>
    </div>
  );
};

export default AdminDashboard;
