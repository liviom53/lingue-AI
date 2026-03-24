import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wind, Droplets, Eye, Thermometer, Waves } from "lucide-react";

const STAZIONI: Record<string, { nome: string; lat: number; lng: number }> = {
  "porto-badino": { nome: "Porto Badino", lat: 41.28, lng: 13.16 },
  "terracina": { nome: "Terracina", lat: 41.29, lng: 13.25 },
  "sabaudia": { nome: "Sabaudia", lat: 41.30, lng: 13.03 },
  "circeo": { nome: "San Felice Circeo", lat: 41.24, lng: 13.10 },
  "anzio": { nome: "Anzio", lat: 41.45, lng: 12.63 },
  "nettuno": { nome: "Nettuno", lat: 41.45, lng: 12.66 },
  "borgo-grappa": { nome: "Borgo Grappa", lat: 41.49, lng: 12.90 },
  "sperlonga": { nome: "Sperlonga", lat: 41.26, lng: 13.44 },
  "gaeta": { nome: "Gaeta", lat: 41.21, lng: 13.57 },
  "formia": { nome: "Formia", lat: 41.26, lng: 13.62 },
  "civitavecchia": { nome: "Civitavecchia", lat: 42.10, lng: 11.80 },
  "fiumicino": { nome: "Fiumicino", lat: 41.77, lng: 12.24 },
};

const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: "Sereno", emoji: "☀️" },
  1: { label: "Prevalentemente sereno", emoji: "🌤️" },
  2: { label: "Parzialmente nuvoloso", emoji: "⛅" },
  3: { label: "Coperto", emoji: "☁️" },
  45: { label: "Nebbia", emoji: "🌫️" },
  48: { label: "Nebbia gelata", emoji: "🌫️" },
  51: { label: "Pioviggine leggera", emoji: "🌦️" },
  53: { label: "Pioviggine moderata", emoji: "🌦️" },
  55: { label: "Pioviggine intensa", emoji: "🌧️" },
  61: { label: "Pioggia leggera", emoji: "🌧️" },
  63: { label: "Pioggia moderata", emoji: "🌧️" },
  65: { label: "Pioggia intensa", emoji: "🌧️" },
  80: { label: "Rovesci leggeri", emoji: "🌦️" },
  81: { label: "Rovesci moderati", emoji: "🌧️" },
  82: { label: "Rovesci violenti", emoji: "⛈️" },
  95: { label: "Temporale", emoji: "⛈️" },
  96: { label: "Temporale con grandine", emoji: "⛈️" },
};

function getWmo(code: number) {
  return WMO_CODES[code] || { label: "Vario", emoji: "🌈" };
}

function useMeteo(stazioneKey: string) {
  const s = STAZIONI[stazioneKey];
  return useQuery({
    queryKey: ["meteo", stazioneKey],
    queryFn: async () => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&timezone=Europe/Rome&forecast_days=5`
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });
}

const DAYS_IT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTHS_IT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAYS_IT[d.getDay()]} ${d.getDate()} ${MONTHS_IT[d.getMonth()]}`;
}

function WindDir({ deg }: { deg: number }) {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return <span>{dirs[Math.round(deg / 45) % 8]}</span>;
}

export default function Meteo() {
  const [stazione, setStazione] = useState("porto-badino");
  const { data, isLoading, isError } = useMeteo(stazione);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Meteo</h1>
        <p className="text-muted-foreground">Previsioni 5 giorni · Stazioni laziali</p>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Stazione</label>
        <select
          value={stazione}
          onChange={e => setStazione(e.target.value)}
          className="bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
        >
          {Object.entries(STAZIONI).map(([k, v]) => (
            <option key={k} value={k}>{v.nome}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 border border-white/5 animate-pulse h-40" />
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
          <p className="text-destructive">Errore nel caricamento del meteo. Controlla la connessione.</p>
        </div>
      )}

      {data && (
        <>
          {/* Current conditions */}
          <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Condizioni Attuali — {STAZIONI[stazione].nome}</h2>
            <div className="flex items-center gap-6">
              <div className="text-6xl">{getWmo(data.current.weather_code).emoji}</div>
              <div>
                <p className="text-5xl font-bold text-white">{data.current.temperature_2m}°C</p>
                <p className="text-muted-foreground">{getWmo(data.current.weather_code).label}</p>
              </div>
              <div className="ml-auto grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wind className="w-4 h-4 text-primary" />
                  <span>{data.current.wind_speed_10m} km/h <WindDir deg={data.current.wind_direction_10m} /></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span>{data.current.relative_humidity_2m}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          <div className="grid gap-3 md:grid-cols-5">
            {data.daily.time.map((date: string, i: number) => {
              const wmo = getWmo(data.daily.weather_code[i]);
              const isToday = i === 0;
              return (
                <div key={date} className={`bg-card rounded-2xl p-4 border shadow-lg transition-all ${isToday ? "border-primary/40 shadow-primary/10" : "border-white/5"}`}>
                  <p className={`text-sm font-bold mb-3 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {isToday ? "Oggi" : formatDate(date)}
                  </p>
                  <div className="text-4xl mb-3 text-center">{wmo.emoji}</div>
                  <p className="text-xs text-center text-muted-foreground mb-3">{wmo.label}</p>
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span className="text-blue-400">{data.daily.temperature_2m_min[i]}°</span>
                    <span className="text-orange-400">{data.daily.temperature_2m_max[i]}°</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Wind className="w-3 h-3" />
                      <span>{data.daily.wind_speed_10m_max[i]} km/h</span>
                      <WindDir deg={data.daily.wind_direction_10m_dominant[i]} />
                    </div>
                    {data.daily.precipitation_sum[i] > 0 && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Droplets className="w-3 h-3" />
                        <span>{data.daily.precipitation_sum[i]} mm</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
