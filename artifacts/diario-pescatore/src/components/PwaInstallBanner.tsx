import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

const DISMISS_KEY = "diario_pwa_install_dismissed_ts";
const DISMISS_DAYS = 7;

export function PwaInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(() => {
    const ts = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    return ts > 0 && Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  });
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  useEffect(() => {
    if (isStandalone) return;
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setInstalled(true); setInstallPrompt(null); });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIos) { setShowIosHint(true); return; }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setInstalled(true); setInstallPrompt(null); }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (isStandalone || installed || dismissed || (!installPrompt && !isIos)) return null;

  return (
    <>
      <div className="fixed bottom-20 left-3 right-3 z-50 bg-card border border-primary/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">Installa il Diario</p>
          <p className="text-xs text-muted-foreground mt-0.5">Accesso rapido, funziona offline</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          {isIos ? "Guida" : "Installa"}
        </button>
        <button onClick={handleDismiss} className="shrink-0 p-1.5 text-muted-foreground hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {showIosHint && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-end p-4" onClick={() => setShowIosHint(false)}>
          <div className="w-full bg-card border border-white/10 rounded-3xl p-6 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-white text-base">Installa su iPhone / iPad</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Tocca <Share className="inline w-4 h-4 mx-1 text-blue-400" /> in basso nel browser Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Scorri e seleziona <strong className="text-white">"Aggiungi a schermata Home"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Tocca <strong className="text-white">"Aggiungi"</strong> in alto a destra</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIosHint(false)}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-2xl mt-2"
            >
              Capito!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
