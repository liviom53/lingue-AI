import { useState } from "react";
import { createLocalCrudHooks } from "@/hooks/use-local-data";
import { Plus, Trash2, Edit2, ChefHat, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ricetteAPI = createLocalCrudHooks<any>("diario_ricette");

const SPECIE_LIST = [
  "Spigola/Branzino", "Orata", "Pesce Serra", "Ombrina", "Mormora", "Cefalo",
  "Sogliola", "Gallinella", "Triglia", "Scorfano", "Seppie", "Calamaro",
  "Polpo", "Dentice", "Sgombro", "Ricciola", "Pesce misto", "Altra specie"
];

export default function Ricette() {
  const { data: ricette = [], isLoading } = ricetteAPI.useList();
  const addMutation = ricetteAPI.useAdd();
  const updateMutation = ricetteAPI.useUpdate();
  const deleteMutation = ricetteAPI.useDelete();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "", specie: "", ingredienti: "", procedimento: "", note: "", foto: ""
  });

  const resetForm = () => {
    setFormData({ nome: "", specie: "", ingredienti: "", procedimento: "", note: "", foto: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openEdit = (r: any) => {
    setFormData({
      nome: r.nome || "", specie: r.specie || "", ingredienti: r.ingredienti || "",
      procedimento: r.procedimento || "", note: r.note || "", foto: r.foto || ""
    });
    setEditingId(r.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData }, {
        onSuccess: () => { toast({ title: "Ricetta aggiornata" }); resetForm(); }
      });
    } else {
      addMutation.mutate(formData, {
        onSuccess: () => { toast({ title: "Ricetta salvata! 👨‍🍳" }); resetForm(); }
      });
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormData(f => ({ ...f, foto: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Ricette</h1>
          <p className="text-muted-foreground">Come cucinare il tuo pescato</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuova Ricetta</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">{editingId ? "Modifica Ricetta" : "Nuova Ricetta"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Nome Ricetta *</label>
                <input required type="text" placeholder="Es. Spigola all'acqua pazza" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Specie</label>
                <select value={formData.specie} onChange={e => setFormData({ ...formData, specie: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none">
                  <option value="">Seleziona...</option>
                  {SPECIE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Foto</label>
                <label className="flex items-center gap-2 cursor-pointer bg-background border border-dashed border-white/20 rounded-xl p-3 hover:border-primary/50 transition-colors text-sm text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  {formData.foto ? "Foto caricata ✓" : "Aggiungi foto"}
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Ingredienti</label>
              <textarea placeholder="Lista degli ingredienti..." value={formData.ingredienti} onChange={e => setFormData({ ...formData, ingredienti: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-24 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Procedimento</label>
              <textarea placeholder="Passo dopo passo..." value={formData.procedimento} onChange={e => setFormData({ ...formData, procedimento: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-32 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Note</label>
              <textarea placeholder="Varianti, consigli, abbinamenti vini..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-16 resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors">Annulla</button>
              <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20">
                {editingId ? "Aggiorna" : "Salva Ricetta"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {ricette.length === 0 && !isFormOpen && (
          <div className="md:col-span-2 bg-card border border-white/5 border-dashed rounded-3xl p-12 text-center">
            <ChefHat className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nessuna ricetta salvata</h3>
            <p className="text-muted-foreground">Aggiungi le tue ricette con il pescato.</p>
          </div>
        )}
        {ricette.map((r: any) => (
          <div key={r.id} className="bg-card rounded-2xl border border-white/5 shadow-lg hover:border-primary/30 transition-all overflow-hidden">
            {r.foto && <img src={r.foto} alt={r.nome} className="w-full h-40 object-cover" />}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white text-lg">{r.nome}</h3>
                  {r.specie && <p className="text-xs text-primary font-medium">🐟 {r.specie}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(r)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { if (confirm("Eliminare?")) { deleteMutation.mutate(r.id); } }} className="p-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {r.ingredienti && (
                <div>
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="text-xs text-primary hover:underline mt-2">
                    {expanded === r.id ? "Chiudi ▲" : "Mostra ricetta ▼"}
                  </button>
                  {expanded === r.id && (
                    <div className="mt-3 space-y-3 text-sm animate-in fade-in">
                      <div>
                        <p className="font-bold text-white mb-1">Ingredienti:</p>
                        <p className="text-muted-foreground whitespace-pre-line">{r.ingredienti}</p>
                      </div>
                      {r.procedimento && (
                        <div>
                          <p className="font-bold text-white mb-1">Procedimento:</p>
                          <p className="text-muted-foreground whitespace-pre-line">{r.procedimento}</p>
                        </div>
                      )}
                      {r.note && <p className="text-xs italic text-white/40 border-t border-white/5 pt-2">{r.note}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
