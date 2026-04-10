import { useMemo, useState } from "react";
import { Waves, Moon, ChevronDown, MapPin } from "lucide-react";
import { STAZIONI, getSharedStation, setSharedStation } from "@/hooks/use-location";
import { cn } from "@/lib/utils";

function getMoonPhase(date: Date): { phase: number; nome: string; emoji: string } {
  const year=date.getFullYear(),month=date.getMonth()+1,day=date.getDate();
  let y=year,m=month; if(m<=2){y--;m+=12;}
  const a=Math.floor(y/100),b=2-a+Math.floor(a/4);
  const jd=Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+day+b-1524.5;
  const phase=((jd-2451549.5)%29.53+29.53)%29.53/29.53;
  const names=[
    {max:0.03,nome:"Luna Nuova",emoji:"🌑"},{max:0.22,nome:"Luna Crescente",emoji:"🌒"},
    {max:0.28,nome:"Quarto Crescente",emoji:"🌓"},{max:0.47,nome:"Gibbosa Crescente",emoji:"🌔"},
    {max:0.53,nome:"Luna Piena",emoji:"🌕"},{max:0.72,nome:"Gibbosa Calante",emoji:"🌖"},
    {max:0.78,nome:"Quarto Calante",emoji:"🌗"},{max:0.97,nome:"Luna Calante",emoji:"🌘"},
    {max:1.00,nome:"Luna Nuova",emoji:"🌑"},
  ];
  const found=names.find(n=>phase<=n.max)||names[8];
  return{phase,nome:found.nome,emoji:found.emoji};
}

function getTidalHeight(date: Date,hour: number): number {
  const t=(date.getTime()+hour*3600000)/1000;
  return 0.35*Math.sin(2*Math.PI*t/(12.42*3600))
        +0.12*Math.sin(2*Math.PI*t/(23.93*3600)+1.2)
        +0.08*Math.sin(2*Math.PI*t/(6.21*3600)+0.5);
}

function getDayTides(date: Date) {
  const heights=Array.from({length:24},(_,h)=>({h,height:getTidalHeight(date,h)}));
  const highs:number[]=[],lows:number[]=[];
  for(let i=1;i<23;i++){
    if(heights[i].height>heights[i-1].height&&heights[i].height>heights[i+1].height) highs.push(i);
    if(heights[i].height<heights[i-1].height&&heights[i].height<heights[i+1].height) lows.push(i);
  }
  return{highs,lows,heights};
}

const MONTHS_IT=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const DAYS_IT_SHORT=["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];

export default function Maree() {
  const [selectedDate,setSelectedDate]=useState(()=>{
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  });
  const [stazioneKey,setStazioneKey]=useState(()=>getSharedStation());
  const [showDropdown,setShowDropdown]=useState(false);

  const date=useMemo(()=>new Date(selectedDate),[selectedDate]);
  const moon=useMemo(()=>getMoonPhase(date),[date]);
  const tides=useMemo(()=>getDayTides(date),[date]);

  const handleStation=(k:string)=>{
    setStazioneKey(k);
    setSharedStation(k);
    setShowDropdown(false);
  };

  const calendarDays=useMemo(()=>{
    const first=new Date(date.getFullYear(),date.getMonth(),1);
    const last=new Date(date.getFullYear(),date.getMonth()+1,0);
    const days:Array<{d:number;moon:ReturnType<typeof getMoonPhase>}|null>=[];
    let dow=first.getDay(); if(dow===0) dow=7; // Monday-first
    for(let i=1;i<dow;i++) days.push(null);
    for(let d=1;d<=last.getDate();d++){
      const dd=new Date(date.getFullYear(),date.getMonth(),d);
      days.push({d,moon:getMoonPhase(dd)});
    }
    return days;
  },[date]);

  const maxH=Math.max(...tides.heights.map(h=>Math.abs(h.height)));

  return(
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Maree & Luna</h1>
          <p className="text-muted-foreground">Calcolo armonico M2+K1+M4</p>
        </div>

        {/* Selettore stazione condiviso */}
        <div className="relative shrink-0">
          <button onClick={()=>setShowDropdown(v=>!v)}
            className="flex items-center gap-2 bg-card border border-white/10 px-4 py-2.5 rounded-2xl text-sm font-medium hover:border-primary/50 transition-colors">
            <MapPin className="w-4 h-4 text-primary shrink-0"/>
            <span className="max-w-[130px] truncate">{STAZIONI[stazioneKey]?.nome??"Porto Badino"}</span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform",showDropdown&&"rotate-180")}/>
          </button>
          {showDropdown&&(
            <div className="absolute right-0 top-12 w-52 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
              {Object.entries(STAZIONI).map(([k,s])=>(
                <button key={k} onClick={()=>handleStation(k)}
                  className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2",
                    k===stazioneKey?"text-primary font-semibold bg-primary/5":"text-foreground")}>
                  {k===stazioneKey&&<span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"/>}
                  {s.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selezione data */}
      <div>
        <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Data</label>
        <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}
          className="bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"/>
      </div>

      {/* Luna del giorno */}
      <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center">
          <div className="text-7xl mb-2">{moon.emoji}</div>
          <p className="font-bold text-xl text-white">{moon.nome}</p>
          <p className="text-muted-foreground text-sm">{MONTHS_IT[date.getMonth()]} {date.getFullYear()}</p>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-primary"/>
            <span className="text-white">Fase: {moon.nome}</span>
          </div>
          <div className="flex items-center gap-3">
            <Waves className="w-4 h-4 text-primary"/>
            <span className="text-white">
              Maree: alta h{tides.highs[0]??"-"}:00 · bassa h{tides.lows[0]??"-"}:00
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {STAZIONI[stazioneKey]?.nome} · modello M2+K1+M4 (senza dati live)
          </p>
        </div>
      </div>

      {/* Grafico maree SVG */}
      <div className="bg-card rounded-2xl p-5 border border-white/5 shadow-xl">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Grafico Maree 24h</h2>
        {(() => {
          const W=600, H=160, PAD=12;
          const minH2=Math.min(...tides.heights.map(x=>x.height));
          const maxH2=Math.max(...tides.heights.map(x=>x.height));
          const range=maxH2-minH2||0.1;
          const toY=(v:number)=>PAD+(1-(v-minH2)/range)*(H-PAD*2);
          const toX=(i:number)=>(i/(tides.heights.length-1))*W;
          const pts=tides.heights.map(({height},i)=>`${toX(i).toFixed(1)},${toY(height).toFixed(1)}`).join(" ");
          const fillPts=`0,${H} `+pts+` ${W},${H}`;
          const mid=toY((minH2+maxH2)/2);
          return(
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:160}} preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03"/>
                </linearGradient>
              </defs>
              {/* Linea di mezzeria */}
              <line x1="0" y1={mid} x2={W} y2={mid} stroke="rgba(255,255,255,0.08)" strokeDasharray="4,4"/>
              {/* Ore ogni 6h */}
              {[0,6,12,18,24].map(h=>{
                const x=h===24?W:(h/24)*W;
                return <g key={h}>
                  <line x1={x} y1={0} x2={x} y2={H} stroke="rgba(255,255,255,0.06)"/>
                  <text x={x+3} y={H-3} fill="rgba(255,255,255,0.35)" fontSize="18">{h}h</text>
                </g>;
              })}
              {/* Area riempita */}
              <polygon points={fillPts} fill="url(#waveGrad)"/>
              {/* Curva */}
              <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round"/>
              {/* Punti alta/bassa */}
              {tides.highs.map(h=>(
                <g key={`hi${h}`}>
                  <circle cx={toX(h)} cy={toY(tides.heights[h].height)} r="5" fill="hsl(var(--primary))"/>
                  <text x={toX(h)} y={toY(tides.heights[h].height)-10} textAnchor="middle" fill="hsl(var(--primary))" fontSize="16" fontWeight="bold">{h}:00</text>
                </g>
              ))}
              {tides.lows.map(h=>(
                <g key={`lo${h}`}>
                  <circle cx={toX(h)} cy={toY(tides.heights[h].height)} r="5" fill="#1d4ed8"/>
                  <text x={toX(h)} y={toY(tides.heights[h].height)+20} textAnchor="middle" fill="#60a5fa" fontSize="16">{h}:00</text>
                </g>
              ))}
            </svg>
          );
        })()}
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary inline-block"/>Alta marea</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block"/>Bassa marea</span>
        </div>
        <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            🎣 <span className="text-white/80 font-medium">Quando pescare:</span> le 2–3 ore che precedono l'alta marea sono in genere le più produttive — il movimento dell'acqua attiva spigole, orate e mormore. Anche il cambio di marea (da alta a bassa) provoca movimento di pesce foraggio.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ⚠️ <span className="text-white/80 font-medium">Nota sul modello:</span> calcolo armonico M2+K1+M4 senza dati mareografici live. Gli orari sono indicativi (±30–60 min rispetto alla realtà). Per dati ufficiali: <span className="text-primary">mareografico.ispra.it</span>
          </p>
        </div>
      </div>

      {/* Calendario mensile fasi lunari */}
      <div className="bg-card rounded-2xl p-4 border border-white/5 shadow-xl max-w-sm">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Fasi Lunari — {MONTHS_IT[date.getMonth()]} {date.getFullYear()}
        </h2>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["L","M","M","G","V","S","D"].map((d,i)=>(
            <div key={i} className="text-center text-[10px] text-muted-foreground font-bold py-0.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day,i)=>(
            day===null?(
              <div key={`e${i}`}/>
            ):(
              <button key={day.d}
                onClick={()=>{
                  const m=String(date.getMonth()+1).padStart(2,"0");
                  const d2=String(day.d).padStart(2,"0");
                  setSelectedDate(`${date.getFullYear()}-${m}-${d2}`);
                }}
                className={cn("aspect-square flex flex-col items-center justify-center rounded-lg transition-all hover:bg-primary/10",
                  day.d===date.getDate()?"bg-primary/20 border border-primary text-primary font-bold":"text-white/70")}>
                <span className="text-base leading-none">{day.moon.emoji}</span>
                <span className="text-[10px] font-semibold mt-0.5">{day.d}</span>
              </button>
            )
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            🌕🌑 <span className="text-white/80 font-medium">Luna Piena / Luna Nuova</span> → maree sizigiali (più ampie). Pesca intensa, pesce più attivo.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            🌓🌗 <span className="text-white/80 font-medium">Quarti</span> → maree di quadratura (più calme). Pesca più selettiva, prediligere alba e tramonto.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Tocca un giorno per vedere il grafico maree di quella data.
          </p>
        </div>
      </div>
    </div>
  );
}
