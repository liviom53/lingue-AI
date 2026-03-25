import { useState, useEffect, useRef } from "react";
import { spotAPI } from "@/hooks/use-local-data";
import { Plus, Trash2, Edit2, MapPin, Star, Layers, Navigation, Map, List, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon in Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// Custom teal marker for spots
const SPOT_ICON = L.divIcon({
  html: `<div style="width:28px;height:28px;background:hsl(175,65%,42%);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -32],
  className: "",
});
const CLICK_ICON = L.divIcon({
  html: `<div style="width:22px;height:22px;background:hsl(40,95%,60%);border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -15],
  className: "",
});

const FONDALI = ["Sabbioso","Fangoso","Roccioso","Misto sabbia/roccia","Prateria posidonia","Algoso"];
const EMPTY = { nome:"", fondale:"", profondita:"", rating:3, lat:"", lng:"", note:"" };

// Porto Badino default center
const DEFAULT_LAT = 41.28, DEFAULT_LNG = 13.16;

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-5 h-5 cursor-pointer transition-colors ${i<=value?"fill-amber-400 text-amber-400":"text-white/20"}`}
          onClick={() => onChange && onChange(i)}/>
      ))}
    </div>
  );
}

/* ═══════════════ MAPPA ═══════════════ */
function SpotMap({
  spots, onMapClick, selectedLat, selectedLng, onSpotClick
}: {
  spots: any[];
  onMapClick: (lat: number, lng: number) => void;
  selectedLat: string; selectedLng: string;
  onSpotClick: (spot: any) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [DEFAULT_LAT, DEFAULT_LNG],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Update spot markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    spots.filter(s => s.lat && s.lng).forEach(s => {
      const lat = parseFloat(s.lat), lng = parseFloat(s.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      const m = L.marker([lat, lng], { icon: SPOT_ICON })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:system-ui;min-width:160px">
            <b style="color:#2dd4bf;font-size:14px">${s.nome}</b><br>
            ${s.fondale ? `<span style="color:#888;font-size:12px">📍 ${s.fondale}</span><br>` : ""}
            ${s.profondita ? `<span style="color:#888;font-size:12px">~${s.profondita}m di profondità</span><br>` : ""}
            ${s.note ? `<span style="color:#999;font-size:11px;font-style:italic">"${s.note}"</span>` : ""}
          </div>
        `, { maxWidth: 200 });
      m.on("click", () => onSpotClick(s));
      markersRef.current.push(m);
    });

    // Fit bounds if there are spots with coords
    const validSpots = spots.filter(s => s.lat && s.lng && !isNaN(parseFloat(s.lat)));
    if (validSpots.length > 0) {
      const bounds = L.latLngBounds(validSpots.map(s => [parseFloat(s.lat), parseFloat(s.lng)]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [spots]);

  // Update click marker (yellow)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (clickMarkerRef.current) { clickMarkerRef.current.remove(); clickMarkerRef.current = null; }
    if (selectedLat && selectedLng) {
      const lat = parseFloat(selectedLat), lng = parseFloat(selectedLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        clickMarkerRef.current = L.marker([lat, lng], { icon: CLICK_ICON })
          .addTo(map)
          .bindPopup("📌 Posizione selezionata")
          .openPopup();
        map.setView([lat, lng], Math.max(map.getZoom(), 14));
      }
    }
  }, [selectedLat, selectedLng]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl">
      <div ref={mapRef} className="w-full h-[420px] z-0"/>
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-white/80 pointer-events-none">
        🗺️ Clicca sulla mappa per impostare le coordinate di uno spot
      </div>
    </div>
  );
}

/* ═══════════════ PAGINA SPOT ═══════════════ */
export default function Spot() {
  const { data: spot=[], isLoading } = spotAPI.useList();
  const addMutation = spotAPI.useAdd();
  const updateMutation = spotAPI.useUpdate();
  const deleteMutation = spotAPI.useDelete();
  const { toast } = useToast();

  const [view, setView] = useState<"lista"|"mappa">("lista");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const resetForm = () => { setFormData(EMPTY); setEditingId(null); setIsFormOpen(false); };

  const openEditForm = (s: any) => {
    setFormData({
      nome: s.nome||"", fondale: s.fondale||"", profondita: s.profondita||"",
      rating: s.rating||3, lat: s.lat||"", lng: s.lng||"", note: s.note||""
    });
    setEditingId(s.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData }, {
        onSuccess: () => { toast({ title: "Spot aggiornato ✓" }); resetForm(); }
      });
    } else {
      addMutation.mutate(formData, {
        onSuccess: () => { toast({ title: "Spot salvato! 📍" }); resetForm(); }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Eliminare questo spot?")) {
      deleteMutation.mutate(id);
      toast({ title: "Spot eliminato" });
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { toast({ title: "GPS non disponibile" }); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      setFormData(p => ({
        ...p,
        lat: pos.coords.latitude.toFixed(6),
        lng: pos.coords.longitude.toFixed(6)
      }));
      toast({ title: "Posizione GPS acquisita 📍" });
    }, () => toast({ title: "Impossibile ottenere la posizione" }));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(p => ({ ...p, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
    if (!isFormOpen) setIsFormOpen(true);
  };

  const handleSpotClick = (s: any) => {
    setHighlightId(s.id);
    setView("lista");
    setTimeout(() => {
      document.getElementById(`spot-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-primary">Caricamento...</div>;

  const spotsWithCoords = (spot as any[]).filter(s => s.lat && s.lng);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Spot</h1>
          <p className="text-muted-foreground">
            {spot.length} luoghi · {spotsWithCoords.length} con coordinate
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle vista */}
          <div className="flex bg-card border border-white/10 rounded-xl p-1 gap-1">
            <button onClick={() => setView("lista")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                view==="lista"?"bg-primary/20 text-primary":"text-muted-foreground hover:text-white")}>
              <List className="w-3.5 h-3.5"/>Lista
            </button>
            <button onClick={() => setView("mappa")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                view==="mappa"?"bg-primary/20 text-primary":"text-muted-foreground hover:text-white")}>
              <Map className="w-3.5 h-3.5"/>Mappa
            </button>
          </div>
          <button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(EMPTY); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5"/>
            <span className="hidden sm:inline">Nuovo Spot</span>
          </button>
        </div>
      </div>

      {/* MAPPA */}
      {view==="mappa"&&(
        <div className="space-y-3 animate-in fade-in duration-200">
          {spotsWithCoords.length===0&&(
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0"/>
              Aggiungi coordinate (lat/lng) agli spot per vederli sulla mappa. Clicca sulla mappa per selezionare una posizione.
            </div>
          )}
          <SpotMap
            spots={spot as any[]}
            onMapClick={handleMapClick}
            selectedLat={formData.lat}
            selectedLng={formData.lng}
            onSpotClick={handleSpotClick}
          />
        </div>
      )}

      {/* FORM */}
      {isFormOpen && (
        <div className="bg-card rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{editingId ? "Modifica Spot" : "Nuovo Spot"}</h2>
            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <X className="w-5 h-5 text-muted-foreground"/>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Nome Spot *</label>
                <input required type="text" placeholder="Es. Foce Portatore, Secca del Faro..."
                  value={formData.nome} onChange={e => setFormData({...formData,nome:e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Tipo di fondale</label>
                <select value={formData.fondale} onChange={e => setFormData({...formData,fondale:e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none">
                  <option value="">Seleziona...</option>
                  {FONDALI.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Profondità (m)</label>
                <input type="number" min="0" step="0.5" placeholder="Es. 15"
                  value={formData.profondita} onChange={e => setFormData({...formData,profondita:e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"/>
              </div>

              {/* Coordinate */}
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Latitudine</label>
                <input type="number" step="0.000001" placeholder="Es. 41.280000"
                  value={formData.lat} onChange={e => setFormData({...formData,lat:e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none font-mono text-sm"/>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Longitudine</label>
                <div className="flex gap-2">
                  <input type="number" step="0.000001" placeholder="Es. 13.160000"
                    value={formData.lng} onChange={e => setFormData({...formData,lng:e.target.value})}
                    className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none font-mono text-sm"/>
                  <button type="button" onClick={handleGPS} title="Usa GPS"
                    className="p-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors shrink-0">
                    <Navigation className="w-5 h-5 text-primary"/>
                  </button>
                </div>
              </div>

              {view==="mappa"&&formData.lat&&formData.lng&&(
                <div className="md:col-span-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 text-xs text-primary flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0"/>
                  Coordinate selezionate dalla mappa: {parseFloat(formData.lat).toFixed(5)}, {parseFloat(formData.lng).toFixed(5)}
                </div>
              )}

              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Valutazione</label>
                <StarRating value={formData.rating} onChange={v => setFormData({...formData,rating:v})}/>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Note</label>
              <textarea placeholder="Accesso, specie frequenti, note personali..."
                value={formData.note} onChange={e => setFormData({...formData,note:e.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-20 resize-none"/>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors">Annulla</button>
              <button type="submit" disabled={addMutation.isPending||updateMutation.isPending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                {(addMutation.isPending||updateMutation.isPending)?"Salvataggio...":editingId?"Aggiorna":"Salva Spot"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA */}
      {view==="lista"&&(
        <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-200">
          {(spot as any[]).length===0&&!isFormOpen&&(
            <div className="md:col-span-2 bg-card border border-white/5 border-dashed rounded-3xl p-12 text-center">
              <MapPin className="w-16 h-16 text-white/10 mx-auto mb-4"/>
              <h3 className="text-xl font-bold mb-2">Nessuno spot salvato</h3>
              <p className="text-muted-foreground">Aggiungi i tuoi luoghi di pesca preferiti.</p>
            </div>
          )}
          {(spot as any[]).map((s: any) => (
            <div key={s.id} id={`spot-${s.id}`}
              className={cn("bg-card rounded-2xl p-5 border shadow-lg hover:border-primary/30 transition-all",
                highlightId===s.id?"border-primary/60 shadow-primary/20":"border-white/5")}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                    <MapPin className="w-5 h-5 text-primary"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{s.nome}</h3>
                    <StarRating value={s.rating||0}/>
                  </div>
                </div>
                <div className="flex gap-2">
                  {s.lat&&s.lng&&(
                    <button title="Vedi su mappa" onClick={()=>{setView("mappa");setHighlightId(s.id);}}
                      className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors">
                      <Map className="w-4 h-4"/>
                    </button>
                  )}
                  <button onClick={()=>openEditForm(s)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <Edit2 className="w-4 h-4"/>
                  </button>
                  <button onClick={()=>handleDelete(s.id)} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                {s.fondale&&(
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-background rounded-lg border border-white/5">
                    <Layers className="w-3.5 h-3.5"/> {s.fondale}
                  </span>
                )}
                {s.profondita&&(
                  <span className="px-2.5 py-1 bg-background rounded-lg border border-white/5">~{s.profondita}m</span>
                )}
                {s.lat&&s.lng&&(
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-background rounded-lg border border-white/5 font-mono text-xs">
                    <Navigation className="w-3 h-3"/> {parseFloat(s.lat).toFixed(4)}, {parseFloat(s.lng).toFixed(4)}
                  </span>
                )}
              </div>
              {s.note&&<p className="text-sm italic text-white/50">"{s.note}"</p>}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
