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
    const { data: questions } = await admin
      .from("quiz_questions")
      .select("id, question_type, points, correct_answer")
      .eq("quiz_id", attempt.quiz_id);

    let score = 0;
    let max = 0;
    for (const q of questions ?? []) {
      const pts = Number(q.points) || 0;
      max += pts;
      const ans = (answers as Record<string, unknown>)[q.id];
      if (ans === undefined || ans === null) continue;
      if (q.question_type === "multiple_choice") {
        if (Number(ans) === Number(q.correct_answer)) score += pts;
      } else if (q.question_type === "true_false") {
        if (String(ans) === String(q.correct_answer)) score += pts;
      } else if (q.question_type === "short_answer") {
        if (q.correct_answer && String(ans).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase()) {
          score += pts;
        }
      }
    }

    const submittedAt = new Date().toISOString();
    const { error: upErr } = await admin
      .from("quiz_attempts")
      .update({ answers, score, max_score: max, submitted_at: submittedAt })
      .eq("id", attemptId);
    if (upErr) {
      return new Response(JSON.stringify({ error: upErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("grades").insert({
      course_id: quiz.course_id, user_id: userId, quiz_attempt_id: attemptId,
      score, max_score: max, feedback: "Auto-graded",
    });

    return new Response(JSON.stringify({ success: true, score, max_score: max }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
