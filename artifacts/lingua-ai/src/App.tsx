import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Send, Loader2, AlertCircle, Bot, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [speechRate, setSpeechRate] = useState(1);
  const [ipaText, setIpaText] = useState<string | null>(null);
  const [phonetic, setPhonetic] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ explanation: string; example: string } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showMoreLangs, setShowMoreLangs] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const moreLangsRef = useRef<HTMLDivElement>(null);

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
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        body: JSON.stringify({ text: inputText, targetLang: selectedLang }),
      });
      if (!res.ok) throw new Error('Errore AI. Riprova.');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranslatedText(data.translation ?? '');
      setPhonetic(data.pronunciation ?? null);
      setAiExplanation({ explanation: data.explanation ?? '', example: data.example ?? '' });
      speak(data.translation ?? '');
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
    };
    recognition.onend = () => setIsPracticing(false);
    recognition.start();
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, targetLang: selectedLang }),
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
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Impostazioni voce</p>

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
        </section>

        {translatedText && (
          <section style={{ ...styles.card, borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{translatedText}</p>
              <Volume2
                size={24}
                color="#10b981"
                style={{ cursor: 'pointer', flexShrink: 0, marginLeft: '8px' }}
                onClick={() => speak(translatedText)}
              />
            </div>
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
            {showChat ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showChat && (
            <div style={{ marginTop: '10px' }}>
              <div style={{
                height: '100px',
                overflowY: 'auto',
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                padding: '8px',
                marginBottom: '8px',
                border: '1px solid #334155',
              }}>
                {chatMessages.length === 0 && (
                  <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', marginTop: '70px' }}>
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
      </div>
    </div>
  );
}
