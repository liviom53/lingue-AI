import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

import { AppLayout } from "./components/layout/AppLayout";
import { SplashScreen } from "./components/SplashScreen";
import { PwaInstallBanner } from "./components/PwaInstallBanner";
import { ScanFishModal } from "./components/ScanFishModal";

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
const Impostazioni = lazy(() => import("./pages/Impostazioni"));
const Donazioni = lazy(() => import("./pages/Donazioni"));
const Demo = lazy(() => import("./pages/Demo"));
const Normative = lazy(() => import("./pages/Normative"));
const SpotMappa = lazy(() => import("./pages/SpotMappa"));

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

function BalloonDonation() {
  const [, navigate] = useLocation();
  const [balloonStopped, setBalloonStopped] = useState(false);
  const balloonRafRef = useRef<number | null>(null);
  const balloonRestartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const balloonElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (balloonStopped) return;
    const W = window.innerWidth, H = window.innerHeight;
    const cx = W * 0.5, cy = H * 0.5;
    const ax = W * 0.38, ay = H * 0.35;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const x = cx + ax * Math.sin(0.12 * t);
      const y = cy + ay * Math.sin(0.17 * t + 1.1);
      if (balloonElRef.current) {
        balloonElRef.current.style.left = `${x}px`;
        balloonElRef.current.style.top = `${y}px`;
      }
      balloonRafRef.current = requestAnimationFrame(tick);
    };
    balloonRafRef.current = requestAnimationFrame(tick);
    return () => { if (balloonRafRef.current) cancelAnimationFrame(balloonRafRef.current); };
  }, [balloonStopped]);

  function handleClick() {
    setBalloonStopped(true);
    if (balloonRafRef.current) cancelAnimationFrame(balloonRafRef.current);
    navigate("/donazioni");
    if (balloonRestartRef.current) clearTimeout(balloonRestartRef.current);
    balloonRestartRef.current = setTimeout(() => setBalloonStopped(false), 15 * 60 * 1000);
  }

  return (
    <div
      ref={balloonElRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === "Enter") handleClick(); }}
      aria-label="Sostieni il progetto con una donazione"
      style={{
        position: "fixed",
        left: window.innerWidth - 180,
        top: window.innerHeight - 80,
        zIndex: 9990,
        cursor: "pointer",
        userSelect: "none",
        animation: balloonStopped ? "none" : "balloonShow 67s linear infinite",
        opacity: balloonStopped ? 0 : undefined,
        pointerEvents: balloonStopped ? "none" : undefined,
      }}
    >
      <div style={{
        background: "#1e293b",
        border: "1.5px solid #475569",
        borderRadius: "16px",
        padding: "8px 14px",
        fontSize: "0.82rem",
        color: "#e2e8f0",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        <span style={{ fontSize: "1.1rem" }}>☕</span>
        <span>Sostieni il progetto</span>
      </div>
      <div style={{
        position: "absolute",
        bottom: "-9px",
        right: "18px",
        width: 0,
        height: 0,
        borderLeft: "8px solid transparent",
        borderRight: "8px solid transparent",
        borderTop: "10px solid #475569",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-7px",
        right: "19px",
        width: 0,
        height: 0,
        borderLeft: "7px solid transparent",
        borderRight: "7px solid transparent",
        borderTop: "9px solid #1e293b",
      }} />
    </div>
  );
}

function Router({ onLogoTap, onScanOpen }: { onLogoTap: () => void; onScanOpen: () => void }) {
  return (
    <AppLayout onLogoTap={onLogoTap} onScanOpen={onScanOpen}>
      <BalloonDonation />
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
          <Route path="/impostazioni" component={Impostazioni} />
          <Route path="/donazioni" component={Donazioni} />
          <Route path="/demo" component={Demo} />
          <Route path="/normative" component={Normative} />
          <Route path="/mappa-costiera" component={SpotMappa} />
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

interface StatRow {
  event_name: string;
  total: number;
  unique_sessions: number;
  last_24h: number;
  last_7d: number;
  last_30d: number;
  prev_7d: number;
  last_event: string | null;
}

interface DailyRow {
  event_name: string;
  day: string;
  count: number;
}

const EVENT_LABELS: Record<string, string> = {
  diario_landing_view:    "🔗 Visite landing page",
  diario_app_open:        "📱 Aperture app",
  diario_app_installed:   "⬇️ Installazioni Android",
  diario_ai_call:         "🤖 Chiamate AI Pescatore",
};

function getSid() {
  let sid = localStorage.getItem("_diario_sid");
  if (!sid) { sid = crypto.randomUUID(); localStorage.setItem("_diario_sid", sid); }
  return sid;
}

function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  // ── Aggiornamento PWA (service worker) ───────────────────────────────────────
  const {
    needRefresh: [needRefresh],
  } = useRegisterSW({
    onRegistered(r) {
      if (r) setInterval(() => r.update(), 60 * 60 * 1000);
    },
    onRegisterError(e) { console.warn("SW errore:", e); },
  });

  // ── Controllo versione server ─────────────────────────────────────────────────
  const [serverNeedRefresh, setServerNeedRefresh] = useState(false);
  const [updateStep, setUpdateStep] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [justUpdated, setJustUpdated] = useState(false);
  const [latestVersionStr, setLatestVersionStr] = useState<string | null>(null);
  const [runningVersionStr, setRunningVersionStr] = useState<string | null>(null);
  const latestServerVersionRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("app_just_updated") === "1") {
      sessionStorage.removeItem("app_just_updated");
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 10000);
    }
    if (window.location.search.includes("_v=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const SESSION_KEY = "diario_running_v";
    const SESSION_VER = "diario_running_ver";
    const savedVer = sessionStorage.getItem(SESSION_VER);
    if (savedVer) setRunningVersionStr(savedVer);

    const checkVersion = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const { v, version } = await res.json();
        const latestV = String(v);
        latestServerVersionRef.current = latestV;
        if (version) setLatestVersionStr(version);
        const runningV = sessionStorage.getItem(SESSION_KEY);
        if (!runningV) {
          sessionStorage.setItem(SESSION_KEY, latestV);
          if (version) { sessionStorage.setItem(SESSION_VER, version); setRunningVersionStr(version); }
          return;
        }
        if (runningV !== latestV) setServerNeedRefresh(true);
      } catch { /* offline — ignora */ }
    };

    checkVersion();
    const onVisible = () => { if (document.visibilityState === "visible") checkVersion(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const forceUpdate = async () => {
    setUpdateStep("Preparazione…");
    setUpdateProgress(5);
    setUpdateStep("Rimozione cache di servizio…");
    setUpdateProgress(20);
    try { const regs = await navigator.serviceWorker?.getRegistrations() ?? []; await Promise.all(regs.map(r => r.unregister())); } catch { /* ignora */ }
    setUpdateStep("Pulizia cache locale…");
    setUpdateProgress(55);
    try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch { /* ignora */ }
    setUpdateStep("Salvataggio nuova versione…");
    setUpdateProgress(80);
    if (latestServerVersionRef.current) sessionStorage.setItem("diario_running_v", latestServerVersionRef.current);
    if (latestVersionStr) sessionStorage.setItem("diario_running_ver", latestVersionStr);
    sessionStorage.setItem("app_just_updated", "1");
    setUpdateStep("Ricaricamento app…");
    setUpdateProgress(100);
    await new Promise(r => setTimeout(r, 600));
    window.location.replace(window.location.origin + window.location.pathname + "?_v=" + Date.now());
  };

  // ── Apri scanner da eventi globali (es. Dashboard card) ──────────────────────
  useEffect(() => {
    const handler = () => setScanOpen(true);
    window.addEventListener("openScanner", handler);
    return () => window.removeEventListener("openScanner", handler);
  }, []);

  // ── Admin panel ──────────────────────────────────────────────────────────────
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<StatRow[]>([]);
  const [adminDaily, setAdminDaily] = useState<DailyRow[]>([]);
  const [adminFirstEvent, setAdminFirstEvent] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Splash ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("diario_has_seen_splash");
    if (!hasSeenSplash) {
      sessionStorage.setItem("diario_has_seen_splash", "true");
      setShowSplash(true);
    }
  }, []);

  // ── Tracking app open ────────────────────────────────────────────────────────
  useEffect(() => {
    const sid = getSid();
    const SESSION_KEY = "diario_app_open_tracked";
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, "1");
      fetch("/api/stats/track/diario_app_open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      }).catch(() => {});
    }
    const onInstalled = () => {
      fetch("/api/stats/track/diario_app_installed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      }).catch(() => {});
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  // ── Keyboard shortcut Ctrl+Shift+5 ──────────────────────────────────────────
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

  // ── 7 tap sul logo ───────────────────────────────────────────────────────────
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
  };

  const adminLogin = async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const res = await fetch(`/api/stats/diario?password=${encodeURIComponent(adminInput)}`);
      if (!res.ok) throw new Error("Password errata");
      const data = await res.json();
      setAdminStats(data.stats);
      setAdminDaily(data.daily ?? []);
      setAdminFirstEvent(data.first_event ?? null);
      setAdminAuthenticated(true);
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Errore");
    } finally {
      setAdminLoading(false);
    }
  };

  const totalEvents = adminStats.reduce((s, r) => s + Number(r.total), 0);
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        {!showSplash && (
          <WouterRouter base={import.meta.env.BASE_URL === "/" ? "/diario-pescatore" : import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router onLogoTap={handleLogoTap} onScanOpen={() => setScanOpen(true)} />
            <ScanFishModal open={scanOpen} onClose={() => setScanOpen(false)} />
          </WouterRouter>
        )}
        {!showSplash && <PwaInstallBanner />}
        <Toaster />

        {/* ── Banner aggiornamento disponibile ────────────────────────────── */}
        {(needRefresh || serverNeedRefresh) && !updateStep && (
          <div role="alert" aria-live="assertive" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99990, background: "linear-gradient(135deg,#1e1b4b,#2e1065)", borderBottom: "1.5px solid #a855f7", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", boxShadow: "0 4px 16px rgba(168,85,247,0.3)" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: "bold", color: "#d8b4fe" }}>
                🔄 Nuova versione disponibile{latestVersionStr ? ` — v${latestVersionStr}` : ""}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#a78bfa" }}>
                {runningVersionStr && latestVersionStr && runningVersionStr !== latestVersionStr
                  ? `v${runningVersionStr} → v${latestVersionStr}`
                  : "Aggiorna per avere le ultime funzionalità"}
              </p>
            </div>
            <button
              aria-label="Aggiorna l'app alla nuova versione"
              onClick={forceUpdate}
              style={{ display: "flex", alignItems: "center", gap: "5px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(124,58,237,0.5)", flexShrink: 0 }}
            >
              <RefreshCw size={14} /> Aggiorna
            </button>
          </div>
        )}

        {/* ── Progresso aggiornamento ─────────────────────────────────────── */}
        {updateStep && (
          <div role="status" aria-live="polite" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99990, background: "linear-gradient(135deg,#1e1b4b,#2e1065)", borderBottom: "1.5px solid #a855f7", padding: "14px 16px", boxShadow: "0 4px 16px rgba(168,85,247,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <RefreshCw size={18} style={{ color: "#a78bfa", animation: "spin 1s linear infinite", flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#d8b4fe", fontWeight: "bold" }}>
                  Installazione{latestVersionStr ? ` v${latestVersionStr}` : " aggiornamento"}…
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#a78bfa" }}>{updateStep}</p>
              </div>
            </div>
            <div style={{ background: "rgba(168,85,247,0.2)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${updateProgress}%`, borderRadius: "999px", background: "linear-gradient(90deg,#7c3aed,#a855f7,#c084fc)", transition: "width 0.4s ease" }} />
            </div>
          </div>
        )}

        {/* ── Toast conferma aggiornamento ────────────────────────────────── */}
        {justUpdated && (
          <div role="status" aria-live="polite" style={{ position: "fixed", bottom: "80px", left: "12px", right: "12px", zIndex: 99991, background: "linear-gradient(135deg,#052e16,#064e3b)", border: "1.5px solid #10b981", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", boxShadow: "0 8px 32px rgba(16,185,129,0.45)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.4rem" }}>✅</span>
              <div>
                <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: "bold", color: "#6ee7b7" }}>
                  App aggiornata con successo!{runningVersionStr ? ` (v${runningVersionStr})` : ""}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#34d399" }}>Stai usando l'ultima versione disponibile</p>
              </div>
            </div>
            <button onClick={() => setJustUpdated(false)} style={{ background: "none", border: "none", color: "#34d399", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "4px" }}>✕</button>
          </div>
        )}

        {/* ── Pannello admin ───────────────────────────────────────────────── */}
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
                borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "420px",
                maxHeight: "82vh", overflowY: "auto",
              }}
            >
              {/* Intestazione */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#f8fafc" }}>🔐 Pannello statistiche</h2>
                <button
                  onClick={adminClose}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1 }}
                >✕</button>
              </div>

              {!adminAuthenticated ? (
                <div>
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "12px" }}>Inserisci la password per vedere le statistiche.</p>
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
                    disabled={adminLoading || !adminInput}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "10px", border: "none",
                      background: adminLoading || !adminInput ? "#1e293b" : "linear-gradient(135deg,#0ea5e9,#0369a1)",
                      color: adminLoading || !adminInput ? "#475569" : "#fff",
                      fontWeight: 700, cursor: adminLoading || !adminInput ? "not-allowed" : "pointer",
                      fontSize: "0.88rem",
                    }}
                  >
                    {adminLoading ? "Verifica…" : "🔓 Accedi"}
                  </button>
                </div>
              ) : (
                <div>
                  {/* Riepilogo */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Totale eventi</div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0ea5e9", lineHeight: 1 }}>{totalEvents}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {adminFirstEvent && (
                        <div style={{ fontSize: "0.65rem", color: "#475569" }}>
                          Dal {new Date(adminFirstEvent).toLocaleDateString("it-IT")}
                        </div>
                      )}
                      <button
                        onClick={adminLogin}
                        style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.72rem", padding: 0 }}
                      >🔄 Aggiorna</button>
                    </div>
                  </div>

                  {/* Cards statistiche */}
                  {adminStats.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Nessun dato ancora registrato.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                      {adminStats.map((row) => {
                        const trend7d = Number(row.prev_7d) === 0
                          ? null
                          : Math.round(((Number(row.last_7d) - Number(row.prev_7d)) / Number(row.prev_7d)) * 100);

                        const dailyForEvent = last7Days.map(day => {
                          const found = adminDaily.find(d => d.event_name === row.event_name && String(d.day)?.startsWith(day));
                          return found ? Number(found.count) : 0;
                        });
                        const maxDay = Math.max(...dailyForEvent, 1);

                        return (
                          <div key={row.event_name} style={{
                            background: "#1e293b", borderRadius: "14px", padding: "14px",
                            border: "1px solid #334155",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc" }}>
                                {EVENT_LABELS[row.event_name] ?? row.event_name}
                              </span>
                              <span style={{ fontWeight: 900, fontSize: "1.5rem", color: "#0ea5e9", lineHeight: 1 }}>{row.total}</span>
                            </div>

                            {/* Grafico 7 giorni */}
                            <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "36px", marginBottom: "8px" }}>
                              {dailyForEvent.map((count, i) => (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                                  <div style={{
                                    width: "100%", borderRadius: "3px 3px 0 0",
                                    height: `${Math.max(count === 0 ? 4 : Math.round((count / maxDay) * 100), count === 0 ? 4 : 8)}%`,
                                    background: count === 0
                                      ? "#1e293b"
                                      : i === 6
                                        ? "linear-gradient(180deg,#0ea5e9,#0369a1)"
                                        : "linear-gradient(180deg,#38bdf8,#0284c7)",
                                    opacity: count === 0 ? 0.3 : 1,
                                  }} title={`${last7Days[i]}: ${count}`} />
                                </div>
                              ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.58rem", color: "#475569", marginBottom: "8px" }}>
                              <span>{new Date(last7Days[0]).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</span>
                              <span>oggi</span>
                            </div>

                            {/* Metriche */}
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {[
                                { label: "Oggi", value: row.last_24h },
                                { label: "7 giorni", value: row.last_7d },
                                { label: "30 giorni", value: row.last_30d },
                                { label: "Univoci", value: row.unique_sessions || "—" },
                              ].map(({ label, value }) => (
                                <div key={label} style={{
                                  flex: "1", minWidth: "50px", background: "#0f172a",
                                  borderRadius: "8px", padding: "6px 8px", textAlign: "center",
                                  border: "1px solid #1e293b",
                                }}>
                                  <div style={{ fontSize: "0.65rem", color: "#475569", marginBottom: "2px" }}>{label}</div>
                                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0" }}>{value}</div>
                                </div>
                              ))}
                            </div>

                            {/* Trend + ultimo evento */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                              {trend7d !== null && (
                                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: trend7d >= 0 ? "#10b981" : "#f87171" }}>
                                  {trend7d >= 0 ? "▲" : "▼"} {Math.abs(trend7d)}% vs 7gg prec.
                                </span>
                              )}
                              {row.last_event && (
                                <span style={{ fontSize: "0.63rem", color: "#475569" }}>
                                  Ultimo: {new Date(row.last_event).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Versione app */}
                  <div style={{ background: "#1e293b", borderRadius: "12px", padding: "10px 14px", marginBottom: "16px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Versione app</span>
                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "#0ea5e9" }}>V{__APP_VERSION__}</span>
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
