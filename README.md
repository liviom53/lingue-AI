# Lingue & AI

**PWA per italiani che imparano lingue straniere**, con intelligenza artificiale, sintesi vocale, riconoscimento del parlato e molto altro.

🌐 **App live**: [web-app-creator--liviomazzocchi.replit.app/lingua-ai/](https://web-app-creator--liviomazzocchi.replit.app/lingua-ai/)

---

## Funzionalità

### Traduzione
- Italiano → **29+ lingue** tramite istanze pubbliche Lingva (fallback MyMemory)
- **Dettatura vocale** (pulsante DETTA): parla in italiano, il testo appare automaticamente — Chrome, Edge, Safari
- Forma d'onda animata a 5 barre sul pulsante microfono durante la registrazione
- Cache locale per tradurre offline le parole già cercate

### Pronuncia & IPA
- Sintesi vocale nativa con pulsante 🔊, slider velocità e numero di ripetizioni
- Selezione voce tra quelle disponibili sul dispositivo
- **IPA + sillabazione**: trascrizione fonetica internazionale e suddivisione in sillabe generata da AI
- Pronuncia fonetica semplificata (es. "el-LÒ") per le lingue con alfabeto latino

### Grammatica X-Ray
- Tocca qualsiasi parola della traduzione per analizzarla con DeepSeek
- Mostra: parte del discorso, genere/numero, tempo verbale, radice etimologica, curiosità
- Pannello inline direttamente sotto la parola selezionata

### Tutor AI (DeepSeek via OpenRouter)
- Traduzione arricchita: `traduzione · pronuncia · spiegazione grammaticale · frase d'esempio`
- Personalizzata in base al profilo utente (nome, età, livello, occupazione, interessi)

### Chat AI & Roleplay
- Conversazione nella lingua target con correzioni grammaticali inline (💡)
- **Scenari roleplay** (pillole selezionabili, etichette nella lingua scelta):
  - 🍽️ Ristorante · ✈️ Aeroporto · 🏥 Medico · 🏨 Hotel · 💼 Colloquio · 🛒 Supermercato
  - 💬 Conversazione libera
- Modalità conversazione libera o guidata da scenario

### Shadowing
- L'AI genera una frase nella lingua scelta → ascolta → ripeti ad alta voce
- Forma d'onda animata durante la registrazione
- Score di pronuncia parola per parola
- Tecnica usata dai poliglotti per assorbire ritmo e intonazione naturale

### Pratica pronuncia
- Dopo una traduzione premi PRATICA PRONUNCIA
- Il riconoscimento vocale confronta la tua pronuncia con la traduzione corretta
- Punteggio e feedback parola per parola

### Quiz Tatoeba
- Frasi reali scritte da madrelingua, in cache per uso offline
- Modalità a risposta multipla (4 opzioni)

### Segnalibri & Vocabolario
- Salva traduzioni con ⭐ in `localStorage`
- Sezione Vocabolario con filtro e ricerca
- Quiz a 4 opzioni per ripassare le parole salvate

### Accessibilità
- **Modalità ipovedenti**: testo grande, alto contrasto, layout semplificato
- **TalkBack in-app**: descrizioni vocali pensate per screen reader (Android TalkBack / iOS VoiceOver)
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

### PWA & Offline
- Installabile su Android, iOS, desktop
- Service worker con precaching completo (font, Tatoeba, asset)
- Aggiornamento automatico: banner viola con pulsante "Aggiorna" + toast verde di conferma

### Versioning automatico
- Versione generata al deploy dal timestamp (`YYYY.MM.DD.HHMM`)
- Il frontend rileva la nuova versione al ritorno in primo piano e propone il ricaricamento

---

## Stack tecnico

| Layer | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | CSS-in-JS inline (sistema 3D custom) |
| AI | DeepSeek (`deepseek/deepseek-chat`) via OpenRouter |
| Traduzione | Lingva proxy server-side + MyMemory fallback |
| Voce | Web Speech API (sintesi + riconoscimento) |
| IPA | Endpoint AI dedicato `/api/ai/ipa` |
| Backend | Express + Node.js |
| Deploy | Replit VM |
| Monorepo | pnpm workspaces |
| PWA | vite-plugin-pwa (Workbox) |

---

## Struttura

```
artifacts/
  lingua-ai/            → PWA principale          → /lingua-ai/
  diario-pescatore/     → Diario di pesca PWA     → /
  api-server/           → API Express             → /api/*
  lingua-ai-demo-video/ → Video demo animato
```

---

## Avvio locale

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/lingua-ai run dev
```

Variabili d'ambiente necessarie (nel file `.env` dell'api-server):
```
AI_INTEGRATIONS_OPENROUTER_BASE_URL=...
AI_INTEGRATIONS_OPENROUTER_API_KEY=...
```

---

## Donazioni

Se l'app ti è utile, puoi supportare lo sviluppo:

**PostePay** — IBAN: `IT62U3608105138220295220310`  
Intestatario: Mazzocchi Livio

---

## Lingue supportate (29)

Inglese · Spagnolo · Francese · Tedesco · Portoghese · Russo · Cinese · Giapponese · Coreano · Arabo · Hindi · Turco · Olandese · Polacco · Ucraino · Rumeno · Greco · Svedese · Danese · Finlandese · Ceco · Ungherese · Ebraico · Thai · Vietnamita · Indonesiano · Persiano · Catalano · Norvegese
