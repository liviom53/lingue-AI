import { useRef, useState } from "react";
import { X, Camera, RotateCcw, CheckCircle, Loader2, Fish } from "lucide-react";
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

type Step = "capture" | "loading" | "form" | "unknown";

interface Props {
  open: boolean;
  onClose: () => void;
}

const emptyForm = { specie: "", peso: "", lunghezza: "", spotId: "", note: "" };

export function ScanFishModal({ open, onClose }: Props) {
  const addMutation = pescatoAPI.useAdd();
  const { data: spots = [] } = spotAPI.useList();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("capture");
  const [photo, setPhoto] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("capture");
    setPhoto(null);
    setErrorMsg("");
    setForm(emptyForm);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = "";
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhoto(base64);
      setStep("loading");
      try {
        const res = await fetch("/api/ai/scan-fish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        if (data.riconosciuto) {
          setForm(f => ({ ...f, specie: matchSpecie(data.specie) }));
          setStep("form");
        } else {
          setErrorMsg(data.messaggio ?? "Specie non riconosciuta.");
          setStep("unknown");
        }
      } catch {
        setErrorMsg("Errore di connessione. Riprova.");
        setStep("unknown");
      }
    };
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

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#0a1929", border: "1px solid #1e3a5f",
    borderRadius: "10px", padding: "10px 14px", color: "#f0f9ff",
    fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "24px", width: "100%", maxWidth: "400px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 14px", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <Camera style={{ width: 17, height: 17, color: "#38bdf8" }} />
            Scanner Cattura
          </h2>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px", lineHeight: 1 }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>

          {/* STEP: capture */}
          {step === "capture" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 28px rgba(14,165,233,0.3)" }}>
                <Fish style={{ width: 34, height: 34, color: "#fff" }} />
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: "24px", lineHeight: 1.6 }}>
                Scatta una foto alla cattura.<br />L'AI identificherà la specie.
              </p>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "13px 26px", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", borderRadius: "14px", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem", color: "#fff", boxShadow: "0 4px 16px rgba(14,165,233,0.3)" }}>
                <Camera style={{ width: 19, height: 19 }} />
                Scatta foto
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
              </label>
              <p style={{ marginTop: "14px", fontSize: "0.75rem", color: "#475569" }}>oppure carica dalla galleria</p>
              <label style={{ display: "inline-block", marginTop: "4px", fontSize: "0.8rem", color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}>
                Carica immagine
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
              </label>
            </div>
          )}

          {/* STEP: loading */}
          {step === "loading" && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              {photo && (
                <img src={photo} alt="cattura" style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "14px", marginBottom: "20px" }} />
              )}
              <Loader2 style={{ width: 38, height: 38, color: "#38bdf8", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>Analisi in corso…</p>
              <p style={{ color: "#475569", fontSize: "0.75rem", marginTop: "4px" }}>L'AI sta identificando la specie</p>
            </div>
          )}

          {/* STEP: form (recognized) */}
          {step === "form" && (
            <div>
              {photo && (
                <img src={photo} alt="cattura" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "14px", marginBottom: "16px" }} />
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={labelStyle}>Specie *</label>
                  <select
                    required
                    value={form.specie}
                    onChange={e => setForm(f => ({ ...f, specie: e.target.value }))}
                    style={{ ...inputStyle, appearance: "none" }}
                  >
                    <option value="">Seleziona specie…</option>
                    {SPECIE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={labelStyle}>Peso (kg)</label>
                    <input
                      type="number" step="0.01" min="0" placeholder="Es. 1.5"
                      value={form.peso}
                      onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Lunghezza (cm)</label>
                    <input
                      type="number" step="0.1" min="0" placeholder="Es. 45"
                      value={form.lunghezza}
                      onChange={e => setForm(f => ({ ...f, lunghezza: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Spot</label>
                  <select
                    value={form.spotId}
                    onChange={e => setForm(f => ({ ...f, spotId: e.target.value }))}
                    style={{ ...inputStyle, appearance: "none" }}
                  >
                    <option value="">Nessuno spot</option>
                    {(spots as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Note</label>
                  <textarea
                    placeholder="Dove, come, con quale esca…"
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    style={{ ...inputStyle, height: "72px", resize: "none" }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={handleSave}
                  disabled={!form.specie || addMutation.isPending}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", background: form.specie ? "linear-gradient(135deg,#0ea5e9,#0369a1)" : "#1e293b", border: "none", borderRadius: "13px", color: form.specie ? "#fff" : "#475569", fontWeight: 700, fontSize: "0.93rem", cursor: form.specie ? "pointer" : "not-allowed", boxShadow: form.specie ? "0 4px 16px rgba(14,165,233,0.25)" : "none", transition: "all 0.15s" }}
                >
                  <CheckCircle style={{ width: 17, height: 17 }} />
                  {addMutation.isPending ? "Salvataggio…" : "Salva cattura"}
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", background: "#1e293b", border: "1px solid #334155", borderRadius: "11px", color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                    <RotateCcw style={{ width: 14, height: 14 }} />
                    Riprova
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
                  </label>
                  <button
                    onClick={handleClose}
                    style={{ flex: 1, padding: "11px", background: "#1e293b", border: "1px solid #334155", borderRadius: "11px", color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    Esci
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: unknown */}
          {step === "unknown" && (
            <div style={{ textAlign: "center" }}>
              {photo && (
                <img src={photo} alt="cattura" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "14px", marginBottom: "16px", opacity: 0.7 }} />
              )}
              <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>😕</div>
              <p style={{ fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>Specie non riconosciuta</p>
              <p style={{ color: "#94a3b8", fontSize: "0.83rem", marginBottom: "24px", lineHeight: 1.5 }}>{errorMsg}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
                  <RotateCcw style={{ width: 14, height: 14 }} />
                  Riprova
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
                </label>
                <button
                  onClick={handleClose}
                  style={{ flex: 1, padding: "12px", background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", color: "#94a3b8", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}
                >
                  Esci
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
