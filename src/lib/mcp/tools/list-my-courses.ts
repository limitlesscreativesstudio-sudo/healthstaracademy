import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_courses",
  title: "List my courses",
  description: "List the Health Star Academy courses the signed-in user can see in the portal.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not signed in");
    const { data, error } = await supabaseForUser(ctx)
      .from("courses")
      .select("id,title,code,term,status,start_at,end_at")
      .order("start_at", { ascending: false })
      .limit(100);
    if (error) throw new ToolError(error.message);
    const courses = (data ?? []).map((c: any) => ({
      id: String(c.id), name: String(c.title ?? ""), code: c.code ?? null, term: c.term ?? null,
      status: String(c.status ?? ""), start_at: c.start_at ?? null, end_at: c.end_at ?? null,
    }));
    return {
      content: [{ type: "text", text: courses.length ? courses.map((c) => `${c.id}: ${c.name}${c.term ? ` (${c.term})` : ""}`).join("\n") : "No courses found." }],
      structuredContent: { courses },
    };
  },
});
