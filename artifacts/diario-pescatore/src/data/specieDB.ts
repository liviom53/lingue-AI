export interface Specie {
  id: string;
  nome: string;
  scientifico: string;
  descrizione: string;
  min_taglia: number;
  max_taglia: number;
  stagione_migliore: string;
  protetta: boolean;
  image_url: string;
}

export const specieDB: Specie[] = [
  {
    id: "spigola",
    nome: "Spigola / Branzino",
    scientifico: "Dicentrarchus labrax",
    descrizione: "Predatore costiero molto amato dai pescatori. Si pesca principalmente a spinning o surfcasting in prossimità di foci e scogliere.",
    min_taglia: 25,
    max_taglia: 100,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1596726265738-f9b2d35508a6?w=400&h=300&fit=crop"
  },
  {
    id: "orata",
    nome: "Orata",
    scientifico: "Sparus aurata",
    descrizione: "Pesce grufolatore dalle carni pregiatissime. Riconoscibile dalla fascia dorata tra gli occhi.",
    min_taglia: 20,
    max_taglia: 70,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
  },
  {
    id: "serra",
    nome: "Pesce Serra",
    scientifico: "Pomatomus saltatrix",
    descrizione: "Predatore vorace e potente, spesso recide i terminali con i suoi denti affilati. Caccia in branchi.",
    min_taglia: 30,
    max_taglia: 120,
    stagione_migliore: "Estate/Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=400&h=300&fit=crop"
  },
  {
    id: "cernia-bruna",
    nome: "Cernia bruna",
    scientifico: "Epinephelus marginatus",
    descrizione: "Pesce stanziale di fondale roccioso. Molto longevo e a lenta crescita.",
    min_taglia: 45,
    max_taglia: 150,
    stagione_migliore: "Estate",
    protetta: true,
    image_url: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop"
  },
  {
    id: "granchio-blu",
    nome: "Granchio blu",
    scientifico: "Callinectes sapidus",
    descrizione: "Specie aliena invasiva estremamente aggressiva. Molto presente nei canali e nelle foci (es. Portatore).",
    min_taglia: 10,
    max_taglia: 25,
    stagione_migliore: "Estate/Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1563245415-ef6aa8360d84?w=400&h=300&fit=crop"
  },
  {
    id: "mormora",
    nome: "Mormora",
    scientifico: "Lithognathus mormyrus",
    descrizione: "Pesce di fondale sabbioso, tipico preda del surfcasting e beach ledgering estivo.",
    min_taglia: 20,
    max_taglia: 45,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=400&h=300&fit=crop"
  }
];
