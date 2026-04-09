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

const WP = (file: string) =>
  `https://en.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=400`;

export const specieDB: Specie[] = [
  {
    id: "spigola",
    nome: "Spigola / Branzino",
    scientifico: "Dicentrarchus labrax",
    descrizione: "Predatore costiero molto amato. Si pesca a spinning o surfcasting presso foci e scogliere. Bocca grande, corpo argenteo.",
    min_taglia: 25, max_taglia: 100,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Dicentrarchus labrax.jpg")
  },
  {
    id: "orata",
    nome: "Orata",
    scientifico: "Sparus aurata",
    descrizione: "Grufolatore dalle carni pregiatissime. Riconoscibile dalla fascia dorata tra gli occhi. Predilige fondali sabbiosi.",
    min_taglia: 20, max_taglia: 70,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Sparus aurata.jpg")
  },
  {
    id: "serra",
    nome: "Pesce Serra",
    scientifico: "Pomatomus saltatrix",
    descrizione: "Predatore vorace, recide i terminali con i denti affilati. Caccia in branchi frenetici. Ottimo a spinning.",
    min_taglia: 30, max_taglia: 120,
    stagione_migliore: "Estate/Autunno", protetta: false,
    image_url: WP("Pomatomus saltatrix.jpg")
  },
  {
    id: "cernia-bruna",
    nome: "Cernia bruna",
    scientifico: "Epinephelus marginatus",
    descrizione: "Pesce stanziale di fondale roccioso, molto longevo e a lenta crescita. Specie protetta.",
    min_taglia: 45, max_taglia: 150,
    stagione_migliore: "Estate", protetta: true,
    image_url: WP("Epinephelus marginatus.jpg")
  },
  {
    id: "granchio-blu",
    nome: "Granchio blu",
    scientifico: "Callinectes sapidus",
    descrizione: "Specie aliena invasiva, estremamente aggressiva. Abbondante nei canali e foci come il Portatore.",
    min_taglia: 10, max_taglia: 25,
    stagione_migliore: "Estate/Autunno", protetta: false,
    image_url: WP("Callinectes sapidus.jpg")
  },
  {
    id: "mormora",
    nome: "Mormora",
    scientifico: "Lithognathus mormyrus",
    descrizione: "Pesce di fondale sabbioso, tipica preda del surfcasting estivo. Corpo argenteo con bande verticali scure.",
    min_taglia: 20, max_taglia: 45,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Lithognathus mormyrus.jpg")
  },
  {
    id: "sarago-pizzuto",
    nome: "Sarago pizzuto",
    scientifico: "Diplodus puntazzo",
    descrizione: "Labbra carnose e muso appuntito. Erbivoro-onnivoro, si pesca a fondo con mazzancolla o coreano. Combattivo.",
    min_taglia: 18, max_taglia: 60,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Diplodus puntazzo.jpg")
  },
  {
    id: "sarago-fasciato",
    nome: "Sarago fasciato",
    scientifico: "Diplodus vulgaris",
    descrizione: "Bande nere caratteristiche. Vive in branchi su praterie e fondali misti. Si pesca con cannolicchio o arenicola.",
    min_taglia: 18, max_taglia: 45,
    stagione_migliore: "Tutto l'anno", protetta: false,
    image_url: WP("Diplodus vulgaris.jpg")
  },
  {
    id: "sarago-maggiore",
    nome: "Sarago maggiore",
    scientifico: "Diplodus sargus",
    descrizione: "Il sarago più comune e combattivo. Bande verticali scure su fondo argenteo. Si pesca con cannolicchio e mitilo.",
    min_taglia: 18, max_taglia: 55,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Diplodus sargus.jpg")
  },
  {
    id: "sarago-testa-nera",
    nome: "Sarago testa nera",
    scientifico: "Diplodus cervinus",
    descrizione: "Il più grande dei saraghi, con grosse bande verticali. Vive su fondali rocciosi profondi. Molto ricercato.",
    min_taglia: 25, max_taglia: 55,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Diplodus cervinus.jpg")
  },
  {
    id: "sparaglione",
    nome: "Sparaglione",
    scientifico: "Diplodus annularis",
    descrizione: "Il più piccolo dei saraghi, con anello nero alla radice della coda. Comunissimo nei canali e nelle foci.",
    min_taglia: 12, max_taglia: 25,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Diplodus annularis.jpg")
  },
  {
    id: "cefalo",
    nome: "Cefalo / Muggine",
    scientifico: "Mugil cephalus",
    descrizione: "Abbondantissimo nei canali. Erbivoro selettivo, difficile da ingannare. Si pesca a bolognese con pane e polenta.",
    min_taglia: 20, max_taglia: 80,
    stagione_migliore: "Tutto l'anno", protetta: false,
    image_url: WP("Mugil cephalus.jpg")
  },
  {
    id: "leccia-stella",
    nome: "Leccia stella",
    scientifico: "Trachinotus ovatus",
    descrizione: "Pesce piatto e velocissimo, si avvicina a riva d'estate. Combattivo e ottimo commestibile. Si pesca a spinning leggero.",
    min_taglia: 15, max_taglia: 50,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Trachinotus ovatus.jpg")
  },
  {
    id: "ombrina",
    nome: "Ombrina bocca d'oro",
    scientifico: "Umbrina cirrosa",
    descrizione: "Piccolo barbiglio sotto la mandibola. Pesce di fondale sabbioso, si pesca al surfcasting con saraghina.",
    min_taglia: 30, max_taglia: 100,
    stagione_migliore: "Estate/Autunno", protetta: false,
    image_url: WP("Umbrina cirrosa.jpg")
  },
  {
    id: "sogliola",
    nome: "Sogliola comune",
    scientifico: "Solea solea",
    descrizione: "Pesce piatto di fondale sabbioso, notturno. Si pesca di notte con arenicola o coreano sul fondo.",
    min_taglia: 20, max_taglia: 60,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Solea solea.jpg")
  },
  {
    id: "anguilla",
    nome: "Anguilla europea",
    scientifico: "Anguilla anguilla",
    descrizione: "Pesce migratore catadromico, vive nel fango dei fondali. Si pesca di notte con trancio di cefalo o lombrichi.",
    min_taglia: 30, max_taglia: 130,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Anguilla anguilla.jpg")
  },
  {
    id: "palamita",
    nome: "Palamita",
    scientifico: "Sarda sarda",
    descrizione: "Tonnetto costiero velocissimo, si pesca a traina o spinning con cucchiaino. Carni rosse e gustose.",
    min_taglia: 25, max_taglia: 80,
    stagione_migliore: "Estate/Autunno", protetta: false,
    image_url: WP("Sarda sarda.jpg")
  },
  {
    id: "sgombro",
    nome: "Sgombro",
    scientifico: "Scomber scombrus",
    descrizione: "Pesce azzurro abbondante e voracissimo. Si pesca a sabiki o con piccoli cucchiaini. Carni grasse e nutrienti.",
    min_taglia: 18, max_taglia: 50,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Scomber scombrus.jpg")
  },
  {
    id: "lanzardo",
    nome: "Lanzardo",
    scientifico: "Scomber colias",
    descrizione: "Simile allo sgombro ma con macchie sui fianchi. Molto abbondante in autunno, si pesca a sabiki o colpetti.",
    min_taglia: 18, max_taglia: 45,
    stagione_migliore: "Autunno", protetta: false,
    image_url: WP("Scomber colias.jpg")
  },
  {
    id: "ricciola",
    nome: "Ricciola",
    scientifico: "Seriola dumerili",
    descrizione: "Grande pelagico molto combattivo. Fascia gialla longitudinale sul fianco. Si pesca a spinning con artificiali o vivo.",
    min_taglia: 40, max_taglia: 190,
    stagione_migliore: "Estate/Autunno", protetta: false,
    image_url: WP("Seriola dumerili.jpg")
  },
  {
    id: "aguglia",
    nome: "Aguglia",
    scientifico: "Belone belone",
    descrizione: "Corpo allungatissimo con muso a becco. Vive in superficie, si pesca a galleggiante con pesciolino vivo.",
    min_taglia: 30, max_taglia: 90,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Belone belone.jpg")
  },
  {
    id: "gallinella",
    nome: "Gallinella / Capone",
    scientifico: "Chelidonichthys lucerna",
    descrizione: "Grandi pinne pettorali colorate di blu. Si muove sul fondale 'camminando'. Carni ottime.",
    min_taglia: 20, max_taglia: 60,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Chelidonichthys lucerna.jpg")
  },
  {
    id: "cappone",
    nome: "Cappone / Coccio",
    scientifico: "Chelidonichthys cuculus",
    descrizione: "Pinne pettorali con raggi liberi che usa per 'camminare'. Colore arancio-rosso. Ottimo per brodetti.",
    min_taglia: 18, max_taglia: 50,
    stagione_migliore: "Autunno", protetta: false,
    image_url: WP("Chelidonichthys cuculus.jpg")
  },
  {
    id: "triglia-fango",
    nome: "Triglia di fango",
    scientifico: "Mullus barbatus",
    descrizione: "Pesce di fondo fangoso, riconoscibile dai due barbigli sotto la mascella. Carni squisite.",
    min_taglia: 11, max_taglia: 30,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Mullus barbatus.jpg")
  },
  {
    id: "triglia-scoglio",
    nome: "Triglia di scoglio",
    scientifico: "Mullus surmuletus",
    descrizione: "Bande longitudinali gialle. Vive su fondali rocciosi. Colorazione vivace, carni eccellenti.",
    min_taglia: 11, max_taglia: 40,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Mullus surmuletus.jpg")
  },
  {
    id: "scorfano",
    nome: "Scorfano rosso",
    scientifico: "Scorpaena scrofa",
    descrizione: "Pesce mimetico su fondali rocciosi. Spine velenose — maneggiare con cura! Carni bianche eccellenti per zuppe.",
    min_taglia: 25, max_taglia: 50,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Scorpaena scrofa.jpg")
  },
  {
    id: "dentice",
    nome: "Dentice",
    scientifico: "Dentex dentex",
    descrizione: "Re dei fondali rocciosi, combattivo e prelibato. Denti canini evidenti. Si pesca a fondo con vivi o a spinning.",
    min_taglia: 30, max_taglia: 100,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Dentex dentex.jpg")
  },
  {
    id: "pagro",
    nome: "Pagro comune",
    scientifico: "Pagrus pagrus",
    descrizione: "Simile al dentice ma con pinne rosse. Vive su fondali rocciosi. Carni eccellenti, molto ricercato.",
    min_taglia: 25, max_taglia: 75,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Pagrus pagrus.jpg")
  },
  {
    id: "pagello-fragolino",
    nome: "Pagello fragolino",
    scientifico: "Pagellus erythrinus",
    descrizione: "Corpo rosato con macchia scura all'ascella della pinna. Pesce di fondo su sabbia e ghiaia. Ottimo al forno.",
    min_taglia: 15, max_taglia: 50,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Pagellus erythrinus.jpg")
  },
  {
    id: "seppia",
    nome: "Seppia comune",
    scientifico: "Sepia officinalis",
    descrizione: "Mollusco cefalopode intelligente. Si pesca a jigging con seppiolina o spinning leggero. Abbondante in primavera.",
    min_taglia: 13, max_taglia: 45,
    stagione_migliore: "Primavera", protetta: false,
    image_url: WP("Sepia officinalis.jpg")
  },
  {
    id: "calamaro",
    nome: "Calamaro",
    scientifico: "Loligo vulgaris",
    descrizione: "Cefalopode velocissimo, pesca di notte con squid jig colorato e luce subacquea. Carni tenere e versatili.",
    min_taglia: 10, max_taglia: 40,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Loligo vulgaris.jpg")
  },
  {
    id: "polpo",
    nome: "Polpo comune",
    scientifico: "Octopus vulgaris",
    descrizione: "Maestro del mimetismo. Si pesca con polpara, traina o a vista tra le rocce. Carni saporite.",
    min_taglia: 15, max_taglia: 50,
    stagione_migliore: "Estate/Autunno", protetta: false,
    image_url: WP("Octopus vulgaris2.jpg")
  },
  {
    id: "corvina",
    nome: "Corvina / Corvo",
    scientifico: "Sciaena umbra",
    descrizione: "Emette suoni gracchianti. Notturno, si pesca a fondo nelle foci e sugli scogli. Ottime carni.",
    min_taglia: 30, max_taglia: 80,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Sciaena umbra.jpg")
  },
  {
    id: "occhiata",
    nome: "Occhiata",
    scientifico: "Oblada melanura",
    descrizione: "Macchia nera con orlatura bianca alla radice della coda. Vive in branchi vicino alla superficie.",
    min_taglia: 15, max_taglia: 35,
    stagione_migliore: "Primavera/Estate", protetta: false,
    image_url: WP("Oblada melanura.jpg")
  },
  {
    id: "boga",
    nome: "Boga",
    scientifico: "Boops boops",
    descrizione: "Piccolo pesce costiero gregario con tre striature dorate. Comunissimo, ottimo come esca viva.",
    min_taglia: 10, max_taglia: 25,
    stagione_migliore: "Tutto l'anno", protetta: false,
    image_url: WP("Boops boops.jpg")
  },
  {
    id: "zerro",
    nome: "Zerro",
    scientifico: "Spicara smaris",
    descrizione: "Piccolo pesce a macchia azzurra sul fianco. Vive in fitti branchi. Ottimo fritto o come esca.",
    min_taglia: 10, max_taglia: 20,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Spicara smaris.jpg")
  },
  {
    id: "salpa",
    nome: "Salpa",
    scientifico: "Sarpa salpa",
    descrizione: "Striature dorate longitudinali. Pesce erbivoro selettivo. Carni di scarso pregio ma combattiva.",
    min_taglia: 15, max_taglia: 45,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Sarpa salpa.jpg")
  },
  {
    id: "alaccia",
    nome: "Alaccia",
    scientifico: "Sardinella aurita",
    descrizione: "Simile alla sardina ma con linea dorata. Abbondante in estate vicino alla costa. Ottima come esca viva.",
    min_taglia: 10, max_taglia: 25,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Sardinella aurita.jpg")
  },
  {
    id: "sugarello",
    nome: "Sugarello / Ciocia",
    scientifico: "Trachurus trachurus",
    descrizione: "Linea laterale corazzata con scudetti. Si pesca a sabiki in banco. Buono marinato o come esca.",
    min_taglia: 15, max_taglia: 40,
    stagione_migliore: "Estate/Autunno", protetta: false,
    image_url: WP("Trachurus trachurus.jpg")
  },
  {
    id: "pesce-san-pietro",
    nome: "Pesce San Pietro",
    scientifico: "Zeus faber",
    descrizione: "Macchia tonda scura sul fianco (impronta del pollice di San Pietro). Corpo compresso, ottimo da cucinare.",
    min_taglia: 25, max_taglia: 60,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Zeus faber.jpg")
  },
  {
    id: "lampuga",
    nome: "Lampuga / Corifena",
    scientifico: "Coryphaena hippurus",
    descrizione: "Colorazione iridescente stupenda in vita. Pesce pelagico velocissimo, si pesca a traina in mare aperto.",
    min_taglia: 40, max_taglia: 180,
    stagione_migliore: "Estate/Autunno", protetta: false,
    image_url: WP("Coryphaena hippurus.jpg")
  },
  {
    id: "musdea",
    nome: "Musdea / Mostella",
    scientifico: "Phycis phycis",
    descrizione: "Pesce di fondo con barbigli sotto la mascella. Si pesca di notte in profondità. Carni bianche e delicate.",
    min_taglia: 15, max_taglia: 60,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Phycis phycis.jpg")
  },
  {
    id: "nasello",
    nome: "Nasello / Merluzzo",
    scientifico: "Merluccius merluccius",
    descrizione: "Predatore di mezza acqua e di fondo. Si pesca di notte a fondo con saraghina o pesciolino.",
    min_taglia: 20, max_taglia: 100,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Merluccius merluccius.jpg")
  },
  {
    id: "razza",
    nome: "Razza chiodata",
    scientifico: "Raja clavata",
    descrizione: "Elasmobranchio di forma romboidale. Si pesca accidentalmente a fondo su sabbia. Spine sul dorso — attenzione.",
    min_taglia: 40, max_taglia: 120,
    stagione_migliore: "Autunno/Inverno", protetta: false,
    image_url: WP("Raja clavata.jpg")
  },
  {
    id: "squatina",
    nome: "Pesce angelo",
    scientifico: "Squatina squatina",
    descrizione: "Elasmobranchio piatto. Gravemente minacciato — rilasciare immediatamente con la massima cura.",
    min_taglia: 80, max_taglia: 180,
    stagione_migliore: "Estate", protetta: true,
    image_url: WP("Squatina squatina.jpg")
  },
  {
    id: "murena",
    nome: "Murena",
    scientifico: "Muraena helena",
    descrizione: "Serpentiforme, si nasconde tra le rocce. Morso potente — maneggiare con estrema cautela. Carni bianche e buone.",
    min_taglia: 50, max_taglia: 150,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Muraena helena.jpg")
  },
  {
    id: "ghiozzo",
    nome: "Ghiozzo",
    scientifico: "Gobius niger",
    descrizione: "Piccolo pesce di fondo abbondante nei canali. Prima cattura per molti giovani pescatori. Ottimo fritto.",
    min_taglia: 5, max_taglia: 18,
    stagione_migliore: "Tutto l'anno", protetta: false,
    image_url: WP("Gobius niger.jpg")
  },
  {
    id: "astice",
    nome: "Astice europeo",
    scientifico: "Homarus gammarus",
    descrizione: "Crostaceo blu-nero con chele potenti. Specie protetta — taglia minima 87 mm carapace. Rilasciarlo sempre.",
    min_taglia: 87, max_taglia: 60,
    stagione_migliore: "Estate", protetta: true,
    image_url: WP("Homarus gammarus.jpg")
  },
  {
    id: "aragosta",
    nome: "Aragosta",
    scientifico: "Palinurus elephas",
    descrizione: "Crostaceo senza chele, antenne lunghissime. Specie protetta. Pesca con nasse vietata senza licenza.",
    min_taglia: 90, max_taglia: 50,
    stagione_migliore: "Estate", protetta: true,
    image_url: WP("Palinurus elephas.jpg")
  },
  {
    id: "tonno-rosso",
    nome: "Tonno rosso",
    scientifico: "Thunnus thynnus",
    descrizione: "Il grande pelagico del Mediterraneo. Soggetto a quote, pesca sportiva regolamentata. Carni pregiatis­sime.",
    min_taglia: 115, max_taglia: 300,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Thunnus thynnus.jpg")
  },
  {
    id: "palamita-bianca",
    nome: "Alalunga",
    scientifico: "Thunnus alalunga",
    descrizione: "Tonnetto con pinne pettorali lunghissime. Si pesca a traina in mare aperto. Carni più chiare del tonno rosso.",
    min_taglia: 40, max_taglia: 120,
    stagione_migliore: "Estate", protetta: false,
    image_url: WP("Thunnus alalunga.jpg")
  },
];
