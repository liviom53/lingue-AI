# Workspace — Diario del Pescatore v3.6

## diario-pescatore PWA (artifacts/diario-pescatore)

- **Versione**: v3.6 · **Autore**: Limax · *Ad Maiora Semper*
- **AI**: DeepSeek Chat (`deepseek-chat`) — unico provider, chiave inclusa
- **Scan**: scanner manuale (foto + form) → salva cattura nel diario
- **Pagina Home** (ex Dashboard): FishingForecastCard interattiva, scanner, stats, ultime uscite/catture
- **Previsioni**: usa stesso `FishingForecastCard` da `components/FishingForecastCard.tsx`
- **Stazioni (13)**: include Foce Sisto — tutti i moduli usano `use-location.ts` condiviso
- **Spot**: campi lat/lon + pulsante GPS
- **AI Chat**: storico conversazione completo inviato a DeepSeek, voce Web Speech API
- **Componenti chiave**:
  - `src/components/FishingForecastCard.tsx` — card 6-tab con algoritmo pesca (score 0-100)
  - `src/hooks/use-location.ts` — STAZIONI (13) + getSharedStation/setSharedStation
  - `src/hooks/use-local-data.ts` — factory CRUD localStorage
- **Algoritmo score**: maree M2+K1+M4 (30pt) + luna (25pt) + SST (20pt) + onde (10pt) + vento (9pt) + meteo (6pt) + moltiplicatori + campo
- **Dati locali**: localStorage; sync JSONBin.io pianificato



## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

### `artifacts/lingua-ai` (`@workspace/lingua-ai`)

**Lingua AI Pro** — React + Vite PWA for learning to pronounce foreign languages.

- **Translator**: Lingva API (3 instances with fallback: lingva.ml, garudalinux, plausibility.cloud) for Italian → 6 languages (EN, ES, FR, DE, PT, RU)
- **AI Translate**: DeepSeek AI via `/api/ai/translate` — richer translation with grammar explanation and example sentence
- **AI Chat**: DeepSeek AI via `/api/ai/chat` — conversation practice in target language, with gentle corrections
- **AI backend**: OpenRouter managed by Replit AI Integrations, model `deepseek/deepseek-chat`
- **Speech**: Web Speech API — synthesis (speak translation) + recognition (pronunciation practice scoring)
- **IPA**: English IPA via dictionaryapi.dev, other langs via Lingva pronunciation field; `ipaToReadable()` converts to Italian-friendly phonetics
- **Routes**: `GET /lingua-ai/` (static PWA), `POST /api/ai/translate`, `POST /api/ai/chat`
- **Key file**: `artifacts/lingua-ai/src/App.tsx` (all app logic), `artifacts/api-server/src/routes/ai.ts` (AI routes)
- **vite.config.ts**: default PORT=19529, BASE_PATH=/lingua-ai/
- **Production**: static files served by api-server Express (`/lingua-ai` → `dist/public/`); no separate production process

## Production Architecture

Single api-server (`artifacts/api-server`, port 8080) handles ALL paths in production:
- `/api/*` → Express routes (AI translate, AI chat, healthz)
- `/lingua-ai/*` → `artifacts/lingua-ai/dist/public/` (production Vite build, `BASE_PATH=/lingua-ai/`)
- `/*` → `artifacts/diario-pescatore/dist/public/` (production Vite build, `BASE_PATH=/`)

**Build step** (`artifacts/api-server/build-all.sh`): builds all three in sequence with correct env vars.

**Why single server**: eliminates Replit sidecar path-routing ambiguity. `dist/public/` for lingua-ai and diario-pescatore are committed (not in `.gitignore`) and rebuilt fresh on every production deploy.

**Dev**: lingua-ai and diario-pescatore each run their own Vite HMR dev server (ports 19529 and 22883). The workspace proxy routes dev preview to those ports. The api-server dev server also serves the built static files at those paths as a fallback.

### `artifacts/diario-pescatore` (`@workspace/diario-pescatore`)

**Diario del Pescatore v3.5** — A PWA fishing diary for Italian fisherman Livio, targeting the Tyrrhenian/Lazio coast (Porto Badino area). 

- **Frontend-only**: React + Vite, localStorage for all persistence, no backend needed.
- **Design**: Dark ocean theme — deep navy backgrounds (`220 25% 7%`), teal/cyan primary (`175 65% 42%`), dark cards.
- **14 sections**: Dashboard, Uscite, Pescato, Spot, Specie, Attrezzatura, Ricette, Meteo, Maree & Luna, Previsioni Pesca, Statistiche, AI Chat, Parco Auto, Finanze.
- **Data storage keys**: `diario_uscite`, `diario_catture`, `diario_spot`, `diario_attrezzatura`, `diario_ricette`, `diario_veicoli`, `diario_finanze`.
- **Generic CRUD factory**: `createLocalCrudHooks<T>` in `src/hooks/use-local-data.ts`.
- **External APIs**: Open-Meteo (no key) for weather + marine; Groq llama-3.3-70b for AI chat; Gemini for species recognition.
- **Default location**: Porto Badino (lat: 41.28, lng: 13.16); 12 Lazio coastal stations selectable.
- **Maree**: Pure mathematical harmonic model (M2+K1+M4 tidal harmonics), no external API needed.
- **specieDB.ts**: 50 Tyrrhenian fish species with detailed descriptions.
- **Charts**: Recharts used in Statistiche and Finanze.
- **Animations**: framer-motion for SplashScreen with underwater background.
- **Export/Import**: JSON backup via browser download/upload in AppLayout sidebar.
- **Routing**: wouter with lazy-loaded pages, `BASE_URL` aware router base.
