/* main.js — stato della partita e collegamento dei controlli.
 *
 * Flusso: home → (round → rivelazione) × 5 → risultati.
 */
(function (global, document) {
  'use strict';

  var IQ = global.IQ;
  var Cfg = IQ.Config;
  var UI = IQ.UI;
  var Scale = IQ.Scale;

  var state = {
    modeId: Cfg.DEFAULT_MODE,
    mode: null,
    scale: null,
    deck: [],
    index: 0,
    guess: 0,
    usedHint: false,
    rounds: [],
    total: 0,
    theme: 'notte',    // notte | carta
    phase: 'home'      // home | round | reveal | results
  };

  /* ─────────────────────────────────────────────────────────────── Partita */

  function goHome() {
    state.phase = 'home';
    state.mode = Cfg.mode(state.modeId);
    UI.selectMode(state.modeId);
    UI.renderHomeMeta(state.mode);
    UI.show('home');
  }

  /* L'unico punto asincrono del flusso: prima di dare le carte si aspetta che ci
   * siano abbastanza eventi mai visti. `ensure` richiama comunque, anche se la
   * rete è andata male — in quel caso si gioca con il mazzo locale. */
  function startGame() {
    state.mode = Cfg.mode(state.modeId);

    if (!IQ.Remote) { deal(); return; }

    UI.setLoading(true);
    IQ.Remote.ensure(state.mode, Cfg.ROUNDS, function () {
      UI.setLoading(false);
      deal();
    });
  }

  function deal() {
    state.scale = Scale.create(state.mode.segments);
    state.deck = IQ.Deck.draw(state.mode, Cfg.ROUNDS);
    state.index = 0;
    state.rounds = [];
    state.total = 0;

    UI.setupControls(state.scale);
    startRound();
  }

  function startRound() {
    state.phase = 'round';
    state.usedHint = false;

    UI.renderRound({
      index: state.index,
      mode: state.mode,
      score: state.total,
      event: currentEvent()
    });

    /* Si parte dal centro della scala, non da un anno che suggerisca qualcosa. */
    setGuess(state.scale.toYear(0.5));
    UI.show('round');
  }

  function currentEvent() {
    return state.deck[state.index];
  }

  function setGuess(year) {
    state.guess = state.scale.clampYear(year);
    UI.syncGuess(state.guess, state.scale);
  }

  function nudge(delta) {
    setGuess(state.guess + delta);
  }

  function useHint() {
    if (state.phase !== 'round' || state.usedHint) return;
    state.usedHint = true;
    UI.showHint(Scale.formatCentury(currentEvent().year));
  }

  function confirmGuess() {
    if (state.phase !== 'round') return;

    var ev = currentEvent();
    var diff = Math.abs(state.guess - ev.year);
    var points = IQ.Scoring.compute(state.guess, ev.year, state.mode, state.usedHint);

    state.total += points;
    state.rounds.push({
      event: ev,
      guess: state.guess,
      diff: diff,
      points: points,
      usedHint: state.usedHint
    });

    state.phase = 'reveal';
    UI.renderReveal({
      index: state.index,
      event: ev,
      guess: state.guess,
      diff: diff,
      points: points,
      total: state.total,
      usedHint: state.usedHint,
      verdict: IQ.Scoring.verdict(points, diff),
      scale: state.scale
    });
    UI.show('reveal');
  }

  function nextRound() {
    if (state.phase !== 'reveal') return;
    state.index++;
    if (state.index >= state.deck.length) finish();
    else startRound();
  }

  function finish() {
    state.phase = 'results';
    var isRecord = IQ.Storage.saveBest(state.modeId, state.total) && state.total > 0;
    UI.renderResults({
      total: state.total,
      rating: IQ.Scoring.rating(state.total),
      rounds: state.rounds,
      isRecord: isRecord
    });
    UI.show('results');
  }

  /* ────────────────────────────────────────────────────────────  Controlli */

  function readExactInput(commit) {
    var el = UI.el;
    var raw = parseInt(el['year-input'].value, 10);
    if (isNaN(raw)) return;

    /* Con il selettore a.C./d.C. visibile il campo contiene un numero positivo
     * e il segno lo decide la tendina; altrimenti il campo è già l'anno. */
    var year = el['year-era'].hidden
      ? raw
      : Math.abs(raw) * (parseInt(el['year-era'].value, 10) < 0 ? -1 : 1);

    if (commit) {
      setGuess(year);
      return;
    }

    /* Mentre si digita non si riscrive il campo — il cursore salterebbe a ogni
     * tasto — e si ignorano i valori ancora fuori scala ("1" che diventerà 1969). */
    if (year < state.scale.min || year > state.scale.max) return;
    state.guess = year;
    el['guess-year'].textContent = Scale.formatYear(year);
    el['year-slider'].value = String(Math.round(state.scale.toPos(year) * 1000));
  }

  function bind() {
    var el = UI.el;

    UI.renderModes(state.modeId, function (id) {
      state.modeId = id;
      state.mode = Cfg.mode(id);
      UI.selectMode(id);
      UI.renderHomeMeta(state.mode);
    });

    el['btn-start'].addEventListener('click', startGame);
    el['btn-reset'].addEventListener('click', function () {
      IQ.Storage.resetSeen();
      UI.renderHomeMeta(state.mode);
    });

    el['btn-theme'].addEventListener('click', function () {
      state.theme = state.theme === 'carta' ? 'notte' : 'carta';
      IQ.Storage.saveTheme(state.theme);
      UI.applyTheme(state.theme);
    });

    el['year-slider'].addEventListener('input', function () {
      setGuess(state.scale.toYear(Number(this.value) / 1000));
    });

    el['year-input'].addEventListener('input', function () { readExactInput(false); });
    el['year-input'].addEventListener('change', function () { readExactInput(true); });
    el['year-era'].addEventListener('change', function () { readExactInput(true); });

    Array.prototype.forEach.call(document.querySelectorAll('.btn-nudge'), function (b) {
      b.addEventListener('click', function () { nudge(Number(b.dataset.delta)); });
    });

    el['btn-hint'].addEventListener('click', useHint);
    el['btn-confirm'].addEventListener('click', confirmGuess);
    el['btn-next'].addEventListener('click', nextRound);
    el['btn-again'].addEventListener('click', startGame);
    el['btn-home'].addEventListener('click', goHome);

    document.addEventListener('keydown', onKey);
  }

  function onKey(e) {
    /* Le frecce dentro il campo numerico restano quelle del campo. */
    var typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT');

    if (state.phase === 'round' && !typing) {
      if (e.key === 'ArrowLeft')  { nudge(e.shiftKey ? -10 : -1); e.preventDefault(); return; }
      if (e.key === 'ArrowRight') { nudge(e.shiftKey ? 10 : 1);   e.preventDefault(); return; }
    }
    if (e.key !== 'Enter') return;

    if (state.phase === 'round') { confirmGuess(); e.preventDefault(); }
    else if (state.phase === 'reveal') { nextRound(); e.preventDefault(); }
    else if (state.phase === 'home') { startGame(); e.preventDefault(); }
  }

  function init() {
    UI.init();
    state.theme = IQ.Storage.theme();
    UI.applyTheme(state.theme);
    state.mode = Cfg.mode(state.modeId);
    state.scale = Scale.create(state.mode.segments);
    bind();
    goHome();

    /* Scaricamento in sottofondo: quando il giocatore clicca, gli eventi nuovi
     * sono già lì e la partita parte senza attese. */
    if (IQ.Remote) {
      IQ.Remote.prefetch(function () {
        if (state.phase === 'home') UI.renderHomeMeta(state.mode);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
