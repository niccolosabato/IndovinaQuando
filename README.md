# IndovinaQuando

Gioco web: leggi un evento storico e indovina in che anno è successo.
**5 round a partita, fino a 100 punti a round, 500 punti in palio.**

## Come si gioca

Apri https://niccolosabato.github.io/IndovinaQuando/

## Regole

- Ogni partita propone **5 eventi**, sempre diversi da quelli già usciti.
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
│   └── events.js       database degli eventi storici
└── js/
    ├── config.js       livelli di difficoltà e costanti
    ├── scale.js        mappatura slider ↔ anno, formattazione degli anni
    ├── scoring.js      calcolo del punteggio
    ├── storage.js      eventi già visti e record (localStorage)
    ├── deck.js         estrazione dei 5 eventi della partita
    ├── ui.js           rendering del DOM
    └── main.js         stato della partita
```

Gli script sono classici (niente ES modules) e condividono il namespace globale
`window.IQ`: è la ragione per cui il gioco funziona anche aperto da `file://`,
dove i moduli verrebbero bloccati dalle regole CORS del browser.

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
