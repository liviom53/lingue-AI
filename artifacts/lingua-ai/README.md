# Lingua AI Pro

PWA per imparare le lingue straniere partendo dall'italiano, con traduzione, sintesi vocale, pratica pronuncia e tutor AI.

## Funzionalità

### Traduzione
- Traduzione **italiano → 29+ lingue** tramite istanze pubbliche Lingva
- 5 lingue rapide (Inglese, Spagnolo, Francese, Tedesco, Portoghese) + dropdown "Altre lingue"
- Flag reali da `flagcdn.com` (compatibili Windows)

### TUTOR AI (DeepSeek)
- Traduzione avanzata con:
  - **Pronuncia fonetica** in italiano (es. "el-LÒ") — mostrata in verde sotto la traduzione
  - **Spiegazione grammaticale** in italiano
  - **Frase d'esempio** nella lingua target
- Personalizzata in base al profilo utente

### Chat conversazione
- Chat libera nella lingua studiata con DeepSeek AI
- Correzione grammaticale inline con "💡 Correzione:"
- Scroll interno alla finestra (no salti di pagina)

### Voce
- Sintesi vocale con selezione voce e velocità regolabile
- Fix Chrome: delay 50ms + keepalive ogni 10s
- IPA per inglese via `dictionaryapi.dev`; fonetica Lingva per altre lingue
- Pratica pronuncia con riconoscimento vocale (Chrome/Edge) e score percentuale

### Profilo utente
- Campi facoltativi: Nome, Età, Sesso, Occupazione, Città, Altro
- Salvato in `localStorage` (`lingua_ai_profile`)
- Inviato a DeepSeek per personalizzare esempi e registro linguistico
- Bottone **💾 Salva profilo** con conferma visiva

### Progressi
- Tracciamento automatico: minuti totali, streak giorni, conteggio traduzioni, parole imparate, tentativi pronuncia
- Livelli: Base → Intermedio → Avanzato → Esperto
- Lingua preferita rilevata automaticamente dalle statistiche
- Consigli personalizzati in base all'utilizzo
- Reset dati disponibile nel tab Progressi

## Struttura UI

```
Header (logo + titolo)
Selettore lingua (5 fissi + Altre lingue)
Textarea input italiano
Pulsanti: DETTA | TRADUCI | TUTOR AI
Impostazioni voce (velocità, selezione voce)
Chat DeepSeek (espandibile)
─────────────────────────
Tab bar: 👤 Profilo | 📊 Progressi
```

## Tecnologie

- React 18 + TypeScript + Vite
- Styling inline (React.CSSProperties) — no librerie CSS
- localStorage per persistenza dati
- Web Speech API (sintesi + riconoscimento)
- Lingva API (traduzione libera)
- DeepSeek via OpenRouter (TUTOR AI + Chat)
- PWA: `manifest.json` + icona

## Percorso

`/lingua-ai/` — servito come file statici in produzione
