#!/usr/bin/env python3
"""Server di sviluppo: come `python3 -m http.server`, ma senza cache.

Serve perché gli script del gioco si assumono a vicenda attraverso il namespace
globale `window.IQ`. `http.server` non manda alcun header di cache, e il browser
allora decide da sé: può tenersi un `js/ui.js` vecchio accanto a un `index.html`
nuovo. Basta quel disallineamento e `cache()` non trova più un id, `bind()` si
interrompe a metà, e da lì in poi i bottoni registrati dopo non rispondono più —
con la console pulita, perché l'errore è scattato al caricamento.

    python3 serve.py [porta]        # default 8765
"""

import http.server
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print('IndovinaQuando su http://localhost:%d/ (senza cache)' % port)
    http.server.test(HandlerClass=NoCache, port=port, bind='0.0.0.0')
