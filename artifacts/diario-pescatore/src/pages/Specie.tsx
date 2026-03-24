import { useState } from "react";
import { specieDB } from "@/data/specieDB";
import { Search, AlertTriangle } from "lucide-react";

export default function Specie() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = specieDB.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.scientifico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Enciclopedia Specie</h1>
          <p className="text-muted-foreground">Database ittico del Mar Tirreno</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Cerca specie..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(specie => (
          <div key={specie.id} className="bg-card rounded-3xl overflow-hidden border border-white/5 shadow-lg group">
            <div className="h-48 relative overflow-hidden">
              <img 
                src={specie.image_url} 
                alt={specie.nome} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              {specie.protetta && (
                <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md text-black text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                  <AlertTriangle className="w-3 h-3" /> PROTETTA
                </div>
              )}
            </div>
            
            <div className="p-5 relative -mt-4">
              <h3 className="font-display text-xl font-bold text-white mb-0.5">{specie.nome}</h3>
              <p className="text-primary text-xs italic mb-3 font-serif">{specie.scientifico}</p>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {specie.descrizione}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-background rounded-lg p-2 border border-white/5">
                  <span className="block text-muted-foreground mb-1 uppercase tracking-wider text-[9px]">Taglia (cm)</span>
                  <span className="font-bold text-white">{specie.min_taglia} - {specie.max_taglia}</span>
                </div>
                <div className="bg-background rounded-lg p-2 border border-white/5">
                  <span className="block text-muted-foreground mb-1 uppercase tracking-wider text-[9px]">Stagione</span>
                  <span className="font-bold text-white truncate block">{specie.stagione_migliore}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
