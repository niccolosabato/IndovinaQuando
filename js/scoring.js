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

    if (diff === 0) {
      points = cfg.MAX_ROUND_SCORE;
    } else if (diff >= limit) {
      points = 0;
    } else {
      points = Math.round(cfg.MAX_ROUND_SCORE * Math.pow(1 - diff / limit, 1.5));
    }

    if (usedHint) points = Math.round(points * cfg.HINT_FACTOR);
    return IQ.Scale.clamp(points, 0, cfg.MAX_ROUND_SCORE);
  }

  /* Commento mostrato insieme al punteggio del round. */
  function verdict(points, diff) {
    if (diff === 0) return 'Anno esatto!';
    if (points >= 85) return 'Quasi perfetto';
    if (points >= 60) return 'Molto vicino';
    if (points >= 30) return 'Ci sei andato vicino';
    if (points > 0) return 'Un po\' lontano';
    return 'Fuori strada';
  }

  /* Giudizio finale sulla partita, su 500. */
  function rating(total) {
    var pct = total / IQ.Config.MAX_GAME_SCORE;
    if (pct >= 0.9) return { title: 'Memoria storica', text: 'Sei praticamente un almanacco vivente.' };
    if (pct >= 0.75) return { title: 'Ottimo storico', text: 'Le date le hai in mano.' };
    if (pct >= 0.55) return { title: 'Buon conoscitore', text: 'Solide basi, qualche secolo da ripassare.' };
    if (pct >= 0.35) return { title: 'Apprendista', text: 'Il periodo lo intuisci, l\'anno ancora no.' };
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
