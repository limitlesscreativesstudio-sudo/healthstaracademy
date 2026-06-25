import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  endpoint: "agent-advocate" | "agent-mentor";
  title: string;
  greeting: string;
  accent?: string;
}

const AgentChat = ({ endpoint, title, greeting, accent = "#7C4DFF" }: Props) => {
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  const transport = useRef<DefaultChatTransport<UIMessage> | null>(null);
  useEffect(() => {
    if (!token) return;
    transport.current = new DefaultChatTransport({
      api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [token, endpoint]);

  const { messages, sendMessage, status } = useChat({
    id: endpoint,
    transport: transport.current ?? new DefaultChatTransport({ api: "/noop" }),
  });

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  const onSend = async () => {
    const t = input.trim();
    if (!t || !token || status === "submitted" || status === "streaming") return;
    setInput("");
    await sendMessage({ text: t });
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-background">
      <div className="p-3 border-b font-semibold" style={{ color: accent }}>{title}</div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && <div className="text-sm text-muted-foreground">{greeting}</div>}
        {messages.map((m) => {
          const text = (m.parts ?? []).map((p: any) => p.type === "text" ? p.text : "").join("");
          return (
            <div key={m.id} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
              <div className={`inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap ${m.role === "user" ? "text-white" : "bg-muted"}`} style={m.role === "user" ? { background: accent } : undefined}>
                {text}
              </div>
            </div>
          );
        })}
        {(status === "submitted" || status === "streaming") && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
          placeholder="Ask anything…"
          className="flex-1 px-3 py-2 text-sm border rounded-md"
          disabled={!token}
        />
        <Button size="sm" onClick={onSend} disabled={!token || status === "submitted" || status === "streaming"} style={{ background: accent }}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AgentChat;
