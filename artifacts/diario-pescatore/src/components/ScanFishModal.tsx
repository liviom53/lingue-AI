import { useRef, useState } from "react";
import { X, Camera, Loader2, CheckCircle, ScanLine } from "lucide-react";
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

interface Props {
  open: boolean;
  onClose: () => void;
}

const empty = { specie: "", peso: "", lunghezza: "", spotId: "", note: "" };

export function ScanFishModal({ open, onClose }: Props) {
  const addMutation = pescatoAPI.useAdd();
  const { data: spots = [] } = spotAPI.useList();
  const { toast } = useToast();

  const [photo, setPhoto] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState(empty);
  const photoRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setPhoto(null);
    setScanning(false);
    setForm(empty);
    onClose();
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoRef.current) photoRef.current.value = "";
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhoto(base64);
      setScanning(true);
      try {
        const res = await fetch("/api/ai/scan-fish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        if (data.riconosciuto) {
          setForm(f => ({ ...f, specie: matchSpecie(data.specie) }));
        }
      } catch {
        // ignora errori scan, l'utente può selezionare manualmente
      } finally {
        setScanning(false);
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

  const inp: React.CSSProperties = {
    width: "100%", background: "#0a1929", border: "1px solid #1e3a5f",
    borderRadius: "10px", padding: "10px 14px", color: "#f0f9ff",
    fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.7rem", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px",
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
            <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#475569" }}>foto + dati → salva nel diario</p>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Foto */}
          <div>
            <label style={lbl}>Foto</label>
            <label style={{ display: "block", cursor: "pointer" }}>
              {photo ? (
                <div style={{ position: "relative" }}>
                  <img src={photo} alt="cattura" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px", display: "block" }} />
                  {scanning && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Loader2 style={{ width: 28, height: 28, color: "#38bdf8", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Identificazione specie…</span>
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", borderRadius: "8px", padding: "4px 8px", fontSize: "0.7rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Camera style={{ width: 12, height: 12 }} /> cambia
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%", height: "120px", border: "2px dashed #1e3a5f", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: "#0a1929" }}>
                  <Camera style={{ width: 28, height: 28, color: "#38bdf8" }} />
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Scatta foto · L'AI riconosce la specie</span>
                </div>
              )}
              <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
            </label>
          </div>

          {/* Sezione cattura */}
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: "14px" }}>
            <p style={{ margin: "0 0 12px", fontSize: "0.7rem", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Cattura</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={lbl}>Specie *</label>
                <select
                  value={form.specie}
                  onChange={e => setForm(f => ({ ...f, specie: e.target.value }))}
                  style={{ ...inp, appearance: "none" }}
                >
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
                <textarea placeholder="Dove, come, con quale esca…" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ ...inp, height: "68px", resize: "none" }} />
              </div>
            </div>
          </div>

          {/* Salva */}
          <button
            onClick={handleSave}
            disabled={!form.specie || addMutation.isPending}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "13px", border: "none", borderRadius: "13px", fontWeight: 700, fontSize: "0.93rem",
              cursor: form.specie ? "pointer" : "not-allowed", transition: "all 0.15s",
              background: form.specie ? "linear-gradient(135deg,#0ea5e9,#0369a1)" : "#1e293b",
              color: form.specie ? "#fff" : "#475569",
              boxShadow: form.specie ? "0 4px 16px rgba(14,165,233,0.25)" : "none",
            }}
          >
            <CheckCircle style={{ width: 17, height: 17 }} />
            {addMutation.isPending ? "Salvataggio…" : "Salva cattura"}
          </button>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
