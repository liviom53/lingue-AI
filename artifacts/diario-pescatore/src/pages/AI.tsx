import { useState } from "react";
import { Bot, Send, Mic, Waves } from "lucide-react";

export default function AI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ciao Livio! Sono il tuo assistente per la pesca. Dimmi cosa hai pescato oggi per registrarlo, oppure chiedimi un consiglio per la prossima uscita." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      // Direct call to Groq as specified in the implementation notes
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Sei un esperto pescatore del mar tirreno. Rispondi in italiano in modo breve, amichevole e pertinente." },
            { role: "user", content: userText }
          ]
        })
      });
      
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Scusa, le reti sono vuote oggi. (Errore di connessione)";
      
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Errore di comunicazione col server AI." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex flex-col bg-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-background/50 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-white leading-tight">Assistente Vocale AI</h2>
          <p className="text-xs text-primary">Groq LLaMA 3.3</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-background border border-white/5 text-foreground rounded-tl-sm'
            }`}>
              <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-background border border-white/5 rounded-2xl rounded-tl-sm p-4 flex gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/50 border-t border-white/5 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <button type="button" className="p-3 bg-secondary rounded-xl text-white hover:bg-secondary/80 transition-colors shrink-0">
            <Mic className="w-5 h-5" />
          </button>
          
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi o parla per registrare dati..."
            className="flex-1 bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          />
          
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
      
    </div>
  );
}
