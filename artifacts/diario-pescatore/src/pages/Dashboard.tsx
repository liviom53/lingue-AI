import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Anchor, Fish, MapPin, ArrowRight, Activity, Thermometer,
  Wind, Droplets, Eye, Bot, Plus, ChevronDown, Waves,
  Moon, Sun, Star, Clock, TrendingUp, Scale, AlertTriangle
} from "lucide-react";
import { usciteAPI, pescatoAPI, spotAPI } from "@/hooks/use-local-data";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

/* ── Stazioni costiere Lazio ── */
const STAZIONI: Record<string, { nome: string; lat: number; lng: number }> = {
  "porto-badino":   { nome: "Porto Badino",        lat: 41.28, lng: 13.16 },
  "terracina":      { nome: "Terracina",            lat: 41.29, lng: 13.25 },
  "sabaudia":       { nome: "Sabaudia",             lat: 41.30, lng: 13.03 },
  "circeo":         { nome: "San Felice Circeo",    lat: 41.24, lng: 13.10 },
  "anzio":          { nome: "Anzio",                lat: 41.45, lng: 12.63 },
  "nettuno":        { nome: "Nettuno",              lat: 41.45, lng: 12.66 },
  "borgo-grappa":   { nome: "Borgo Grappa",         lat: 41.49, lng: 12.90 },
  "sperlonga":      { nome: "Sperlonga",            lat: 41.26, lng: 13.44 },
  "gaeta":          { nome: "Gaeta",                lat: 41.21, lng: 13.57 },
  "formia":         { nome: "Formia",               lat: 41.26, lng: 13.62 },
  "civitavecchia":  { nome: "Civitavecchia",        lat: 42.10, lng: 11.80 },
  "fiumicino":      { nome: "Fiumicino",            lat: 41.77, lng: 12.24 },
};

const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: "Sereno",              emoji: "☀️" },
  1: { label: "Prev. sereno",        emoji: "🌤️" },
  2: { label: "Parz. nuvoloso",      emoji: "⛅" },
  3: { label: "Coperto",            emoji: "☁️" },
  45: { label: "Nebbia",            emoji: "🌫️" },
  51: { label: "Pioviggine",        emoji: "🌦️" },
  61: { label: "Pioggia leggera",   emoji: "🌧️" },
  63: { label: "Pioggia",           emoji: "🌧️" },
  65: { label: "Pioggia intensa",   emoji: "🌧️" },
  80: { label: "Rovesci",           emoji: "🌦️" },
  95: { label: "Temporale",         emoji: "⛈️" },
};
const getWmo = (code: number) => WMO_CODES[code] ?? { label: "Variabile", emoji: "🌈" };

/* ── Luna ── */
function getMoonPhase(date: Date): { nome: string; emoji: string; illuminazione: number } {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  let yr = y, mo = m;
  if (mo <= 2) { yr--; mo += 12; }
  const a = Math.floor(yr / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + b - 1524.5;
  const phase = ((jd - 2451549.5) % 29.53 + 29.53) % 29.53;
  const p = phase / 29.53;
  const illuminazione = Math.round((1 - Math.cos(2 * Math.PI * p)) / 2 * 100);
  if (p < 0.03 || p > 0.97) return { nome: "Luna Nuova", emoji: "🌑", illuminazione };
  if (p < 0.22) return { nome: "Luna Crescente", emoji: "🌒", illuminazione };
  if (p < 0.28) return { nome: "Quarto Crescente", emoji: "🌓", illuminazione };
  if (p < 0.47) return { nome: "Gibbosa Crescente", emoji: "🌔", illuminazione };
  if (p < 0.53) return { nome: "Luna Piena", emoji: "🌕", illuminazione };
  if (p < 0.72) return { nome: "Gibbosa Calante", emoji: "🌖", illuminazione };
  if (p < 0.78) return { nome: "Quarto Calante", emoji: "🌗", illuminazione };
  return { nome: "Luna Calante", emoji: "🌘", illuminazione };
}

/* ── Maree semplici ── */
function getTidalHeight(date: Date, hour: number) {
  const t = (date.getTime() + hour * 3600000) / 1000;
  const M2 = 2 * Math.PI * t / (12.42 * 3600);
  const K1 = 2 * Math.PI * t / (23.93 * 3600);
  const M4 = 2 * Math.PI * t / (6.21 * 3600);
  return 0.35 * Math.sin(M2) + 0.12 * Math.sin(K1 + 1.2) + 0.08 * Math.sin(M4 + 0.5);
}

function getTodayTides(date: Date) {
  const heights = Array.from({ length: 24 }, (_, h) => ({ h, val: getTidalHeight(date, h) }));
  const events: { tipo: "alta" | "bassa"; ora: number; val: number }[] = [];
  for (let i = 1; i < 23; i++) {
    if (heights[i].val > heights[i - 1].val && heights[i].val > heights[i + 1].val)
      events.push({ tipo: "alta", ora: i, val: heights[i].val });
    else if (heights[i].val < heights[i - 1].val && heights[i].val < heights[i + 1].val)
      events.push({ tipo: "bassa", ora: i, val: heights[i].val });
  }
  return events.sort((a, b) => a.ora - b.ora);
}

/* ── Meteo hook ── */
function useMeteo(key: string) {
  const s = STAZIONI[key];
  return useQuery({
    queryKey: ["meteo-dash", key],
    queryFn: async () => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}`
        + `&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,apparent_temperature`
        + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code`
        + `&hourly=wave_height,wind_wave_height`
        + `&timezone=Europe/Rome&forecast_days=3`;
      const r = await fetch(url);
      return r.json();
    },
    staleTime: 1000 * 60 * 15,
  });
}

/* ── Direzione vento ── */
function windDir(deg: number) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/* ── Componente principale ── */
export default function Dashboard() {
  const [stazioneKey, setStazioneKey] = useState(() =>
    localStorage.getItem("diario_stazione_home") ?? "porto-badino"
  );
  const [showStazioni, setShowStazioni] = useState(false);

  const { data: uscite = [] } = usciteAPI.useList();
  const { data: catture = [] } = pescatoAPI.useList();
  const { data: spot = [] } = spotAPI.useList();
  const { data: meteo, isLoading: meteoLoading } = useMeteo(stazioneKey);

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  const moon = useMemo(() => getMoonPhase(new Date()), []);
  const tides = useMemo(() => getTodayTides(new Date()), []);

  const cur = meteo?.current;
  const wmo = getWmo(cur?.weather_code ?? 0);

  const pesoTotale = catture.reduce((s: number, c: any) => s + (parseFloat(c.peso) || 0), 0);
  const ultimeCatture = [...catture].slice(0, 3);
  const ultimeUscite = [...uscite].slice(0, 4);

  /* Prossime scadenze veicoli */
  const now = new Date();

  const selectStazione = (k: string) => {
    setStazioneKey(k);
    localStorage.setItem("diario_stazione_home", k);
    setShowStazioni(false);
  };

  return (
    <div className="space-y-5">

      {/* ── TOP: Saluto + selettore stazione ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-primary text-sm font-semibold uppercase tracking-wider capitalize">
            {today}
          </p>
          <h1 className="text-3xl font-display font-bold text-white mt-0.5">
            Bentornato, <span className="text-primary">Livio</span> 🎣
          </h1>
        </div>

        {/* Selettore stazione */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowStazioni(v => !v)}
            className="flex items-center gap-2 bg-card border border-white/10 px-4 py-2.5 rounded-2xl text-sm font-medium hover:border-primary/50 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="max-w-[140px] truncate">{STAZIONI[stazioneKey].nome}</span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showStazioni && "rotate-180")} />
          </button>
          {showStazioni && (
            <div className="absolute right-0 top-12 w-56 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {Object.entries(STAZIONI).map(([k, s]) => (
                <button
                  key={k}
                  onClick={() => selectStazione(k)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2",
                    k === stazioneKey ? "text-primary font-semibold bg-primary/5" : "text-foreground"
                  )}
                >
                  {k === stazioneKey && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  {s.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── METEO CARD principale ── */}
      <div className="bg-gradient-to-br from-card to-background rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-5 md:p-6">
          {meteoLoading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cur ? (
            <>
              {/* Riga principale temperatura */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{wmo.emoji}</span>
                  <div>
                    <p className="text-5xl font-display font-black text-white leading-none">
                      {Math.round(cur.temperature_2m)}°
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Percepita {Math.round(cur.apparent_temperature)}° · {wmo.label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stazione</p>
                  <p className="font-bold text-white">{STAZIONI[stazioneKey].nome}</p>
                  <p className="text-xs text-primary mt-0.5">Live Open-Meteo</p>
                </div>
              </div>

              {/* Griglia dati meteo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MeteoCell icon={Wind} label="Vento" value={`${Math.round(cur.wind_speed_10m)} kn`} sub={windDir(cur.wind_direction_10m)} />
                <MeteoCell icon={Droplets} label="Umidità" value={`${cur.relative_humidity_2m}%`} />
                <MeteoCell icon={Waves} label="Marea ora" value={
                  (() => {
                    const h = getTidalHeight(new Date(), new Date().getHours());
                    return h > 0.1 ? "In salita" : h < -0.1 ? "In discesa" : "Stabile";
                  })()
                } />
                <MeteoCell icon={Moon} label="Luna" value={moon.emoji} sub={`${moon.illuminazione}%`} />
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-6">Meteo non disponibile</p>
          )}
        </div>

        {/* Barra previsioni 3 giorni */}
        {meteo?.daily && (
          <div className="flex border-t border-white/5 divide-x divide-white/5">
            {[0, 1, 2].map(i => {
              const date = new Date(meteo.daily.time[i]);
              const w = getWmo(meteo.daily.weather_code[i]);
              return (
                <div key={i} className="flex-1 px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground capitalize">
                    {i === 0 ? "Oggi" : i === 1 ? "Domani" : format(date, "EEE", { locale: it })}
                  </p>
                  <span className="text-2xl my-1 block">{w.emoji}</span>
                  <p className="text-xs font-bold text-white">
                    {Math.round(meteo.daily.temperature_2m_max[i])}°
                    <span className="text-muted-foreground font-normal">/{Math.round(meteo.daily.temperature_2m_min[i])}°</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── LUNA & MAREE ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Luna */}
        <div className="bg-card rounded-3xl border border-white/5 p-5 flex items-center gap-4">
          <span className="text-4xl">{moon.emoji}</span>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fase Lunare</p>
            <p className="font-bold text-white leading-tight">{moon.nome}</p>
            <p className="text-xs text-primary mt-1">Illuminata {moon.illuminazione}%</p>
          </div>
        </div>

        {/* Maree oggi */}
        <div className="bg-card rounded-3xl border border-white/5 p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Maree Oggi</p>
          <div className="flex flex-wrap gap-2">
            {tides.length === 0 ? (
              <p className="text-xs text-muted-foreground">Calcolo...</p>
            ) : (
              tides.slice(0, 4).map((t, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold",
                  t.tipo === "alta" ? "bg-blue-500/15 text-blue-300" : "bg-amber-500/10 text-amber-300"
                )}>
                  {t.tipo === "alta" ? "▲" : "▼"}
                  {String(t.ora).padStart(2, "0")}:00
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── AZIONI RAPIDE ── */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Azioni Rapide</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction href="/uscite" emoji="⚓" label="Nuova Uscita" color="from-blue-600/20 to-blue-900/10 border-blue-500/20" />
          <QuickAction href="/pescato" emoji="🐟" label="Registra Pescato" color="from-teal-600/20 to-teal-900/10 border-teal-500/20" />
          <QuickAction href="/ai" emoji="🤖" label="Chiedi all'AI" color="from-violet-600/20 to-violet-900/10 border-violet-500/20" />
          <QuickAction href="/previsioni" emoji="🎣" label="Previsioni Pesca" color="from-amber-600/20 to-amber-900/10 border-amber-500/20" />
        </div>
      </div>

      {/* ── STATISTICHE ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Anchor} label="Uscite Totali" value={uscite.length} color="text-blue-400" />
        <StatCard icon={Fish} label="Catture" value={catture.length} color="text-primary" />
        <StatCard icon={Scale} label="Peso Totale" value={`${pesoTotale.toFixed(1)} kg`} color="text-teal-400" />
        <StatCard icon={MapPin} label="Spot Salvati" value={spot.length} color="text-indigo-400" />
      </div>

      {/* ── BOTTOM: Ultime uscite + catture ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Ultime uscite */}
        <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Anchor className="w-5 h-5 text-blue-400" /> Ultime Uscite
            </h3>
            <Link href="/uscite" className="text-primary hover:text-white text-xs font-medium flex items-center gap-1 transition-colors">
              Vedi tutte <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {ultimeUscite.length === 0 ? (
              <EmptyState icon={Anchor} text="Nessuna uscita registrata" sub='Premi "Nuova Uscita" per iniziare' />
            ) : (
              ultimeUscite.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-background border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">
                      {u.data ? format(new Date(u.data), "dd/MM") : "--"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{u.luogo || "Senza luogo"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.tecnica || "—"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ultime catture */}
        <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Fish className="w-5 h-5 text-primary" /> Ultime Catture
            </h3>
            <Link href="/pescato" className="text-primary hover:text-white text-xs font-medium flex items-center gap-1 transition-colors">
              Vedi tutte <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {ultimeCatture.length === 0 ? (
              <EmptyState icon={Fish} text="Nessuna cattura registrata" sub='Registra il tuo primo pescato' />
            ) : (
              ultimeCatture.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Fish className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{c.specie || "Specie sconosciuta"}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.peso ? `${c.peso} kg` : "—"}{c.lunghezza ? ` · ${c.lunghezza} cm` : ""}
                    </p>
                  </div>
                  {c.catchAndRelease && (
                    <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 shrink-0">C&R</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── AI BANNER ── */}
      <Link href="/ai" className="block">
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-900/40 via-card to-card border border-violet-500/20 rounded-3xl p-5 flex items-center gap-5 hover:border-violet-400/40 transition-colors group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent" />
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bot className="w-7 h-7 text-violet-300" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="font-bold text-white text-base">Assistente AI · DeepSeek</p>
            <p className="text-sm text-muted-foreground mt-0.5">Chiedimi consigli su tecniche, specie, maree o registra voce dati</p>
          </div>
          <ArrowRight className="w-5 h-5 text-violet-400 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* ── ACCESSO RAPIDO A TUTTE LE SEZIONI ── */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Tutte le Sezioni</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { href: "/spot",        emoji: "📍", label: "Spot" },
            { href: "/specie",      emoji: "📖", label: "Specie" },
            { href: "/attrezzatura",emoji: "🔧", label: "Attrezzatura" },
            { href: "/ricette",     emoji: "👨‍🍳", label: "Ricette" },
            { href: "/meteo",       emoji: "🌊", label: "Meteo" },
            { href: "/maree",       emoji: "🌙", label: "Maree" },
            { href: "/statistiche", emoji: "📊", label: "Statistiche" },
            { href: "/parco-auto",  emoji: "🚗", label: "Parco Auto" },
            { href: "/finanze",     emoji: "💰", label: "Finanze" },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-colors group active:scale-95"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-tight text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ── Sub-componenti ── */

function MeteoCell({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-background/50 rounded-2xl px-4 py-3 border border-white/5">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="font-bold text-white text-sm">{value}</p>
      {sub && <p className="text-[10px] text-primary/70 mt-0.5">{sub}</p>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-white/5 shadow-lg">
      <Icon className={cn("w-5 h-5 mb-3", color)} />
      <p className="text-2xl font-display font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

function QuickAction({ href, emoji, label, color }: { href: string; emoji: string; label: string; color: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl border bg-gradient-to-br text-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-150",
        color
      )}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-xs font-semibold text-white leading-tight">{label}</span>
    </Link>
  );
}

function EmptyState({ icon: Icon, text, sub }: { icon: any; text: string; sub: string }) {
  return (
    <div className="text-center py-6">
      <Icon className="w-10 h-10 text-white/10 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">{text}</p>
      <p className="text-xs text-white/20 mt-1">{sub}</p>
    </div>
  );
}
