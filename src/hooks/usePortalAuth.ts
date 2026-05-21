import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type PortalRole = "admin" | "instructor" | "student";

export const usePortalAuth = (require: boolean = true) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadRoles = async (uid: string) => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (mounted) setRoles((data ?? []).map(r => r.role as PortalRole));
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => loadRoles(session.user.id), 0);
      } else {
        setRoles([]);
        if (require) navigate("/portal/login", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadRoles(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
        if (require) navigate("/portal/login", { replace: true });
      }
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate, require]);

  const isInstructor = roles.includes("instructor") || roles.includes("admin");
  const isAdmin = roles.includes("admin");

  return { user, roles, loading, isInstructor, isAdmin };
};
