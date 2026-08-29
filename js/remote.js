/* remote.js — eventi presi da Wikipedia, così il mazzo non finisce mai.
 *
 * Sorgente: l'API "onthisday" di Wikimedia in italiano, una voce per giorno del
 * calendario. È aperta al pubblico (nessuna chiave, CORS libero), quindi basta
 * il sito statico: non serve alcun backend.
 *
 *   GET https://api.wikimedia.org/feed/v1/wikipedia/it/onthisday/events/MM/DD
 *
 * A ogni giro si pescano giorni a caso, così gli eventi cambiano di partita in
 * partita. Quello che arriva viene normalizzato nella stessa forma degli eventi
 * scritti a mano in data/events.js — { id, year, text, cat, note } — e messo in
 * cache su localStorage, così la seconda apertura parte già piena e il gioco
 * regge anche offline.
 *
 * Niente qui è mai bloccante: se la rete manca, se l'API risponde male o se la
 * pagina è aperta da file:// (dove fetch verso un'altra origine è vietato), il
 * gioco prosegue con i soli eventi locali.
 */
(function (global) {
  'use strict';

  var IQ = global.IQ || (global.IQ = {});

  var ENDPOINT = 'https://api.wikimedia.org/feed/v1/wikipedia/it/onthisday/events/';
  var CACHE_KEY = 'iq.remote.v1';
  var CACHE_MAX = 600;      // eventi tenuti in cache: oltre, si tagliano i più vecchi
  var DAYS_PER_FETCH = 4;   // ~22 eventi grezzi a giorno
  var TIMEOUT_MS = 8000;
  var MAX_FAILURES = 3;     // dopo tre buchi di fila si smette di insistere

  var MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var MIN_TEXT = 20;
  var MAX_TEXT = 220;
  var MAX_NOTE = 180;

  var events = [];      // eventi remoti disponibili, dal più vecchio in cache
  var index = {};       // id → true, per la deduplica
  var pending = null;   // fetch in corso, per non lanciarne due insieme
  var failures = 0;

  /* ────────────────────────────────────────────────────────── Normalizzazione */

  /* Stessa logica di data/events.js: l'id nasce dal testo, non si inventa. */
  function slug(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
  }

  /* Un anno dentro il testo regalerebbe la risposta. Si scartano sia il numero
   * dell'anno vero sia qualsiasi altro numero di quattro cifre che somigli a una
   * data; quelli di tre cifre restano ammessi ("Fiat 500", "Boeing 747"). */
  function revealsYear(text, year) {
    var tokens = text.match(/\d+/g);
    if (!tokens) return false;
    for (var i = 0; i < tokens.length; i++) {
      var n = parseInt(tokens[i], 10);
      if (n === Math.abs(year)) return true;
      if (tokens[i].length === 4 && n >= 1000 && n <= IQ.Config.CURRENT_YEAR) return true;
    }
    return false;
  }

  /* L'ordine conta: vince la prima regola che aggancia, e la politica passa per
   * prima perché le sue parole compaiono spesso dentro frasi che altrimenti
   * finirebbero altrove ("guerra mondiale" fra gli sport, "attacco chimico"
   * fra le scienze). */
  var CAT_RULES = [
    ['GUE', /\b(guerr|battagl|assedi|trattat|rivoluzion|elezion|president|imperator|golpe|colpo di stato|attentat|attacco|strage|eccidio|massacr|militar|esercit|invas|indipendenz|parlament|ministr|bombard|armistizi|dittat)/i],
    ['ESP', /\b(spedizion|esplorazion|circumnaviga|polo (nord|sud)|conquista la vetta|sbarca|approda|allunagg|missione spaziale)/i],
    ['SCI', /\b(scienz|scopr|scopert|invent|brevett|fisic|chimic|astronom|medic|vaccin|virus|comput|internet|telefon|satellit|razz|astronaut|sond|telescop|nucleare|energia|ingegn|matematic)/i],
    ['ART', /\b(film|cinema|musica|album|canzon|romanz|libro|poet|scritt|pittor|quadro|dipint|teatro|museo|filosof|nobel per la letteratura)/i],
    ['SPO', /\b(olimpiad|olimpic|mondiali|campionat|calcio|calciator|torneo|atleta|record del mondo|sport)/i],
    ['SOC', /\b(papa|chiesa|legge|diritt|sciopero|manifestazion|process|terremot|alluvion|epidemi|nasce|muore|fondat|inaugur|censiment)/i]
  ];

  function guessCat(text, description) {
    var hay = text + ' ' + (description || '');
    var CAT = IQ.CATEGORIES || {};
    for (var i = 0; i < CAT_RULES.length; i++) {
      if (CAT_RULES[i][1].test(hay)) return CAT[CAT_RULES[i][0]] || 'Storia';
    }
    return 'Storia';
  }

  /* La curiosità è mostrata solo dopo la rivelazione, quindi qui un anno non è
   * uno spoiler: si taglia solo per lunghezza, alla fine di una frase. */
  function shortNote(extract, title) {
    var t = String(extract || '').replace(/\s+/g, ' ').trim();
    if (!t) return title ? 'Fonte: Wikipedia — ' + title + '.' : 'Fonte: Wikipedia.';
    if (t.length <= MAX_NOTE) return t;

    var cut = t.slice(0, MAX_NOTE);
    var dot = cut.lastIndexOf('. ');
    if (dot > 60) return cut.slice(0, dot + 1);
    var space = cut.lastIndexOf(' ');
    return (space > 60 ? cut.slice(0, space) : cut) + '…';
  }

  /* L'API elenca tutte le pagine citate e la prima non è per forza quella giusta:
   * per "in Siria inizia la guerra civile" mette prima "Siria", che darebbe una
   * curiosità sulla geografia del paese. La pagina dedicata all'evento di solito
   * si riconosce perché ha l'anno nella descrizione ("conflitto armato ... dal
   * 2011"), quindi si preferisce quella. */
  function pickPage(pages, year) {
    if (!pages || !pages.length) return {};
    var re = new RegExp('\\b' + Math.abs(year) + '\\b');
    for (var i = 0; i < pages.length; i++) {
      if (re.test(pages[i].description || '')) return pages[i];
    }
    return pages[0];
  }

  /* Da una voce grezza dell'API all'evento del gioco; null se non è utilizzabile. */
  function toEvent(raw) {
    if (!raw || typeof raw.year !== 'number') return null;

    var year = Math.round(raw.year);
    if (year > IQ.Config.CURRENT_YEAR) return null;

    /* Molte voci arrivano dagli elenchi puntati di Wikipedia e si portano dietro
     * il punto e virgola di fine riga. */
    var text = String(raw.text || '').replace(/\s+/g, ' ').trim().replace(/[;,:]+$/, '');
    if (text.length < MIN_TEXT || text.length > MAX_TEXT) return null;
    if (revealsYear(text, year)) return null;

    var page = pickPage(raw.pages, year);
    var title = (page.titles && page.titles.normalized) || page.title || '';

    return {
      id: 'w-' + slug(title || text) + '-' + year,
      year: year,
      text: text,
      cat: guessCat(text, page.description),
      note: shortNote(page.extract, title)
    };
  }

  /* ──────────────────────────────────────────────────────────────────── Cache */

  function known(ev) {
    if (index[ev.id]) return true;
    /* Se il testo coincide con uno degli eventi curati, l'id locale è lo stesso
     * a meno del prefisso: si evita di riproporre lo stesso fatto due volte. */
    return !!index['local:' + slug(ev.text) + '-' + ev.year];
  }

  function add(ev) {
    if (!ev || !ev.id || typeof ev.year !== 'number' || !ev.text) return false;
    if (known(ev)) return false;
    index[ev.id] = true;
    events.push(ev);
    return true;
  }

  function load() {
    var i;
    for (i = 0; IQ.EVENTS && i < IQ.EVENTS.length; i++) {
      index['local:' + IQ.EVENTS[i].id] = true;
    }
    try {
      var raw = global.localStorage.getItem(CACHE_KEY);
      var data = raw ? JSON.parse(raw) : null;
      if (!data || Object.prototype.toString.call(data.events) !== '[object Array]') return;
      for (i = 0; i < data.events.length; i++) add(data.events[i]);
    } catch (err) {
      /* Cache illeggibile o localStorage bloccato: si riparte dalla rete. */
    }
  }

  function save() {
    if (events.length > CACHE_MAX) {
      var dropped = events.splice(0, events.length - CACHE_MAX);
      for (var i = 0; i < dropped.length; i++) delete index[dropped[i].id];
    }
    try {
      global.localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), events: events }));
    } catch (err) {
      /* Senza cache si gioca lo stesso, si riscarica alla prossima apertura. */
    }
  }

  /* ────────────────────────────────────────────────────────────────── Fetch */

  function supported() {
    return typeof global.fetch === 'function' &&
           typeof global.Promise === 'function' &&
           failures < MAX_FAILURES;
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /* Giorni distinti presi a caso su tutto il calendario: è questo a garantire
   * eventi diversi ogni volta. */
  function randomDays(n) {
    var picked = {};
    var out = [];
    while (out.length < n) {
      var m = 1 + Math.floor(Math.random() * 12);
      var d = 1 + Math.floor(Math.random() * MONTH_DAYS[m - 1]);
      var key = m + '-' + d;
      if (picked[key]) continue;
      picked[key] = true;
      out.push([m, d]);
    }
    return out;
  }

  /* Un giorno che fallisce non deve affondare gli altri: si risolve con []. */
  function fetchDay(month, day) {
    var ctrl = (typeof global.AbortController === 'function') ? new global.AbortController() : null;
    var timer = ctrl ? global.setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : 0;

    return global.fetch(ENDPOINT + pad(month) + '/' + pad(day), ctrl ? { signal: ctrl.signal } : {})
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        return (json && json.events) || [];
      })
      .catch(function () {
        return null;   // null = giorno fallito, [] = giorno vuoto
      })
      .then(function (list) {
        if (timer) global.clearTimeout(timer);
        return list;
      });
  }

  function refresh(done) {
    done = done || function () {};

    if (!supported()) { done(0); return; }
    if (pending) { pending.push(done); return; }
    pending = [done];

    var days = randomDays(DAYS_PER_FETCH);
    var jobs = [];
    for (var i = 0; i < days.length; i++) jobs.push(fetchDay(days[i][0], days[i][1]));

    global.Promise.all(jobs).then(function (lists) {
      var added = 0;
      var ok = 0;
      for (var j = 0; j < lists.length; j++) {
        if (!lists[j]) continue;
        ok++;
        for (var k = 0; k < lists[j].length; k++) {
          if (add(toEvent(lists[j][k]))) added++;
        }
      }
      failures = ok > 0 ? 0 : failures + 1;
      if (added) save();
      finish(added);
    }).catch(function () {
      failures++;
      finish(0);
    });
  }

  function finish(added) {
    var waiting = pending || [];
    pending = null;
    for (var i = 0; i < waiting.length; i++) waiting[i](added);
  }

  /* ──────────────────────────────────────────────────────────────── Interfaccia */

  IQ.Remote = {
    /* Gli eventi remoti disponibili adesso. Il chiamante li legge soltanto. */
    events: function () {
      return events;
    },

    /* Aggiornamento in sottofondo: non blocca niente, `done` è facoltativo. */
    prefetch: function (done) {
      refresh(done);
    },

    /* Chiama `done` quando per questa modalità ci sono almeno `count` eventi mai
     * visti — subito se già ci sono. Chiama `done` comunque, anche se la rete è
     * andata male: in quel caso si gioca con il mazzo locale. */
    ensure: function (mode, count, done) {
      done = done || function () {};

      if (IQ.Deck.freshCount(mode) >= count) {
        done();
        /* Già pronti per questa partita: si scarica per la prossima. */
        refresh();
        return;
      }
      refresh(function () { done(); });
    }
  };

  load();
})(window);
