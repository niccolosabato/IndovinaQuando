/* Estrazione degli eventi di una partita.
 *
 * Regola: dentro una partita nessun evento si ripete mai, e fra una partita e
 * l'altra escono prima tutti gli inediti. Solo quando il mazzo di una modalità
 * è esaurito la memoria di quella modalità viene azzerata e si ricomincia.
 */
(function (global) {
  'use strict';

  var IQ = global.IQ || (global.IQ = {});

  function pool(mode) {
    var out = [];
    for (var i = 0; i < IQ.EVENTS.length; i++) {
      if (mode.filter(IQ.EVENTS[i])) out.push(IQ.EVENTS[i]);
    }
    return out;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function ids(list) {
    var out = [];
    for (var i = 0; i < list.length; i++) out.push(list[i].id);
    return out;
  }

  IQ.Deck = {
    poolSize: function (mode) {
      return pool(mode).length;
    },

    /* Quanti eventi di questa modalità il giocatore non ha ancora visto. */
    freshCount: function (mode) {
      var seen = IQ.Storage.seen();
      var all = pool(mode);
      var n = 0;
      for (var i = 0; i < all.length; i++) if (!seen[all[i].id]) n++;
      return n;
    },

    /* Restituisce `count` eventi e li registra come visti. */
    draw: function (mode, count) {
      var all = pool(mode);
      var seen = IQ.Storage.seen();
      var fresh = [];
      var i;

      for (i = 0; i < all.length; i++) if (!seen[all[i].id]) fresh.push(all[i]);

      /* Mazzo esaurito: si rimescola tutto ripartendo dagli inediti rimasti,
       * che restano comunque in cima alla pila. */
      if (fresh.length < count) {
        IQ.Storage.forget(ids(all));
        var freshIds = {};
        for (i = 0; i < fresh.length; i++) freshIds[fresh[i].id] = true;
        var rest = [];
        for (i = 0; i < all.length; i++) if (!freshIds[all[i].id]) rest.push(all[i]);
        fresh = shuffle(fresh).concat(shuffle(rest));
      } else {
        fresh = shuffle(fresh);
      }

      var picked = fresh.slice(0, Math.min(count, fresh.length));
      IQ.Storage.markSeen(ids(picked));
      return picked;
    }
  };
})(window);
