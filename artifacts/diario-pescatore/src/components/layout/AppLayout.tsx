import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, Anchor, Fish, MapPin, BookOpen, Wrench, ChefHat,
  CloudSun, Moon, LineChart, Bot, Car, Wallet, Menu, X,
  Download, Upload, Waves, Settings, Heart, ScanLine, PlayCircle, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, emoji: "🏠" },
  { href: "/uscite", label: "Uscite", icon: Anchor, emoji: "⚓" },
  { href: "/pescato", label: "Pescato", icon: Fish, emoji: "🐟" },
  { href: "/spot", label: "Spot", icon: MapPin, emoji: "📍" },
  { href: "/specie", label: "Specie", icon: BookOpen, emoji: "📖" },
  { href: "/attrezzatura", label: "Attrezzatura", icon: Wrench, emoji: "🔧" },
  { href: "/ricette", label: "Ricette", icon: ChefHat, emoji: "👨‍🍳" },
  { href: "/meteo", label: "Meteo", icon: CloudSun, emoji: "🌊" },
  { href: "/maree", label: "Maree & Luna", icon: Waves, emoji: "🌙" },
  { href: "/previsioni", label: "Previsioni Pesca", icon: Moon, emoji: "🎣" },
  { href: "/statistiche", label: "Statistiche", icon: LineChart, emoji: "📊" },
  { href: "/ai", label: "Assistente AI", icon: Bot, emoji: "🤖" },
  { href: "/parco-auto", label: "Parco Auto", icon: Car, emoji: "🚗" },
  { href: "/finanze", label: "Finanze", icon: Wallet, emoji: "💰" },
  { href: "/impostazioni", label: "Impostazioni Spot AI", icon: Settings, emoji: "⚙️" },
  { href: "/normative", label: "Normative Locali", icon: ShieldAlert, emoji: "🚫" },
  { href: "/demo", label: "Demo & Aiuto", icon: PlayCircle, emoji: "🎬" },
  { href: "/donazioni", label: "Donazioni", icon: Heart, emoji: "❤️" },
];

const BOTTOM_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/uscite", label: "Uscite", icon: Anchor },
  { href: "/pescato", label: "Pescato", icon: Fish },
];

function exportData() {
  const data: Record<string, any> = {};
  const keys = ["diario_uscite", "diario_catture", "diario_spot", "diario_attrezzatura", "diario_ricette", "diario_veicoli", "diario_finanze"];
  keys.forEach(k => {
    try { data[k] = JSON.parse(localStorage.getItem(k) || "[]"); } catch { data[k] = []; }
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `diario-pescatore-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        Object.entries(data).forEach(([k, v]) => {
          localStorage.setItem(k, JSON.stringify(v));
        });
        window.location.reload();
      } catch {
        alert("Errore nel file di backup. Verificare il formato JSON.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export function AppLayout({ children, onLogoTap, onScanOpen }: { children: React.ReactNode; onLogoTap?: () => void; onScanOpen?: () => void }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shadow-2xl z-20 shrink-0">
        <div className="p-5 pb-2 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 text-xl cursor-pointer select-none"
              onClick={onLogoTap}
            >
              🎣
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight text-sidebar-foreground">Diario del Pescatore</h1>
              <p className="text-xs text-primary/80 font-medium tracking-wide uppercase">v3.5 · by Livio</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group relative text-sm",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                )}
                <span className="text-base w-5 text-center">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Export / Import */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button onClick={exportData} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
            <Download className="w-4 h-4" /> Esporta dati
          </button>
          <button onClick={importData} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
            <Upload className="w-4 h-4" /> Importa backup
          </button>
          <p className="text-xs text-center text-sidebar-foreground/30 pt-1 italic">"Ad Maiora Semper"</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative h-full flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto pb-24 md:pb-6 custom-scrollbar">
          <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
            {children}
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 w-full h-20 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border z-40 px-4 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 p-2 transition-colors", location === href ? "text-primary" : "text-sidebar-foreground/50 hover:text-sidebar-foreground")}>
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* SCAN FAB */}
        <button
          onClick={() => onScanOpen?.()}
          className="relative -top-5 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-blue-500 shadow-[0_0_24px_hsla(175,80%,40%,0.5)] border-4 border-background text-white hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Scanner cattura"
        >
          <ScanLine className="w-7 h-7" />
        </button>

        <Link href="/previsioni" className={cn("flex flex-col items-center gap-1 p-2 transition-colors", location === "/previsioni" ? "text-primary" : "text-sidebar-foreground/50 hover:text-sidebar-foreground")}>
          <Moon className="w-6 h-6" />
          <span className="text-[10px] font-medium">Pesca</span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn("flex flex-col items-center gap-1 p-2 transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground")}
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">Altro</span>
        </button>
      </div>

      {/* MOBILE FULL MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-50 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-white/5 shrink-0">
            <h2 className="font-bold text-xl flex items-center gap-2">🎣 Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-full text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3 content-start">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border text-center active:scale-95 transition-transform",
                    isActive ? "bg-primary/10 border-primary/40 text-primary" : "bg-card border-white/5 text-white"
                  )}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="p-4 border-t border-white/5 flex gap-2 shrink-0">
            <button onClick={() => { exportData(); setIsMobileMenuOpen(false); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-card rounded-xl text-sm text-muted-foreground border border-white/5">
              <Download className="w-4 h-4" /> Esporta
            </button>
            <button onClick={() => { importData(); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-card rounded-xl text-sm text-muted-foreground border border-white/5">
              <Upload className="w-4 h-4" /> Importa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
