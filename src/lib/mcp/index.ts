import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyCourses from "./tools/list-my-courses";
import listCourseQuizzes from "./tools/list-course-quizzes";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "health-star-academy",
  title: "Health Star Academy",
  version: "0.1.0",
  instructions: "Read-only tools for the Health Star Academy portal. Results respect the signed-in user's portal permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMyCourses, listCourseQuizzes],
});
