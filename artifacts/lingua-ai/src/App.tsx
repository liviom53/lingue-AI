import { useState, useEffect } from 'react';
import { Mic, Volume2, Send, Loader2, AlertCircle } from 'lucide-react';
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

async function fetchEnglishIPA(text: string): Promise<string | null> {
  const words = text.replace(/[.,!?;:]/g, '').split(' ').slice(0, 8);
  const results = await Promise.all(
    words.map(async (word) => {
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data[0]?.phonetic || data[0]?.phonetics?.find((p: any) => p.text)?.text || null;
      } catch {
        return null;
      }
    })
  );
  if (!results.some(r => r !== null)) return null;
  return results.map((ipa, i) => ipa ?? `/${words[i]}/`).join('  ');
}

const LANGUAGES = [
  { code: 'en', name: 'Inglese', flag: '🇬🇧', locale: 'en-US' },
  { code: 'es', name: 'Spagnolo', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', name: 'Francese', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'de', name: 'Tedesco', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'pt', name: 'Portoghese', flag: '🇵🇹', locale: 'pt-PT' },
  { code: 'ru', name: 'Russo', flag: '🇷🇺', locale: 'ru-RU' },
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

export default function App() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
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
  }, [selectedLang]);

  const currentLocale = LANGUAGES.find(l => l.code === selectedLang)!.locale;
  const langVoices = voices.filter(v => v.lang.startsWith(selectedLang));
  const availableVoices = langVoices.length > 0 ? langVoices : voices;

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = currentLocale;
    ut.rate = speechRate;
    const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
    if (voice) ut.voice = voice;
    window.speechSynthesis.speak(ut);
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

  const startPracticeSession = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = LANGUAGES.find(l => l.code === selectedLang)!.locale;
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
      backgroundColor: '#3b82f6',
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

  return (
    <div style={styles.main}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
          <img src={appIcon} alt="Impara una Lingua" style={{ width: '90px', height: '90px', borderRadius: '14px', flexShrink: 0 }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', whiteSpace: 'nowrap' }}>Impara una Lingua</h1>
            <p style={{ color: '#f97316', fontSize: '1.55rem', margin: '4px 0 0', whiteSpace: 'nowrap' }}>Impara a parlarla male</p>
          </div>
        </header>

        <section style={styles.card}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                style={{
                  padding: '8px',
                  backgroundColor: selectedLang === l.code ? '#3b82f6' : '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {l.flag} {l.name}
              </button>
            ))}
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
            placeholder="Scrivi in italiano..."
          />
          <button
            style={{ ...styles.btn, backgroundColor: isListening ? '#ef4444' : '#334155' }}
            onClick={startInputSpeech}
          >
            <Mic size={18} /> DETTA
          </button>
          <button
            style={{ ...styles.btn, backgroundColor: '#6366f1' }}
            onClick={handleTranslate}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} TRADUCI
          </button>
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
              style={{ width: '100%', accentColor: '#3b82f6' }}
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
                style={{ cursor: 'pointer' }}
                onClick={() => speak(translatedText)}
              />
            </div>
            {ipaText && (
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
            <button
              style={{ ...styles.btn, backgroundColor: isPracticing ? '#f59e0b' : '#10b981' }}
              onClick={startPracticeSession}
            >
              <Mic size={18} /> {practiceResult && !isPracticing ? 'RIPROVA' : 'PRATICA PRONUNCIA'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
