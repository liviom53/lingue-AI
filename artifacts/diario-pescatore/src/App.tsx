import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "./components/layout/AppLayout";
import { SplashScreen } from "./components/SplashScreen";
import { PwaInstallBanner } from "./components/PwaInstallBanner";

declare const __APP_VERSION__: string;

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Uscite = lazy(() => import("./pages/Uscite"));
const Pescato = lazy(() => import("./pages/Pescato"));
const Spot = lazy(() => import("./pages/Spot"));
const Specie = lazy(() => import("./pages/Specie"));
const Attrezzatura = lazy(() => import("./pages/Attrezzatura"));
const Ricette = lazy(() => import("./pages/Ricette"));
const Meteo = lazy(() => import("./pages/Meteo"));
const Maree = lazy(() => import("./pages/Maree"));
const Previsioni = lazy(() => import("./pages/Previsioni"));
const Statistiche = lazy(() => import("./pages/Statistiche"));
const AI = lazy(() => import("./pages/AI"));
const ParcoAuto = lazy(() => import("./pages/ParcoAuto"));
const Finanze = lazy(() => import("./pages/Finanze"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  }
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router({ onLogoTap }: { onLogoTap: () => void }) {
  return (
    <AppLayout onLogoTap={onLogoTap}>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/uscite" component={Uscite} />
          <Route path="/pescato" component={Pescato} />
          <Route path="/spot" component={Spot} />
          <Route path="/specie" component={Specie} />
          <Route path="/attrezzatura" component={Attrezzatura} />
          <Route path="/ricette" component={Ricette} />
          <Route path="/meteo" component={Meteo} />
          <Route path="/maree" component={Maree} />
          <Route path="/previsioni" component={Previsioni} />
          <Route path="/statistiche" component={Statistiche} />
          <Route path="/ai" component={AI} />
          <Route path="/parco-auto" component={ParcoAuto} />
          <Route path="/finanze" component={Finanze} />
          <Route>
            <div className="p-8 text-center">
              <h2 className="text-xl font-bold">404 - Pagina non trovata</h2>
            </div>
          </Route>
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function getLocalStats() {
  const keys = [
    { key: "diario_uscite",       label: "🎣 Uscite" },
    { key: "diario_catture",      label: "🐟 Catture" },
    { key: "diario_spot",         label: "📍 Spot" },
    { key: "diario_attrezzatura", label: "🔧 Attrezzatura" },
    { key: "diario_ricette",      label: "👨‍🍳 Ricette" },
    { key: "diario_veicoli",      label: "🚗 Veicoli" },
    { key: "diario_finanze",      label: "💰 Registrazioni finanze" },
  ];
  return keys.map(({ key, label }) => {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      return { label, count: Array.isArray(arr) ? arr.length : 0 };
    } catch {
      return { label, count: 0 };
    }
  });
}

function getLocalStorageKB() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) ?? "";
    if (k.startsWith("diario_")) {
      total += (localStorage.getItem(k) ?? "").length;
    }
  }
  return (total / 1024).toFixed(1);
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<{ label: string; count: number }[]>([]);
  const [adminKB, setAdminKB] = useState("0");
  const [confirmClear, setConfirmClear] = useState(false);

  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("diario_has_seen_splash");
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem("diario_has_seen_splash", "true");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === "Digit5") {
        e.preventDefault();
        setAdminOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogoTap = () => {
    logoTapCountRef.current += 1;
    if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);
    logoTapTimerRef.current = setTimeout(() => { logoTapCountRef.current = 0; }, 2500);
    if (logoTapCountRef.current >= 7) {
      logoTapCountRef.current = 0;
      if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);
      setAdminOpen(true);
    }
  };

  const adminClose = () => {
    setAdminOpen(false);
    setAdminAuthenticated(false);
    setAdminInput("");
    setAdminError(null);
    setConfirmClear(false);
  };

  const adminLogin = () => {
    if (adminInput === "macolingue") {
      setAdminStats(getLocalStats());
      setAdminKB(getLocalStorageKB());
      setAdminAuthenticated(true);
      setAdminError(null);
    } else {
      setAdminError("Password errata");
    }
  };

  const adminRefresh = () => {
    setAdminStats(getLocalStats());
    setAdminKB(getLocalStorageKB());
  };

  const clearAllData = () => {
    const keys = ["diario_uscite", "diario_catture", "diario_spot", "diario_attrezzatura", "diario_ricette", "diario_veicoli", "diario_finanze"];
    keys.forEach(k => localStorage.removeItem(k));
    adminRefresh();
    setConfirmClear(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        {!showSplash && (
          <WouterRouter base={import.meta.env.BASE_URL === "/" ? "/diario-pescatore" : import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router onLogoTap={handleLogoTap} />
          </WouterRouter>
        )}
        {!showSplash && <PwaInstallBanner />}
        <Toaster />

        {adminOpen && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 999999,
              background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "16px",
            }}
            onClick={adminClose}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: "#0f172a", border: "1px solid #334155",
                borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "400px",
                maxHeight: "80vh", overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#f8fafc" }}>🔐 Pannello admin</h2>
                <button
                  onClick={adminClose}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1 }}
                >✕</button>
              </div>

              {!adminAuthenticated ? (
                <div>
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "12px" }}>Inserisci la password per accedere.</p>
                  <input
                    type="password"
                    value={adminInput}
                    onChange={e => setAdminInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && adminLogin()}
                    placeholder="Password…"
                    autoFocus
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "10px",
                      background: "#1e293b", border: "1px solid #334155",
                      color: "#f8fafc", fontSize: "0.9rem", marginBottom: "12px",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                  {adminError && <p style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "10px" }}>❌ {adminError}</p>}
                  <button
                    onClick={adminLogin}
                    disabled={!adminInput}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "10px", border: "none",
                      background: !adminInput ? "#1e293b" : "linear-gradient(135deg,#0ea5e9,#0369a1)",
                      color: !adminInput ? "#475569" : "#fff",
                      fontWeight: 700, cursor: !adminInput ? "not-allowed" : "pointer",
                      fontSize: "0.88rem",
                    }}
                  >
                    🔓 Accedi
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Versione app</div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0ea5e9", lineHeight: 1 }}>V{__APP_VERSION__}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.65rem", color: "#64748b" }}>Storage locale</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#94a3b8" }}>{adminKB} KB</div>
                      <button
                        onClick={adminRefresh}
                        style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.72rem", padding: 0, marginTop: "2px" }}
                      >🔄 Aggiorna</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                    {adminStats.map(({ label, count }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: "#1e293b", borderRadius: "12px", padding: "10px 14px",
                          border: "1px solid #334155",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem", color: "#e2e8f0" }}>{label}</span>
                        <span style={{ fontSize: "1.3rem", fontWeight: 900, color: count > 0 ? "#0ea5e9" : "#475569" }}>{count}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: "1px solid #1e293b", paddingTop: "16px" }}>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>⚠️ Zona pericolosa</div>
                    {!confirmClear ? (
                      <button
                        onClick={() => setConfirmClear(true)}
                        style={{
                          width: "100%", padding: "9px", borderRadius: "10px", border: "1px solid #7f1d1d",
                          background: "transparent", color: "#f87171",
                          fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
                        }}
                      >
                        🗑️ Cancella tutti i dati locali
                      </button>
                    ) : (
                      <div>
                        <p style={{ fontSize: "0.8rem", color: "#fbbf24", marginBottom: "10px" }}>
                          Sei sicuro? Questa operazione è irreversibile e cancellerà tutte le uscite, catture, spot e altro.
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => setConfirmClear(false)}
                            style={{
                              flex: 1, padding: "9px", borderRadius: "10px", border: "1px solid #334155",
                              background: "#1e293b", color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem",
                            }}
                          >Annulla</button>
                          <button
                            onClick={clearAllData}
                            style={{
                              flex: 1, padding: "9px", borderRadius: "10px", border: "none",
                              background: "#dc2626", color: "#fff",
                              fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                            }}
                          >Sì, cancella tutto</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
