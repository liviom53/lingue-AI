import { useState } from "react";
import { PlayCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQ: FaqItem[] = [
  {
    q: "Come aggiungo una nuova uscita di pesca?",
    a: "Vai nella sezione 'Uscite' dal menu e premi il pulsante '+'. Compila data, luogo, meteo e note. Puoi collegare le catture direttamente dall'uscita.",
  },
  {
    q: "Come funziona lo Scanner AI?",
    a: "Premi il pulsante centrale (icona scanner) nella barra inferiore. Scatta o carica una foto del pesce: l'AI identifica la specie, stima le misure e suggerisce la ricetta.",
  },
  {
    q: "Come imposto il mio spot preferito?",
    a: "Vai in 'Impostazioni Spot AI' e inserisci le coordinate GPS del tuo posto. Le previsioni di pesca e le condizioni meteo verranno calibrate su quel punto.",
  },
  {
    q: "I dati sono salvati online?",
    a: "No, tutti i dati (uscite, catture, spot, attrezzatura) sono salvati localmente sul tuo dispositivo. Usa 'Esporta dati' per fare un backup e trasferirlo su altri dispositivi.",
  },
  {
    q: "Posso usare l'app senza connessione internet?",
    a: "Quasi tutto funziona offline: diario, catture, spot e attrezzatura. Le funzioni AI, meteo e maree richiedono connessione. Installa l'app (PWA) per un'esperienza ottimale.",
  },
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/8 bg-card overflow-hidden"
        >
          <button
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-medium text-foreground">{item.q}</span>
            {open === i
              ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-3">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Demo() {
  const videoBase = import.meta.env.BASE_URL?.replace(/\/diario-pescatore\/?$/, "") || "";
  const videoSrc = `${videoBase}/diario-pescatore-video/`;

  return (
    <div className="space-y-8 pb-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PlayCircle className="w-7 h-7 text-primary" />
          Demo &amp; Aiuto
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Guarda il video introduttivo e scopri tutte le funzioni dell'app.
        </p>
      </div>

      {/* Video embed */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">▶</span> Video Tutorial
        </h2>
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/8 shadow-2xl bg-[#051525]"
          style={{ aspectRatio: "16/9" }}>
          <iframe
            src={videoSrc}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Diario del Pescatore — Video Tutorial"
            loading="lazy"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Premi ▶ sul video per avviarlo · 🔊 per attivare l'audio · ⛶ per il fullscreen
        </p>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          Domande frequenti
        </h2>
        <FaqAccordion items={FAQ} />
      </section>

      {/* Placeholder per contenuti futuri */}
      <section>
        <h2 className="text-base font-semibold mb-3">📚 Guide &amp; risorse</h2>
        <div className="rounded-2xl border border-dashed border-white/15 bg-card/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Altre guide, video e risorse in arrivo.
          </p>
        </div>
      </section>

    </div>
  );
}
