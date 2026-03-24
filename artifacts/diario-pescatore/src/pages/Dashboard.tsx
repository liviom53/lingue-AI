import { Link } from "wouter";
import { Anchor, Fish, MapPin, CloudSun, ArrowRight, Activity, Thermometer } from "lucide-react";
import { usciteAPI, pescatoAPI, spotAPI } from "@/hooks/use-local-data";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

// Simple weather fetch for the dashboard widget
function useQuickWeather() {
  return useQuery({
    queryKey: ['quick-weather'],
    queryFn: async () => {
      // Porto Badino coords
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.28&longitude=13.16&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe/Rome");
      return res.json();
    }
  });
}

export default function Dashboard() {
  const { data: uscite = [] } = usciteAPI.useList();
  const { data: catture = [] } = pescatoAPI.useList();
  const { data: spot = [] } = spotAPI.useList();
  const { data: weather } = useQuickWeather();

  const today = format(new Date(), "EEEE d MMMM", { locale: it });

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden h-64 shadow-2xl border border-white/10 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-dashboard.png)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
          <div>
            <p className="text-primary font-medium text-sm mb-1 uppercase tracking-wider capitalize-first">{today}</p>
            <h2 className="font-display text-3xl font-bold text-white">Bentornato, Livio</h2>
          </div>
          
          {weather?.current && (
            <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <Thermometer className="w-5 h-5 text-primary" />
              <div className="text-right">
                <p className="text-lg font-bold leading-none">{weather.current.temperature_2m}°C</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Porto Badino</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Anchor} label="Uscite Totali" value={uscite.length} color="from-blue-600 to-blue-900" />
        <StatCard icon={Fish} label="Catture" value={catture.length} color="from-primary to-teal-900" />
        <StatCard icon={MapPin} label="Spot Salvati" value={spot.length} color="from-indigo-500 to-purple-900" />
        <StatCard icon={Activity} label="Punteggio Pesca" value="84/100" color="from-amber-500 to-orange-900" />
      </div>

      {/* Two columns layout for deeper content */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Previsioni Mini-Card */}
        <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <CloudSun className="text-primary w-6 h-6" />
              Previsioni Pesca
            </h3>
            <Link href="/previsioni" className="text-primary hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="bg-background rounded-2xl p-5 border border-white/5 flex-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground font-medium">Oggi</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                OTTIMO
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">Marea</span>
                  <span className="text-primary font-mono">+12pt</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">Fase Lunare</span>
                  <span className="text-primary font-mono">+8pt</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[65%] rounded-full" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-sm text-muted-foreground mb-2">Tecnica consigliata:</p>
              <div className="flex items-center gap-2">
                <span className="bg-white/10 px-3 py-1.5 rounded-lg text-white font-medium text-sm">Surfcasting Foce</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg text-white font-medium text-sm">Spigola</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ultime Uscite */}
        <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <Anchor className="text-blue-400 w-6 h-6" />
              Ultime Uscite
            </h3>
            <Link href="/uscite" className="text-primary hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {uscite.length === 0 ? (
              <div className="text-center py-8">
                <Anchor className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-muted-foreground">Nessuna uscita registrata.</p>
              </div>
            ) : (
              uscite.slice(0, 4).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-background border border-white/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">
                        {u.data ? format(new Date(u.data), "dd/MM") : "--"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{u.luogo || "Senza nome"}</p>
                      <p className="text-xs text-muted-foreground">{u.tecnica || "Varie"}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  return (
    <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-lg relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${color} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
      <Icon className="w-6 h-6 text-primary mb-4" />
      <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}
