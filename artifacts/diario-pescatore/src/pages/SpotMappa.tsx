import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2, AlertTriangle, CheckCircle, SlidersHorizontal, X, RefreshCw } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─── Tipi ────────────────────────────────────────────────────── */
type FeatureType = "beach" | "breakwater" | "groyne" | "pier";

interface OsmFeature {
  id: number;
  type: FeatureType;
  lat: number;
  lon: number;
  name: string;
  tags: Record<string, string>;
}

interface SelectedFeature extends OsmFeature {
  saved?: boolean;
}

/* ─── Configurazione per tipo ─────────────────────────────────── */
const TYPE_CFG: Record<FeatureType, {
  label: string; emoji: string; bg: string; border: string;
  markerBg: string; desc: string; pesca: string;
}> = {
  beach: {
    label: "Spiagge",
    emoji: "🏖️",
    bg: "bg-amber-500/10", border: "border-amber-500/30",
    markerBg: "#f59e0b",
    desc: "Surfcasting da riva",
    pesca: "Spigole, orate, mormore, razze",
  },
  breakwater: {
    label: "Frangiflutti",
    emoji: "🌊",
    bg: "bg-slate-500/10", border: "border-slate-500/30",
    markerBg: "#64748b",
    desc: "Pesca da fermo su massi",
    pesca: "Saraghi, orate, polpi, scorfani",
  },
  groyne: {
    label: "Pennelli",
    emoji: "🎯",
    bg: "bg-sky-500/10", border: "border-sky-500/30",
    markerBg: "#0ea5e9",
    desc: "Tra i migliori posti del Lazio",
    pesca: "Spigole, saraghi, cefali, anguille",
  },
  pier: {
    label: "Moli e Pontili",
    emoji: "⚓",
    bg: "bg-violet-500/10", border: "border-violet-500/30",
    markerBg: "#8b5cf6",
    desc: "Pesca dal bordo del molo",
    pesca: "Ricciole, palamite, saraghi, polpi",
  },
};

/* ─── Overpass query ──────────────────────────────────────────── */
// Bounding box: litorale laziale (lat 41.0-42.5, lon 11.5-13.5)
const BBOX = "41.0,11.5,42.5,13.5";

const OVERPASS_QUERY = `
[out:json][timeout:30];
(
  way["natural"="beach"](${BBOX});
  way["man_made"="breakwater"](${BBOX});
  way["man_made"="groyne"](${BBOX});
  way["man_made"="pier"](${BBOX});
  node["man_made"="pier"](${BBOX});
  node["man_made"="breakwater"](${BBOX});
  node["man_made"="groyne"](${BBOX});
);
out center tags;
`.trim();

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function fetchOsmFeatures(): Promise<OsmFeature[]> {
  let lastError: Error = new Error("Nessun server Overpass raggiungibile");

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, { method: "POST", body: QUERY_BODY });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.trim().startsWith("<")) throw new Error("Risposta non JSON");
      const data = JSON.parse(text);

      const features: OsmFeature[] = [];
      for (const el of data.elements) {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!lat || !lon) continue;

        const tags = el.tags ?? {};
        let type: FeatureType | null = null;

        if (tags.natural === "beach") type = "beach";
        else if (tags.man_made === "breakwater") type = "breakwater";
        else if (tags.man_made === "groyne") type = "groyne";
        else if (tags.man_made === "pier") type = "pier";

        if (!type) continue;

        features.push({
          id: el.id,
          type,
          lat,
          lon,
          name: tags.name ?? tags["name:it"] ?? TYPE_CFG[type].label,
          tags,
        });
      }
      return features;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError;
}

const QUERY_BODY = `data=${encodeURIComponent(OVERPASS_QUERY)}`;

/* ─── Marker icon factory ─────────────────────────────────────── */
function makeIcon(type: FeatureType) {
  const { markerBg, emoji } = TYPE_CFG[type];
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${markerBg};
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid rgba(255,255,255,0.8);
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:14px;line-height:1">${emoji}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

/* ─── Componente principale ───────────────────────────────────── */
export default function SpotMappa() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [features, setFeatures] = useState<OsmFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedFeature | null>(null);
  const [filters, setFilters] = useState<Record<FeatureType, boolean>>({
    beach: true, breakwater: true, groyne: true, pier: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedSpot, setSavedSpot] = useState<string | null>(null);

  /* Init mappa */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [41.4, 12.6],
      zoom: 9,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* Fetch OSM */
  const loadFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOsmFeatures();
      setFeatures(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Errore di rete");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeatures(); }, [loadFeatures]);

  /* Aggiorna markers quando cambiano features o filtri */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    features
      .filter(f => filters[f.type])
      .forEach(f => {
        const marker = L.marker([f.lat, f.lon], { icon: makeIcon(f.type) });
        marker.on("click", () => setSelected({ ...f }));
        marker.addTo(map);
        markersRef.current.push(marker);
      });
  }, [features, filters]);

  /* Salva spot */
  function saveAsSpot(f: OsmFeature) {
    const cfg = { nome: f.name, descrizione: `${TYPE_CFG[f.type].label} — ${TYPE_CFG[f.type].desc}`, lat: String(f.lat), lon: String(f.lon) };
    localStorage.setItem("_diario_spot_config", JSON.stringify(cfg));
    setSavedSpot(f.name);
    setSelected(prev => prev ? { ...prev, saved: true } : null);
    setTimeout(() => setSavedSpot(null), 3000);
    if (mapRef.current) mapRef.current.setView([f.lat, f.lon], 14);
  }

  /* Conteggi per tipo */
  const counts = features.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {} as Record<FeatureType, number>);

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6" style={{ height: "calc(100vh - 80px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-background/95 backdrop-blur z-10 shrink-0">
        <div>
          <h1 className="font-bold text-base flex items-center gap-2">
            🗺️ Mappa Costiera OSM
          </h1>
          <p className="text-xs text-muted-foreground">
            {loading ? "Caricamento dati OpenStreetMap…" :
              error ? "Errore caricamento" :
              features.length > 0 ? `${features.length} punti trovati sul litorale laziale` :
              "Nessun dato"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <button
              onClick={loadFeatures}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Ricarica"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showFilters ? "bg-primary/20 border-primary/40 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtri
          </button>
        </div>
      </div>

      {/* Filtri */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-white/8 bg-background/90 shrink-0">
          {(Object.keys(TYPE_CFG) as FeatureType[]).map(type => {
            const cfg = TYPE_CFG[type];
            const active = filters[type];
            return (
              <button
                key={type}
                onClick={() => setFilters(f => ({ ...f, [type]: !f[type] }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active ? `${cfg.bg} ${cfg.border} text-foreground` : "border-white/10 text-muted-foreground opacity-50"
                }`}
              >
                <span>{cfg.emoji}</span>
                {cfg.label}
                {counts[type] ? <span className="opacity-60">({counts[type]})</span> : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Mappa */}
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 1 }} />

        {/* Overlay loading */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Interrogazione OpenStreetMap…</p>
          </div>
        )}

        {/* Overlay error */}
        {error && !loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm gap-3 p-6">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <p className="text-sm text-center text-muted-foreground">{error}</p>
            <button onClick={loadFeatures} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              Riprova
            </button>
          </div>
        )}

        {/* Toast spot salvato */}
        {savedSpot && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur">
            <CheckCircle className="w-4 h-4" />
            Spot salvato: {savedSpot}
          </div>
        )}
      </div>

      {/* Bottom sheet feature selezionata */}
      {selected && (
        <div className="relative z-20 border-t border-white/10 bg-card/95 backdrop-blur-xl px-4 py-4 shrink-0">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${TYPE_CFG[selected.type].bg} border ${TYPE_CFG[selected.type].border}`}
            >
              {TYPE_CFG[selected.type].emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{TYPE_CFG[selected.type].desc}</p>
              <p className="text-xs text-primary/80 mt-1">🐟 {TYPE_CFG[selected.type].pesca}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {selected.lat.toFixed(5)}, {selected.lon.toFixed(5)}
              </p>
            </div>
          </div>

          <button
            onClick={() => saveAsSpot(selected)}
            className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              selected.saved
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
            }`}
          >
            <MapPin className="w-4 h-4" />
            {selected.saved ? "Spot salvato!" : "Usa come spot principale"}
          </button>
        </div>
      )}
    </div>
  );
}
