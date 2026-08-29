/* ui.js — tutto ciò che tocca il DOM.
 *
 * main.js tiene lo stato della partita e chiama queste funzioni passando i dati
 * già pronti: qui dentro non si decide nulla sul gioco, si disegna soltanto.
 */
(function (global, document) {
  'use strict';

  var IQ = global.IQ || (global.IQ = {});
  var Scale = IQ.Scale;

  function $(id) { return document.getElementById(id); }

  var el = {};
  var SCREENS = ['home', 'round', 'reveal', 'results'];

  /* I round si contano in numeri romani, come i capitoli di una cronaca; i punti
   * restano in cifre arabe, perché quelli si leggono e non si contemplano. */
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  function roman(n) {
    return ROMAN[n] || String(n);
  }

  function cache() {
    [
      'screen-home', 'screen-round', 'screen-reveal', 'screen-results',
      'mode-list', 'mode-blurb', 'btn-start', 'btn-reset', 'btn-theme', 'fresh-count', 'best-line',
      'round-index', 'round-total-count', 'round-score',
      'event-text', 'hint-line',
      'guess-year', 'year-slider', 'slider-ticks', 'year-input', 'year-era',
      'btn-hint', 'btn-confirm',
      'reveal-index', 'reveal-total-count', 'reveal-total', 'reveal-year', 'reveal-event',
      'tl-band', 'tl-guess', 'tl-actual', 'tl-guess-tag', 'tl-actual-tag', 'tl-min', 'tl-max',
      'reveal-stats', 'hint-used', 'reveal-note',
      'btn-next',
      'final-points', 'final-title', 'final-text', 'final-record', 'recap',
      'btn-again', 'btn-home'
    ].forEach(function (id) {
      el[id] = $(id);
    });
  }

  function show(name) {
    SCREENS.forEach(function (s) {
      el['screen-' + s].hidden = (s !== name);
    });
    global.scrollTo(0, 0);
  }

  /* ───────────────────────────────────────────────────────────────── Home */

  /* Tre voci in fila; la descrizione è una riga sola, che segue la selezione. */
  function renderModes(selectedId, onSelect) {
    var list = el['mode-list'];
    list.innerHTML = '';
    IQ.Config.MODE_ORDER.forEach(function (id) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'mode-item';
      item.setAttribute('role', 'radio');
      item.setAttribute('aria-checked', String(id === selectedId));
      item.textContent = IQ.Config.MODES[id].label;
      item.addEventListener('click', function () { onSelect(id); });
      list.appendChild(item);
    });
    selectMode(selectedId);
  }

  function selectMode(selectedId) {
    var items = el['mode-list'].querySelectorAll('.mode-item');
    IQ.Config.MODE_ORDER.forEach(function (id, i) {
      if (items[i]) items[i].setAttribute('aria-checked', String(id === selectedId));
    });
    el['mode-blurb'].textContent = IQ.Config.mode(selectedId).blurb;
  }

  function renderHomeMeta(mode) {
    var fresh = IQ.Deck.freshCount(mode);
    var total = IQ.Deck.poolSize(mode);
    var best = IQ.Storage.best(mode.id);
    var remote = (IQ.Remote && IQ.Remote.events().length) || 0;

    /* Con gli eventi da Wikipedia il totale cresce a ogni partita: un "N su TOTAL"
     * darebbe un denominatore che cambia sotto gli occhi. Il messaggio del mazzo
     * chiuso resta per quando si gioca con i soli eventi locali (offline). */
    el['fresh-count'].innerHTML = remote > 0
      ? 'Eventi sempre nuovi da Wikipedia: <strong>' + fresh + '</strong> pronti in questo livello.'
      : (fresh > 0
        ? 'Eventi mai visti in questo livello: <strong>' + fresh + '</strong> su ' + total + '.'
        : 'Hai già visto tutti i ' + total + ' eventi di questo livello: si ricomincia mescolando.');

    el['best-line'].innerHTML = best > 0
      ? 'Il tuo record in ' + mode.label + ': <strong>' + best + '</strong>/' + IQ.Config.MAX_GAME_SCORE + '.'
      : 'Nessun record ancora registrato in ' + mode.label + '.';
  }

  /* La notte è il tema predefinito, quindi l'attributo si mette solo per la
   * carta: senza attributo valgono le variabili di :root. */
  function applyTheme(name) {
    var paper = name === 'carta';
    if (paper) document.documentElement.dataset.theme = 'carta';
    else delete document.documentElement.dataset.theme;

    el['btn-theme'].textContent = paper ? 'Leggi a lume di candela' : 'Leggi su carta';

    var meta = document.getElementById('theme-color');
    if (meta) meta.setAttribute('content', paper ? '#f5efe2' : '#16130f');
  }

  /* Attesa del primo scaricamento: il pulsante si spegne invece di sembrare rotto. */
  function setLoading(on) {
    el['btn-start'].disabled = on;
    el['btn-start'].textContent = on ? 'Carico eventi…' : 'Inizia partita';
  }

  /* ──────────────────────────────────────────────────────────────── Round */

  function renderTicks(scale) {
    var box = el['slider-ticks'];
    box.innerHTML = '';
    scale.ticks().forEach(function (tick) {
      var s = document.createElement('span');
      s.textContent = Scale.formatYear(tick.year);
      /* Gli estremi si ancorano al bordo, gli intermedi si centrano sul punto. */
      if (tick.pos <= 0.001) {
        s.style.left = '0';
      } else if (tick.pos >= 0.999) {
        s.style.right = '0';
      } else {
        s.style.left = (tick.pos * 100) + '%';
        s.style.transform = 'translateX(-50%)';
      }
      box.appendChild(s);
    });
  }

  /* Prepara la schermata per un nuovo round. */
  function renderRound(ctx) {
    el['round-index'].textContent = roman(ctx.index + 1);
    el['round-total-count'].textContent = roman(IQ.Config.ROUNDS);
    el['round-score'].textContent = ctx.score;
    el['event-text'].textContent = ctx.event.text;
    el['hint-line'].hidden = true;
    el['hint-line'].textContent = '';
    el['btn-hint'].disabled = false;
    el['btn-hint'].textContent = 'Indizio (max 75 punti)';
  }

  /* Configura i controlli sul range della modalità (una volta per partita). */
  function setupControls(scale) {
    var bc = scale.min < 0;
    renderTicks(scale);
    el['year-era'].hidden = !bc;
    el['year-input'].min = bc ? 0 : scale.min;
    el['year-input'].max = bc ? Math.max(Math.abs(scale.min), scale.max) : scale.max;
  }

  /* Riallinea tutti i controlli sull'anno corrente. */
  function syncGuess(year, scale) {
    el['guess-year'].textContent = Scale.formatYear(year);
    el['year-slider'].value = String(Math.round(scale.toPos(year) * 1000));
    el['year-slider'].setAttribute('aria-valuetext', Scale.formatYear(year));
    if (!el['year-era'].hidden) {
      el['year-era'].value = year < 0 ? '-1' : '1';
      el['year-input'].value = String(Math.abs(year));
    } else {
      el['year-input'].value = String(year);
    }
  }

  function showHint(text) {
    el['hint-line'].textContent = 'Indizio: l\'evento è del ' + text + '.';
    el['hint-line'].hidden = false;
    el['btn-hint'].disabled = true;
    el['btn-hint'].textContent = 'Indizio usato';
  }

  /* ─────────────────────────────────────────────────────────── Rivelazione */

  function gapLabel(diff) {
    if (diff === 0) return 'in pieno';
    return diff === 1 ? '1 anno di scarto' : diff + ' anni di scarto';
  }

  function renderReveal(r) {
    el['reveal-index'].textContent = roman(r.index + 1);
    el['reveal-total-count'].textContent = roman(IQ.Config.ROUNDS);
    el['reveal-total'].textContent = r.total;
    el['reveal-year'].textContent = Scale.formatYear(r.event.year);
    el['reveal-event'].textContent = r.event.text;
    el['reveal-note'].textContent = r.event.note;

    /* Verdetto, risposta, scarto e punti stanno in una riga sola: erano tre
     * riquadri più un badge per dire quattro cose corte. */
    el['reveal-stats'].innerHTML = r.verdict + ' · hai detto <strong>' +
      Scale.formatYear(r.guess) + '</strong> · ' + gapLabel(r.diff) +
      ' · <span class="points' + (r.points === 0 ? ' is-zero' : '') + '">' +
      r.points + '</span> punti';
    el['hint-used'].hidden = !r.usedHint;

    /* Marcatori sulla striscia temporale. */
    var pg = r.scale.toPos(r.guess) * 100;
    var pa = r.scale.toPos(r.event.year) * 100;
    el['tl-guess'].style.left = pg + '%';
    el['tl-actual'].style.left = pa + '%';
    el['tl-band'].style.left = Math.min(pg, pa) + '%';
    el['tl-band'].style.width = Math.abs(pa - pg) + '%';
    el['tl-guess-tag'].textContent = 'tu · ' + Scale.formatYear(r.guess);
    el['tl-actual-tag'].textContent = Scale.formatYear(r.event.year);
    el['tl-min'].textContent = Scale.formatYear(r.scale.min);
    el['tl-max'].textContent = Scale.formatYear(r.scale.max);
  }

  /* ───────────────────────────────────────────────────────────  Risultati */

  function renderResults(res) {
    el['final-points'].textContent = res.total;
    el['final-title'].textContent = res.rating.title;
    el['final-text'].textContent = res.rating.text;
    el['final-record'].hidden = !res.isRecord;

    var list = el['recap'];
    list.innerHTML = '';
    res.rounds.forEach(function (r) {
      var li = document.createElement('li');
      li.className = 'recap-row' + (r.points === 0 ? ' is-zero' : '');

      var text = document.createElement('span');
      text.className = 'recap-text';
      text.textContent = r.event.text;

      var years = document.createElement('span');
      years.className = 'recap-years';
      years.innerHTML = 'tua risposta ' + Scale.formatYear(r.guess) +
        ' · anno reale <b>' + Scale.formatYear(r.event.year) + '</b>' +
        (r.usedHint ? ' · indizio' : '');

      var pts = document.createElement('span');
      pts.className = 'recap-points';
      pts.textContent = r.points;

      li.appendChild(text);
      li.appendChild(years);
      li.appendChild(pts);
      list.appendChild(li);
    });
  }

  IQ.UI = {
    el: el,
    init: cache,
    show: show,
    renderModes: renderModes,
    selectMode: selectMode,
    renderHomeMeta: renderHomeMeta,
    applyTheme: applyTheme,
    setLoading: setLoading,
    renderRound: renderRound,
    setupControls: setupControls,
    syncGuess: syncGuess,
    showHint: showHint,
    renderReveal: renderReveal,
    renderResults: renderResults
  };
})(window, document);
