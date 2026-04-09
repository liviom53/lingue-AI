import { useState } from "react";
import { Heart, Copy, Check, Coffee, Waves } from "lucide-react";

const IBAN = "IT62U3608105138220295220310";
const BENEFICIARIO = "Mazzocchi Livio";

export default function Donazioni() {
  const [copied, setCopied] = useState(false);

  function copyIban() {
    navigator.clipboard.writeText(IBAN).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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

      {/* IBAN */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Bonifico bancario</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-background rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Beneficiario</span>
            </div>
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
            Nella causale puoi scrivere "Donazione Diario del Pescatore" — grazie di cuore!
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/40 italic">
        "Ad Maiora Semper" 🎣
      </p>
    </div>
  );
}
