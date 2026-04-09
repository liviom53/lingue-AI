import { useRef, useState } from "react";
import { X, Camera, ImageIcon, Loader2, CheckCircle, RefreshCw, AlertCircle, ScanLine } from "lucide-react";
import { pescatoAPI, spotAPI } from "@/hooks/use-local-data";
import { useToast } from "@/hooks/use-toast";

const SPECIE_LIST = [
  "Spigola/Branzino", "Orata", "Pesce Serra", "Ombrina", "Mormora", "Sarago",
  "Sparaglione", "Cefalo/Muggine", "Leccia stella", "Sogliola", "Anguilla",
  "Granchio blu", "Pagello fragolino", "Palamita", "Sgombro", "Ricciola",
  "Aguglia", "Gallinella", "Triglia", "Scorfano", "Dentice", "Seppie",
  "Calamaro", "Polpo", "Cernia bruna", "Altra specie",
];

function matchSpecie(aiSpecie: string): string {
  const normalized = aiSpecie.toLowerCase().trim();
  for (const s of SPECIE_LIST) {
    if (s === "Altra specie") continue;
    const parts = s.toLowerCase().split("/");
    if (parts.some(p => normalized.includes(p) || p.includes(normalized))) return s;
  }
  return "Altra specie";
}

type Step = "choose" | "scanning" | "result";
type ScanOutcome = "success" | "fail" | null;

interface Props {
  open: boolean;
  onClose: () => void;
}

const emptyForm = { specie: "", peso: "", lunghezza: "", spotId: "", note: "" };

export function ScanFishModal({ open, onClose }: Props) {
  const addMutation = pescatoAPI.useAdd();
  const { data: spots = [] } = spotAPI.useList();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("choose");
  const [outcome, setOutcome] = useState<ScanOutcome>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("choose");
    setOutcome(null);
    setPhoto(null);
    setForm(emptyForm);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function processPhoto(base64: string) {
    setPhoto(base64);
    setStep("scanning");
    try {
      const res = await fetch("/api/ai/scan-fish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
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
    setStep("result");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
    const reader = new FileReader();
    reader.onload = () => processPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.specie) return;
    const today = new Date().toISOString().split("T")[0];
    addMutation.mutate({
      specie: form.specie,
      peso: form.peso,
      lunghezza: form.lunghezza,
      spotId: form.spotId,
      note: form.note,
      foto: photo ?? "",
      data: today,
      catchAndRelease: false,
    } as any, {
      onSuccess: () => {
        toast({ title: "Cattura salvata! 🎣" });
        handleClose();
      },
    });
  }

  if (!open) return null;

  const inp: React.CSSProperties = {
    width: "100%", background: "#0a1929", border: "1px solid #1e3a5f",
    borderRadius: "10px", padding: "10px 14px", color: "#f0f9ff",
    fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.7rem", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px",
  };
  const btnBase: React.CSSProperties = {
    flex: 1, padding: "12px 8px", border: "none", borderRadius: "12px",
    fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
    transition: "all 0.15s",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "24px", width: "100%", maxWidth: "400px", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 14px", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <ScanLine style={{ width: 17, height: 17, color: "#38bdf8" }} />
              Scanner Cattura
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#475569" }}>
              {step === "choose" && "Scansiona o carica dalla galleria"}
              {step === "scanning" && "Analisi in corso…"}
              {step === "result" && outcome === "success" && "Specie riconosciuta — completa e salva"}
              {step === "result" && outcome === "fail" && "Identificazione non riuscita"}
            </p>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>

          {/* ─── STEP: CHOOSE ─── */}
          {step === "choose" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ width: "100%", height: "140px", border: "2px dashed #1e3a5f", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a1929" }}>
                <span style={{ fontSize: "0.8rem", color: "#475569" }}>Nessuna foto selezionata</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ ...btnBase, background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "#fff", cursor: "pointer", textAlign: "center" }}>
                  <Camera style={{ width: 17, height: 17 }} />
                  Scansiona
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
                </label>
                <label style={{ ...btnBase, background: "#1e293b", color: "#94a3b8", cursor: "pointer", textAlign: "center" }}>
                  <ImageIcon style={{ width: 17, height: 17 }} />
                  Galleria
                  <input ref={galleryRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          )}

          {/* ─── STEP: SCANNING ─── */}
          {step === "scanning" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {photo && <img src={photo} alt="cattura" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px", opacity: 0.6 }} />}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px 0" }}>
                <Loader2 style={{ width: 36, height: 36, color: "#38bdf8", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Riconoscimento specie in corso…</span>
              </div>
            </div>
          )}

          {/* ─── STEP: RESULT (success + fail) ─── */}
          {step === "result" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {photo && (
                <img
                  src={photo}
                  alt="cattura"
                  style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px", opacity: outcome === "fail" ? 0.5 : 1 }}
                />
              )}

              {outcome === "fail" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "12px", background: "#1e1a0a", border: "1px solid #854d0e", borderRadius: "12px" }}>
                  <AlertCircle style={{ width: 28, height: 28, color: "#eab308" }} />
                  <span style={{ fontSize: "0.85rem", color: "#fef08a", textAlign: "center" }}>Nessun pesce riconosciuto.<br />Riprova con una foto più chiara.</span>
                </div>
              )}

              {outcome === "success" && (
                <>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Cattura</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <label style={lbl}>Specie *</label>
                      <select value={form.specie} onChange={e => setForm(f => ({ ...f, specie: e.target.value }))} style={{ ...inp, appearance: "none" }}>
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
                      <label style={lbl}>Spot</label>
                      <select value={form.spotId} onChange={e => setForm(f => ({ ...f, spotId: e.target.value }))} style={{ ...inp, appearance: "none" }}>
                        <option value="">Nessuno spot</option>
                        {(spots as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Note</label>
                      <textarea placeholder="Dove, come, con quale esca…" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ ...inp, height: "64px", resize: "none" }} />
                    </div>
                  </div>
                </>
              )}

              {/* ─── Sempre 3 bottoni ─── */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={reset} style={{ ...btnBase, background: "#1e293b", color: "#94a3b8", flex: "0 0 auto", padding: "12px 14px" }}>
                  <RefreshCw style={{ width: 15, height: 15 }} /> Riprova
                </button>
                <button
                  onClick={handleSave}
                  disabled={outcome !== "success" || !form.specie || addMutation.isPending}
                  style={{
                    ...btnBase, flex: 1,
                    background: (outcome === "success" && form.specie) ? "linear-gradient(135deg,#0ea5e9,#0369a1)" : "#1e293b",
                    color: (outcome === "success" && form.specie) ? "#fff" : "#475569",
                    boxShadow: (outcome === "success" && form.specie) ? "0 4px 16px rgba(14,165,233,0.25)" : "none",
                    cursor: (outcome === "success" && form.specie) ? "pointer" : "not-allowed",
                  }}
                >
                  <CheckCircle style={{ width: 15, height: 15 }} />
                  {addMutation.isPending ? "Salvataggio…" : "Salva cattura"}
                </button>
                <button onClick={handleClose} style={{ ...btnBase, background: "#1e293b", color: "#94a3b8", flex: "0 0 auto", padding: "12px 14px" }}>
                  <X style={{ width: 15, height: 15 }} /> Esci
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
