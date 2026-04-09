import { useState, useMemo, useCallback } from "react";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Bot, Loader2, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAZIONI } from "@/hooks/use-location";

/* ─── WMO ─── */
const WMO: Record<number, { label: string; emoji: string }> = {
  0:{label:"Sereno",emoji:"☀️"},1:{label:"Prev. sereno",emoji:"🌤️"},
  2:{label:"Parz. nuvoloso",emoji:"⛅"},3:{label:"Coperto",emoji:"☁️"},
  45:{label:"Nebbia",emoji:"🌫️"},51:{label:"Pioviggine",emoji:"🌦️"},
  61:{label:"Pioggia lieve",emoji:"🌧️"},63:{label:"Pioggia",emoji:"🌧️"},
  65:{label:"Pioggia forte",emoji:"🌧️"},80:{label:"Rovesci",emoji:"🌦️"},
  95:{label:"Temporale",emoji:"⛈️"},96:{label:"Temporale",emoji:"⛈️"},
};
export const wmo = (c: number) => WMO[c] ?? { label: "Variabile", emoji: "🌈" };

/* ─── LUNA ─── */
export function moonPhase(date: Date) {
  const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();
  let yr=y,mo=m; if(mo<=2){yr--;mo+=12;}
  const a=Math.floor(yr/100),b=2-a+Math.floor(a/4);
  const jd=Math.floor(365.25*(yr+4716))+Math.floor(30.6001*(mo+1))+d+b-1524.5;
  const p=((jd-2451549.5)%29.53+29.53)%29.53/29.53;
  const illum=Math.round((1-Math.cos(2*Math.PI*p))/2*100);
  if(p<0.03||p>0.97) return{nome:"Luna Nuova",emoji:"🌑",phase:p,illum};
  if(p<0.22) return{nome:"Crescente",emoji:"🌒",phase:p,illum};
  if(p<0.28) return{nome:"Q. Crescente",emoji:"🌓",phase:p,illum};
  if(p<0.47) return{nome:"Gibbosa Cresc.",emoji:"🌔",phase:p,illum};
  if(p<0.53) return{nome:"Luna Piena",emoji:"🌕",phase:p,illum};
  if(p<0.72) return{nome:"Gibbosa Cal.",emoji:"🌖",phase:p,illum};
  if(p<0.78) return{nome:"Q. Calante",emoji:"🌗",phase:p,illum};
  return{nome:"Calante",emoji:"🌘",phase:p,illum};
}

/* ─── MAREE ─── */
export function tidalH(date: Date,h: number): number {
  const t=(date.getTime()+h*3600000)/1000;
  return 0.35*Math.sin(2*Math.PI*t/(12.42*3600))
        +0.12*Math.sin(2*Math.PI*t/(23.93*3600)+1.2)
        +0.08*Math.sin(2*Math.PI*t/(6.21*3600)+0.5);
}
export function tidalEvents(date: Date) {
  const h24=Array.from({length:25},(_,i)=>tidalH(date,i));
  const ev:Array<{tipo:"alta"|"bassa";ora:number;h:number}>=[];
  for(let i=1;i<24;i++){
    if(h24[i]>h24[i-1]&&h24[i]>h24[i+1]) ev.push({tipo:"alta",ora:i,h:h24[i]});
    else if(h24[i]<h24[i-1]&&h24[i]<h24[i+1]) ev.push({tipo:"bassa",ora:i,h:h24[i]});
  }
  return ev;
}

/* ─── ALGORITMO SCORE ─── */
export interface FishingInputs {
  wmoCode:number;windKn:number;windDir:number;waveH:number;sst:number;
  dayOffset:number;moonPhase:number;
  fieldLevel?:string;fieldTurbidity?:string;fieldCurrent?:string;fishVisible?:boolean;
}
export function computeScore(inp:FishingInputs,date:Date,hour=new Date().getHours()):number {
  const h0=tidalH(date,hour),h1=tidalH(date,hour+1);
  const tideDelta=Math.abs(h1-h0)*100;
  let tideScore=Math.min(30,tideDelta*10);
  const rising=h1>h0;
  const moon=inp.moonPhase;
  const moonDist=Math.min(moon,1-moon);
  let moonScore=moonDist<0.05?25:moonDist<0.15?18:moonDist<0.25?10:5;
  let sstScore=inp.sst>=16&&inp.sst<=22?20:inp.sst>22&&inp.sst<=25?15:inp.sst>=12?10:inp.sst>=8?5:0;
  let waveScore=inp.waveH<=0.3?8:inp.waveH<=0.8?10:inp.waveH<=1.2?6:inp.waveH<=2?2:0;
  const ws=inp.windKn;
  let windScore=ws>20?0:ws>15?2:ws>10?5:ws>5?7:9;
  const favDir=Math.abs(inp.windDir-22)<30||Math.abs(inp.windDir-202)<30;
  if(favDir&&ws<12) windScore=Math.min(9,windScore+2);
  const c=inp.wmoCode;
  let skyScore=c<=1?6:c<=2?5:c<=3?4:c<=55?4:c<=65?2:0;
  let score=tideScore+moonScore+sstScore+waveScore+windScore+skyScore;
  if(moonScore>=18&&tideScore>=22) score+=Math.min(15,(moonScore-15)+(tideScore-20))/2;
  if(rising&&hour>=5&&hour<=8) score+=5;
  if(moon<0.03&&(hour>=21||hour<=4)) score+=8;
  if(c>=51&&c<=55&&inp.waveH<0.5) score+=3;
  if(inp.sst<16) score-=5;
  if(ws>15) score-=3;
  if(tideDelta<1) score-=4;
  const levelMap:Record<string,number>={Basso:-15,Normale:0,Alto:5,Piena:-10};
  const turbMap:Record<string,number>={Chiara:-2,Normale:8,Torbida:4,Fangosa:-14};
  const currMap:Record<string,number>={Ferma:-6,Debole:2,Moderata:4,Forte:0};
  if(inp.fieldLevel) score+=levelMap[inp.fieldLevel]??0;
  if(inp.fieldTurbidity) score+=turbMap[inp.fieldTurbidity]??0;
  if(inp.fieldCurrent) score+=currMap[inp.fieldCurrent]??0;
  if(inp.fishVisible) score+=12;
  if(c>=95) return Math.min(score,4);
  if(inp.sst<8) return Math.min(score,6);
  if(inp.waveH>2) return Math.min(score,8);
  return Math.max(0,Math.min(100,Math.round(score)));
}
export function scoreLabel(s:number):{label:string;color:string;bg:string} {
  if(s>=80) return{label:"Ottimale",color:"text-green-400",bg:"bg-green-500/20 border-green-500/30"};
  if(s>=65) return{label:"Buono",color:"text-teal-400",bg:"bg-teal-500/20 border-teal-500/30"};
  if(s>=50) return{label:"Discreto",color:"text-blue-400",bg:"bg-blue-500/20 border-blue-500/30"};
  if(s>=35) return{label:"Scarso",color:"text-amber-400",bg:"bg-amber-500/20 border-amber-500/30"};
  return{label:"Sfavorevole",color:"text-red-400",bg:"bg-red-500/20 border-red-500/30"};
}

/* ─── HOOK METEO+MARINO ─── */
export function useForecastData(key:string,dayOffset:number) {
  const s=STAZIONI[key]??STAZIONI["porto-badino"];
  const {data:atm}=useQuery({
    queryKey:["atm",key],
    queryFn:async()=>{
      const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_sum&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=Europe/Rome&forecast_days=6`);
      return r.json();
    },staleTime:900000
  });
  const {data:mar}=useQuery({
    queryKey:["mar",key],
    queryFn:async()=>{
      const r=await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${s.lat}&longitude=${s.lng}&daily=wave_height_max,sea_surface_temperature_max&hourly=wave_height,sea_surface_temperature&timezone=Europe/Rome&forecast_days=6`);
      return r.json();
    },staleTime:900000
  });
  const wmoCode=atm?.daily?.weather_code?.[dayOffset]??0;
  const windKn=atm?.daily?.wind_speed_10m_max?.[dayOffset]??0;
  const windDir=atm?.daily?.wind_direction_10m_dominant?.[dayOffset]??0;
  const waveH=mar?.daily?.wave_height_max?.[dayOffset]??0.3;
  const sst=mar?.daily?.sea_surface_temperature_max?.[dayOffset]??16;
  return{atm,mar,wmoCode,windKn,windDir,waveH,sst,loaded:!!atm&&!!mar};
}

/* ─── TECNICHE, ESCHE, SPECIE ─── */
const TECNICHE=[
  {nome:"Surfcasting foce",emoji:"🎣",specie:"Spigola · Serra · Orata · Leccia · Ombrina",
    cond:(s:number,_n:boolean,_sst:number)=>s>=50},
  {nome:"Spinning da riva",emoji:"🌀",specie:"Spigola · Serra · Leccia stella",
    cond:(s:number)=>s>=55},
  {nome:"Feeder / fondo canale",emoji:"⚖️",specie:"Cefalo · Anguilla · Sogliola · Mormora · Sparaglione",
    cond:()=>true},
  {nome:"Bolognese / colpo",emoji:"🪝",specie:"Cefalo · Muggine · Sparaglione · Mormora",
    cond:()=>true},
  {nome:"Fondo notturno",emoji:"🌙",specie:"Anguilla · Spigola · Sogliola",
    cond:(_s:number,night:boolean)=>night},
  {nome:"Pesca al granchio blu",emoji:"🦀",specie:"Granchio blu — tutto il Portatore",
    cond:(_s:number,_n:boolean,sst:number)=>sst>=18},
];

export function getEsche(sst:number,wmoCode:number,waveH:number){
  const turbid=waveH>0.8,warm=sst>19,rainy=wmoCode>=51&&wmoCode<=65;
  return[
    {nome:"Cannolicchio",emoji:"🦪",motivo:"Sempre efficace alla foce, spigola e ombrina"},
    {nome:"Coreano / Americano",emoji:"🪡",motivo:turbid?"Ottimo in acqua torbida":"Top per surfcasting foce"},
    {nome:warm?"Vivo (sardina/acciuga)":"Arenicola",emoji:warm?"🐟":"🪱",motivo:warm?"Spigola e leccia in acqua calda":"Classico tuttofare"},
    {nome:rainy?"Gamberetto fresco":"Trancio di cefalo",emoji:rainy?"🦐":"🐠",motivo:rainy?"Potente dopo la pioggia":"Spigola grossa, notte"},
    {nome:"Polpo / calamaretti",emoji:"🐙",motivo:"Ombrina e dentice, fondo misto"},
  ];
}

const SPECIE11=[
  {nome:"Spigola / Branzino",emoji:"🐟",zona:"Foce + canale",prob:(s:number,_sst:number,night:boolean)=>night?Math.min(95,s+15):s>60?s-5:s*0.7},
  {nome:"Pesce Serra",emoji:"🐡",zona:"Foce + mare",prob:(_s:number,sst:number)=>sst>20?75:sst>17?50:20},
  {nome:"Orata",emoji:"🐠",zona:"Foce (primo tratto)",prob:(s:number,sst:number)=>sst>17?Math.min(80,s):s*0.4},
  {nome:"Leccia stella",emoji:"🐟",zona:"Foce — mare aperto",prob:(s:number,sst:number)=>sst>19&&s>60?70:30},
  {nome:"Cefalo / Muggine",emoji:"🐟",zona:"Tutto il canale",prob:(s:number)=>Math.min(90,50+s*0.3)},
  {nome:"Mormora",emoji:"🐠",zona:"Foce + fondo sabbioso",prob:(s:number)=>40+s*0.2},
  {nome:"Ombrina",emoji:"🐡",zona:"Foce + scogli molo",prob:(s:number)=>s>50?50:25},
  {nome:"Sogliola",emoji:"🐟",zona:"Fondo sabbioso canale",prob:(_s:number,_sst:number,night:boolean)=>night?65:30},
  {nome:"Anguilla",emoji:"🐍",zona:"Fondo canale",prob:(_s:number,_sst:number,night:boolean)=>night?70:25},
  {nome:"Sparaglione",emoji:"🐠",zona:"Tutto il canale",prob:()=>45},
  {nome:"Granchio blu",emoji:"🦀",zona:"Tutto il Portatore",prob:(_s:number,sst:number)=>sst>18?85:40},
];

/* ─── SUB-COMPONENTS ─── */
function FactorPill({emoji,label,pts,max,desc}:{emoji:string;label:string;pts:number;max:number;desc:string}){
  return(
    <div className="bg-background rounded-2xl p-3 border border-white/5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-base">{emoji}</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="text-lg font-bold text-white">{pts}</span>
        <span className="text-xs text-muted-foreground">/{max}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-1.5">
        <div className="h-full bg-primary rounded-full" style={{width:`${Math.round(pts/max*100)}%`}}/>
      </div>
      <p className="text-[10px] text-primary/70 truncate">{desc}</p>
    </div>
  );
}

function FieldSelect({label,value,opts,effects,onChange}:{label:string;value:string;opts:string[];effects:number[];onChange:(v:string)=>void}){
  return(
    <div>
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {opts.map((o,i)=>(
          <button key={o} onClick={()=>onChange(o)}
            className={cn("px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
              value===o?"bg-primary/20 border-primary/50 text-primary":"bg-background border-white/10 text-muted-foreground hover:border-white/30")}>
            {o}
            <span className={cn("ml-1",effects[i]>0?"text-green-400/70":effects[i]<0?"text-red-400/70":"text-white/30")}>
              {effects[i]>0?`+${effects[i]}`:effects[i]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── FIELD STATE ─── */
interface FieldState {
  level:string;turbidity:string;current:string;fishVisible:boolean;notes:string;
}

const TABS=[
  {id:"dati",label:"📊 Dati"},
  {id:"tecnica",label:"🎣 Tecnica"},
  {id:"esche",label:"🪱 Esche"},
  {id:"specie",label:"🐟 Specie"},
  {id:"campo",label:"🌊 Campo"},
  {id:"ai",label:"🤖 AI"},
];

const DEEPSEEK_KEY="sk-84b89b428959461e818ad77775913978";

/* ─── MAIN COMPONENT ─── */
export function FishingForecastCard({stazioneKey}:{stazioneKey:string}) {
  const [dayOffset,setDayOffset]=useState(0);
  const [activeTab,setActiveTab]=useState("dati");
  const [field,setField]=useState<FieldState>({level:"Normale",turbidity:"Normale",current:"Moderata",fishVisible:false,notes:""});
  const [aiReply,setAiReply]=useState<string|null>(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiError,setAiError]=useState<string|null>(null);

  const date=useMemo(()=>addDays(new Date(),dayOffset),[dayOffset]);
  const moon=useMemo(()=>moonPhase(date),[date]);
  const tides=useMemo(()=>tidalEvents(date),[date]);
  const {wmoCode,windKn,windDir:wDir,waveH,sst,loaded}=useForecastData(stazioneKey,dayOffset);

  const now=new Date().getHours();
  const isNight=now>=21||now<=5;

  const inp:FishingInputs={wmoCode,windKn,windDir:wDir,waveH,sst,dayOffset,moonPhase:moon.phase,
    fieldLevel:field.level,fieldTurbidity:field.turbidity,fieldCurrent:field.current,fishVisible:field.fishVisible};
  const score=useMemo(()=>computeScore(inp,date),[JSON.stringify(inp),date.toDateString()]);
  const {label,color,bg}=scoreLabel(score);

  const hourlyScores=useMemo(()=>
    Array.from({length:24},(_,h)=>Math.max(0,Math.min(100,computeScore(inp,date,h))))
  ,[JSON.stringify(inp),date.toDateString()]);
  const peakHour=hourlyScores.indexOf(Math.max(...hourlyScores));

  const esche=useMemo(()=>getEsche(sst,wmoCode,waveH),[sst,wmoCode,waveH]);

  const specieProb=useMemo(()=>SPECIE11.map(s=>({
    ...s,p:Math.round(s.prob(score,sst,isNight))
  })).sort((a,b)=>b.p-a.p),[score,sst,isNight]);

  const windDirLabel=(deg:number)=>{
    const dirs=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
    return dirs[Math.round(deg/22.5)%16];
  };
  const favWindDir=Math.abs(wDir-22)<30||Math.abs(wDir-202)<30;

  const fetchAI=useCallback(async()=>{
    setAiLoading(true);
    setAiError(null);
    const stNome=STAZIONI[stazioneKey]?.nome??"Porto Badino";
    const ctx=`Stazione: ${stNome}. Giorno: ${format(date,"EEEE d MMM",{locale:it})}. Punteggio: ${score}/100 (${label}). Vento: ${Math.round(windKn)}kn ${windDirLabel(wDir)} (${favWindDir?"favorevole alla foce":"sfavorevole"}). Onde: ${waveH.toFixed(1)}m. Temp. mare: ${sst.toFixed(1)}°C. Meteo: ${wmo(wmoCode).label}. Maree: ${tides.slice(0,3).map(t=>`${t.tipo==="alta"?"alta":"bassa"} h${t.ora}:00`).join(", ")}. Luna: ${moon.nome} ${moon.illum}%. Canale: livello ${field.level}, torbidità ${field.turbidity}, corrente ${field.current}${field.fishVisible?", pesci visibili in superficie":""}.${field.notes?` Note: ${field.notes}.`:""}`;
    try{
      const r=await fetch("https://api.deepseek.com/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${DEEPSEEK_KEY}`},
        body:JSON.stringify({
          model:"deepseek-chat",
          messages:[
            {role:"system",content:"Sei un pescatore esperto di Porto Badino (Canale Fiume Portatore, costa laziale). Conosci il Portatore come le tue tasche. Solo pesca da terra. Rispondi in italiano, massimo 6 righe, molto pratico e concreto: orario migliore, esca consigliata, posizione esatta (foce / metà canale / canale interno), specie target, tecnica."},
            {role:"user",content:`Condizioni attuali: ${ctx}\n\nDammi il tuo consiglio per questa uscita.`}
          ]
        })
      });
      const d=await r.json();
      if(!r.ok){
        const msg=d.error?.message||`Errore ${r.status}`;
        throw new Error(msg);
      }
      setAiReply(d.choices?.[0]?.message?.content??"Nessuna risposta ricevuta.");
    }catch(e:any){
      setAiError(e.message||"Errore di connessione. Controlla la rete.");
    }finally{
      setAiLoading(false);
    }
  },[stazioneKey,date,score,label,windKn,wDir,waveH,sst,wmoCode,tides,moon,field,favWindDir]);

  return(
    <div className="bg-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">

      {/* ── SCORE HEADER ── */}
      <div className="p-5 md:p-6 bg-gradient-to-br from-card to-background border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"/>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">🎣 Indice Pescabilità</p>
            <p className="text-xs text-muted-foreground">{STAZIONI[stazioneKey]?.nome??"Porto Badino"}</p>
          </div>
          <div className="flex items-center gap-3 bg-background/50 px-3 py-1.5 rounded-full border border-white/5">
            <button disabled={dayOffset<=0} onClick={()=>setDayOffset(p=>p-1)} className="disabled:opacity-30 hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <span className="text-xs font-semibold min-w-[60px] text-center">
              {dayOffset===0?"Oggi":dayOffset===1?"Domani":format(date,"EEE d MMM",{locale:it})}
            </span>
            <button disabled={dayOffset>=5} onClick={()=>setDayOffset(p=>p+1)} className="disabled:opacity-30 hover:text-primary transition-colors">
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <path fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" strokeLinecap="round"
                strokeDasharray={`${score}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white leading-none">{loaded?score:"—"}</span>
              <span className="text-[9px] text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold border",bg,color)}>{label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm">{wmo(wmoCode).emoji} {wmo(wmoCode).label}</span>
              <span className="text-muted-foreground text-sm">· {moon.emoji} {moon.nome}</span>
            </div>
            <p className="text-xs text-primary/70 mt-2">Picco ore {String(peakHour).padStart(2,"0")}:00 ({hourlyScores[peakHour]}/100)</p>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-background/30">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            className={cn("px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0",
              activeTab===t.id?"border-primary text-primary bg-primary/5":"border-transparent text-muted-foreground hover:text-white hover:bg-white/5")}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">

        {/* ── DATI ── */}
        {activeTab==="dati"&&(
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <FactorPill emoji="🌊" label="Marea" max={30}
                pts={Math.round(Math.min(30,Math.abs(tidalH(date,12+1)-tidalH(date,12))*1000))}
                desc={tides.slice(0,2).map(t=>`${t.tipo==="alta"?"▲":"▼"}${t.ora}:00`).join(" ")}/>
              <FactorPill emoji={moon.emoji} label="Luna" max={25}
                pts={moon.illum<5||moon.illum>95?25:moon.illum<30||moon.illum>70?18:10}
                desc={`${moon.nome} ${moon.illum}%`}/>
              <FactorPill emoji="🌡️" label="Temp. Mare" max={20}
                pts={sst>=16&&sst<=22?20:sst>22?15:sst>=12?10:5}
                desc={`${sst.toFixed(1)}°C SST`}/>
              <FactorPill emoji="🌊" label="Onde" max={10}
                pts={waveH<=0.8?10:waveH<=1.2?6:2} desc={`${waveH.toFixed(1)}m`}/>
              <FactorPill emoji="💨" label="Vento" max={9}
                pts={windKn<=5?9:windKn<=10?7:windKn<=15?5:2}
                desc={`${Math.round(windKn)}kn ${windDirLabel(wDir)}${favWindDir?" ✓":""}`}/>
              <FactorPill emoji="☁️" label="Meteo" max={6}
                pts={wmoCode<=1?6:wmoCode<=2?5:wmoCode<=3?4:wmoCode<=55?4:2}
                desc={wmo(wmoCode).label}/>
            </div>
            <div className="bg-background rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Andamento orario</p>
              {(()=>{
                const W=300,H=64,pad=4;
                const min=Math.min(...hourlyScores),max=Math.max(...hourlyScores);
                const range=Math.max(max-min,10);
                const px=(h:number)=>pad+(h/23)*(W-pad*2);
                const py=(v:number)=>H-pad-((v-min)/range)*(H-pad*2);
                const pts=hourlyScores.map((v,h)=>`${px(h).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
                const area=`M${px(0)},${H} L${pts.split(" ").map((p,i)=>i===0?`${p}`:`L${p}`).join(" ")} L${px(23)},${H} Z`;
                const nowX=px(now);
                const nowY=py(hourlyScores[now]);
                return(
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:"72px",overflow:"visible"}}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35"/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03"/>
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#areaGrad)"/>
                    <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
                    {[0,6,12,18,23].map(h=>(
                      <line key={h} x1={px(h)} y1={H-2} x2={px(h)} y2={H} stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.4"/>
                    ))}
                    <line x1={nowX} y1={pad} x2={nowX} y2={H} stroke="hsl(var(--primary))" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5"/>
                    <circle cx={nowX} cy={nowY} r="3" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="1.5"/>
                    {[0,6,12,18].map(h=>(
                      <text key={h} x={px(h)} y={H+10} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.5">{h}h</text>
                    ))}
                  </svg>
                );
              })()}
            </div>
            <div className={cn("rounded-2xl p-3 border text-sm flex items-center gap-3",
              favWindDir?"bg-green-500/10 border-green-500/20 text-green-300":"bg-amber-500/10 border-amber-500/20 text-amber-300")}>
              <Wind className="w-4 h-4 shrink-0"/>
              <span>Vento {windDirLabel(wDir)} {Math.round(windKn)}kn — {favWindDir?"favorevole (spalle alla foce) ✓":"non ottimale rispetto alla foce"}</span>
            </div>
          </div>
        )}

        {/* ── TECNICA ── */}
        {activeTab==="tecnica"&&(
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground mb-3">Tecniche da terra — ordinate per condizioni attuali</p>
            {TECNICHE.filter(t=>t.cond(score,isNight,sst)).map((t,i)=>(
              <div key={i} className={cn("rounded-2xl p-4 border",i===0?"bg-primary/10 border-primary/30":"bg-background border-white/5")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{t.emoji}</span>
                  <p className={cn("font-semibold text-sm",i===0?"text-primary":"text-white")}>{t.nome}</p>
                  {i===0&&<span className="ml-auto text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">CONSIGLIATA</span>}
                </div>
                <p className="text-xs text-muted-foreground ml-7">{t.specie}</p>
              </div>
            ))}
            {TECNICHE.filter(t=>!t.cond(score,isNight,sst)).map((t,i)=>(
              <div key={`nd${i}`} className="rounded-2xl p-4 border border-white/5 bg-background/30 opacity-40">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.emoji}</span>
                  <p className="text-sm text-muted-foreground">{t.nome}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ESCHE ── */}
        {activeTab==="esche"&&(
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground mb-3">Esche consigliate · SST {sst.toFixed(0)}°C · torbidità · stagione</p>
            {esche.map((e,i)=>(
              <div key={i} className={cn("rounded-2xl p-4 border flex items-start gap-3",
                i===0?"bg-primary/10 border-primary/30":"bg-background border-white/5")}>
                <span className="text-2xl shrink-0">{e.emoji}</span>
                <div>
                  <p className={cn("font-semibold text-sm",i===0?"text-primary":"text-white")}>{e.nome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.motivo}</p>
                </div>
                {i===0&&<span className="ml-auto shrink-0 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold self-start">TOP</span>}
              </div>
            ))}
          </div>
        )}

        {/* ── SPECIE ── */}
        {activeTab==="specie"&&(
          <div className="space-y-2 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground mb-3">Probabilità cattura · Porto Badino · condizioni ora</p>
            {specieProb.map((s,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-white/5">
                <span className="text-lg w-8 text-center shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">{s.nome}</p>
                    <span className={cn("text-xs font-bold ml-2 shrink-0",
                      s.p>=70?"text-green-400":s.p>=45?"text-amber-400":"text-muted-foreground")}>
                      {s.p}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full",s.p>=70?"bg-green-500":s.p>=45?"bg-amber-500":"bg-white/20")}
                        style={{width:`${s.p}%`}}/>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[80px]">{s.zona}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CAMPO ── */}
        {activeTab==="campo"&&(
          <div className="space-y-4 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground">Condizioni reali — corregge il punteggio</p>
            <FieldSelect label="Livello canale Portatore" value={field.level} onChange={v=>setField(p=>({...p,level:v}))}
              opts={["Basso","Normale","Alto","Piena"]} effects={[-15,0,5,-10]}/>
            <FieldSelect label="Torbidità acqua" value={field.turbidity} onChange={v=>setField(p=>({...p,turbidity:v}))}
              opts={["Chiara","Normale","Torbida","Fangosa"]} effects={[-2,8,4,-14]}/>
            <FieldSelect label="Corrente foce" value={field.current} onChange={v=>setField(p=>({...p,current:v}))}
              opts={["Ferma","Debole","Moderata","Forte"]} effects={[-6,2,4,0]}/>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-background border border-white/5 cursor-pointer">
              <input type="checkbox" checked={field.fishVisible} onChange={e=>setField(p=>({...p,fishVisible:e.target.checked}))}
                className="w-4 h-4 accent-teal-500"/>
              <div>
                <p className="text-sm text-white font-medium">Pesci visibili in superficie</p>
                <p className="text-xs text-green-400">+12 punti</p>
              </div>
            </label>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Note libere</p>
              <textarea value={field.notes} onChange={e=>setField(p=>({...p,notes:e.target.value}))} rows={2}
                placeholder="es. corrente forte verso il molo, acqua color tè..."
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary resize-none"/>
            </div>
            <div className={cn("rounded-2xl p-4 border text-center",bg)}>
              <p className="text-xs text-muted-foreground mb-1">Punteggio con dati campo</p>
              <p className={cn("text-3xl font-black",color)}>{score}</p>
              <p className={cn("text-sm font-semibold",color)}>{label}</p>
            </div>
          </div>
        )}

        {/* ── AI ── */}
        {activeTab==="ai"&&(
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-background rounded-2xl p-4 border border-white/5 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-white mb-2">Contesto inviato:</p>
              <p>📍 {STAZIONI[stazioneKey]?.nome} · {format(date,"EEEE d MMM",{locale:it})}</p>
              <p>🎯 Score: {score}/100 · 🌊 {waveH.toFixed(1)}m · 💨 {Math.round(windKn)}kn {windDirLabel(wDir)}</p>
              <p>🌡️ SST: {sst.toFixed(1)}°C · {wmo(wmoCode).emoji} {wmo(wmoCode).label} · {moon.emoji} {moon.nome}</p>
              <p>🌊 Canale: {field.level} · {field.turbidity} · {field.current}</p>
            </div>
            {aiError&&(
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-300">
                <p className="font-semibold mb-1">Errore connessione AI</p>
                <p className="text-xs opacity-80">{aiError}</p>
              </div>
            )}
            {aiReply&&(
              <div className="bg-background rounded-2xl p-4 border border-white/5 text-sm text-white leading-relaxed whitespace-pre-wrap">
                {aiReply}
              </div>
            )}
            {!aiReply&&!aiError&&(
              <div className="text-center py-6">
                <Bot className="w-10 h-10 text-violet-400 mx-auto mb-3"/>
                <p className="text-sm text-muted-foreground mb-4">
                  Analisi contestuale DeepSeek · orario · esca · posizione · specie
                </p>
              </div>
            )}
            <button onClick={fetchAI} disabled={aiLoading}
              className="w-full py-3 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-300 font-semibold flex items-center justify-center gap-2 hover:bg-violet-600/30 transition-colors disabled:opacity-50">
              {aiLoading?<><Loader2 className="w-4 h-4 animate-spin"/>Analisi in corso…</>
                :<><Bot className="w-4 h-4"/>{aiReply?"Rigenera consiglio":"Chiedi al guru di Porto Badino"}</>}
            </button>
            <p className="text-center text-[10px] text-muted-foreground/50">DeepSeek Chat · deepseek-chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
