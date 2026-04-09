import { useState, useRef } from "react";
import { Link } from "wouter";
import {
  Anchor, Fish, MapPin, ArrowRight, Scale, ChevronDown,
  ScanLine, Camera, ImageIcon, Loader2, CheckCircle, X, AlertCircle
} from "lucide-react";
import { usciteAPI, pescatoAPI, spotAPI } from "@/hooks/use-local-data";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FishingForecastCard } from "@/components/FishingForecastCard";
import { STAZIONI, getSharedStation, setSharedStation } from "@/hooks/use-location";
import { useToast } from "@/hooks/use-toast";

const SPECIE_LIST = [
  "Spigola/Branzino","Orata","Pesce Serra","Ombrina","Mormora","Sarago",
  "Sparaglione","Cefalo/Muggine","Leccia stella","Sogliola","Anguilla",
  "Granchio blu","Pagello fragolino","Palamita","Sgombro","Ricciola",
  "Aguglia","Gallinella","Triglia","Scorfano","Dentice","Seppie",
  "Calamaro","Polpo","Cernia bruna","Altra specie",
];

function matchSpecie(ai: string) {
  const n = ai.toLowerCase().trim();
  for (const s of SPECIE_LIST) {
    if (s === "Altra specie") continue;
    if (s.toLowerCase().split("/").some(p => n.includes(p) || p.includes(n))) return s;
  }
  return "Altra specie";
}

type ScanStep = "idle" | "ready" | "scanning" | "done";

function ScannerCard() {
  const [step, setStep] = useState<ScanStep>("idle");
  const [photo, setPhoto] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"success" | "fail" | null>(null);
  const [form, setForm] = useState({ specie: "", peso: "", lunghezza: "", note: "" });
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const addMutation = pescatoAPI.useAdd();
  const { toast } = useToast();

  function reset() {
    setStep("idle"); setPhoto(null); setOutcome(null);
    setForm({ specie: "", peso: "", lunghezza: "", note: "" });
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 1024;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", 0.82);
      setPhoto(compressed); setStep("ready");
    };
    img.src = objectUrl;
  }

  async function handleRiconosci() {
    if (!photo) return;
    setStep("scanning");
    try {
      const res = await fetch("/api/ai/scan-fish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photo }),
      });
      const data: any = await res.json();
      if (data.riconosciuto && data.specie) {
        setForm(f => ({ ...f, specie: matchSpecie(data.specie) }));
        setOutcome("success");
      } else {
        setOutcome("fail");
      }
    } catch {
      setOutcome("fail");
    }
    setStep("done");
  }

  function handleSalva() {
    if (!form.specie) return;
    addMutation.mutate({
      specie: form.specie, peso: form.peso, lunghezza: form.lunghezza,
      note: form.note, foto: photo ?? "", spotId: "",
      data: new Date().toISOString().split("T")[0], catchAndRelease: false,
    } as any, {
      onSuccess: () => { toast({ title: "Cattura salvata! 🎣" }); reset(); },
    });
  }

  const inp: React.CSSProperties = {
    width: "100%", background: "#0a1929", border: "1px solid #1e3a5f",
    borderRadius: "10px", padding: "9px 12px", color: "#f0f9ff",
    fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.68rem", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px",
  };

  const canRiconosci = (step === "ready" || step === "done") && !addMutation.isPending;
  const canSalva = step === "done" && outcome === "success" && !!form.specie && !addMutation.isPending;

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "24px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <ScanLine style={{ width: 17, height: 17, color: "#38bdf8" }} />Scanner Cattura
        </span>
        <span style={{ fontSize: "0.68rem", color: "#475569" }}>AI · foto → specie</span>
      </div>

      {/* Photo area */}
      {step === "idle" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "14px", borderRadius: "14px", fontWeight: 700, fontSize: "0.85rem", color: "#fff", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", cursor: "pointer" }}>
            <Camera style={{ width: 16, height: 16 }} />Scansiona
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "14px", borderRadius: "14px", fontWeight: 700, fontSize: "0.85rem", color: "#94a3b8", background: "#1e293b", cursor: "pointer" }}>
            <ImageIcon style={{ width: 16, height: 16 }} />Galleria
            <input ref={galleryRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          </label>
        </div>
      )}

      {(step === "ready" || step === "scanning" || step === "done") && photo && (
        <div style={{ position: "relative" }}>
          <img src={photo} alt="cattura" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "14px", opacity: step === "scanning" ? 0.5 : 1 }} />
          {step === "scanning" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#38bdf8", fontSize: "0.8rem" }}>
              <Loader2 style={{ width: 28, height: 28, animation: "spin 1s linear infinite" }} />
            </div>
          )}
          {step === "done" && outcome === "fail" && (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#1e1a0a", border: "1px solid #854d0e", borderRadius: "12px", color: "#fef08a", fontSize: "0.82rem" }}>
              <AlertCircle style={{ width: 18, height: 18, color: "#eab308", flexShrink: 0 }} />
              Nessun pesce riconosciuto — ripremi Riconosci per ritentare.
            </div>
          )}
        </div>
      )}

      {/* Form fields — solo su successo */}
      {step === "done" && outcome === "success" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label style={lbl}>Specie *</label>
            <select value={form.specie} onChange={e => setForm(f => ({ ...f, specie: e.target.value }))} style={{ ...inp, appearance: "none" as any }}>
              <option value="">Seleziona specie…</option>
              {SPECIE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={lbl}>Peso (kg)</label>
              <input type="number" step="0.01" min="0" placeholder="Es. 1.5" value={form.peso} onChange={e => setForm(f => ({ ...f, peso: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Lunghezza (cm)</label>
              <input type="number" step="0.1" min="0" placeholder="Es. 45" value={form.lunghezza} onChange={e => setForm(f => ({ ...f, lunghezza: e.target.value }))} style={inp} />
            </div>
          </div>
          <div>
            <label style={lbl}>Note</label>
            <textarea placeholder="Dove, come, con quale esca…" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ ...inp, height: "56px", resize: "none" as any }} />
          </div>
        </div>
      )}

      {/* 3 bottoni sempre visibili */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleRiconosci}
          disabled={!canRiconosci || step === "scanning"}
          style={{ flex: 1, padding: "12px 8px", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "0.82rem", cursor: canRiconosci ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: canRiconosci ? "linear-gradient(135deg,#0ea5e9,#0369a1)" : "#1e293b", color: canRiconosci ? "#fff" : "#475569" }}
        >
          {step === "scanning" ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <ScanLine style={{ width: 14, height: 14 }} />}
          Riconosci
        </button>
        <button
          onClick={handleSalva}
          disabled={!canSalva}
          style={{ flex: 1, padding: "12px 8px", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "0.82rem", cursor: canSalva ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: canSalva ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#1e293b", color: canSalva ? "#fff" : "#475569" }}
        >
          <CheckCircle style={{ width: 14, height: 14 }} />
          {addMutation.isPending ? "Salvataggio…" : "Salva"}
        </button>
        <button
          onClick={reset}
          style={{ flex: "0 0 auto", padding: "12px 14px", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#1e293b", color: "#94a3b8" }}
        >
          <X style={{ width: 14, height: 14 }} />Esci
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
      <ScannerCard />

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
