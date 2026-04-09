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
    descrizione: "Predatore costiero molto amato. Si pesca a spinning o surfcasting presso foci e scogliere. Bocca grande, corpo argenteo.",
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
    descrizione: "Grufolatore dalle carni pregiatissime. Riconoscibile dalla fascia dorata tra gli occhi. Predilige fondali sabbiosi e praterie di posidonia.",
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
    descrizione: "Predatore vorace e potente, recide i terminali con i denti affilati. Caccia in branchi frenetici. Ottimo a spinning con artificiali.",
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
    descrizione: "Pesce stanziale di fondale roccioso, molto longevo e a lenta crescita. Specie protetta, taglia minima 45 cm.",
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
    descrizione: "Specie aliena invasiva, estremamente aggressiva. Abbondante nei canali e foci come il Portatore. Carni saporite.",
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
    descrizione: "Pesce di fondale sabbioso, tipica preda del surfcasting estivo. Corpo argenteo con bande verticali scure.",
    min_taglia: 20,
    max_taglia: 45,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=400&h=300&fit=crop"
  },
  {
    id: "sarago-pizzuto",
    nome: "Sarago pizzuto",
    scientifico: "Diplodus puntazzo",
    descrizione: "Labbra carnose e muso appuntito. Erbivoro-onnivoro, si pesca a fondo con mazzancolla o coreano. Combattivo per la sua taglia.",
    min_taglia: 18,
    max_taglia: 60,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
  },
  {
    id: "sarago-fasciato",
    nome: "Sarago fasciato",
    scientifico: "Diplodus vulgaris",
    descrizione: "Bande nere caratteristiche. Vive in branchi su praterie e fondali misti. Si pesca con cannolicchio o arenicola.",
    min_taglia: 18,
    max_taglia: 45,
    stagione_migliore: "Tutto l'anno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop"
  },
  {
    id: "sparaglione",
    nome: "Sparaglione",
    scientifico: "Diplodus annularis",
    descrizione: "Il più piccolo dei saraghi, con anello nero alla radice della coda. Comunissimo nei canali e nelle foci.",
    min_taglia: 12,
    max_taglia: 25,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=400&h=300&fit=crop"
  },
  {
    id: "cefalo",
    nome: "Cefalo / Muggine",
    scientifico: "Mugil cephalus",
    descrizione: "Abbondantissimo nei canali e nelle foci. Erbivoro selettivo, difficile da ingannare. Si pesca a bolognese o feeder con pane e polenta.",
    min_taglia: 20,
    max_taglia: 80,
    stagione_migliore: "Tutto l'anno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&h=300&fit=crop"
  },
  {
    id: "leccia-stella",
    nome: "Leccia stella",
    scientifico: "Trachinotus ovatus",
    descrizione: "Pesce piatto e velocissimo, si avvicina a riva durante l'estate. Combattivo e ottimo commestibile. Si pesca a spinning leggero.",
    min_taglia: 15,
    max_taglia: 50,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1596726265738-f9b2d35508a6?w=400&h=300&fit=crop"
  },
  {
    id: "ombrina",
    nome: "Ombrina bocca d'oro",
    scientifico: "Umbrina cirrosa",
    descrizione: "Presenta un piccolo barbiglio sotto la mandibola. Pesce di fondale sabbioso e misto, si pesca al surfcasting con saraghina.",
    min_taglia: 30,
    max_taglia: 100,
    stagione_migliore: "Estate/Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=400&h=300&fit=crop"
  },
  {
    id: "sogliola",
    nome: "Sogliola comune",
    scientifico: "Solea solea",
    descrizione: "Pesce piatto di fondale sabbioso, notturno. Si pesca di notte con arenicola o coreano sul fondo. Carni delicatissime.",
    min_taglia: 20,
    max_taglia: 60,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
  },
  {
    id: "anguilla",
    nome: "Anguilla europea",
    scientifico: "Anguilla anguilla",
    descrizione: "Pesce migratore catadromico, vive nel fango dei fondali. Si pesca di notte con trancio di cefalo o lombrichi. Specie in declino.",
    min_taglia: 30,
    max_taglia: 130,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=400&h=300&fit=crop"
  },
  {
    id: "palamita",
    nome: "Palamita",
    scientifico: "Sarda sarda",
    descrizione: "Tonnetto costiero velocissimo, pesca a traina o spinning con cucchiaino. Carni rosse e gustose, ottima marinata.",
    min_taglia: 25,
    max_taglia: 80,
    stagione_migliore: "Estate/Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    id: "sgombro",
    nome: "Sgombro",
    scientifico: "Scomber scombrus",
    descrizione: "Pesce azzurro abbondante e voracissimo. Si pesca a sabiki o con piccoli cucchiaini. Carni grasse e nutrienti.",
    min_taglia: 18,
    max_taglia: 50,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1596726265738-f9b2d35508a6?w=400&h=300&fit=crop"
  },
  {
    id: "ricciola",
    nome: "Ricciola",
    scientifico: "Seriola dumerili",
    descrizione: "Grande pelagico molto combattivo. Fascia gialla longitudinale sul fianco. Si pesca a spinning con artificiali o vivo.",
    min_taglia: 40,
    max_taglia: 190,
    stagione_migliore: "Estate/Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=400&h=300&fit=crop"
  },
  {
    id: "aguglia",
    nome: "Aguglia",
    scientifico: "Belone belone",
    descrizione: "Corpo allungatissimo con muso a becco. Vive in superficie, si pesca a galleggiante con pesciolino vivo o artificiale leggero.",
    min_taglia: 30,
    max_taglia: 90,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop"
  },
  {
    id: "gallinella",
    nome: "Gallinella / Capone",
    scientifico: "Chelidonichthys lucerna",
    descrizione: "Pesce di fondo con grandi pinne pettorali colorate di blu. Si muove sul fondale 'camminando'. Carni ottime.",
    min_taglia: 20,
    max_taglia: 60,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=400&h=300&fit=crop"
  },
  {
    id: "triglia-fango",
    nome: "Triglia di fango",
    scientifico: "Mullus barbatus",
    descrizione: "Pesce di fondo fangoso, riconoscibile dai due barbigli sotto la mascella. Carni squisite, molto apprezzata in cucina.",
    min_taglia: 11,
    max_taglia: 30,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
  },
  {
    id: "triglia-scoglio",
    nome: "Triglia di scoglio",
    scientifico: "Mullus surmuletus",
    descrizione: "Simile alla triglia di fango ma con bande longitudinali gialle. Vive su fondali rocciosi. Colorazione vivace.",
    min_taglia: 11,
    max_taglia: 40,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=400&h=300&fit=crop"
  },
  {
    id: "scorfano",
    nome: "Scorfano rosso",
    scientifico: "Scorpaena scrofa",
    descrizione: "Pesce di agguato mimetico su fondali rocciosi. Spine velenose — maneggiare con cura! Carni bianche eccellenti per zuppe.",
    min_taglia: 25,
    max_taglia: 50,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop"
  },
  {
    id: "dentice",
    nome: "Dentice",
    scientifico: "Dentex dentex",
    descrizione: "Re dei fondali rocciosi, combattivo e prelibato. Denti canini evidenti. Si pesca a fondo con vivi o a spinning profondo.",
    min_taglia: 30,
    max_taglia: 100,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1596726265738-f9b2d35508a6?w=400&h=300&fit=crop"
  },
  {
    id: "seppia",
    nome: "Seppia comune",
    scientifico: "Sepia officinalis",
    descrizione: "Mollusco cefalopode intelligente. Si pesca a jigging con seppiolina o spinning leggero. Abbondante in primavera.",
    min_taglia: 13,
    max_taglia: 45,
    stagione_migliore: "Primavera",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1566132127697-4524fea60007?w=400&h=300&fit=crop"
  },
  {
    id: "calamaro",
    nome: "Calamaro",
    scientifico: "Loligo vulgaris",
    descrizione: "Cefalopode velocissimo, pesca di notte con squid jig colorato e luce subacquea. Carni tenere e versatili.",
    min_taglia: 10,
    max_taglia: 40,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1566132127697-4524fea60007?w=400&h=300&fit=crop"
  },
  {
    id: "polpo",
    nome: "Polpo comune",
    scientifico: "Octopus vulgaris",
    descrizione: "Mollusco cefalopode maestro del mimetismo. Si pesca con polpara, traina o a vista tra le rocce. Carni saporite.",
    min_taglia: 15,
    max_taglia: 50,
    stagione_migliore: "Estate/Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1559570276-25a6c4b97c7a?w=400&h=300&fit=crop"
  },
  {
    id: "pagello-fragolino",
    nome: "Pagello fragolino",
    scientifico: "Pagellus erythrinus",
    descrizione: "Corpo rosato con macchia scura all'ascella della pinna. Pesce di fondo su sabbia e ghiaia. Ottimo al forno.",
    min_taglia: 15,
    max_taglia: 50,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
  },
  {
    id: "occhiata",
    nome: "Occhiata",
    scientifico: "Oblada melanura",
    descrizione: "Macchia nera con orlatura bianca alla radice della coda. Vive in branchi vicino alla superficie. Abbondante presso le foci.",
    min_taglia: 15,
    max_taglia: 35,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop"
  },
  {
    id: "boga",
    nome: "Boga",
    scientifico: "Boops boops",
    descrizione: "Piccolo pesce costiero gregario con tre striature dorate. Comunissimo, ottimo come esca viva per pesci più grandi.",
    min_taglia: 10,
    max_taglia: 25,
    stagione_migliore: "Tutto l'anno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&h=300&fit=crop"
  },
  {
    id: "zerro",
    nome: "Zerro",
    scientifico: "Spicara smaris",
    descrizione: "Piccolo pesce a macchia azzurra sul fianco. Vive in fitti branchi. Ottimo fritto o come esca per predatori.",
    min_taglia: 10,
    max_taglia: 20,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=400&h=300&fit=crop"
  },
  {
    id: "pesce-san-pietro",
    nome: "Pesce San Pietro",
    scientifico: "Zeus faber",
    descrizione: "Macchia tonda scura sul fianco (impronta del pollice di San Pietro). Corpo compresso, ottimo da cucinare.",
    min_taglia: 25,
    max_taglia: 60,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop"
  },
  {
    id: "lampuga",
    nome: "Lampuga / Corifena",
    scientifico: "Coryphaena hippurus",
    descrizione: "Colorazione iridescente stupenda in vita. Pesce pelagico velocissimo, si pesca a traina in mare aperto.",
    min_taglia: 40,
    max_taglia: 180,
    stagione_migliore: "Estate/Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    id: "lanzardo",
    nome: "Lanzardo",
    scientifico: "Scomber colias",
    descrizione: "Simile allo sgombro ma con macchie sui fianchi. Molto abbondante in autunno, si pesca a sabiki o colpetti.",
    min_taglia: 18,
    max_taglia: 45,
    stagione_migliore: "Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1596726265738-f9b2d35508a6?w=400&h=300&fit=crop"
  },
  {
    id: "ghiozzo",
    nome: "Ghiozzo",
    scientifico: "Gobius niger",
    descrizione: "Piccolo pesce di fondo abbondante nei canali. Prima cattura per molti giovani pescatori. Ottimo fritto.",
    min_taglia: 5,
    max_taglia: 18,
    stagione_migliore: "Tutto l'anno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=400&h=300&fit=crop"
  },
  {
    id: "murena",
    nome: "Murena",
    scientifico: "Muraena helena",
    descrizione: "Serpentiforme, si nasconde tra le rocce. Morso potente, maneggiare con estrema cautela. Carni bianche e buone.",
    min_taglia: 50,
    max_taglia: 150,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=400&h=300&fit=crop"
  },
  {
    id: "razza",
    nome: "Razza chiodata",
    scientifico: "Raja clavata",
    descrizione: "Elasmobranchio di forma romboidale. Si pesca accidentalmente a fondo su sabbia. Spine sul dorso — attenzione.",
    min_taglia: 40,
    max_taglia: 120,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
  },
  {
    id: "squatina",
    nome: "Pesce angelo / Squatina",
    scientifico: "Squatina squatina",
    descrizione: "Elasmobranchio a forma di razza piatta. Gravemente minacciato, va rilasciato subito con cura massima.",
    min_taglia: 80,
    max_taglia: 180,
    stagione_migliore: "Estate",
    protetta: true,
    image_url: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop"
  },
  {
    id: "astice",
    nome: "Astice europeo",
    scientifico: "Homarus gammarus",
    descrizione: "Crostaceo blu-nero con chele potenti. Specie protetta con taglia minima 87 mm carapace. Rilasciarlo sempre.",
    min_taglia: 87,
    max_taglia: 60,
    stagione_migliore: "Estate",
    protetta: true,
    image_url: "https://images.unsplash.com/photo-1563245415-ef6aa8360d84?w=400&h=300&fit=crop"
  },
  {
    id: "aragosta",
    nome: "Aragosta",
    scientifico: "Palinurus elephas",
    descrizione: "Crostaceo senza chele, antenne lunghissime. Specie protetta, pesca con nasse vietata senza licenza. Rilasciare.",
    min_taglia: 90,
    max_taglia: 50,
    stagione_migliore: "Estate",
    protetta: true,
    image_url: "https://images.unsplash.com/photo-1563245415-ef6aa8360d84?w=400&h=300&fit=crop"
  },
  {
    id: "pagro",
    nome: "Pagro comune",
    scientifico: "Pagrus pagrus",
    descrizione: "Simile al dentice ma con pinne rosse. Vive su fondali rocciosi. Carni eccellenti, molto ricercato dai pescatori sportivi.",
    min_taglia: 25,
    max_taglia: 75,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
  },
  {
    id: "corvina",
    nome: "Corvina / Corvo",
    scientifico: "Sciaena umbra",
    descrizione: "Emette suoni gracchianti con la vescica natatoria. Notturno, si pesca a fondo nelle foci e negli scogli. Ottime carni.",
    min_taglia: 30,
    max_taglia: 80,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=400&h=300&fit=crop"
  },
  {
    id: "musdea",
    nome: "Musdea / Mostella",
    scientifico: "Phycis phycis",
    descrizione: "Pesce di fondo con barbigli sotto la mascella. Si pesca di notte in profondità. Carni bianche e delicate.",
    min_taglia: 15,
    max_taglia: 60,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&h=300&fit=crop"
  },
  {
    id: "alaccia",
    nome: "Alaccia",
    scientifico: "Sardinella aurita",
    descrizione: "Simile alla sardina ma con linea dorata. Abbondante in estate vicino alla costa. Ottima come esca viva o fritta.",
    min_taglia: 10,
    max_taglia: 25,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    id: "sarago-maggiore",
    nome: "Sarago maggiore",
    scientifico: "Diplodus sargus",
    descrizione: "Il sarago più comune e combattivo. Bande verticali scure su fondo argenteo. Si pesca con cannolicchio, mazzancolla e mitilo.",
    min_taglia: 18,
    max_taglia: 55,
    stagione_migliore: "Primavera/Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop"
  },
  {
    id: "ciocia",
    nome: "Ciocia / Sugarello",
    scientifico: "Trachurus trachurus",
    descrizione: "Linea laterale corazzata con scudetti. Si pesca a sabiki in banco. Buono marinato o come esca per predatori.",
    min_taglia: 15,
    max_taglia: 40,
    stagione_migliore: "Estate/Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=400&h=300&fit=crop"
  },
  {
    id: "salpa",
    nome: "Salpa",
    scientifico: "Sarpa salpa",
    descrizione: "Striature dorate longitudinali. Pesce erbivoro selettivo, si nutre di alghe. Carni di scarso pregio ma combattiva.",
    min_taglia: 15,
    max_taglia: 45,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
  },
  {
    id: "tonno-rosso",
    nome: "Tonno rosso",
    scientifico: "Thunnus thynnus",
    descrizione: "Il grande pelagico del Mediterraneo. Specie soggetta a quote, pesca sportiva regolamentata. Carni pregiatis­sime.",
    min_taglia: 115,
    max_taglia: 300,
    stagione_migliore: "Estate",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    id: "nasello",
    nome: "Nasello / Merluzzo",
    scientifico: "Merluccius merluccius",
    descrizione: "Predatore di mezza acqua e di fondo, molto diffuso. Si pesca di notte a fondo con saraghina o pesciolino.",
    min_taglia: 20,
    max_taglia: 100,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1596726265738-f9b2d35508a6?w=400&h=300&fit=crop"
  },
  {
    id: "cappone",
    nome: "Cappone / Coccio",
    scientifico: "Chelidonichthys cuculus",
    descrizione: "Pinne pettorali con raggi liberi che usa per 'camminare'. Colore arancio-rosso. Ottimo per brodetti e zuppe.",
    min_taglia: 18,
    max_taglia: 50,
    stagione_migliore: "Autunno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop"
  },
  {
    id: "sarago-testa-nera",
    nome: "Sarago testa nera",
    scientifico: "Diplodus cervinus",
    descrizione: "Il più grande dei saraghi, con grosse bande verticali. Vive su fondali rocciosi profondi. Molto ricercato.",
    min_taglia: 25,
    max_taglia: 55,
    stagione_migliore: "Autunno/Inverno",
    protetta: false,
    image_url: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&h=300&fit=crop"
  },
];
