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
    phase: 'home',     // home | round | reveal | results
    loading: false     // scaricamento in corso: non si avvia una seconda partita
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
    /* Il bottone si spegne durante l'attesa, ma l'Invio no: senza questa guardia
     * ogni pressione lancia un `ensure`, e alla fine del caricamento la partita
     * viene distribuita una volta per pressione. */
    if (state.loading) return;
    state.mode = Cfg.mode(state.modeId);

    if (!IQ.Remote) { deal(); return; }

    state.loading = true;
    UI.setLoading(true);
    IQ.Remote.ensure(state.mode, Cfg.ROUNDS, function () {
      state.loading = false;
      UI.setLoading(false);
      deal();
    });
  }

  function deal() {
    state.scale = Scale.create(state.mode.segments);
    state.deck = IQ.Deck.draw(state.mode, Cfg.ROUNDS);

    /* Con i 197 eventi curati il mazzo non è mai vuoto, ma se lo fosse un round
     * senza evento manderebbe in errore la pagina intera invece di un livello. */
    if (!state.deck.length) { goHome(); UI.noEvents(); return; }

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

  /* Legge l'anno digitato nel campo grande. Con `commit` si passa da setGuess, che
   * arrotonda dentro la scala e riallinea tutto; senza, si è ancora a metà
   * digitazione e si tocca il meno possibile. */
  function readYearField(commit) {
    var el = UI.el;
    var field = el['guess-year'];

    /* Il campo è type="text" per non trascinarsi dietro lo spinner del numerico:
     * le cifre si filtrano qui. Si riscrive solo se c'era davvero da togliere,
     * altrimenti il cursore salterebbe a fondo riga a ogni tasto. */
    var digits = field.value.replace(/[^\d]/g, '');
    if (digits !== field.value) field.value = digits;
    UI.fitYearField(digits);

    /* Campo vuoto: è un passaggio legittimo mentre si cancella per riscrivere. */
    if (!digits) return;

    /* L'era non è uno stato a parte, è il segno dell'anno corrente. */
    var year = parseInt(digits, 10) * (state.guess < 0 ? -1 : 1);

    if (commit) {
      setGuess(year);
      return;
    }

    /* Si ignorano i valori ancora fuori scala ("1" che diventerà 1969). */
    if (year < state.scale.min || year > state.scale.max) return;
    state.guess = year;
    el['year-slider'].value = String(Math.round(state.scale.toPos(year) * 1000));
    el['year-slider'].setAttribute('aria-valuetext', Scale.formatYear(year));
  }

  /* Lo zero non ha segno: da lì si scende a 1 a.C., il suo vicino a sinistra. */
  function toggleEra() {
    if (state.phase !== 'round') return;
    setGuess(state.guess === 0 ? -1 : -state.guess);
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

    el['guess-year'].addEventListener('input', function () { readYearField(false); });
    /* blur e non change: copre anche l'anno fuori scala lasciato lì e abbandonato,
     * che deve tornare a un valore valido invece di restare scritto male. */
    el['guess-year'].addEventListener('blur', function () { readYearField(true); });
    el['guess-era'].addEventListener('click', toggleEra);

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
    var tag = e.target && e.target.tagName;
    /* Le frecce dentro il campo numerico restano quelle del campo. */
    var typing = tag === 'INPUT' || tag === 'SELECT';

    if (state.phase === 'round' && !typing) {
      if (e.key === 'ArrowLeft')  { nudge(e.shiftKey ? -10 : -1); e.preventDefault(); return; }
      if (e.key === 'ArrowRight') { nudge(e.shiftKey ? 10 : 1);   e.preventDefault(); return; }
    }
    if (e.key !== 'Enter') return;

    /* Invio con il fuoco su un bottone appartiene al bottone: il browser ne genera
     * già il click, e agire anche qui farebbe due cose con un tasto solo — chiedere
     * l'indizio e insieme confermare il round. */
    if (tag === 'BUTTON' || tag === 'A') return;

    if (state.phase === 'round') {
      /* Invio dal campo conferma il round: il valore va committato prima, o si
       * confermerebbe l'anno com'era all'ultimo passaggio dentro la scala. */
      if (e.target === UI.el['guess-year']) readYearField(true);
      confirmGuess();
      e.preventDefault();
    }
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
