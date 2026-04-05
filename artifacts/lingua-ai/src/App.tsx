import { useState } from 'react';
import { Mic, Volume2, Send, Loader2, AlertCircle, CloudLightning } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

const genAI = new GoogleGenerativeAI(API_KEY || "");

const gemmaModel = genAI.getGenerativeModel(
  { model: "gemini-1.5-flash" },
  { apiVersion: 'v1' }
);

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
  const [practiceFeedback, setPracticeFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    if (!API_KEY) {
      setError("Chiave API non configurata. Contatta l'amministratore.");
      return;
    }
    setLoading(true);
    setError(null);
    setPracticeFeedback('');

    const target = LANGUAGES.find(l => l.code === selectedLang)?.name || "Inglese";

    try {
      const promptCompleto = `Sei un traduttore. Traduci dall'italiano al ${target} questa frase: "${inputText}". Scrivi SOLO la traduzione pura.`;
      const result = await gemmaModel.generateContent(promptCompleto);
      const response = await result.response;
      const text = response.text().trim();

      setTranslatedText(text);

      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = LANGUAGES.find(l => l.code === selectedLang)!.locale;
      window.speechSynthesis.speak(ut);
    } catch (err) {
      console.error(err);
      setError("Errore di risposta dal server AI.");
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
      setPracticeFeedback('Dì la frase tradotta...');
    };
    recognition.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript;
      const isCorrect = normalizeText(spoken) === normalizeText(translatedText);
      setPracticeFeedback(isCorrect ? '✅ PERFETTO!' : `❌ HAI DETTO: ${spoken}`);
    };
    recognition.onend = () => setIsPracticing(false);
    recognition.start();
  };

  const styles: Record<string, React.CSSProperties> = {
    main: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      padding: '20px',
      fontFamily: 'sans-serif',
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      border: '1px solid #334155',
    },
    btn: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: '#fff',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
  };

  return (
    <div style={styles.main}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <CloudLightning size={40} color="#3b82f6" />
          <h1>Lingua AI Pro</h1>
          <p style={{ color: '#6366f1', fontSize: '0.8rem' }}>STABLE VERSION 1.0</p>
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
                {l.flag} {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <textarea
            style={{
              width: '100%',
              height: '80px',
              backgroundColor: '#0f172a',
              color: '#fff',
              border: '1px solid #334155',
              padding: '10px',
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

        {translatedText && (
          <section style={{ ...styles.card, borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{translatedText}</p>
              <Volume2
                size={24}
                color="#10b981"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const ut = new SpeechSynthesisUtterance(translatedText);
                  ut.lang = LANGUAGES.find(l => l.code === selectedLang)!.locale;
                  window.speechSynthesis.speak(ut);
                }}
              />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '10px' }}>{practiceFeedback}</p>
            <button
              style={{ ...styles.btn, backgroundColor: isPracticing ? '#f59e0b' : '#10b981' }}
              onClick={startPracticeSession}
            >
              <Mic size={18} /> PRATICA PRONUNCIA
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
