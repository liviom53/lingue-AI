import { useState } from "react";
import { createLocalCrudHooks } from "@/hooks/use-local-data";
import { Plus, Trash2, Edit2, Car, AlertTriangle, Calendar, Fuel, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";

const veicoli_hooks = createLocalCrudHooks<any>("diario_veicoli");

function dayBadge(dateStr: string): { color: string; days: number } {
  if (!dateStr) return { color: "text-muted-foreground", days: 999 };
  const days = differenceInDays(parseISO(dateStr), new Date());
  if (days < 0) return { color: "text-red-400 bg-red-400/10 border-red-400/20", days };
  if (days < 15) return { color: "text-red-400 bg-red-400/10 border-red-400/20", days };
  if (days < 30) return { color: "text-orange-400 bg-orange-400/10 border-orange-400/20", days };
  if (days < 90) return { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", days };
  return { color: "text-green-400 bg-green-400/10 border-green-400/20", days };
}

function ScadenzaRow({ label, date }: { label: string; date: string }) {
  if (!date) return null;
  const { color, days } = dayBadge(date);
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-md border ${color}`}>
          {days < 0 ? `Scaduta ${-days}g fa` : days === 0 ? "Oggi!" : `${days}gg`}
        </span>
        <span className="text-xs text-muted-foreground">{format(parseISO(date), "dd/MM/yyyy")}</span>
      </div>
    </div>
  );
}

export default function ParcoAuto() {
  const { data: veicoli = [], isLoading } = veicoli_hooks.useList();
  const addMutation = veicoli_hooks.useAdd();
  const updateMutation = veicoli_hooks.useUpdate();
  const deleteMutation = veicoli_hooks.useDelete();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scadenze" | "manutenzione" | "rifornimento">("scadenze");
  const [formData, setFormData] = useState({
    nome: "", targa: "",
    revisione: "", assicurazione: "", bollo: "", tagliando: ""
  });
  const [manutenzioneForm, setManutenzioneForm] = useState({ data: "", tipo: "", km: "", costo: "", note: "" });
  const [rifornimentoForm, setRifornimentoForm] = useState({ data: "", litri: "", km: "", costoLitro: "" });

  const resetForm = () => {
    setFormData({ nome: "", targa: "", revisione: "", assicurazione: "", bollo: "", tagliando: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openEdit = (v: any) => {
    setFormData({
      nome: v.nome || "", targa: v.targa || "",
      revisione: v.revisione || "", assicurazione: v.assicurazione || "",
      bollo: v.bollo || "", tagliando: v.tagliando || ""
    });
    setEditingId(v.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const v = veicoli.find((x: any) => x.id === editingId);
      updateMutation.mutate({ ...v, ...formData }, {
        onSuccess: () => { toast({ title: "Veicolo aggiornato" }); resetForm(); }
      });
    } else {
      addMutation.mutate({ ...formData, manutenzioni: [], rifornimenti: [] }, {
        onSuccess: () => { toast({ title: "Veicolo aggiunto! 🚗" }); resetForm(); }
      });
    }
  };

  const addManutenzione = (veicoloId: string) => {
    const v = veicoli.find((x: any) => x.id === veicoloId);
    if (!v) return;
    const man = { id: Date.now().toString(), ...manutenzioneForm };
    updateMutation.mutate({ ...v, manutenzioni: [man, ...(v.manutenzioni || [])] }, {
      onSuccess: () => {
        setManutenzioneForm({ data: "", tipo: "", km: "", costo: "", note: "" });
        toast({ title: "Manutenzione aggiunta" });
      }
    });
  };

  const addRifornimento = (veicoloId: string) => {
    const v = veicoli.find((x: any) => x.id === veicoloId);
    if (!v) return;
    const rif = { id: Date.now().toString(), ...rifornimentoForm };
    updateMutation.mutate({ ...v, rifornimenti: [rif, ...(v.rifornimenti || [])] }, {
      onSuccess: () => {
        setRifornimentoForm({ data: "", litri: "", km: "", costoLitro: "" });
        toast({ title: "Rifornimento aggiunto" });
      }
    });
  };

  const selected = veicoli.find((v: any) => v.id === selectedId);

  const alerts = veicoli.flatMap((v: any) =>
    ["revisione", "assicurazione", "bollo", "tagliando"]
      .filter(k => v[k])
      .filter(k => differenceInDays(parseISO(v[k]), new Date()) <= 30)
      .map(k => ({ veicolo: v.nome, tipo: k, date: v[k] }))
  );

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Parco Auto</h1>
          <p className="text-muted-foreground">{veicoli.length} veicoli registrati</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Aggiungi Veicolo</span>
        </button>
      </div>

      {alerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-400 text-sm mb-1">⚠️ Scadenze imminenti!</p>
            {alerts.map((a, i) => (
              <p key={i} className="text-xs text-muted-foreground">{a.veicolo}: {a.tipo} → {format(parseISO(a.date), "dd/MM/yyyy")}</p>
            ))}
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">{editingId ? "Modifica Veicolo" : "Nuovo Veicolo"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Nome *</label>
                <input required type="text" placeholder="Es. Fiat Panda" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Targa</label>
                <input type="text" placeholder="Es. AA000BB" value={formData.targa} onChange={e => setFormData({ ...formData, targa: e.target.value.toUpperCase() })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              {[["revisione", "Revisione"], ["assicurazione", "Assicurazione"], ["bollo", "Bollo"], ["tagliando", "Tagliando"]].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Scadenza {label}</label>
                  <input type="date" value={(formData as any)[k]} onChange={e => setFormData({ ...formData, [k]: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors">Annulla</button>
              <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20">
                {editingId ? "Aggiorna" : "Aggiungi"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {veicoli.length === 0 && !isFormOpen && (
          <div className="md:col-span-2 bg-card border border-white/5 border-dashed rounded-3xl p-12 text-center">
            <Car className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nessun veicolo</h3>
            <p className="text-muted-foreground">Aggiungi i tuoi veicoli per tenere traccia delle scadenze.</p>
          </div>
        )}
        {veicoli.map((v: any) => {
          const nearestDays = Math.min(
            ...["revisione", "assicurazione", "bollo", "tagliando"]
              .filter(k => v[k])
              .map(k => differenceInDays(parseISO(v[k]), new Date()))
          );
          const badge = nearestDays < 30 ? "text-red-400 bg-red-400/10 border-red-400/20" :
            nearestDays < 90 ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
              "text-green-400 bg-green-400/10 border-green-400/20";
          return (
            <div key={v.id} className={`bg-card rounded-2xl p-5 border cursor-pointer transition-all shadow-lg ${selectedId === v.id ? "border-primary/50" : "border-white/5 hover:border-white/10"}`} onClick={() => setSelectedId(selectedId === v.id ? null : v.id)}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-white">{v.nome}</h3>
                    {v.targa && <p className="text-xs text-muted-foreground font-mono">{v.targa}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); openEdit(v); }} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (confirm("Eliminare?")) deleteMutation.mutate(v.id); }} className="p-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {nearestDays < 999 && (
                <span className={`text-xs px-2 py-0.5 rounded-md border mt-3 inline-block ${badge}`}>
                  {nearestDays < 0 ? "⚠️ Scaduta" : nearestDays < 30 ? `⚠️ Scade in ${nearestDays}gg` : `✓ Ok — ${nearestDays}gg`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="bg-card rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-bold text-xl">{selected.nome}</h2>
          </div>
          <div className="flex border-b border-white/5">
            {(["scadenze", "manutenzione", "rifornimento"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-white"}`}>
                {tab === "scadenze" ? "📅 Scadenze" : tab === "manutenzione" ? "🔧 Manutenzione" : "⛽ Rifornimenti"}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === "scadenze" && (
              <div>
                <ScadenzaRow label="Revisione" date={selected.revisione} />
                <ScadenzaRow label="Assicurazione" date={selected.assicurazione} />
                <ScadenzaRow label="Bollo" date={selected.bollo} />
                <ScadenzaRow label="Tagliando" date={selected.tagliando} />
              </div>
            )}
            {activeTab === "manutenzione" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input type="date" value={manutenzioneForm.data} onChange={e => setManutenzioneForm({ ...manutenzioneForm, data: e.target.value })} className="bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
                  <input type="text" placeholder="Tipo (es. Tagliando)" value={manutenzioneForm.tipo} onChange={e => setManutenzioneForm({ ...manutenzioneForm, tipo: e.target.value })} className="bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
                  <input type="number" placeholder="Km" value={manutenzioneForm.km} onChange={e => setManutenzioneForm({ ...manutenzioneForm, km: e.target.value })} className="bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
                  <div className="flex gap-2">
                    <input type="number" placeholder="€" value={manutenzioneForm.costo} onChange={e => setManutenzioneForm({ ...manutenzioneForm, costo: e.target.value })} className="flex-1 bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
                    <button onClick={() => addManutenzione(selected.id)} className="px-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium">+</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(selected.manutenzioni || []).map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-white/5 text-sm">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-white">{m.tipo}</p>
                          <p className="text-xs text-muted-foreground">{m.data} · {m.km}km</p>
                        </div>
                      </div>
                      {m.costo && <span className="text-white font-mono">€{m.costo}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "rifornimento" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input type="date" value={rifornimentoForm.data} onChange={e => setRifornimentoForm({ ...rifornimentoForm, data: e.target.value })} className="bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
                  <input type="number" placeholder="Litri" value={rifornimentoForm.litri} onChange={e => setRifornimentoForm({ ...rifornimentoForm, litri: e.target.value })} className="bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
                  <input type="number" placeholder="Km percorsi" value={rifornimentoForm.km} onChange={e => setRifornimentoForm({ ...rifornimentoForm, km: e.target.value })} className="bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
                  <div className="flex gap-2">
                    <input type="number" step="0.001" placeholder="€/L" value={rifornimentoForm.costoLitro} onChange={e => setRifornimentoForm({ ...rifornimentoForm, costoLitro: e.target.value })} className="flex-1 bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
                    <button onClick={() => addRifornimento(selected.id)} className="px-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium">+</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(selected.rifornimenti || []).map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-white/5 text-sm">
                      <div className="flex items-center gap-3">
                        <Fuel className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-white">{r.litri}L · {r.km}km</p>
                          <p className="text-xs text-muted-foreground">{r.data}</p>
                        </div>
                      </div>
                      {r.costoLitro && <span className="text-white font-mono">€{r.costoLitro}/L</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
