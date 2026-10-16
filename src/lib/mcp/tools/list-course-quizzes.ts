import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_course_quizzes",
  title: "List course quizzes",
  description: "List quizzes, case studies and exams in a course the signed-in user can access.",
  inputSchema: { course_id: z.string().uuid().describe("Course ID from list_my_courses.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ course_id }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not signed in");
    const { data, error } = await supabaseForUser(ctx)
      .from("quizzes")
      .select("id,title,published,due_at,total_points,time_limit_minutes,attempts_allowed")
      .eq("course_id", course_id)
      .order("title")
      .limit(200);
    if (error) throw new ToolError(error.message);
    const quizzes = (data ?? []).map((q: any) => ({
      id: String(q.id), title: String(q.title ?? ""), published: Boolean(q.published),
      due_at: q.due_at ?? null, total_points: Number(q.total_points ?? 0),
      time_limit_minutes: q.time_limit_minutes ?? null, attempts_allowed: Number(q.attempts_allowed ?? 1),
    }));
    return {
      content: [{ type: "text", text: quizzes.length ? quizzes.map((q) => `${q.title} — ${q.total_points} pts${q.published ? "" : " (unpublished)"}`).join("\n") : "No quizzes found." }],
      structuredContent: { quizzes },
    };
  },
});
