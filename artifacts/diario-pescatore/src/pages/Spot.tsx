import { useState } from "react";
import { spotAPI } from "@/hooks/use-local-data";
import { Plus, Trash2, Edit2, MapPin, Star, Layers, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FONDALI = ["Sabbioso","Fangoso","Roccioso","Misto sabbia/roccia","Prateria posidonia","Algoso"];

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-5 h-5 cursor-pointer transition-colors ${i<=value?"fill-amber-400 text-amber-400":"text-white/20"}`}
          onClick={() => onChange && onChange(i)} />
      ))}
    </div>
  );
}

const EMPTY = { nome:"", fondale:"", profondita:"", rating:3, lat:"", lng:"", note:"" };

export default function Spot() {
  const { data: spot=[], isLoading } = spotAPI.useList();
  const addMutation = spotAPI.useAdd();
  const updateMutation = spotAPI.useUpdate();
  const deleteMutation = spotAPI.useDelete();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY);

  const resetForm = () => { setFormData(EMPTY); setEditingId(null); setIsFormOpen(false); };

  const openEditForm = (s: any) => {
    setFormData({
      nome: s.nome||"", fondale: s.fondale||"", profondita: s.profondita||"",
      rating: s.rating||3, lat: s.lat||"", lng: s.lng||"", note: s.note||""
    });
    setEditingId(s.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData }, {
        onSuccess: () => { toast({ title: "Spot aggiornato" }); resetForm(); }
      });
    } else {
      addMutation.mutate(formData, {
        onSuccess: () => { toast({ title: "Spot salvato! 📍" }); resetForm(); }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Eliminare questo spot?")) {
      deleteMutation.mutate(id);
      toast({ title: "Spot eliminato" });
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { toast({ title: "GPS non disponibile" }); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      setFormData(p => ({
        ...p,
        lat: pos.coords.latitude.toFixed(6),
        lng: pos.coords.longitude.toFixed(6)
      }));
      toast({ title: "Posizione GPS acquisita 📍" });
    }, () => toast({ title: "Impossibile ottenere la posizione" }));
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Spot</h1>
          <p className="text-muted-foreground">I tuoi luoghi di pesca preferiti</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(EMPTY); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuovo Spot</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">{editingId ? "Modifica Spot" : "Nuovo Spot"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Nome Spot *</label>
                <input required type="text" placeholder="Es. Foce Portatore, Secca del Faro..."
                  value={formData.nome} onChange={e => setFormData({...formData,nome:e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Tipo di fondale</label>
                <select value={formData.fondale} onChange={e => setFormData({...formData,fondale:e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none">
                  <option value="">Seleziona...</option>
                  {FONDALI.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Profondità (m)</label>
                <input type="number" min="0" step="0.5" placeholder="Es. 15"
                  value={formData.profondita} onChange={e => setFormData({...formData,profondita:e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"/>
              </div>

              {/* Coordinate lat/lon */}
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Latitudine</label>
                <input type="number" step="0.000001" placeholder="Es. 41.280000"
                  value={formData.lat} onChange={e => setFormData({...formData,lat:e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Longitudine</label>
                <div className="flex gap-2">
                  <input type="number" step="0.000001" placeholder="Es. 13.160000"
                    value={formData.lng} onChange={e => setFormData({...formData,lng:e.target.value})}
                    className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"/>
                  <button type="button" onClick={handleGPS} title="Usa GPS"
                    className="p-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors">
                    <Navigation className="w-5 h-5 text-primary"/>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Valutazione</label>
                <StarRating value={formData.rating} onChange={v => setFormData({...formData,rating:v})}/>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Note</label>
              <textarea placeholder="Accesso, specie frequenti, note personali..."
                value={formData.note} onChange={e => setFormData({...formData,note:e.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-20 resize-none"/>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors">Annulla</button>
              <button type="submit" disabled={addMutation.isPending||updateMutation.isPending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                {(addMutation.isPending||updateMutation.isPending)?"Salvataggio...":editingId?"Aggiorna":"Salva Spot"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {spot.length===0&&!isFormOpen&&(
          <div className="md:col-span-2 bg-card border border-white/5 border-dashed rounded-3xl p-12 text-center">
            <MapPin className="w-16 h-16 text-white/10 mx-auto mb-4"/>
            <h3 className="text-xl font-bold mb-2">Nessuno spot salvato</h3>
            <p className="text-muted-foreground">Aggiungi i tuoi luoghi di pesca preferiti.</p>
          </div>
        )}
        {spot.map((s: any) => (
          <div key={s.id} className="bg-card rounded-2xl p-5 border border-white/5 shadow-lg hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                  <MapPin className="w-5 h-5 text-primary"/>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{s.nome}</h3>
                  <StarRating value={s.rating||0}/>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>openEditForm(s)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <Edit2 className="w-4 h-4"/>
                </button>
                <button onClick={()=>handleDelete(s.id)} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
              {s.fondale&&(
                <span className="flex items-center gap-1 px-2.5 py-1 bg-background rounded-lg border border-white/5">
                  <Layers className="w-3.5 h-3.5"/> {s.fondale}
                </span>
              )}
              {s.profondita&&(
                <span className="px-2.5 py-1 bg-background rounded-lg border border-white/5">~{s.profondita}m</span>
              )}
              {s.lat&&s.lng&&(
                <span className="flex items-center gap-1 px-2.5 py-1 bg-background rounded-lg border border-white/5 font-mono text-xs">
                  <Navigation className="w-3 h-3"/> {parseFloat(s.lat).toFixed(4)}, {parseFloat(s.lng).toFixed(4)}
                </span>
              )}
            </div>
            {s.note&&<p className="text-sm italic text-white/50">"{s.note}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
