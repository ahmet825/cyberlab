import type { RouteContext, VirtualHttpResponse } from '../types';

export async function handleProfile(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const html = ctx.createHtml(
    'Kullanıcı Profili // ACME Savunma Portalı',
    `<div class="container">
      <h2 style="font-size: 20px; margin-bottom: 8px;">Kullanıcı Profil Paneli</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 16px;">
        Kullanıcı tercihleri URL fragment (#) üzerinden dinamik olarak istemcide işlenir.
      </p>

      <div style="background: #0f172a; padding: 18px; border-radius: 6px; border: 1px solid #334155; margin-bottom: 16px;">
        <h4 style="font-size: 13px; color: #38bdf8; margin-bottom: 8px;">Dinamik Profil Kartı:</h4>
        <div id="profile-display" style="padding: 12px; background: #090e1a; border-radius: 4px; font-size: 13px; color: #e2e8f0;">
          Yükleniyor...
        </div>
      </div>

      <!-- Vulnerable DOM-based JSON Context Sink -->
      <script>
        (function() {
          try {
            var rawHash = window.__LAB_HASH__ || window.location.hash || '#{"theme":"dark"}';
            var jsonStr = decodeURIComponent(rawHash.replace(/^#/, ''));
            var config = JSON.parse(jsonStr);

            // Vulnerable DOM sink: direct innerHTML from parsed JSON properties
            var target = document.getElementById('profile-display');
            if (target) {
              var displayContent = config.display || config.role || config.theme || 'Varsayılan Profil';
              target.innerHTML = '<strong>Profil Ayarı:</strong> ' + displayContent;
            }
          } catch(e) {
            var target = document.getElementById('profile-display');
            if (target) {
              target.innerHTML = '<span style="color: #f87171;">JSON Ayrıştırma Hatası: ' + e.message + '</span>';
            }
          }
        })();
      </script>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': 'admin_session=FLAG{d0m_xss_js0n_p4rs3_s1nk}; Path=/'
    },
    setCookies: {
      admin_session: 'FLAG{d0m_xss_js0n_p4rs3_s1nk}'
    },
    html
  };
}
