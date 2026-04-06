# Lingua AI Pro

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![PWA](https://img.shields.io/badge/PWA-ready-orange)

> PWA per imparare le lingue straniere partendo dall'italiano, con traduzione, AI tutor, shadowing, roleplay e pratica pronuncia.

![Preview](screenshot.png)

---

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

### Grammatica X-Ray
- Tocca qualsiasi parola della traduzione per vederne: categoria grammaticale, genere, tempo verbale e una nota utile
- Pannello inline senza uscire dal flusso di lettura

### Chat & Roleplay per scenario
- Chat libera nella lingua studiata con DeepSeek AI
- Correzione grammaticale inline con "💡 Correzione:"
- **Roleplay**: scegli uno scenario reale (Ristorante, Aeroporto, Medico, Hotel, Colloquio, Supermercato) e l'AI interpreta il personaggio nella lingua target

### Shadowing
- L'AI genera una frase naturale, la pronuncia via sintesi vocale
- Ripeti subito con il microfono e ottieni un punteggio percentuale
- La tecnica più usata dai poliglotti — ora integrata nell'app

### Voce
- Sintesi vocale con selezione voce e velocità regolabile
- IPA per inglese via `dictionaryapi.dev`; fonetica Lingva per altre lingue
- Pratica pronuncia con riconoscimento vocale (Chrome/Edge) e score parola per parola

### Profilo utente
- Campi facoltativi: Nome, Età, Sesso, Occupazione, Città, Altro
- Salvato in `localStorage` (`lingua_ai_profile`)
- Inviato a DeepSeek per personalizzare esempi e registro linguistico

### Progressi
- Tracciamento automatico: minuti totali, streak giorni, conteggio traduzioni, parole imparate, tentativi pronuncia
- Livelli: Base → Intermedio → Avanzato → Esperto
- Consigli personalizzati in base all'utilizzo

---

## Come avviare in locale

### Prerequisiti
- Node.js ≥ 18
- pnpm

```bash
# Installa le dipendenze (dalla root del monorepo)
pnpm install

# Avvia il server API
pnpm --filter @workspace/api-server run dev

# Avvia il frontend
pnpm --filter @workspace/lingua-ai run dev
```

Apri `http://localhost:<PORT>/lingua-ai/` nel browser.

---

## Struttura UI

```
Header (logo + titolo)
Selettore lingua (5 fissi + Altre lingue)
Textarea input italiano
Pulsanti: DETTA | TRADUCI | TUTOR AI
⚙️ Impostazioni voce  [collassabile]
🔁 Shadowing          [collassabile]
💬 Chat + Roleplay    [collassabile]
👤 Profilo · 📊 Progressi [collassabile]
```

---

## Tecnologie

| Categoria | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Inline styles (React.CSSProperties) |
| AI | DeepSeek via OpenRouter |
| Traduzione | Lingva API (gratuita, no chiave) |
| Voce | Web Speech API |
| Persistenza | localStorage |
| Deploy | PWA (`manifest.json` + icona) |

---

## Variabili d'ambiente (server)

| Variabile | Descrizione |
|---|---|
| `AI_INTEGRATIONS_OPENROUTER_BASE_URL` | URL base OpenRouter |
| `AI_INTEGRATIONS_OPENROUTER_API_KEY` | Chiave API OpenRouter |

---

## Percorso produzione

`/lingua-ai/` — file statici serviti dall'API server Express

---

## Licenza

MIT © limax
