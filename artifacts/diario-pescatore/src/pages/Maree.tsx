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

      {/* Grafico maree */}
      <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Grafico Maree 24h</h2>
        <div className="flex items-end gap-1 h-32">
          {tides.heights.map(({h,height})=>{
            const normalized=(height+maxH)/(2*maxH);
            const isHigh=tides.highs.includes(h),isLow=tides.lows.includes(h);
            return(
              <div key={h} className="flex-1 flex flex-col items-center gap-1">
                <div className={cn("w-full rounded-t-sm transition-colors",isHigh?"bg-primary":isLow?"bg-blue-800":"bg-primary/30")}
                  style={{height:`${Math.max(10,normalized*100)}%`}}/>
                {h%6===0&&<span className="text-[8px] text-muted-foreground">{h}h</span>}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary rounded-sm"/>Alta marea</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-800 rounded-sm"/>Bassa marea</span>
        </div>
      </div>

      {/* Calendario mensile fasi lunari */}
      <div className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
          Fasi Lunari — {MONTHS_IT[date.getMonth()]} {date.getFullYear()}
        </h2>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Lun","Mar","Mer","Gio","Ven","Sab","Dom"].map(d=>(
            <div key={d} className="text-center text-[10px] text-muted-foreground font-semibold py-1">{d}</div>
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
                className={cn("aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all hover:bg-primary/10",
                  day.d===date.getDate()?"bg-primary/20 border border-primary text-primary font-bold":"text-white/60")}>
                <span className="text-sm">{day.moon.emoji}</span>
                <span className="text-[9px] mt-0.5">{day.d}</span>
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
