# IndovinaQuando

Gioco web: leggi un evento storico e indovina in che anno è successo.
**5 round a partita, fino a 100 punti a round, 500 punti in palio.**

## Come si gioca

Apri https://niccolosabato.github.io/IndovinaQuando/

## Regole

- Ogni partita propone **5 eventi**, presi da Wikipedia e sempre diversi da
  quelli già usciti.
- L'anno esatto vale **100 punti**; poi il punteggio scende man mano che ci si allontana.
- Il margine di errore concesso dipende dall'epoca (per un evento del 1969 sono
  pochi anni, per uno del 1750 a.C. molti di più) e dal livello scelto.
- L'**indizio** rivela il secolo, ma abbassa il massimo di quel round a 75 punti.

### Livelli

| Livello   | Eventi         | Slider       |
|-----------|----------------|--------------|
| Facile    | dal 1900 a oggi| lineare, margine doppio |
| Medio     | dal 1500 a oggi| lineare |
| Difficile | tutta la storia| scala non lineare, anche anni a.C. |

### Come si inserisce l'anno

Cinque modi, tutti sincronizzati fra loro:

1. lo **slider**, con le tacche delle epoche sotto;
2. il campo **anno esatto**, con selettore a.C./d.C. nel livello Difficile;
3. i pulsanti **−100 / −10 / −1 / +1 / +10 / +100**;
4. i **salti rapidi** a un'epoca;
5. la **tastiera**: `←` `→` per un anno, con `Maiusc` per dieci, `Invio` per confermare.

## Struttura

```
IndovinaQuando/
├── index.html          pagina unica, quattro schermate
├── assets/
│   └── favicon.svg
├── css/
│   ├── base.css        variabili, tipografia, sfondo
│   ├── layout.css      impalcatura delle schermate
│   └── components.css  bottoni, slider, card, timeline, riepilogo
├── data/
│   └── events.js       mazzo curato di riserva, scritto a mano
└── js/
    ├── config.js       livelli di difficoltà e costanti
    ├── scale.js        mappatura slider ↔ anno, formattazione degli anni
    ├── scoring.js      calcolo del punteggio
    ├── storage.js      eventi già visti e record (localStorage)
    ├── remote.js       eventi scaricati da Wikipedia
    ├── deck.js         estrazione dei 5 eventi della partita
    ├── ui.js           rendering del DOM
    └── main.js         stato della partita
```

Gli script sono classici (niente ES modules) e condividono il namespace globale
`window.IQ`: è la ragione per cui il gioco funziona anche aperto da `file://`,
dove i moduli verrebbero bloccati dalle regole CORS del browser.

## Da dove arrivano gli eventi

Il grosso lo scarica `js/remote.js` dall'API *onthisday* di Wikimedia in italiano:

```
https://api.wikimedia.org/feed/v1/wikipedia/it/onthisday/events/MM/DD
```

È pubblica — nessuna chiave, CORS aperto — quindi basta il sito statico, senza
alcun backend. A ogni apertura si pescano quattro giorni di calendario a caso
(un'ottantina di eventi grezzi), così il mazzo non finisce mai e le partite non
si somigliano. Quello che arriva viene ripulito prima di entrare in gioco:

- si scartano i testi troppo corti o troppo lunghi;
- si scarta **qualsiasi testo che contenga un anno**, che regalerebbe la risposta;
- la curiosità è il riassunto della voce Wikipedia collegata, preferendo la pagina
  dedicata all'evento invece di quella generica;
- la categoria è dedotta dalle parole del testo.

Gli eventi scaricati restano in cache su `localStorage` (fino a 600). I 197 eventi
scritti a mano in `data/events.js` restano nel mazzo insieme a quelli remoti e
reggono il gioco da soli quando la rete manca o quando la pagina è aperta da
`file://`, dove il browser vieta le richieste verso un'altra origine.

## Aggiungere un evento

In `data/events.js` basta una riga — l'id viene generato da solo:

```js
e(1969, "L'Apollo 11 porta i primi uomini sulla Luna", CAT.SCI,
  'Il computer di bordo aveva meno memoria di una calcolatrice tascabile.');
```

L'anno è negativo per gli eventi avanti Cristo (`-44` = 44 a.C.). L'ultimo
parametro è la curiosità mostrata dopo la risposta.

## Punteggio nel dettaglio

```
tolleranza = tolleranzaEpoca × moltiplicatoreLivello
scarto     = |anno indovinato − anno reale|
punti      = scarto = 0  →  100
             scarto ≥ tolleranza  →  0
             altrimenti  →  100 × (1 − scarto/tolleranza)^1.5
```

Tolleranze per epoca: 15 anni dal 1900, 20 dal 1800, 30 dal 1500, 60 dal 1000,
120 dall'anno 0, 250 per gli anni a.C. Moltiplicatori: ×2 Facile, ×1,4 Medio,
×1 Difficile.
