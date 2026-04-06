# Lingua AI Pro

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![PWA](https://img.shields.io/badge/PWA-ready-orange)

> PWA per imparare le lingue straniere partendo dall'italiano, con traduzione, AI tutor, shadowing, roleplay e pratica pronuncia.

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

### Segnalibri & Quiz
- Salva parole/frasi nei segnalibri (`lingua_ai_bookmarks`)
- Quiz veloce sulle parole salvate

### Profilo utente
- Campi facoltativi: Nome, Età, Sesso, Occupazione, Città, Altro
- Salvato in `localStorage` (`lingua_ai_profile`)
- Inviato a DeepSeek per personalizzare esempi e registro linguistico

### Progressi
- Tracciamento automatico: minuti totali, streak giorni, conteggio traduzioni, parole imparate, tentativi pronuncia
- Livelli: Base → Intermedio → Avanzato → Esperto
- Consigli personalizzati in base all'utilizzo

### Demo interattiva
- 4 script demo con cursore animato, narrazione in italiano e scroll automatico
- Attivabile dall'accordion "Demo & Funzionalità" in cima alla pagina

---

## Interfaccia

### Layout
```
Header (logo + titolo + sottotitolo arancione)
🇮🇹 ▶ Demo & Funzionalità   [accordion]
Selettore lingua (5 fissi + Altre lingue)
Textarea "Scrivi in italiano..."
🎙 DETTA  |  ✈ TRADUCI  |  🧳 TUTOR AI
⚙️  Impostazioni voce        [collassabile]
🔁  Shadowing                [collassabile]
💬  Conversa con DeepSeek AI [collassabile]
Quiz veloce                  [collassabile]
─────────────────────────────────────────
Tab: 👤 Profilo · 📊 Progressi
```

### Sistema 3D visivo
L'intera UI usa un sistema visivo a tre dimensioni basato su `box-shadow` a strati zero-blur:

- **Sfondo**: tre radial-gradient sovrapposti (`#183060`, `#1c0d44`, `#0d2a1a`) su `#080e1c`
- **Carte**: gradiente `140deg` da `#3d5f82` (alto-sinistra) a `#0e1620` (basso-destra); bevel completo con fasce luminose/scure su tutti e 4 i bordi; faccia inferiore a 5 strati (fino a 10px di spessore fisico)
- **Bottoni**: flottano di 5px (`translateY(-5px)`); bevel con top highlight al 42%; faccia inferiore colorata (arancione per TRADUCI/TUTOR AI, slate per DETTA); pressione fisica su `:active`
- **Hover sezioni**: lift a -4px + `brightness(1.06)` + bevel potenziato
- **Hover bottoni lingua**: lift a -6px + `brightness(1.14)`
- **Hover bottoni azione**: lift a -8px + `brightness(1.12)`

### Colori sezioni accordion
| Sezione | Colore |
|---|---|
| Impostazioni voce | `#3b82f6` (blu) |
| Shadowing | `#a855f7` (viola) |
| Chat AI / Roleplay | `#fb923c` (arancione) |
| Quiz + Risultato traduzione | `#10b981` (verde) |

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

## Tecnologie

| Categoria | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | Inline styles (React.CSSProperties) + index.css |
| Font | Inter (Google Fonts) |
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

## File principali

| File | Descrizione |
|---|---|
| `src/App.tsx` | Frontend (~2430 righe): UI, state, demo, quiz, bookmark |
| `src/index.css` | Sistema 3D: hover sezioni, `.lang-btn`, `.action-btn`, cursore demo |
| `index.html` | Caricamento font Inter da Google Fonts |

---

## Percorso produzione

`/lingua-ai/` — file statici serviti dall'API server Express

Produzione: `https://web-app-creator--liviomazzocchi.replit.app/lingua-ai/`

---

## Licenza

MIT © limax
