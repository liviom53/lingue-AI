import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Send, Loader2, AlertCircle, Bot, X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'profilo' | 'progressi'>('profilo');
  const [showTabPanel, setShowTabPanel] = useState(false);
  const [progress, setProgress] = useState<ProgressStats>(loadProgress);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  // Roleplay
  const [roleplayScenario, setRoleplayScenario] = useState<string | null>(null);
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const moreLangsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setProgress(prev => {
      if (prev.lastActiveDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const streak = prev.lastActiveDate === yesterday ? prev.streakDays + 1 : 1;
      const updated = { ...prev, lastActiveDate: today, streakDays: streak };
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

  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
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

  const currentLocale = (ALL_LANGUAGES.find(l => l.code === selectedLang) ?? ALL_LANGUAGES[0]).locale;
  const langVoices = voices.filter(v => v.lang.startsWith(selectedLang));
  const availableVoices = langVoices.length > 0 ? langVoices : voices;

  const speak = (text: string) => {
    // Stop anything currently playing
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const ut = new SpeechSynthesisUtterance(text);
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

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setPracticeResult(null);
    setTranslatedText('');
    setAiExplanation(null);
    setPhonetic(null);

    try {
      const { translation, pronunciation } = await translateText(inputText, selectedLang);
      setTranslatedText(translation);
      speak(translation);
      setProgress(prev => {
        const word = translation.toLowerCase().trim();
        const wordsLearned = prev.wordsLearned.includes(word) ? prev.wordsLearned : [...prev.wordsLearned, word];
        const langStats = { ...prev.langStats, [selectedLang]: (prev.langStats[selectedLang] ?? 0) + 1 };
        const updated = { ...prev, translationCount: prev.translationCount + 1, wordsLearned, langStats };
        saveProgress(updated);
        return updated;
      });
      if (selectedLang === 'en') {
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

  const styles: Record<string, React.CSSProperties> = {
    main: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      padding: '12px',
      fontFamily: 'sans-serif',
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '10px',
      border: '1px solid #334155',
    },
    btn: {
      width: '100%',
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#fb923c',
      color: '#fff',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
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

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[
            { label: '👤 Autore', value: 'Livio Mazzocchi', color: '#3b82f6' },
            { label: '📄 Licenza', value: 'MIT', color: '#10b981' },
            { label: '🔖 Versione', value: 'v1.3.0', color: '#a855f7' },
          ].map(b => (
            <span key={b.label} style={{
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '999px',
              background: `${b.color}22`,
              border: `1px solid ${b.color}66`,
              color: b.color,
              fontWeight: 600,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}>
              {b.label}: <span style={{ fontWeight: 400, color: '#cbd5e1' }}>{b.value}</span>
            </span>
          ))}
        </div>

        <section style={styles.card}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { setSelectedLang(l.code); setShowMoreLangs(false); }}
                style={{
                  padding: '8px',
                  backgroundColor: selectedLang === l.code ? '#fb923c' : '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                <FlagImg fc={l.fc} name={l.name} /> {l.name}
              </button>
            ))}
            <div ref={moreLangsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMoreLangs(v => !v)}
                style={{
                  width: '100%',
                  padding: '8px 4px',
                  backgroundColor: MORE_LANGUAGES.some(l => l.code === selectedLang) ? '#fb923c' : '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  fontSize: 'clamp(0.7rem, 3.5vw, 1rem)',
                }}
              >
                {(() => { const ml = MORE_LANGUAGES.find(l => l.code === selectedLang); return ml ? <><FlagImg fc={ml.fc} name={ml.name} /> {ml.name}</> : <>🌍 Altre lingue</>; })()}
                <ChevronDown size={14} style={{ marginLeft: '2px', transform: showMoreLangs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
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

        <section style={styles.card}>
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
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTranslate(); } }}
            placeholder="Scrivi in italiano..."
          />
          <button
            style={{ ...styles.btn, backgroundColor: isListening ? '#ef4444' : '#334155' }}
            onClick={startInputSpeech}
          >
            <Mic size={18} /> DETTA
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              style={{ ...styles.btn, backgroundColor: '#fb923c', marginTop: '6px' }}
              onClick={handleTranslate}
              disabled={loading || aiLoading}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} TRADUCI
            </button>
            <button
              style={{ ...styles.btn, backgroundColor: '#e8d0a0', color: '#1e293b', marginTop: '6px', fontSize: '0.85rem' }}
              onClick={handleAiTranslate}
              disabled={loading || aiLoading}
              title="Traduzione AI con spiegazione grammaticale"
            >
              {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />} TUTOR AI
            </button>
          </div>
          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </section>

        <section style={styles.card}>
          <button
            onClick={() => setShowVoiceSettings(v => !v)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 0,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: showVoiceSettings ? '10px' : 0,
            }}
          >
            <span>⚙️ Impostazioni voce</span>
            {showVoiceSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
          <section style={{ ...styles.card, borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, fontSize: '1.2rem', fontWeight: 'bold', lineHeight: '1.7', flexWrap: 'wrap', display: 'flex', gap: '4px' }}>
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
        <section style={{ ...styles.card, border: '1px solid #fb923c' }}>
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

        {/* Toggle per profilo/progressi */}
        <div style={{ margin: '16px 0 8px' }}>
          <button
            onClick={() => setShowTabPanel(v => !v)}
            style={{
              width: '100%',
              background: 'none',
              border: '1px solid #334155',
              borderRadius: '10px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            <span>👤 Profilo &nbsp;·&nbsp; 📊 Progressi</span>
            {showTabPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showTabPanel && (
        <>
        <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', margin: '0 0 8px', border: '1px solid #334155' }}>
          {(['profilo', 'progressi'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
              backgroundColor: activeTab === tab ? '#fb923c' : '#1e293b',
              color: activeTab === tab ? '#fff' : '#94a3b8',
              transition: 'background 0.2s',
            }}>
              {tab === 'profilo' ? '👤 Profilo' : '📊 Progressi'}
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
        </>
        )}

        {/* Footer Privacy */}
        <footer style={{ textAlign: 'center', marginTop: '18px', paddingBottom: '12px' }}>
          <button
            onClick={() => setShowPrivacy(true)}
            style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            🔒 Privacy &amp; Cookie
          </button>
        </footer>

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
    </div>
  );
}
