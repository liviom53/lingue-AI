import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const bars = [
  { label:'Gen', value:3, color:'#0ea5e9' },
  { label:'Feb', value:5, color:'#38bdf8' },
  { label:'Mar', value:8, color:'#0ea5e9' },
  { label:'Apr', value:14,color:'#f59e0b' },
  { label:'Mag', value:11,color:'#0ea5e9' },
  { label:'Giu', value:7, color:'#34d399' },
];

function CountUp({ to, suffix='' }: { to:number, suffix?:string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / 60;
    const iv = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(iv); }
      else setVal(Math.floor(start * 10) / 10);
    }, 30);
    return () => clearInterval(iv);
  }, [to]);
  return <>{val}{suffix}</>;
}

export function Scene8() {
  const [phase, setPhase] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => { setPhase(2); setBarsVisible(true); }, 1800),
      setTimeout(() => setPhase(3), 5000),
      setTimeout(() => setPhase(4), 11000),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const maxVal = Math.max(...bars.map(b=>b.value));

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, y:'6vh' }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, y:'-6vh' }}
      transition={{ duration:0.9 }}
    >
      {/* Titolo */}
      <motion.div className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity:0, x:-50 }}
        animate={phase>=1 ? { opacity:1, x:0 } : { opacity:0, x:-50 }}
        transition={{ duration:0.8 }}
      >
        <h2 className="text-[5.5vw] font-black leading-none text-white uppercase" style={{ fontFamily:'Bebas Neue, sans-serif' }}>
          Statistiche <span className="text-[#34d399]">& Grafici</span>
        </h2>
        <p className="text-[1.8vw] text-white/60 mt-1" style={{ fontFamily:'Inter, sans-serif' }}>Monitora i tuoi progressi nel tempo</p>
      </motion.div>

      {/* Grafico barre */}
      <motion.div
        className="rounded-[2vw] border border-white/10 bg-white/5 backdrop-blur p-[3vw] shadow-xl"
        style={{ width:'65vw' }}
        initial={{ opacity:0, scale:0.9 }}
        animate={phase>=2 ? { opacity:1, scale:1 } : { opacity:0, scale:0.9 }}
        transition={{ type:'spring', stiffness:180 }}
      >
        <p className="text-[1.8vw] text-white/50 mb-[2vh]" style={{ fontFamily:'Inter, sans-serif' }}>Catture per mese</p>
        <div className="flex items-end gap-[2vw]" style={{ height:'22vh' }}>
          {bars.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-[0.5vh]">
              <motion.div
                className="w-full rounded-t-[0.8vw]"
                style={{ backgroundColor:b.color, opacity:0.85 }}
                initial={{ height:0 }}
                animate={barsVisible ? { height:`${(b.value/maxVal)*100}%` } : { height:0 }}
                transition={{ duration:0.8, delay:i*0.1, ease:[0.16,1,0.3,1] }}
              />
              <span className="text-[1.4vw] text-white/50" style={{ fontFamily:'Inter, sans-serif' }}>{b.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stat counters */}
      <div className="flex gap-[4vw] mt-[3vh]">
        {[
          { label:'Uscite', to:14, suffix:'', color:'#0ea5e9' },
          { label:'Kg pescati', to:28.4, suffix:' kg', color:'#f59e0b' },
          { label:'Specie', to:8, suffix:'', color:'#34d399' },
        ].map((s,i) => (
          <motion.div key={i}
            className="flex flex-col items-center"
            initial={{ opacity:0, y:20 }}
            animate={phase>=3 ? { opacity:1, y:0 } : { opacity:0, y:20 }}
            transition={{ delay:i*0.15, type:'spring' }}
          >
            <span className="text-[7vw] font-black leading-none" style={{ color:s.color, fontFamily:'Bebas Neue, sans-serif',
              textShadow:`0 0 20px ${s.color}60` }}>
              {phase>=3 ? <CountUp to={s.to} suffix={s.suffix} /> : '0'}
            </span>
            <span className="text-[1.8vw] text-white/50 uppercase tracking-widest" style={{ fontFamily:'Inter, sans-serif' }}>{s.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
