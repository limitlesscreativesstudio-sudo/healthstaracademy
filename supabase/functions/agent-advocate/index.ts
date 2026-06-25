import { convertToModelMessages, streamText, type UIMessage } from "npm:ai";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SYSTEM = `You are the Advocate, a supportive AI assistant for Health Star Academy students.

Help students with: assignments, deadlines, attendance, grades, clinical hours, study tips, and exam prep.
Be encouraging, clear, and concise. Use markdown. If a student needs human help, direct them to message their instructor or email healthstaracademy01@gmail.com.

You have access to read-only context about the asking student that the route attaches below.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500, headers: corsHeaders });

    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const messages = body.messages as UIMessage[];

    // Pull a small context snapshot
    const [{ data: enrollments }, { data: grades }, { data: attendance }] = await Promise.all([
      supabase.from("enrollments").select("course_id").eq("user_id", userId),
      supabase.from("grades").select("score, max_score, assignment_id").eq("user_id", userId).limit(10),
      supabase.from("attendance").select("status, date").eq("user_id", userId).order("date", { ascending: false }).limit(10),
    ]);

    const ctx = `Student context:\n- enrollments: ${enrollments?.length ?? 0}\n- recent grades: ${JSON.stringify(grades ?? []).slice(0,500)}\n- recent attendance: ${JSON.stringify(attendance ?? []).slice(0,500)}`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM + "\n\n" + ctx,
      messages: await convertToModelMessages(messages),
    });
    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
