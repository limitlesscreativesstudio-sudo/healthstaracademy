import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SESSION_KEY = "hsa_concierge_session";

function getSession() {
  if (typeof window === "undefined") return "";
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

const ConciergeBubble = () => {
  const { pathname } = useLocation();
  const isApp = pathname.startsWith("/portal") || pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionToken = useRef(getSession());

  const transport = useRef(
    new DefaultChatTransport({
      api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-concierge`,
      headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: { sessionToken: sessionToken.current },
    })
  );

  const { messages, sendMessage, status } = useChat({
    id: sessionToken.current,
    transport: transport.current,
  });

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  if (isApp) return null;

  const onSend = async () => {
    const text = input.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask Health Star Academy"
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 rounded-full p-4 shadow-lg bg-[#319795] text-white hover:scale-105 transition"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[600px] bg-background border border-border rounded-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-3 border-b bg-[#2D2D47] text-white rounded-t-xl">
            <div>
              <div className="font-semibold text-sm">Ask Health Star Academy</div>
              <div className="text-xs opacity-80">Usually replies instantly</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 hover:bg-white/10 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Hi! I can answer questions about our CNA program — cost, schedule, requirements, locations, and more. What would you like to know?
              </div>
            )}
            {messages.map((m: UIMessage) => {
              const text = (m.parts ?? []).map((p: any) => p.type === "text" ? p.text : "").join("");
              return (
                <div key={m.id} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap ${m.role === "user" ? "bg-[#319795] text-white" : "bg-muted"}`}>
                    {text}
                  </div>
                </div>
              );
            })}
            {(status === "submitted" || status === "streaming") && messages[messages.length-1]?.role !== "assistant" && (
              <div className="text-sm"><Loader2 className="h-4 w-4 animate-spin inline" /></div>
            )}
          </div>
          <div className="p-2 border-t space-y-2">
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {[
                  "How much does the program cost?",
                  "When does the next cohort start?",
                  "What are the requirements?",
                  "Where are the clinical sites?",
                  "Do you offer financing?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage({ text: q })}
                    disabled={status === "submitted" || status === "streaming"}
                    className="text-xs px-2.5 py-1 rounded-full border border-[#319795]/40 text-[#319795] hover:bg-[#319795]/10 transition disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
                placeholder="Type your question…"
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#319795]"
              />
              <Button size="sm" onClick={onSend} disabled={status === "submitted" || status === "streaming"} className="bg-[#319795] hover:bg-[#2C7A7B]">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConciergeBubble;
