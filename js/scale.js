/* Mappatura fra la posizione dello slider (0 → 1) e l'anno.
 *
 * La scala è definita da segmenti pesati: ogni segmento copre un intervallo di
 * anni e riceve una fetta della corsa proporzionale al proprio peso. Con un solo
 * segmento la scala è lineare; con più segmenti si può dare più spazio alle
 * epoche recenti, dove la precisione conta di più.
 */
(function (global) {
  'use strict';

  var IQ = global.IQ || (global.IQ = {});

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  function create(segments) {
    var total = 0;
    var i;
    for (i = 0; i < segments.length; i++) total += segments[i].w;

    var bands = [];
    var acc = 0;
    for (i = 0; i < segments.length; i++) {
      var s = segments[i];
      var p0 = acc / total;
      acc += s.w;
      bands.push({ from: s.from, to: s.to, p0: p0, p1: acc / total });
    }

    var min = bands[0].from;
    var max = bands[bands.length - 1].to;

    return {
      min: min,
      max: max,
      bands: bands,

      /* posizione 0→1 nell'anno corrispondente */
      toYear: function (p) {
        p = clamp(p, 0, 1);
        var b = bands[bands.length - 1];
        for (var i = 0; i < bands.length; i++) {
          if (p <= bands[i].p1) { b = bands[i]; break; }
        }
        var span = b.p1 - b.p0;
        var k = span === 0 ? 0 : (p - b.p0) / span;
        return Math.round(b.from + k * (b.to - b.from));
      },

      /* anno nella posizione 0→1 corrispondente */
      toPos: function (year) {
        year = clamp(year, min, max);
        var b = bands[bands.length - 1];
        for (var i = 0; i < bands.length; i++) {
          if (year <= bands[i].to) { b = bands[i]; break; }
        }
        var span = b.to - b.from;
        var k = span === 0 ? 0 : (year - b.from) / span;
        return b.p0 + k * (b.p1 - b.p0);
      },

      clampYear: function (year) {
        return clamp(Math.round(year), min, max);
      },

      /* Tacche sotto lo slider: i confini dei segmenti, ciascuno con la sua
       * posizione reale sulla barra. I pesi non sono uniformi, quindi le
       * etichette vanno collocate dove cadono davvero, non a passo fisso. */
      ticks: function () {
        var out = [{ year: bands[0].from, pos: 0 }];
        for (var i = 0; i < bands.length; i++) {
          out.push({ year: bands[i].to, pos: bands[i].p1 });
        }
        return out;
      }
    };
  }

  /* "44 a.C." / "1969" — usato ovunque si mostri un anno all'utente. */
  function formatYear(year) {
    return year < 0 ? Math.abs(year) + ' a.C.' : String(year);
  }

  /* "V secolo a.C." / "XX secolo" — per l'indizio. */
  function formatCentury(year) {
    var n = year < 0
      ? Math.floor((Math.abs(year) - 1) / 100) + 1
      : Math.floor((year - 1) / 100) + 1;
    return roman(n) + ' secolo' + (year < 0 ? ' a.C.' : '');
  }

  function roman(n) {
    var table = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
      [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    var out = '';
    for (var i = 0; i < table.length; i++) {
      while (n >= table[i][0]) { out += table[i][1]; n -= table[i][0]; }
    }
    return out;
  }

  /* "12 anni" / "un anno" / "esatto" */
  function formatGap(diff) {
    if (diff === 0) return 'in pieno';
    if (diff === 1) return 'di un anno';
    return 'di ' + diff + ' anni';
  }

  IQ.Scale = {
    create: create,
    clamp: clamp,
    formatYear: formatYear,
    formatCentury: formatCentury,
    formatGap: formatGap
  };
})(window);
