import { useState } from "react";
import { CloudSun, Info, MapPin, Waves, Wind, Thermometer, ChevronLeft, ChevronRight, Moon, Fish, Bot } from "lucide-react";

// Mocking the complex forecast logic for the frontend
export default function Previsioni() {
  const [activeTab, setActiveTab] = useState("dati");
  const [dayOffset, setDayOffset] = useState(0);

  const TABS = [
    { id: "dati", label: "📊 Dati" },
    { id: "tecnica", label: "🎣 Tecnica" },
    { id: "esche", label: "🪱 Esche" },
    { id: "specie", label: "🐟 Specie" },
    { id: "campo", label: "🌊 Campo" },
    { id: "ai", label: "🤖 AI" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Previsioni Pesca</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Porto Badino (Canale Portatore)
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border border-white/5">
          <button 
            disabled={dayOffset <= 0} 
            onClick={() => setDayOffset(p => p - 1)}
            className="p-1 disabled:opacity-30 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-sm w-24 text-center">
            {dayOffset === 0 ? "Oggi" : dayOffset === 1 ? "Domani" : `+${dayOffset} Giorni`}
          </span>
          <button 
            disabled={dayOffset >= 4}
            onClick={() => setDayOffset(p => p + 1)}
            className="p-1 disabled:opacity-30 hover:text-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Forecast Card */}
      <div className="bg-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Header / Score Area */}
        <div className="p-6 bg-gradient-to-br from-card to-background border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-primary font-bold uppercase tracking-widest mb-1">Indice Pescabilità</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-display font-black text-white">84</span>
                <span className="text-xl text-muted-foreground font-medium">/ 100</span>
              </div>
              <p className="text-sm text-green-400 mt-2 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Condizioni Ottimali
              </p>
            </div>
            
            <div className="w-24 h-24 relative">
              {/* Circular progress visualizer */}
              <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-primary" strokeDasharray="84, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Fish className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-background/50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[400px]">
          {activeTab === "dati" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DataPill icon={Waves} label="Marea" value="+28pt" desc="Picco h 18:30" />
                <DataPill icon={Moon} label="Luna" value="+15pt" desc="Ultimo quarto" />
                <DataPill icon={Thermometer} label="Acqua" value="16.5°C" desc="SST Marino" />
                <DataPill icon={Wind} label="Vento" value="NNE 8kn" desc="Spalle alla foce" />
                <DataPill icon={CloudSun} label="Meteo" value="Sereno" desc="Stabile" />
                <DataPill icon={Info} label="Moltiplicatore" value="x1.2" desc="Marea + Luna" />
              </div>
              
              <div className="bg-background rounded-2xl p-4 border border-white/5">
                <h4 className="font-bold text-sm mb-4 text-muted-foreground uppercase">Andamento Orario</h4>
                <div className="h-32 flex items-end justify-between gap-1 mt-4">
                  {/* Dummy chart bars */}
                  {[40,45,50,65,80,84,70,50].map((h, i) => (
                    <div key={i} className="w-full flex flex-col items-center gap-2 group">
                      <div className="w-full bg-primary/20 rounded-t-sm relative group-hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100">{h}</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{14 + i}:00</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-300 py-12">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">L'oracolo di Porto Badino</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                "Oggi le condizioni sono ottime per la spigola al calasole. La marea in salita spingerà i pesci verso il canale. Consiglierei un coreano o trancio di cefalo a fondo leggero vicino agli scogli del molo."
              </p>
              <p className="text-xs text-primary/60 font-mono">Generato da DeepSeek Chat</p>
            </div>
          )}

          {(activeTab !== "dati" && activeTab !== "ai") && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-300 py-20 opacity-50">
              <Fish className="w-12 h-12 mb-4" />
              <p>Contenuto della tab in fase di caricamento dal modello locale.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataPill({ icon: Icon, label, value, desc }: any) {
  return (
    <div className="bg-background rounded-2xl p-4 border border-white/5 flex flex-col">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <span className="text-xl font-bold text-white mb-1">{value}</span>
      <span className="text-[10px] text-primary/80">{desc}</span>
    </div>
  );
}
