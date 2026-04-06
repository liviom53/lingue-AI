# Diario del Pescatore

![PWA](https://img.shields.io/badge/PWA-ready-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)

> PWA per tenere traccia delle uscite di pesca, con statistiche, gestione attrezzatura, meteo, maree e molto altro.

---

## Funzionalità

### Dashboard
- Panoramica rapida delle ultime uscite e statistiche principali
- Previsioni meteo e condizioni di pesca

### Uscite
- Registrazione uscite di pesca con data, spot, specie pescate e note
- Storico completo consultabile

### Spot
- Gestione luoghi di pesca preferiti
- Informazioni per ogni spot (tipo di acqua, specie presenti, ecc.)

### Pescato
- Registro del pescato per ogni uscita
- Foto, peso, misura e specie

### Specie
- Catalogo delle specie ittiche
- Schede con caratteristiche e stagionalità

### Attrezzatura
- Inventario canne, mulinelli, esche e accessori
- Stato di manutenzione

### Meteo
- Condizioni meteo per le uscite pianificate
- Previsioni integrate

### Maree
- Consultazione tabelle maree
- Orari alba/tramonto

### Previsioni Pesca
- Indicatore qualità giornata di pesca (luna, maree, meteo)

### Statistiche
- Grafici e riepilogo annuale/mensile
- Specie più pescate, spot migliori, uscite per mese

### Finanze
- Tracciamento spese (attrezzatura, licenze, carburante)
- Budget e bilancio uscite

### Ricette
- Ricette con le specie pescate

### Parco Auto
- Gestione veicoli usati per le uscite

### AI
- Assistente AI per consigli di pesca

---

## Come avviare in locale

### Prerequisiti
- Node.js ≥ 18
- pnpm

```bash
# Installa le dipendenze (dalla root del monorepo)
pnpm install

# Avvia il frontend
pnpm --filter @workspace/diario-pescatore run dev
```

---

## Tecnologie

| Categoria | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS + shadcn/ui |
| Persistenza | localStorage |
| Deploy | PWA (`manifest.json` + icona) |

---

## Percorso produzione

`/` — servito come file statici in produzione

Produzione: `https://web-app-creator--liviomazzocchi.replit.app/`
