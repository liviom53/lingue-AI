import { useState, useMemo, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Anchor, Fish, MapPin, ArrowRight, Scale, ChevronDown,
  Waves, Moon, Wind, Thermometer, Droplets, Camera,
  ChevronLeft, ChevronRight, Bot, Loader2, X, AlertTriangle,
  Sun, Sunrise, Sunset, TrendingUp
} from "lucide-react";
import { usciteAPI, pescatoAPI, spotAPI } from "@/hooks/use-local-data";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════
   STAZIONI
═══════════════════════════════════ */
const STAZIONI: Record<string, { nome: string; lat: number; lng: number }> = {
  "porto-badino":  { nome: "Porto Badino",       lat: 41.28, lng: 13.16 },
  "terracina":     { nome: "Terracina",           lat: 41.29, lng: 13.25 },
  "sabaudia":      { nome: "Sabaudia",            lat: 41.30, lng: 13.03 },
  "circeo":        { nome: "San Felice Circeo",   lat: 41.24, lng: 13.10 },
  "anzio":         { nome: "Anzio",               lat: 41.45, lng: 12.63 },
  "nettuno":       { nome: "Nettuno",             lat: 41.45, lng: 12.66 },
  "borgo-grappa":  { nome: "Borgo Grappa",        lat: 41.49, lng: 12.90 },
  "sperlonga":     { nome: "Sperlonga",           lat: 41.26, lng: 13.44 },
  "gaeta":         { nome: "Gaeta",               lat: 41.21, lng: 13.57 },
  "formia":        { nome: "Formia",              lat: 41.26, lng: 13.62 },
  "civitavecchia": { nome: "Civitavecchia",       lat: 42.10, lng: 11.80 },
  "fiumicino":     { nome: "Fiumicino",           lat: 41.77, lng: 12.24 },
};

const WMO: Record<number, { label: string; emoji: string }> = {
  0:{label:"Sereno",emoji:"☀️"},1:{label:"Prev. sereno",emoji:"🌤️"},
  2:{label:"Parz. nuvoloso",emoji:"⛅"},3:{label:"Coperto",emoji:"☁️"},
  45:{label:"Nebbia",emoji:"🌫️"},51:{label:"Pioviggine",emoji:"🌦️"},
  61:{label:"Pioggia lieve",emoji:"🌧️"},63:{label:"Pioggia",emoji:"🌧️"},
  65:{label:"Pioggia forte",emoji:"🌧️"},80:{label:"Rovesci",emoji:"🌦️"},
  95:{label:"Temporale",emoji:"⛈️"},96:{label:"Temporale",emoji:"⛈️"},
};
const wmo = (c: number) => WMO[c] ?? { label: "Variabile", emoji: "🌈" };

/* ═══════════════════════════════════
   LUNA
═══════════════════════════════════ */
function moonPhase(date: Date) {
  const y = date.getFullYear(), m = date.getMonth()+1, d = date.getDate();
  let yr=y,mo=m; if(mo<=2){yr--;mo+=12;}
  const a=Math.floor(yr/100), b=2-a+Math.floor(a/4);
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

/* ═══════════════════════════════════
   MAREE (modello armonico M2+K1+M4)
═══════════════════════════════════ */
function tidalH(date: Date, h: number) {
  const t=(date.getTime()+h*3600000)/1000;
  return 0.35*Math.sin(2*Math.PI*t/(12.42*3600))
        +0.12*Math.sin(2*Math.PI*t/(23.93*3600)+1.2)
        +0.08*Math.sin(2*Math.PI*t/(6.21*3600)+0.5);
}
function tidalEvents(date: Date) {
  const h24=Array.from({length:25},(_,i)=>tidalH(date,i));
  const ev:Array<{tipo:"alta"|"bassa";ora:number;h:number}>=[];
  for(let i=1;i<24;i++){
    if(h24[i]>h24[i-1]&&h24[i]>h24[i+1]) ev.push({tipo:"alta",ora:i,h:h24[i]});
    else if(h24[i]<h24[i-1]&&h24[i]<h24[i+1]) ev.push({tipo:"bassa",ora:i,h:h24[i]});
  }
  return ev;
}

/* ═══════════════════════════════════
   ALGORITMO PUNTEGGIO PESCA
═══════════════════════════════════ */
interface FishingInputs {
  wmoCode: number;
  windKn: number;
  windDir: number;        // gradi
  waveH: number;          // metri
  sst: number;            // °C temperatura mare
  dayOffset: number;
  moonPhase: number;      // 0-1
  fieldLevel?: string;    // canale: Basso|Normale|Alto|Piena
  fieldTurbidity?: string;// Chiara|Normale|Torbida|Fangosa
  fieldCurrent?: string;  // Ferma|Debole|Moderata|Forte
  fishVisible?: boolean;
}

function computeScore(inp: FishingInputs, date: Date, hour: number = new Date().getHours()) {
  const moon = inp.moonPhase;

  // ── TIDE score (30pt) ──
  const h0=tidalH(date,hour), h1=tidalH(date,hour+1);
  const tideDelta=Math.abs(h1-h0)*100; // cm/h
  let tideScore=Math.min(30, tideDelta*10);
  const rising=h1>h0;

  // ── MOON score (25pt) ──
  let moonScore=0;
  const moonDist=Math.min(moon,1-moon); // 0=new/full, 0.5=quarter
  if(moonDist<0.05) moonScore=25;       // new/full moon
  else if(moonDist<0.15) moonScore=18;
  else if(moonDist<0.25) moonScore=10;
  else moonScore=5;

  // ── SST score (20pt) ──
  let sstScore=0;
  if(inp.sst>=16&&inp.sst<=22) sstScore=20;
  else if(inp.sst>22&&inp.sst<=25) sstScore=15;
  else if(inp.sst>=12&&inp.sst<16) sstScore=10;
  else if(inp.sst>=8&&inp.sst<12) sstScore=5;
  else if(inp.sst<8) sstScore=0;
  else sstScore=8; // >25

  // ── WAVE score (10pt) ──
  let waveScore=0;
  if(inp.waveH<=0.3) waveScore=8;
  else if(inp.waveH<=0.8) waveScore=10;
  else if(inp.waveH<=1.2) waveScore=6;
  else if(inp.waveH<=2.0) waveScore=2;
  else waveScore=0;

  // ── WIND score (9pt) ── NNE (22°) è favorevole per Porto Badino foce
  let windScore=9;
  const ws=inp.windKn;
  if(ws>20) windScore=0;
  else if(ws>15) windScore=2;
  else if(ws>10) windScore=5;
  else if(ws>5) windScore=7;
  // direzione: NNE spalle alla foce +bonus
  const favDir=Math.abs(inp.windDir-22)<30||Math.abs(inp.windDir-202)<30;
  if(favDir&&ws<12) windScore=Math.min(9,windScore+2);

  // ── METEO score (6pt) ──
  let skyScore=6;
  const c=inp.wmoCode;
  if(c<=1) skyScore=6; else if(c<=2) skyScore=5; else if(c<=3) skyScore=4;
  else if(c<=55) skyScore=4; else if(c<=65) skyScore=2;
  else if(c>=95) skyScore=0;

  // ── BASE SCORE ──
  let score=tideScore+moonScore+sstScore+waveScore+windScore+skyScore;

  // ── MOLTIPLICATORE Luna×Maree ──
  if(moonScore>=18&&tideScore>=22) score+=Math.min(15,(moonScore-15)+(tideScore-20))/2;

  // ── BONUS COMBINATI ──
  if(rising&&(hour>=5&&hour<=8)) score+=5;   // alba + marea in salita
  if(moon<0.03&&(hour>=21||hour<=4)) score+=8; // notte + luna nuova
  if((c>=51&&c<=55)&&inp.waveH<0.5) score+=3; // pioviggine + mare calmo

  // ── PENALITÀ SOFT ──
  if(inp.sst<16) score-=5;
  if(ws>15) score-=3;
  if(tideDelta<1) score-=4;

  // ── CAMPO (correzioni reali) ──
  const levelMap:Record<string,number>={Basso:-15,Normale:0,Alto:5,Piena:-10};
  const turbMap:Record<string,number>={Chiara:-2,Normale:8,Torbida:4,Fangosa:-14};
  const currMap:Record<string,number>={Ferma:-6,Debole:2,Moderata:4,Forte:0};
  if(inp.fieldLevel) score+=levelMap[inp.fieldLevel]??0;
  if(inp.fieldTurbidity) score+=turbMap[inp.fieldTurbidity]??0;
  if(inp.fieldCurrent) score+=currMap[inp.fieldCurrent]??0;
  if(inp.fishVisible) score+=12;

  // ── BLOCCHI DURI ──
  if(c>=95) return Math.min(score,4);
  if(inp.sst<8) return Math.min(score,6);
  if(inp.waveH>2) return Math.min(score,8);

  return Math.max(0,Math.min(100,Math.round(score)));
}

function scoreLabel(s: number): { label: string; color: string; bg: string } {
  if(s>=80) return{label:"Ottimale",color:"text-green-400",bg:"bg-green-500/20 border-green-500/30"};
  if(s>=65) return{label:"Buono",color:"text-teal-400",bg:"bg-teal-500/20 border-teal-500/30"};
  if(s>=50) return{label:"Discreto",color:"text-blue-400",bg:"bg-blue-500/20 border-blue-500/30"};
  if(s>=35) return{label:"Scarso",color:"text-amber-400",bg:"bg-amber-500/20 border-amber-500/30"};
  return{label:"Sfavorevole",color:"text-red-400",bg:"bg-red-500/20 border-red-500/30"};
}

/* ═══════════════════════════════════
   HOOK METEO + MARINO
═══════════════════════════════════ */
function useForecastData(key: string, dayOffset: number) {
  const s=STAZIONI[key];
  const { data:atm } = useQuery({
    queryKey:["atm",key],
    queryFn:async()=>{
      const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_sum&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,apparent_temperature&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=Europe/Rome&forecast_days=6`);
      return r.json();
    }, staleTime:900000
  });
  const { data:mar } = useQuery({
    queryKey:["mar",key],
    queryFn:async()=>{
      const r=await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${s.lat}&longitude=${s.lng}&daily=wave_height_max,sea_surface_temperature_max&hourly=wave_height,sea_surface_temperature&timezone=Europe/Rome&forecast_days=6`);
      return r.json();
    }, staleTime:900000
  });
  const wmoCode = atm?.daily?.weather_code?.[dayOffset]??0;
  const windKn  = atm?.daily?.wind_speed_10m_max?.[dayOffset]??0;
  const windDir = atm?.daily?.wind_direction_10m_dominant?.[dayOffset]??0;
  const waveH   = mar?.daily?.wave_height_max?.[dayOffset]??0.3;
  const sst     = mar?.daily?.sea_surface_temperature_max?.[dayOffset]??16;
  return { atm, mar, wmoCode, windKn, windDir, waveH, sst, loaded:!!atm&&!!mar };
}

/* ═══════════════════════════════════
   TECNICHE, ESCHE, SPECIE
═══════════════════════════════════ */
const TECNICHE=[
  {nome:"Surfcasting foce",emoji:"🎣",specie:"Spigola · Serra · Orata · Leccia · Ombrina",cond:(s:number,n:boolean)=>s>=50},
  {nome:"Spinning da riva",emoji:"🌀",specie:"Spigola · Serra · Leccia stella",cond:(s:number)=>s>=55},
  {nome:"Feeder / fondo canale",emoji:"⚖️",specie:"Cefalo · Anguilla · Sogliola · Mormora · Sparaglione",cond:()=>true},
  {nome:"Bolognese / colpo",emoji:"🪝",specie:"Cefalo · Muggine · Sparaglione · Mormora",cond:()=>true},
  {nome:"Fondo notturno",emoji:"🌙",specie:"Anguilla · Spigola · Sogliola",cond:(_:number,night:boolean)=>night},
  {nome:"Pesca al granchio blu",emoji:"🦀",specie:"Granchio blu — tutto il Portatore",cond:(_:number,__:boolean,sst:number)=>sst>=18},
];

function getEsche(sst:number, wmoCode:number, waveH:number) {
  const turbid=waveH>0.8;
  const warm=sst>19;
  const rainy=wmoCode>=51&&wmoCode<=65;
  const list=[
    {nome:"Cannolicchio",emoji:"🦪",motivo:"Sempre efficace alla foce, spigola e ombrina"},
    {nome:"Coreano / Americano",emoji:"🪡",motivo:turbid?"Ottimo in acqua torbida":"Top per surfcasting foce"},
    {nome:warm?"Vivo (sardina/acciuga)":"Arenicola",emoji:warm?"🐟":"🪱",motivo:warm?"Spigola e leccia in acqua calda":"Classico tuttofare"},
    {nome:rainy?"Gamberetto fresco":"Trancio di cefalo",emoji:rainy?"🦐":"🐠",motivo:rainy?"Potente dopo la pioggia":"Spigola grossa, notte"},
    {nome:"Polpo / calamaretti",emoji:"🐙",motivo:"Ombrina e dentice, fondo misto"},
  ];
  return list;
}

const SPECIE11=[
  {nome:"Spigola / Branzino",emoji:"🐟",zona:"Foce + canale",prob:(s:number,sst:number,night:boolean)=>night?Math.min(95,s+15):s>60?s-5:s*0.7},
  {nome:"Pesce Serra",emoji:"🐡",zona:"Foce + mare",prob:(_:number,sst:number)=>sst>20?75:sst>17?50:20},
  {nome:"Orata",emoji:"🐠",zona:"Foce (primo tratto)",prob:(s:number,sst:number)=>sst>17?Math.min(80,s):s*0.4},
  {nome:"Leccia stella",emoji:"🐟",zona:"Foce — mare aperto",prob:(s:number,sst:number)=>sst>19&&s>60?70:30},
  {nome:"Cefalo / Muggine",emoji:"🐟",zona:"Tutto il canale",prob:(s:number)=>Math.min(90,50+s*0.3)},
  {nome:"Mormora",emoji:"🐠",zona:"Foce + fondo sabbioso",prob:(s:number)=>40+s*0.2},
  {nome:"Ombrina",emoji:"🐡",zona:"Foce + scogli molo",prob:(s:number)=>s>50?50:25},
  {nome:"Sogliola",emoji:"🐟",zona:"Fondo sabbioso canale",prob:(_:number,__:number,night:boolean)=>night?65:30},
  {nome:"Anguilla",emoji:"🐍",zona:"Fondo canale",prob:(_:number,__:number,night:boolean)=>night?70:25},
  {nome:"Sparaglione",emoji:"🐠",zona:"Tutto il canale",prob:()=>45},
  {nome:"Granchio blu",emoji:"🦀",zona:"Tutto il Portatore",prob:(_:number,sst:number)=>sst>18?85:40},
];

/* ═══════════════════════════════════
   SCANNER SPECIE AI (Gemini)
═══════════════════════════════════ */
const GEMINI_KEY="AIzaSyC4MYpqPfJC0NPkYBuuXKrHsFHY2QHQFIL";

function SpeciesScanner() {
  const [result,setResult]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);

  const scan=useCallback(async(file:File)=>{
    setLoading(true);
    setResult(null);
    const b64=await new Promise<string>(res=>{
      const fr=new FileReader();
      fr.onload=e=>res((e.target?.result as string).split(",")[1]);
      fr.readAsDataURL(file);
    });
    setPreview(URL.createObjectURL(file));
    try{
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[
          {text:"Sei un ittiologo esperto del Mar Tirreno. Identifica la specie di pesce nella foto. Rispondi in italiano con: nome comune, nome scientifico, caratteristiche distintive, taglia media, valore culinario. Sii conciso (max 5 righe)."},
          {inline_data:{mime_type:file.type,data:b64}}
        ]}]})
      });
      const d=await r.json();
      setResult(d.candidates?.[0]?.content?.parts?.[0]?.text??"Specie non riconosciuta.");
    }catch{setResult("Errore di connessione al servizio AI.");}
    finally{setLoading(false);}
  },[]);

  return(
    <div className="bg-card rounded-3xl border border-white/5 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-400"/>Scanner Specie AI
        </h3>
        <span className="text-[10px] text-primary/60 font-mono">Gemini 1.5 Flash</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e=>{const f=e.target.files?.[0];if(f)scan(f);e.target.value="";}}/>

      {!preview?(
        <button onClick={()=>fileRef.current?.click()}
          className="w-full flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all group">
          <Camera className="w-10 h-10 text-white/20 group-hover:text-primary transition-colors"/>
          <div className="text-center">
            <p className="text-sm font-medium text-white">Scatta o carica una foto</p>
            <p className="text-xs text-muted-foreground mt-1">Gemini AI identifica la specie automaticamente</p>
          </div>
        </button>
      ):(
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={preview} alt="scan" className="w-full h-40 object-cover"/>
            <button onClick={()=>{setPreview(null);setResult(null);}}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
              <X className="w-4 h-4 text-white"/>
            </button>
          </div>
          {loading&&(
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary"/>Analisi in corso…
            </div>
          )}
          {result&&(
            <div className="bg-background rounded-2xl p-4 border border-white/5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          )}
          <button onClick={()=>fileRef.current?.click()}
            className="w-full py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            Scansiona un'altra foto
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   CARD PREVISIONI PESCA (6 tab)
═══════════════════════════════════ */
const TABS=[
  {id:"dati",label:"📊 Dati"},
  {id:"tecnica",label:"🎣 Tecnica"},
  {id:"esche",label:"🪱 Esche"},
  {id:"specie",label:"🐟 Specie"},
  {id:"campo",label:"🌊 Campo"},
  {id:"ai",label:"🤖 AI"},
];

interface FieldState {
  level:string; turbidity:string; current:string; fishVisible:boolean; notes:string;
}

function FishingForecastCard({ stazioneKey }: { stazioneKey: string }) {
  const [dayOffset,setDayOffset]=useState(0);
  const [activeTab,setActiveTab]=useState("dati");
  const [field,setField]=useState<FieldState>({level:"Normale",turbidity:"Normale",current:"Moderata",fishVisible:false,notes:""});
  const [aiReply,setAiReply]=useState<string|null>(null);
  const [aiLoading,setAiLoading]=useState(false);

  const date=useMemo(()=>addDays(new Date(),dayOffset),[dayOffset]);
  const moon=useMemo(()=>moonPhase(date),[date]);
  const tides=useMemo(()=>tidalEvents(date),[date]);
  const {wmoCode,windKn,windDir:wDir,waveH,sst,loaded,atm,mar}=useForecastData(stazioneKey,dayOffset);

  const now=new Date().getHours();
  const isNight=now>=21||now<=5;

  const inp:FishingInputs={wmoCode,windKn,windDir:wDir,waveH,sst,dayOffset,moonPhase:moon.phase,
    fieldLevel:field.level,fieldTurbidity:field.turbidity,fieldCurrent:field.current,fishVisible:field.fishVisible};
  const score=useMemo(()=>computeScore(inp,date),[JSON.stringify(inp),date.toDateString()]);
  const {label,color,bg}=scoreLabel(score);

  // Hourly scores for chart
  const hourlyScores=useMemo(()=>
    Array.from({length:24},(_,h)=>{
      const hInp={...inp,moonPhase:moon.phase};
      return Math.max(0,Math.min(100,computeScore(hInp,date,h)));
    })
  ,[JSON.stringify(inp),date.toDateString()]);

  const peakHour=hourlyScores.indexOf(Math.max(...hourlyScores));

  // Esche
  const esche=useMemo(()=>getEsche(sst,wmoCode,waveH),[sst,wmoCode,waveH]);

  // Specie con prob
  const specieProb=useMemo(()=>SPECIE11.map(s=>({
    ...s,
    p:Math.round(s.prob(score,sst,isNight))
  })).sort((a,b)=>b.p-a.p),[score,sst,isNight]);

  // AI advice
  const fetchAI=async()=>{
    setAiLoading(true);
    const ctx=`Stazione: ${STAZIONI[stazioneKey].nome}. Giorno: ${format(date,"EEEE d MMM",{locale:it})}. Punteggio pesca: ${score}/100 (${label}). Vento: ${windKn}kn dir ${wDir}°. Onde: ${waveH}m. Temp. mare: ${sst}°C. Meteo: ${wmo(wmoCode).label}. Marea: ${tides.map(t=>`${t.tipo} h${t.ora}:00`).join(", ")}. Luna: ${moon.nome} ${moon.illum}%. Canale: ${field.level}, torbidità ${field.turbidity}, corrente ${field.current}${field.fishVisible?", pesci visibili in superficie":""}.`;
    try{
      const r=await fetch("https://api.deepseek.com/v1/chat/completions",{
        method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer sk-84b89b428959461e818ad77775913978"},
        body:JSON.stringify({model:"deepseek-chat",messages:[
          {role:"system",content:"Sei un pescatore esperto di Porto Badino (Canale Fiume Portatore, foce Lazio). Solo pesca da terra. Rispondi in italiano, max 6 righe, molto pratico: orario migliore, esca, posizione, specie target, tecnica."},
          {role:"user",content:`Condizioni: ${ctx}. Dammi il consiglio per questa uscita.`}
        ]})
      });
      const d=await r.json();
      setAiReply(d.choices?.[0]?.message?.content??"Nessuna risposta.");
    }catch{setAiReply("Errore di connessione.");}
    finally{setAiLoading(false);}
  };

  const windDirLabel=(deg:number)=>{
    const dirs=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
    return dirs[Math.round(deg/22.5)%16];
  };
  const favWindDir=Math.abs(wDir-22)<30||Math.abs(wDir-202)<30;

  return(
    <div className="bg-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">

      {/* ── HEADER: score + navigazione giorni ── */}
      <div className="p-5 md:p-6 bg-gradient-to-br from-card to-background border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"/>

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">🎣 Indice Pescabilità</p>
            <p className="text-xs text-muted-foreground">{STAZIONI[stazioneKey].nome}</p>
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
          {/* Circular progress */}
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
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", bg, color)}>{label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm">{wmo(wmoCode).emoji} {wmo(wmoCode).label}</span>
              <span className="text-muted-foreground text-sm">· {moon.emoji} {moon.nome}</span>
            </div>
            <p className="text-xs text-primary/70 mt-2">
              Picco ore {String(peakHour).padStart(2,"0")}:00 ({hourlyScores[peakHour]}/100)
            </p>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-background/30">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            className={cn("px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0",
              activeTab===t.id?"border-primary text-primary bg-primary/5":"border-transparent text-muted-foreground hover:text-white hover:bg-white/5")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="p-5">

        {/* ── 📊 DATI ── */}
        {activeTab==="dati"&&(
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <FactorPill emoji="🌊" label="Marea" pts={Math.round(Math.min(30,Math.abs(tidalH(date,12+1)-tidalH(date,12))*1000))}  max={30} desc={tides.slice(0,2).map(t=>`${t.tipo==="alta"?"▲":"▼"}${t.ora}:00`).join(" ")}/>
              <FactorPill emoji={moon.emoji} label="Luna" pts={moon.illum<5||moon.illum>95?25:moon.illum<30||moon.illum>70?18:10} max={25} desc={`${moon.nome} ${moon.illum}%`}/>
              <FactorPill emoji="🌡️" label="Temp. Mare" pts={sst>=16&&sst<=22?20:sst>22?15:sst>=12?10:5} max={20} desc={`${sst.toFixed(1)}°C SST`}/>
              <FactorPill emoji="🌊" label="Onde" pts={waveH<=0.8?10:waveH<=1.2?6:2} max={10} desc={`${waveH.toFixed(1)}m`}/>
              <FactorPill emoji="💨" label="Vento" pts={windKn<=5?9:windKn<=10?7:windKn<=15?5:2} max={9} desc={`${Math.round(windKn)}kn ${windDirLabel(wDir)}${favWindDir?" ✓":""}`}/>
              <FactorPill emoji="☁️" label="Meteo" pts={wmoCode<=1?6:wmoCode<=2?5:wmoCode<=3?4:wmoCode<=55?4:2} max={6} desc={wmo(wmoCode).label}/>
            </div>

            {/* Grafico orario */}
            <div className="bg-background rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Andamento orario</p>
              <div className="flex items-end gap-0.5 h-20">
                {hourlyScores.map((v,h)=>(
                  <div key={h} className="flex-1 flex flex-col items-center gap-0.5 group">
                    <div className={cn("w-full rounded-sm transition-colors",
                        h===now?"bg-primary":"bg-primary/25 group-hover:bg-primary/50")}
                      style={{height:`${Math.max(8,v)}%`}}/>
                    {h%6===0&&<span className="text-[8px] text-muted-foreground">{h}h</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Vento rispetto alla foce */}
            <div className={cn("rounded-2xl p-3 border text-sm flex items-center gap-3",
              favWindDir?"bg-green-500/10 border-green-500/20 text-green-300":"bg-amber-500/10 border-amber-500/20 text-amber-300")}>
              <Wind className="w-4 h-4 shrink-0"/>
              <span>
                Vento {windDirLabel(wDir)} {Math.round(windKn)}kn —{" "}
                {favWindDir?"favorevole (spalle alla foce) ✓":"non ottimale rispetto alla foce"}
              </span>
            </div>
          </div>
        )}

        {/* ── 🎣 TECNICA ── */}
        {activeTab==="tecnica"&&(
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground mb-3">Tecniche da terra — ordinate per condizioni attuali</p>
            {TECNICHE.filter(t=>t.cond(score,isNight,sst)).map((t,i)=>(
              <div key={i} className={cn("rounded-2xl p-4 border",
                i===0?"bg-primary/10 border-primary/30":"bg-background border-white/5")}>
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
                  <span className="text-lg grayscale">{t.emoji}</span>
                  <p className="text-sm text-muted-foreground">{t.nome}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 🪱 ESCHE ── */}
        {activeTab==="esche"&&(
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground mb-3">Esche consigliate — basate su SST {sst.toFixed(0)}°C, torbidità, stagione</p>
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

        {/* ── 🐟 SPECIE ── */}
        {activeTab==="specie"&&(
          <div className="space-y-2 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground mb-3">Probabilità di cattura — Porto Badino · condizioni attuali</p>
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
                      <div className={cn("h-full rounded-full transition-all",
                        s.p>=70?"bg-green-500":s.p>=45?"bg-amber-500":"bg-white/20")}
                        style={{width:`${s.p}%`}}/>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[80px]">{s.zona}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 🌊 CAMPO ── */}
        {activeTab==="campo"&&(
          <div className="space-y-4 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground">Inserisci le condizioni reali per correggere il punteggio</p>
            <FieldSelect label="Livello canale Portatore" value={field.level} opts={["Basso","Normale","Alto","Piena"]}
              effects={[-15,0,5,-10]} onChange={v=>setField(p=>({...p,level:v}))}/>
            <FieldSelect label="Torbidità acqua" value={field.turbidity} opts={["Chiara","Normale","Torbida","Fangosa"]}
              effects={[-2,8,4,-14]} onChange={v=>setField(p=>({...p,turbidity:v}))}/>
            <FieldSelect label="Corrente foce" value={field.current} opts={["Ferma","Debole","Moderata","Forte"]}
              effects={[-6,2,4,0]} onChange={v=>setField(p=>({...p,current:v}))}/>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-background border border-white/5 cursor-pointer">
              <input type="checkbox" checked={field.fishVisible} onChange={e=>setField(p=>({...p,fishVisible:e.target.checked}))}
                className="w-4 h-4 accent-teal-500"/>
              <div>
                <p className="text-sm text-white font-medium">Pesci visibili in superficie</p>
                <p className="text-xs text-green-400">+12 punti se attivi</p>
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

        {/* ── 🤖 AI ── */}
        {activeTab==="ai"&&(
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-background rounded-2xl p-4 border border-white/5 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-white mb-2">Contesto inviato all'AI:</p>
              <p>📍 {STAZIONI[stazioneKey].nome} · {format(date,"EEEE d MMM",{locale:it})}</p>
              <p>🎯 Score: {score}/100 · 🌊 Onde: {waveH.toFixed(1)}m · 💨 {Math.round(windKn)}kn {windDirLabel(wDir)}</p>
              <p>🌡️ SST: {sst.toFixed(1)}°C · {wmo(wmoCode).emoji} {wmo(wmoCode).label} · {moon.emoji} {moon.nome}</p>
              <p>🌊 Canale: {field.level} · {field.turbidity} · Corrente: {field.current}</p>
            </div>
            {aiReply?(
              <div className="bg-background rounded-2xl p-4 border border-white/5 text-sm text-white leading-relaxed whitespace-pre-wrap">
                {aiReply}
              </div>
            ):(
              <div className="text-center py-6">
                <Bot className="w-10 h-10 text-violet-400 mx-auto mb-3"/>
                <p className="text-sm text-muted-foreground mb-4">L'AI analizzerà tutte le condizioni e darà un consiglio pratico su orario, esca, posizione e specie</p>
              </div>
            )}
            <button onClick={fetchAI} disabled={aiLoading}
              className="w-full py-3 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-300 font-semibold flex items-center justify-center gap-2 hover:bg-violet-600/30 transition-colors disabled:opacity-50">
              {aiLoading?<><Loader2 className="w-4 h-4 animate-spin"/>Analisi in corso…</>
                :<><Bot className="w-4 h-4"/>{aiReply?"Rigenera consiglio":"Chiedi all'oracolo di Porto Badino"}</>}
            </button>
            <p className="text-center text-[10px] text-muted-foreground/50">DeepSeek Chat · risposte cachate per sessione</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Helper components */
function FactorPill({emoji,label,pts,max,desc}:{emoji:string;label:string;pts:number;max:number;desc:string}){
  const pct=Math.round(pts/max*100);
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
        <div className="h-full bg-primary rounded-full" style={{width:`${pct}%`}}/>
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

/* ═══════════════════════════════════
   DASHBOARD PRINCIPALE
═══════════════════════════════════ */
export default function Dashboard() {
  const [stazioneKey,setStazioneKey]=useState(()=>localStorage.getItem("diario_stazione_home")??"porto-badino");
  const [showStazioni,setShowStazioni]=useState(false);

  const { data: uscite=[] } = usciteAPI.useList();
  const { data: catture=[] } = pescatoAPI.useList();
  const { data: spot=[] } = spotAPI.useList();

  const today=format(new Date(),"EEEE d MMMM yyyy",{locale:it});
  const pesoTotale=catture.reduce((s:number,c:any)=>s+(parseFloat(c.peso)||0),0);

  const selectStazione=(k:string)=>{
    setStazioneKey(k);
    localStorage.setItem("diario_stazione_home",k);
    setShowStazioni(false);
  };

  return(
    <div className="space-y-5">

      {/* ── INTESTAZIONE ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-primary text-sm font-semibold capitalize">{today}</p>
          <h1 className="text-3xl font-display font-bold text-white mt-0.5">
            Bentornato, <span className="text-primary">Livio</span> 🎣
          </h1>
        </div>

        {/* Selettore stazione */}
        <div className="relative shrink-0">
          <button onClick={()=>setShowStazioni(v=>!v)}
            className="flex items-center gap-2 bg-card border border-white/10 px-4 py-2.5 rounded-2xl text-sm font-medium hover:border-primary/50 transition-colors">
            <MapPin className="w-4 h-4 text-primary shrink-0"/>
            <span className="max-w-[140px] truncate">{STAZIONI[stazioneKey].nome}</span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform",showStazioni&&"rotate-180")}/>
          </button>
          {showStazioni&&(
            <div className="absolute right-0 top-12 w-56 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {Object.entries(STAZIONI).map(([k,s])=>(
                <button key={k} onClick={()=>selectStazione(k)}
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

      {/* ── STATISTICHE RAPIDE ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Anchor} label="Uscite" value={uscite.length} color="text-blue-400"/>
        <MiniStat icon={Fish}   label="Catture" value={catture.length} color="text-primary"/>
        <MiniStat icon={Scale}  label="Kg Totali" value={`${pesoTotale.toFixed(1)}`} color="text-teal-400"/>
        <MiniStat icon={MapPin} label="Spot" value={spot.length} color="text-indigo-400"/>
      </div>

      {/* ── CARD PREVISIONI PESCA INTERATTIVA ── */}
      <FishingForecastCard stazioneKey={stazioneKey}/>

      {/* ── SCANNER SPECIE AI ── */}
      <SpeciesScanner/>

      {/* ── ULTIME USCITE + CATTURE ── */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Anchor className="w-5 h-5 text-blue-400"/>Ultime Uscite
            </h3>
            <Link href="/uscite" className="text-primary text-xs flex items-center gap-1 hover:text-white transition-colors">
              Vedi tutte<ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
          <div className="space-y-2">
            {uscite.length===0?(
              <div className="text-center py-6">
                <Anchor className="w-10 h-10 text-white/10 mx-auto mb-2"/>
                <p className="text-sm text-muted-foreground">Nessuna uscita registrata</p>
              </div>
            ):uscite.slice(0,4).map((u:any)=>(
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-background border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">
                    {u.data?format(new Date(u.data),"dd/MM"):"--"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{u.luogo||"Senza luogo"}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.tecnica||"—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Fish className="w-5 h-5 text-primary"/>Ultime Catture
            </h3>
            <Link href="/pescato" className="text-primary text-xs flex items-center gap-1 hover:text-white transition-colors">
              Vedi tutte<ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
          <div className="space-y-2">
            {catture.length===0?(
              <div className="text-center py-6">
                <Fish className="w-10 h-10 text-white/10 mx-auto mb-2"/>
                <p className="text-sm text-muted-foreground">Nessuna cattura registrata</p>
              </div>
            ):catture.slice(0,4).map((c:any)=>(
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Fish className="w-4 h-4 text-primary"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{c.specie||"Specie sconosciuta"}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.peso?`${c.peso} kg`:""}{c.lunghezza?` · ${c.lunghezza} cm`:""}
                  </p>
                </div>
                {c.catchAndRelease&&<span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 shrink-0">C&R</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

function MiniStat({icon:Icon,label,value,color}:{icon:any;label:string;value:string|number;color:string}){
  return(
    <div className="bg-card rounded-2xl p-4 border border-white/5">
      <Icon className={cn("w-5 h-5 mb-2",color)}/>
      <p className="text-2xl font-display font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
