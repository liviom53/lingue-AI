import { useState, useEffect, useRef } from "react";
import { pescatoAPI, spotAPI } from "@/hooks/use-local-data";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, Trash2, Edit2, Fish, Scale, Ruler, Camera, RotateCcw, ScanLine, Loader2, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SPECIE_LIST = [
  "Spigola/Branzino", "Orata", "Pesce Serra", "Ombrina", "Mormora", "Sarago",
  "Sparaglione", "Cefalo/Muggine", "Leccia stella", "Sogliola", "Anguilla",
  "Granchio blu", "Pagello fragolino", "Palamita", "Sgombro", "Ricciola",
  "Aguglia", "Gallinella", "Triglia", "Scorfano", "Dentice", "Seppie",
  "Calamaro", "Polpo", "Cernia bruna", "Altra specie"
];

function ImagePreview({ src }: { src: string }) {
  return (
    <div className="w-16 h-16 rounded-xl overflow-hidden bg-background border border-white/10 shrink-0">
      <img src={src} alt="cattura" className="w-full h-full object-cover" />
    </div>
  );
}

export default function Pescato() {
  const { data: catture = [], isLoading } = pescatoAPI.useList();
  const { data: spot = [] } = spotAPI.useList();
  const addMutation = pescatoAPI.useAdd();
  const updateMutation = pescatoAPI.useUpdate();
  const deleteMutation = pescatoAPI.useDelete();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    data: "", specie: "", peso: "", lunghezza: "", spotId: "",
    catchAndRelease: false, note: "", foto: ""
  });

  const [scanState, setScanState] = useState<"idle" | "loading" | "result">("idle");
  const [scanResult, setScanResult] = useState<{ specie: string; nome_scientifico: string; descrizione: string; peso_tipico: string; lunghezza_tipica: string } | null>(null);
  const [scanPhoto, setScanPhoto] = useState<string>("");
  const [scanError, setScanError] = useState<string>("");
  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("_diario_scan_result");
    if (raw) {
      localStorage.removeItem("_diario_scan_result");
      try {
        const scan = JSON.parse(raw);
        const today = new Date().toISOString().split("T")[0];
        setFormData(f => ({
          ...f,
          specie: scan.specie || "",
          foto: scan.foto || "",
          data: scan.data || today,
          note: scan.note || "",
        }));
        setIsFormOpen(true);
      } catch {}
    }
  }, []);

  const resetForm = () => {
    setFormData({ data: "", specie: "", peso: "", lunghezza: "", spotId: "", catchAndRelease: false, note: "", foto: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openEditForm = (c: any) => {
    setFormData({
      data: c.data || "", specie: c.specie || "", peso: c.peso || "",
      lunghezza: c.lunghezza || "", spotId: c.spotId || "",
      catchAndRelease: c.catchAndRelease || false, note: c.note || "", foto: c.foto || ""
    });
    setEditingId(c.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData }, {
        onSuccess: () => {
          toast({ title: "Cattura aggiornata" });
          resetForm();
        }
      });
    } else {
      addMutation.mutate(formData, {
        onSuccess: () => {
          toast({ title: "Cattura salvata! 🎣" });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Eliminare questa cattura?")) {
      deleteMutation.mutate(id);
      toast({ title: "Cattura eliminata" });
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

  const matchSpecie = (ai: string): string => {
    const norm = ai.toLowerCase().trim();
    for (const s of SPECIE_LIST) {
      if (s === "Altra specie") continue;
      const parts = s.toLowerCase().split("/");
      if (parts.some(p => norm.includes(p) || p.includes(norm))) return s;
    }
    return "Altra specie";
  };

  const handleScanPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (scanInputRef.current) scanInputRef.current.value = "";
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setScanPhoto(base64);
      setScanState("loading");
      setScanError("");
      try {
        const res = await fetch("/api/ai/scan-fish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        if (data.riconosciuto) {
          setScanResult({
            specie: matchSpecie(data.specie),
            nome_scientifico: data.nome_scientifico ?? "",
            descrizione: data.descrizione ?? "",
            peso_tipico: data.peso_tipico ?? "",
            lunghezza_tipica: data.lunghezza_tipica ?? "",
          });
          setScanState("result");
        } else {
          setScanError(data.messaggio ?? "Specie non riconosciuta.");
          setScanState("result");
          setScanResult(null);
        }
      } catch {
        setScanError("Errore di connessione. Riprova.");
        setScanState("result");
        setScanResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCompilaFromScan = () => {
    if (!scanResult) return;
    const today = new Date().toISOString().split("T")[0];
    setFormData(f => ({
      ...f,
      specie: scanResult.specie,
      foto: scanPhoto,
      data: today,
      note: scanResult.nome_scientifico ? `${scanResult.nome_scientifico}` : f.note,
    }));
    setScanState("idle");
    setScanResult(null);
    setScanPhoto("");
    setIsFormOpen(true);
    setEditingId(null);
  };

  const resetScan = () => {
    setScanState("idle");
    setScanResult(null);
    setScanPhoto("");
    setScanError("");
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary">Caricamento...</div>;

  const pesoTotale = catture.reduce((sum: number, c: any) => sum + (parseFloat(c.peso) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Pescato</h1>
          <p className="text-muted-foreground">{catture.length} catture · {pesoTotale.toFixed(1)} kg totali</p>
        </div>
        <div className="flex items-center gap-2">
          <label className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer shadow-lg border border-primary/30 ${scanState === "loading" ? "bg-primary/20 text-primary pointer-events-none" : "bg-card text-primary hover:bg-primary/10"}`}>
            {scanState === "loading"
              ? <><Loader2 className="w-5 h-5 animate-spin" /><span className="hidden sm:inline">Analisi…</span></>
              : <><ScanLine className="w-5 h-5" /><span className="hidden sm:inline">Scansiona</span></>
            }
            <input ref={scanInputRef} type="file" accept="image/*" capture="environment" onChange={handleScanPhoto} className="hidden" disabled={scanState === "loading"} />
          </label>
          <button
            onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); resetScan(); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuova Cattura</span>
          </button>
        </div>
      </div>

      {/* Scheda risultato scanner */}
      {scanState === "result" && (
        <div className={`rounded-2xl p-4 border animate-in fade-in slide-in-from-top-4 ${scanResult ? "bg-primary/5 border-primary/30" : "bg-destructive/5 border-destructive/30"}`}>
          <div className="flex items-start gap-3">
            {scanPhoto && <img src={scanPhoto} alt="scan" className="w-16 h-16 rounded-xl object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              {scanResult ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🐟</span>
                    <span className="font-bold text-white">{scanResult.specie}</span>
                    {scanResult.nome_scientifico && <span className="text-xs text-muted-foreground italic">({scanResult.nome_scientifico})</span>}
                  </div>
                  {scanResult.descrizione && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{scanResult.descrizione}</p>}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {scanResult.peso_tipico && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">⚖️ {scanResult.peso_tipico}</span>}
                    {scanResult.lunghezza_tipica && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">📏 {scanResult.lunghezza_tipica}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCompilaFromScan} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      <CheckCircle className="w-4 h-4" /> Compila i campi
                    </button>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-white/10 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/5 transition-colors cursor-pointer">
                      <RotateCcw className="w-4 h-4" /> Riprova
                      <input type="file" accept="image/*" capture="environment" onChange={handleScanPhoto} className="hidden" />
                    </label>
                    <button onClick={resetScan} className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-white/10 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/5 transition-colors">
                      <X className="w-4 h-4" /> Esci
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium text-destructive mb-1">Specie non riconosciuta</p>
                  <p className="text-xs text-muted-foreground mb-3">{scanError}</p>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors">
                      <RotateCcw className="w-4 h-4" /> Riprova
                      <input type="file" accept="image/*" capture="environment" onChange={handleScanPhoto} className="hidden" />
                    </label>
                    <button onClick={resetScan} className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-white/10 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/5 transition-colors">
                      <X className="w-4 h-4" /> Esci
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">{editingId ? "Modifica Cattura" : "Nuova Cattura"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Data</label>
                <input required type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Specie</label>
                <select required value={formData.specie} onChange={e => setFormData({ ...formData, specie: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Seleziona specie...</option>
                  {SPECIE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Peso (kg)</label>
                <input type="number" step="0.01" min="0" placeholder="Es. 1.5" value={formData.peso} onChange={e => setFormData({ ...formData, peso: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Lunghezza (cm)</label>
                <input type="number" step="0.1" min="0" placeholder="Es. 45" value={formData.lunghezza} onChange={e => setFormData({ ...formData, lunghezza: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Spot</label>
                <select value={formData.spotId} onChange={e => setFormData({ ...formData, spotId: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Nessuno spot selezionato</option>
                  {spot.map((s: any) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-center">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-background rounded-xl border border-white/10">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.catchAndRelease ? 'bg-primary' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.catchAndRelease ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-primary" /> Catch & Release</p>
                    <p className="text-xs text-muted-foreground">Rilasciata viva</p>
                  </div>
                  <input type="checkbox" checked={formData.catchAndRelease} onChange={e => setFormData({ ...formData, catchAndRelease: e.target.checked })} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Note</label>
              <textarea placeholder="Dove, come, con quale esca..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Foto</label>
              <label className="flex items-center gap-3 cursor-pointer bg-background border border-dashed border-white/20 rounded-xl p-4 hover:border-primary/50 transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formData.foto ? "Foto caricata ✓" : "Scatta o carica foto"}</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              </label>
              {formData.foto && <img src={formData.foto} alt="preview" className="mt-2 h-24 rounded-xl object-cover" />}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors">Annulla</button>
              <button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                {(addMutation.isPending || updateMutation.isPending) ? "Salvataggio..." : editingId ? "Aggiorna" : "Salva Cattura"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {catture.length === 0 && !isFormOpen && (
          <div className="bg-card border border-white/5 border-dashed rounded-3xl p-12 text-center">
            <Fish className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nessuna cattura registrata</h3>
            <p className="text-muted-foreground">Aggiungi la tua prima cattura.</p>
          </div>
        )}
        {catture.map((c: any) => {
          const spotName = spot.find((s: any) => s.id === c.spotId)?.nome;
          return (
            <div key={c.id} className="bg-card rounded-2xl p-5 border border-white/5 shadow-lg hover:border-primary/30 transition-all">
              <div className="flex items-start gap-4">
                {c.foto ? (
                  <ImagePreview src={c.foto} />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-background border border-white/10 flex items-center justify-center shrink-0">
                    <Fish className="w-8 h-8 text-white/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">{c.specie || "Specie sconosciuta"}</h3>
                      <p className="text-xs text-muted-foreground">{c.data ? format(new Date(c.data), "d MMMM yyyy", { locale: it }) : "—"}</p>
                    </div>
                    {c.catchAndRelease && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30 flex items-center gap-1 shrink-0">
                        <RotateCcw className="w-3 h-3" /> C&R
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    {c.peso && <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> {c.peso} kg</span>}
                    {c.lunghezza && <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {c.lunghezza} cm</span>}
                    {spotName && <span className="text-primary text-xs font-medium">📍 {spotName}</span>}
                  </div>
                  {c.note && <p className="text-sm mt-2 italic text-white/50">"{c.note}"</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEditForm(c)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
