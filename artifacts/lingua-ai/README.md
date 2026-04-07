# Lingue & AI

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![PWA](https://img.shields.io/badge/PWA-ready-orange)

> PWA per imparare le lingue straniere partendo dall'italiano, con traduzione AI, shadowing, roleplay, grammatica X-Ray, segnalibri, quiz Tatoeba, profilo personalizzato, sezione donazioni e supporto offline completo.

Produzione: `https://web-app-creator--liviomazzocchi.replit.app/lingua-ai/`

---

## Funzionalità

### Traduzione
- Traduzione **italiano → 29+ lingue** tramite istanze pubbliche Lingva (richieste parallele con timeout 4s)
- Fallback automatico su **MyMemory API** (gratuita, senza chiave) se Lingva non risponde
- 5 lingue rapide (Inglese, Spagnolo, Francese, Tedesco, Portoghese) + dropdown "Altre lingue"
- Flag reali da `flagcdn.com`

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
- Compatibile con Android Chrome PWA (riconoscimento vocale diretto senza double-acquisition)

### Voce
- Sintesi vocale con selezione voce e velocità regolabile
- IPA per inglese via `dictionaryapi.dev`; fonetica Lingva per altre lingue
- Pratica pronuncia con riconoscimento vocale (Chrome/Edge) e score parola per parola
- Dettatura italiana nel campo di testo principale con feedback errori visibile

### Quiz Tatoeba
- Frasi reali da `tatoeba.org` nella lingua selezionata
- 4 opzioni di risposta con feedback immediato

### Segnalibri
- Salva parole/frasi con un tocco (`lingua_ai_bookmarks`)
- Quiz veloce sulle parole salvate

### Profilo utente
- Campi facoltativi: Nome, Età, Sesso, Occupazione, Città
- Campi avanzati: Studi, Hobby, Interessi (chip blu), Musica preferita (chip viola), Note libere
- Salvato in `localStorage` (`lingua_ai_profile`)
- Inviato a DeepSeek per personalizzare esempi e registro linguistico
- Popup di benvenuto alla prima apertura (ignorabile con "Non ora")

### Progressi
- Tracciamento automatico: minuti totali, streak giorni, conteggio traduzioni, parole imparate, tentativi pronuncia
- Livelli: Base → Intermedio → Avanzato → Esperto
- Consigli personalizzati in base all'utilizzo

### Donazioni
- Sezione collassabile "☕ Supporta il progetto" con bottoni PayPal e Ko-fi
- Chiusa per default

### Demo & Aiuto
- 4 script demo con cursore animato, narrazione in italiano e scroll automatico
- Guida rapida con sezioni filtrabili per testo (highlight risultati)
- **"🔍 Cerca"**: filtra le sezioni della guida in tempo reale
- **"🤖 Chiedi AI"**: risposta personalizzata da DeepSeek sull'uso dell'app

### Modalità offline
- Cache traduzioni in `localStorage` (`lingua_ai_translation_cache`, max 40 voci)
- Service Worker via `vite-plugin-pwa` (Workbox): Stale-While-Revalidate per statici, Network-first per API, Cache-first per font
- Banner offline + badge "💾 Da cache offline" sul risultato
- Banner aggiornamento PWA con pulsante "Aggiorna"

---

## Interfaccia

### Layout
```
Header (logo + titolo + sottotitolo arancione)
🇮🇹 ▶ Demo & Aiuto            [accordion]
Selettore lingua (5 fissi + Altre lingue)
Textarea "Scrivi o detta in Italiano..."
🎙 DETTA  |  ✈ TRADUCI  |  🧳 TUTOR AI
⚙️  Impostazioni voce          [collassabile]
🔁  Shadowing                  [collassabile]
💬  Conversa con DeepSeek AI   [collassabile]
📚  Quiz Tatoeba               [collassabile]
──────────────────────────────────────────────
Tab: 👤 Profilo · 📊 Progressi
☕  Supporta il progetto        [collassabile]
```

### Sistema 3D visivo
L'intera UI usa un sistema visivo a tre dimensioni basato su `box-shadow` a strati zero-blur:

- **Sfondo**: tre radial-gradient sovrapposti (`#183060`, `#1c0d44`, `#0d2a1a`) su `#080e1c`
- **Carte**: gradiente `140deg` da `#3d5f82` (alto-sinistra) a `#0e1620` (basso-destra); bevel completo con fasce luminose/scure su tutti e 4 i bordi; faccia inferiore a 5 strati (fino a 10px di spessore fisico)
- **Bottoni**: flottano di 5px (`translateY(-5px)`); bevel con top highlight al 42%; faccia inferiore colorata; pressione fisica su `:active`
- **Hover sezioni**: lift a -4px + `brightness(1.06)` + bevel potenziato

### Colori sezioni accordion
| Sezione | Colore |
|---|---|
| Impostazioni voce | `#3b82f6` (blu) |
| Shadowing | `#a855f7` (viola) |
| Chat AI / Roleplay | `#fb923c` (arancione) |
| Quiz Tatoeba | `#6366f1` (indigo) |
| Profilo | `#60a5fa` (celeste) |
| Donazioni | `#f59e0b` (ambra) |

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
| Frontend | React 19 + TypeScript + Vite 7 |
| Styling | Inline styles (React.CSSProperties) + index.css |
| Font | Inter (Google Fonts) |
| AI | DeepSeek (`deepseek/deepseek-chat`) via OpenRouter |
| Traduzione | Lingva API (parallela) + MyMemory fallback |
| Voce | Web Speech API (sintesi + riconoscimento) |
| Quiz | Tatoeba API (`tatoeba.org/en/api_v0`) |
| PWA | `vite-plugin-pwa` + Workbox (Service Worker) |
| Persistenza | localStorage (6 chiavi) |
| Deploy | Express + file statici |

---

## localStorage

| Chiave | Contenuto |
|---|---|
| `lingua_ai_profile` | Profilo utente (nome, età, occupazione, interessi, ecc.) |
| `lingua_ai_progress` | Progressi (streak, minuti, traduzioni, ecc.) |
| `lingua_ai_bookmarks` | Segnalibri salvati |
| `lingua_ai_translation_cache` | Cache traduzioni offline (max 40 voci) |
| `pwa_install_dismissed` | Stato banner installazione PWA |
| `profile_popup_dismissed` | Stato popup benvenuto profilo |

---

## Variabili d'ambiente (server)

| Variabile | Descrizione |
|---|---|
| `AI_INTEGRATIONS_OPENROUTER_BASE_URL` | URL base OpenRouter |
| `AI_INTEGRATIONS_OPENROUTER_API_KEY` | Chiave API OpenRouter |

---

## Endpoint API principali

| Metodo | Percorso | Descrizione |
|---|---|---|
| `POST` | `/api/ai/translate` | Traduzione AI con fonetica e grammatica |
| `POST` | `/api/ai/chat` | Chat libera / roleplay |
| `POST` | `/api/ai/shadowing` | Genera frase per shadowing |
| `POST` | `/api/ai/grammar-xray` | Analisi grammaticale parola |
| `POST` | `/api/ai/ipa` | IPA e sillabazione |
| `POST` | `/api/ai/app-help` | Risposta AI su funzionalità dell'app |
| `GET` | `/api/ai/lingva` | Proxy Lingva + fallback MyMemory |

---

## File principali

| File | Descrizione |
|---|---|
| `src/App.tsx` | Frontend (~3100 righe): UI, state, offline, demo, quiz, bookmark, profilo, donazioni |
| `src/styles.ts` | Oggetto `styles` con CSS custom property tokens |
| `src/index.css` | Stili globali + `:root` CSS custom properties |
| `src/vite-env.d.ts` | Dichiarazioni tipo per `virtual:pwa-register/react` |
| `vite.config.ts` | Config Vite + VitePWA (Workbox strategies) |
| `index.html` | Caricamento font Inter da Google Fonts |

---

## Licenza

MIT © limax
