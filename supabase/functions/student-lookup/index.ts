import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

    // Authenticate: require webhook secret or admin JWT
    const incomingSecret = req.headers.get("x-webhook-secret");
    const authHeader = req.headers.get("authorization");
    let authenticated = false;

    if (WEBHOOK_SECRET && incomingSecret === WEBHOOK_SECRET) {
      authenticated = true;
    }

    if (!authenticated && authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error: authError } = await supabaseAuth.auth.getUser(token);
      if (!authError && data?.user) {
        const { data: roles } = await supabaseAuth
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin");
        if (roles && roles.length > 0) {
          authenticated = true;
        }
      }
    }

    if (!authenticated) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const url = new URL(req.url);
    const method = req.method;

    // GET: query students by id, email, or list all
    if (method === "GET") {
      const studentId = url.searchParams.get("id");
      const email = url.searchParams.get("email");
      const status = url.searchParams.get("status");
      const cohortId = url.searchParams.get("cohort_id");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const offset = parseInt(url.searchParams.get("offset") || "0");

      // Single student lookup by ID
      if (studentId) {
        const { data, error } = await supabase
          .from("admin_students_view")
          .select("*")
          .eq("id", studentId)
          .single();

        if (error || !data) {
          return new Response(JSON.stringify({ error: "Student not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Also fetch email history
        const { data: emails } = await supabase
          .from("enrollment_emails")
          .select("*")
          .eq("student_id", studentId)
          .order("sent_at", { ascending: false });

        return new Response(JSON.stringify({ student: data, emails: emails || [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Lookup by email
      if (email) {
        const { data, error } = await supabase
          .from("admin_students_view")
          .select("*")
          .eq("email", email);

        return new Response(JSON.stringify({ students: data || [], count: data?.length || 0 }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // List with filters
      let query = supabase
        .from("admin_students_view")
        .select("*", { count: "exact" });

      if (status) query = query.eq("enrollment_status", status);
      if (cohortId) query = query.eq("cohort_id", cohortId);

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return new Response(
        JSON.stringify({ students: data || [], count: count || 0, limit, offset }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Student lookup error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
