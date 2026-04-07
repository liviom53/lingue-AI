import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Send, Loader2, AlertCircle, Bot, X, ChevronDown, ChevronUp, Copy, Check, Share2, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import appIcon from '@assets/icon-192_1775392140519.png';

const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://lingva.garudalinux.org',
  'https://translate.plausibility.cloud',
];

async function translateText(text: string, targetLang: string): Promise<{ translation: string; pronunciation?: string }> {
  const encoded = encodeURIComponent(text);
  for (const instance of LINGVA_INSTANCES) {
    try {
      const res = await fetch(`${instance}/api/v1/it/${targetLang}/${encoded}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.translation) {
        return {
          translation: data.translation,
          pronunciation: data.info?.pronunciation?.translation || undefined,
        };
      }
    } catch {
      continue;
    }
  }
  throw new Error('Nessun server di traduzione raggiungibile. Riprova tra qualche secondo.');
}

function ipaToReadable(ipa: string): string {
  return ipa
    .replace(/\//g, '').replace(/\[|\]/g, '').replace(/ˈ|ˌ/g, '')
    .replace(/tʃ/g, 'c').replace(/dʒ/g, 'g')
    .replace(/ŋg/g, 'ng').replace(/ŋ/g, 'ng')
    .replace(/ʃ/g, 'sc').replace(/ʒ/g, 'j')
    .replace(/θ/g, 'th').replace(/ð/g, 'dh')
    .replace(/iː/g, 'ii').replace(/uː/g, 'uu')
    .replace(/ɔː/g, 'or').replace(/ɑː/g, 'ar').replace(/ɜː/g, 'er')
    .replace(/aɪ/g, 'ai').replace(/eɪ/g, 'ei').replace(/ɔɪ/g, 'oi')
    .replace(/aʊ/g, 'au').replace(/əʊ/g, 'ou')
    .replace(/ɪə/g, 'ier').replace(/ɛə/g, 'er').replace(/ʊə/g, 'uer')
    .replace(/ː/g, '')
    .replace(/ɔ/g, 'o').replace(/ɛ/g, 'e').replace(/æ/g, 'a')
    .replace(/ə/g, 'e').replace(/ʌ/g, 'a').replace(/ɪ/g, 'i').replace(/ʊ/g, 'u')
    .replace(/ɹ/g, 'r').replace(/w/g, 'u').replace(/j/g, 'i')
    .trim();
}

async function fetchEnglishIPA(text: string): Promise<string | null> {
  const words = text.replace(/[.,!?;:]/g, '').split(' ').slice(0, 8);
  const results = await Promise.all(
    words.map(async (word) => {
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        if (!res.ok) return null;
        const data = await res.json();
        const raw = data[0]?.phonetic || data[0]?.phonetics?.find((p: any) => p.text)?.text || null;
        return raw ? ipaToReadable(raw) : null;
      } catch {
        return null;
      }
    })
  );
  if (!results.some(r => r !== null)) return null;
  return results.map((ph, i) => ph ?? words[i]).join(' ');
}

const LANGUAGES = [
  { code: 'en', name: 'Inglese', flag: '🇬🇧', fc: 'gb', locale: 'en-US' },
  { code: 'es', name: 'Spagnolo', flag: '🇪🇸', fc: 'es', locale: 'es-ES' },
  { code: 'fr', name: 'Francese', flag: '🇫🇷', fc: 'fr', locale: 'fr-FR' },
  { code: 'de', name: 'Tedesco', flag: '🇩🇪', fc: 'de', locale: 'de-DE' },
  { code: 'pt', name: 'Portoghese', flag: '🇵🇹', fc: 'pt', locale: 'pt-PT' },
];

const MORE_LANGUAGES = [
  { code: 'ru', name: 'Russo', flag: '🇷🇺', fc: 'ru', locale: 'ru-RU' },
  { code: 'zh', name: 'Cinese', flag: '🇨🇳', fc: 'cn', locale: 'zh-CN' },
  { code: 'ja', name: 'Giapponese', flag: '🇯🇵', fc: 'jp', locale: 'ja-JP' },
  { code: 'ko', name: 'Coreano', flag: '🇰🇷', fc: 'kr', locale: 'ko-KR' },
  { code: 'ar', name: 'Arabo', flag: '🇸🇦', fc: 'sa', locale: 'ar-SA' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', fc: 'in', locale: 'hi-IN' },
  { code: 'tr', name: 'Turco', flag: '🇹🇷', fc: 'tr', locale: 'tr-TR' },
  { code: 'nl', name: 'Olandese', flag: '🇳🇱', fc: 'nl', locale: 'nl-NL' },
  { code: 'pl', name: 'Polacco', flag: '🇵🇱', fc: 'pl', locale: 'pl-PL' },
  { code: 'uk', name: 'Ucraino', flag: '🇺🇦', fc: 'ua', locale: 'uk-UA' },
  { code: 'ro', name: 'Rumeno', flag: '🇷🇴', fc: 'ro', locale: 'ro-RO' },
  { code: 'el', name: 'Greco', flag: '🇬🇷', fc: 'gr', locale: 'el-GR' },
  { code: 'sv', name: 'Svedese', flag: '🇸🇪', fc: 'se', locale: 'sv-SE' },
  { code: 'da', name: 'Danese', flag: '🇩🇰', fc: 'dk', locale: 'da-DK' },
  { code: 'fi', name: 'Finlandese', flag: '🇫🇮', fc: 'fi', locale: 'fi-FI' },
  { code: 'cs', name: 'Ceco', flag: '🇨🇿', fc: 'cz', locale: 'cs-CZ' },
  { code: 'hu', name: 'Ungherese', flag: '🇭🇺', fc: 'hu', locale: 'hu-HU' },
  { code: 'he', name: 'Ebraico', flag: '🇮🇱', fc: 'il', locale: 'he-IL' },
  { code: 'th', name: 'Tailandese', flag: '🇹🇭', fc: 'th', locale: 'th-TH' },
  { code: 'vi', name: 'Vietnamita', flag: '🇻🇳', fc: 'vn', locale: 'vi-VN' },
  { code: 'id', name: 'Indonesiano', flag: '🇮🇩', fc: 'id', locale: 'id-ID' },
  { code: 'fa', name: 'Persiano', flag: '🇮🇷', fc: 'ir', locale: 'fa-IR' },
  { code: 'ca', name: 'Catalano', flag: '🏴', fc: 'es', locale: 'ca-ES' },
  { code: 'no', name: 'Norvegese', flag: '🇳🇴', fc: 'no', locale: 'nb-NO' },
];

const FlagImg = ({ fc, name }: { fc: string; name: string }) => (
  <img
    src={`https://flagcdn.com/20x15/${fc}.png`}
    width="20"
    height="15"
    alt={name}
    style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: '2px', flexShrink: 0 }}
  />
);

const ALL_LANGUAGES = [...LANGUAGES, ...MORE_LANGUAGES];

const SCENARIOS = [
  { id: 'ristorante', icon: '🍽️', label: 'Ristorante', prompt: 'You are a waiter in a restaurant. The customer (user) has just sat down at a table. Greet them and offer the menu.' },
  { id: 'aeroporto', icon: '✈️', label: 'Aeroporto', prompt: 'You are a check-in agent at an international airport. The passenger (user) approaches your desk.' },
  { id: 'medico', icon: '🏥', label: 'Medico', prompt: 'You are a doctor in a clinic. The patient (user) enters for their appointment. Ask how you can help.' },
  { id: 'hotel', icon: '🏨', label: 'Hotel', prompt: 'You are the front desk receptionist at a hotel. A guest (user) has just arrived to check in.' },
  { id: 'colloquio', icon: '💼', label: 'Colloquio', prompt: 'You are an HR interviewer. The candidate (user) enters the room. Start the job interview.' },
  { id: 'supermercato', icon: '🛒', label: 'Supermercato', prompt: 'You are a shop assistant in a supermarket. A customer (user) approaches you looking for help.' },
];

const normalizeText = (text: string) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

interface ProgressStats {
  totalMinutes: number;
  translationCount: number;
  aiTranslationCount: number;
  wordsLearned: string[];
  practiceAttempts: number;
  practiceScores: number[];
  lastActiveDate: string;
  streakDays: number;
  firstUsedDate: string;
  langStats: Record<string, number>;
  activityDates: string[];
}

interface UserProfile {
  nome: string;
  eta: string;
  sesso: string;
  occupazione: string;
  citta: string;
  altro: string;
}

const defaultProfile = (): UserProfile => ({ nome: '', eta: '', sesso: '', occupazione: '', citta: '', altro: '' });

const PROFILE_KEY = 'lingua_ai_profile';
const loadProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) return { ...defaultProfile(), ...JSON.parse(stored) };
  } catch {}
  return defaultProfile();
};
const saveProfile = (p: UserProfile) => {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
};

type Bookmark = { it: string; tr: string; lang: string; langName: string; date: string };
const BOOKMARKS_KEY = 'lingua_ai_bookmarks';
const loadBookmarks = (): Bookmark[] => {
  try { const s = localStorage.getItem(BOOKMARKS_KEY); if (s) return JSON.parse(s); } catch {}
  return [];
};
const saveBookmarks = (b: Bookmark[]) => {
  try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(b)); } catch {}
};

const PROGRESS_KEY = 'lingua_ai_progress';

const defaultProgress = (): ProgressStats => ({
  totalMinutes: 0,
  translationCount: 0,
  aiTranslationCount: 0,
  wordsLearned: [],
  practiceAttempts: 0,
  practiceScores: [],
  lastActiveDate: '',
  streakDays: 0,
  firstUsedDate: new Date().toISOString().split('T')[0],
  langStats: {},
  activityDates: [],
});

const loadProgress = (): ProgressStats => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) return { ...defaultProgress(), ...JSON.parse(stored) };
  } catch {}
  return defaultProgress();
};

const saveProgress = (p: ProgressStats) => {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {}
};

export default function App() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{
    score: number;
    spoken: string;
    wordResults: { expected: string; correct: boolean }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [speechRate, setSpeechRate] = useState(0.6);
  const [ipaText, setIpaText] = useState<string | null>(null);
  const [phonetic, setPhonetic] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ explanation: string; example: string } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showMoreLangs, setShowMoreLangs] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<'profilo' | 'progressi' | 'calendario' | 'vocabolario' | 'demo'>('profilo');
  const [showTabPanel, setShowTabPanel] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [activeDemoNum, setActiveDemoNum] = useState<1|2|3|4>(1);
  const [progress, setProgress] = useState<ProgressStats>(loadProgress);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  // Roleplay
  const [roleplayScenario, setRoleplayScenario] = useState<string | null>(null);
  // Segnalibri
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);
  const [bookmarked, setBookmarked] = useState(false);
  const [shared, setShared] = useState(false);
  const [vocabFilter, setVocabFilter] = useState<'all' | 'bookmarks'>('all');
  // Quiz
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQ, setQuizQ] = useState<{ bm: Bookmark; options: string[] } | null>(null);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  // Grammatica X-Ray
  const [xrayWord, setXrayWord] = useState<string | null>(null);
  const [xrayData, setXrayData] = useState<{ pos: string; gender: string; tense: string; info: string } | null>(null);
  const [xrayLoading, setXrayLoading] = useState(false);
  // Shadowing
  const [showShadow, setShowShadow] = useState(false);
  const [shadowPhrase, setShadowPhrase] = useState<{ phrase: string; phonetic: string; translation: string } | null>(null);
  const [shadowStep, setShadowStep] = useState<'idle' | 'speaking' | 'listening' | 'result'>('idle');
  const [shadowScore, setShadowScore] = useState<number | null>(null);
  const [shadowSpoken, setShadowSpoken] = useState('');
  const [shadowLoading, setShadowLoading] = useState(false);
  // Demo guidata
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const demoTimersRef = useRef<number[]>([]);
  const translatedTextRef = useRef('');
  const demoActiveRef = useRef(false);
  const blockSpeakRef = useRef(false);
  const narrateGenRef = useRef(0);   // contatore generazione — invalida narr. precedenti
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const currentUtRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [demoCursorPos, setDemoCursorPos] = useState<{x: number, y: number} | null>(null);
  const [demoCursorClicking, setDemoCursorClicking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const moreLangsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setProgress(prev => {
      if (prev.lastActiveDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const streak = prev.lastActiveDate === yesterday ? prev.streakDays + 1 : 1;
      const activityDates = prev.activityDates.includes(today) ? prev.activityDates : [...(prev.activityDates ?? []), today];
      const updated = { ...prev, lastActiveDate: today, streakDays: streak, activityDates };
      saveProgress(updated);
      return updated;
    });
    const interval = setInterval(() => {
      setProgress(prev => {
        const updated = { ...prev, totalMinutes: prev.totalMinutes + 1 };
        saveProgress(updated);
        return updated;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showMoreLangs) return;
    const handleClick = (e: MouseEvent) => {
      if (moreLangsRef.current && !moreLangsRef.current.contains(e.target as Node)) {
        setShowMoreLangs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMoreLangs]);

  useEffect(() => { translatedTextRef.current = translatedText; }, [translatedText]);

  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      voicesRef.current = all;
      setVoices(all);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    setSelectedVoiceURI('');
    setIpaText(null);
    setPracticeResult(null);
    setAiExplanation(null);
    setChatMessages([]);
  }, [selectedLang]);

  useEffect(() => {
    if (showChat && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, showChat]);

  // Aggiorna la posizione del cursore demo DOPO ogni render di demoStep
  useEffect(() => {
    if (!demoActive) return;
    // Step 3: demo 2 punta allo shadow-toggle, tutte le altre al testo tradotto
    const STEP_TARGETS: Record<number, string> = {
      0: 'textarea',
      1: 'lang-grid',
      2: 'translate-btn',
      3: activeDemoNum === 2 ? 'shadow-toggle' : 'translated-text',
      4: 'tab-profilo',
      5: '',
    };
    const target = STEP_TARGETS[demoStep];
    if (!target) { setDemoCursorPos(null); return; }

    let rafId: number;
    rafId = requestAnimationFrame(() => {
      const el = document.querySelector(`[data-demo="${target}"]`);
      if (!el) return;
      // Porta l'elemento in vista (senza animazione, per leggere posizione corretta)
      el.scrollIntoView({ block: 'nearest' });
      // Leggi posizione dopo che il browser ha completato il layout
      rafId = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setDemoCursorPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [demoStep, demoActive, activeDemoNum]);

  const currentLocale = (ALL_LANGUAGES.find(l => l.code === selectedLang) ?? ALL_LANGUAGES[0]).locale;
  const langVoices = voices.filter(v => v.lang.startsWith(selectedLang));
  const availableVoices = langVoices.length > 0 ? langVoices : voices;

  const speak = (text: string) => {
    // During demo (or right after stopping it) the Italian narration handles audio
    if (demoActiveRef.current || blockSpeakRef.current) return;
    // Stop anything currently playing
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const ut = new SpeechSynthesisUtterance(text.trimEnd() + '\u00A0\u00A0\u00A0');
      ut.lang = currentLocale;
      ut.rate = speechRate;
      const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) ut.voice = voice;

      // Chrome desktop bug: synthesis stalls after ~15s idle.
      // Keep it alive with a periodic ping while speaking.
      const keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(keepAlive);
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      ut.onend = () => clearInterval(keepAlive);
      ut.onerror = () => clearInterval(keepAlive);

      window.speechSynthesis.speak(ut);
    };

    // Small delay so cancel() finishes before the next speak() call (Chrome quirk)
    setTimeout(doSpeak, 50);
  };

  const startInputSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => setInputText(e.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const generateQuiz = (bmList: Bookmark[]) => {
    if (bmList.length < 4) return;
    const idx = Math.floor(Math.random() * bmList.length);
    const correct = bmList[idx];
    const distractors = bmList
      .filter((_, i) => i !== idx)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(b => b.tr);
    const options = [...distractors, correct.tr].sort(() => Math.random() - 0.5);
    setQuizQ({ bm: correct, options });
    setQuizSelected(null);
  };

  const handleTranslate = async (langOverride?: string) => {
    if (!inputText.trim()) return;
    // langOverride permette alle demo di bypassare il closure stale su selectedLang
    const lang = typeof langOverride === 'string' ? langOverride : selectedLang;
    setLoading(true);
    setError(null);
    setPracticeResult(null);
    setTranslatedText('');
    setAiExplanation(null);
    setPhonetic(null);
    setBookmarked(false);

    try {
      const { translation, pronunciation } = await translateText(inputText, lang);
      setTranslatedText(translation);
      speak(translation);
      setProgress(prev => {
        const word = translation.toLowerCase().trim();
        const wordsLearned = prev.wordsLearned.includes(word) ? prev.wordsLearned : [...prev.wordsLearned, word];
        const langStats = { ...prev.langStats, [lang]: (prev.langStats[lang] ?? 0) + 1 };
        const updated = { ...prev, translationCount: prev.translationCount + 1, wordsLearned, langStats };
        saveProgress(updated);
        return updated;
      });
      if (lang === 'en') {
        const ipa = await fetchEnglishIPA(translation);
        setIpaText(ipa);
      } else if (pronunciation) {
        setIpaText(pronunciation);
      } else {
        setIpaText(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Errore durante la traduzione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiTranslate = async () => {
    if (!inputText.trim()) return;
    setAiLoading(true);
    setError(null);
    setPracticeResult(null);
    setTranslatedText('');
    setAiExplanation(null);
    setIpaText(null);
    setPhonetic(null);
    setBookmarked(false);

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, targetLang: selectedLang, userProfile: profile }),
      });
      if (!res.ok) throw new Error('Errore AI. Riprova.');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranslatedText(data.translation ?? '');
      setPhonetic(data.pronunciation ?? null);
      setAiExplanation({ explanation: data.explanation ?? '', example: data.example ?? '' });
      speak(data.translation ?? '');
      setProgress(prev => {
        const word = (data.translation ?? '').toLowerCase().trim();
        const wordsLearned = word && !prev.wordsLearned.includes(word) ? [...prev.wordsLearned, word] : prev.wordsLearned;
        const langStats = { ...prev.langStats, [selectedLang]: (prev.langStats[selectedLang] ?? 0) + 1 };
        const updated = { ...prev, translationCount: prev.translationCount + 1, aiTranslationCount: prev.aiTranslationCount + 1, wordsLearned, langStats };
        saveProgress(updated);
        return updated;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Errore AI. Riprova.');
    } finally {
      setAiLoading(false);
    }
  };

  const startPracticeSession = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = (ALL_LANGUAGES.find(l => l.code === selectedLang) ?? ALL_LANGUAGES[0]).locale;
    recognition.onstart = () => {
      setIsPracticing(true);
      setPracticeResult(null);
    };
    recognition.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript;
      const expectedWords = normalizeText(translatedText).split(' ');
      const spokenWords = normalizeText(spoken).split(' ');
      const wordResults = expectedWords.map((word, i) => ({
        expected: word,
        correct: spokenWords[i] === word,
      }));
      const correctCount = wordResults.filter(w => w.correct).length;
      const score = Math.round((correctCount / expectedWords.length) * 100);
      setPracticeResult({ score, spoken, wordResults });
      setProgress(prev => {
        const practiceScores = [...prev.practiceScores, score];
        const updated = { ...prev, practiceAttempts: prev.practiceAttempts + 1, practiceScores };
        saveProgress(updated);
        return updated;
      });
    };
    recognition.onend = () => setIsPracticing(false);
    recognition.start();
  };

  const handleChatSend = async (overrideScenario?: string) => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    const scenarioToUse = overrideScenario ?? roleplayScenario;
    const activeScenario = scenarioToUse ? SCENARIOS.find(s => s.id === scenarioToUse) : null;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          targetLang: selectedLang,
          userProfile: profile,
          scenario: activeScenario?.prompt ?? undefined,
        }),
      });
      if (!res.ok) throw new Error('Errore chat AI');
      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply ?? '' };
      setChatMessages(prev => [...prev, assistantMsg]);
      speak(data.reply ?? '');
    } catch (err: any) {
      const errMsg: ChatMessage = { role: 'assistant', content: '⚠️ ' + (err.message ?? 'Errore') };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRoleplayStart = async (scenarioId: string) => {
    setRoleplayScenario(scenarioId);
    setChatMessages([]);
    setShowChat(true);
    setChatLoading(true);
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) { setChatLoading(false); return; }
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '(start)' }],
          targetLang: selectedLang,
          userProfile: profile,
          scenario: scenario.prompt,
        }),
      });
      if (!res.ok) throw new Error('Errore');
      const data = await res.json();
      const aiMsg: ChatMessage = { role: 'assistant', content: data.reply ?? '' };
      setChatMessages([aiMsg]);
      speak(data.reply ?? '');
    } catch {
      setChatMessages([{ role: 'assistant', content: '⚠️ Errore avvio scenario' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchGrammar = async (word: string) => {
    const clean = word.replace(/[.,!?;:«»"'()\[\]]/g, '').trim();
    if (!clean) return;
    setXrayWord(clean);
    setXrayData(null);
    setXrayLoading(true);
    try {
      const res = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: clean, sentence: translatedText, targetLang: selectedLang }),
      });
      const data = await res.json();
      setXrayData(data);
    } catch {
      setXrayData({ pos: '—', gender: '—', tense: '—', info: 'Errore nel recupero dati.' });
    } finally {
      setXrayLoading(false);
    }
  };

  const fetchShadowPhrase = async () => {
    setShadowLoading(true);
    setShadowPhrase(null);
    setShadowStep('idle');
    setShadowScore(null);
    setShadowSpoken('');
    try {
      const res = await fetch('/api/ai/shadow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang: selectedLang, userProfile: profile }),
      });
      const data = await res.json();
      setShadowPhrase(data);
      setShadowStep('speaking');
      setTimeout(() => speak(data.phrase ?? ''), 300);
    } catch {
      setShadowPhrase(null);
    } finally {
      setShadowLoading(false);
    }
  };

  const startShadowListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !shadowPhrase) return;
    const recognition = new SpeechRecognition();
    recognition.lang = (ALL_LANGUAGES.find(l => l.code === selectedLang) ?? ALL_LANGUAGES[0]).locale;
    setShadowStep('listening');
    recognition.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript;
      setShadowSpoken(spoken);
      const expectedWords = normalizeText(shadowPhrase.phrase).split(' ');
      const spokenWords = normalizeText(spoken).split(' ');
      const correct = expectedWords.filter((w, i) => spokenWords[i] === w).length;
      const score = Math.round((correct / expectedWords.length) * 100);
      setShadowScore(score);
      setShadowStep('result');
      setProgress(prev => {
        const practiceScores = [...prev.practiceScores, score];
        const updated = { ...prev, practiceAttempts: prev.practiceAttempts + 1, practiceScores };
        saveProgress(updated);
        return updated;
      });
    };
    recognition.onend = () => { if (shadowStep === 'listening') setShadowStep('idle'); };
    recognition.start();
  };

  // ── Regola narrazione: ogni frase descrive SOLO ciò che è visibile in quel momento ──────
  // Step 0: durante il typewriter → descrivo il testo che appare
  // Step 1: cursore sulla griglia lingua → descrivo la selezione
  // Step 2: cursore su TRADUCI → premo il bottone (non dico il risultato che non c'è ancora!)
  // Step 3: feature principale → descrivo ciò che SI VEDE (traduzione tornata + azione)
  // Step 4: tab panel aperto → descrivo il pannello visibile
  // Step 5: fine demo

  // ── Demo 1: Traduzione & X-Ray ──────────────────────────────────────────
  const DEMO_STEPS = [
    { icon: '✍️', label: '1/5 — Scrittura',   desc: 'Scrivo una frase in italiano...',                       narration: 'Scrivo una frase in italiano.' },
    { icon: '🌍', label: '2/5 — Lingua',       desc: 'Scelgo la lingua di destinazione...',                  narration: 'Scelgo inglese come lingua.' },
    { icon: '🔄', label: '3/5 — Traduzione',   desc: 'Premo TRADUCI — risultato istantaneo con IPA e audio', narration: 'Premo Traduci.' },
    { icon: '🔬', label: '4/5 — X-Ray',        desc: 'Analisi grammaticale X-Ray parola per parola',          narration: 'Ecco la traduzione. Analizzo la grammatica.' },
    { icon: '⭐', label: '5/5 — Profilo',       desc: 'Profilo, Progressi, Segnalibri, Quiz e altro...',       narration: 'Apro profilo e progressi.' },
    { icon: '🎉', label: 'Demo completata',    desc: 'Esplora tutte le funzionalità!',                        narration: 'Demo completata!' },
  ];

  // ── Demo 2: Shadowing & Pronuncia ───────────────────────────────────────
  const DEMO2_STEPS = [
    { icon: '🎙️', label: '1/5 — Scrittura',   desc: 'Scrivo una frase da imparare in francese...',           narration: 'Imparo la pronuncia con lo Shadowing.' },
    { icon: '🌍', label: '2/5 — Lingua',       desc: 'Scelgo il francese come lingua target...',              narration: 'Scelgo il francese.' },
    { icon: '🔄', label: '3/5 — Traduzione',   desc: 'Traduco e ascolto la pronuncia nativa...',              narration: 'Premo Traduci.' },
    { icon: '🎙️', label: '4/5 — Shadowing',   desc: 'Apro Shadowing: ascolto la frase, poi la ripeto',       narration: 'Apro lo Shadowing.' },
    { icon: '📊', label: '5/5 — Progressi',    desc: 'Ogni esercizio migliora il punteggio!',                 narration: 'Vedo i progressi salvati.' },
    { icon: '🎉', label: 'Demo completata',    desc: 'Attiva lo Shadowing e inizia a praticare!',             narration: 'Esercita ogni giorno!' },
  ];

  // ── Demo 3: Chat AI & Roleplay ───────────────────────────────────────────
  const DEMO3_STEPS = [
    { icon: '🤖', label: '1/5 — Scrittura',   desc: 'Scrivo una frase da chiedere al Tutor AI...',            narration: 'Uso il Tutor AI DeepSeek.' },
    { icon: '🌍', label: '2/5 — Lingua',       desc: 'Scelgo il giapponese come lingua target...',             narration: 'Scelgo il giapponese.' },
    { icon: '🔄', label: '3/5 — Traduzione',   desc: 'Traduco la frase con il supporto AI...',                 narration: 'Premo Traduci.' },
    { icon: '💬', label: '4/5 — Chat AI',      desc: 'Apro la chat — l\'AI spiega grammatica ed esempi...',    narration: 'Apro il Tutor AI.' },
    { icon: '📊', label: '5/5 — Progressi',    desc: 'Profilo e progressi sempre aggiornati...',               narration: 'Vedo i miei progressi.' },
    { icon: '🎉', label: 'Demo completata',    desc: 'Inizia a chattare con il Tutor AI!',                     narration: 'L\'AI risponde in italiano!' },
  ];

  // ── Demo 4: Segnalibri & Vocabolario ─────────────────────────────────────
  const DEMO4_STEPS = [
    { icon: '⭐', label: '1/5 — Scrittura',    desc: 'Scrivo una frase per costruire il vocabolario...',       narration: 'Costruisco il vocabolario personale.' },
    { icon: '🌍', label: '2/5 — Lingua',       desc: 'Scelgo lo spagnolo come lingua target...',               narration: 'Scelgo lo spagnolo.' },
    { icon: '🔄', label: '3/5 — Traduzione',   desc: 'Traduco la frase che voglio ricordare...',               narration: 'Premo Traduci.' },
    { icon: '📚', label: '4/5 — Segnalibri',   desc: 'Vedo la traduzione — posso salvarla nei Segnalibri',     narration: 'Ecco la frase in spagnolo.' },
    { icon: '📅', label: '5/5 — Calendario',   desc: 'Il Calendario mostra la costanza quotidiana!',           narration: 'Apro il calendario progressi.' },
    { icon: '🎉', label: 'Demo completata',    desc: 'Studia ogni giorno e diventerai fluente!',               narration: 'Studia ogni giorno!' },
  ];

  const narrateDemo = (text: string) => {
    // Nuova generazione — invalida callback stale
    const gen = ++narrateGenRef.current;

    const doSpeak = () => {
      if (!demoActiveRef.current || narrateGenRef.current !== gen) return;
      const itVoices = voicesRef.current.filter(v => v.lang.startsWith('it'));
      const itVoice =
        itVoices.find(v => v.name.toLowerCase().includes('google')) ||
        itVoices.find(v => !v.localService) ||
        itVoices[0];
      // Padding di spazi invisibili: mantiene lo stream audio aperto per evitare
      // che Chrome tagli i fonemi finali prima del decadimento acustico
      const ut = new SpeechSynthesisUtterance(text.trimEnd() + '\u00A0\u00A0\u00A0\u00A0\u00A0');
      ut.lang = 'it-IT';
      ut.rate = 0.82;
      ut.pitch = 1.05;
      if (itVoice) ut.voice = itVoice;
      currentUtRef.current = ut;
      window.speechSynthesis.speak(ut);
    };

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      // C'è una narrazione in corso: non interrompere con cancel().
      // Annulla l'eventuale onend precedente, poi concatena doSpeak alla fine.
      const prev = currentUtRef.current;
      if (prev) prev.onend = null;
      // Crea una nuova utterance-sentinella che verrà aggiunta in coda
      const sentinel = new SpeechSynthesisUtterance('\u00A0');
      sentinel.lang = 'it-IT';
      sentinel.volume = 0.01;
      sentinel.onend = () => {
        if (demoActiveRef.current && narrateGenRef.current === gen) {
          window.setTimeout(doSpeak, 50);
        }
      };
      window.speechSynthesis.speak(sentinel);
    } else {
      // Motore idle: piccolo buffer da 80ms per inizializzare il pipeline audio
      const tid = window.setTimeout(doSpeak, 80);
      demoTimersRef.current.push(tid);
    }
  };

  const animateDemoCursorClick = () => {
    setDemoCursorClicking(true);
    const id = window.setTimeout(() => setDemoCursorClicking(false), 400);
    demoTimersRef.current.push(id);
  };

  const stopDemo = () => {
    demoTimersRef.current.forEach(id => clearTimeout(id));
    demoTimersRef.current = [];
    demoActiveRef.current = false;
    narrateGenRef.current++;        // invalida TUTTI i warmup.onend pendenti
    if (currentUtRef.current) { currentUtRef.current.onend = null; currentUtRef.current = null; }
    window.speechSynthesis.cancel();
    blockSpeakRef.current = true;
    setTimeout(() => { blockSpeakRef.current = false; }, 3000);
    setDemoActive(false);
    setDemoStep(0);
    setDemoCursorPos(null);
    setDemoCursorClicking(false);
  };

  const startDemo = (demoNum: 1|2|3|4 = 1) => {
    stopDemo();
    setShowDemoMenu(false);
    setActiveDemoNum(demoNum);
    setTranslatedText('');
    setAiExplanation(null);
    setXrayData(null);
    setXrayWord(null);
    setShowShadow(false);
    setShadowPhrase(null);
    setShadowStep('idle');
    setShowTabPanel(false);
    setShowChat(false);
    setError(null);
    setInputText('');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    demoActiveRef.current = true;
    setDemoActive(true);
    setDemoStep(0);

    const t = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      demoTimersRef.current.push(id);
    };

    // Scrolla l'elemento in vista e ricalcola la posizione cursore dopo lo scroll
    const scrollDemo = (scrollSel: string, cursorSel: string, delay: number) => {
      t(() => {
        const el = document.querySelector(scrollSel) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Ricalcola cursore dopo che lo smooth-scroll finisce (~600ms)
          window.setTimeout(() => {
            if (!demoActiveRef.current) return;
            const cur = document.querySelector(cursorSel) as HTMLElement | null;
            if (cur) {
              const r = cur.getBoundingClientRect();
              setDemoCursorPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }
          }, 650);
        }
      }, delay);
    };

    // Struttura uniforme per tutte le demo:
    // t=0: lingua, t=3000: traduci, t=3600: click, t=8000: feature, t=8600: click,
    // t=13000: profilo/tab, t=13600: click, t=17000: fine, t=20000: stop
    const runSequence = () => {
      if (demoNum === 1) {
        t(() => { setSelectedLang('en'); setDemoStep(1); narrateDemo(DEMO_STEPS[1].narration); }, 0);
        t(() => { setDemoStep(2); narrateDemo(DEMO_STEPS[2].narration); handleTranslate('en'); }, 3000);
        t(() => animateDemoCursorClick(), 3600);
        t(() => {
          setDemoStep(3); narrateDemo(DEMO_STEPS[3].narration);
          const words = translatedTextRef.current.split(' ').filter(w => w.replace(/[^a-zA-Z]/g, '').length > 2);
          if (words.length > 0) fetchGrammar(words[0]);
        }, 8000);
        // scroll→ricalcolo cursore (350ms) + click 100ms dopo ricalcolo (350+650+100=1100ms)
        scrollDemo('[data-demo="translated-text"]', '[data-demo="translated-text"]', 8350);
        t(() => animateDemoCursorClick(), 9100);
        t(() => { setDemoStep(4); narrateDemo(DEMO_STEPS[4].narration); setShowTabPanel(true); setActiveTab('profilo'); }, 13000);
        scrollDemo('[data-demo="tab-panel-toggle"]', '[data-demo="tab-profilo"]', 13400);
        t(() => animateDemoCursorClick(), 14150);
        t(() => { setDemoStep(5); narrateDemo(DEMO_STEPS[5].narration); }, 17500);
        t(() => stopDemo(), 20500);
      } else if (demoNum === 2) {
        t(() => { setSelectedLang('fr'); setDemoStep(1); narrateDemo(DEMO2_STEPS[1].narration); }, 0);
        t(() => { setDemoStep(2); narrateDemo(DEMO2_STEPS[2].narration); handleTranslate('fr'); }, 3000);
        t(() => animateDemoCursorClick(), 3600);
        t(() => { setDemoStep(3); narrateDemo(DEMO2_STEPS[3].narration); setShowShadow(true); fetchShadowPhrase(); }, 8000);
        scrollDemo('[data-demo="shadow-toggle"]', '[data-demo="shadow-toggle"]', 8400);
        t(() => animateDemoCursorClick(), 9150);
        t(() => { setDemoStep(4); narrateDemo(DEMO2_STEPS[4].narration); setShowTabPanel(true); setActiveTab('progressi'); }, 13000);
        scrollDemo('[data-demo="tab-panel-toggle"]', '[data-demo="tab-profilo"]', 13400);
        t(() => animateDemoCursorClick(), 14150);
        t(() => { setDemoStep(5); narrateDemo(DEMO2_STEPS[5].narration); }, 17500);
        t(() => stopDemo(), 20500);
      } else if (demoNum === 3) {
        t(() => { setSelectedLang('ja'); setDemoStep(1); narrateDemo(DEMO3_STEPS[1].narration); }, 0);
        t(() => { setDemoStep(2); narrateDemo(DEMO3_STEPS[2].narration); handleTranslate('ja'); }, 3000);
        t(() => animateDemoCursorClick(), 3600);
        t(() => { setDemoStep(3); narrateDemo(DEMO3_STEPS[3].narration); setShowChat(true); }, 8000);
        scrollDemo('[data-demo="chat-section"]', '[data-demo="chat-section"]', 8400);
        t(() => animateDemoCursorClick(), 9150);
        t(() => { setDemoStep(4); narrateDemo(DEMO3_STEPS[4].narration); setShowTabPanel(true); setActiveTab('progressi'); }, 13000);
        scrollDemo('[data-demo="tab-panel-toggle"]', '[data-demo="tab-profilo"]', 13400);
        t(() => animateDemoCursorClick(), 14150);
        t(() => { setDemoStep(5); narrateDemo(DEMO3_STEPS[5].narration); }, 17500);
        t(() => stopDemo(), 20500);
      } else {
        t(() => { setSelectedLang('es'); setDemoStep(1); narrateDemo(DEMO4_STEPS[1].narration); }, 0);
        t(() => { setDemoStep(2); narrateDemo(DEMO4_STEPS[2].narration); handleTranslate('es'); }, 3000);
        t(() => animateDemoCursorClick(), 3600);
        t(() => { setDemoStep(3); narrateDemo(DEMO4_STEPS[3].narration); }, 8000);
        scrollDemo('[data-demo="translated-text"]', '[data-demo="translated-text"]', 8350);
        t(() => animateDemoCursorClick(), 9100);
        t(() => { setDemoStep(4); narrateDemo(DEMO4_STEPS[4].narration); setShowTabPanel(true); setActiveTab('calendario'); }, 13000);
        scrollDemo('[data-demo="tab-panel-toggle"]', '[data-demo="tab-profilo"]', 13400);
        t(() => animateDemoCursorClick(), 14150);
        t(() => { setDemoStep(5); narrateDemo(DEMO4_STEPS[5].narration); }, 17500);
        t(() => stopDemo(), 20500);
      }
    };

    const phrases: Record<1|2|3|4, string> = {
      1: 'Ho perso il treno, ci vediamo dopo?',
      2: 'Il sole tramonta lentamente.',
      3: 'Come si dice grazie in questa lingua?',
      4: 'Ogni giorno imparo qualcosa di nuovo.',
    };
    const allSteps = [DEMO_STEPS, DEMO2_STEPS, DEMO3_STEPS, DEMO4_STEPS];
    const PHRASE = phrases[demoNum];

    let i = 0;
    const type = () => {
      if (i <= PHRASE.length) {
        setInputText(PHRASE.slice(0, i));
        i++;
        const id = window.setTimeout(type, 45);
        demoTimersRef.current.push(id);
      } else {
        runSequence();
      }
    };
    narrateDemo(allSteps[demoNum - 1][0].narration);
    const startTypingId = window.setTimeout(type, 2400);
    demoTimersRef.current.push(startTypingId);
  };

  const styles: Record<string, React.CSSProperties> = {
    main: {
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '12px',
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    card: {
      // Gradiente 140°: azzurro-chiaro in alto-sinistra → quasi-nero in basso-destra
      background: 'linear-gradient(140deg, #3d5f82 0%, #1e2d3f 35%, #0e1620 100%)',
      borderRadius: '14px',
      padding: '12px',
      marginBottom: '12px',
      border: '1px solid rgba(90,120,170,0.25)',
      borderTop: '1px solid rgba(160,210,255,0.35)',
      borderLeft: '1px solid rgba(140,190,255,0.20)',
      borderBottom: '1px solid rgba(0,0,0,0.70)',
      borderRight: '1px solid rgba(0,0,0,0.45)',
      boxShadow: [
        // ── bevel interno: bordo alto e sinistro luminosi, basso e destro scuri ──
        'inset 0 3px 0 rgba(255,255,255,0.22)',    // fascia alta luminosa
        'inset 4px 0 0 rgba(255,255,255,0.13)',    // bordo sinistro lit
        'inset -4px 0 0 rgba(0,0,0,0.35)',         // bordo destro scuro
        'inset 0 -3px 0 rgba(0,0,0,0.45)',         // fascia bassa scura
        // ── faccia inferiore: 5 strati da 2px a 10px ──
        '0 2px 0 #0c1624',
        '0 4px 0 #09111e',
        '0 6px 0 #060d18',
        '0 8px 0 #040a12',
        '0 10px 0 rgba(3,7,14,0.55)',
        // ── ombre ambientali ──
        '0 16px 36px rgba(0,0,0,0.70)',
        '0 7px 16px rgba(0,0,0,0.55)',
      ].join(','),
    },
    btn: {
      width: '100%',
      padding: '8px 4px',
      borderRadius: '8px',
      border: 'none',
      borderTop: '1px solid rgba(255,255,255,0.10)',
      backgroundColor: '#2d3f52',
      color: '#fff',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      // stesso flottante dei lang-btn
      transform: 'translateY(-3px)',
      // stessa faccia a 3 strati dei lang-btn inattivi
      boxShadow: [
        'inset 0 1px 0 rgba(255,255,255,0.09)',
        '0 3px 0 #1a2535',
        '0 5px 0 #111c28',
        '0 7px 0 rgba(6,12,22,0.50)',
        '0 10px 18px rgba(0,0,0,0.50)',
      ].join(','),
    },
    btnOrange: {
      borderTop: '1px solid rgba(255,255,255,0.22)',
      backgroundColor: '#fb923c',
      fontWeight: '700',
      boxShadow: [
        'inset 0 1px 0 rgba(255,255,255,0.22)',
        '0 3px 0 #b85a10',
        '0 5px 0 #7c3a08',
        '0 7px 0 rgba(60,20,0,0.35)',
        '0 10px 20px rgba(251,146,60,0.20)',
        '0 5px 12px rgba(0,0,0,0.40)',
      ].join(','),
    },
  };

  const langName = (ALL_LANGUAGES.find(l => l.code === selectedLang) ?? ALL_LANGUAGES[0]).name;

  return (
    <div style={styles.main}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
          <img src={appIcon} alt="Impara una Lingua" style={{ width: '90px', height: '90px', borderRadius: '14px', flexShrink: 0 }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 5vw, 1.9rem)' }}>Impara una lingua con l&apos;AI</h1>
            <p style={{ color: '#f97316', fontSize: 'clamp(0.9rem, 3.8vw, 1.45rem)', margin: '4px 0 0', whiteSpace: 'nowrap' }}>Inizia a parlarla male... poi si vedrà</p>
          </div>
        </header>

        {/* Menu Demo & Funzionalità */}
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setShowDemoMenu(v => !v)}
            style={{
              width: '100%', padding: '9px 16px',
              background: 'linear-gradient(90deg, #10b981, #3b82f6)',
              border: 'none',
              borderRadius: showDemoMenu ? '10px 10px 0 0' : '10px',
              color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <FlagImg fc="it" name="Italiano" />
              <span>▶ Demo &amp; Funzionalità</span>
            </span>
            {showDemoMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showDemoMenu && (
            <div style={{
              padding: '8px', background: '#0a1628',
              borderRadius: '0 0 10px 10px',
              border: '1px solid #10b981', borderTop: 'none',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px',
            }}>
              {([
                { n: 1 as const, icon: '🌍', label: 'Traduzione', sub: 'X-Ray grammaticale' },
                { n: 2 as const, icon: '🎙️', label: 'Shadowing', sub: 'Ripeti e impara' },
                { n: 3 as const, icon: '🤖', label: 'Chat AI', sub: 'Conversa con DeepSeek' },
                { n: 4 as const, icon: '⭐', label: 'Vocabolario', sub: 'Salva e ripassa' },
              ]).map(({ n, icon, label, sub }) => (
                <button
                  key={n}
                  onClick={() => startDemo(n)}
                  style={{
                    padding: '9px 8px', border: '1px solid #1e3a5f',
                    borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '0.78rem',
                    backgroundColor: '#1e293b', color: '#e2e8f0',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                  <span>{label}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>{sub}</span>
                </button>
              ))}
              <button
                onClick={() => { setShowTabPanel(true); setActiveTab('demo'); setShowDemoMenu(false); }}
                style={{
                  gridColumn: '1 / -1', padding: '9px 8px',
                  border: '1px solid #4c1d95', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '0.82rem',
                  backgroundColor: '#1e1b4b', color: '#a78bfa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                🎬 Funzionalità — scopri il video
              </button>
            </div>
          )}
        </div>

        <section className="lang-section" style={styles.card}>
          <div data-demo="lang-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingBottom: '6px' }}>
            {LANGUAGES.map(l => {
              const active = selectedLang === l.code;
              return (
                <button
                  key={l.code}
                  className="lang-btn"
                  onClick={() => { setSelectedLang(l.code); setShowMoreLangs(false); }}
                  style={{
                    ...styles.btn,
                    marginTop: 0,
                    width: '100%',
                    ...(active ? styles.btnOrange : {}),
                  }}
                >
                  <FlagImg fc={l.fc} name={l.name} /> {l.name}
                </button>
              );
            })}
            <div ref={moreLangsRef} style={{ position: 'relative' }}>
              {(() => {
                const active = MORE_LANGUAGES.some(l => l.code === selectedLang);
                return (
              <button
                className="lang-btn"
                onClick={() => setShowMoreLangs(v => !v)}
                style={{
                  ...styles.btn,
                  marginTop: 0,
                  width: '100%',
                  whiteSpace: 'nowrap',
                  fontSize: 'clamp(0.7rem, 3.5vw, 1rem)',
                  ...(active ? styles.btnOrange : {}),
                }}
              >
                {(() => { const ml = MORE_LANGUAGES.find(l => l.code === selectedLang); return ml ? <><FlagImg fc={ml.fc} name={ml.name} /> {ml.name}</> : <>🌍 Altre lingue</>; })()}
                <ChevronDown size={14} style={{ marginLeft: '2px', transform: showMoreLangs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              );
              })()}
              {showMoreLangs && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 100,
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  marginTop: '4px',
                  width: '200px',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {MORE_LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setSelectedLang(l.code); setShowMoreLangs(false); }}
                      style={{
                        width: '100%',
                        padding: '9px 14px',
                        backgroundColor: selectedLang === l.code ? '#fb923c' : 'transparent',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FlagImg fc={l.fc} name={l.name} /> {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="input-section" style={styles.card}>
          <textarea
            style={{
              width: '100%',
              height: '60px',
              backgroundColor: '#0f172a',
              color: '#fff',
              border: '1px solid #334155',
              padding: '8px',
              borderRadius: '8px',
              resize: 'none',
              boxSizing: 'border-box',
            }}
            data-demo="textarea"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTranslate(); } }}
            placeholder="Scrivi in italiano..."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            <button
              className="action-btn"
              style={{
                ...styles.btn, marginTop: 0,
                backgroundColor: isListening ? '#ef4444' : '#2d3f52',
                boxShadow: isListening ? [
                  'inset 0 1px 0 rgba(255,255,255,0.18)',
                  '0 3px 0 #991b1b',
                  '0 5px 0 #7f1d1d',
                  '0 7px 0 rgba(60,0,0,0.45)',
                  '0 10px 18px rgba(239,68,68,0.18)',
                  '0 5px 12px rgba(0,0,0,0.40)',
                ].join(',') : styles.btn.boxShadow,
              }}
              onClick={startInputSpeech}
            >
              <Mic size={18} /> DETTA
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                className="action-btn"
                data-demo="translate-btn"
                style={{ ...styles.btn, ...styles.btnOrange, marginTop: 0 }}
                onClick={() => handleTranslate()}
                disabled={loading || aiLoading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} TRADUCI
              </button>
              <button
                className="action-btn"
                style={{
                  ...styles.btn, marginTop: 0,
                  backgroundColor: '#e8d0a0', color: '#1e293b', fontSize: '0.85rem',
                  borderTop: '1px solid rgba(255,255,255,0.30)',
                  boxShadow: [
                    'inset 0 1px 0 rgba(255,255,255,0.30)',
                    '0 3px 0 #b8a070',
                    '0 5px 0 #967e58',
                    '0 7px 0 rgba(60,40,0,0.35)',
                    '0 10px 18px rgba(232,208,160,0.14)',
                    '0 5px 12px rgba(0,0,0,0.40)',
                  ].join(','),
                }}
                onClick={handleAiTranslate}
                disabled={loading || aiLoading}
                title="Traduzione AI con spiegazione grammaticale"
              >
                {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />} TUTOR AI
              </button>
            </div>
          </div>
          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </section>

        <section style={{ ...styles.card, border: '1px solid #3b82f6' }}>
          <button
            onClick={() => setShowVoiceSettings(v => !v)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 0,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: showVoiceSettings ? '10px' : 0,
            }}
          >
            <span>⚙️ Impostazioni voce</span>
            {showVoiceSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showVoiceSettings && (
            <>
              {voices.length > 0 ? (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Voce {langVoices.length > 0 ? `(${langVoices.length} per questa lingua)` : '(tutte disponibili)'}
                  </label>
                  <select
                    value={selectedVoiceURI}
                    onChange={e => setSelectedVoiceURI(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="">— Voce predefinita —</option>
                    {availableVoices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} [{v.lang}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                  Nessuna voce disponibile nel tuo browser.
                </p>
              )}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Velocità</span>
                  <span style={{ color: '#f8fafc' }}>{speechRate.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={speechRate}
                  onChange={e => setSpeechRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#fb923c' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                  <span>0.1x (lento)</span>
                  <span>1x (normale)</span>
                </div>
              </div>
            </>
          )}
        </section>

        {translatedText && (
          <section style={{ ...styles.card, border: '2px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div data-demo="translated-text" style={{ flex: 1, fontSize: '1.2rem', fontWeight: 'bold', lineHeight: '1.7', flexWrap: 'wrap', display: 'flex', gap: '4px' }}>
                {translatedText.split(' ').map((word, i) => (
                  <span
                    key={i}
                    onClick={() => fetchGrammar(word)}
                    title="Analisi grammaticale"
                    style={{
                      cursor: 'pointer',
                      borderRadius: '4px',
                      padding: '0 2px',
                      backgroundColor: xrayWord === word.replace(/[.,!?;:«»"'()\[\]]/g, '').trim() ? '#1e40af' : 'transparent',
                      color: xrayWord === word.replace(/[.,!?;:«»"'()\[\]]/g, '').trim() ? '#93c5fd' : 'inherit',
                      transition: 'background 0.15s',
                    }}
                  >{word}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                <button
                  title="Copia traduzione"
                  onClick={() => {
                    navigator.clipboard.writeText(translatedText).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copied ? '#10b981' : '#64748b' }}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
                <button
                  title={bookmarked ? 'Già nei preferiti' : 'Salva nei preferiti'}
                  onClick={() => {
                    if (bookmarked) return;
                    const langName = ALL_LANGUAGES.find(l => l.code === selectedLang)?.name ?? selectedLang;
                    const bm: Bookmark = { it: inputText.trim(), tr: translatedText, lang: selectedLang, langName, date: new Date().toISOString().split('T')[0] };
                    const updated = [bm, ...bookmarks.filter(b => !(b.it === bm.it && b.lang === bm.lang))];
                    setBookmarks(updated);
                    saveBookmarks(updated);
                    setBookmarked(true);
                  }}
                  style={{ background: 'none', border: 'none', cursor: bookmarked ? 'default' : 'pointer', padding: '2px', color: bookmarked ? '#fbbf24' : '#64748b' }}
                >
                  {bookmarked ? <BookmarkCheck size={20} /> : <BookmarkPlus size={20} />}
                </button>
                <button
                  title="Condividi traduzione"
                  onClick={() => {
                    const langName = ALL_LANGUAGES.find(l => l.code === selectedLang)?.name ?? selectedLang;
                    const text = `🇮🇹 "${inputText.trim()}"\n➡ ${langName}: "${translatedText}"`;
                    if (navigator.share) {
                      navigator.share({ text }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(text).then(() => {
                        setShared(true);
                        setTimeout(() => setShared(false), 2000);
                      });
                    }
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: shared ? '#10b981' : '#64748b' }}
                  title={shared ? 'Copiato!' : 'Condividi'}
                >
                  {shared ? <Check size={20} /> : <Share2 size={20} />}
                </button>
                <Volume2
                  size={24}
                  color="#10b981"
                  style={{ cursor: 'pointer' }}
                  onClick={() => speak(translatedText)}
                />
              </div>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#475569' }}>🔬 Tocca una parola per analisi grammaticale</p>
            {(xrayWord || xrayLoading) && (
              <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #3b82f6', position: 'relative' }}>
                <button onClick={() => { setXrayWord(null); setXrayData(null); }} style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={14} /></button>
                <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔬 X-Ray: <em style={{ fontStyle: 'normal', color: '#93c5fd' }}>{xrayWord}</em></p>
                {xrayLoading ? (
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}><Loader2 className="animate-spin" size={14} style={{ display: 'inline', marginRight: '6px' }} />Analisi in corso...</p>
                ) : xrayData && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Categoria</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 'bold' }}>{xrayData.pos}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Genere</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 'bold' }}>{xrayData.gender}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Tempo</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 'bold' }}>{xrayData.tense}</p>
                    </div>
                    {xrayData.info && (
                      <div style={{ gridColumn: '1/-1', marginTop: '2px', padding: '6px', backgroundColor: '#1e293b', borderRadius: '6px' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>💡 {xrayData.info}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {phonetic && (
              <p style={{
                marginTop: '6px',
                marginBottom: '2px',
                fontSize: '0.95rem',
                color: '#34d399',
                fontStyle: 'italic',
                letterSpacing: '0.04em',
                borderLeft: '3px solid #34d399',
                paddingLeft: '8px',
              }}>
                <span style={{ fontStyle: 'normal', fontWeight: 'bold', marginRight: '6px', fontSize: '0.75rem', color: '#6ee7b7' }}>si legge</span>{phonetic}
              </p>
            )}
            {ipaText && !phonetic && (
              <p style={{
                marginTop: '6px',
                marginBottom: '2px',
                fontSize: '0.9rem',
                color: '#f97316',
                fontStyle: 'italic',
                letterSpacing: '0.03em',
                borderLeft: '3px solid #f97316',
                paddingLeft: '8px',
              }}>
                <span style={{ fontStyle: 'normal', fontWeight: 'bold', marginRight: '6px' }}>pronuncia</span>{ipaText}
              </p>
            )}
            {aiExplanation && (
              <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #fb923c' }}>
                <p style={{ fontSize: '0.8rem', color: '#fbbf24', margin: '0 0 4px', fontWeight: 'bold' }}>🤖 DeepSeek spiega:</p>
                <p style={{ fontSize: '0.85rem', color: '#fde68a', margin: '0 0 6px' }}>{aiExplanation.explanation}</p>
                {aiExplanation.example && (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>
                    Es: <em style={{ color: '#e2e8f0' }}>{aiExplanation.example}</em>
                  </p>
                )}
              </div>
            )}
            {isPracticing && (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' }}>🎙️ Dì la frase...</p>
            )}
            {practiceResult && !isPracticing && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '1.4rem', fontWeight: 'bold',
                    color: practiceResult.score === 100 ? '#10b981' : practiceResult.score >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {practiceResult.score}%
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {practiceResult.score === 100 ? '🎉 Perfetto!' : practiceResult.score >= 60 ? '👍 Quasi!' : '❌ Riprova'}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '6px' }}>
                  {practiceResult.wordResults.map((w, i) => (
                    <span key={i} style={{
                      marginRight: '5px',
                      color: w.correct ? '#10b981' : '#ef4444',
                      textDecoration: w.correct ? 'none' : 'underline',
                      fontWeight: w.correct ? 'normal' : 'bold',
                    }}>
                      {w.expected}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                  Hai detto: <em>{practiceResult.spoken}</em>
                </p>
              </div>
            )}
            {!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) ? (
              <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎙️ Pratica pronuncia disponibile solo su <strong>Chrome</strong> o <strong>Edge</strong>
              </p>
            ) : (
              <button
                style={{ ...styles.btn, backgroundColor: isPracticing ? '#f59e0b' : '#10b981' }}
                onClick={startPracticeSession}
              >
                <Mic size={18} /> {practiceResult && !isPracticing ? 'RIPROVA' : 'PRATICA PRONUNCIA'}
              </button>
            )}
          </section>
        )}

        {/* Shadowing Mode */}
        <section style={{ ...styles.card, border: '1px solid #a855f7' }}>
          <button
            data-demo="shadow-toggle"
            onClick={() => setShowShadow(v => !v)}
            style={{ width: '100%', background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            <span>🔁 Shadowing — ripeti e impara</span>
            {showShadow ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showShadow && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 10px' }}>
                L'AI genera una frase e la parla. Ripeti subito — poi scopri il tuo punteggio.
              </p>
              <button onClick={fetchShadowPhrase} disabled={shadowLoading} style={{ ...styles.btn, backgroundColor: '#7c3aed', marginBottom: '10px' }}>
                {shadowLoading ? <Loader2 className="animate-spin" size={18} /> : '✨'} Genera nuova frase
              </button>
              {shadowPhrase && (
                <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #6d28d9' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 'bold', color: '#e2e8f0' }}>{shadowPhrase.phrase}</p>
                  <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: '#a78bfa', fontStyle: 'italic' }}>si legge: {shadowPhrase.phonetic}</p>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b' }}>🇮🇹 {shadowPhrase.translation}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => speak(shadowPhrase.phrase)} style={{ ...styles.btn, backgroundColor: '#4f46e5', flex: 1 }}>
                      <Volume2 size={16} /> Riascolta
                    </button>
                    {(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition ? (
                      <button
                        onClick={startShadowListen}
                        disabled={shadowStep === 'listening'}
                        style={{ ...styles.btn, backgroundColor: shadowStep === 'listening' ? '#f59e0b' : '#10b981', flex: 1 }}
                      >
                        <Mic size={16} /> {shadowStep === 'listening' ? 'Ascoltando...' : 'Ripeti ora!'}
                      </button>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: '#f59e0b', margin: 0 }}>Solo Chrome/Edge</p>
                    )}
                  </div>
                  {shadowStep === 'result' && shadowScore !== null && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: shadowScore === 100 ? '#10b981' : shadowScore >= 60 ? '#f59e0b' : '#ef4444' }}>
                          {shadowScore}%
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {shadowScore === 100 ? '🎉 Perfetto!' : shadowScore >= 60 ? '👍 Quasi!' : '❌ Riprova!'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Hai detto: <em style={{ color: '#94a3b8' }}>{shadowSpoken}</em></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* AI Chat Section */}
        <section data-demo="chat-section" style={{ ...styles.card, border: '1px solid #fb923c' }}>
          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#fbbf24',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 0,
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} /> Conversa in {langName} con DeepSeek AI
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {showChat && (
                <span
                  title={chatExpanded ? 'Riduci chat' : 'Espandi chat'}
                  onClick={e => { e.stopPropagation(); setChatExpanded(v => !v); }}
                  style={{ cursor: 'pointer', color: '#fbbf24', padding: '2px', display: 'flex' }}
                >
                  {chatExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              )}
              {showChat ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {showChat && (
            <div style={{ marginTop: '10px' }}>
              {/* Scenario Roleplay Pills */}
              <div style={{ marginBottom: '8px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎭 Scegli uno scenario o conversa liberamente</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setRoleplayScenario(null); setChatMessages([]); }}
                    style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid', borderColor: roleplayScenario === null ? '#fb923c' : '#334155', backgroundColor: roleplayScenario === null ? '#fb923c22' : 'transparent', color: roleplayScenario === null ? '#fb923c' : '#64748b', fontSize: '0.78rem', cursor: 'pointer', fontWeight: roleplayScenario === null ? 'bold' : 'normal' }}
                  >
                    💬 Libera
                  </button>
                  {SCENARIOS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleRoleplayStart(s.id)}
                      style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid', borderColor: roleplayScenario === s.id ? '#fb923c' : '#334155', backgroundColor: roleplayScenario === s.id ? '#fb923c22' : 'transparent', color: roleplayScenario === s.id ? '#fb923c' : '#64748b', fontSize: '0.78rem', cursor: 'pointer', fontWeight: roleplayScenario === s.id ? 'bold' : 'normal' }}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
                {roleplayScenario && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#fb923c' }}>
                    🎭 Roleplay: <strong>{SCENARIOS.find(s => s.id === roleplayScenario)?.label}</strong> — l'AI è il personaggio, tu sei il cliente/paziente/candidato.
                  </p>
                )}
              </div>
              <div ref={chatContainerRef} style={{
                height: chatExpanded ? '360px' : '220px',
                overflowY: 'auto',
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                padding: '8px',
                marginBottom: '8px',
                border: '1px solid #334155',
              }}>
                {chatMessages.length === 0 && (
                  <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', marginTop: '90px' }}>
                    Scrivi qualcosa per iniziare a conversare in {langName}...
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: '6px 10px',
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      backgroundColor: msg.role === 'user' ? '#f97316' : '#1e293b',
                      border: msg.role === 'assistant' ? '1px solid #f59e0b' : 'none',
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      color: '#f8fafc',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                      {msg.role === 'assistant' && (
                        <Volume2
                          size={12}
                          style={{ cursor: 'pointer', marginLeft: '6px', opacity: 0.6, display: 'inline', verticalAlign: 'middle' }}
                          onClick={() => speak(msg.content)}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ padding: '6px 10px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #f59e0b' }}>
                      <Loader2 size={14} className="animate-spin" style={{ color: '#fbbf24' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleChatSend(); }}
                  placeholder={`Scrivi in ${langName}...`}
                  disabled={chatLoading}
                />
                <button
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f97316',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Send size={16} />
                </button>
                {chatMessages.length > 0 && (
                  <button
                    onClick={() => setChatMessages([])}
                    style={{
                      padding: '8px',
                      backgroundColor: '#334155',
                      color: '#94a3b8',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    title="Nuova conversazione"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Quiz veloce */}
        <section style={{ ...styles.card, border: '1px solid #10b981' }}>
          <button
            onClick={() => {
              setShowQuiz(v => !v);
              if (!showQuiz && bookmarks.length >= 4) generateQuiz(bookmarks);
            }}
            style={{ width: '100%', background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            <span>🧠 Quiz veloce — metti alla prova i preferiti</span>
            {showQuiz ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showQuiz && (
            <div style={{ marginTop: '14px' }}>
              {bookmarks.length < 4 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '2rem' }}>📚</p>
                  <p style={{ margin: 0 }}>Salva almeno <strong style={{ color: '#fbbf24' }}>4 segnalibri</strong> (⭐) dopo le traduzioni per sbloccare il quiz!</p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#334155' }}>Hai {bookmarks.length} su 4 preferiti salvati</p>
                </div>
              ) : quizQ === null ? (
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => generateQuiz(bookmarks)} style={{ ...styles.btn, backgroundColor: '#7c3aed' }}>
                    Inizia quiz
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Come si dice in {quizQ.bm.langName}?</p>
                  <p style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc', padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', lineHeight: '1.5' }}>
                    🇮🇹 &ldquo;{quizQ.bm.it}&rdquo;
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {quizQ.options.map(opt => {
                      const isCorrect = opt === quizQ.bm.tr;
                      const isSelected = opt === quizSelected;
                      let bg = '#1e293b';
                      let border = '1px solid #334155';
                      if (quizSelected) {
                        if (isCorrect) { bg = '#064e3b'; border = '1px solid #10b981'; }
                        else if (isSelected) { bg = '#450a0a'; border = '1px solid #ef4444'; }
                      }
                      return (
                        <button key={opt} disabled={!!quizSelected} onClick={() => {
                          setQuizSelected(opt);
                          setQuizTotal(t => t + 1);
                          if (isCorrect) setQuizScore(s => s + 1);
                        }} style={{
                          padding: '10px 8px', borderRadius: '8px', border, background: bg,
                          color: quizSelected && isCorrect ? '#6ee7b7' : quizSelected && isSelected ? '#fca5a5' : '#e2e8f0',
                          cursor: quizSelected ? 'default' : 'pointer', fontSize: '0.82rem', textAlign: 'center', lineHeight: '1.3', transition: 'all 0.2s',
                        }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSelected && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: quizSelected === quizQ.bm.tr ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                        {quizSelected === quizQ.bm.tr ? '✅ Esatto!' : `❌ Risposta: "${quizQ.bm.tr}"`}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{quizScore}/{quizTotal}</span>
                        <button onClick={() => generateQuiz(bookmarks)} style={{ padding: '6px 14px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                          Prossima
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Toggle per profilo/progressi */}
        <div data-demo="tab-panel-toggle" style={{ margin: '16px 0 8px' }}>
          <button
            onClick={() => setShowTabPanel(v => !v)}
            style={{
              width: '100%',
              background: 'none',
              border: '1px solid #60a5fa',
              borderRadius: showTabPanel ? '10px 10px 0 0' : '10px',
              color: '#60a5fa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            <span>👤 Profilo &nbsp;·&nbsp; 📊 Progressi &nbsp;·&nbsp; 🎬 Funzionalità</span>
            {showTabPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showTabPanel && (
        <section style={{ border: '1px solid #60a5fa', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '10px 10px 4px', marginBottom: '8px', backgroundColor: '#1e293b' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '0 0 8px' }}>
          {([
            { id: 'profilo',     label: '👤 Profilo' },
            { id: 'progressi',  label: '📊 Progressi' },
            { id: 'calendario', label: '📅 Calendario' },
            { id: 'vocabolario',label: '📚 Vocabolario' },
          ] as const).map(({ id, label }) => (
            <button key={id} data-demo={id === 'profilo' ? 'tab-profilo' : undefined} onClick={() => setActiveTab(id)} style={{
              padding: '9px 6px', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '0.82rem',
              backgroundColor: activeTab === id ? '#fb923c' : '#1e293b',
              color: activeTab === id ? '#fff' : '#94a3b8',
              transition: 'background 0.2s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {(() => {
          const avgScore = progress.practiceScores.length > 0
            ? Math.round(progress.practiceScores.reduce((a, b) => a + b, 0) / progress.practiceScores.length) : 0;
          const bestScore = progress.practiceScores.length > 0 ? Math.max(...progress.practiceScores) : 0;
          const hours = Math.floor(progress.totalMinutes / 60);
          const mins = progress.totalMinutes % 60;
          const totalScore = progress.translationCount * 5 + progress.wordsLearned.length * 10 + avgScore * (progress.practiceAttempts / 10 || 0);
          const levelInfo =
            totalScore < 50 ? { label: 'Base', icon: '🌱', color: '#94a3b8' } :
            totalScore < 300 ? { label: 'Intermedio', icon: '📚', color: '#60a5fa' } :
            totalScore < 1000 ? { label: 'Avanzato', icon: '🎯', color: '#fb923c' } :
            { label: 'Esperto', icon: '🏆', color: '#fbbf24' };
          const favLangEntry = Object.entries(progress.langStats).sort((a, b) => b[1] - a[1])[0];
          const favLangName = favLangEntry ? (ALL_LANGUAGES.find(l => l.code === favLangEntry[0])?.name ?? favLangEntry[0]) : null;
          const favLangFc = favLangEntry ? (ALL_LANGUAGES.find(l => l.code === favLangEntry[0])?.fc ?? null) : null;

          const StatCard = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) => (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: color ?? '#f8fafc' }}>{value}</p>
              {sub && <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{sub}</p>}
            </div>
          );

          const ProgressBar = ({ label, value, max, color, suffix = '' }: { label: string; value: number; max: number; color: string; suffix?: string }) => {
            const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);
            return (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{label}</span>
                  <span style={{ fontSize: '0.78rem', color, fontWeight: 600 }}>{value}{suffix} / {max}{suffix}</span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', background: '#1e293b', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: color, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          };

          const inputStyle: React.CSSProperties = {
            width: '100%', boxSizing: 'border-box', padding: '8px 10px',
            backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
            color: '#f8fafc', fontSize: '0.9rem', outline: 'none',
          };
          const labelStyle: React.CSSProperties = {
            fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase',
            letterSpacing: '0.06em', display: 'block', marginBottom: '4px',
          };

          const updateProfile = (field: keyof UserProfile, value: string) => {
            setProfile(prev => {
              const updated = { ...prev, [field]: value };
              saveProfile(updated);
              return updated;
            });
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 1500);
          };

          if (activeTab === 'demo') return (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ ...styles.card, marginBottom: '10px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '1px solid #4c1d95', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '0.7rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🎬 Video promozionale</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                    Scopri tutte le funzionalità di <strong style={{ color: '#fb923c' }}>Lingua AI</strong> in 25 secondi.
                  </p>
                </div>
                <button
                  onClick={() => setShowTabPanel(false)}
                  title="Chiudi"
                  style={{ flexShrink: 0, marginLeft: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', transition: 'background 0.2s' }}
                >
                  ✕ Chiudi
                </button>
              </div>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', backgroundColor: '#0f172a', marginBottom: '10px' }}>
                <iframe
                  src="https://7f2e7385-dc18-4dec-b4cb-b49d934165fd-00-1p6eowh30kvti.spock.replit.dev/lingua-ai-demo-video/"
                  style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                  allow="autoplay"
                  title="Lingua AI Demo Video"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { icon: '🌍', label: '29+ lingue' },
                  { icon: '🔬', label: 'X-Ray grammaticale' },
                  { icon: '🤖', label: 'AI Tutor DeepSeek' },
                  { icon: '🔁', label: 'Shadowing' },
                  { icon: '⭐', label: 'Segnalibri & Quiz' },
                  { icon: '📤', label: 'Condivisione rapida' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          );

          if (activeTab === 'profilo') return (
            <div style={{ marginBottom: '16px' }}>
              {/* Informazioni personali */}
              <section style={{ ...styles.card, marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    👤 Informazioni personali
                  </p>
                  {profileSaved && (
                    <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold' }}>✓ Salvato</span>
                  )}
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                  Campi facoltativi — l'AI li usa per personalizzare spiegazioni ed esempi.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>Nome</label>
                    <input
                      style={inputStyle}
                      placeholder="es. Marco"
                      value={profile.nome}
                      onChange={e => updateProfile('nome', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Età</label>
                    <input
                      style={inputStyle}
                      placeholder="es. 32"
                      type="number"
                      min="1"
                      max="120"
                      value={profile.eta}
                      onChange={e => updateProfile('eta', e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>Sesso</label>
                    <select
                      style={{ ...inputStyle, appearance: 'none' }}
                      value={profile.sesso}
                      onChange={e => updateProfile('sesso', e.target.value)}
                    >
                      <option value="">—</option>
                      <option value="Uomo">Uomo</option>
                      <option value="Donna">Donna</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Città</label>
                    <input
                      style={inputStyle}
                      placeholder="es. Milano"
                      value={profile.citta}
                      onChange={e => updateProfile('citta', e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Occupazione</label>
                  <input
                    style={inputStyle}
                    placeholder="es. Insegnante, Medico, Studente…"
                    value={profile.occupazione}
                    onChange={e => updateProfile('occupazione', e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Altro (interessi, motivo dello studio…)</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'none', minHeight: '60px' }}
                    placeholder="es. Studio l'inglese per lavoro, amo i viaggi..."
                    value={profile.altro}
                    onChange={e => updateProfile('altro', e.target.value)}
                  />
                </div>
                <button
                  onClick={() => { saveProfile(profile); setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000); }}
                  style={{
                    width: '100%', marginTop: '12px', padding: '10px',
                    backgroundColor: profileSaved ? '#10b981' : '#fb923c',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                    transition: 'background 0.3s',
                  }}
                >
                  {profileSaved ? '✓ Salvato!' : '💾 Salva profilo'}
                </button>
              </section>
            </div>
          );

          if (activeTab === 'calendario') {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const days = Array.from({ length: 28 }, (_, i) => {
              const d = new Date(today);
              d.setDate(today.getDate() - (27 - i));
              return d.toISOString().split('T')[0];
            });
            const actSet = new Set(progress.activityDates ?? []);
            const weekLabels = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
            return (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ ...styles.card, marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📅 Attività — ultimi 28 giorni</p>
                  <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {actSet.size} {actSet.size === 1 ? 'giorno attivo' : 'giorni attivi'} • Streak: <span style={{ color: '#fb923c', fontWeight: 700 }}>{progress.streakDays} gg 🔥</span>
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
                    {weekLabels.map((l, i) => (
                      <div key={i} style={{ textAlign: 'center', fontSize: '0.62rem', color: '#475569', fontWeight: 600 }}>{l}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {days.map(date => {
                      const isToday = date === todayStr;
                      const active = actSet.has(date);
                      return (
                        <div key={date} title={date} style={{
                          aspectRatio: '1', borderRadius: '4px',
                          background: active ? '#fb923c' : '#1e293b',
                          border: isToday ? '2px solid #fb923c' : '1px solid transparent',
                          opacity: active ? 1 : 0.35,
                        }} />
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '0.7rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#fb923c', display: 'inline-block' }} /> Attivo
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1e293b', border: '1px solid #475569', display: 'inline-block', opacity: 0.5 }} /> Inattivo
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'transparent', border: '2px solid #fb923c', display: 'inline-block' }} /> Oggi
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          if (activeTab === 'vocabolario') {
            const allWords = [...progress.wordsLearned].reverse();
            return (
              <div style={{ marginBottom: '16px' }}>
                {/* Filtro */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {(['all', 'bookmarks'] as const).map(f => (
                    <button key={f} onClick={() => setVocabFilter(f)} style={{
                      flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer',
                      fontWeight: 'bold', fontSize: '0.8rem',
                      backgroundColor: vocabFilter === f ? '#fb923c' : '#1e293b',
                      color: vocabFilter === f ? '#fff' : '#94a3b8',
                    }}>
                      {f === 'all' ? '📚 Tutte le traduzioni' : '⭐ Preferiti'}
                    </button>
                  ))}
                </div>

                {vocabFilter === 'all' ? (
                  <div style={{ ...styles.card, marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      📚 Vocabolario — <span style={{ color: '#10b981', fontWeight: 700 }}>{allWords.length}</span> elementi
                    </p>
                    {allWords.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#475569', textAlign: 'center', padding: '20px 0' }}>Nessuna traduzione ancora. Prova a tradurre qualcosa!</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', maxHeight: '300px', overflowY: 'auto' }}>
                        {allWords.map((w, i) => (
                          <span key={i} title={w} style={{
                            fontSize: '0.78rem', padding: '4px 12px', borderRadius: '999px',
                            background: '#0f172a', border: '1px solid #334155',
                            color: '#e2e8f0', whiteSpace: 'nowrap', maxWidth: '220px',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{w}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ ...styles.card, marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      ⭐ Preferiti — <span style={{ color: '#fbbf24', fontWeight: 700 }}>{bookmarks.length}</span> salvati
                    </p>
                    {bookmarks.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#475569', textAlign: 'center', padding: '20px 0' }}>
                        Nessun preferito. Usa ⭐ dopo una traduzione per salvarlo qui!
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                        {bookmarks.map((bm, i) => (
                          <div key={i} style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '10px 12px', border: '1px solid #334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: '0 0 3px', fontSize: '0.7rem', color: '#64748b' }}>🇮🇹 Italiano</p>
                                <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#e2e8f0', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bm.it}</p>
                                <p style={{ margin: '0 0 3px', fontSize: '0.7rem', color: '#64748b' }}>{bm.langName}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#fb923c', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bm.tr}</p>
                              </div>
                              <button onClick={() => {
                                const updated = bookmarks.filter((_, j) => j !== i);
                                setBookmarks(updated);
                                saveBookmarks(updated);
                              }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', flexShrink: 0, padding: '2px' }} title="Rimuovi preferito">
                                <X size={14} />
                              </button>
                            </div>
                            <p style={{ margin: '6px 0 0', fontSize: '0.65rem', color: '#334155' }}>📅 {bm.date}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {bookmarks.length > 0 && (
                      <button onClick={() => { if (confirm('Svuotare tutti i preferiti?')) { setBookmarks([]); saveBookmarks([]); } }} style={{ marginTop: '10px', width: '100%', padding: '8px', backgroundColor: 'transparent', border: '1px solid #374151', color: '#6b7280', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                        🗑 Svuota preferiti
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // activeTab === 'progressi'
          const tips: string[] = [];
          if (progress.practiceAttempts === 0) tips.push('💡 Prova "Pratica Pronuncia" dopo una traduzione per allenarti a parlare!');
          if (avgScore > 0 && avgScore < 60) tips.push('💡 Parla più lentamente e scandisci ogni sillaba per migliorare il punteggio.');
          if (progress.translationCount > 0 && progress.aiTranslationCount === 0) tips.push('💡 Usa TUTOR AI per spiegazioni grammaticali e pronuncia guidata.');
          if (progress.streakDays >= 3) tips.push(`🔥 Streak da ${progress.streakDays} giorni — continua così!`);
          if (progress.wordsLearned.length >= 20) tips.push(`📚 Ottimo! Hai già ${progress.wordsLearned.length} parole in vocabolario.`);
          if (tips.length === 0) tips.push('💪 Usa l\'app ogni giorno per costruire il tuo vocabolario!');

          return (
            <div style={{ marginBottom: '16px' }}>
              {/* Livello */}
              <div style={{ ...styles.card, marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{levelInfo.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Il tuo livello</p>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: levelInfo.color }}>{levelInfo.label}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b' }}>{Math.round(totalScore)} pt</span>
                </div>
                {(() => {
                  const thresholds = [{ label: 'Base→Intermedio', cur: totalScore, max: 50, color: '#94a3b8' }, { label: 'Intermedio→Avanzato', cur: totalScore, max: 300, color: '#60a5fa' }, { label: 'Avanzato→Esperto', cur: totalScore, max: 1000, color: '#fb923c' }];
                  const active = totalScore < 50 ? thresholds[0] : totalScore < 300 ? thresholds[1] : thresholds[2];
                  return <ProgressBar label={active.label} value={Math.min(Math.round(totalScore), active.max)} max={active.max} color={active.color} suffix=" pt" />;
                })()}
              </div>

              {/* Grafico a barre */}
              {(() => {
                const bars = [
                  { label: '🎙 Pronuncia',   value: avgScore,                       max: 100, display: avgScore > 0 ? `${avgScore}%` : '—',           color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#60a5fa' },
                  { label: '📖 Vocabolario', value: progress.wordsLearned.length,   max: 50,  display: `${progress.wordsLearned.length} parole`,        color: '#10b981' },
                  { label: '🌍 Traduzioni',  value: progress.translationCount,      max: 50,  display: `${progress.translationCount}`,                  color: '#fb923c' },
                  { label: '🤖 Tutor AI',    value: progress.aiTranslationCount,    max: 20,  display: `${progress.aiTranslationCount}`,                color: '#a855f7' },
                  { label: '🔥 Streak',      value: progress.streakDays,            max: 14,  display: `${progress.streakDays} gg`,                     color: '#f97316' },
                  { label: '⏱ Ore studio',  value: progress.totalMinutes,          max: 300, display: `${hours}h ${mins}m`,                            color: '#38bdf8' },
                ];
                const W = 260, barH = 14, gap = 10, labelW = 112;
                const chartH = bars.length * (barH + gap) - gap;
                return (
                  <div style={{ ...styles.card, marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>📊 Panoramica progressi</p>
                    <svg viewBox={`0 0 ${W + labelW + 4} ${chartH + 4}`} style={{ width: '100%', display: 'block' }}>
                      {bars.map((b, i) => {
                        const pct = Math.min(b.value / b.max, 1);
                        const y = 2 + i * (barH + gap);
                        const barW = Math.max(pct * W, pct > 0 ? 6 : 0);
                        return (
                          <g key={b.label}>
                            {/* etichetta */}
                            <text x={labelW - 6} y={y + barH / 2} textAnchor="end" dominantBaseline="middle" fontSize="10.5" fill="#94a3b8">{b.label}</text>
                            {/* sfondo barra */}
                            <rect x={labelW} y={y} width={W} height={barH} rx={barH / 2} fill="#1e293b" />
                            {/* barra dati */}
                            {barW > 0 && <rect x={labelW} y={y} width={barW} height={barH} rx={barH / 2} fill={b.color} />}
                            {/* valore */}
                            <text x={labelW + W + 4} y={y + barH / 2} dominantBaseline="middle" fontSize="10" fontWeight="bold" fill={b.color}>{b.display}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}

              {/* Reset */}
              <button
                onClick={() => { if (confirm('Vuoi azzerare tutti i progressi?')) { const p = defaultProgress(); saveProgress(p); setProgress(p); } }}
                style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', marginBottom: '10px' }}
              >
                🗑 Azzera progressi
              </button>

              <section style={{ ...styles.card, border: '1px solid #334155', marginBottom: '10px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>💬 Consigli personalizzati</p>
                {tips.map((tip, i) => (
                  <p key={i} style={{ margin: i > 0 ? '8px 0 0' : 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.5' }}>{tip}</p>
                ))}
              </section>
            </div>
          );
        })()}
        </section>
        )}

        {/* Footer Privacy */}
        <footer style={{ textAlign: 'center', marginTop: '18px', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {[
              { label: '👤 Autore', value: 'Livio Mazzocchi', color: '#3b82f6' },
              { label: '📄 Licenza', value: 'MIT', color: '#10b981' },
              { label: '🔖 Versione', value: 'v1.3.0', color: '#a855f7' },
            ].map(b => (
              <span key={b.label} style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px',
                background: `${b.color}22`, border: `1px solid ${b.color}55`,
                color: b.color, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {b.label}: <span style={{ fontWeight: 400, color: '#64748b' }}>{b.value}</span>
              </span>
            ))}
          </div>
          <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#334155' }}>© 2025 Livio Mazzocchi — Tutti i diritti riservati</p>
          <button
            onClick={() => setShowPrivacy(true)}
            style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            🔒 Privacy &amp; Cookie
          </button>
        </footer>

        {/* Demo banner fisso in basso */}
        {demoActive && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10000,
            background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
            borderTop: '2px solid #10b981',
            padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: '6px',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {(() => {
              const allSteps = [DEMO_STEPS, DEMO2_STEPS, DEMO3_STEPS, DEMO4_STEPS];
              const activeSteps = allSteps[activeDemoNum - 1];
              const step = activeSteps[demoStep];
              return <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.3rem' }}>{step?.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: '#10b981', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Demo {activeDemoNum} &nbsp;·&nbsp; {step?.label}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.3' }}>
                      {step?.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={stopDemo}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}
                >
                  Salta
                </button>
              </>;
            })()}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[DEMO_STEPS, DEMO2_STEPS, DEMO3_STEPS, DEMO4_STEPS][activeDemoNum - 1].map((_, idx) => (
                <div key={idx} style={{
                  flex: 1, height: '3px', borderRadius: '2px',
                  backgroundColor: idx <= demoStep ? '#10b981' : 'rgba(255,255,255,0.15)',
                  transition: 'background-color 0.4s',
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Privacy Modal */}
        {showPrivacy && (
          <div
            onClick={() => setShowPrivacy(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '20px',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '14px', padding: '24px', maxWidth: '420px', width: '100%',
              }}
            >
              <h2 style={{ margin: '0 0 14px', fontSize: '1.1rem', color: '#f8fafc' }}>🔒 Informativa Privacy</h2>

              {[
                { title: 'Dati salvati localmente', body: 'Il profilo utente (nome, lingua, livello) e i progressi sono salvati solo sul tuo dispositivo tramite localStorage. Non vengono mai trasmessi a nessun server esterno.' },
                { title: 'Testi elaborati da AI', body: 'I testi che scrivi per traduzione, chat e grammatica vengono inviati a DeepSeek AI (via OpenRouter) esclusivamente per generare la risposta. Non vengono conservati o usati per addestrare modelli.' },
                { title: 'Cookie', body: 'Questa app non utilizza cookie di profilazione, analytics o tracciamento di terze parti.' },
                { title: 'Titolare', body: 'Livio Mazzocchi — servizio digitale per l\'apprendimento linguistico, con possibili sviluppi commerciali futuri.' },
              ].map(s => (
                <div key={s.title} style={{ marginBottom: '14px' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.82rem', color: '#fb923c' }}>{s.title}</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>{s.body}</p>
                </div>
              ))}

              <button
                onClick={() => setShowPrivacy(false)}
                style={{
                  marginTop: '6px', width: '100%', padding: '10px',
                  background: '#fb923c', border: 'none', borderRadius: '8px',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                Ho capito
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Cursore animato demo — segue i punti di interesse */}
      {demoActive && demoCursorPos && (
        <div
          style={{
            position: 'fixed',
            left: demoCursorPos.x,
            top: demoCursorPos.y,
            zIndex: 99999,
            pointerEvents: 'none',
            transition: 'left 0.65s cubic-bezier(0.4,0,0.2,1), top 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.15s ease',
            transform: `translate(-2px, -2px) scale(${demoCursorClicking ? 0.68 : 1})`,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
          }}
        >
          <svg width="22" height="28" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2L2 22L7.5 17L11 26L14 24.5L10.5 15.5L17.5 15.5Z" fill="white" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
          </svg>
        </div>
      )}

    </div>
  );
}
