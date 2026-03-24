import { pescatoAPI, usciteAPI } from "@/hooks/use-local-data";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Fish, Anchor, Scale, TrendingUp } from "lucide-react";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#a78bfa", "#fb7185"];
const MONTHS_IT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-white/5 shadow-lg">
      <Icon className="w-5 h-5 text-primary mb-3" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      {sub && <p className="text-xs text-primary mt-1">{sub}</p>}
    </div>
  );
}

export default function Statistiche() {
  const { data: catture = [] } = pescatoAPI.useList();
  const { data: uscite = [] } = usciteAPI.useList();

  const pesoTotale = catture.reduce((s: number, c: any) => s + (parseFloat(c.peso) || 0), 0);
  const pesoMedio = catture.length > 0 ? (pesoTotale / catture.length).toFixed(2) : "0";

  const specieCounts = catture.reduce((acc: Record<string, number>, c: any) => {
    const sp = c.specie || "Sconosciuta";
    acc[sp] = (acc[sp] || 0) + 1;
    return acc;
  }, {});
  const specieData = Object.entries(specieCounts)
    .map(([nome, count]) => ({ nome, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const usciteMese = uscite.reduce((acc: Record<string, number>, u: any) => {
    if (u.data) {
      const m = new Date(u.data).getMonth();
      acc[m] = (acc[m] || 0) + 1;
    }
    return acc;
  }, {});
  const mesiData = MONTHS_IT.map((nome, i) => ({ nome, uscite: usciteMese[i] || 0 }));

  const tecnicheCounts = uscite.reduce((acc: Record<string, number>, u: any) => {
    const t = u.tecnica || "Non specificata";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const tecnicheData = Object.entries(tecnicheCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Statistiche</h1>
        <p className="text-muted-foreground">Il tuo diario in numeri</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Anchor} label="Uscite totali" value={uscite.length} />
        <StatCard icon={Fish} label="Catture totali" value={catture.length} />
        <StatCard icon={Scale} label="Peso totale" value={`${pesoTotale.toFixed(1)} kg`} />
        <StatCard icon={TrendingUp} label="Peso medio" value={`${pesoMedio} kg`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {specieData.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Catture per Specie</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={specieData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis type="category" dataKey="nome" width={120} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                <Bar dataKey="count" name="Catture" radius={[0, 8, 8, 0]}>
                  {specieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {mesiData.some(m => m.uscite > 0) && (
          <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Uscite per Mese</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mesiData}>
                <XAxis dataKey="nome" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                <Bar dataKey="uscite" name="Uscite" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {tecnicheData.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Tecniche Usate</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={tecnicheData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {tecnicheData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {catture.length === 0 && uscite.length === 0 && (
        <div className="bg-card border border-white/5 border-dashed rounded-3xl p-16 text-center">
          <TrendingUp className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Nessun dato da visualizzare</h3>
          <p className="text-muted-foreground">Registra uscite e catture per vedere le statistiche.</p>
        </div>
      )}
    </div>
  );
}
