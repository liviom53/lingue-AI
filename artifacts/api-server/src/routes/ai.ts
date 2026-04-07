import { Router, type Request, type Response } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";

const router = Router();

const MODEL = "deepseek/deepseek-chat";

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
  altro?: string;
}

function buildProfileContext(p?: UserProfile): string {
  if (!p) return "";
  const parts: string[] = [];
  if (p.nome) parts.push(`Nome: ${p.nome}`);
  if (p.eta) parts.push(`Età: ${p.eta}`);
  if (p.sesso) parts.push(`Sesso: ${p.sesso}`);
  if (p.occupazione) parts.push(`Occupazione: ${p.occupazione}`);
  if (p.citta) parts.push(`Città: ${p.citta}`);
  if (p.altro) parts.push(`Note: ${p.altro}`);
  if (parts.length === 0) return "";
  return `\n\nUser profile (use this to personalize your responses — choose relevant vocabulary, examples, and register based on age, profession, city, etc.):\n${parts.join(", ")}`;
}

router.post("/translate", async (req: Request, res: Response) => {
  const { text, targetLang, userProfile } = req.body as {
    text: string;
    targetLang: string;
    userProfile?: UserProfile;
  };
  if (!text || !targetLang) {
    res.status(400).json({ error: "Missing text or targetLang" });
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
          content: `You are a language tutor. Translate Italian text to ${langName} and provide a brief grammar insight.
Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{"translation":"...","pronunciation":"...","explanation":"...","example":"..."}
- translation: the ${langName} translation
- pronunciation: a simplified phonetic spelling of the translation that an Italian speaker can read and roughly pronounce correctly (e.g. for English "Hello" write "el-LÒ", for "Thank you" write "senk-IÙ"). Use Italian phonetic conventions. Capitalize stressed syllables. Keep it short.
- explanation: one short sentence explaining an interesting grammar point or word choice (in Italian). If the user has a known profession or background, relate the example to it when natural.
- example: one short additional example sentence in ${langName} using a key word from the translation${profileCtx}`,
        },
        { role: "user", content: text },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const clean = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "AI error" });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  const { messages, targetLang, userProfile, scenario } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    targetLang: string;
    userProfile?: UserProfile;
    scenario?: string;
  };
  if (!messages || !targetLang) {
    res.status(400).json({ error: "Missing messages or targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  const profileCtx = buildProfileContext(userProfile);

  let systemContent: string;
  if (scenario) {
    systemContent = `You are playing a character in a ${langName} language learning roleplay.
Scenario: ${scenario}
Rules:
- Stay fully in character throughout — you ARE the character in this scenario
- Always speak in ${langName} only (short, natural sentences — 2-3 max)
- If the user makes a grammar or vocabulary mistake, gently correct it at the very end with "💡 Correzione:" followed by the correction in Italian
- Start the conversation with a natural, in-character greeting that sets the scene
- Help the user practice vocabulary and phrases relevant to this real-life situation${profileCtx}`;
  } else {
    systemContent = `You are a friendly ${langName} language tutor helping an Italian speaker practice ${langName}.
Rules:
- Always respond in ${langName}
- Keep responses short and natural (2-4 sentences)
- If the user makes a grammar mistake, gently correct it at the very end with "💡 Correzione:" followed by the correction in Italian
- Be encouraging and conversational
- Personalize examples and topics based on the user profile when relevant${profileCtx}`;
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
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "AI error" });
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
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "AI error" });
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
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "AI error" });
  }
});

// ── Help AI: risponde a domande sull'uso dell'app ────────────────────────────
const APP_HELP_CONTEXT = `Sei l'assistente di supporto dell'app "Lingue & AI", una PWA italiana per imparare lingue straniere.
Funzionalità dell'app:
- Traduzione rapida (Lingva/MyMemory): scrivi in italiano, scegli la lingua, premi "Traduci"
- Traduzione AI (DeepSeek): "Spiega con AI" fornisce traduzione + pronuncia fonetica + spiegazione grammaticale + esempio
- X-Ray grammaticale: clicca qualsiasi parola della traduzione per analisi (parte del discorso, genere, tempo, curiosità)
- Pronuncia & Ascolto: sintesi vocale con 🔊, slider velocità, selezione voce
- Shadowing: ascolta una frase AI, ripetila col microfono, ottieni uno score di pronuncia parola per parola
- Chat AI & Roleplay: conversa con tutor DeepSeek, scenari (bar, hotel, stazione…), correzioni automatiche con 💡
- Segnalibri & Quiz: salva traduzioni con ⭐, poi esercitati con quiz a 4 opzioni
- Profilo personale: nome/età/occupazione personalizzano le risposte AI
- Modalità offline: cache locale delle traduzioni, segnalibri e quiz sempre disponibili
- PWA installabile: funziona come app nativa su telefono
- 29+ lingue supportate: inglese, spagnolo, francese, tedesco, portoghese, russo, cinese, giapponese, coreano, arabo e altre
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
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "AI error" });
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
  } catch (mmErr: any) {
    console.error("MyMemory fallback failed:", mmErr.message);
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
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "AI error" });
  }
});

export default router;
