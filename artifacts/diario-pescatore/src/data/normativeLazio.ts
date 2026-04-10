export interface Ordinanza {
  id: string;
  comune: string;
  provincia: "RM" | "LT" | "VT" | "FR";
  lat: number;
  lon: number;
  periodi: { dal: string; al: string }[];
  orario: { dalle: string; alle: string };
  zonaVietata: string;
  tipoVieto: "spiagge_libere" | "tutta_costa" | "zona_bagni";
  note?: string;
  link?: string;
  anno: number;
}

export const ORDINANZE_LAZIO: Ordinanza[] = [
  // ── PROVINCIA DI ROMA ──────────────────────────────────────────
  {
    id: "fiumicino",
    comune: "Fiumicino",
    provincia: "RM",
    lat: 41.768, lon: 12.233,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "08:30", alle: "19:30" },
    zonaVietata: "Spiagge libere (Focene, Fregene, Coccia di Morto)",
    tipoVieto: "spiagge_libere",
    note: "Consentita la pesca dai moli e dalle scogliere rocciose.",
    anno: 2024,
  },
  {
    id: "roma-ostia",
    comune: "Roma — Ostia/X Municipio",
    provincia: "RM",
    lat: 41.730, lon: 12.339,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "08:30", alle: "19:30" },
    zonaVietata: "Spiagge libere del litorale romano",
    tipoVieto: "spiagge_libere",
    note: "Permessa la pesca dal molo di Ostia e dalle banchine portuali.",
    anno: 2024,
  },
  {
    id: "pomezia",
    comune: "Pomezia — Torvaianica",
    provincia: "RM",
    lat: 41.660, lon: 12.420,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "08:30", alle: "19:30" },
    zonaVietata: "Spiagge libere di Torvaianica",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
  {
    id: "ardea",
    comune: "Ardea — Marina di Ardea",
    provincia: "RM",
    lat: 41.614, lon: 12.543,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "08:30", alle: "19:30" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
  {
    id: "santa-marinella",
    comune: "Santa Marinella",
    provincia: "RM",
    lat: 42.034, lon: 11.856,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    note: "Consentita la pesca dalla scogliera e dal porto.",
    anno: 2024,
  },
  {
    id: "ladispoli",
    comune: "Ladispoli",
    provincia: "RM",
    lat: 41.951, lon: 12.075,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
  {
    id: "civitavecchia",
    comune: "Civitavecchia",
    provincia: "RM",
    lat: 42.093, lon: 11.793,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    note: "Porto e moli sempre accessibili.",
    anno: 2024,
  },

  // ── PROVINCIA DI LATINA ────────────────────────────────────────
  {
    id: "anzio",
    comune: "Anzio",
    provincia: "LT",
    lat: 41.448, lon: 12.628,
    periodi: [{ dal: "05-15", al: "09-30" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere e zone di balneazione",
    tipoVieto: "zona_bagni",
    note: "Una delle ordinanze più restrittive. Verificare il sito del comune ogni anno.",
    link: "https://www.comune.anzio.roma.it",
    anno: 2024,
  },
  {
    id: "nettuno",
    comune: "Nettuno",
    provincia: "LT",
    lat: 41.459, lon: 12.664,
    periodi: [{ dal: "05-15", al: "09-30" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
  {
    id: "latina-lido",
    comune: "Latina — Lido di Latina",
    provincia: "LT",
    lat: 41.400, lon: 12.900,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
  {
    id: "sabaudia",
    comune: "Sabaudia",
    provincia: "LT",
    lat: 41.298, lon: 13.020,
    periodi: [{ dal: "06-01", al: "09-30" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere del Parco Nazionale del Circeo",
    tipoVieto: "spiagge_libere",
    note: "Zona Parco Nazionale — verificare anche le norme del parco per la pesca.",
    link: "https://www.parcocirceo.it",
    anno: 2024,
  },
  {
    id: "san-felice-circeo",
    comune: "San Felice Circeo",
    provincia: "LT",
    lat: 41.234, lon: 13.088,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    note: "Zona Parco Nazionale del Circeo.",
    anno: 2024,
  },
  {
    id: "terracina",
    comune: "Terracina",
    provincia: "LT",
    lat: 41.295, lon: 13.250,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    note: "Porto di Terracina e scogliere esclusi dal divieto.",
    link: "https://www.comune.terracina.lt.it",
    anno: 2024,
  },
  {
    id: "fondi-sperlonga",
    comune: "Sperlonga",
    provincia: "LT",
    lat: 41.256, lon: 13.430,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
  {
    id: "gaeta",
    comune: "Gaeta",
    provincia: "LT",
    lat: 41.213, lon: 13.572,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    note: "Porto e lungomare consentiti.",
    anno: 2024,
  },
  {
    id: "formia",
    comune: "Formia",
    provincia: "LT",
    lat: 41.256, lon: 13.608,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
  {
    id: "minturno",
    comune: "Minturno — Scauri",
    provincia: "LT",
    lat: 41.254, lon: 13.746,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },

  // ── PROVINCIA DI VITERBO ────────────────────────────────────────
  {
    id: "tarquinia-lido",
    comune: "Tarquinia Lido",
    provincia: "VT",
    lat: 42.207, lon: 11.701,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
  {
    id: "montalto-marina",
    comune: "Montalto di Castro — Marina",
    provincia: "VT",
    lat: 42.346, lon: 11.598,
    periodi: [{ dal: "06-01", al: "09-15" }],
    orario: { dalle: "09:00", alle: "19:00" },
    zonaVietata: "Spiagge libere",
    tipoVieto: "spiagge_libere",
    anno: 2024,
  },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getOrdinanzeVicine(lat: number, lon: number, maxKm = 30): (Ordinanza & { distanzaKm: number })[] {
  return ORDINANZE_LAZIO
    .map(o => ({ ...o, distanzaKm: Math.round(haversineKm(lat, lon, o.lat, o.lon)) }))
    .filter(o => o.distanzaKm <= maxKm)
    .sort((a, b) => a.distanzaKm - b.distanzaKm);
}

function parseDayMonth(str: string): { month: number; day: number } {
  const [m, d] = str.split("-").map(Number);
  return { month: m, day: d };
}

function inPeriodo(now: Date, dal: string, al: string): boolean {
  const { month: m1, day: d1 } = parseDayMonth(dal);
  const { month: m2, day: d2 } = parseDayMonth(al);
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const val = m * 100 + d;
  return val >= m1 * 100 + d1 && val <= m2 * 100 + d2;
}

function inOrario(now: Date, dalle: string, alle: string): boolean {
  const [h1, min1] = dalle.split(":").map(Number);
  const [h2, min2] = alle.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= h1 * 60 + min1 && nowMin <= h2 * 60 + min2;
}

export type StatoOrdinanza = "vietato" | "libero" | "fuori_stagione" | "fuori_orario";

export function checkStatoOrdinanza(ord: Ordinanza, now: Date = new Date()): StatoOrdinanza {
  const inPeriod = ord.periodi.some(p => inPeriodo(now, p.dal, p.al));
  if (!inPeriod) return "fuori_stagione";
  if (inOrario(now, ord.orario.dalle, ord.orario.alle)) return "vietato";
  return "fuori_orario";
}

export function checkPescaConsentita(ord: Ordinanza, now: Date = new Date()): boolean {
  return checkStatoOrdinanza(ord, now) !== "vietato";
}
