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
- **Admin panel** — Ctrl+Shift+5 oppure 7 tap sul logo (accesso riservato)

### Stack
- React + Vite + TypeScript
- TailwindCSS + shadcn/ui
- Framer Motion
- Gemini AI via `@google/genai` (endpoint proxy `/api/ai/*`)
- localStorage per dati utente (offline-first)
- PWA con service worker scope `/diario-pescatore/` (navigateFallbackAllowlist limitata al solo path del Diario)

---

## Lingua AI

PWA per imparare 29 lingue straniere con intelligenza artificiale.

- **Traduzione** — testo e voce in 29 lingue con pronuncia realistica
- **Conversazione** — chat con scenari reali (ristorante, aeroporto, hotel…)
- **X-Ray grammaticale** — analisi grammaticale di qualsiasi frase
- **Vocabolario** — flashcard con spaced repetition
- **Quiz** — domande adattive sul livello corrente
- **Profilo utente** — livello, lingua madre, obiettivi personalizzati
- **AI** — Google Gemini 2.5 Flash via AI Integrations proxy
- **PWA** — installabile su Android e iOS, funziona offline
- **Aggiorna app** — pulsante nel footer per cancellare service worker e cache

### Stack
- React + Vite + TypeScript
- CSS-in-JS (stili inline)
- Gemini AI via `AI_INTEGRATIONS_GEMINI_API_KEY`
- PWA con service worker scope `/lingua-ai/`

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
| `GET /api/reset` | Cancella service worker e cache, redirect a `/lingua-ai/` |
| `GET /api/version` | Versione corrente dell'app |
| `POST /api/ai/identify-fish` | Identificazione specie da foto |
| `POST /api/ai/fishing-forecast` | Previsioni pesca |
| `POST /api/ai/chat` | Assistente AI |
| `POST /api/ai/recipe` | Suggerimento ricette |
| `GET /api/weather` | Dati meteo OpenMeteo |
| `GET /api/stats` | Statistiche utilizzo (richiede password admin) |

### Route statiche in produzione

| Path | Artefatto |
|---|---|
| `/lingua-ai/` | Lingua AI PWA |
| `/lingua-ai-landing/` | Landing Lingua AI |
| `/lingua-ai-demo-video/` | Demo video Lingua AI |
| `/diario-pescatore-landing/` | Landing Diario |
| `/diario-pescatore-video/` | Video tutorial Diario |
| `/diario-pescatore/` (catch-all) | Diario del Pescatore PWA |

---

## Sviluppo locale

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/diario-pescatore run dev
pnpm --filter @workspace/lingua-ai run dev
# ... etc.
```

Tutti i workflow sono configurati in Replit e si avviano automaticamente.

### Build per produzione

```bash
pnpm --filter @workspace/diario-pescatore run build
pnpm --filter @workspace/lingua-ai run build
pnpm --filter @workspace/api-server run build
# ... (tutti gli altri artefatti)
```

---

## Note tecniche

- **Emoji safe** (Unicode ≤12): usare 🐟 🎣 🐛 🐚 — evitare 🦪 🪡 🪱 🪝
- **iframe cross-artifact**: usare sempre `window.location.origin + "/path/"` — mai `import.meta.env.BASE_URL` direttamente
- **Cross-frame navigation**: usare `postMessage` — mai `window.top/parent.location.href` (sandbox error in Replit)
- **Spot di default**: Porto Badino (lat 41.40, lon 13.03)
- **Gemini key**: `AI_INTEGRATIONS_GEMINI_API_KEY` (Replit AI Integrations proxy)
- **Service worker Diario**: scope e `navigateFallbackAllowlist` limitati a `/diario-pescatore/` per non intercettare altri path
- **Reset SW**: `GET /api/reset` bypassa il SW (path `/api/` è nella denylist del SW) e pulisce tutto prima di redirigere a `/lingua-ai/`
