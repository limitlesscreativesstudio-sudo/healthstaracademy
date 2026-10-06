import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Question types that can be graded by the answer key without a human.
const AUTO_TYPES = new Set(["multiple_choice", "true_false", "multiple_answers"]);

const norm = (v: unknown) =>
  typeof v === "string" ? v.trim().toLowerCase() : v;

function isCorrect(type: string, expected: unknown, given: unknown): boolean {
  if (expected === null || expected === undefined || given === undefined || given === null) return false;
  if (type === "multiple_answers") {
    const e = (Array.isArray(expected) ? expected : [expected]).map(norm).sort();
    const g = (Array.isArray(given) ? given : [given]).map(norm).sort();
    return e.length > 0 && e.length === g.length && e.every((v, i) => v === g[i]);
  }
  return norm(expected) === norm(given);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const attemptId = typeof body?.attempt_id === "string" ? body.attempt_id : null;
    const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};
    if (!attemptId) return json({ error: "attempt_id required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: attempt, error: aErr } = await admin
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, submitted_at")
      .eq("id", attemptId)
      .maybeSingle();
    if (aErr || !attempt) return json({ error: "Attempt not found" }, 404);
    if (attempt.user_id !== userId) return json({ error: "Forbidden" }, 403);
    if (attempt.submitted_at) return json({ error: "Already submitted" }, 400);

    const { data: quiz } = await admin
      .from("quizzes").select("id, course_id, answer_key_status").eq("id", attempt.quiz_id).maybeSingle();
    if (!quiz) return json({ error: "Quiz not found" }, 404);

    const { data: questions } = await admin
      .from("quiz_questions")
      .select("id, points, question_type, correct_answer, key_unverified")
      .eq("quiz_id", attempt.quiz_id);

    // ── Auto-correct every question that has a TRUSTWORTHY answer key ────────
    // Guard: some legacy quizzes were imported with a placeholder key where every
    // choice question points at option A. Scoring against that would be wrong, so
    // the whole quiz falls back to instructor grading.
    const choiceKeys = (questions ?? [])
      .filter((q) => AUTO_TYPES.has(String(q.question_type)) && q.correct_answer !== null && q.correct_answer !== undefined)
      .map((q) => JSON.stringify(q.correct_answer));
    const keySuspect = quiz.answer_key_status !== "verified" && choiceKeys.length >= 4 && new Set(choiceKeys).size === 1;

    const questionScores: Record<string, number> = {};
    const perQuestion: { qid: string; auto: boolean; correct: boolean; points: number }[] = [];
    let max = 0;
    let earned = 0;
    let needsHuman = false;

    for (const q of questions ?? []) {
      const points = Number(q.points) || 0;
      max += points;
      const keyed = q.correct_answer !== null && q.correct_answer !== undefined;
      // key_unverified = answer not confirmed by an instructor document; send to instructor.
      const auto = !keySuspect && !q.key_unverified && AUTO_TYPES.has(String(q.question_type)) && keyed;
      if (!auto) {
        needsHuman = true;
        perQuestion.push({ qid: q.id, auto: false, correct: false, points: 0 });
        continue;
      }
      const ok = isCorrect(String(q.question_type), q.correct_answer, (answers as any)[q.id]);
      const got = ok ? points : 0;
      earned += got;
      questionScores[q.id] = got;
      perQuestion.push({ qid: q.id, auto: true, correct: ok, points: got });
    }

    const submittedAt = new Date().toISOString();
    // Fully auto-gradable → release the score immediately.
    // Mixed quizzes keep the auto marks but wait for the instructor on the rest.
    const releasedNow = !needsHuman && (questions ?? []).length > 0;

    const { error: upErr } = await admin
      .from("quiz_attempts")
      .update({
        answers,
        submitted_at: submittedAt,
        question_scores: questionScores,
        score: releasedNow ? earned : null,
        max_score: releasedNow ? max : null,
        grading_status: releasedNow ? "released" : "awaiting",
        graded_at: releasedNow ? submittedAt : null,
      })
      .eq("id", attemptId);
    if (upErr) return json({ error: upErr.message }, 500);

    await admin.from("grades").delete().eq("quiz_attempt_id", attemptId);
    if (releasedNow) {
      await admin.from("grades").insert({
        course_id: quiz.course_id,
        user_id: userId,
        quiz_attempt_id: attemptId,
        score: earned,
        max_score: max,
        graded_at: submittedAt,
      });
    }

    return json({
      success: true,
      auto_graded: releasedNow,
      awaiting_grading: !releasedNow,
      score: releasedNow ? earned : null,
      max_score: max,
      per_question: perQuestion,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
