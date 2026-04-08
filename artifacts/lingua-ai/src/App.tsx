import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Send, Loader2, AlertCircle, Bot, X, ChevronDown, ChevronUp, Copy, Check, Share2, BookmarkPlus, BookmarkCheck, RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import appIcon from '@assets/icon-192_1775392140519.png';
import { styles } from './styles';

async function translateText(text: string, targetLang: string): Promise<{ translation: string; pronunciation?: string }> {
  const res = await fetch('/api/ai/lingva', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err.error ?? 'Nessun server di traduzione raggiungibile. Riprova tra qualche secondo.');
  }
  const data = await res.json() as any;
  return {
    translation: data.translation,
    pronunciation: data.pronunciation ?? undefined,
  };
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
  studi: string;
  hobby: string;
  interessi: string;
  musica: string;
  altro: string;
}

const defaultProfile = (): UserProfile => ({ nome: '', eta: '', sesso: '', occupazione: '', citta: '', studi: '', hobby: '', interessi: '', musica: '', altro: '' });

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

// ── Cache traduzioni offline ────────────────────────────────────────────────
const CACHE_KEY = 'lingua_ai_translation_cache';
const CACHE_MAX = 40;

interface CachedTranslation {
  text: string;
  lang: string;
  translation: string;
  pronunciation: string | null;
  cachedAt: number;
}

const loadCache = (): CachedTranslation[] => {
  try { const s = localStorage.getItem(CACHE_KEY); if (s) return JSON.parse(s); } catch {}
  return [];
};

const saveToCache = (entry: CachedTranslation) => {
  try {
    const cache = loadCache().filter(e => !(e.text === entry.text && e.lang === entry.lang));
    cache.unshift(entry);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache.slice(0, CACHE_MAX)));
  } catch {}
};

const lookupCache = (text: string, lang: string): CachedTranslation | null => {
  const norm = text.trim().toLowerCase();
  return loadCache().find(e => e.text.trim().toLowerCase() === norm && e.lang === lang) ?? null;
};

export default function App() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{
    score: number;
    spoken: string;
    wordResults: { expected: string; correct: boolean }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fromCache, setFromCache] = useState(false);

  // ── Aggiornamento PWA ───────────────────────────────────────────────────────
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) { console.log('SW registrato:', r); },
    onRegisterError(e) { console.warn('SW errore:', e); },
  });

  // ── Installazione PWA (A2HS) ─────────────────────────────────────────────
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installDismissed, setInstallDismissed] = useState(() => localStorage.getItem('pwa_install_dismissed') === '1');
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [speechRate, setSpeechRate] = useState(0.6);
  const [loopCount, setLoopCount] = useState(1);
  const loopActiveRef = useRef(false);
  const [ipaText, setIpaText] = useState<string | null>(null);
  const [phonetic, setPhonetic] = useState<string | null>(null);
  const [ipaData, setIpaData] = useState<{ ipa: string; syllables: string } | null>(null);
  const [ipaLoading, setIpaLoading] = useState(false);
  const [shadowUserAmps, setShadowUserAmps] = useState<number[]>([]);
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
  const [showDonazioni, setShowDonazioni] = useState(false);
  const [showAccessibilita, setShowAccessibilita] = useState(false);
  const [modalitaAccessibile, setModalitaAccessibile] = useState(() => localStorage.getItem('modalita_accessibile') === '1');
  const [talkbackInApp, setTalkbackInApp] = useState(() => localStorage.getItem('talkback_inapp') === '1');
  const [ipovedenti, setIpovedenti] = useState(() => localStorage.getItem('modalita_ipovedenti') === '1');

  useEffect(() => {
    if (!talkbackInApp) return;
    const speak = (text: string) => {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'it-IT';
      utt.rate = 1.0;
      window.speechSynthesis.speak(utt);
    };
    const handleClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const tag = el.tagName.toLowerCase();
      // Se l'utente clicca dentro un input/textarea già focalizzato, non interrompere la scrittura
      if ((tag === 'input' || tag === 'textarea') && document.activeElement === el) return;
      const node = el.closest('[aria-label]') || el.closest('button') || el.closest('a') || el.closest('[role]') || el;
      const label =
        node.getAttribute('aria-label') ||
        node.getAttribute('placeholder') ||
        (node as HTMLElement).innerText?.replace(/\s+/g, ' ').trim().slice(0, 120);
      if (label) speak(label);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [talkbackInApp]);

  // Modalità ipovedenti: legge automaticamente la traduzione quando arriva
  const ipovedentiRef = useRef(ipovedenti);
  useEffect(() => { ipovedentiRef.current = ipovedenti; }, [ipovedenti]);
  useEffect(() => {
    if (!ipovedenti || !translatedText) return;
    // Legge sempre UNA sola volta (ignora loopCount) per evitare "musica continua"
    const t = setTimeout(() => {
      if (demoActiveRef.current || blockSpeakRef.current) return;
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(translatedText.trimEnd() + '\u00A0\u00A0\u00A0');
      ut.lang = currentLocale;
      ut.rate = speechRate;
      const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) ut.voice = voice;
      window.speechSynthesis.speak(ut);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translatedText, ipovedenti]);

  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showFunzionalitaApp, setShowFunzionalitaApp] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpSearch, setHelpSearch] = useState('');
  const [helpFilter, setHelpFilter] = useState('');
  const [helpAiResult, setHelpAiResult] = useState<string | null>(null);
  const [helpAiLoading, setHelpAiLoading] = useState(false);
  const [activeDemoNum, setActiveDemoNum] = useState<1|2|3|4>(1);
  const [progress, setProgress] = useState<ProgressStats>(loadProgress);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(() => {
    if (localStorage.getItem('profile_popup_dismissed') === '1') return false;
    const p = loadProfile();
    return !p.nome?.trim();
  });
  // Roleplay
  const [roleplayScenario, setRoleplayScenario] = useState<string | null>(null);
  // Segnalibri
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);
  const [bookmarked, setBookmarked] = useState(false);
  const [shared, setShared] = useState(false);
  const [vocabFilter, setVocabFilter] = useState<'all' | 'bookmarks'>('all');
  // Quiz Tatoeba
  const [showTatoeba, setShowTatoeba] = useState(false);
  const [tatPairs, setTatPairs] = useState<{ it: string; tr: string }[]>([]);
  const [tatIdx, setTatIdx] = useState(0);
  const [tatOptions, setTatOptions] = useState<string[]>([]);
  const [tatSelected, setTatSelected] = useState<string | null>(null);
  const [tatScore, setTatScore] = useState(0);
  const [tatTotal, setTatTotal] = useState(0);
  const [tatLoading, setTatLoading] = useState(false);
  const [tatError, setTatError] = useState<string | null>(null);
  // Grammatica X-Ray
  const [xrayWord, setXrayWord] = useState<string | null>(null);
  const [xrayData, setXrayData] = useState<{ pos: string; gender: string; tense: string; info: string } | null>(null);
  const [xrayLoading, setXrayLoading] = useState(false);
  // Shadowing
  const [showShadow, setShowShadow] = useState(false);
  const [shadowPhrase, setShadowPhrase] = useState<{ phrase: string; phonetic: string; translation: string } | null>(null);
  const [shadowStep, setShadowStep] = useState<'idle' | 'speaking' | 'listening' | 'result'>('idle');
  const [shadowScore, setShadowScore] = useState<number | null>(null);
  const [shadowError, setShadowError] = useState<string | null>(null);
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
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

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

  const speak = (text: string, rateOverride?: number) => {
    // During demo (or right after stopping it) the Italian narration handles audio
    if (demoActiveRef.current || blockSpeakRef.current) return;
    // Stop anything currently playing + cancel active loop
    window.speechSynthesis.cancel();
    loopActiveRef.current = true;
    let iteration = 0;

    const doSpeak = () => {
      const ut = new SpeechSynthesisUtterance(text.trimEnd() + '\u00A0\u00A0\u00A0');
      ut.lang = currentLocale;
      ut.rate = rateOverride ?? speechRate;
      const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) ut.voice = voice;

      // Chrome desktop bug: synthesis stalls after ~15s idle.
      const keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(keepAlive);
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      ut.onend = () => {
        clearInterval(keepAlive);
        iteration++;
        if (loopActiveRef.current && iteration < loopCount) {
          setTimeout(doSpeak, 500);
        } else {
          loopActiveRef.current = false;
        }
      };
      ut.onerror = () => { clearInterval(keepAlive); loopActiveRef.current = false; };

      window.speechSynthesis.speak(ut);
    };

    // Small delay so cancel() finishes before the next speak() call (Chrome quirk)
    setTimeout(doSpeak, 50);
  };

  const stopLoop = () => {
    loopActiveRef.current = false;
    window.speechSynthesis.cancel();
  };

  const fetchIpa = async () => {
    if (!translatedText) return;
    setIpaLoading(true);
    try {
      const r = await fetch('/api/ai/ipa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translatedText, targetLang: selectedLang }),
      });
      const data = await r.json() as any;
      setIpaData(data.ipa ? data : null);
    } catch {
      setIpaData(null);
    } finally {
      setIpaLoading(false);
    }
  };

  const micErrorMsg = (code: string) => {
    if (code === 'not-allowed' || code === 'NotAllowedError')
      return '🚫 Microfono bloccato — apri Chrome → 🔒 accanto all\'URL → Microfono → Consenti';
    if (code === 'no-speech') return '🎙️ Nessuna voce sentita — riprova';
    if (code === 'network') return '🌐 Errore di rete — controlla la connessione e riprova';
    if (code === 'audio-capture') return '🎙️ Microfono non trovato — controlla le autorizzazioni';
    return `⚠️ Errore microfono (${code}) — riprova`;
  };

  const startInputSpeech = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setDictError('⚠️ Dettatura non supportata — usa Chrome o Safari');
      return;
    }
    setDictError(null);
    const recognition = new SR();
    recognition.lang = 'it-IT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let gotResult = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      gotResult = true;
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      // Modalità ipovedenti: traduci automaticamente dopo la dettatura
      if (ipovedentiRef.current) {
        setTimeout(() => handleAiTranslate(transcript), 200);
      }
    };
    recognition.onerror = (e: any) => {
      gotResult = true;
      setIsListening(false);
      setDictError(micErrorMsg(e.error));
    };
    recognition.onend = () => {
      setIsListening(false);
      if (!gotResult) setDictError('🎙️ Nessuna voce sentita — riprova');
    };
    try { recognition.start(); } catch (e: any) {
      setIsListening(false);
      setDictError(micErrorMsg(e.name ?? 'unknown'));
    }
  };

  const buildTatOptions = (pairs: { it: string; tr: string }[], idx: number) => {
    const correct = pairs[idx].tr;
    const distractors = pairs
      .filter((_, i) => i !== idx)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(p => p.tr);
    return [...distractors, correct].sort(() => Math.random() - 0.5);
  };

  const fetchTatoebaQuiz = async (lang: string) => {
    setTatLoading(true);
    setTatError(null);
    setTatPairs([]);
    setTatIdx(0);
    setTatSelected(null);
    setTatScore(0);
    setTatTotal(0);
    try {
      const res = await fetch(`/api/ai/tatoeba-quiz?targetLang=${lang}`);
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error ?? 'Errore Tatoeba');
      const pairs: { it: string; tr: string }[] = data.questions;
      setTatPairs(pairs);
      setTatOptions(buildTatOptions(pairs, 0));
    } catch (e: any) {
      setTatError(e.message ?? 'Errore di rete');
    } finally {
      setTatLoading(false);
    }
  };

  const handleTranslate = async (langOverride?: string, textOverride?: string) => {
    const text = textOverride ?? inputText;
    if (!text.trim()) return;
    const lang = typeof langOverride === 'string' ? langOverride : selectedLang;
    if (textOverride) setInputText(textOverride);
    setLoading(true);
    setError(null);
    setPracticeResult(null);
    setTranslatedText('');
    setAiExplanation(null);
    setPhonetic(null);
    setIpaData(null);
    setBookmarked(false);
    setFromCache(false);

    // ── Offline: prova la cache ──────────────────────────────────────────────
    if (!navigator.onLine) {
      const cached = lookupCache(text, lang);
      if (cached) {
        setTranslatedText(cached.translation);
        setIpaText(cached.pronunciation ?? null);
        setFromCache(true);
        speak(cached.translation);
        setLoading(false);
        return;
      }
      setError('Sei offline e questa frase non è in cache. Riconnettiti per tradurre.');
      setLoading(false);
      return;
    }

    try {
      const { translation, pronunciation } = await translateText(text, lang);
      setTranslatedText(translation);
      speak(translation);
      saveToCache({ text, lang, translation, pronunciation: pronunciation ?? null, cachedAt: Date.now() });
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

  const handleAiTranslate = async (textOverride?: string) => {
    const text = textOverride ?? inputText;
    if (!text.trim()) return;
    if (textOverride) setInputText(textOverride);
    setAiLoading(true);
    setError(null);
    setPracticeResult(null);
    setTranslatedText('');
    setAiExplanation(null);
    setIpaText(null);
    setPhonetic(null);
    setIpaData(null);
    setBookmarked(false);

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: selectedLang, userProfile: profile }),
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
    if (!translatedText) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('⚠️ Riconoscimento vocale non supportato — usa Chrome o Safari'); return; }
    setIsPracticing(true);
    setPracticeResult(null);
    const recognition = new SR();
    const langInfo = ALL_LANGUAGES.find(l => l.code === selectedLang) ?? ALL_LANGUAGES[0];
    recognition.lang = langInfo.locale;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let gotResult = false;
    recognition.onresult = (e: any) => {
      gotResult = true;
      const spoken = (e.results[0][0].transcript as string).trim();
      const expectedWords = normalizeText(translatedText).split(' ');
      const spokenWords = normalizeText(spoken).split(' ');
      const wordResults = expectedWords.map((word, i) => ({
        expected: word,
        correct: spokenWords[i] === word,
      }));
      const correct = wordResults.filter(r => r.correct).length;
      const score = Math.round((correct / expectedWords.length) * 100);
      setPracticeResult({ score, spoken, wordResults });
      setIsPracticing(false);
      setProgress(prev => {
        const practiceScores = [...prev.practiceScores, score];
        const updated = { ...prev, practiceAttempts: prev.practiceAttempts + 1, practiceScores };
        saveProgress(updated);
        return updated;
      });
    };
    recognition.onerror = (e: any) => { gotResult = true; setIsPracticing(false); alert(micErrorMsg(e.error)); };
    recognition.onend = () => { if (!gotResult) setIsPracticing(false); };
    try { recognition.start(); } catch (e: any) { setIsPracticing(false); alert(micErrorMsg(e.name ?? 'unknown')); }
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
    if (!shadowPhrase) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setShadowError('⚠️ Riconoscimento vocale non supportato — usa Chrome o Safari');
      return;
    }
    setShadowStep('listening');
    setShadowError(null);
    setShadowUserAmps([]);

    const recognition = new SR();
    const langInfo = ALL_LANGUAGES.find(l => l.code === selectedLang) ?? ALL_LANGUAGES[0];
    recognition.lang = langInfo.locale;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    let gotResult = false;

    recognition.onresult = (e: any) => {
      gotResult = true;
      const spoken = (e.results[0][0].transcript as string).trim();
      setShadowSpoken(spoken);
      const expectedWords = normalizeText(shadowPhrase!.phrase).split(' ');
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
    recognition.onerror = (e: any) => {
      gotResult = true;
      setShadowError(micErrorMsg(e.error));
      setShadowStep('idle');
    };
    recognition.onend = () => {
      if (!gotResult) {
        setShadowError('🎙️ Nessuna voce sentita — riprova parlando più vicino al microfono');
        setShadowStep('idle');
      }
    };
    try { recognition.start(); } catch (e: any) {
      setShadowError(micErrorMsg(e.name ?? 'unknown'));
      setShadowStep('idle');
    }
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

  const langName = (ALL_LANGUAGES.find(l => l.code === selectedLang) ?? ALL_LANGUAGES[0]).name;

  return (
    <div style={styles.main}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <img src={appIcon} alt="Impara una Lingua" style={{ width: '80px', height: '80px', borderRadius: '14px', flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(1rem, 5vw, 1.9rem)', lineHeight: 1.2 }}>Impara una lingua con l&apos;AI</h1>
            <p style={{ color: '#f97316', fontSize: 'clamp(0.8rem, 3.8vw, 1.45rem)', margin: '4px 0 0' }}>Inizia a parlarla male... poi si vedrà</p>
          </div>
        </header>

        {/* Banner aggiornamento PWA */}
        {needRefresh && (
          <div style={{ background: '#1e293b', border: '1px solid #a855f7', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', fontSize: '0.82rem', color: '#d8b4fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span>🔄 Nuova versione disponibile</span>
            <button
              onClick={() => updateServiceWorker(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <RefreshCw size={13} /> Aggiorna
            </button>
          </div>
        )}

        {/* Banner installazione PWA */}
        {installPrompt && !installDismissed && (
          <div style={{ background: '#0f2a1a', border: '1px solid #10b981', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', fontSize: '0.82rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span>📲 Installa l&apos;app sul telefono</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={async () => {
                  installPrompt.prompt();
                  const { outcome } = await installPrompt.userChoice;
                  if (outcome === 'accepted') { setInstallPrompt(null); }
                }}
                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                Installa
              </button>
              <button
                onClick={() => { setInstallDismissed(true); localStorage.setItem('pwa_install_dismissed', '1'); }}
                style={{ background: 'transparent', color: '#6ee7b7', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Banner offline */}
        {!isOnline && (
          <div style={{ background: '#1e293b', border: '1px solid #f97316', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', fontSize: '0.82rem', color: '#fdba74' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📵 Sei offline</div>
            <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>
              Funzionano ancora: <strong style={{ color: '#e2e8f0' }}>segnalibri, quiz, profilo, pronuncia</strong>.<br />
              La traduzione usa la cache (frasi già cercate). Nuove frasi richiedono connessione.
            </div>
          </div>
        )}

        {/* Popup: completa il profilo */}
        {showProfilePopup && (
          <div
            onClick={() => setShowProfilePopup(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: 'linear-gradient(140deg, #1e3a5f 0%, #1e293b 60%, #0f1c2d 100%)', border: '1px solid #60a5fa', borderRadius: '18px', padding: '28px 24px 22px', maxWidth: '380px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}
            >
              <div style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '8px' }}>👤</div>
              <h2 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 700, textAlign: 'center', color: '#f8fafc' }}>
                Compila il tuo profilo
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.55 }}>
                L&apos;AI usa nome, età, livello e interessi per personalizzare traduzione, spiegazioni e vocabolario — più dati dai, più precisa diventa.
              </p>
              <button
                onClick={() => {
                  setShowProfilePopup(false);
                  setShowTabPanel(true);
                  setActiveTab('profilo');
                  setTimeout(() => {
                    document.querySelector('[data-demo="tab-panel-toggle"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: '10px' }}
              >
                Vai al profilo →
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setShowProfilePopup(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', padding: '4px 0' }}
                >
                  Più tardi
                </button>
                <button
                  onClick={() => { setShowProfilePopup(false); localStorage.setItem('profile_popup_dismissed', '1'); }}
                  style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', padding: '4px 0' }}
                >
                  Non mostrare più
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Demo & Funzionalità */}
        <section style={{ ...styles.card, border: '1px solid #10b981', marginBottom: '4px' }}>
          <button
            onClick={() => setShowDemoMenu(v => !v)}
            style={{ width: '100%', background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, fontSize: '0.9rem', fontWeight: 'bold', marginBottom: showDemoMenu ? '10px' : 0 }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <FlagImg fc="it" name="Italiano" />
              <span>▶ Demo - Help</span>
            </span>
            {showDemoMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showDemoMenu && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {([
                { key: 'demo1', icon: '🌍', label: 'Demo Traduzione',  sub: 'X-Ray grammaticale',    active: false, onClick: () => startDemo(1) },
                { key: 'demo2', icon: '🎙️', label: 'Demo Shadowing',  sub: 'Ripeti e impara',       active: false, onClick: () => startDemo(2) },
                { key: 'demo3', icon: '🤖', label: 'Demo Chat AI',    sub: 'Conversa con DeepSeek', active: false, onClick: () => startDemo(3) },
                { key: 'demo4', icon: '⭐', label: 'Demo Vocabolario', sub: 'Salva e ripassa',       active: false, onClick: () => startDemo(4) },
                { key: 'help',  icon: '❓', label: 'Aiuto',            sub: showHelp ? 'Chiudi ▲' : 'Come usare l\'app ▼',             active: showHelp,             onClick: () => setShowHelp(v => !v) },
                { key: 'video', icon: '🎬', label: 'Funzionalità App', sub: showFunzionalitaApp ? 'Chiudi ▲' : 'Scopri il video demo ▼', active: showFunzionalitaApp, onClick: () => setShowFunzionalitaApp(v => !v) },
              ]).map(({ key, icon, label, sub, active, onClick }) => (
                <button
                  key={key}
                  onClick={onClick}
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: `1px solid ${active ? '#6d28d9' : '#1e3a5f'}`, borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '0.82rem',
                    backgroundColor: active ? '#2e1065' : '#1e293b', color: '#e2e8f0',
                    display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
                  <span style={{ flex: 1 }}>{label}</span>
                  <span style={{ fontSize: '0.75rem', color: active ? '#a78bfa' : '#94a3b8', fontWeight: 400 }}>{sub}</span>
                </button>
              ))}
              {showHelp && (
                <div style={{ marginTop: '6px', borderRadius: '10px', border: '1px solid #1e3a5f', backgroundColor: '#0f172a', overflow: 'hidden' }}>
                  {/* Intestazione */}
                  <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#0f172a)', padding: '12px 14px 8px', borderBottom: '1px solid #1e3a5f' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '2px' }}>❓ Come usare Lingue & AI</div>
                    <div style={{ fontSize: '0.73rem', color: '#64748b' }}>Guida rapida alle funzionalità</div>
                  </div>

                  {/* Barra di ricerca */}
                  <div style={{ padding: '10px 12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Cerca nell'aiuto… (es: pronuncia, quiz, offline)"
                      value={helpSearch}
                      onChange={e => { setHelpSearch(e.target.value); if (!e.target.value) { setHelpFilter(''); setHelpAiResult(null); } }}
                      onKeyDown={e => { if (e.key === 'Enter') setHelpFilter(helpSearch); }}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '8px 12px',
                        borderRadius: '8px', border: '1px solid #1e3a5f', background: '#1e293b',
                        color: '#e2e8f0', fontSize: '0.82rem', outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => { setHelpFilter(helpSearch); setHelpAiResult(null); }}
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: '8px', border: 'none',
                          background: 'linear-gradient(135deg,#ea580c,#f97316)',
                          color: '#fff', fontWeight: 'bold', fontSize: '0.79rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        }}
                      >
                        🔍 Cerca
                      </button>
                      <button
                        disabled={helpAiLoading}
                        onClick={async () => {
                          const q = helpSearch.trim() || 'panoramica funzionalità';
                          setHelpAiLoading(true);
                          setHelpAiResult(null);
                          setHelpFilter('');
                          try {
                            const r = await fetch('/api/ai/app-help', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ query: q }),
                            });
                            const d = await r.json();
                            setHelpAiResult(d.answer ?? d.error ?? 'Nessuna risposta.');
                          } catch {
                            setHelpAiResult('Errore di connessione. Riprova.');
                          } finally {
                            setHelpAiLoading(false);
                          }
                        }}
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: '8px',
                          border: '1px solid #a16207',
                          background: 'linear-gradient(135deg,#78350f,#92400e)',
                          color: '#fde68a',
                          fontWeight: 'bold', fontSize: '0.79rem',
                          cursor: helpAiLoading ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                          opacity: helpAiLoading ? 0.6 : 1,
                        }}
                      >
                        {helpAiLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : '🤖'} Chiedi AI
                      </button>
                    </div>

                    {/* Risultato AI */}
                    {helpAiResult && (
                      <div style={{ background: '#1e3a5f', border: '1px solid #2563eb', borderRadius: '8px', padding: '10px 12px', fontSize: '0.8rem', color: '#bfdbfe', lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 'bold', color: '#93c5fd', marginBottom: '4px', fontSize: '0.75rem' }}>🤖 Risposta AI</div>
                        {helpAiResult}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '46vh', overflowY: 'auto' }}>
                    {([
                      {
                        icon: '🌍', title: 'Traduzione',
                        items: [
                          'Scrivi una frase in italiano nel campo di testo',
                          'Scegli la lingua di destinazione (bandierine)',
                          'Premi "Traduci" per la traduzione rapida oppure "Spiega con AI" per una traduzione contestualizzata con pronuncia fonetica e spiegazione grammaticale',
                        ],
                      },
                      {
                        icon: '🔬', title: 'X-Ray grammaticale',
                        items: [
                          'Clicca su qualsiasi parola della traduzione per analizzarla',
                          'Vedrai: parte del discorso, genere, tempo verbale e curiosità sulla parola',
                          'Ottimo per capire come funziona la lingua, non solo cosa significa',
                        ],
                      },
                      {
                        icon: '🔊', title: 'Pronuncia & Ascolto',
                        items: [
                          'Clicca 🔊 per ascoltare la traduzione con sintesi vocale',
                          'Regola la velocità con lo slider (lento/veloce)',
                          'Scegli la voce preferita dal selettore (se disponibile)',
                        ],
                      },
                      {
                        icon: '🎙️', title: 'Shadowing & Pratica',
                        items: [
                          'Sezione "Shadowing": ascolta una frase generata dall\'AI',
                          'Ripetila ad alta voce — il microfono valuta la tua pronuncia parola per parola',
                          'Lo score ti dice quanto hai pronunciato correttamente',
                        ],
                      },
                      {
                        icon: '🤖', title: 'Chat AI & Roleplay',
                        items: [
                          'Apri la sezione Chat per conversare con il tutor DeepSeek',
                          'Scegli uno scenario (bar, hotel, stazione…) per un roleplay immersivo',
                          'Il tutor corregge i tuoi errori alla fine di ogni risposta con 💡',
                        ],
                      },
                      {
                        icon: '⭐', title: 'Segnalibri & Quiz',
                        items: [
                          'Salva una traduzione con ⭐ per aggiungerla al vocabolario',
                          'Nella sezione Vocabolario trovi tutte le parole salvate',
                          'Clicca "Quiz" per testare la memoria: 4 opzioni, la giusta è solo una',
                        ],
                      },
                      {
                        icon: '👤', title: 'Profilo personale',
                        items: [
                          'Inserisci nome, età, occupazione e città',
                          'L\'AI usa queste info per personalizzare spiegazioni ed esempi',
                          'Es: se sei medico, gli esempi saranno in ambito medico',
                        ],
                      },
                      {
                        icon: '📵', title: 'Modalità offline',
                        items: [
                          'Le traduzioni già cercate restano disponibili senza connessione',
                          'Segnalibri, quiz e pronuncia funzionano sempre offline',
                          'Installa l\'app (PWA) dal browser per usarla come app nativa',
                        ],
                      },
                    ]).filter(({ title, items }) => {
                        if (!helpFilter.trim()) return true;
                        const q = helpFilter.toLowerCase();
                        return title.toLowerCase().includes(q) || items.some(it => it.toLowerCase().includes(q));
                      }).map(({ icon, title, items }) => {
                        const q = helpFilter.toLowerCase();
                        const highlight = (text: string) => {
                          if (!helpFilter.trim()) return <>{text}</>;
                          const idx = text.toLowerCase().indexOf(q);
                          if (idx === -1) return <>{text}</>;
                          return <>{text.slice(0, idx)}<mark style={{ background: '#854d0e', color: '#fef08a', borderRadius: '2px', padding: '0 1px' }}>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>;
                        };
                        return (
                          <div key={title} style={{ background: '#1e293b', borderRadius: '8px', padding: '10px 12px', border: `1px solid ${helpFilter.trim() ? '#854d0e' : '#1e3a5f'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                              <span style={{ fontSize: '1rem' }}>{icon}</span>
                              <span style={{ fontWeight: 'bold', fontSize: '0.82rem', color: '#e2e8f0' }}>{highlight(title)}</span>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {items.map((item, i) => (
                                <li key={i} style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.5 }}>{highlight(item)}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    {helpFilter.trim() && !([
                      { title: 'Traduzione', items: ['Scrivi una frase in italiano nel campo di testo','Scegli la lingua di destinazione (bandierine)','Premi "Traduci" per la traduzione rapida oppure "Spiega con AI"'] },
                      { title: 'X-Ray grammaticale', items: ['parte del discorso','genere','tempo verbale'] },
                      { title: 'Pronuncia & Ascolto', items: ['sintesi vocale','slider','voce'] },
                      { title: 'Shadowing & Pratica', items: ['shadowing','microfono','score'] },
                      { title: 'Chat AI & Roleplay', items: ['chat','roleplay','scenario','correzioni'] },
                      { title: 'Segnalibri & Quiz', items: ['segnalibri','quiz','vocabolario'] },
                      { title: 'Profilo personale', items: ['profilo','età','occupazione','città'] },
                      { title: 'Modalità offline', items: ['offline','cache','pwa'] },
                    ].some(({ title, items }) => title.toLowerCase().includes(helpFilter.toLowerCase()) || items.some(it => it.toLowerCase().includes(helpFilter.toLowerCase())))) && (
                      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', padding: '8px' }}>
                        Nessuna sezione trovata. Prova con "Cerca con AI" per una risposta personalizzata.
                      </div>
                    )}
                    {!helpFilter.trim() && (
                      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#475569', paddingTop: '2px' }}>
                        💡 Suggerimento: usa le demo guidate qui sopra per vedere ogni funzione in azione
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showFunzionalitaApp && (
                <div style={{ marginTop: '6px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #4c1d95', backgroundColor: '#0f172a' }}>
                  <div style={{ borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
                    <iframe
                      src="https://7f2e7385-dc18-4dec-b4cb-b49d934165fd-00-1p6eowh30kvti.spock.replit.dev/lingua-ai-demo-video/"
                      style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                      allow="autoplay"
                      title="Lingua AI Demo Video"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '8px' }}>
                    {[
                      { icon: '🌍', label: '29+ lingue' },
                      { icon: '🔬', label: 'X-Ray grammaticale' },
                      { icon: '🤖', label: 'AI Tutor DeepSeek' },
                      { icon: '🔁', label: 'Shadowing' },
                      { icon: '⭐', label: 'Segnalibri & Quiz' },
                      { icon: '📤', label: 'Condivisione rapida' },
                    ].map(({ icon, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #1e3a5f' }}>
                        <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                        <span style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="lang-section" style={styles.card}>
          <div data-demo="lang-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '6px', paddingBottom: '14px' }}>
              {LANGUAGES.map(l => {
                const active = selectedLang === l.code;
                return (
                  <button
                    key={l.code}
                    className="lang-btn"
                    aria-pressed={active}
                    aria-label={`${active ? 'Lingua selezionata: ' : 'Seleziona lingua: '}${l.name}`}
                    onClick={() => { setSelectedLang(l.code); setShowMoreLangs(false); }}
                    style={{
                      ...styles.btn,
                      marginTop: 0,
                      width: '100%',
                      fontSize: 'clamp(0.68rem, 3vw, 1rem)',
                      padding: '8px 2px',
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
            aria-label="Testo da tradurre, scrivi in italiano"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTranslate(); } }}
            placeholder="Scrivi o detta in Italiano..."
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
              aria-label={isListening ? 'Dettatura attiva, clicca per fermare' : 'Avvia dettatura vocale'}
              aria-pressed={isListening}
            >
              <Mic size={18} /> DETTA
            </button>
            {dictError && (
              <p role="alert" style={{ margin: '-10px 0 0', fontSize: '0.78rem', color: '#fbbf24', background: '#1e293b', borderRadius: '6px', padding: '6px 10px' }}>
                {dictError}
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                className="action-btn"
                data-demo="translate-btn"
                aria-label="Traduci il testo in italiano"
                style={{ ...styles.btn, ...styles.btnOrange, marginTop: 0 }}
                onClick={() => handleTranslate()}
                disabled={loading || aiLoading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} TRADUCI
              </button>
              <button
                className="action-btn"
                aria-label="Traduzione con spiegazione grammaticale tramite AI"
                style={{
                  ...styles.btn, ...styles.btnOrange, marginTop: 0,
                  backgroundColor: '#e8d0a0', color: '#1e293b',
                  boxShadow: [
                    'inset 0 1px 0 rgba(255,255,255,0.30)',
                    '0 3px 0 #b8a070',
                    '0 5px 0 #967e58',
                    '0 7px 0 rgba(60,40,0,0.35)',
                    '0 10px 18px rgba(232,208,160,0.14)',
                    '0 5px 12px rgba(0,0,0,0.40)',
                  ].join(','),
                }}
                onClick={() => handleAiTranslate()}
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
            aria-expanded={showVoiceSettings}
            aria-controls="voice-settings-panel"
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
            <div id="voice-settings-panel">
              {voices.length > 0 ? (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Voce {langVoices.length > 0 ? `(${langVoices.length} per questa lingua)` : '(tutte disponibili)'}
                  </label>
                  <select
                    aria-label="Seleziona voce di sintesi"
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
                {/* Preset velocità */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {([
                    { label: '🐢 Lento', rate: 0.4 },
                    { label: '▶ Normale', rate: 0.9 },
                    { label: '🚀 Veloce', rate: 1.8 },
                  ] as const).map(({ label, rate }) => (
                    <button
                      key={rate}
                      aria-pressed={Math.abs(speechRate - rate) < 0.05}
                      aria-label={`Velocità ${label.replace(/[🐢▶🚀]/g, '').trim()}`}
                      onClick={() => setSpeechRate(rate)}
                      style={{
                        flex: 1, padding: '5px 4px', borderRadius: '6px', border: 'none',
                        background: Math.abs(speechRate - rate) < 0.05 ? '#ea580c' : '#1e293b',
                        color: Math.abs(speechRate - rate) < 0.05 ? '#fff' : '#94a3b8',
                        fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer',
                      }}
                    >{label}</button>
                  ))}
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={speechRate}
                  onChange={e => setSpeechRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#fb923c' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                  <span>0.1x</span>
                  <span>2.0x</span>
                </div>
              </div>
              {/* Loop automatico */}
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  🔁 Loop automatico
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 5].map(n => (
                    <button
                      key={n}
                      aria-pressed={loopCount === n}
                      aria-label={n === 1 ? 'Loop disattivato (1 ripetizione)' : `Ripeti ${n} volte`}
                      onClick={() => setLoopCount(n)}
                      style={{
                        padding: '5px 14px', borderRadius: '6px', border: 'none',
                        background: loopCount === n ? '#4f46e5' : '#1e293b',
                        color: loopCount === n ? '#fff' : '#94a3b8',
                        fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                      }}
                    >{n === 1 ? '1× (off)' : `${n}×`}</button>
                  ))}
                  {loopCount > 1 && (
                    <button
                      aria-label="Ferma ripetizione automatica"
                      onClick={stopLoop}
                      style={{
                        padding: '5px 10px', borderRadius: '6px', border: 'none',
                        background: '#7f1d1d', color: '#fca5a5',
                        fontSize: '0.72rem', cursor: 'pointer',
                      }}
                    >⏹ Stop</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {translatedText && (
          <section aria-live="polite" aria-label="Risultato traduzione" style={{ ...styles.card, border: '2px solid #10b981' }}>
            {fromCache && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#1e3a5f', color: '#7dd3fc', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '8px' }}>
                💾 Da cache offline
              </div>
            )}
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
                  aria-label={copied ? 'Traduzione copiata' : 'Copia traduzione'}
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
                  aria-label={bookmarked ? 'Già salvato nei segnalibri' : 'Salva nei segnalibri'}
                  aria-pressed={bookmarked}
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
                  title={shared ? 'Copiato!' : 'Condividi traduzione'}
                  aria-label={shared ? 'Traduzione condivisa' : 'Condividi traduzione'}
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
                >
                  {shared ? <Check size={20} /> : <Share2 size={20} />}
                </button>
                <button
                  aria-label={`Ascolta la traduzione in ${ALL_LANGUAGES.find(l => l.code === selectedLang)?.name ?? selectedLang}`}
                  onClick={() => speak(translatedText)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                >
                  <Volume2 size={24} color="#10b981" />
                </button>
              </div>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#475569' }}>🔬 Tocca una parola per analisi grammaticale</p>
            {(xrayWord || xrayLoading) && (
              <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #3b82f6', position: 'relative' }}>
                <button aria-label="Chiudi analisi grammaticale" onClick={() => { setXrayWord(null); setXrayData(null); }} style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={14} /></button>
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
            {/* IPA + Sillabazione per tutte le lingue */}
            {!ipaData && (
              <button
                aria-label={ipaLoading ? 'Caricamento IPA e sillabazione in corso' : 'Mostra trascrizione IPA e sillabazione'}
                onClick={fetchIpa}
                disabled={ipaLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: '#1e293b', border: '1px solid #1e3a5f',
                  color: '#94a3b8', borderRadius: '6px', padding: '4px 10px',
                  cursor: ipaLoading ? 'not-allowed' : 'pointer', fontSize: '0.74rem',
                  marginTop: '6px', opacity: ipaLoading ? 0.6 : 1,
                }}
              >
                {ipaLoading ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : '🔤'} IPA + sillabazione
              </button>
            )}
            {ipaData && (
              <div aria-live="polite" style={{ marginTop: '6px', background: '#0f172a', borderRadius: '8px', padding: '8px 12px', border: '1px solid #1e3a5f', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔤 IPA · sillabazione</span>
                <span style={{ fontSize: '1rem', color: '#93c5fd', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{ipaData.ipa}</span>
                <span style={{ fontSize: '0.9rem', color: '#6ee7b7', letterSpacing: '0.12em' }}>{ipaData.syllables}</span>
                <button aria-label="Chiudi IPA" onClick={() => setIpaData(null)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.7rem', padding: 0, marginTop: '2px' }}>✕ chiudi</button>
              </div>
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
              <div aria-live="polite" style={{ marginTop: '10px' }}>
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
            <button
              aria-label={isPracticing ? 'Microfono attivo, in ascolto della tua pronuncia' : practiceResult ? 'Riprova la pratica pronuncia' : 'Avvia pratica pronuncia'}
              aria-pressed={isPracticing}
              style={{ ...styles.btn, backgroundColor: isPracticing ? '#f59e0b' : '#10b981' }}
              onClick={startPracticeSession}
              disabled={isPracticing}
            >
              <Mic size={18} />
              {isPracticing ? 'In ascolto…' : practiceResult ? 'RIPROVA' : 'PRATICA PRONUNCIA'}
            </button>
            {!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && (
              <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                ℹ️ Riconoscimento vocale non supportato su questo browser — usa Chrome, Edge o Safari
              </p>
            )}
          </section>
        )}

        {/* Shadowing Mode */}
        <section style={{ ...styles.card, border: '1px solid #a855f7' }}>
          <button
            data-demo="shadow-toggle"
            onClick={() => setShowShadow(v => !v)}
            aria-expanded={showShadow}
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
              <button aria-label={shadowLoading ? 'Generazione frase in corso' : 'Genera nuova frase per lo shadowing'} onClick={fetchShadowPhrase} disabled={shadowLoading} style={{ ...styles.btn, backgroundColor: '#7c3aed', marginBottom: '10px' }}>
                {shadowLoading ? <Loader2 className="animate-spin" size={18} /> : '✨'} Genera nuova frase
              </button>
              {shadowPhrase && (
                <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #6d28d9' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 'bold', color: '#e2e8f0' }}>{shadowPhrase.phrase}</p>
                  <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: '#a78bfa', fontStyle: 'italic' }}>si legge: {shadowPhrase.phonetic}</p>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b' }}>🇮🇹 {shadowPhrase.translation}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button aria-label="Riascolta la frase di shadowing" onClick={() => speak(shadowPhrase.phrase)} style={{ ...styles.btn, backgroundColor: '#4f46e5', flex: 1 }}>
                      <Volume2 size={16} /> Riascolta
                    </button>
                    <button
                      aria-label={shadowStep === 'listening' ? 'Microfono attivo, sto ascoltando' : 'Avvia registrazione, ripeti la frase'}
                      aria-pressed={shadowStep === 'listening'}
                      onClick={startShadowListen}
                      disabled={shadowStep === 'listening'}
                      style={{ ...styles.btn, backgroundColor: shadowStep === 'listening' ? '#f59e0b' : '#10b981', flex: 1 }}
                    >
                      <Mic size={16} />
                      {shadowStep === 'listening' ? 'In ascolto…' : 'Ripeti ora!'}
                    </button>
                  </div>
                  {shadowError && (
                    <p role="alert" style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#fbbf24', background: '#1e293b', borderRadius: '6px', padding: '6px 10px' }}>
                      {shadowError}
                    </p>
                  )}
                  {!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                      ℹ️ Riconoscimento vocale non supportato su questo browser — usa Chrome, Edge o Safari
                    </p>
                  )}
                  {shadowStep === 'result' && shadowScore !== null && (
                    <div aria-live="polite" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: shadowScore === 100 ? '#10b981' : shadowScore >= 60 ? '#f59e0b' : '#ef4444' }}>
                          {shadowScore}%
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {shadowScore === 100 ? '🎉 Perfetto!' : shadowScore >= 60 ? '👍 Quasi!' : '❌ Riprova!'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#64748b' }}>Hai detto: <em style={{ color: '#94a3b8' }}>{shadowSpoken}</em></p>
                      {shadowUserAmps.length > 0 && (
                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            🎙 Forma d'onda vocale registrata
                          </p>
                          <div style={{
                            display: 'flex', alignItems: 'flex-end', gap: '1px',
                            height: '36px', background: '#0f172a', borderRadius: '6px',
                            padding: '4px 6px', overflow: 'hidden',
                          }}>
                            {shadowUserAmps.map((amp, i) => (
                              <div
                                key={i}
                                style={{
                                  flex: 1,
                                  height: `${Math.max(4, amp * 100)}%`,
                                  background: amp > 0.3
                                    ? (shadowScore >= 60 ? '#a78bfa' : '#f87171')
                                    : '#1e293b',
                                  borderRadius: '1px',
                                  minWidth: '2px',
                                  transition: 'height 0.1s',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
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
            aria-expanded={showChat}
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
                    aria-pressed={roleplayScenario === null}
                    aria-label="Conversazione libera"
                    onClick={() => { setRoleplayScenario(null); setChatMessages([]); }}
                    style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid', borderColor: roleplayScenario === null ? '#fb923c' : '#334155', backgroundColor: roleplayScenario === null ? '#fb923c22' : 'transparent', color: roleplayScenario === null ? '#fb923c' : '#64748b', fontSize: '0.78rem', cursor: 'pointer', fontWeight: roleplayScenario === null ? 'bold' : 'normal' }}
                  >
                    💬 Libera
                  </button>
                  {SCENARIOS.map(s => (
                    <button
                      key={s.id}
                      aria-pressed={roleplayScenario === s.id}
                      aria-label={`Scenario roleplay: ${s.label}`}
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
                        <button
                          aria-label="Ascolta risposta dell'AI"
                          onClick={() => speak(msg.content)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }}
                        >
                          <Volume2 size={12} style={{ opacity: 0.6 }} />
                        </button>
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
                  aria-label={`Scrivi il tuo messaggio in ${langName}`}
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
                  aria-label="Invia messaggio"
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
                    aria-label="Nuova conversazione, cancella i messaggi"
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

        {/* Quiz Tatoeba */}
        <section style={{ ...styles.card, border: '1px solid #6366f1' }}>
          <button
            onClick={() => {
              const next = !showTatoeba;
              setShowTatoeba(next);
              if (next && tatPairs.length === 0) fetchTatoebaQuiz(selectedLang);
            }}
            aria-expanded={showTatoeba}
            style={{ width: '100%', background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            <span>📚 Quiz Tatoeba — frasi reali da madrelingua</span>
            {showTatoeba ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showTatoeba && (
            <div style={{ marginTop: '14px' }}>
              {tatLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                  <p style={{ margin: '8px 0 0', fontSize: '0.85rem' }}>Carico frasi da Tatoeba…</p>
                </div>
              ) : tatError ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 10px' }}>⚠️ {tatError}</p>
                  <button onClick={() => fetchTatoebaQuiz(selectedLang)} style={{ ...styles.btn, backgroundColor: '#6366f1' }}>Riprova</button>
                </div>
              ) : tatPairs.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => fetchTatoebaQuiz(selectedLang)} style={{ ...styles.btn, backgroundColor: '#6366f1' }}>
                    Inizia quiz frasi reali
                  </button>
                </div>
              ) : (
                <div>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                      Domanda {Math.min(tatIdx + 1, tatPairs.length)} di {tatPairs.length}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 'bold' }}>
                      {tatScore}/{tatTotal} ✓
                    </span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', marginBottom: '14px' }}>
                    <div style={{ height: '100%', backgroundColor: '#6366f1', borderRadius: '2px', width: `${((tatIdx) / tatPairs.length) * 100}%`, transition: 'width 0.3s' }} />
                  </div>

                  {tatIdx < tatPairs.length ? (
                    <>
                      <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                        Come si dice in {ALL_LANGUAGES.find(l => l.code === selectedLang)?.name ?? selectedLang}?
                      </p>
                      <p style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 'bold', color: '#f8fafc', padding: '10px 12px', backgroundColor: '#0f172a', borderRadius: '8px', lineHeight: '1.5' }}>
                        🇮🇹 &ldquo;{tatPairs[tatIdx].it}&rdquo;
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        {tatOptions.map(opt => {
                          const isCorrect = opt === tatPairs[tatIdx].tr;
                          const isSelected = opt === tatSelected;
                          let bg = '#1e293b';
                          let border = '1px solid #334155';
                          if (tatSelected) {
                            if (isCorrect) { bg = '#1e1b4b'; border = '1px solid #6366f1'; }
                            else if (isSelected) { bg = '#450a0a'; border = '1px solid #ef4444'; }
                          }
                          return (
                            <button key={opt} disabled={!!tatSelected} onClick={() => {
                              setTatSelected(opt);
                              setTatTotal(t => t + 1);
                              if (isCorrect) setTatScore(s => s + 1);
                            }} style={{
                              padding: '10px 8px', borderRadius: '8px', border, background: bg,
                              color: tatSelected && isCorrect ? '#a5b4fc' : tatSelected && isSelected ? '#fca5a5' : '#e2e8f0',
                              cursor: tatSelected ? 'default' : 'pointer', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.4', transition: 'all 0.2s',
                            }}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {tatSelected && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: tatSelected === tatPairs[tatIdx].tr ? '#818cf8' : '#ef4444', fontWeight: 'bold' }}>
                            {tatSelected === tatPairs[tatIdx].tr ? '✅ Esatto!' : `❌ "${tatPairs[tatIdx].tr}"`}
                          </p>
                          <button onClick={() => {
                            const next = tatIdx + 1;
                            if (next < tatPairs.length) {
                              setTatIdx(next);
                              setTatOptions(buildTatOptions(tatPairs, next));
                              setTatSelected(null);
                            } else {
                              setTatIdx(tatPairs.length);
                            }
                          }} style={{ padding: '6px 14px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                            {tatIdx + 1 < tatPairs.length ? 'Prossima →' : 'Fine →'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>🎉</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 4px' }}>
                        Quiz completato!
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#818cf8', margin: '0 0 16px' }}>
                        Punteggio: <strong>{tatScore}</strong> / {tatTotal}
                        {tatTotal > 0 && ` (${Math.round((tatScore / tatTotal) * 100)}%)`}
                      </p>
                      <button onClick={() => fetchTatoebaQuiz(selectedLang)} style={{ ...styles.btn, backgroundColor: '#6366f1' }}>
                        🔄 Nuove frasi
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Profilo & Progressi */}
        <section data-demo="tab-panel-toggle" style={{ ...styles.card, border: '1px solid #60a5fa' }}>
          <button
            onClick={() => setShowTabPanel(v => !v)}
            aria-expanded={showTabPanel}
            style={{ width: '100%', background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            <span>⭐ Profilo & Progressi</span>
            {showTabPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

        {showTabPanel && (
        <div data-demo="tab-profilo" style={{ marginTop: '14px' }}>
        {/* Tab pills orizzontali */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '2px' }}>
          {([
            { id: 'profilo',     label: '👤 Profilo' },
            { id: 'progressi',  label: '📊 Progressi' },
            { id: 'calendario', label: '📅 Calendario' },
            { id: 'vocabolario',label: '📚 Vocabolario' },
          ] as const).map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              role="tab"
              aria-selected={activeTab === id}
              aria-label={label.replace(/[👤📊📅📚]/g, '').trim()}
              style={{
              flexShrink: 0,
              padding: '7px 14px', border: 'none', borderRadius: '999px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '0.8rem',
              backgroundColor: activeTab === id ? '#60a5fa' : '#1e293b',
              color: activeTab === id ? '#0f172a' : '#94a3b8',
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
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Studi</label>
                  <select
                    style={{ ...inputStyle, appearance: 'none' }}
                    value={profile.studi}
                    onChange={e => updateProfile('studi', e.target.value)}
                  >
                    <option value="">— seleziona —</option>
                    <option value="Liceo classico / linguistico">Liceo classico / linguistico</option>
                    <option value="Liceo scientifico">Liceo scientifico</option>
                    <option value="Istituto tecnico / professionale">Istituto tecnico / professionale</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Università (umanistica)">Università — area umanistica</option>
                    <option value="Università (scientifica / tecnica)">Università — area scientifica / tecnica</option>
                    <option value="Università (economia / giurisprudenza)">Università — economia / giurisprudenza</option>
                    <option value="Laurea magistrale / dottorato">Laurea magistrale / dottorato</option>
                    <option value="Autodidatta">Autodidatta</option>
                    <option value="Scuola media">Scuola media</option>
                  </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Hobby</label>
                  <input
                    style={inputStyle}
                    placeholder="es. Fotografia, cucina, escursionismo…"
                    value={profile.hobby}
                    onChange={e => updateProfile('hobby', e.target.value)}
                  />
                </div>
                {/* Interessi — chip multi-select */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Interessi</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {['Viaggi','Cucina','Sport','Tecnologia','Arte','Cinema','Libri','Natura','Gaming','Moda','Scienza','Storia','Politica','Economia','Yoga'].map(chip => {
                      const selected = profile.interessi.split(',').map(s => s.trim()).includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`Interesse: ${chip}${selected ? ', selezionato' : ''}`}
                          onClick={() => {
                            const curr = profile.interessi.split(',').map(s => s.trim()).filter(Boolean);
                            const next = selected ? curr.filter(c => c !== chip) : [...curr, chip];
                            updateProfile('interessi', next.join(', '));
                          }}
                          style={{ padding: '4px 10px', borderRadius: '999px', border: `1px solid ${selected ? '#3b82f6' : '#334155'}`, background: selected ? '#1d4ed8' : '#1e293b', color: selected ? '#fff' : '#94a3b8', fontSize: '0.78rem', cursor: 'pointer', fontWeight: selected ? 600 : 400, transition: 'all 0.15s' }}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Musica — chip multi-select */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Musica preferita</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {['Pop','Rock','Jazz','Classica','Hip-hop / Rap','Elettronica','R&B / Soul','Folk / Country','Metal','Indie','Reggae','Latino'].map(chip => {
                      const selected = profile.musica.split(',').map(s => s.trim()).includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`Genere musicale: ${chip}${selected ? ', selezionato' : ''}`}
                          onClick={() => {
                            const curr = profile.musica.split(',').map(s => s.trim()).filter(Boolean);
                            const next = selected ? curr.filter(c => c !== chip) : [...curr, chip];
                            updateProfile('musica', next.join(', '));
                          }}
                          style={{ padding: '4px 10px', borderRadius: '999px', border: `1px solid ${selected ? '#a855f7' : '#334155'}`, background: selected ? '#7e22ce' : '#1e293b', color: selected ? '#fff' : '#94a3b8', fontSize: '0.78rem', cursor: 'pointer', fontWeight: selected ? 600 : 400, transition: 'all 0.15s' }}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Note libere (motivo dello studio, obiettivi…)</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'none', minHeight: '60px' }}
                    placeholder="es. Studio l'inglese per lavoro, voglio leggere romanzi in spagnolo..."
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
        </div>
        )}
        </section>

        {/* Accessibilità & TalkBack */}
        <section style={{ ...styles.card, border: '1px solid #10b981', marginTop: '12px' }}>
          <button
            onClick={() => setShowAccessibilita(v => !v)}
            aria-expanded={showAccessibilita}
            aria-controls="accessibilita-panel"
            style={{ width: '100%', background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            <span>♿ Accessibilità per ipovedenti con TalkBack</span>
            {showAccessibilita ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showAccessibilita && (
            <div id="accessibilita-panel" style={{ marginTop: '14px' }}>

              {/* Toggle Modalità Ipovedenti */}
              <div style={{ marginBottom: '12px', background: '#0f172a', borderRadius: '12px', padding: '14px', border: ipovedenti ? '1px solid #10b981' : '1px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>👁️ Modalità Ipovedenti</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Detta → traduce in automatico → legge il risultato ad alta voce</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={ipovedenti}
                    aria-label={ipovedenti ? 'Modalità ipovedenti attiva, tocca per disattivare' : 'Modalità ipovedenti disattiva, tocca per attivare'}
                    onClick={() => {
                      const next = !ipovedenti;
                      setIpovedenti(next);
                      localStorage.setItem('modalita_ipovedenti', next ? '1' : '0');
                    }}
                    style={{
                      width: '56px', height: '30px', borderRadius: '15px', border: 'none', cursor: 'pointer',
                      background: ipovedenti ? '#10b981' : '#334155',
                      position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: ipovedenti ? '29px' : '3px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s', display: 'block',
                    }} />
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: ipovedenti ? '#10b981' : '#475569', fontWeight: 600 }}>
                  {ipovedenti ? '✅ Attivo — detta e ascolta, senza toccare nient\'altro' : '⭕ Disattivo'}
                </p>
                {ipovedenti && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>
                    1️⃣ Scorri fino alla sezione <strong style={{ color: '#f8fafc' }}>Traduzione</strong> &nbsp;·&nbsp; 2️⃣ Tocca <strong style={{ color: '#f8fafc' }}>🎙️ DETTA</strong> &nbsp;·&nbsp; 3️⃣ Parla in italiano &nbsp;·&nbsp; 4️⃣ Ascolta la traduzione
                  </p>
                )}
              </div>

              {/* Toggle TalkBack in-app */}
              <div style={{ marginBottom: '12px', background: '#0f172a', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>🔊 Leggi elementi (TalkBack in-app)</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Ogni elemento toccato viene letto ad alta voce</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={talkbackInApp}
                    aria-label={talkbackInApp ? 'TalkBack in-app attivo, tocca per disattivare' : 'TalkBack in-app disattivo, tocca per attivare'}
                    onClick={() => {
                      const next = !talkbackInApp;
                      setTalkbackInApp(next);
                      localStorage.setItem('talkback_inapp', next ? '1' : '0');
                      if (!next) window.speechSynthesis.cancel();
                    }}
                    style={{
                      width: '56px', height: '30px', borderRadius: '15px', border: 'none', cursor: 'pointer',
                      background: talkbackInApp ? '#10b981' : '#334155',
                      position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: talkbackInApp ? '29px' : '3px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s', display: 'block',
                    }} />
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: talkbackInApp ? '#10b981' : '#475569', fontWeight: 600 }}>
                  {talkbackInApp ? '✅ Lettura attiva — tocca qualsiasi elemento' : '⭕ Lettura disattiva'}
                </p>
              </div>

              {/* Toggle Modalità Accessibile */}
              <div style={{ marginBottom: '16px', background: '#0f172a', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>♿ Modalità Accessibile</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Pulsanti più grandi, etichette visibili, contrasto alto</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={modalitaAccessibile}
                    aria-label="Attiva o disattiva modalità accessibile"
                    onClick={() => {
                      const next = !modalitaAccessibile;
                      setModalitaAccessibile(next);
                      localStorage.setItem('modalita_accessibile', next ? '1' : '0');
                      document.body.classList.toggle('modalita-accessibile', next);
                    }}
                    style={{
                      width: '56px', height: '30px', borderRadius: '15px', border: 'none', cursor: 'pointer',
                      background: modalitaAccessibile ? '#10b981' : '#334155',
                      position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: modalitaAccessibile ? '29px' : '3px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                      display: 'block',
                    }} />
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: modalitaAccessibile ? '#10b981' : '#475569', fontWeight: 600 }}>
                  {modalitaAccessibile ? '✅ Modalità accessibile attiva' : '⭕ Modalità accessibile disattiva'}
                </p>
              </div>

              {/* Pulsante apri impostazioni Android */}
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    window.location.href = 'intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end';
                  }}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', width: '100%', marginBottom: '8px' }}
                >
                  🔊 Apri Impostazioni Accessibilità Android
                </button>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                  Da qui puoi attivare TalkBack. Su iPhone: Impostazioni → Accessibilità → VoiceOver.
                </p>
              </div>

              {/* Come attivare TalkBack */}
              <div style={{ background: '#0f172a', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>📱 Come attivare TalkBack su Android</p>
                {[
                  '1. Impostazioni → Impostazioni aggiuntive',
                  '2. Accessibilità → TalkBack',
                  '3. Attiva l\'interruttore',
                  '4. Conferma con OK',
                  '5. Per disattivare: tieni premuti Volume Su + Volume Giù per 3 secondi',
                ].map((step, i) => (
                  <p key={i} style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>{step}</p>
                ))}
                <p style={{ margin: '10px 0 4px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>🕹️ Gesti base TalkBack</p>
                {[
                  'Scorri destra/sinistra → elemento successivo/precedente',
                  'Doppio tap → attiva l\'elemento selezionato',
                  'Scorri giù poi sinistra → tasto Indietro',
                  'Scorri su poi sinistra → tasto Home',
                  'Scorri su poi destra → apri menu TalkBack',
                ].map((g, i) => (
                  <p key={i} style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>• {g}</p>
                ))}
              </div>

              {/* Funzionalità accessibili nell'app */}
              <div style={{ background: '#0f172a', borderRadius: '10px', padding: '12px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>✅ Funzionalità accessibili in questa app</p>
                {[
                  { icon: '🎙️', label: 'Dettatura vocale', desc: 'TalkBack legge: "Avvia dettatura vocale" / "Dettatura attiva, clicca per fermare"' },
                  { icon: '📝', label: 'Campo testo', desc: 'Etichettato "Testo da tradurre, scrivi in italiano" — doppio tap per scrivere' },
                  { icon: '🌍', label: 'Selezione lingua', desc: 'Ogni pulsante lingua annuncia "Lingua selezionata: X" o "Seleziona lingua: Y"' },
                  { icon: '📢', label: 'Traduzione', desc: 'Il risultato viene letto automaticamente all\'arrivo (aria-live)' },
                  { icon: '⚠️', label: 'Errori', desc: 'Annunciati immediatamente con role="alert"' },
                  { icon: '🔊', label: 'Audio traduzione', desc: 'Pulsante etichettato "Ascolta traduzione in [lingua]"' },
                  { icon: '📋', label: 'Copia/Condividi/Segnalibro', desc: 'Tutti i pulsanti hanno etichette descrittive' },
                  { icon: '🎭', label: 'Chat AI & Roleplay', desc: 'Scenari con aria-pressed, chat con aria-live' },
                  { icon: '🔁', label: 'Shadowing', desc: 'Microfono, velocità e loop tutti accessibili con aria-label e aria-pressed' },
                  { icon: '👤', label: 'Profilo & Tab', desc: 'Tab con role="tab" e aria-selected, chip con aria-pressed' },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{item.icon} {item.label}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

            </div>
          )}
        </section>

        {/* Donazioni */}
        <section style={{ ...styles.card, border: '1px solid #f59e0b', marginTop: '12px' }}>
          <button
            onClick={() => setShowDonazioni(v => !v)}
            style={{ width: '100%', background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            <span>☕ Supporta il progetto</span>
            {showDonazioni ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showDonazioni && (
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                Se l'app ti è utile, considera una piccola donazione — aiuta a mantenerla gratuita e a migliorarla!
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href="https://www.paypal.com/donate?business=livio.mazzocchi%40gmail.com&currency_code=EUR"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '10px',
                    background: '#0070ba', color: '#fff',
                    fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
                    boxShadow: '0 3px 0 #005ea6',
                  }}
                >
                  💳 PayPal
                </a>
                <a
                  href="https://ko-fi.com/liviomazzocchi"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '10px',
                    background: '#ff5e5b', color: '#fff',
                    fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
                    boxShadow: '0 3px 0 #cc4a47',
                  }}
                >
                  ☕ Ko-fi
                </a>
              </div>

              {/* Bonifico bancario / Postepay */}
              <div style={{ marginTop: '16px', background: '#0f172a', borderRadius: '12px', padding: '14px', textAlign: 'left' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>🏦 Bonifico / Postepay</p>
                <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#94a3b8' }}>Intestatario</p>
                <p style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>Mazzocchi Livio</p>
                <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#94a3b8' }}>IBAN</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{
                    fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.05em',
                    color: '#f59e0b', background: '#1e293b', borderRadius: '6px',
                    padding: '6px 10px', wordBreak: 'break-all', flex: 1,
                  }}>
                    IT62 U360 8105 1382 2029 5220 310
                  </code>
                  <button
                    aria-label="Copia IBAN negli appunti"
                    onClick={() => navigator.clipboard.writeText('IT62U3608105138220295220310')}
                    style={{
                      background: '#f59e0b22', border: '1px solid #f59e0b55', borderRadius: '8px',
                      color: '#f59e0b', cursor: 'pointer', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    📋 Copia
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

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
          <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#334155' }}>© 2026 Livio Mazzocchi — Tutti i diritti riservati</p>
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
