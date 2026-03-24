import { useState } from "react";
import { createLocalCrudHooks } from "@/hooks/use-local-data";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const finanzeAPI = createLocalCrudHooks<any>("diario_finanze");

const CATEGORIE_USCITA = ["Attrezzatura", "Esche", "Viaggi/Carburante", "Manutenzione barca", "Licenze/Permessi", "Cibo/Ristorante", "Varie"];
const CATEGORIE_ENTRATA = ["Vendita pesce", "Rimborsi", "Varie"];
const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#f97316"];
const MONTHS_IT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

export default function Finanze() {
  const { data: movimenti = [], isLoading } = finanzeAPI.useList();
  const addMutation = finanzeAPI.useAdd();
  const deleteMutation = finanzeAPI.useDelete();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState<"tutti" | "entrata" | "uscita">("tutti");
  const [formData, setFormData] = useState({ tipo: "uscita", categoria: "", importo: "", data: "", nota: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Movimento salvato!" });
        setFormData({ tipo: "uscita", categoria: "", importo: "", data: "", nota: "" });
        setIsFormOpen(false);
      }
    });
  };

  const filtered = filterTipo === "tutti" ? movimenti : movimenti.filter((m: any) => m.tipo === filterTipo);

  const totEntrate = movimenti.filter((m: any) => m.tipo === "entrata").reduce((s: number, m: any) => s + parseFloat(m.importo || 0), 0);
  const totUscite = movimenti.filter((m: any) => m.tipo === "uscita").reduce((s: number, m: any) => s + parseFloat(m.importo || 0), 0);
  const saldo = totEntrate - totUscite;

  const categorieCounts = movimenti
    .filter((m: any) => m.tipo === "uscita")
    .reduce((acc: Record<string, number>, m: any) => {
      const cat = m.categoria || "Varie";
      acc[cat] = (acc[cat] || 0) + parseFloat(m.importo || 0);
      return acc;
    }, {});
  const catData = Object.entries(categorieCounts).map(([name, value]) => ({ name, value: Math.round(value as number) }));

  const mesiData = MONTHS_IT.map((nome, i) => {
    const entrate = movimenti.filter((m: any) => m.tipo === "entrata" && m.data && new Date(m.data).getMonth() === i)
      .reduce((s: number, m: any) => s + parseFloat(m.importo || 0), 0);
    const uscite = movimenti.filter((m: any) => m.tipo === "uscita" && m.data && new Date(m.data).getMonth() === i)
      .reduce((s: number, m: any) => s + parseFloat(m.importo || 0), 0);
    return { nome, entrate: Math.round(entrate), uscite: Math.round(uscite) };
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Finanze</h1>
          <p className="text-muted-foreground">Entrate e uscite fishing-related</p>
        </div>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Aggiungi</span>
        </button>
      </div>

      {/* Saldo cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-green-400">€{totEntrate.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Entrate</p>
        </div>
        <div className={`bg-card rounded-2xl p-4 border text-center ${saldo >= 0 ? "border-green-500/20" : "border-red-500/20"}`}>
          <Wallet className={`w-5 h-5 mx-auto mb-2 ${saldo >= 0 ? "text-green-400" : "text-red-400"}`} />
          <p className={`text-xl font-bold ${saldo >= 0 ? "text-green-400" : "text-red-400"}`}>€{saldo.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Saldo</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
          <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-red-400">€{totUscite.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Uscite</p>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">Nuovo Movimento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {["entrata", "uscita"].map(tipo => (
                <button key={tipo} type="button" onClick={() => setFormData({ ...formData, tipo, categoria: "" })} className={`flex-1 py-2 rounded-xl font-medium transition-colors ${formData.tipo === tipo ? (tipo === "entrata" ? "bg-green-500 text-white" : "bg-red-500 text-white") : "bg-white/5 text-muted-foreground hover:text-white"}`}>
                  {tipo === "entrata" ? "↑ Entrata" : "↓ Uscita"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Importo (€) *</label>
                <input required type="number" step="0.01" min="0" placeholder="Es. 45.00" value={formData.importo} onChange={e => setFormData({ ...formData, importo: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Data *</label>
                <input required type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Categoria</label>
                <select value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none">
                  <option value="">Seleziona...</option>
                  {(formData.tipo === "entrata" ? CATEGORIE_ENTRATA : CATEGORIE_USCITA).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Nota</label>
                <input type="text" placeholder="Descrizione..." value={formData.nota} onChange={e => setFormData({ ...formData, nota: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors">Annulla</button>
              <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20">Salva</button>
            </div>
          </form>
        </div>
      )}

      {/* Charts */}
      {movimenti.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Andamento Mensile</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mesiData}>
                <XAxis dataKey="nome" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} formatter={(v: number) => [`€${v}`, ""]} />
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 11 }} />
                <Bar dataKey="entrate" name="Entrate" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="uscite" name="Uscite" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {catData.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
              <h2 className="text-lg font-bold mb-4">Uscite per Categoria</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {catData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} formatter={(v: number) => [`€${v}`, ""]} />
                  <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Filter + list */}
      <div>
        <div className="flex gap-2 mb-4">
          {(["tutti", "entrata", "uscita"] as const).map(tipo => (
            <button key={tipo} onClick={() => setFilterTipo(tipo)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${filterTipo === tipo ? "bg-primary text-primary-foreground" : "bg-card border border-white/10 text-muted-foreground hover:text-white"}`}>
              {tipo === "tutti" ? "Tutti" : tipo === "entrata" ? "↑ Entrate" : "↓ Uscite"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="bg-card border border-white/5 border-dashed rounded-2xl p-8 text-center">
              <Wallet className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-muted-foreground">Nessun movimento registrato.</p>
            </div>
          )}
          {filtered.map((m: any) => (
            <div key={m.id} className="bg-card rounded-xl p-4 border border-white/5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.tipo === "entrata" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {m.tipo === "entrata" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{m.categoria || m.nota || (m.tipo === "entrata" ? "Entrata" : "Uscita")}</p>
                <p className="text-xs text-muted-foreground">{m.data ? format(new Date(m.data), "d MMMM yyyy", { locale: it }) : "—"}{m.nota && m.categoria ? ` · ${m.nota}` : ""}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold font-mono ${m.tipo === "entrata" ? "text-green-400" : "text-red-400"}`}>
                  {m.tipo === "entrata" ? "+" : "-"}€{parseFloat(m.importo || 0).toFixed(2)}
                </p>
              </div>
              <button onClick={() => { if (confirm("Eliminare?")) { deleteMutation.mutate(m.id); toast({ title: "Movimento eliminato" }); } }} className="p-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
