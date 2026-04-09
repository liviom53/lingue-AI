import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const APP_URL = 'https://web-app-creator--liviomazzocchi.replit.app/lingua-ai/';

const features = [
  { icon: '🌍', label: '29+ lingue disponibili' },
  { icon: '🔊', label: 'Pronuncia IPA e audio nativo' },
  { icon: '🤖', label: 'AI Tutor conversazionale' },
  { icon: '🔬', label: 'X-Ray grammaticale' },
  { icon: '🔁', label: 'Shadowing e pratica vocale' },
  { icon: '⭐', label: 'Segnalibri e quiz Tatoeba' },
  { icon: '📶', label: 'Funziona anche offline' },
  { icon: '📤', label: 'Condivisione rapida frasi' },
];

const stepsAndroid = [
  'Apri il link (o scansiona il QR) in Chrome sul tuo Android',
  'Tocca il menu ⋮ in alto a destra',
  'Seleziona "Aggiungi alla schermata Home"',
  'Conferma — l\'icona appare sulla home!',
];

const stepsIos = [
  'Apri il link in Safari sul tuo iPhone/iPad',
  'Tocca l\'icona condividi ↑ in basso',
  'Scorri e seleziona "Aggiungi alla schermata Home"',
  'Tocca "Aggiungi" — l\'icona appare sulla home!',
];

export default function App() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    let sid = localStorage.getItem('_app_sid');
    if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('_app_sid', sid); }
    const SESSION_KEY = 'landing_view_tracked';
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, '1');
      fetch('/api/stats/track/landing_view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      }).catch(() => {});
    }
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden',
    }}>
      {/* Glow sfondo */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, #fb923c33, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, #a855f733, transparent 70%)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '12px' }}>
            <img
              src="/lingua-ai-landing/icon-192.png"
              alt="Lingue & AI"
              style={{ width: '64px', height: '64px', borderRadius: '16px', boxShadow: '0 8px 32px #a855f766', flexShrink: 0 }}
            />
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900,
              background: 'linear-gradient(90deg, #fb923c, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Lingue &amp; AI
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '1rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Impara 29+ lingue con AI, pronuncia IPA,<br />shadowing e molto altro — gratis.
          </p>
        </div>

        {/* QR + CTA */}
        <div style={{
          background: '#1e293b', borderRadius: '20px',
          border: '1px solid #334155', padding: '24px',
          textAlign: 'center', marginBottom: '20px',
        }}>
          <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            📱 Scansiona o clicca per aprire
          </p>
          <div style={{
            display: 'inline-block', background: '#fff',
            borderRadius: '16px', padding: '12px', marginBottom: '16px',
          }}>
            <QRCodeSVG value={APP_URL} size={180} level="H" />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '12px 24px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #fb923c, #a855f7)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none', boxShadow: '0 4px 15px #fb923c44',
              }}
            >
              🚀 Apri l'app
            </a>
            <button
              onClick={copyUrl}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '12px 20px', borderRadius: '12px',
                background: copied ? '#10b98122' : '#ffffff11',
                border: `1px solid ${copied ? '#10b981' : '#ffffff22'}`,
                color: copied ? '#10b981' : '#cbd5e1',
                fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              {copied ? '✅ Copiato!' : '📋 Copia link'}
            </button>
          </div>
        </div>

        {/* Istruzioni installazione */}
        <div style={{
          background: '#1e293b', borderRadius: '20px',
          border: '1px solid #334155', padding: '20px', marginBottom: '20px',
        }}>
          <p style={{ margin: '0 0 14px', fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
            📲 Come installare l'app
          </p>
          {/* Tab */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {(['android', 'ios'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: tab === t ? 'linear-gradient(135deg, #fb923c, #a855f7)' : '#0f172a',
                  color: tab === t ? '#fff' : '#64748b',
                  fontWeight: 700, fontSize: '0.82rem',
                }}
              >
                {t === 'android' ? '🤖 Android' : '🍎 iPhone/iPad'}
              </button>
            ))}
          </div>
          {/* Steps */}
          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {(tab === 'android' ? stepsAndroid : stepsIos).map((step, i) => (
              <li key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                marginBottom: i < 3 ? '12px' : 0,
              }}>
                <span style={{
                  flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fb923c, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800, color: '#fff',
                }}>{i + 1}</span>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, paddingTop: '3px' }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Funzionalità */}
        <div style={{
          background: '#1e293b', borderRadius: '20px',
          border: '1px solid #334155', padding: '20px', marginBottom: '20px',
        }}>
          <p style={{ margin: '0 0 14px', fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
            ✨ Cosa include l'app
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {features.map(({ icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px', background: '#0f172a',
                borderRadius: '10px', border: '1px solid #1e293b',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569' }}>
          <p style={{ margin: '0 0 4px' }}>Lingue &amp; AI — Sviluppato da Livio Mazzocchi</p>
          <p style={{ margin: 0 }}>Gratuito · Nessun account richiesto · PWA</p>
        </div>
      </div>
    </div>
  );
}
