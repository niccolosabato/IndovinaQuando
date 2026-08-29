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

  function cache() {
    [
      'screen-home', 'screen-round', 'screen-reveal', 'screen-results',
      'mode-list', 'btn-start', 'btn-reset', 'fresh-count', 'best-line',
      'round-index', 'round-total-count', 'round-mode', 'round-score', 'round-dots',
      'event-cat', 'event-text', 'hint-line',
      'guess-year', 'year-slider', 'slider-ticks', 'year-input', 'year-era',
      'year-jumps', 'btn-hint', 'btn-confirm',
      'reveal-index', 'reveal-verdict', 'reveal-total', 'reveal-year', 'reveal-event',
      'tl-band', 'tl-guess', 'tl-actual', 'tl-guess-tag', 'tl-actual-tag', 'tl-min', 'tl-max',
      'stat-guess', 'stat-gap', 'stat-points', 'score-fill', 'hint-used', 'reveal-note',
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

  function renderModes(selectedId, onSelect) {
    var list = el['mode-list'];
    list.innerHTML = '';
    IQ.Config.MODE_ORDER.forEach(function (id) {
      var mode = IQ.Config.MODES[id];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'mode-card';
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', String(id === selectedId));
      card.innerHTML =
        '<span class="mode-dot"></span>' +
        '<span><span class="mode-name"></span><br><span class="mode-blurb"></span></span>';
      card.querySelector('.mode-name').textContent = mode.label;
      card.querySelector('.mode-blurb').textContent = mode.blurb;
      card.addEventListener('click', function () { onSelect(id); });
      list.appendChild(card);
    });
  }

  function selectMode(selectedId) {
    var cards = el['mode-list'].querySelectorAll('.mode-card');
    IQ.Config.MODE_ORDER.forEach(function (id, i) {
      if (cards[i]) cards[i].setAttribute('aria-checked', String(id === selectedId));
    });
  }

  function renderHomeMeta(mode) {
    var fresh = IQ.Deck.freshCount(mode);
    var total = IQ.Deck.poolSize(mode);
    var best = IQ.Storage.best(mode.id);

    el['fresh-count'].innerHTML = fresh > 0
      ? 'Eventi mai visti in questo livello: <strong>' + fresh + '</strong> su ' + total + '.'
      : 'Hai già visto tutti i ' + total + ' eventi di questo livello: si ricomincia mescolando.';

    el['best-line'].innerHTML = best > 0
      ? 'Il tuo record in ' + mode.label + ': <strong>' + best + '</strong>/' + IQ.Config.MAX_GAME_SCORE + '.'
      : 'Nessun record ancora registrato in ' + mode.label + '.';
  }

  /* ──────────────────────────────────────────────────────────────── Round */

  function renderDots(current, total) {
    var box = el['round-dots'];
    box.innerHTML = '';
    for (var i = 0; i < total; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (i < current ? ' is-done' : (i === current ? ' is-current' : ''));
      box.appendChild(d);
    }
  }

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

  function renderJumps(mode, onJump) {
    var box = el['year-jumps'];
    box.innerHTML = '';
    mode.jumps.forEach(function (year) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-jump';
      b.textContent = Scale.formatYear(year);
      b.addEventListener('click', function () { onJump(year); });
      box.appendChild(b);
    });
  }

  /* Prepara la schermata per un nuovo round. */
  function renderRound(ctx) {
    el['round-index'].textContent = ctx.index + 1;
    el['round-total-count'].textContent = IQ.Config.ROUNDS;
    el['round-mode'].textContent = ctx.mode.label;
    el['round-score'].textContent = ctx.score;
    el['event-cat'].textContent = ctx.event.cat;
    el['event-text'].textContent = ctx.event.text;
    el['hint-line'].hidden = true;
    el['hint-line'].textContent = '';
    el['btn-hint'].disabled = false;
    el['btn-hint'].textContent = 'Indizio (max 75 punti)';
    renderDots(ctx.index, IQ.Config.ROUNDS);
  }

  /* Configura i controlli sul range della modalità (una volta per partita). */
  function setupControls(scale, mode, onJump) {
    var bc = scale.min < 0;
    renderTicks(scale);
    renderJumps(mode, onJump);
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

  function renderReveal(r) {
    el['reveal-index'].textContent = r.index + 1;
    el['reveal-verdict'].textContent = r.verdict;
    el['reveal-total'].textContent = r.total;
    el['reveal-year'].textContent = Scale.formatYear(r.event.year);
    el['reveal-event'].textContent = r.event.text;
    el['reveal-note'].textContent = r.event.note;

    el['stat-guess'].textContent = Scale.formatYear(r.guess);
    el['stat-gap'].textContent = r.diff === 0 ? '0' : (r.diff === 1 ? '1 anno' : r.diff + ' anni');
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

    /* Barra e conteggio dei punti partono da zero e salgono. */
    el['score-fill'].style.width = '0%';
    countUp(el['stat-points'], r.points, 700);
    global.setTimeout(function () {
      el['score-fill'].style.width = (r.points / IQ.Config.MAX_ROUND_SCORE * 100) + '%';
    }, 60);
  }

  function countUp(node, target, duration) {
    if (target === 0 || global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = target;
      return;
    }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var k = Math.min(1, (ts - start) / duration);
      node.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) global.requestAnimationFrame(step);
    }
    global.requestAnimationFrame(step);
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
    renderRound: renderRound,
    setupControls: setupControls,
    syncGuess: syncGuess,
    showHint: showHint,
    renderReveal: renderReveal,
    renderResults: renderResults
  };
})(window, document);
