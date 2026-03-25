// Shared location state across Meteo, Maree, Previsioni and Home
const KEY = "diario_stazione_shared";

export const STAZIONI: Record<string, { nome: string; lat: number; lng: number }> = {
  "civitavecchia": { nome: "Civitavecchia",      lat: 42.10, lng: 11.80 },
  "fiumicino":     { nome: "Fiumicino",           lat: 41.77, lng: 12.24 },
  "anzio":         { nome: "Anzio",               lat: 41.45, lng: 12.63 },
  "nettuno":       { nome: "Nettuno",             lat: 41.45, lng: 12.66 },
  "borgo-grappa":  { nome: "Borgo Grappa",        lat: 41.49, lng: 12.90 },
  "sabaudia":      { nome: "Sabaudia",            lat: 41.30, lng: 13.03 },
  "circeo":        { nome: "San Felice Circeo",   lat: 41.24, lng: 13.10 },
  "foce-sisto":    { nome: "Foce Sisto",          lat: 41.30, lng: 13.07 },
  "terracina":     { nome: "Terracina",           lat: 41.29, lng: 13.25 },
  "porto-badino":  { nome: "Porto Badino",        lat: 41.28, lng: 13.16 },
  "sperlonga":     { nome: "Sperlonga",           lat: 41.26, lng: 13.44 },
  "gaeta":         { nome: "Gaeta",               lat: 41.21, lng: 13.57 },
  "formia":        { nome: "Formia",              lat: 41.26, lng: 13.62 },
};

export function getSharedStation(): string {
  return localStorage.getItem(KEY) ?? "porto-badino";
}

export function setSharedStation(key: string): void {
  localStorage.setItem(KEY, key);
}
