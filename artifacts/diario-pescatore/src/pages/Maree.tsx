import { useMemo, useState } from "react";
import { Waves, Moon, Sun, Sunrise } from "lucide-react";

function getMoonPhase(date: Date): { phase: number; nome: string; emoji: string } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let y = year, m = month;
  if (m <= 2) { y--; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  const daysSinceNew = (jd - 2451549.5) % 29.53;
  const phase = daysSinceNew / 29.53;
  const names = [
    { max: 0.03, nome: "Luna Nuova", emoji: "🌑" },
    { max: 0.22, nome: "Luna Crescente", emoji: "🌒" },
    { max: 0.28, nome: "Quarto Crescente", emoji: "🌓" },
    { max: 0.47, nome: "Gibbosa Crescente", emoji: "🌔" },
    { max: 0.53, nome: "Luna Piena", emoji: "🌕" },
    { max: 0.72, nome: "Gibbosa Calante", emoji: "🌖" },
    { max: 0.78, nome: "Quarto Calante", emoji: "🌗" },
    { max: 0.97, nome: "Luna Calante", emoji: "🌘" },
    { max: 1.00, nome: "Luna Nuova", emoji: "🌑" },
  ];
  const found = names.find(n => phase <= n.max) || names[8];
  return { phase, nome: found.nome, emoji: found.emoji };
}

function getTidalHeight(date: Date, hour: number): number {
  const t = (date.getTime() + hour * 3600000) / 1000;
  const M2 = 2 * Math.PI * t / (12.42 * 3600);
  const K1 = 2 * Math.PI * t / (23.93 * 3600);
  const M4 = 2 * Math.PI * t / (6.21 * 3600);
  return 0.35 * Math.sin(M2) + 0.12 * Math.sin(K1 + 1.2) + 0.08 * Math.sin(M4 + 0.5);
}

function getDayTides(date: Date) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const heights = hours.map(h => ({ h, height: getTidalHeight(date, h) }));
  const highs: number[] = [], lows: number[] = [];
  for (let i = 1; i < 23; i++) {
    if (heights[i].height > heights[i - 1].height && heights[i].height > heights[i + 1].height) highs.push(i);
    if (heights[i].height < heights[i - 1].height && heights[i].height < heights[i + 1].height) lows.push(i);
  }
  return { highs, lows, heights };
}

const MONTHS_IT = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const DAYS_IT_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export default function Maree() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const date = useMemo(() => new Date(selectedDate), [selectedDate]);
  const moon = useMemo(() => getMoonPhase(date), [date]);
  const tides = useMemo(() => getDayTides(date), [date]);

  const calendarDays = useMemo(() => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      const dd = new Date(date.getFullYear(), date.getMonth(), d);
      days.push({ d, moon: getMoonPhase(dd) });
    }
    return days;
  }, [date]);

  const maxH = Math.max(...tides.heights.map(h => Math.abs(h.height)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Maree & Luna</h1>
        <p className="text-muted-foreground">Calcolo armonico M2+K1+M4 · Porto Badino</p>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Data</label>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Luna */}
        <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Fase Lunare</h2>
          <div className="flex items-center gap-6">
            <div className="text-7xl">{moon.emoji}</div>
            <div>
              <p className="text-2xl font-bold text-white">{moon.nome}</p>
              <p className="text-muted-foreground text-sm">{(moon.phase * 100).toFixed(0)}% del ciclo</p>
              <div className="mt-3 h-2 bg-white/5 rounded-full w-32 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${moon.phase * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tide moments */}
        <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Orari Maree Oggi</h2>
          <div className="space-y-3">
            {tides.highs.map(h => (
              <div key={`h${h}`} className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <Waves className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Alta Marea</span>
                </div>
                <span className="font-mono text-blue-400">{String(h).padStart(2, "0")}:00</span>
              </div>
            ))}
            {tides.lows.map(h => (
              <div key={`l${h}`} className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <Waves className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium text-white">Bassa Marea</span>
                </div>
                <span className="font-mono text-indigo-400">{String(h).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tide chart */}
      <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Grafico Maree — 24h</h2>
        <div className="relative h-32 flex items-end gap-1">
          {tides.heights.map(({ h, height }) => {
            const pct = ((height + maxH) / (2 * maxH)) * 100;
            const isHigh = tides.highs.includes(h);
            const isLow = tides.lows.includes(h);
            return (
              <div key={h} className="flex-1 flex flex-col items-center justify-end" title={`${h}:00 — ${height.toFixed(2)}m`}>
                <div
                  className={`w-full rounded-t transition-all ${isHigh ? "bg-blue-400" : isLow ? "bg-indigo-400" : "bg-primary/40"}`}
                  style={{ height: `${pct}%`, minHeight: "4px" }}
                />
              </div>
            );
          })}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div className="w-full border-t border-dashed border-white/10" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
          Calendario Lunare — {MONTHS_IT[date.getMonth()]} {date.getFullYear()}
        </h2>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS_IT_SHORT.map(d => <div key={d} className="text-xs text-muted-foreground py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const isSelected = day.d === date.getDate();
            return (
              <button
                key={day.d}
                onClick={() => {
                  const dd = new Date(date.getFullYear(), date.getMonth(), day.d);
                  setSelectedDate(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}-${String(dd.getDate()).padStart(2, "0")}`);
                }}
                className={`p-1 rounded-lg text-center transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-white/5 text-white"}`}
              >
                <div className="text-xs">{day.d}</div>
                <div className="text-lg leading-none">{day.moon.emoji}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
