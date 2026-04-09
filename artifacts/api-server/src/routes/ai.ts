import { Router, type Request, type Response } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";

const router = Router();

const MODEL = "deepseek/deepseek-chat";

function errMsg(err: unknown, fallback = "AI error"): string {
  return err instanceof Error ? err.message : fallback;
}

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  tr: "Turkish",
  nl: "Dutch",
  pl: "Polish",
  uk: "Ukrainian",
  ro: "Romanian",
  el: "Greek",
  sv: "Swedish",
  da: "Danish",
  fi: "Finnish",
  cs: "Czech",
  hu: "Hungarian",
  he: "Hebrew",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  fa: "Persian",
  ca: "Catalan",
  no: "Norwegian",
};

interface UserProfile {
  nome?: string;
  eta?: string;
  sesso?: string;
  occupazione?: string;
  citta?: string;
  studi?: string;
  hobby?: string;
  interessi?: string;
  musica?: string;
  altro?: string;
}

function buildLevelContext(level?: string): string {
  if (!level) return "";
  const map: Record<string, string> = {
    base:       "Principiante (A1-A2): usa vocabolario semplice, frasi brevi e spiegazioni elementari, adatte a chi inizia da zero.",
    intermedio: "Intermedio (B1-B2): usa vocabolario intermedio, frasi di media complessità, spiegazioni chiare ma non banali.",
    avanzato:   "Avanzato (C1-C2): usa vocabolario ricco e strutture grammaticali complesse, spiegazioni approfondite e sfumature linguistiche.",
  };
  const desc = map[level];
  if (!desc) return "";
  return `\n\nLivello dell'utente: ${desc} Adatta tono, complessità e scelta lessicale di conseguenza.`;
}

function buildProfileContext(p?: UserProfile): string {
  if (!p) return "";
  const parts: string[] = [];
  if (p.nome) parts.push(`Nome: ${p.nome}`);
  if (p.eta) parts.push(`Età: ${p.eta}`);
  if (p.sesso) parts.push(`Sesso: ${p.sesso}`);
  if (p.occupazione) parts.push(`Occupazione: ${p.occupazione}`);
  if (p.citta) parts.push(`Città: ${p.citta}`);
  if (p.studi) parts.push(`Studi: ${p.studi}`);
  if (p.hobby) parts.push(`Hobby: ${p.hobby}`);
  if (p.interessi) parts.push(`Interessi: ${p.interessi}`);
  if (p.musica) parts.push(`Musica preferita: ${p.musica}`);
  if (p.altro) parts.push(`Note: ${p.altro}`);
  if (parts.length === 0) return "";
  return `\n\nProfilo utente (usa questi dati per personalizzare le risposte — scegli vocabolario, esempi e registro in base a età, professione, interessi, studi, musica, ecc.):\n${parts.join("; ")}`;
}

router.post("/translate", async (req: Request, res: Response) => {
  const { text, targetLang, userProfile, level } = req.body as {
    text: string;
    targetLang: string;
    userProfile?: UserProfile;
    level?: string;
  };
  if (!text || !targetLang) {
    res.status(400).json({ error: "Missing text or targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  const profileCtx = buildProfileContext(userProfile);
  const levelCtx = buildLevelContext(level);
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a language tutor. Translate Italian text to ${langName} and provide a brief grammar insight.
Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{"translation":"...","pronunciation":"...","explanation":"...","example":"..."}
- translation: the ${langName} translation
- pronunciation: a simplified phonetic spelling of the translation that an Italian speaker can read and roughly pronounce correctly (e.g. for English "Hello" write "el-LÒ", for "Thank you" write "senk-IÙ"). Use Italian phonetic conventions. Capitalize stressed syllables. Keep it short.
- explanation: one short sentence explaining an interesting grammar point or word choice (in Italian). If the user has a known profession or background, relate the example to it when natural.
- example: one short additional example sentence in ${langName} using a key word from the translation${profileCtx}${levelCtx}`,
        },
        { role: "user", content: text },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const clean = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err: unknown) {
    res.status(500).json({ error: errMsg(err) });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  const { messages, targetLang, userProfile, scenario, level } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    targetLang: string;
    userProfile?: UserProfile;
    scenario?: string;
    level?: string;
  };
  if (!messages || !targetLang) {
    res.status(400).json({ error: "Missing messages or targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  const profileCtx = buildProfileContext(userProfile);
  const levelCtx = buildLevelContext(level);

  let systemContent: string;
  if (scenario) {
    systemContent = `You are playing a character in a ${langName} language learning roleplay.
Scenario: ${scenario}
Rules:
- Stay fully in character throughout — you ARE the character in this scenario
- Always speak in ${langName} only (short, natural sentences — 2-3 max)
- If the user makes a grammar or vocabulary mistake, gently correct it at the very end with "💡 Correzione:" followed by the correction in Italian
- Start the conversation with a natural, in-character greeting that sets the scene
- Help the user practice vocabulary and phrases relevant to this real-life situation${profileCtx}${levelCtx}`;
  } else {
    systemContent = `You are a friendly ${langName} language tutor helping an Italian speaker practice ${langName}.
Rules:
- Always respond in ${langName}
- Keep responses short and natural (2-4 sentences)
- If the user makes a grammar mistake, gently correct it at the very end with "💡 Correzione:" followed by the correction in Italian
- Be encouraging and conversational
- Personalize examples and topics based on the user profile when relevant${profileCtx}${levelCtx}`;
  }

  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
    });
    const reply = completion.choices[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (err: unknown) {
    res.status(500).json({ error: errMsg(err) });
  }
});

router.post("/grammar", async (req: Request, res: Response) => {
  const { word, sentence, targetLang } = req.body as {
    word: string;
    sentence: string;
    targetLang: string;
  };
  if (!word || !targetLang) {
    res.status(400).json({ error: "Missing word or targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a grammar expert. Analyze the given word within its ${langName} sentence context.
Respond ONLY with valid JSON (no markdown, no extra text):
{"pos":"...","gender":"...","tense":"...","info":"..."}
- pos: part of speech in Italian (e.g. "sostantivo", "verbo", "aggettivo", "avverbio", "preposizione", "articolo", "pronome")
- gender: grammatical gender in Italian if applicable (e.g. "maschile", "femminile", "neutro", or "—" if not applicable)
- tense: verb tense in Italian if it is a verb (e.g. "presente", "passato prossimo", "futuro", or "—" if not a verb)
- info: one short, useful note in Italian about this word — etymology, common usage, pitfall, or interesting fact. Max 20 words.`,
        },
        {
          role: "user",
          content: `Word: "${word}"\nSentence: "${sentence ?? word}"`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const clean = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    res.json(JSON.parse(clean));
  } catch (err: unknown) {
    res.status(500).json({ error: errMsg(err) });
  }
});

router.post("/shadow", async (req: Request, res: Response) => {
  const { targetLang, userProfile } = req.body as {
    targetLang: string;
    userProfile?: UserProfile;
  };
  if (!targetLang) {
    res.status(400).json({ error: "Missing targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  const profileCtx = buildProfileContext(userProfile);
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You generate short practice phrases for language shadowing exercises.
Respond ONLY with valid JSON (no markdown):
{"phrase":"...","phonetic":"...","translation":"..."}
- phrase: a natural, everyday ${langName} sentence of 5-10 words. Use common vocabulary. Vary the topic each time.
- phonetic: simplified phonetic spelling using Italian phonetic conventions so an Italian can roughly pronounce it. Capitalize stressed syllables.
- translation: the Italian translation of the phrase.${profileCtx}`,
        },
        { role: "user", content: "Generate a new shadowing phrase." },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const clean = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    res.json(JSON.parse(clean));
  } catch (err: unknown) {
    res.status(500).json({ error: errMsg(err) });
  }
});

// ── Help AI: risponde a domande sull'uso dell'app ────────────────────────────
const APP_HELP_CONTEXT = `Sei l'assistente di supporto dell'app "Lingue & AI", una PWA italiana per imparare lingue straniere.
Funzionalità dell'app:
- Traduzione rapida (Lingva/MyMemory): scrivi in italiano, scegli la lingua di destinazione tra 29+ lingue, premi "Traduci"
- Traduzione AI (DeepSeek): "Spiega con AI" fornisce traduzione contestualizzata + pronuncia fonetica + spiegazione grammaticale + esempio d'uso
- Dettatura vocale (DETTA): premi "DETTA" per parlare in italiano e trascrivere la voce nel campo di testo (Chrome/Edge/Safari); durante la registrazione il pulsante mostra una forma d'onda animata a 5 barre
- X-Ray grammaticale: tocca qualsiasi parola della traduzione per analisi AI (parte del discorso, genere/numero, tempo verbale, etimologia, curiosità)
- Pronuncia & IPA: sintesi vocale con 🔊, slider velocità (lento/veloce), numero ripetizioni, selezione voce; pulsante "IPA + sillabazione" per trascrizione fonetica internazionale
- Pratica pronuncia: premi "PRATICA PRONUNCIA" dopo una traduzione, pronuncia la frase in lingua straniera, ricevi punteggio parola per parola con forma d'onda animata durante la registrazione
- Shadowing: ascolta una frase generata dall'AI, ripetila col microfono (forma d'onda attiva), ottieni uno score di accuratezza; tecnica usata dai poliglotti per assorbire ritmo e intonazione
- Chat AI & Roleplay: conversa con tutor madrelingua DeepSeek; scegli scenario (bar, hotel, stazione, medico, supermercato…) o "Conversazione libera"; il tutor corregge errori con 💡
- Segnalibri & Quiz vocabolario: salva traduzioni con ⭐, rivedi nella sezione Vocabolario, esercitati con quiz a 4 opzioni a risposta multipla
- Quiz Tatoeba: frasi reali di madrelingua, indovina la traduzione mancante tra 4 opzioni; funziona anche offline dopo il primo caricamento
- Profilo personale: inserisci nome, età, livello di lingua, occupazione, città, interessi — l'AI personalizza esempi e spiegazioni in base al tuo profilo
- Accessibilità: "Modalità ipovedenti" (testo grande, alto contrasto); "TalkBack in-app" (descrizioni vocali per screen reader); icone decorative nascoste ai lettori di schermo
- Offline & Aggiornamenti: tutte le traduzioni già cercate, font, quiz Tatoeba e pronuncia funzionano offline; banner viola per nuove versioni con pulsante "Aggiorna"; toast verde di conferma post-aggiornamento
- PWA installabile: pulsante "Installa" per usare l'app come app nativa senza browser
- 29+ lingue supportate: inglese, spagnolo, francese, tedesco, portoghese, russo, cinese, giapponese, coreano, arabo, olandese, polacco, turco, svedese, greco, ebraico, vietnamita, thai, hindi, ceco, rumeno e altre
Rispondi in italiano, in modo conciso e pratico (max 4 frasi). Spiega solo le funzioni pertinenti alla domanda.`;

router.post("/app-help", async (req: Request, res: Response) => {
  const { query } = req.body as { query: string };
  if (!query?.trim()) {
    res.status(400).json({ error: "Missing query" });
    return;
  }
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: APP_HELP_CONTEXT },
        { role: "user", content: query },
      ],
    });
    const answer = completion.choices[0]?.message?.content ?? "";
    res.json({ answer });
  } catch (err: unknown) {
    res.status(500).json({ error: errMsg(err) });
  }
});

// ── Traduzione proxy: Lingva (parallelo, race) → MyMemory (fallback) ────────
const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://lingva.garudalinux.org',
  'https://translate.plausibility.cloud',
];

const LINGVA_TIMEOUT_MS = 4000;

/** Prova una singola istanza Lingva con timeout */
async function tryLingva(
  instance: string,
  encoded: string,
  targetLang: string,
): Promise<{ translation: string; pronunciation: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINGVA_TIMEOUT_MS);
  try {
    const r = await fetch(
      `${instance}/api/v1/it/${targetLang}/${encoded}`,
      { signal: controller.signal },
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json() as any;
    if (!data.translation) throw new Error("No translation in response");
    return {
      translation: data.translation,
      pronunciation: data.info?.pronunciation?.translation ?? null,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** MyMemory — fallback gratuito e stabile, nessuna chiave richiesta */
async function tryMyMemory(
  text: string,
  targetLang: string,
): Promise<{ translation: string; pronunciation: null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=it|${targetLang}`;
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) throw new Error(`MyMemory HTTP ${r.status}`);
    const data = await r.json() as any;
    const translated: string = data?.responseData?.translatedText;
    if (!translated || translated.toUpperCase() === text.toUpperCase()) {
      throw new Error("MyMemory returned no meaningful translation");
    }
    return { translation: translated, pronunciation: null };
  } finally {
    clearTimeout(timer);
  }
}

router.post("/lingva", async (req: Request, res: Response) => {
  const { text, targetLang } = req.body as { text: string; targetLang: string };
  if (!text || !targetLang) {
    res.status(400).json({ error: "Missing text or targetLang" });
    return;
  }
  const encoded = encodeURIComponent(text);

  // 1️⃣ Prova tutte le istanze Lingva in parallelo — vince la più veloce
  const lingvaResults = await Promise.allSettled(
    LINGVA_INSTANCES.map(inst => tryLingva(inst, encoded, targetLang))
  );
  for (const r of lingvaResults) {
    if (r.status === "fulfilled") {
      res.json(r.value);
      return;
    }
  }

  // 2️⃣ Fallback: MyMemory (affidabile, gratuito, senza chiave)
  try {
    const result = await tryMyMemory(text, targetLang);
    res.json(result);
    return;
  } catch (mmErr: unknown) {
    console.error("MyMemory fallback failed:", errMsg(mmErr));
  }

  // 3️⃣ Tutti i provider falliti
  res.status(502).json({
    error: "Nessun servizio di traduzione raggiungibile. Riprova tra qualche secondo.",
  });
});

router.post("/ipa", async (req: Request, res: Response) => {
  const { text, targetLang } = req.body as { text: string; targetLang: string };
  if (!text || !targetLang) {
    res.status(400).json({ error: "Missing text or targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a phonetics expert. Given a ${langName} phrase, respond ONLY with valid JSON (no markdown, no extra text):
{"ipa":"...","syllables":"..."}
- ipa: the IPA transcription using standard IPA symbols, enclosed in /forward slashes/
- syllables: the phrase split into syllables with a middle dot · between them (e.g. "hel·lo wor·ld")`,
        },
        { role: "user", content: text },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const clean = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    res.json(JSON.parse(clean));
  } catch (err: unknown) {
    res.status(500).json({ error: errMsg(err) });
  }
});

// ── Tatoeba quiz: frasi reali IT→targetLang, 4 opzioni ──────────────────────
const TATOEBA_LANG: Record<string, string> = {
  en: 'eng', es: 'spa', fr: 'fra', de: 'deu', pt: 'por',
  ru: 'rus', zh: 'cmn', ja: 'jpn', ko: 'kor', ar: 'ara',
  hi: 'hin', tr: 'tur', nl: 'nld', pl: 'pol', uk: 'ukr',
  ro: 'ron', el: 'ell', sv: 'swe', da: 'dan', fi: 'fin',
  cs: 'ces', hu: 'hun', he: 'heb', th: 'tha', vi: 'vie',
  id: 'ind', fa: 'fas', ca: 'cat', no: 'nor',
};

router.get('/tatoeba-quiz', async (req: Request, res: Response) => {
  const targetLang = (req.query.targetLang as string ?? '').trim();
  const tCode = TATOEBA_LANG[targetLang];
  if (!tCode) {
    res.status(400).json({ error: `Lingua non supportata: ${targetLang}` });
    return;
  }
  try {
    const seed = Math.floor(Math.random() * 9999);
    const url = `https://tatoeba.org/en/api_v0/search?from=ita&to=${tCode}&sort=random&rand_seed=${seed}&limit=14&trans_filter=limit`;
    const r = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'LingueAI/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`Tatoeba HTTP ${r.status}`);
    const data = await r.json() as any;

    const pairs: { it: string; tr: string }[] = [];
    for (const result of (data.results ?? [])) {
      if (!result.text) continue;
      // translations[0] = dirette, translations[1] = indirette — accetta entrambe
      const direct: any[] = result.translations?.[0] ?? [];
      const indirect: any[] = result.translations?.[1] ?? [];
      const first = (direct[0] ?? indirect[0]);
      const trText: string | undefined = first?.text;
      if (!trText) continue;
      pairs.push({ it: result.text.trim(), tr: trText.trim() });
      if (pairs.length >= 10) break;
    }

    if (pairs.length < 4) {
      res.status(503).json({ error: 'Poche frasi disponibili su Tatoeba per questa lingua. Riprova.' });
      return;
    }

    res.json({ questions: pairs });
  } catch (err: unknown) {
    res.status(502).json({ error: errMsg(err, "Errore Tatoeba") });
  }
});

// ── /api/ai/variants ─────────────────────────────────────────────────────────
router.post("/variants", async (req: Request, res: Response) => {
  const { text, translation, targetLang } = req.body as {
    text?: string; translation?: string; targetLang?: string;
  };
  if (!text || !translation || !targetLang) {
    res.status(400).json({ error: "Parametri mancanti" });
    return;
  }
  const lang = LANG_NAMES[targetLang] ?? targetLang;
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: `Sei un esperto di linguistica. L'utente ha tradotto una frase dall'italiano in ${lang}. Fornisci 2-3 varianti alternative della traduzione (es. formale, informale, colloquiale) in formato JSON. Rispondi SOLO con JSON valido, nessun testo extra.`,
        },
        {
          role: "user",
          content: `Italiano: "${text}"\nTraduzione base in ${lang}: "${translation}"\n\nFornisci 2-3 varianti. Formato: { "variants": [{ "label": "Formale", "text": "..." }, { "label": "Informale", "text": "..." }] }`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { variants: [] };
    res.json(parsed);
  } catch (err: unknown) {
    res.status(502).json({ error: errMsg(err, "Errore varianti") });
  }
});

// ── Diario del Pescatore — chat AI ──────────────────────────────────────────
router.post("/diario", async (req: Request, res: Response) => {
  const { messages } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
  };
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Missing messages" });
    return;
  }
  const systemContent =
    "Sei un esperto pescatore del Canale Fiume Portatore e della foce di Porto Badino (costa laziale, Mar Tirreno). " +
    "Solo pesca da terra. Conosci perfettamente il canale, le specie locali (spigola, cefalo, muggine, anguilla, " +
    "granchio blu, orata, leccia, ombrina, mormora), le tecniche (surfcasting, feeder, spinning, bolognese, fondo notturno). " +
    "Puoi anche aiutare a registrare dati nel diario se l'utente te lo chiede. " +
    "Rispondi SEMPRE in italiano, in modo breve (max 5 righe), pratico e amichevole.";
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
    });
    const reply =
      completion.choices[0]?.message?.content ?? "Nessuna risposta ricevuta.";
    res.json({ reply });
  } catch (err: unknown) {
    res.status(500).json({ error: errMsg(err, "Errore AI") });
  }
});

export default router;
