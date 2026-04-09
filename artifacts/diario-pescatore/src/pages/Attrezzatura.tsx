import { useState } from "react";
import { attrezzaturaAPI } from "@/hooks/use-local-data";
import { Plus, Trash2, Edit2, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TIPI = ["Canna", "Mulinello", "Esca", "Accessorio"];
const STATI = ["Ottime condizioni", "Buone condizioni", "Da riparare", "Rotte"];
const STATI_COLOR: Record<string, string> = {
  "Ottime condizioni": "text-green-400 bg-green-400/10 border-green-400/20",
  "Buone condizioni": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Da riparare": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Rotte": "text-red-400 bg-red-400/10 border-red-400/20",
};
const TIPO_EMOJI: Record<string, string> = {
  "Canna": "🎣", "Mulinello": "⚙️", "Esca": "🐛", "Accessorio": "🧰"
};

export default function Attrezzatura() {
  const { data: items = [], isLoading } = attrezzaturaAPI.useList();
  const addMutation = attrezzaturaAPI.useAdd();
  const updateMutation = attrezzaturaAPI.useUpdate();
  const deleteMutation = attrezzaturaAPI.useDelete();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState("Tutti");
  const [formData, setFormData] = useState({ tipo: "Canna", nome: "", marca: "", stato: "Ottime condizioni", note: "" });

  const resetForm = () => {
    setFormData({ tipo: "Canna", nome: "", marca: "", stato: "Ottime condizioni", note: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openEdit = (item: any) => {
    setFormData({ tipo: item.tipo || "Canna", nome: item.nome || "", marca: item.marca || "", stato: item.stato || "Ottime condizioni", note: item.note || "" });
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData }, {
        onSuccess: () => { toast({ title: "Articolo aggiornato" }); resetForm(); }
      });
    } else {
      addMutation.mutate(formData, {
        onSuccess: () => { toast({ title: "Articolo aggiunto!" }); resetForm(); }
      });
    }
  };

  const filtered = filterTipo === "Tutti" ? items : items.filter((i: any) => i.tipo === filterTipo);
  const grouped = TIPI.reduce((acc, tipo) => {
    acc[tipo] = filtered.filter((i: any) => i.tipo === tipo);
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Attrezzatura</h1>
          <p className="text-muted-foreground">{items.length} articoli inventariati</p>
        </div>
        <button
          onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Aggiungi</span>
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["Tutti", ...TIPI].map(tipo => (
          <button key={tipo} onClick={() => setFilterTipo(tipo)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${filterTipo === tipo ? "bg-primary text-primary-foreground" : "bg-card border border-white/10 text-muted-foreground hover:text-white"}`}>
            {TIPO_EMOJI[tipo] || "📦"} {tipo}
          </button>
        ))}
      </div>

      {isFormOpen && (
        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">{editingId ? "Modifica Articolo" : "Nuovo Articolo"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Tipo</label>
                <select value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none">
                  {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Nome *</label>
                <input required type="text" placeholder="Es. Shimano Beastmaster" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Marca</label>
                <input type="text" placeholder="Es. Shimano, Daiwa..." value={formData.marca} onChange={e => setFormData({ ...formData, marca: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Stato</label>
                <select value={formData.stato} onChange={e => setFormData({ ...formData, stato: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none">
                  {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Note</label>
              <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-16 resize-none" placeholder="Caratteristiche, misure, lenza..." />
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

      {filterTipo === "Tutti" ? (
        <div className="space-y-6">
          {TIPI.map(tipo => {
            const tipoItems = grouped[tipo];
            if (tipoItems.length === 0) return null;
            return (
              <div key={tipo}>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>{TIPO_EMOJI[tipo]}</span> {tipo}e ({tipoItems.length})
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {tipoItems.map((item: any) => <AttrItem key={item.id} item={item} onEdit={openEdit} onDelete={(id) => { deleteMutation.mutate(id); toast({ title: "Eliminato" }); }} />)}
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="bg-card border border-white/5 border-dashed rounded-3xl p-12 text-center">
              <Wrench className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Inventario vuoto</h3>
              <p className="text-muted-foreground">Aggiungi la tua attrezzatura da pesca.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((item: any) => <AttrItem key={item.id} item={item} onEdit={openEdit} onDelete={(id) => { deleteMutation.mutate(id); toast({ title: "Eliminato" }); }} />)}
          {filtered.length === 0 && (
            <div className="md:col-span-2 bg-card border border-white/5 border-dashed rounded-3xl p-8 text-center">
              <p className="text-muted-foreground">Nessun articolo in questa categoria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AttrItem({ item, onEdit, onDelete }: { item: any; onEdit: (i: any) => void; onDelete: (id: string) => void }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-white/5 shadow-lg hover:border-primary/20 transition-all flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-background border border-white/10 flex items-center justify-center shrink-0 text-lg">
        {TIPO_EMOJI[item.tipo] || "📦"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white">{item.nome}</p>
        {item.marca && <p className="text-xs text-muted-foreground">{item.marca}</p>}
        {item.stato && (
          <span className={`text-xs px-2 py-0.5 rounded-md border mt-1 inline-block ${STATI_COLOR[item.stato] || "text-white/40"}`}>
            {item.stato}
          </span>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onEdit(item)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { if (confirm("Eliminare?")) onDelete(item.id); }} className="p-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
