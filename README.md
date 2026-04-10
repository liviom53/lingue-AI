# Monorepo — Livio Mazzocchi

Progetto pnpm workspace con più artefatti web, serviti da un unico API server Express con routing path-based.

**URL produzione:** `https://web-app-creator--liviomazzocchi.replit.app`

---

## Artefatti

| Artefatto | Titolo | Path | Tipo |
|---|---|---|---|
| `artifacts/diario-pescatore` | Diario del Pescatore | `/diario-pescatore/` | PWA React+Vite |
| `artifacts/diario-pescatore-landing` | Diario del Pescatore — Landing | `/diario-pescatore-landing/` | Web |
| `artifacts/diario-pescatore-video` | Diario del Pescatore — Video Tutorial | `/diario-pescatore-video/` | Video animato |
| `artifacts/lingua-ai` | Lingua AI | `/lingua-ai/` | PWA React+Vite |
| `artifacts/lingua-ai-landing` | Lingua AI — Landing | `/lingua-ai-landing/` | Web |
| `artifacts/lingua-ai-demo-video` | Lingua AI — Demo Video | `/lingua-ai-demo-video/` | Video animato |
| `artifacts/api-server` | API Server | `/api/*` | Express |
| `artifacts/mockup-sandbox` | Component Preview Server | — | Dev only |

---

## Diario del Pescatore

PWA completa per la gestione del diario di pesca. Funzionalità principali:

- **Dashboard** — panoramica catture, uscite recenti, previsioni pesca del giorno
- **Uscite** — log uscite con data, luogo, meteo, note
- **Catture** — registro catture con specie, misure, foto
- **Specie** — database 50 specie ittiche con foto Wikimedia e schede informative
- **Scanner AI** — identificazione specie tramite foto (Gemini 2.5 Flash)
- **Previsioni** — condizioni meteo e indice pesca basati sullo spot configurato
- **Assistente AI** — chatbot per consigli di pesca (Gemini)
- **Normative Locali** — divieti balneari del litorale laziale: stato in tempo reale (VIETATO / fuori orario / consentita) basato su data, ora e spot; database 20 comuni da Montalto di Castro a Minturno
- **Parco Auto** — gestione veicoli collegati all'attività
- **Finanze** — registro spese di pesca
- **Demo & Aiuto** — video tutorial embedded, FAQ, guide
- **Impostazioni Spot AI** — coordinate GPS dello spot, calibrazione previsioni
- **Admin panel** — Ctrl+Shift+5 oppure 7 tap sul logo (password: `macolingue`)

### Stack
- React + Vite + TypeScript
- TailwindCSS + shadcn/ui
- Framer Motion
- Gemini AI via `@google/genai` (endpoint proxy `/api/ai/*`)
- localStorage per dati utente (offline-first)

---

## Lingua AI

PWA per imparare 29 lingue con AI.

- Lezioni generate da Gemini
- Flashcard, quiz, conversazione
- Supporto PWA con installazione

---

## API Server

Express server che funge da:
1. **Proxy** per tutti i dev server degli artefatti (in sviluppo)
2. **API backend** con endpoint AI (Gemini), meteo, statistiche
3. **Static server** per i build in produzione

### Endpoint principali

| Path | Descrizione |
|---|---|
| `GET /api/health` | Health check |
| `POST /api/ai/identify-fish` | Identificazione specie da foto |
| `POST /api/ai/fishing-forecast` | Previsioni pesca |
| `POST /api/ai/chat` | Assistente AI |
| `POST /api/ai/recipe` | Suggerimento ricette |
| `GET /api/weather` | Dati meteo OpenMeteo |

---

## Sviluppo locale

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/diario-pescatore run dev
# ... etc.
```

Tutti i workflow sono configurati in Replit e si avviano automaticamente.

---

## Note tecniche

- **Emoji safe** (Unicode ≤12): usare 🐟 🎣 🐛 🐚 — evitare 🦪 🪡 🪱 🪝
- **iframe cross-artifact**: usare sempre `window.location.origin + "/path/"` — mai `import.meta.env.BASE_URL` manipulation
- **Spot di default**: Porto Badino (lat 41.40, lon 13.03)
- **Gemini key**: `AI_INTEGRATIONS_GEMINI_API_KEY` (Replit AI Integrations proxy)
