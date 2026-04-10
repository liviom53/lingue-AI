import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, MapPin, ExternalLink, Info, RefreshCw } from "lucide-react";
import {
  ORDINANZE_LAZIO,
  getOrdinanzeVicine,
  checkStatoOrdinanza,
  type Ordinanza,
  type StatoOrdinanza,
} from "@/data/normativeLazio";

interface SpotConfig {
  lat?: number;
  lon?: number;
  nome?: string;
}

function loadSpot(): SpotConfig | null {
  try {
    const raw = localStorage.getItem("_diario_spot_config");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatOrario(dalle: string, alle: string) {
  return `${dalle} – ${alle}`;
}

function formatPeriodo(periodi: Ordinanza["periodi"]) {
  return periodi
    .map(p => {
      const fmt = (s: string) => {
        const [m, d] = s.split("-");
        const months = ["", "gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
        return `${parseInt(d)} ${months[parseInt(m)]}`;
      };
      return `${fmt(p.dal)} – ${fmt(p.al)}`;
    })
    .join(", ");
}

function StatoBadge({ stato }: { stato: StatoOrdinanza }) {
  if (stato === "vietato") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      VIETATO ORA
    </span>
  );
  if (stato === "fuori_orario") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
      <Clock className="w-3 h-3" />
      Fuori orario
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      <CheckCircle className="w-3 h-3" />
      Consentita
    </span>
  );
}

function HeroCard({ now }: { now: Date }) {
  const spot = loadSpot();
  const hasSpot = spot?.lat && spot?.lon;

  if (!hasSpot) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-300 text-sm">Spot non configurato</p>
          <p className="text-xs text-muted-foreground mt-1">
            Configura il tuo spot in <strong>Impostazioni</strong> per vedere se la pesca è consentita nella tua zona.
          </p>
        </div>
      </div>
    );
  }

  const vicine = getOrdinanzeVicine(spot.lat!, spot.lon!, 25);

  if (vicine.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex gap-3 items-start">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-300 text-sm">Nessun divieto balneare rilevato</p>
          <p className="text-xs text-muted-foreground mt-1">
            Non risultano ordinanze balneari nel raggio di 25 km dal tuo spot{spot.nome ? ` (${spot.nome})` : ""}.
            Verifica comunque le norme locali.
          </p>
        </div>
      </div>
    );
  }

  const piuVicina = vicine[0];
  const stato = checkStatoOrdinanza(piuVicina, now);

  return (
    <div className={`rounded-2xl border p-5 ${
      stato === "vietato"
        ? "border-red-500/40 bg-red-500/8"
        : stato === "fuori_orario"
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-emerald-500/30 bg-emerald-500/5"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Spot: <strong>{spot.nome ?? `${spot.lat?.toFixed(3)}, ${spot.lon?.toFixed(3)}`}</strong>
            {" · "}Comune più vicino: <strong>{piuVicina.comune}</strong> ({piuVicina.distanzaKm} km)
          </p>
          {stato === "vietato" && (
            <p className="text-red-300 font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Pesca da riva VIETATA ora
            </p>
          )}
          {stato === "fuori_orario" && (
            <p className="text-amber-300 font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" /> Pesca consentita (fuori orario divieto)
            </p>
          )}
          {stato === "fuori_stagione" && (
            <p className="text-emerald-300 font-bold text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Pesca consentita (fuori stagione)
            </p>
          )}
        </div>
      </div>

      {stato === "vietato" && (
        <div className="text-sm text-red-200/80 bg-red-900/20 rounded-xl px-4 py-3 border border-red-500/20 mb-3">
          ⏰ Divieto in vigore: <strong>{formatOrario(piuVicina.orario.dalle, piuVicina.orario.alle)}</strong>
          {" · "}📅 Periodo: <strong>{formatPeriodo(piuVicina.periodi)}</strong><br />
          📍 Zona: {piuVicina.zonaVietata}
          {piuVicina.note && <><br />💡 {piuVicina.note}</>}
        </div>
      )}

      {stato === "fuori_orario" && (
        <div className="text-sm text-amber-200/80 bg-amber-900/10 rounded-xl px-4 py-3 border border-amber-500/20 mb-3">
          Il divieto è attivo in stagione dalle <strong>{piuVicina.orario.dalle}</strong> alle <strong>{piuVicina.orario.alle}</strong>.
          {" "}Oggi il divieto {
            now.getHours() * 60 + now.getMinutes() < parseInt(piuVicina.orario.dalle.split(":")[0]) * 60 + parseInt(piuVicina.orario.dalle.split(":")[1])
              ? `inizierà alle ${piuVicina.orario.dalle}`
              : `è terminato alle ${piuVicina.orario.alle}`
          }.
          {piuVicina.note && <><br />💡 {piuVicina.note}</>}
        </div>
      )}

      {vicine.length > 1 && (
        <p className="text-xs text-muted-foreground">
          +{vicine.length - 1} altri comuni nel raggio di 25 km con ordinanze simili.
        </p>
      )}
    </div>
  );
}

export default function Normative() {
  const [now, setNow] = useState(new Date());
  const [searchText, setSearchText] = useState("");
  const [provinciaFilter, setProvinciaFilter] = useState<string>("all");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const filtered = ORDINANZE_LAZIO.filter(o => {
    const matchSearch = o.comune.toLowerCase().includes(searchText.toLowerCase());
    const matchProv = provinciaFilter === "all" || o.provincia === provinciaFilter;
    return matchSearch && matchProv;
  });

  return (
    <div className="space-y-6 pb-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🚫 Normative Locali
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Divieti balneari per la pesca da riva — Litorale del Lazio
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <RefreshCw className="w-3 h-3" />
            {now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-xs text-muted-foreground">
            {now.toLocaleDateString("it-IT", { day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Hero status card */}
      <HeroCard now={now} />

      {/* Disclaimer */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-2 items-start">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-200/70 leading-relaxed">
          <strong>Dati indicativi</strong> basati sulle ordinanze balneari 2024. Le ordinanze vengono
          rinnovate ogni anno dai singoli comuni e possono variare. Verifica sempre sul sito ufficiale
          del comune prima di pescare. I divieti si applicano generalmente alle <strong>spiagge libere</strong>;
          porto, moli e scogliere rocciose sono solitamente esclusi.
        </p>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Cerca comune…"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="flex-1 min-w-40 px-3 py-2 rounded-xl bg-card border border-white/10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
        />
        <select
          value={provinciaFilter}
          onChange={e => setProvinciaFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-card border border-white/10 text-sm text-foreground outline-none focus:border-primary/50"
        >
          <option value="all">Tutte le province</option>
          <option value="RM">Roma (RM)</option>
          <option value="LT">Latina (LT)</option>
          <option value="VT">Viterbo (VT)</option>
          <option value="FR">Frosinone (FR)</option>
        </select>
      </div>

      {/* Lista comuni */}
      <div className="space-y-2">
        {filtered.map(ord => {
          const stato = checkStatoOrdinanza(ord, now);
          return (
            <div
              key={ord.id}
              className="rounded-2xl border border-white/8 bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm">{ord.comune}</p>
                  <p className="text-xs text-muted-foreground">{ord.provincia} · {ord.zonaVietata}</p>
                </div>
                <StatoBadge stato={stato} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>📅 {formatPeriodo(ord.periodi)}</span>
                <span>⏰ {formatOrario(ord.orario.dalle, ord.orario.alle)}</span>
              </div>
              {ord.note && (
                <p className="text-xs text-blue-300/70 mt-2 flex items-start gap-1">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />{ord.note}
                </p>
              )}
              {ord.link && (
                <a
                  href={ord.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary mt-2"
                >
                  <ExternalLink className="w-3 h-3" /> Sito del comune
                </a>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nessun comune trovato.</p>
        )}
      </div>

      {/* Regola generale */}
      <div className="rounded-2xl border border-white/8 bg-card p-5 space-y-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">📋 Regola generale Lazio</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Su quasi tutto il litorale laziale, <strong>da giugno a metà settembre</strong>, la pesca da riva
          sulle spiagge libere è vietata durante le ore diurne (circa 8:30–19:30 a seconda del comune).
          La pesca è generalmente <strong>sempre consentita</strong> da moli, banchine portuali, scogliere
          rocciose e piattaforme (pescherecci esclusi). Di notte (dopo le 19:30 circa) il divieto decade.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Sanzioni:</strong> Le violazioni sono sanzionabili dalla Capitaneria di Porto / Guardia
          Costiera con multe da €150 a €500+. Il pescato può essere sequestrato.
        </p>
      </div>

    </div>
  );
}
