import { useState } from "react";
import { Heart, Copy, Check, Coffee, Waves, ExternalLink } from "lucide-react";

const IBAN = "IT62U3608105138220295220310";
const BENEFICIARIO = "Mazzocchi Livio";
const POSTEPAY = "5333 1712 0435 4399";
const PAYPAL_URL = "https://www.paypal.com/donate?business=livio.mazzocchi%40gmail.com&currency_code=EUR";
const KOFI_URL = "https://ko-fi.com/liviomazzocchi";

export default function Donazioni() {
  const [copied, setCopied] = useState(false);
  const [copiedPostepay, setCopiedPostepay] = useState(false);

  function copyIban() {
    navigator.clipboard.writeText(IBAN).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function copyPostepay() {
    navigator.clipboard.writeText(POSTEPAY.replace(/\s/g, "")).then(() => {
      setCopiedPostepay(true);
      setTimeout(() => setCopiedPostepay(false), 2500);
    });
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Donazioni</h1>
          <p className="text-sm text-muted-foreground">Supporta lo sviluppo dell'app</p>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent border border-primary/20 rounded-2xl p-6 text-center space-y-3">
        <div className="text-4xl">🎣</div>
        <h2 className="font-bold text-lg">Hai trovato utile il Diario?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Questa app è gratuita e senza pubblicità. Se ti ha aiutato a tenere traccia delle tue pescate
          o ti ha dato un buon consiglio sul momento giusto per uscire,
          considera di offrirmi un caffè — mi aiuta a mantenerla aggiornata e a migliorarla.
        </p>
        <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
          <Coffee className="w-4 h-4" />
          <span>Anche un piccolo contributo fa la differenza</span>
        </div>
      </div>

      {/* PayPal */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#009cde]" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.79A.859.859 0 0 1 5.79 2h7.516c2.614 0 4.533.565 5.705 1.68 1.137 1.082 1.528 2.65 1.162 4.663-.048.27-.1.543-.161.818-.81 3.976-3.553 5.34-7.066 5.34H10.9a.86.86 0 0 0-.848.724l-.972 6.112zm11.405-14.76c-.03.195-.064.393-.104.596-.906 4.45-4.006 6.41-8.207 6.41H8.098l-1.268 7.96H2.47L5.79 2h7.516c2.252 0 3.91.474 4.953 1.411.921.83 1.322 2.038 1.222 3.166z"/>
            </svg>
          </div>
          <h2 className="font-semibold">PayPal</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Dona in modo rapido e sicuro tramite PayPal — anche senza account, con carta di credito.
        </p>
        <a
          href={PAYPAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#009cde] hover:bg-[#0085c0] text-white font-semibold rounded-xl transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Dona con PayPal
        </a>
      </div>

      {/* Ko-fi */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-[#FF5E5B]" />
          </div>
          <h2 className="font-semibold">Ko-fi</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Offrimi un caffè su Ko-fi — veloce, senza commissioni per chi dona.
        </p>
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#FF5E5B] hover:bg-[#e54e4b] text-white font-semibold rounded-xl transition-colors"
        >
          <Coffee className="w-4 h-4" />
          Offrimi un caffè ☕
        </a>
      </div>

      {/* PostePay */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#FFCC00"/>
              <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#002B7F">PP</text>
            </svg>
          </div>
          <h2 className="font-semibold">PostePay Evolution</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Ricarica direttamente da app Postepay, sportello Poste o tabaccheria.
        </p>
        <div className="bg-background rounded-xl p-4 space-y-1">
          <div className="text-xs text-muted-foreground mb-2">Numero carta</div>
          <div className="flex items-center justify-between gap-3">
            <code className="text-primary font-mono text-sm tracking-widest">
              {POSTEPAY}
            </code>
            <button
              onClick={copyPostepay}
              className="shrink-0 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
              title="Copia numero carta"
            >
              {copiedPostepay ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copiedPostepay && (
            <p className="text-xs text-primary mt-1">Numero copiato!</p>
          )}
        </div>
        <div className="bg-background rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Intestatario</div>
          <p className="font-semibold text-white">{BENEFICIARIO}</p>
        </div>
      </div>

      {/* IBAN */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Bonifico bancario</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-background rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Beneficiario</div>
            <p className="font-semibold text-white">{BENEFICIARIO}</p>
          </div>

          <div className="bg-background rounded-xl p-4 space-y-1">
            <div className="text-xs text-muted-foreground mb-2">IBAN</div>
            <div className="flex items-center justify-between gap-3">
              <code className="text-primary font-mono text-sm tracking-wide break-all">
                {IBAN}
              </code>
              <button
                onClick={copyIban}
                className="shrink-0 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                title="Copia IBAN"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-primary mt-1">IBAN copiato!</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground/60 text-center px-2">
            Causale: "Donazione Diario del Pescatore" — grazie di cuore!
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/40 italic">
        "Ad Maiora Semper" 🎣
      </p>
    </div>
  );
}
