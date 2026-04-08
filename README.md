# Lingue & AI

**PWA per italiani che imparano lingue straniere**, con intelligenza artificiale, sintesi vocale, riconoscimento del parlato e molto altro.

🌐 **App live**: [web-app-creator--liviomazzocchi.replit.app/lingua-ai/](https://web-app-creator--liviomazzocchi.replit.app/lingua-ai/)

---

## Funzionalità

### Traduzione
- Italiano → **29+ lingue** tramite istanze pubbliche Lingva
- Pronuncia fonetica semplificata (es. "el-LÒ") e IPA
- Cache locale per tradurre offline le parole già cercate

### TUTOR AI (DeepSeek via OpenRouter)
- Traduzione arricchita: `traduzione · pronuncia · spiegazione grammaticale · frase d'esempio`
- Personalizzata in base al profilo utente (nome, età, livello, interessi)

### Conversa con DeepSeek
- Chat nella lingua target con correzioni grammaticali inline
- **Scenari roleplay** (pillole selezionabili, etichette nella lingua scelta):
  - 🍽️ Ristorante · ✈️ Aeroporto · 🏥 Medico · 🏨 Hotel · 💼 Colloquio · 🛒 Supermercato
  - 💬 Conversazione libera
- Modalità conversazione libera o guidata da scenario

### Grammatica X-Ray
- Analisi morfosintattica frase per frase con DeepSeek
- Colori per categoria grammaticale (sostantivo, verbo, aggettivo…)

### Shadowing
- Ascolto + ripetizione per allenare la pronuncia
- Velocità regolabile, pausa automatica

### Riconoscimento vocale & Pratica
- Pronuncia una parola, ricevi un punteggio di somiglianza
- Solo Chrome/Edge (con avviso automatico su altri browser)

### Quiz Tatoeba
- Frasi reali da Tatoeba nella lingua target
- Modalità a risposta multipla

### Segnalibri
- Salva parole e frasi preferite in `localStorage`
- Visualizzazione e rimozione rapida

### Accessibilità
- **Modalità accessibile** (testo grande, alto contrasto)
- **TalkBack in-app**: legge automaticamente ogni traduzione
- **Modalità ipovedenti**: annuncia la traduzione appena arriva

### Profilo utente
- Nome, età, sesso, occupazione, città — passati all'AI per personalizzare gli esempi
- Progressi: livello (Base → Intermedio → Avanzato → Esperto), streak, ore, vocabolario

### PWA & Offline
- Installabile su Android, iOS, desktop
- Service worker con cache estrategia per uso offline

---

## Stack tecnico

| Layer | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | CSS-in-JS inline (sistema 3D custom) |
| AI | DeepSeek (`deepseek/deepseek-chat`) via OpenRouter |
| Traduzione | Lingva (proxy server-side, no CORS) |
| Voce | Web Speech API (sintesi + riconoscimento) |
| Backend | Express + Node.js |
| Deploy | Replit VM |
| Monorepo | pnpm workspaces |

---

## Struttura

```
artifacts/
  lingua-ai/          → PWA principale        → /lingua-ai/
  diario-pescatore/   → Diario di pesca PWA   → /
  api-server/         → API Express            → /api/*
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

## Lingue supportate

Inglese · Spagnolo · Francese · Tedesco · Portoghese · Russo · Cinese · Giapponese · Coreano · Arabo · Hindi · Turco · Olandese · Polacco · Ucraino · Rumeno · Greco · Svedese · Danese · Finlandese · Ceco · Ungherese · Ebraico · Thai · Vietnamita · Indonesiano · Persiano · Catalano · Norvegese
