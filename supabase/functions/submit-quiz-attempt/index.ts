import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate the caller
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const attemptId = typeof body?.attempt_id === "string" ? body.attempt_id : null;
    const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};
    if (!attemptId) {
      return new Response(JSON.stringify({ error: "attempt_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for trusted reads/writes
    const admin = createClient(SUPABASE_URL, SERVICE);

    // Load the attempt; must belong to caller and be unsubmitted
    const { data: attempt, error: aErr } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, submitted_at")
      .eq("id", attemptId)
      .maybeSingle();
    if (aErr || !attempt) {
      return new Response(JSON.stringify({ error: "Attempt not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (attempt.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (attempt.submitted_at) {
      return new Response(JSON.stringify({ error: "Already submitted" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load the quiz + questions (with correct answers) using service role
    const { data: quiz } = await admin.from("quizzes").select("id, course_id").eq("id", attempt.quiz_id).maybeSingle();
    if (!quiz) {
      return new Response(JSON.stringify({ error: "Quiz not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Instructor-graded model: we record the submission and the answers, but we
    // never score it here. The instructor grades and releases the score.
    const { data: questions } = await admin
      .from("quiz_questions")
      .select("id, points")
      .eq("quiz_id", attempt.quiz_id);

    const max = (questions ?? []).reduce((a, q) => a + (Number(q.points) || 0), 0);

    const submittedAt = new Date().toISOString();
    const { error: upErr } = await admin
      .from("quiz_attempts")
      .update({
        answers,
        submitted_at: submittedAt,
        score: null,
        max_score: null,
        grading_status: "awaiting",
      })
      .eq("id", attemptId);
    if (upErr) {
      return new Response(JSON.stringify({ error: upErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No grade row is written until the instructor releases a grade.
    await admin.from("grades").delete().eq("quiz_attempt_id", attemptId);

    return new Response(JSON.stringify({ success: true, awaiting_grading: true, max_score: max }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
