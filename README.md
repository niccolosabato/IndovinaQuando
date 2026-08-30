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
- Fuori dal margine non si va subito a zero: resta una coda di punti che si
  spegne a tre volte il margine, così azzeccare il secolo vale comunque qualcosa.
- L'**indizio** rivela il secolo, ma abbassa il massimo di quel round a 75 punti.

### Livelli

| Livello   | Eventi         | Slider       |
|-----------|----------------|--------------|
| Facile    | dal 1900 a oggi| lineare, margine doppio |
| Medio     | dal 1500 a oggi| lineare |
| Difficile | tutta la storia| scala non lineare, anche anni a.C. |

### Come si inserisce l'anno

Quattro modi, tutti sincronizzati fra loro:

1. lo **slider**, con le tacche delle epoche sotto;
2. il campo **anno esatto**, con selettore a.C./d.C. nel livello Difficile;
3. i pulsanti **−100 / −10 / −1 / +1 / +10 / +100**;
4. la **tastiera**: `←` `→` per un anno, con `Maiusc` per dieci, `Invio` per confermare.

L'interfaccia non lo dice: le scorciatoie si scoprono provandole, e la riga che le
elencava era l'ennesima istruzione da leggere prima di giocare.

## Struttura

```
IndovinaQuando/
├── index.html          pagina unica, quattro schermate
├── assets/
│   └── favicon.svg
├── css/
│   ├── base.css        variabili e tipografia
│   ├── layout.css      impalcatura delle schermate
│   └── components.css  bottoni, slider, timeline, riepilogo
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

## Aspetto

Il gioco è impaginato come la pagina di una cronaca, letta in due luci: **notte**
(il tema predefinito, a lume di candela) e **carta**. Si cambia dall'interruttore
in home e la scelta resta in `localStorage`; il predefinito è la notte a
prescindere dal tema di sistema.

Cambia l'illuminazione, non l'impaginato: in entrambi i temi i due accenti hanno
gli stessi ruoli — `--quill` è **quello che scrivi tu** (l'anno mentre lo cerchi),
`--seal` è **quello che dice la storia** (l'anno vero, il punteggio finale). Niente
riquadri né ombre: dove serve separare c'è un filetto, doppio nei due punti che
fanno da testata.

Il tema salvato viene applicato da un piccolo script *nel `<head>`* di
`index.html` — l'unico del progetto a stare lassù. Spostandolo in fondo con gli
altri, chi ha scelto la carta vedrebbe un lampo di notte a ogni caricamento.

I caratteri sono **EB Garamond** e **Alegreya Sans**, caricati da Google Fonts.
Se non arrivano — offline, o aprendo la pagina da `file://` — si scende su
Georgia e sul sans di sistema: cambia l'eleganza, non la leggibilità.

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
- la curiosità è la **prima frase intera** del riassunto della voce Wikipedia
  collegata — preferendo la pagina dedicata all'evento invece di quella generica —
  seguita dal link alla voce per chi vuole leggere il resto;
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
punti      = scarto = 0             →  100
             scarto < tolleranza    →  40 + 60 × (1 − scarto/tolleranza)^0,9
             scarto < 3×tolleranza  →  40 × (1 − (scarto−tolleranza)/(2×tolleranza))
             oltre                  →  0
```

I due rami si saldano: sul limite della tolleranza valgono entrambi 40. Dentro il
margine l'esponente è minore di 1, quindi gli errori piccoli costano poco; fuori
resta una coda lineare che arriva a zero solo a tre volte il margine.

Tolleranze per epoca: 15 anni dal 1900, 20 dal 1800, 30 dal 1500, 60 dal 1000,
120 dall'anno 0, 250 per gli anni a.C. Moltiplicatori: ×2 Facile, ×1,4 Medio,
×1 Difficile.

Nel livello Medio un evento del 1969 ha 21 anni di margine: 5 anni di scarto
valgono 87 punti, 10 ne valgono 74, 21 ne valgono 40 e si arriva a zero a 63.
