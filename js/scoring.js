/* Calcolo del punteggio di un round.
 *
 * Il margine concesso dipende da due cose: quanto è antico l'evento (fissare il
 * 1969 al decennio è ragionevole, fissare il 1750 a.C. no) e quale difficoltà
 * ha scelto il giocatore. Dentro quel margine il punteggio scende con una curva
 * dolce; oltre, vale zero.
 */
(function (global) {
  'use strict';

  var IQ = global.IQ || (global.IQ = {});

  var ERA_TOLERANCE = [
    { since: 1900, years: 15 },
    { since: 1800, years: 20 },
    { since: 1500, years: 30 },
    { since: 1000, years: 60 },
    { since: 0, years: 120 },
    { since: -Infinity, years: 250 }
  ];

  /* La curva vecchia — esponente 1,5 e zero secco fuori dal margine — puniva due
   * volte: già dentro la tolleranza scendeva più in fretta di una retta, e un
   * anno oltre il limite valeva quanto sbagliare di un millennio. Ora dentro il
   * margine si scende piano (esponente < 1) fino a NEAR_FLOOR, e fuori resta una
   * coda che si spegne a OUTER volte la tolleranza: chi azzecca il secolo senza
   * centrare il decennio porta a casa qualcosa. */
  var CURVE = 0.9;
  var NEAR_FLOOR = 40;
  var OUTER = 3;

  function baseTolerance(year) {
    for (var i = 0; i < ERA_TOLERANCE.length; i++) {
      if (year >= ERA_TOLERANCE[i].since) return ERA_TOLERANCE[i].years;
    }
    return 250;
  }

  function maxDiff(year, mode) {
    return Math.max(1, Math.round(baseTolerance(year) * mode.tolerance));
  }

  /* Restituisce un intero fra 0 e 100 (75 se è stato chiesto l'indizio). */
  function compute(guess, actual, mode, usedHint) {
    var cfg = IQ.Config;
    var diff = Math.abs(guess - actual);
    var limit = maxDiff(actual, mode);
    var points;

    /* I due rami si saldano: a diff = limit valgono entrambi NEAR_FLOOR. */
    if (diff === 0) {
      points = cfg.MAX_ROUND_SCORE;
    } else if (diff < limit) {
      points = NEAR_FLOOR + (cfg.MAX_ROUND_SCORE - NEAR_FLOOR) *
               Math.pow(1 - diff / limit, CURVE);
    } else if (diff < limit * OUTER) {
      points = NEAR_FLOOR * (1 - (diff - limit) / (limit * (OUTER - 1)));
    } else {
      points = 0;
    }
    points = Math.round(points);

    if (usedHint) points = Math.round(points * cfg.HINT_FACTOR);
    return IQ.Scale.clamp(points, 0, cfg.MAX_ROUND_SCORE);
  }

  /* Commento mostrato insieme al punteggio del round. Le soglie seguono la curva:
   * NEAR_FLOOR punti significa "giusto sul bordo del margine", non "vicino". */
  function verdict(points, diff) {
    if (diff === 0) return 'Anno esatto!';
    if (points >= 90) return 'Quasi perfetto';
    if (points >= 70) return 'Molto vicino';
    if (points >= NEAR_FLOOR) return 'Ci sei andato vicino';
    if (points > 0) return 'Un po\' lontano';
    return 'Fuori strada';
  }

  /* Giudizio finale sulla partita, su 500. Le fasce sono alzate insieme alla
   * curva: con quella vecchia 450 punti erano un'impresa, con questa no. */
  function rating(total) {
    var pct = total / IQ.Config.MAX_GAME_SCORE;
    if (pct >= 0.92) return { title: 'Memoria storica', text: 'Sei praticamente un almanacco vivente.' };
    if (pct >= 0.80) return { title: 'Ottimo storico', text: 'Le date le hai in mano.' };
    if (pct >= 0.62) return { title: 'Buon conoscitore', text: 'Solide basi, qualche secolo da ripassare.' };
    if (pct >= 0.40) return { title: 'Apprendista', text: 'Il periodo lo intuisci, l\'anno ancora no.' };
    if (pct > 0) return { title: 'Turista del tempo', text: 'Un ripasso non farebbe male.' };
    return { title: 'Fuori dal tempo', text: 'Riprova: la prossima andrà meglio.' };
  }

  IQ.Scoring = {
    compute: compute,
    maxDiff: maxDiff,
    baseTolerance: baseTolerance,
    verdict: verdict,
    rating: rating
  };
})(window);
