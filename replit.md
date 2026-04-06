# Workspace Overview

pnpm monorepo con due PWA React+Vite e un server API Express condiviso.

## Architettura

```
artifacts/
  lingua-ai/         → PWA traduttore  → /lingua-ai/
  diario-pescatore/  → PWA diario pesca → /
  api-server/        → Express API      → /api/*
```

### Routing
- **Dev**: ogni artifact ha il proprio Vite dev server con HMR; api-server su porta 8080
- **Produzione**: `https://web-app-creator--liviomazzocchi.replit.app`
- lingua-ai e diario-pescatore serviti staticamente, api-server processo Node

---

## Lingua AI Pro (`artifacts/lingua-ai`)

### Funzionalità principali
- Traduzione **italiano → 29+ lingue** tramite istanze pubbliche Lingva (EN, ES, FR, DE, PT + 24 altre)
- Flag reali da `flagcdn.com` (compatibili Windows, niente emoji bandiera)
- **TUTOR AI**: DeepSeek via OpenRouter (`/api/ai/translate`) — restituisce `{translation, pronunciation, explanation, example}`
  - `pronunciation`: fonetica italiana semplificata con sillaba accentata in maiuscolo (es. "el-LÒ")
  - `explanation`: nota grammaticale in italiano
  - `example`: frase d'esempio nella lingua target
- **Chat DeepSeek** (`/api/ai/chat`): conversazione nella lingua target, correzioni grammaticali inline
  - Chat window a scorrimento interno (no jump di pagina): usa `chatContainerRef.scrollTop`
- **Sintesi vocale**: fix Chrome (50ms delay + keepalive ogni 10s), selezione voce, velocità regolabile
- **Speech recognition**: pratica pronuncia con score; solo Chrome/Edge (avviso su altri browser)
- **IPA**: per inglese usa `dictionaryapi.dev`, per altre lingue usa il campo `pronunciation` di Lingva

### Profilo utente
- Campi facoltativi: nome, età, sesso, occupazione, città, altro
- Salvati in `localStorage` con chiave `lingua_ai_profile`
- Passati a DeepSeek in ogni chiamata `/api/ai/translate` e `/api/ai/chat` per personalizzare esempi e registro
- Auto-save ad ogni modifica + bottone **💾 Salva profilo** con feedback verde "✓ Salvato!"

### Sistema progressi
- Salvati in `localStorage` con chiave `lingua_ai_progress`
- Traccia: `totalMinutes`, `translationCount`, `aiTranslationCount`, `wordsLearned[]`, `practiceAttempts`, `practiceScores[]`, `streakDays`, `langStats{}`
- Aggiornato in: `handleTranslate`, `handleAiTranslate`, `startPracticeSession`
- Livelli: Base (< 50 pt) → Intermedio (< 300) → Avanzato (< 1000) → Esperto

### UI / Layout
- Header con `clamp()` responsive, logo, sottotitolo arancione
- **Sempre visibile**: selettore lingua (5 fissi + dropdown "Altre lingue"), textarea, DETTA, TRADUCI, TUTOR AI, impostazioni voce, chat DeepSeek
- **Tab bar in fondo** (due tab):
  - **👤 Profilo**: form campi personali + bottone salva
  - **📊 Progressi**: livello (riga compatta), ore/streak/lingua preferita, traduzioni, pronuncia, vocabolario, consigli, reset
- Colori base: sfondo `#080e1c`, arancione `#fb923c`, crema `#e8d0a0` (TUTOR AI), verde `#10b981`

### Sistema 3D visivo (`src/index.css` + `styles` in `App.tsx`)

#### Font
- `*` selector forza `'Inter', system-ui` su TUTTI gli elementi (inclusi textarea, select, input, button)
- Inter caricato da Google Fonts in `index.html`

#### Body / Sfondo
- Tre radial-gradient sovrapposti (`#183060`, `#1c0d44`, `#0d2a1a`) su `#080e1c`

#### Card (`styles.card`)
- Gradiente: `linear-gradient(140deg, #3d5f82 0%, #1e2d3f 35%, #0e1620 100%)` — luce da alto-sinistra
- Bordi asimmetrici: `borderTop` azzurrato (`rgba(160,210,255,0.35)`), `borderBottom` scuro, `borderLeft` leggermente lit, `borderRight` scuro
- **Bevel completo** via `inset` box-shadow:
  - `inset 0 3px 0 rgba(255,255,255,0.22)` — fascia alta luminosa
  - `inset 4px 0 0 rgba(255,255,255,0.13)` — bordo sinistro lit
  - `inset -4px 0 0 rgba(0,0,0,0.35)` — bordo destro scuro
  - `inset 0 -3px 0 rgba(0,0,0,0.45)` — fascia bassa scura
- **Faccia inferiore** (spessore fisico): 5 strati `0 2/4/6/8/10px 0` in colori `#0c1624→rgba(3,7,14,0.55)`
- **Ombre ambientali**: `0 16px 36px rgba(0,0,0,0.70)` + `0 7px 16px rgba(0,0,0,0.55)`
- `marginBottom: 16px` (spazio per la faccia inferiore)

#### Pulsanti (`styles.btn`)
- `transform: translateY(-5px)` — flottano di 5px sopra la superficie
- **Bevel bottone**:
  - `inset 0 3px 0 rgba(255,255,255,0.42)` — top highlight forte
  - `inset 4px 0 0 rgba(255,255,255,0.20)` — bordo sinistro lit
  - `inset -4px 0 0 rgba(0,0,0,0.28)` — bordo destro scuro
  - `inset 0 -3px 0 rgba(0,0,0,0.35)` — fascia bassa scura
- **Faccia inferiore colorata**: 4 strati arancione (`#b85a10 → rgba(40,16,0,0.40)`) da 5px a 11px
- **Glow arancione**: `0 16px 30px rgba(251,146,60,0.24)`
- `:active` (CSS globale): `translateY(4px)` + inset shadow → sensazione di pressione fisica

#### Classi CSS speciali
| Classe | Effetto |
|---|---|
| `section` | hover: `translateY(-4px)` + `brightness(1.06)` + bevel shadow potenziato |
| `section.lang-section` | hover disabilitato (`transform: none !important`) |
| `section.input-section` | hover disabilitato |
| `.lang-btn` | hover: `translateY(-6px)` + `brightness(1.14)`; active: press-down |
| `.action-btn` | hover: `translateY(-8px)` + `brightness(1.12)`; active: press-down |

#### Spacing regole
- Bottoni DETTA/TRADUCI/TUTOR AI in flex column con `gap: 20px`, `marginTop: 16px`
- Il `marginTop: 16px` compensa visivamente la faccia inferiore della card e il `translateY(-5px)` del bottone

### `handleTranslate` signature
- `async (langOverride?: string)` — guard è `typeof langOverride === 'string'`
- Demo passano codice lingua esplicito; il bottone usa wrapper `() => handleTranslate()`

### `localStorage` keys
- `lingua_ai_progress` — progressi
- `lingua_ai_profile` — profilo utente
- `lingua_ai_bookmarks` — segnalibri

### Demo (`STEP_TARGETS`)
- Step 0 → textarea (azione di digitazione)
- Step 1 → griglia lingue (lingua selezionata)
- Step 2 → translate-btn ("Premo Traduci." SOLO)
- Step 3 → testo tradotto o shadow-toggle (funzionalità visibile)
- Step 4 → tab-profilo (pannello aperto)
- Step 5 → completamento

### Note note
- Warning benigno pre-esistente: attributo `title` duplicato sul bottone condivisione (~riga 1314)
- Colori sezioni accordion: Blu=Impostazioni voce, Viola=Shadowing, Arancione=Chat AI, Verde=Quiz+Risultato

---

## API Server (`artifacts/api-server`)

- **POST `/api/ai/translate`**: body `{text, targetLang, userProfile?}` → `{translation, pronunciation, explanation, example}`
- **POST `/api/ai/chat`**: body `{messages, targetLang, userProfile?}` → `{reply}`
- Modello: `deepseek/deepseek-chat` via OpenRouter
- `userProfile` viene convertito in contesto testuale e iniettato nel system prompt
- `LANG_NAMES` copre tutte le 29 lingue supportate dal frontend

---

## Diario del Pescatore (`artifacts/diario-pescatore`)

- PWA per registrare uscite di pesca
- `BASE_PATH=/`

---

## Variabili d'ambiente (server-side)
- `AI_INTEGRATIONS_OPENROUTER_BASE_URL`
- `AI_INTEGRATIONS_OPENROUTER_API_KEY`
- `VITE_GEMINI_API_KEY` (disponibile, non in uso attivo)

## File importanti
- `artifacts/lingua-ai/src/App.tsx` — frontend principale (~2430 righe): UI, state, 4 script demo, narrazione, cursore, scrollDemo, bookmark, quiz
- `artifacts/lingua-ai/src/index.css` — stili globali: Inter, sistema 3D, hover sezioni, classi `.lang-btn` `.action-btn` `.lang-section` `.input-section`, `#demo-cursor`
- `artifacts/lingua-ai/index.html` — caricamento font Inter da Google Fonts
- `artifacts/api-server/src/routes/ai.ts` — endpoint AI: `/translate`, `/chat`, `/grammar`, `/shadow`
- `artifacts/api-server/src/middleware/security.ts` — rate limiting, validazione input, controllo origine
- `artifacts/lingua-ai-demo-video/src/lib/video/hooks.ts` — **NON MODIFICARE**: hook lifecycle registrazione
- `.replit` — deploymentTarget="vm", porta 8080→80
