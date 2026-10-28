import type { PageContext } from './types';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function toScriptJson(value: unknown): string {
  return JSON.stringify(value ?? {})
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function renderHtmlPage(
  title: string,
  bodyContent: string,
  ctx: PageContext = {}
): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #0b1120;
      color: #f1f5f9;
      line-height: 1.5;
    }
    .top-nav {
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-weight: 800;
      font-size: 15px;
      color: #38bdf8;
      letter-spacing: 0.5px;
      text-decoration: none;
    }
    .nav-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 12px;
      margin-left: 16px;
      transition: color 0.15s;
    }
    .nav-links a:hover { color: #f8fafc; }
    .container {
      max-width: 820px;
      margin: 26px auto;
      padding: 24px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
    }
    input[type="text"], input[type="password"], textarea, select {
      width: 100%;
      background: #090e1a;
      border: 1px solid #475569;
      color: #fff;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 12px;
      font-family: inherit;
      outline: none;
    }
    input:focus, textarea:focus { border-color: #38bdf8; }
    button, input[type="submit"] {
      background: #0284c7;
      color: #fff;
      font-weight: 700;
      font-size: 13px;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover, input[type="submit"]:hover { background: #0369a1; }
    .badge-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10b981;
      color: #6ee7b7;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 13px;
    }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid #334155;
      text-align: left;
    }
    th { background: #0f172a; color: #94a3b8; font-weight: 600; }
    code {
      background: #090e1a;
      padding: 2px 6px;
      border-radius: 4px;
      color: #38bdf8;
      font-family: monospace;
      font-size: 12px;
    }
    footer {
      text-align: center;
      padding: 20px;
      color: #64748b;
      font-size: 11px;
    }
  </style>

  <!-- Sandbox Shims: Emulates document.cookie and location.hash in sandboxed iframe -->
  <script>
    (function() {
      var jar = ${toScriptJson(ctx.cookies || {})};
      try {
        Object.defineProperty(document, 'cookie', {
          configurable: true,
          get: function() {
            return Object.keys(jar).map(function(k) { return k + '=' + jar[k]; }).join('; ');
          },
          set: function(v) {
            var first = String(v).split(';')[0];
            var idx = first.indexOf('=');
            if (idx > 0) { jar[first.slice(0, idx).trim()] = first.slice(idx + 1).trim(); }
          }
        });
      } catch (e) {}
      window.__LAB_HASH__ = ${toScriptJson(ctx.hash || '')};
    })();
  </script>

  <!-- Security Monitor Hook: Intercepts alerts, links, and forms -->
  <script>
    (function() {
      var originalAlert = window.alert;
      window.alert = function(msg) {
        window.parent.postMessage({
          type: 'LAB_NATIVE_ALERT',
          payload: String(msg),
          url: window.location.href
        }, '*');
        if (originalAlert) {
          try { originalAlert(msg); } catch(e){}
        }
      };

      document.addEventListener('click', function(e) {
        var t = e.target;
        var anchor = (t && t.closest) ? t.closest('a') : null;
        if (anchor && anchor.getAttribute('href')) {
          var href = anchor.getAttribute('href');
          if (href.trim().toLowerCase().indexOf('javascript:') !== 0) {
            e.preventDefault();
            window.parent.postMessage({
              type: 'LAB_NAVIGATE',
              url: href
            }, '*');
          }
        }
      });

      document.addEventListener('submit', function(e) {
        var form = e.target;
        var action = form.getAttribute('action') || '';
        var method = (form.getAttribute('method') || 'GET').toUpperCase();
        var formData = new FormData(form);
        var params = new URLSearchParams();
        for (var pair of formData.entries()) {
          params.append(pair[0], pair[1]);
        }
        e.preventDefault();
        window.parent.postMessage({
          type: 'LAB_FORM_SUBMIT',
          method: method,
          action: action,
          data: params.toString()
        }, '*');
      });
    })();
  </script>
</head>
<body>
  <header class="top-nav">
    <a href="/" class="logo">ACME CORP // SAVUNMA PORTALI</a>
    <nav class="nav-links">
      <a href="/">Ana Sayfa</a>
      <a href="/inventory?category=Electronics">Envanter</a>
      <a href="/search">Arama</a>
      <a href="/status">Sistem Durumu</a>
      <a href="/login">Personel Girişi</a>
    </nav>
  </header>
  <main>
    ${bodyContent}
  </main>
  <footer>
    ACME Savunma Teknolojileri A.Ş. — İzole Kumhavuzu Simülasyonu
  </footer>
</body>
</html>`;
}
