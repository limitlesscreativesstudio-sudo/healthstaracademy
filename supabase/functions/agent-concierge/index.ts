import { convertToModelMessages, streamText, type UIMessage } from "npm:ai";
import { createLovableAiGatewayProvider, corsHeaders } from "../_shared/ai-gateway.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SYSTEM = `You are the Concierge for Health Star Academy, a CNA training program in California (Stockton, Lodi, Hayward, Sacramento, Bay Area).

Speak warmly, professionally, and with compassion. Always use the exact name "Health Star Academy".

Key facts you can share:
- Hybrid program: online theory + in-person clinicals in Stockton, Lodi, or Hayward.
- Total tuition: $2,499 ($175 enrollment fee + balance). Financing available via Denefits.
- Tracks: 6-week Daytime OR 8-weekend program.
- 14-day enrollment deadline before each cohort start.
- Entrance exam (75% passing) required only if no high school diploma.
- Required documents: physical original government ID, Social Security card, proof of good health, reliable transportation.
- CDPH-approved, BBB-accredited.
- Phone/contact: direct to Contact page. Pre-qualification form at /pre-qualification.

Use "career support" (not "job placement"). Avoid the word "flexible".

When a prospective student is ready to enroll or wants a decision on eligibility, point them to the pre-qualification form at /pre-qualification. Keep replies concise (under 120 words) unless asked for detail. Use markdown for lists/links.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500, headers: corsHeaders });

    const body = await req.json();
    const messages = body.messages as UIMessage[];
    const conversationId: string | undefined = body.conversationId;
    const sessionToken: string | undefined = body.sessionToken;

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const result = streamText({
      model,
      system: SYSTEM,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        // Persist conversation in background
        try {
          const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          let convoId = conversationId;
          if (!convoId && sessionToken) {
            const { data } = await supabase
              .from("agent_conversations")
              .insert({ agent: "concierge", session_token: sessionToken })
              .select("id")
              .single();
            convoId = data?.id;
          }
          if (convoId) {
            const last = messages[messages.length - 1];
            const userText = (last?.parts ?? []).map((p: any) => p.type === "text" ? p.text : "").join("");
            await supabase.from("agent_messages").insert([
              { conversation_id: convoId, role: "user", content: userText },
              { conversation_id: convoId, role: "assistant", content: text },
            ]);
          }
        } catch (e) {
          console.error("persist error", e);
        }
      },
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("concierge error", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
