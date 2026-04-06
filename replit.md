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
- Colori: sfondo `#0f172a`, card `#1e293b`, arancione `#fb923c`, crema `#e8d0a0` (TUTOR AI), verde `#10b981`

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
