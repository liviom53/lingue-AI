# Lingue & AI

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![PWA](https://img.shields.io/badge/PWA-ready-orange)

> PWA per italiani che imparano lingue straniere: traduzione in 29 lingue, pronuncia realistica, shadowing, roleplay AI, grammatica X-Ray, segnalibri, quiz Tatoeba, profilo personalizzato e supporto offline completo.

Produzione: `https://web-app-creator--liviomazzocchi.replit.app/lingua-ai/`

---

## Funzionalità

### Traduzione
- Italiano → **29 lingue** tramite istanze Lingva in parallelo (timeout 4s) con fallback automatico **MyMemory API**
- **Dettatura vocale** (pulsante DETTA): parla in italiano, il testo appare automaticamente — Chrome, Edge, Safari
- Forma d'onda animata a 5 barre sul microfono durante la registrazione
- Cache locale (`lingua_ai_translation_cache`, max 40 voci) per tradurre offline le parole già cercate
- Indicatore "💾 Da cache" quando la risposta arriva dalla memoria locale

### Pronuncia & IPA
- Sintesi vocale nativa con pulsante 🔊, velocità regolabile e numero di ripetizioni
- **🐢 Tartaruga**: riproduce la traduzione a 0.4x per analizzare fonemi difficili
- Selezione voce tra quelle disponibili sul dispositivo
- **IPA + sillabazione**: trascrizione fonetica internazionale generata da AI
- Pronuncia fonetica semplificata (es. "el-LÒ") per le lingue con alfabeto latino

### Varianti di traduzione
- Pulsante **🔀 Mostra varianti**: genera 2-3 alternative (Formale / Informale / Colloquiale) via DeepSeek
- Ogni variante ha un pulsante 🔊 per ascoltarla direttamente

### Grammatica X-Ray
- Tocca qualsiasi parola della traduzione per analizzarla con DeepSeek
- Mostra: parte del discorso, genere/numero, tempo verbale, radice etimologica, curiosità
- Pannello inline direttamente sotto la parola selezionata

### Tutor AI (DeepSeek via OpenRouter)
- Traduzione arricchita: `traduzione · pronuncia · spiegazione grammaticale · frase d'esempio`
- Personalizzata in base al profilo utente (nome, età, livello, occupazione, interessi)

### Chat AI & Roleplay
- Interfaccia a **bolle di chat** con avatar, timestamp HH:MM, pulsante copia e contatore messaggi
- Conversazione nella lingua target con correzioni grammaticali inline (💡)
- **Dettatura in chat** (pulsante DETTA): parla nella lingua selezionata, non in italiano
- **Scenari roleplay**: 🍽️ Ristorante · ✈️ Aeroporto · 🏥 Medico · 🏨 Hotel · 💼 Colloquio · 🛒 Supermercato · 💬 Libera

### Shadowing
- L'AI genera una frase naturale → ascolta → ripeti ad alta voce → score
- Forma d'onda animata durante la registrazione
- Tecnica usata dai poliglotti per assorbire ritmo e intonazione naturale

### Pratica pronuncia
- Dopo una traduzione premi PRATICA PRONUNCIA
- Il riconoscimento vocale confronta la tua pronuncia con la traduzione corretta
- Punteggio e feedback parola per parola
- Funziona nella lingua selezionata (tedesco, giapponese, spagnolo, ecc.) — non solo in inglese
- Richiede Chrome o Edge; su altri browser la funzione potrebbe non essere disponibile

### Feedback aptico
- Vibrazione breve (50ms) all'avvio del microfono — "sto ascoltando"
- Doppia vibrazione (30-50-30ms) al completamento — "risultato ricevuto"
- Vibrazione singola (100ms) in caso di errore
- Attivo su Android/Chrome; ignorato silenziosamente su iOS e desktop

### Quiz Tatoeba
- Frasi reali scritte da madrelingua, in cache per uso offline
- Modalità a risposta multipla (4 opzioni)

### Segnalibri & Vocabolario
- Salva traduzioni con ⭐ in `localStorage`
- Sezione Vocabolario con filtro e ricerca
- Quiz a 4 opzioni per ripassare le parole salvate

### Accessibilità
- **Modalità ipovedenti**: testo grande, alto contrasto, layout semplificato, traduzione automatica dopo dettatura
- **TalkBack in-app**: descrizioni vocali per screen reader (Android TalkBack / iOS VoiceOver)
- **Modalità accessibile**: riduce animazioni, aumenta leggibilità
- Tutte le icone decorative nascoste agli screen reader (`aria-hidden="true"`)

### Profilo utente
- Nome, età, sesso, livello di lingua, occupazione, città, interessi
- Passati all'AI per personalizzare esempi e spiegazioni
- Progressi: livello (Base → Intermedio → Avanzato → Esperto), streak, ore, vocabolario, calendario

### Demo interattive (5)
- **Demo 1 — Traduzione & X-Ray**: digita → traduci → analisi grammaticale parola per parola
- **Demo 2 — Pronuncia & IPA**: traduci → audio nativo → IPA + sillabazione
- **Demo 3 — Shadowing**: frase AI → ascolta → ripeti → score
- **Demo 4 — Chat AI & Roleplay**: traduci → apre tutor AI → scenari roleplay
- **Demo 5 — Segnalibri & Vocabolario**: traduci → salva ⭐ → apre tab vocabolario
- Cursore animato che segue ogni azione, narrazione italiana in sintesi vocale, barra di progresso step
- La finestra si chiude automaticamente al termine della demo

### Palloncino ☕ "Sostieni il progetto"
- Appare automaticamente dopo 20 secondi dall'apertura dell'app, fluttua sullo schermo con moto sinusoidale
- Visibile per 12 secondi, poi scompare per 35 secondi — ciclo continuo finché l'utente non interagisce
- Al click: scorre alla sezione **☕ Supporta il progetto** e la apre, poi si nasconde per 15 minuti prima di riprendere il ciclo
- Movimento gestito via RAF direttamente sul DOM (nessun re-render React); visibilità tramite CSS `@keyframes balloonShow` (67s ciclo)

### PWA & Offline
- Installabile su Android, iOS, desktop
- Service worker con precaching completo (font, Tatoeba, asset)
- Aggiornamento automatico: banner viola con pulsante "Aggiorna" + toast verde di conferma
- Versione generata dal timestamp di avvio (`YYYY.MM.DD.HHMM`)

---

## Privacy

| Dato | Come viene usato |
|---|---|
| Profilo utente | Salvato solo in `localStorage`, mai trasmesso a terzi |
| Testi tradotti / chat | Inviati a DeepSeek via OpenRouter solo per generare la risposta |
| Lingva API | Nessun tracciamento, nessuna chiave richiesta |
| Web Speech API | Elaborazione vocale su server Google (Chrome/Edge) — nessun audio salvato dall'app |
| Cookie | Nessun cookie di profilazione o analytics |

---

## Stack tecnico

| Layer | Tecnologia |
|---|---|
| Frontend | React 19 + Vite 7 + TypeScript |
| Styling | CSS-in-JS inline (sistema 3D custom) + index.css |
| AI | DeepSeek (`deepseek/deepseek-chat`) via OpenRouter |
| Traduzione | Lingva proxy server-side (parallelo) + MyMemory fallback |
| Voce | Web Speech API (sintesi + riconoscimento) |
| IPA | Endpoint AI dedicato `/api/ai/ipa` |
| Backend | Express + Node.js |
| Deploy | Replit VM |
| Monorepo | pnpm workspaces |
| PWA | vite-plugin-pwa (Workbox) |

---

## Layout

```
Header (logo + titolo + sottotitolo arancione)
🇮🇹 ▶ Demo & Aiuto              [accordion — 5 demo]
Selettore lingua (5 fissi + Altre 24 lingue)
Textarea "Scrivi o detta in Italiano..."
🎙 DETTA  |  ✈ TRADUCI  |  🧳 TUTOR AI
⚙️  Impostazioni voce            [collassabile]
🔁  Shadowing                    [collassabile]
💬  Conversa con DeepSeek AI     [collassabile]
📚  Quiz Tatoeba                 [collassabile]
──────────────────────────────────────────────
Tab: 👤 Profilo · 📊 Progressi · 📖 Vocabolario
☕  Supporta il progetto          [collassabile]
```

---

## Colori sezioni accordion

| Sezione | Colore |
|---|---|
| Impostazioni voce | `#3b82f6` (blu) |
| Shadowing | `#a855f7` (viola) |
| Chat AI / Roleplay | `#fb923c` (arancione) |
| Quiz Tatoeba | `#6366f1` (indigo) |
| Profilo | `#60a5fa` (celeste) |
| Donazioni | `#f59e0b` (ambra) |

---

## localStorage

| Chiave | Contenuto |
|---|---|
| `lingua_ai_profile` | Profilo utente |
| `lingua_ai_progress` | Progressi (streak, minuti, traduzioni, ecc.) |
| `lingua_ai_bookmarks` | Segnalibri salvati |
| `lingua_ai_translation_cache` | Cache traduzioni offline (max 40 voci) |
| `pwa_install_dismissed_ts` | Stato banner installazione PWA |
| `profile_popup_dismissed` | Stato popup benvenuto profilo |
| `modalita_accessibile` | Modalità accessibile attiva |
| `talkback_inapp` | TalkBack in-app attivo |
| `modalita_ipovedenti` | Modalità ipovedenti attiva |

---

## Endpoint API principali

| Metodo | Percorso | Descrizione |
|---|---|---|
| `POST` | `/api/ai/translate` | Traduzione AI con fonetica e grammatica |
| `POST` | `/api/ai/chat` | Chat libera / roleplay |
| `POST` | `/api/ai/shadowing` | Genera frase per shadowing |
| `POST` | `/api/ai/grammar-xray` | Analisi grammaticale parola |
| `POST` | `/api/ai/ipa` | IPA e sillabazione |
| `POST` | `/api/ai/variants` | Varianti formale/informale/colloquiale |
| `POST` | `/api/ai/app-help` | Risposta AI su funzionalità dell'app |
| `POST` | `/api/ai/lingva` | Proxy Lingva + fallback MyMemory |
| `GET` | `/api/version` | Versione corrente (timestamp avvio server) |

---

## Avvio locale

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/lingua-ai run dev
```

Variabili d'ambiente (file `.env` in `artifacts/api-server/`):

```bash
AI_INTEGRATIONS_OPENROUTER_BASE_URL=...
AI_INTEGRATIONS_OPENROUTER_API_KEY=...
```

---

## Donazioni

**PostePay** — IBAN: `IT62U3608105138220295220310`
Intestatario: Mazzocchi Livio

---

## Lingue supportate (29)

Inglese · Spagnolo · Francese · Tedesco · Portoghese · Russo · Cinese · Giapponese · Coreano · Arabo · Hindi · Turco · Olandese · Polacco · Ucraino · Rumeno · Greco · Svedese · Danese · Finlandese · Ceco · Ungherese · Ebraico · Thai · Vietnamita · Indonesiano · Persiano · Catalano · Norvegese

---

## Licenza

MIT © Livio Mazzocchi
