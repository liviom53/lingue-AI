# Diario del Pescatore

![PWA](https://img.shields.io/badge/PWA-ready-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![AI](https://img.shields.io/badge/AI-Gemini%202.5-green)

> PWA completa per il diario di pesca digitale — uscite, catture, spot, meteo, AI e molto altro.

**URL produzione:** `https://web-app-creator--liviomazzocchi.replit.app/diario-pescatore/`

---

## Funzionalità

### Dashboard
- Panoramica catture, uscite recenti e previsioni pesca del giorno
- Stato normative balneari in tempo reale per lo spot configurato

### Uscite
- Registrazione uscite con data, spot, specie pescate, meteo e note
- Storico completo con filtri e ricerca

### Catture (Pescato)
- Registro catture per uscita: specie, peso, lunghezza, foto
- Statistiche per specie e per periodo

### Spot
- Gestione luoghi di pesca con coordinate GPS
- Vista lista e mappa interattiva (Leaflet + OpenStreetMap)
- Ricerca spot vicini tramite Overpass API
- Spot default: Porto Badino (lat 41.40, lon 13.03)

### Specie
- Catalogo 50 specie ittiche con foto Wikimedia
- Schede informative: habitat, stagionalità, taglia minima

### Scanner AI
- Identificazione specie tramite foto (Gemini 2.5 Flash)
- Risultato con nome, caratteristiche e consigli

### Previsioni Pesca
- Indice qualità giornata (luna, maree, meteo, vento)
- Dati in tempo reale dallo spot configurato

### Meteo & Maree
- Previsioni meteo integrate (OpenMeteo)
- Orari alba/tramonto e fasi lunari

### Normative Locali
- Divieti balneari del litorale laziale in tempo reale
- Database 20 comuni: da Montalto di Castro a Minturno
- Stato: VIETATO / fuori orario / consentita — aggiornato per data, ora e spot

### Assistente AI
- Chatbot per consigli di pesca personalizzati (Gemini)
- "Guru di Porto Badino" — powered by OpenRouter

### Statistiche
- Grafici annuali/mensili (catture, uscite, specie)
- Spot migliori, periodi di punta, specie più pescate

### Finanze
- Tracciamento spese: attrezzatura, licenze, carburante
- Budget e bilancio per uscita

### Attrezzatura
- Inventario canne, mulinelli, esche e accessori
- Stato manutenzione e note

### Parco Auto
- Gestione veicoli usati per le uscite di pesca

### Ricette
- Suggerimenti di ricette con le specie pescate

### Demo & Aiuto
- Video tutorial embedded (`/diario-pescatore-video/`)
- FAQ, guide all'uso, primo avvio guidato

### Admin Panel
- Accesso: `Ctrl+Shift+5` oppure 7 tap sul logo
- Funzioni: statistiche utilizzo, versione, controllo accessi

---

## Stack tecnico

| Categoria | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animazioni | Framer Motion |
| Mappe | Leaflet + OpenStreetMap + Overpass API |
| AI | Gemini 2.5 Flash via `@google/genai` |
| Meteo | OpenMeteo API |
| Persistenza | localStorage (offline-first) |
| PWA | vite-plugin-pwa + Workbox |
| Routing | Wouter |

### Service Worker
- Scope: `/diario-pescatore/`
- `navigateFallbackAllowlist: [/^\/diario-pescatore\//]`
- `cleanupOutdatedCaches: true`
- Update automatico ogni 60 minuti

---

## Sviluppo locale

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/diario-pescatore run dev
```

### Build produzione

```bash
pnpm --filter @workspace/diario-pescatore run build
# Output: artifacts/diario-pescatore/dist/public/
```

---

## Note importanti

- **Emoji**: usare solo Unicode ≤12 — 🐟 🎣 🐛 🐚 (evitare 🦪 🪡 🪱 🪝)
- **localStorage**: chiave spot `_diario_spot_config`; versione `diario_running_v`

---

## Licenza

MIT © Livio Mazzocchi 2026
