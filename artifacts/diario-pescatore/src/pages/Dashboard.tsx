import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Anchor, Fish, MapPin, ArrowRight, Scale, ChevronDown,
  Camera, Plus, X, Loader2
} from "lucide-react";
import { usciteAPI, pescatoAPI, spotAPI } from "@/hooks/use-local-data";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FishingForecastCard } from "@/components/FishingForecastCard";
import { STAZIONI, getSharedStation, setSharedStation } from "@/hooks/use-location";
import { useToast } from "@/hooks/use-toast";

/* ═══════════════════════════════════
   SCANNER MANUALE (foto + form)
═══════════════════════════════════ */
function ManualScanner() {
  const [preview, setPreview] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [formData, setFormData] = useState({ specie: "", peso: "", lunghezza: "", spot: "", note: "" });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const addCattura = pescatoAPI.useAdd();
  const { toast } = useToast();

  const handlePhoto = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(URL.createObjectURL(file));
      setPhotoData(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const reset = () => {
    setPreview(null);
    setPhotoData(null);
    setFormData({ specie: "", peso: "", lunghezza: "", spot: "", note: "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addCattura.mutateAsync({
        ...formData,
        foto: photoData ?? undefined,
        data: new Date().toISOString().split("T")[0],
      });
      toast({ title: `Cattura salvata! 🐟${formData.specie ? ` ${formData.specie}` : ""}` });
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-white/5 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-400" />Scanner Cattura
        </h3>
        <span className="text-[10px] text-muted-foreground/60">foto + dati → salva nel diario</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ""; }} />

      {!preview ? (
        <button onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all group">
          <Camera className="w-10 h-10 text-white/20 group-hover:text-primary transition-colors" />
          <div className="text-center">
            <p className="text-sm font-medium text-white">Scatta o carica una foto</p>
            <p className="text-xs text-muted-foreground mt-1">poi compila i dati e salva la cattura</p>
          </div>
        </button>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={preview} alt="cattura" className="w-full h-36 object-cover" />
            <button type="button" onClick={reset}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Specie *" required value={formData.specie}
              onChange={e => setFormData(p => ({ ...p, specie: e.target.value }))}
              className="col-span-2 bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
            <input placeholder="Peso (kg)" type="number" step="0.01" value={formData.peso}
              onChange={e => setFormData(p => ({ ...p, peso: e.target.value }))}
              className="bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
            <input placeholder="Lunghezza (cm)" type="number" value={formData.lunghezza}
              onChange={e => setFormData(p => ({ ...p, lunghezza: e.target.value }))}
              className="bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
            <input placeholder="Spot" value={formData.spot}
              onChange={e => setFormData(p => ({ ...p, spot: e.target.value }))}
              className="col-span-2 bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
            <input placeholder="Note" value={formData.note}
              onChange={e => setFormData(p => ({ ...p, note: e.target.value }))}
              className="col-span-2 bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Salvataggio…</> : <><Plus className="w-4 h-4" />Salva cattura</>}
          </button>
        </form>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   HOME PAGE
═══════════════════════════════════ */
export default function Home() {
  const [stazioneKey, setStazioneKey] = useState(() => getSharedStation());
  const [showStazioni, setShowStazioni] = useState(false);

  const { data: uscite = [] } = usciteAPI.useList();
  const { data: catture = [] } = pescatoAPI.useList();
  const { data: spot = [] } = spotAPI.useList();

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  const pesoTotale = catture.reduce((s: number, c: any) => s + (parseFloat(c.peso) || 0), 0);

  const selectStazione = (k: string) => {
    setStazioneKey(k);
    setSharedStation(k);
    setShowStazioni(false);
  };

  return (
    <div className="space-y-5">

      {/* ── INTESTAZIONE ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-primary text-sm font-semibold capitalize">{today}</p>
          <h1 className="text-3xl font-display font-bold text-white mt-0.5">
            Bentornato, <span className="text-primary">Limax</span> 🎣
          </h1>
        </div>

        {/* Selettore stazione */}
        <div className="relative shrink-0">
          <button onClick={() => setShowStazioni(v => !v)}
            className="flex items-center gap-2 bg-card border border-white/10 px-4 py-2.5 rounded-2xl text-sm font-medium hover:border-primary/50 transition-colors">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="max-w-[140px] truncate">{STAZIONI[stazioneKey]?.nome ?? "Porto Badino"}</span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showStazioni && "rotate-180")} />
          </button>
          {showStazioni && (
            <div className="absolute right-0 top-12 w-56 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {Object.entries(STAZIONI).map(([k, s]) => (
                <button key={k} onClick={() => selectStazione(k)}
                  className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2",
                    k === stazioneKey ? "text-primary font-semibold bg-primary/5" : "text-foreground")}>
                  {k === stazioneKey && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  {s.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── STATISTICHE ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Anchor} label="Uscite" value={uscite.length} color="text-blue-400" />
        <MiniStat icon={Fish} label="Catture" value={catture.length} color="text-primary" />
        <MiniStat icon={Scale} label="Kg Totali" value={`${pesoTotale.toFixed(1)}`} color="text-teal-400" />
        <MiniStat icon={MapPin} label="Spot" value={spot.length} color="text-indigo-400" />
      </div>

      {/* ── CARD PREVISIONI PESCA ── */}
      <FishingForecastCard stazioneKey={stazioneKey} />

      {/* ── SCANNER CATTURA ── */}
      <ManualScanner />

      {/* ── ULTIME USCITE + CATTURE ── */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Anchor className="w-5 h-5 text-blue-400" />Ultime Uscite
            </h3>
            <Link href="/uscite" className="text-primary text-xs flex items-center gap-1 hover:text-white transition-colors">
              Vedi tutte<ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {uscite.length === 0 ? (
              <div className="text-center py-6">
                <Anchor className="w-10 h-10 text-white/10 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nessuna uscita registrata</p>
              </div>
            ) : uscite.slice(0, 4).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-background border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">
                    {u.data ? format(new Date(u.data), "dd/MM") : "--"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{u.luogo || "Senza luogo"}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.tecnica || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Fish className="w-5 h-5 text-primary" />Ultime Catture
            </h3>
            <Link href="/pescato" className="text-primary text-xs flex items-center gap-1 hover:text-white transition-colors">
              Vedi tutte<ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {catture.length === 0 ? (
              <div className="text-center py-6">
                <Fish className="w-10 h-10 text-white/10 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nessuna cattura registrata</p>
              </div>
            ) : catture.slice(0, 4).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                {c.foto ? (
                  <img src={c.foto} alt={c.specie} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Fish className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{c.specie || "Specie sconosciuta"}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.peso ? `${c.peso} kg` : ""}{c.lunghezza ? ` · ${c.lunghezza} cm` : ""}
                  </p>
                </div>
                {c.catchAndRelease && <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 shrink-0">C&R</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-white/5">
      <Icon className={cn("w-5 h-5 mb-2", color)} />
      <p className="text-2xl font-display font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
