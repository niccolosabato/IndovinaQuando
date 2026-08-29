/* Costanti di gioco e definizione dei livelli di difficoltà. */
(function (global) {
  'use strict';

  var IQ = global.IQ || (global.IQ = {});

  var CURRENT_YEAR = 2026;

  /* Ogni modalità dichiara:
   *   filter    quali eventi possono uscire
   *   segments  come lo slider distribuisce la sua corsa sugli anni
   *   tolerance moltiplicatore applicato alla tolleranza di base del punteggio
   */
  var MODES = {
    facile: {
      id: 'facile',
      label: 'Facile',
      blurb: 'Solo dal 1900 a oggi, con un margine di errore generoso.',
      filter: function (ev) { return ev.year >= 1900; },
      segments: [{ from: 1900, to: CURRENT_YEAR, w: 1 }],
      tolerance: 2
    },
    medio: {
      id: 'medio',
      label: 'Medio',
      blurb: 'Dal 1500 a oggi: cinque secoli da coprire.',
      filter: function (ev) { return ev.year >= 1500; },
      segments: [{ from: 1500, to: CURRENT_YEAR, w: 1 }],
      tolerance: 1.4
    },
    difficile: {
      id: 'difficile',
      label: 'Difficile',
      blurb: 'Tutta la storia, dalle piramidi a oggi. Anche avanti Cristo.',
      filter: function () { return true; },
      /* Pesi sbilanciati verso l'età contemporanea: senza questo accorgimento
       * gli ultimi 126 anni occuperebbero il 2% della corsa dello slider. */
      segments: [
        { from: -3000, to: 0, w: 1 },
        { from: 0, to: 1000, w: 1 },
        { from: 1000, to: 1500, w: 1 },
        { from: 1500, to: 1900, w: 1.5 },
        { from: 1900, to: CURRENT_YEAR, w: 1.5 }
      ],
      tolerance: 1
    }
  };

  IQ.Config = {
    ROUNDS: 5,
    MAX_ROUND_SCORE: 100,
    MAX_GAME_SCORE: 500,
    /* Un indizio rivela il secolo e riduce a 75 il massimo del round. */
    HINT_FACTOR: 0.75,
    CURRENT_YEAR: CURRENT_YEAR,
    MODES: MODES,
    MODE_ORDER: ['facile', 'medio', 'difficile'],
    DEFAULT_MODE: 'medio',

    mode: function (id) {
      return MODES[id] || MODES[this.DEFAULT_MODE];
    }
  };
})(window);
