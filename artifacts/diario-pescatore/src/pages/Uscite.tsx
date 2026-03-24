import { useState } from "react";
import { usciteAPI } from "@/hooks/use-local-data";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, Trash2, Edit2, Calendar, MapPin, Wind, Anchor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Uscite() {
  const { data: uscite = [], isLoading } = usciteAPI.useList();
  const addMutation = usciteAPI.useAdd();
  const deleteMutation = usciteAPI.useDelete();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ data: "", luogo: "", tecnica: "", meteo: "", note: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData, {
      onSuccess: () => {
        setIsFormOpen(false);
        setFormData({ data: "", luogo: "", tecnica: "", meteo: "", note: "" });
        toast({ title: "Uscita salvata", description: "La tua uscita è stata registrata." });
      }
    });
  };

  const handleDelete = (id: string) => {
    if(confirm("Sei sicuro di voler eliminare questa uscita?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Uscite</h1>
          <p className="text-muted-foreground">Registro delle tue battute di pesca</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuova Uscita</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">Nuova Uscita</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Data</label>
                <input required type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Luogo / Spot</label>
                <input required type="text" placeholder="Es. Foce Portatore" value={formData.luogo} onChange={e => setFormData({...formData, luogo: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Tecnica</label>
                <select value={formData.tecnica} onChange={e => setFormData({...formData, tecnica: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none">
                  <option value="">Seleziona...</option>
                  <option value="Surfcasting">Surfcasting</option>
                  <option value="Spinning">Spinning</option>
                  <option value="Feeder">Feeder / Fondo</option>
                  <option value="Bolognese">Bolognese</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Condizioni (Meteo/Mare)</label>
                <input type="text" placeholder="Mare calmo, vento NNE" value={formData.meteo} onChange={e => setFormData({...formData, meteo: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Note Libere</label>
              <textarea placeholder="Racconta com'è andata..." value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors">Annulla</button>
              <button type="submit" disabled={addMutation.isPending} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                {addMutation.isPending ? "Salvataggio..." : "Salva Uscita"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {uscite.length === 0 && !isFormOpen && (
          <div className="bg-card border border-white/5 border-dashed rounded-3xl p-12 text-center">
            <Anchor className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nessuna uscita registrata</h3>
            <p className="text-muted-foreground">Clicca su Nuova Uscita per iniziare il tuo diario.</p>
          </div>
        )}

        {uscite.map((u: any) => (
          <div key={u.id} className="bg-card rounded-2xl p-5 border border-white/5 shadow-lg group hover:border-primary/30 transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-background to-background/50 border border-white/10 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs text-primary font-bold">{u.data ? format(new Date(u.data), "MMM").toUpperCase() : "--"}</span>
                <span className="text-lg font-bold leading-none">{u.data ? format(new Date(u.data), "dd") : "--"}</span>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {u.luogo || "Spot Sconosciuto"}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Anchor className="w-3.5 h-3.5" /> {u.tecnica || "N/A"}</span>
                  <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> {u.meteo || "N/A"}</span>
                </div>
                {u.note && <p className="text-sm mt-2 italic text-white/60">"{u.note}"</p>}
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end border-t border-white/5 md:border-none pt-3 md:pt-0">
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(u.id)} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
