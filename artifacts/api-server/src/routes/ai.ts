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
};

router.post("/translate", async (req: Request, res: Response) => {
  const { text, targetLang } = req.body as { text: string; targetLang: string };
  if (!text || !targetLang) {
    res.status(400).json({ error: "Missing text or targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `You are a language tutor. Translate Italian text to ${langName} and provide a brief grammar insight.
Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{"translation":"...","explanation":"...","example":"..."}
- translation: the ${langName} translation
- explanation: one short sentence explaining an interesting grammar point or word choice (in Italian)
- example: one short additional example sentence in ${langName} using a key word from the translation`,
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
  const { messages, targetLang } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    targetLang: string;
  };
  if (!messages || !targetLang) {
    res.status(400).json({ error: "Missing messages or targetLang" });
    return;
  }
  const langName = LANG_NAMES[targetLang] ?? targetLang;
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
- Be encouraging and conversational`,
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
