import { useState, useRef, useEffect } from "react";
import { Bot, Send, Mic, MicOff, AlertCircle, Settings } from "lucide-react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { loadSpotConfig } from "./Impostazioni";

interface Message { role: "user" | "assistant"; content: string; }

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AI() {
  const spotConfig = loadSpotConfig();
  const spotLabel = spotConfig?.nome?.trim() || null;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: spotLabel
        ? `Ciao! Sono il tuo assistente AI, specializzato su **${spotLabel}**. Chiedimi previsioni, consigli su tecniche, esche e posizionamento — oppure dimmi cosa hai pescato e lo registro nel tuo Diario. 🎣`
        : "Ciao! Sono il tuo assistente AI per la pesca. Chiedimi previsioni, consigli su tecniche, esche e spot — oppure dimmi cosa hai pescato e lo registro nel tuo Diario. 🎣"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    setInput("");
    setError(null);
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsTyping(true);
    try {
      const spotConfig = loadSpotConfig();
      const res = await fetch("/api/ai/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, spotConfig }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Errore ${res.status}`);
      }
      const reply = data.reply ?? "Nessuna risposta ricevuta.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      const sid = localStorage.getItem("_diario_sid") ?? undefined;
      fetch("/api/stats/track/diario_ai_call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      }).catch(() => {});
    } catch (err: any) {
      const msg = err.message || "Errore di connessione.";
      setError(msg);
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Riconoscimento vocale non supportato su questo browser."); return; }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "it-IT";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex flex-col bg-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-background/50 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-white leading-tight">Assistente AI</h2>
          <p className="text-xs text-primary truncate">
            DeepSeek · {spotLabel ? spotLabel : "Costa Italiana"}
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline truncate max-w-[160px]">{error}</span>
          </div>
        )}
        <Link href="/impostazioni" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0" title="Configura il tuo spot">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mr-3 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-background border border-white/5 text-foreground rounded-tl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none
                  [&>p]:mb-2 [&>p:last-child]:mb-0
                  [&>ul]:mb-2 [&>ul]:pl-4 [&>ul>li]:mb-1
                  [&>ol]:mb-2 [&>ol]:pl-4 [&>ol>li]:mb-1
                  [&>strong]:text-primary [&>ul>li>strong]:text-primary
                  [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mr-3">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-background border border-white/5 rounded-2xl rounded-tl-sm p-4 flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:100ms]" />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:200ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-background/50 border-t border-white/5 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button type="button" onClick={toggleVoice}
            className={`p-3 rounded-xl transition-colors shrink-0 ${listening ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-secondary text-white hover:bg-secondary/80"}`}>
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={listening ? "In ascolto…" : "Previsioni, consigli, registra catture…"}
            className="flex-1 bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm" />
          <button type="submit" disabled={!input.trim() || isTyping}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0">
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
          DeepSeek · storico conversazione incluso · italiano
        </p>
      </div>
    </div>
  );
}
