import { useState, useEffect } from "react";
import { Settings, MapPin, Save, RotateCcw, Info } from "lucide-react";

export interface SpotConfig {
  nome: string;
  descrizione: string;
  lat: string;
  lon: string;
}

const DEFAULT_SPOT: SpotConfig = {
  nome: "",
  descrizione: "",
  lat: "",
  lon: "",
};

const STORAGE_KEY = "_diario_spot_config";

export function loadSpotConfig(): SpotConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpotConfig;
  } catch {
    return null;
  }
}

export default function Impostazioni() {
  const [spot, setSpot] = useState<SpotConfig>(DEFAULT_SPOT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadSpotConfig();
    if (stored) setSpot(stored);
  }, []);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spot));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!confirm("Vuoi rimuovere la configurazione dello spot? L'AI tornerà a usare conoscenze generiche sulla costa.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setSpot(DEFAULT_SPOT);
  }

  const hasData = spot.nome.trim() || spot.descrizione.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Impostazioni Spot AI</h1>
          <p className="text-sm text-muted-foreground">Personalizza l'esperienza dell'App con AI</p>
        </div>
      </div>

      {/* Spot AI */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-base">Il tuo spot principale</h2>
        </div>

        <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-xl p-3 text-sm text-muted-foreground">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <span>
            Descrivi il tuo posto di pesca abituale: profondità, caratteristiche, specie presenti, sfide comuni.
            L'AI userà queste informazioni per darti consigli precisi.
            Se non configuri nulla, l'AI risponde in modo generico sulla costa italiana.
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome dello spot</label>
            <input
              type="text"
              value={spot.nome}
              onChange={e => setSpot(s => ({ ...s, nome: e.target.value }))}
              placeholder="es. Porto Badino, Foce del Portatore…"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Descrizione ({spot.descrizione.length}/600 caratteri)
            </label>
            <textarea
              value={spot.descrizione}
              onChange={e => setSpot(s => ({ ...s, descrizione: e.target.value.slice(0, 600) }))}
              placeholder="Descrivi il tuo spot: profondità, tipo di fondale, specie presenti, tecniche consigliate, problemi tipici (es. granchi blu), orari migliori, strutture (scogli, foce, canale)…"
              rows={5}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Latitudine (opzionale)</label>
              <input
                type="number"
                step="0.001"
                value={spot.lat}
                onChange={e => setSpot(s => ({ ...s, lat: e.target.value }))}
                placeholder="es. 41.403"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Longitudine (opzionale)</label>
              <input
                type="number"
                step="0.001"
                value={spot.lon}
                onChange={e => setSpot(s => ({ ...s, lon: e.target.value }))}
                placeholder="es. 13.032"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground/70">
            Le coordinate servono per ottenere le condizioni marine reali nella tua zona.
            Puoi trovarle su Google Maps tenendo premuto sulla posizione.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={!hasData}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Salvato!" : "Salva impostazioni"}
          </button>
          {hasData && (
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
