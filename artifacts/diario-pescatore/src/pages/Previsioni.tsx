import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { FishingForecastCard } from "@/components/FishingForecastCard";
import { STAZIONI, getSharedStation, setSharedStation } from "@/hooks/use-location";
import { cn } from "@/lib/utils";

export default function Previsioni() {
  const [stazioneKey, setStazioneKey] = useState(() => getSharedStation());
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (k: string) => {
    setStazioneKey(k);
    setSharedStation(k);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Previsioni Pesca</h1>
          <p className="text-muted-foreground text-sm">Canale Portatore · foce Porto Badino · solo da terra</p>
        </div>

        {/* Selettore stazione condiviso */}
        <div className="relative shrink-0">
          <button onClick={() => setShowDropdown(v => !v)}
            className="flex items-center gap-2 bg-card border border-white/10 px-4 py-2.5 rounded-2xl text-sm font-medium hover:border-primary/50 transition-colors">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="max-w-[140px] truncate">{STAZIONI[stazioneKey]?.nome ?? "Porto Badino"}</span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showDropdown && "rotate-180")} />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-12 w-56 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
              {Object.entries(STAZIONI).map(([k, s]) => (
                <button key={k} onClick={() => handleSelect(k)}
                  className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2",
                    k === stazioneKey ? "text-primary font-semibold bg-primary/5" : "text-foreground")}>
                  {k === stazioneKey && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  {s.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <FishingForecastCard stazioneKey={stazioneKey} />
    </div>
  );
}
