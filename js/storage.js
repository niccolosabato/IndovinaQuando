/* Memoria persistente: eventi già usciti e record personali.
 *
 * Tutto passa da try/catch: in navigazione privata o con i cookie bloccati
 * localStorage può lanciare, e il gioco deve continuare a funzionare lo stesso
 * (semplicemente senza ricordare nulla fra una sessione e l'altra).
 */
(function (global) {
  'use strict';

  var IQ = global.IQ || (global.IQ = {});

  var SEEN_KEY = 'iq.seen';
  var BEST_KEY = 'iq.best';

  function read(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  IQ.Storage = {
    /* Insieme degli id già visti, come oggetto per le ricerche rapide. */
    seen: function () {
      var list = read(SEEN_KEY, []);
      var set = {};
      if (Object.prototype.toString.call(list) !== '[object Array]') return set;
      for (var i = 0; i < list.length; i++) set[list[i]] = true;
      return set;
    },

    markSeen: function (ids) {
      var set = this.seen();
      for (var i = 0; i < ids.length; i++) set[ids[i]] = true;
      write(SEEN_KEY, Object.keys(set));
    },

    /* Dimentica solo gli id passati (quelli di una modalità), non tutti. */
    forget: function (ids) {
      var set = this.seen();
      for (var i = 0; i < ids.length; i++) delete set[ids[i]];
      write(SEEN_KEY, Object.keys(set));
    },

    resetSeen: function () {
      write(SEEN_KEY, []);
    },

    best: function (modeId) {
      var all = read(BEST_KEY, {});
      return (all && typeof all[modeId] === 'number') ? all[modeId] : 0;
    },

    /* Salva il punteggio se è un record; restituisce true se lo era. */
    saveBest: function (modeId, score) {
      var all = read(BEST_KEY, {}) || {};
      if (typeof all !== 'object') all = {};
      if (typeof all[modeId] === 'number' && all[modeId] >= score) return false;
      all[modeId] = score;
      write(BEST_KEY, all);
      return true;
    }
  };
})(window);
