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
      max_tokens: 8192,
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
  const { messages, targetLang, userProfile } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    targetLang: string;
    userProfile?: UserProfile;
  };
  if (!messages || !targetLang) {
    res.status(400).json({ error: "Missing messages or targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  const profileCtx = buildProfileContext(userProfile);
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `You are a friendly ${langName} language tutor helping an Italian speaker practice ${langName}. 
Rules:
- Always respond in ${langName}
- Keep responses short and natural (2-4 sentences)
- If the user makes a grammar mistake, gently correct it at the very end with "💡 Correzione:" followed by the correction in Italian
- Be encouraging and conversational
- Personalize examples and topics based on the user profile when relevant${profileCtx}`,
        },
        ...messages,
      ],
    });
    const reply = completion.choices[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "AI error" });
  }
});

export default router;
