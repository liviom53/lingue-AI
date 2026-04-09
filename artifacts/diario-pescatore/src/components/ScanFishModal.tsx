import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { X, Camera, RotateCcw, CheckCircle, Loader2, Fish } from "lucide-react";

const SPECIE_LIST = [
  "Spigola/Branzino", "Orata", "Pesce Serra", "Ombrina", "Mormora", "Sarago",
  "Sparaglione", "Cefalo/Muggine", "Leccia stella", "Sogliola", "Anguilla",
  "Granchio blu", "Pagello fragolino", "Palamita", "Sgombro", "Ricciola",
  "Aguglia", "Gallinella", "Triglia", "Scorfano", "Dentice", "Seppie",
  "Calamaro", "Polpo", "Cernia bruna",
];

function matchSpecie(aiSpecie: string): string {
  const normalized = aiSpecie.toLowerCase().trim();
  for (const s of SPECIE_LIST) {
    const parts = s.toLowerCase().split("/");
    if (parts.some(p => normalized.includes(p) || p.includes(normalized))) return s;
  }
  return "Altra specie";
}

type Step = "capture" | "loading" | "recognized" | "unknown";

interface ScanResult {
  specie: string;
  nome_scientifico: string;
  descrizione: string;
  peso_tipico: string;
  lunghezza_tipica: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ScanFishModal({ open, onClose }: Props) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("capture");
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("capture");
    setPhoto(null);
    setResult(null);
    setErrorMsg("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
          setResult({
            specie: matchSpecie(data.specie),
            nome_scientifico: data.nome_scientifico ?? "",
            descrizione: data.descrizione ?? "",
            peso_tipico: data.peso_tipico ?? "",
            lunghezza_tipica: data.lunghezza_tipica ?? "",
          });
          setStep("recognized");
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
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleCompila() {
    if (!result) return;
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("_diario_scan_result", JSON.stringify({
      specie: result.specie,
      foto: photo ?? "",
      data: today,
      note: result.descrizione ? `Scansionato: ${result.nome_scientifico}` : "",
    }));
    handleClose();
    navigate("/pescato");
  }

  if (!open) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "24px", width: "100%", maxWidth: "400px", overflow: "hidden" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: "1px solid #1e293b" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <Camera style={{ width: 18, height: 18, color: "#38bdf8" }} />
            Scanner Cattura
          </h2>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px", lineHeight: 1 }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div style={{ padding: "24px 20px 20px" }}>

          {step === "capture" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 30px rgba(14,165,233,0.3)" }}>
                <Fish style={{ width: 36, height: 36, color: "#fff" }} />
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "24px", lineHeight: 1.6 }}>
                Scatta una foto alla cattura.<br />L'AI identificherà la specie.
              </p>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 28px", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", borderRadius: "14px", cursor: "pointer", fontWeight: 700, fontSize: "1rem", color: "#fff", boxShadow: "0 4px 16px rgba(14,165,233,0.35)" }}>
                <Camera style={{ width: 20, height: 20 }} />
                Scatta foto
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
              </label>
              <p style={{ marginTop: "12px", fontSize: "0.75rem", color: "#475569" }}>oppure carica dalla galleria</p>
              <label style={{ display: "inline-block", marginTop: "4px", fontSize: "0.8rem", color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}>
                Carica immagine
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
              </label>
            </div>
          )}

          {step === "loading" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              {photo && (
                <img src={photo} alt="cattura" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "14px", marginBottom: "20px" }} />
              )}
              <Loader2 style={{ width: 40, height: 40, color: "#38bdf8", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Analisi in corso…</p>
              <p style={{ color: "#475569", fontSize: "0.78rem", marginTop: "4px" }}>L'AI sta identificando la specie</p>
            </div>
          )}

          {step === "recognized" && result && (
            <div>
              {photo && (
                <img src={photo} alt="cattura" style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "14px", marginBottom: "16px" }} />
              )}
              <div style={{ background: "#0d2137", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "1.8rem" }}>🐟</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#f0f9ff" }}>{result.specie}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", fontStyle: "italic" }}>{result.nome_scientifico}</div>
                  </div>
                </div>
                {result.descrizione && (
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5, marginBottom: "10px" }}>{result.descrizione}</p>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {result.peso_tipico && (
                    <span style={{ fontSize: "0.75rem", color: "#38bdf8", background: "#0c2035", padding: "4px 10px", borderRadius: "20px", border: "1px solid #1e3a5f" }}>
                      ⚖️ {result.peso_tipico}
                    </span>
                  )}
                  {result.lunghezza_tipica && (
                    <span style={{ fontSize: "0.75rem", color: "#38bdf8", background: "#0c2035", padding: "4px 10px", borderRadius: "20px", border: "1px solid #1e3a5f" }}>
                      📏 {result.lunghezza_tipica}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={handleCompila}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", border: "none", borderRadius: "14px", color: "#fff", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(14,165,233,0.3)" }}
                >
                  <CheckCircle style={{ width: 18, height: 18 }} />
                  Compila i campi
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={reset}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", color: "#94a3b8", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}
                  >
                    <RotateCcw style={{ width: 15, height: 15 }} />
                    Riprova
                  </button>
                  <button
                    onClick={handleClose}
                    style={{ flex: 1, padding: "12px", background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", color: "#94a3b8", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}
                  >
                    Esci
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "unknown" && (
            <div style={{ textAlign: "center" }}>
              {photo && (
                <img src={photo} alt="cattura" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "14px", marginBottom: "16px", opacity: 0.7 }} />
              )}
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>😕</div>
              <p style={{ fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>Specie non riconosciuta</p>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "24px", lineHeight: 1.5 }}>{errorMsg}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={reset}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", background: "linear-gradient(135deg,#0ea5e9,#0369a1)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  <RotateCcw style={{ width: 15, height: 15 }} />
                  Riprova
                </button>
                <button
                  onClick={handleClose}
                  style={{ flex: 1, padding: "12px", background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", color: "#94a3b8", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}
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
