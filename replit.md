# Workspace Overview

pnpm monorepo con due PWA React+Vite e un server API Express condiviso.

## Architettura

```
artifacts/
  lingua-ai/         → PWA traduttore  → /lingua-ai/ (porta 19529 in dev)
  diario-pescatore/  → PWA diario pesca → /         (porta 22883 in dev)
  api-server/        → Express API      → /api       (porta 8080)
```

### Routing (sidecar Replit)
- **Dev**: ogni artifact ha il proprio Vite dev server con HMR
- **Produzione**: lingua-ai e diario-pescatore vengono serviti come file statici da Replit (serve = "static"), api-server è un processo Node per le rotte `/api/*`

### API server (`artifacts/api-server`)
- Solo rotte `/api/*` — nessun serving di file statici
- Rotte principali: `GET /api/healthz`, `POST /api/ai/translate`, `POST /api/ai/chat`
- AI via OpenRouter (DeepSeek): `AI_INTEGRATIONS_OPENROUTER_BASE_URL` + `AI_INTEGRATIONS_OPENROUTER_API_KEY`

## Lingua AI Pro (`artifacts/lingua-ai`)
- Traduzione italiano → 6 lingue (EN, ES, FR, DE, PT, RU)
- Speech synthesis con fix: 50ms delay tra cancel() e speak(), keepalive ogni 10s
- IPA per la pronuncia
- Chat DeepSeek AI via `/api/ai/chat`
- Anti-flash: `background:#0f172a` inline su `<html>` in index.html
- `BASE_PATH=/lingua-ai/` (Vite base config)

## Diario del Pescatore (`artifacts/diario-pescatore`)
- PWA per registrare uscite di pesca
- Anti-flash: stesso schema dark inline
- `BASE_PATH=/` (Vite base config)

## Build in produzione
Ogni artifact gestisce il proprio build:
- lingua-ai: `pnpm --filter @workspace/lingua-ai run build` → dist servito staticamente
- diario-pescatore: `pnpm --filter @workspace/diario-pescatore run build` → dist servito staticamente
- api-server: `pnpm --filter @workspace/api-server run build` → `node dist/index.mjs`
