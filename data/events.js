/* IndovinaQuando — database degli eventi storici.
 *
 * Ogni evento è costruito con e(anno, testo, categoria, curiosità).
 * L'anno è negativo per gli eventi avanti Cristo (es. -44 = 44 a.C.).
 * L'id viene generato dal testo, così aggiungere un evento non richiede
 * di inventarsi un identificativo: basta aggiungere una riga.
 */
(function (global) {
  'use strict';

  var IQ = global.IQ || (global.IQ = {});

  var CAT = {
    GUE: 'Guerre e politica',
    SCI: 'Scienza e tecnologia',
    ART: 'Arte e cultura',
    SPO: 'Sport',
    SOC: 'Società',
    ESP: 'Esplorazioni'
  };

  var events = [];

  function slug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
  }

  function e(year, text, cat, note) {
    events.push({ id: slug(text) + '-' + year, year: year, text: text, cat: cat, note: note });
  }

  /* ---------------------------------------------------------------- Antichità */

  e(-2560, 'Viene completata la Grande Piramide di Giza', CAT.ART,
    'Rimase la costruzione più alta del mondo per quasi quattromila anni.');
  e(-1750, 'Il re babilonese Hammurabi fa incidere il suo codice di leggi', CAT.SOC,
    'La stele originale, in diorite nera, è oggi al Louvre.');
  e(-776, 'Si disputano le prime Olimpiadi antiche a Olimpia', CAT.SPO,
    'Per secoli i Greci contarono gli anni proprio a partire da questa edizione.');
  e(-753, 'Romolo fonda Roma, secondo la tradizione', CAT.SOC,
    'La data fu calcolata secoli dopo dallo studioso Marco Terenzio Varrone.');
  e(-490, 'Gli ateniesi sconfiggono i persiani nella battaglia di Maratona', CAT.GUE,
    'Dalla corsa del messaggero che annunciò la vittoria nasce il mito della maratona.');
  e(-480, 'Leonida e i suoi trecento spartani resistono alle Termopili', CAT.GUE,
    'Nello stesso anno la flotta greca vinse la decisiva battaglia navale di Salamina.');
  e(-399, 'Socrate viene condannato a morte e beve la cicuta', CAT.ART,
    'Non scrisse mai nulla: tutto ciò che sappiamo arriva dai suoi allievi.');
  e(-323, 'Muore Alessandro Magno a Babilonia', CAT.GUE,
    'Aveva 32 anni e il suo impero si sgretolò in pochi mesi tra i generali.');
  e(-216, 'Annibale annienta l\'esercito romano nella battaglia di Canne', CAT.GUE,
    'La sua manovra di accerchiamento è ancora studiata nelle accademie militari.');
  e(-146, 'Roma rade al suolo Cartagine alla fine della terza guerra punica', CAT.GUE,
    'La leggenda del sale sparso sulle rovine è un\'invenzione dell\'Ottocento.');
  e(-44, 'Giulio Cesare viene assassinato alle Idi di marzo', CAT.GUE,
    'Il Senato si riuniva quel giorno nella Curia di Pompeo, non nel Foro.');
  e(-31, 'Ottaviano sconfigge Antonio e Cleopatra nella battaglia di Azio', CAT.GUE,
    'Con questa vittoria finisce la repubblica romana e comincia l\'impero.');
  e(9, 'Le legioni di Varo vengono distrutte nella foresta di Teutoburgo', CAT.GUE,
    'Svetonio racconta che Augusto gridava: "Varo, rendimi le mie legioni!".');
  e(64, 'Un grande incendio devasta Roma sotto il regno di Nerone', CAT.SOC,
    'L\'immagine di Nerone che suona la lira mentre Roma brucia è propaganda posteriore.');
  e(79, 'L\'eruzione del Vesuvio seppellisce Pompei ed Ercolano', CAT.SOC,
    'Plinio il Vecchio morì durante il tentativo di soccorrere gli abitanti.');
  e(212, 'La Constitutio Antoniniana concede la cittadinanza a tutti i liberi dell\'impero', CAT.SOC,
    'Da un giorno all\'altro milioni di persone divennero cittadini romani.');
  e(313, 'L\'editto di Milano garantisce libertà di culto ai cristiani', CAT.SOC,
    'Fu un accordo tra due imperatori, Costantino e Licinio.');
  e(325, 'Il concilio di Nicea definisce il credo cristiano', CAT.SOC,
    'Da quel concilio arriva la regola che fissa la data della Pasqua.');
  e(330, 'Costantino inaugura Costantinopoli come nuova capitale', CAT.SOC,
    'La città sorse sull\'antica colonia greca di Bisanzio.');
  e(476, 'Odoacre depone Romolo Augustolo: cade l\'Impero romano d\'Occidente', CAT.GUE,
    'L\'ultimo imperatore d\'Occidente era poco più che un ragazzino.');

  /* ---------------------------------------------------------------- Medioevo */

  e(622, 'Maometto lascia La Mecca per Medina: è l\'Egira', CAT.SOC,
    'Da questo viaggio parte il conteggio degli anni del calendario islamico.');
  e(732, 'Carlo Martello ferma l\'avanzata araba a Poitiers', CAT.GUE,
    'Il soprannome "Martello" gli fu dato proprio dopo questa battaglia.');
  e(800, 'Carlo Magno viene incoronato imperatore a Roma', CAT.GUE,
    'L\'incoronazione avvenne la notte di Natale, nella basilica di San Pietro.');
  e(1054, 'Lo Scisma d\'Oriente divide la Chiesa di Roma da quella di Costantinopoli', CAT.SOC,
    'Le scomuniche reciproche furono revocate solo nel 1965.');
  e(1066, 'Guglielmo il Conquistatore vince la battaglia di Hastings', CAT.GUE,
    'L\'intera vicenda è ricamata sull\'arazzo di Bayeux, lungo settanta metri.');
  e(1088, 'Nasce l\'Università di Bologna, la più antica d\'Europa', CAT.ART,
    'Il suo motto è "Alma Mater Studiorum", madre generosa degli studi.');
  e(1095, 'Papa Urbano II proclama la prima crociata a Clermont', CAT.GUE,
    'Il grido che accompagnò l\'annuncio fu "Dio lo vuole".');
  e(1099, 'I crociati conquistano Gerusalemme', CAT.GUE,
    'L\'assedio durò poco più di un mese, dopo tre anni di marcia.');
  e(1215, 'Il re Giovanni d\'Inghilterra firma la Magna Carta', CAT.SOC,
    'È considerata l\'antenata delle costituzioni moderne.');
  e(1271, 'Marco Polo parte da Venezia per la Cina', CAT.ESP,
    'Tornò 24 anni dopo, e dettò il racconto del viaggio in una prigione genovese.');
  e(1282, 'I Vespri siciliani cacciano gli Angioini dall\'isola', CAT.GUE,
    'La rivolta scoppiò a Palermo all\'ora del vespro, da cui il nome.');
  e(1309, 'Il papato si trasferisce ad Avignone', CAT.SOC,
    'I papi vi restarono quasi settant\'anni, un periodo detto "cattività avignonese".');
  e(1321, 'Dante Alighieri muore a Ravenna dopo aver completato la Divina Commedia', CAT.ART,
    'Le sue ossa sono ancora a Ravenna, nonostante secoli di richieste da Firenze.');
  e(1337, 'Comincia la Guerra dei cent\'anni tra Francia e Inghilterra', CAT.GUE,
    'Durò in realtà 116 anni, con lunghe tregue nel mezzo.');
  e(1347, 'La peste nera arriva in Europa dai porti del Mediterraneo', CAT.SOC,
    'In cinque anni uccise circa un terzo della popolazione europea.');
  e(1353, 'Giovanni Boccaccio completa il Decameron', CAT.ART,
    'La cornice del libro è proprio un gruppo di giovani in fuga dalla peste.');
  e(1415, 'Gli arcieri inglesi travolgono i francesi ad Azincourt', CAT.GUE,
    'Il fango del campo rese quasi immobili i cavalieri francesi in armatura.');
  e(1431, 'Giovanna d\'Arco viene arsa sul rogo a Rouen', CAT.GUE,
    'Venticinque anni dopo un nuovo processo la dichiarò innocente.');
  e(1453, 'Costantinopoli cade in mano agli ottomani di Maometto II', CAT.GUE,
    'Le mura resistevano da mille anni: le abbatterono i cannoni.');
  e(1455, 'Gutenberg stampa la sua Bibbia a caratteri mobili', CAT.SCI,
    'Ne restano oggi meno di cinquanta copie al mondo.');

  /* ---------------------------------------------------- Età moderna 1492-1899 */

  e(1492, 'Cristoforo Colombo sbarca nelle Americhe', CAT.ESP,
    'Morì convinto di essere arrivato alle Indie.');
  e(1498, 'Leonardo da Vinci termina l\'Ultima Cena a Milano', CAT.ART,
    'Dipinse a secco invece che ad affresco: per questo si rovinò subito.');
  e(1503, 'Leonardo da Vinci comincia a dipingere la Gioconda', CAT.ART,
    'Se la portò dietro fino in Francia e non la consegnò mai al committente.');
  e(1512, 'Michelangelo completa la volta della Cappella Sistina', CAT.ART,
    'Ci lavorò quattro anni, in piedi su un ponteggio, non sdraiato come si racconta.');
  e(1517, 'Martin Lutero pubblica le 95 tesi contro le indulgenze', CAT.SOC,
    'Che le abbia affisse al portone di Wittenberg è una tradizione mai provata.');
  e(1522, 'La spedizione di Magellano completa il primo giro del mondo', CAT.ESP,
    'Partirono in 270, tornarono in 18: Magellano non era tra loro.');
  e(1527, 'I lanzichenecchi mettono a sacco Roma', CAT.GUE,
    'Le Guardie Svizzere persero 147 uomini difendendo il papa: da lì la festa del 6 maggio.');
  e(1571, 'La Lega Santa sconfigge la flotta ottomana a Lepanto', CAT.GUE,
    'Tra i feriti c\'era Miguel de Cervantes, che perse l\'uso della mano sinistra.');
  e(1588, 'L\'Invincibile Armada spagnola viene distrutta al largo dell\'Inghilterra', CAT.GUE,
    'A finire il lavoro furono soprattutto le tempeste del Mare del Nord.');
  e(1610, 'Galileo Galilei pubblica il Sidereus Nuncius con le sue scoperte al telescopio', CAT.SCI,
    'Vi descrisse per la prima volta i quattro satelliti maggiori di Giove.');
  e(1633, 'Galileo Galilei abiura davanti al tribunale dell\'Inquisizione', CAT.SCI,
    'La frase "eppur si muove" non compare in nessun atto del processo.');
  e(1648, 'La pace di Vestfalia chiude la guerra dei trent\'anni', CAT.GUE,
    'È considerata l\'atto di nascita dello Stato nazionale moderno.');
  e(1649, 'Il re Carlo I d\'Inghilterra viene decapitato a Londra', CAT.GUE,
    'Fu il primo sovrano europeo giustiziato dopo un processo pubblico.');
  e(1687, 'Isaac Newton pubblica i Principia con la legge di gravitazione universale', CAT.SCI,
    'A pagare la stampa fu di tasca sua l\'astronomo Edmond Halley.');
  e(1776, 'Le colonie americane firmano la Dichiarazione di indipendenza', CAT.GUE,
    'Il voto fu il 2 luglio, ma si festeggia il 4, giorno del testo definitivo.');
  e(1789, 'La folla parigina prende d\'assalto la Bastiglia', CAT.GUE,
    'Nella prigione simbolo dell\'assolutismo c\'erano solo sette detenuti.');
  e(1793, 'Luigi XVI viene ghigliottinato in place de la Révolution', CAT.GUE,
    'Nove mesi dopo toccò a Robespierre, che quella stagione l\'aveva guidata.');
  e(1804, 'Napoleone si incorona imperatore dei francesi a Notre-Dame', CAT.GUE,
    'Prese la corona dalle mani del papa e se la mise da solo.');
  e(1815, 'Napoleone viene sconfitto definitivamente a Waterloo', CAT.GUE,
    'Nello stesso anno il Congresso di Vienna ridisegnò la mappa d\'Europa.');
  e(1824, 'Debutta a Vienna la Nona Sinfonia di Beethoven', CAT.ART,
    'Beethoven era ormai sordo: dovettero girarlo verso il pubblico che applaudiva.');
  e(1848, 'Le rivoluzioni liberali incendiano tutta l\'Europa', CAT.GUE,
    'In Italia furono le Cinque giornate di Milano a segnare la primavera dei popoli.');
  e(1859, 'Charles Darwin pubblica L\'origine delle specie', CAT.SCI,
    'La prima tiratura, 1250 copie, andò esaurita in un solo giorno.');
  e(1861, 'Viene proclamato il Regno d\'Italia', CAT.GUE,
    'Vittorio Emanuele II restò "secondo" anche da re d\'Italia, per non rinnegare i Savoia.');
  e(1865, 'Il presidente Abraham Lincoln viene assassinato a teatro', CAT.GUE,
    'Accadde cinque giorni dopo la resa che chiudeva la guerra civile americana.');
  e(1869, 'Viene inaugurato il canale di Suez', CAT.ESP,
    'Per l\'occasione a Verdi fu commissionata l\'opera che divenne l\'Aida.');
  e(1870, 'I bersaglieri entrano a Roma dalla breccia di Porta Pia', CAT.GUE,
    'Roma divenne capitale d\'Italia l\'anno successivo.');
  e(1871, 'Nasce l\'Impero tedesco proclamato nella reggia di Versailles', CAT.GUE,
    'L\'artefice fu il cancelliere Otto von Bismarck.');
  e(1876, 'Alexander Graham Bell brevetta il telefono', CAT.SCI,
    'Antonio Meucci lo aveva già presentato anni prima, senza poter pagare il brevetto.');
  e(1879, 'Thomas Edison presenta la sua lampadina a incandescenza', CAT.SCI,
    'Il filamento della prima versione funzionante era di semplice cotone carbonizzato.');
  e(1886, 'Viene inventata la Coca-Cola in una farmacia di Atlanta', CAT.SOC,
    'Il primo anno se ne vendevano in media nove bicchieri al giorno.');
  e(1889, 'Viene inaugurata la Tour Eiffel per l\'Esposizione universale', CAT.ART,
    'Doveva essere smontata dopo vent\'anni: la salvò l\'utilità come antenna radio.');
  e(1889, 'Viene fondata in Giappone la Nintendo', CAT.SOC,
    'Per settant\'anni produsse soltanto carte da gioco.');
  e(1895, 'I fratelli Lumière tengono la prima proiezione cinematografica a pagamento', CAT.ART,
    'Nella saletta parigina del primo spettacolo c\'erano 33 spettatori.');
  e(1895, 'Wilhelm Röntgen scopre i raggi X', CAT.SCI,
    'La prima radiografia della storia ritrae la mano di sua moglie.');
  e(1896, 'Si tengono ad Atene le prime Olimpiadi moderne', CAT.SPO,
    'I vincitori ricevettero una medaglia d\'argento, non d\'oro.');

  /* ------------------------------------------------------- Novecento 1900-1945 */

  e(1901, 'Guglielmo Marconi trasmette il primo segnale radio attraverso l\'Atlantico', CAT.SCI,
    'Il segnale era solo la lettera S in codice Morse: tre punti.');
  e(1903, 'I fratelli Wright compiono il primo volo a motore', CAT.SCI,
    'Il primo volo durò 12 secondi e coprì meno di quaranta metri.');
  e(1905, 'Albert Einstein pubblica la teoria della relatività ristretta', CAT.SCI,
    'Lavorava all\'ufficio brevetti di Berna: lo chiamano il suo "anno miracoloso".');
  e(1909, 'Parte da Milano il primo Giro d\'Italia', CAT.SPO,
    'Lo organizzò la Gazzetta dello Sport, e da lì arriva la maglia rosa.');
  e(1911, 'Roald Amundsen raggiunge per primo il Polo Sud', CAT.ESP,
    'La spedizione rivale di Scott arrivò un mese dopo e morì sulla via del ritorno.');
  e(1912, 'Il Titanic affonda nell\'Atlantico durante il viaggio inaugurale', CAT.SOC,
    'Le scialuppe a bordo bastavano per poco più di metà dei passeggeri.');
  e(1914, 'L\'attentato di Sarajevo dà il via alla prima guerra mondiale', CAT.GUE,
    'A Natale, in alcuni tratti del fronte, i soldati uscirono dalle trincee per una tregua.');
  e(1917, 'La rivoluzione d\'Ottobre porta i bolscevichi al potere in Russia', CAT.GUE,
    'Per il calendario occidentale l\'"Ottobre" cadde in realtà a novembre.');
  e(1918, 'L\'armistizio dell\'11 novembre chiude la prima guerra mondiale', CAT.GUE,
    'Entrò in vigore all\'undicesima ora dell\'undicesimo giorno dell\'undicesimo mese.');
  e(1919, 'Viene firmato il trattato di Versailles', CAT.GUE,
    'Le riparazioni imposte alla Germania furono saldate solo nel 2010.');
  e(1920, 'Le donne ottengono il diritto di voto negli Stati Uniti', CAT.SOC,
    'Il diciannovesimo emendamento passò per un solo voto di scarto in Tennessee.');
  e(1922, 'La marcia su Roma porta Mussolini al governo', CAT.GUE,
    'Mussolini raggiunse Roma in treno, il giorno dopo la marcia.');
  e(1927, 'Charles Lindbergh attraversa l\'Atlantico in solitaria in aereo', CAT.ESP,
    'Restò sveglio per 33 ore consecutive di volo.');
  e(1928, 'Alexander Fleming scopre la penicillina', CAT.SCI,
    'La scoperta nacque da una piastra dimenticata sul bancone durante le vacanze.');
  e(1929, 'Il crollo di Wall Street apre la Grande depressione', CAT.SOC,
    'Il lunedì e il martedì nero della borsa si susseguirono nell\'ultima settimana di ottobre.');
  e(1930, 'L\'Uruguay ospita e vince il primo Mondiale di calcio', CAT.SPO,
    'Le squadre europee partecipanti furono soltanto quattro: il viaggio durava settimane.');
  e(1933, 'Adolf Hitler viene nominato cancelliere della Germania', CAT.GUE,
    'Arrivò al potere per via legale, dopo elezioni e trattative di palazzo.');
  e(1936, 'Scoppia la guerra civile spagnola', CAT.GUE,
    'Vi combatterono volontari da oltre cinquanta paesi nelle Brigate internazionali.');
  e(1937, 'Pablo Picasso dipinge Guernica', CAT.ART,
    'Il quadro tornò in Spagna solo nel 1981, dopo la fine del franchismo.');
  e(1939, 'L\'invasione della Polonia scatena la seconda guerra mondiale', CAT.GUE,
    'Francia e Regno Unito dichiararono guerra due giorni dopo.');
  e(1941, 'L\'attacco giapponese a Pearl Harbor trascina gli Stati Uniti in guerra', CAT.GUE,
    'L\'attacco durò novanta minuti e arrivò in due ondate successive.');
  e(1944, 'Gli Alleati sbarcano in Normandia nel D-Day', CAT.GUE,
    'Fu la più grande operazione anfibia mai tentata: quasi settemila navi.');
  e(1945, 'La bomba atomica viene sganciata su Hiroshima', CAT.GUE,
    'Tre giorni dopo una seconda bomba colpì Nagasaki e il Giappone si arrese.');
  e(1945, 'Nasce l\'Organizzazione delle Nazioni Unite', CAT.SOC,
    'Gli Stati fondatori erano 51, oggi i membri sono 193.');

  /* ------------------------------------------------------- Novecento 1946-1979 */

  e(1946, 'Il referendum istituzionale rende l\'Italia una repubblica', CAT.GUE,
    'Fu la prima votazione nazionale a cui parteciparono anche le donne italiane.');
  e(1946, 'La Piaggio presenta la prima Vespa', CAT.SOC,
    'Il nome venne al presidente Enrico Piaggio guardando la forma del telaio.');
  e(1947, 'L\'India ottiene l\'indipendenza dal Regno Unito', CAT.GUE,
    'La spartizione con il Pakistan mise in movimento oltre dieci milioni di persone.');
  e(1948, 'Entra in vigore la Costituzione della Repubblica Italiana', CAT.SOC,
    'Fu firmata da Enrico De Nicola, primo capo dello Stato repubblicano.');
  e(1948, 'L\'ONU approva la Dichiarazione universale dei diritti umani', CAT.SOC,
    'È il documento più tradotto al mondo: oltre cinquecento lingue.');
  e(1949, 'Nasce la NATO con il Patto Atlantico', CAT.GUE,
    'I paesi fondatori furono dodici, tra cui l\'Italia.');
  e(1949, 'Mao Zedong proclama la Repubblica Popolare Cinese', CAT.GUE,
    'L\'annuncio arrivò dalla Porta della Pace Celeste, a Pechino.');
  e(1950, 'Si corre il primo campionato mondiale di Formula 1', CAT.SPO,
    'La gara inaugurale si tenne a Silverstone, in Inghilterra.');
  e(1953, 'Watson e Crick descrivono la struttura a doppia elica del DNA', CAT.SCI,
    'Fu decisiva un\'immagine ai raggi X ottenuta da Rosalind Franklin.');
  e(1953, 'Hillary e Tenzing raggiungono per primi la vetta dell\'Everest', CAT.ESP,
    'Non hanno mai voluto rivelare chi dei due mise piede in cima per primo.');
  e(1954, 'J.R.R. Tolkien pubblica La Compagnia dell\'Anello', CAT.ART,
    'L\'editore era convinto che avrebbe perso soldi con quel libro.');
  e(1954, 'Cominciano in Italia le trasmissioni regolari della televisione', CAT.SOC,
    'Il primo giorno di programmi durò poco più di dieci ore.');
  e(1957, 'I Trattati di Roma danno vita alla Comunità economica europea', CAT.SOC,
    'Furono firmati in Campidoglio dai sei paesi fondatori.');
  e(1957, 'Il satellite Sputnik apre l\'era spaziale', CAT.SCI,
    'Era una sfera di 58 centimetri che trasmetteva solo un "bip" ripetuto.');
  e(1957, 'La Fiat presenta la Nuova 500', CAT.SOC,
    'Ne furono prodotte quasi quattro milioni in diciotto anni.');
  e(1960, 'Roma ospita i Giochi olimpici', CAT.SPO,
    'Abebe Bikila vinse la maratona correndo scalzo sull\'Appia Antica.');
  e(1961, 'Jurij Gagarin è il primo uomo a volare nello spazio', CAT.SCI,
    'Il volo durò 108 minuti e una sola orbita attorno alla Terra.');
  e(1961, 'Viene costruito il Muro di Berlino', CAT.GUE,
    'Fu tirato su in una sola notte, inizialmente con filo spinato.');
  e(1962, 'La crisi dei missili di Cuba porta il mondo sull\'orlo della guerra nucleare', CAT.GUE,
    'Durò tredici giorni e portò all\'installazione della "linea rossa" telefonica.');
  e(1963, 'Martin Luther King pronuncia il discorso "I have a dream"', CAT.SOC,
    'La parte più famosa fu improvvisata: non era nel testo scritto.');
  e(1963, 'John Fitzgerald Kennedy viene assassinato a Dallas', CAT.GUE,
    'Fu il primo omicidio politico ripreso per intero da una cinepresa amatoriale.');
  e(1963, 'Il disastro del Vajont travolge Longarone', CAT.SOC,
    'Una frana nel bacino sollevò un\'onda che scavalcò la diga, rimasta intatta.');
  e(1964, 'La Ferrero lancia sul mercato la Nutella', CAT.SOC,
    'Nasceva da una crema alle nocciole inventata nel dopoguerra per risparmiare cacao.');
  e(1966, 'L\'alluvione di Firenze sommerge il centro storico', CAT.SOC,
    'Accorsero da tutto il mondo volontari poi ricordati come "angeli del fango".');
  e(1967, 'Christiaan Barnard esegue il primo trapianto di cuore umano', CAT.SCI,
    'Il paziente sopravvisse diciotto giorni.');
  e(1968, 'Le proteste studentesche dilagano in tutto il mondo', CAT.SOC,
    'A Parigi il maggio francese arrivò a bloccare l\'intero paese con uno sciopero generale.');
  e(1969, 'L\'Apollo 11 porta i primi uomini sulla Luna', CAT.SCI,
    'Il computer di bordo aveva meno memoria di una calcolatrice tascabile.');
  e(1969, 'Si tiene il festival di Woodstock', CAT.ART,
    'Erano attese cinquantamila persone: ne arrivarono oltre quattrocentomila.');
  e(1969, 'I Beatles suonano il loro ultimo concerto sul tetto della Apple a Londra', CAT.ART,
    'Lo interruppe la polizia dopo 42 minuti per le lamentele dei vicini.');
  e(1969, 'Viene inviato il primo messaggio sulla rete ARPANET', CAT.SCI,
    'Volevano scrivere "LOGIN": il sistema andò in crash dopo due lettere.');
  e(1969, 'La strage di piazza Fontana a Milano apre gli anni di piombo', CAT.GUE,
    'La bomba esplose nella sede della Banca Nazionale dell\'Agricoltura.');
  e(1970, 'Lo Statuto dei lavoratori entra in vigore in Italia', CAT.SOC,
    'Il suo articolo 18 sarebbe rimasto al centro del dibattito per decenni.');
  e(1972, 'Un commando palestinese colpisce le Olimpiadi di Monaco', CAT.SPO,
    'I Giochi furono sospesi per un giorno e poi ripresi.');
  e(1974, 'Lo scandalo Watergate costringe Richard Nixon alle dimissioni', CAT.GUE,
    'È l\'unico presidente americano ad aver lasciato l\'incarico in questo modo.');
  e(1975, 'Finisce la guerra del Vietnam con la caduta di Saigon', CAT.GUE,
    'Le ultime evacuazioni avvennero in elicottero dal tetto dell\'ambasciata americana.');
  e(1977, 'Esce nelle sale il primo film di Guerre Stellari', CAT.ART,
    'Nessuno ci credeva: la 20th Century Fox lasciò a Lucas i diritti sul merchandising.');
  e(1977, 'Muore Elvis Presley a Graceland', CAT.ART,
    'Aveva 42 anni e aveva venduto già centinaia di milioni di dischi.');
  e(1978, 'Le Brigate Rosse rapiscono e uccidono Aldo Moro', CAT.GUE,
    'Il sequestro durò 55 giorni.');
  e(1978, 'Nasce Louise Brown, la prima bambina concepita in provetta', CAT.SCI,
    'Il metodo valse il Nobel a Robert Edwards trent\'anni dopo.');

  /* ------------------------------------------------------- Novecento 1980-1999 */

  e(1980, 'Una bomba alla stazione di Bologna provoca 85 morti', CAT.GUE,
    'L\'orologio della stazione è ancora fermo sulle 10:25.');
  e(1980, 'John Lennon viene ucciso a New York', CAT.ART,
    'Poche ore prima aveva firmato un autografo al suo assassino.');
  e(1981, 'Alì Agca spara a papa Giovanni Paolo II in piazza San Pietro', CAT.GUE,
    'Il papa andò a incontrarlo in carcere due anni dopo.');
  e(1982, 'L\'Italia vince i Mondiali di calcio in Spagna', CAT.SPO,
    'Paolo Rossi segnò sei gol dopo due anni di squalifica.');
  e(1985, 'Esce in Giappone il primo Super Mario Bros.', CAT.SOC,
    'I baffi servivano a rendere riconoscibile il naso con pochissimi pixel.');
  e(1986, 'Il reattore di Chernobyl esplode durante un test di sicurezza', CAT.SOC,
    'La città di Pripyat fu evacuata solo il giorno seguente.');
  e(1986, 'Maradona segna la "mano de Dios" e il gol del secolo all\'Inghilterra', CAT.SPO,
    'I due gol arrivarono a quattro minuti di distanza l\'uno dall\'altro.');
  e(1989, 'Cade il Muro di Berlino', CAT.GUE,
    'Tutto partì da un annuncio confuso in conferenza stampa la sera del 9 novembre.');
  e(1989, 'La protesta di piazza Tienanmen viene repressa a Pechino', CAT.GUE,
    'La foto dell\'uomo davanti ai carri armati fu scattata da un balcone d\'albergo.');
  e(1989, 'Tim Berners-Lee propone al CERN il progetto del World Wide Web', CAT.SCI,
    'Il suo capo annotò sulla proposta: "vago, ma interessante".');
  e(1990, 'Il telescopio spaziale Hubble viene messo in orbita', CAT.SCI,
    'Aveva lo specchio difettoso: fu riparato in orbita tre anni dopo.');
  e(1991, 'L\'Unione Sovietica si dissolve', CAT.GUE,
    'La bandiera rossa fu ammainata dal Cremlino il giorno di Natale.');
  e(1991, 'Va online il primo sito web della storia', CAT.SCI,
    'Spiegava semplicemente che cosa fosse il World Wide Web.');
  e(1992, 'Le stragi di Capaci e via D\'Amelio uccidono Falcone e Borsellino', CAT.GUE,
    'Passarono meno di due mesi tra i due attentati.');
  e(1992, 'Il trattato di Maastricht dà vita all\'Unione Europea', CAT.SOC,
    'Fissò anche i criteri economici per la futura moneta unica.');
  e(1993, 'Esce nelle sale Jurassic Park di Steven Spielberg', CAT.ART,
    'I dinosauri in computer grafica appaiono in tutto per circa sei minuti.');
  e(1994, 'Nelson Mandela diventa presidente del Sudafrica', CAT.GUE,
    'Erano le prime elezioni aperte a tutta la popolazione dopo l\'apartheid.');
  e(1994, 'Ayrton Senna muore in un incidente al Gran Premio di Imola', CAT.SPO,
    'Da quel weekend la Formula 1 rivoluzionò le norme di sicurezza.');
  e(1996, 'Nasce la pecora Dolly, primo mammifero clonato da una cellula adulta', CAT.SCI,
    'Il nome è un omaggio alla cantante Dolly Parton.');
  e(1997, 'Lady Diana muore in un incidente d\'auto a Parigi', CAT.SOC,
    'Il suo funerale fu seguito in diretta da oltre due miliardi di persone.');
  e(1997, 'Esce il primo libro di Harry Potter', CAT.ART,
    'Dodici editori lo rifiutarono prima che qualcuno lo pubblicasse.');
  e(1997, 'Il film Titanic di James Cameron arriva nei cinema', CAT.ART,
    'Fu il primo film a incassare oltre un miliardo di dollari.');
  e(1998, 'Google viene fondata in un garage in California', CAT.SCI,
    'Il nome è una storpiatura di "googol", il numero 1 seguito da cento zeri.');
  e(1999, 'Esce nelle sale Matrix', CAT.ART,
    'L\'effetto "bullet time" fu ottenuto con oltre cento macchine fotografiche in fila.');

  /* --------------------------------------------------------- Duemila 2000-2015 */

  e(2000, 'Il bug del millennio mette in allarme i sistemi informatici mondiali', CAT.SCI,
    'Le riparazioni preventive costarono centinaia di miliardi di dollari.');
  e(2001, 'Gli attentati dell\'11 settembre colpiscono New York e Washington', CAT.GUE,
    'Lo spazio aereo statunitense restò chiuso per tre giorni.');
  e(2001, 'Il G8 di Genova finisce nel sangue', CAT.GUE,
    'Fu il vertice più contestato nella storia del gruppo.');
  e(2001, 'Apple presenta il primo iPod', CAT.SCI,
    'Lo slogan era "mille canzoni in tasca".');
  e(2002, 'L\'euro entra in circolazione come moneta contante', CAT.SOC,
    'Esisteva già dal 1999, ma solo per i pagamenti elettronici.');
  e(2003, 'Comincia la guerra in Iraq', CAT.GUE,
    'Le armi di distruzione di massa che la giustificavano non furono mai trovate.');
  e(2004, 'Uno tsunami nell\'Oceano Indiano provoca una catastrofe in tutto il sud-est asiatico', CAT.SOC,
    'Il terremoto che lo generò fece vibrare il pianeta misurabilmente per settimane.');
  e(2004, 'Mark Zuckerberg lancia Facebook dal campus di Harvard', CAT.SCI,
    'All\'inizio bisognava avere una mail universitaria per iscriversi.');
  e(2005, 'Viene fondato YouTube', CAT.SCI,
    'Il primo video caricato dura 19 secondi ed è girato allo zoo di San Diego.');
  e(2006, 'L\'Italia vince i Mondiali di calcio in Germania', CAT.SPO,
    'La finale con la Francia si decise ai rigori dopo la testata di Zidane.');
  e(2007, 'Steve Jobs presenta il primo iPhone', CAT.SCI,
    'Sul palco usò più prototipi diversi perché nessuno reggeva l\'intera demo.');
  e(2008, 'Il fallimento di Lehman Brothers scatena la crisi finanziaria globale', CAT.SOC,
    'Fu la più grande bancarotta della storia degli Stati Uniti.');
  e(2008, 'Barack Obama viene eletto primo presidente afroamericano degli Stati Uniti', CAT.GUE,
    'La sua campagna fu la prima a raccogliere fondi soprattutto online.');
  e(2009, 'Un terremoto devasta L\'Aquila', CAT.SOC,
    'Il centro storico rimase zona rossa per anni.');
  e(2010, 'I 33 minatori cileni vengono salvati dopo 69 giorni sottoterra', CAT.SOC,
    'Furono estratti uno alla volta con una capsula larga poco più di mezzo metro.');
  e(2011, 'Le primavere arabe scuotono il Nord Africa e il Medio Oriente', CAT.GUE,
    'Tutto cominciò dal gesto disperato di un venditore ambulante tunisino.');
  e(2011, 'Lo tsunami provoca il disastro nucleare di Fukushima', CAT.SOC,
    'L\'onda superò i quindici metri e scavalcò le barriere della centrale.');
  e(2013, 'Benedetto XVI rinuncia al pontificato', CAT.SOC,
    'Non accadeva da quasi seicento anni.');
  e(2013, 'Jorge Mario Bergoglio viene eletto papa con il nome di Francesco', CAT.SOC,
    'È il primo pontefice sudamericano e il primo gesuita.');
  e(2015, 'L\'accordo di Parigi sul clima viene firmato da quasi duecento paesi', CAT.SOC,
    'Fissa l\'obiettivo di contenere il riscaldamento entro 1,5 gradi.');
  e(2015, 'Milano ospita l\'Esposizione universale', CAT.SOC,
    'Il tema era "Nutrire il pianeta, energia per la vita".');

  /* --------------------------------------------------------- Duemila 2016-oggi */

  e(2016, 'Il referendum sulla Brexit decide l\'uscita del Regno Unito dall\'Unione Europea', CAT.GUE,
    'Il distacco effettivo arrivò solo quattro anni più tardi.');
  e(2016, 'Le onde gravitazionali vengono rilevate per la prima volta', CAT.SCI,
    'Einstein le aveva previste un secolo prima ritenendole impossibili da misurare.');
  e(2018, 'Crolla il ponte Morandi a Genova', CAT.SOC,
    'Il nuovo viadotto fu inaugurato meno di due anni dopo.');
  e(2019, 'Viene pubblicata la prima immagine di un buco nero', CAT.SCI,
    'Fu composta unendo i dati di otto radiotelescopi sparsi sul pianeta.');
  e(2019, 'Un incendio devasta il tetto della cattedrale di Notre-Dame a Parigi', CAT.ART,
    'La guglia crollata era un\'aggiunta ottocentesca, non medievale.');
  e(2020, 'L\'OMS dichiara la pandemia di COVID-19', CAT.SOC,
    'Nel giro di poche settimane metà della popolazione mondiale era in lockdown.');
  e(2021, 'Il rover Perseverance atterra su Marte', CAT.SCI,
    'Portava con sé Ingenuity, il primo elicottero a volare su un altro pianeta.');
  e(2021, 'L\'Italia vince il campionato europeo di calcio a Wembley', CAT.SPO,
    'La finale contro l\'Inghilterra si decise ai rigori.');
  e(2021, 'Viene lanciato il telescopio spaziale James Webb', CAT.SCI,
    'Il lancio era stato rinviato per oltre dieci anni.');
  e(2022, 'OpenAI rende pubblico ChatGPT', CAT.SCI,
    'Raggiunse un milione di utenti in cinque giorni.');
  e(2022, 'Muore la regina Elisabetta II dopo settant\'anni di regno', CAT.GUE,
    'È il regno più lungo della storia britannica.');
  e(2023, 'Il sommergibile Titan implode durante una discesa verso il relitto del Titanic', CAT.ESP,
    'Il segnale acustico dell\'implosione fu registrato subito, ma reso noto giorni dopo.');
  e(2024, 'Parigi ospita i Giochi olimpici estivi', CAT.SPO,
    'La cerimonia d\'apertura si tenne sulla Senna invece che in uno stadio.');
  e(2025, 'Muore papa Francesco', CAT.SOC,
    'Aveva guidato la Chiesa cattolica per dodici anni.');

  IQ.EVENTS = events;
  IQ.CATEGORIES = CAT;
})(window);
