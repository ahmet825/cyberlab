import type { RouteContext, VirtualHttpResponse } from '../types';

export async function handleSearch(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const q = ctx.query['q'] || '';

  let searchResultsHtml = '';
  if (q) {
    // Challenge-01: Reflected XSS - User input is reflected directly into HTML without entity encoding
    searchResultsHtml = `
      <div class="badge-success">
        <p style="font-size: 13px; margin-bottom: 6px;">Arama terimi için sonuçlar: <strong>${q}</strong> (0 kayıt bulundu)</p>
        <p style="font-size: 11px; color: #94a3b8;">
          Sorgu doğrudan DOM çıktısına yansıtıldı.
        </p>
      </div>`;
  }

  const html = ctx.createHtml(
    'Arama // ACME Savunma Portalı',
    `<div class="container">
      <h2 style="font-size: 20px; margin-bottom: 8px;">ACME İç Arama Servisi</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 18px;">
        Kurumsal doküman ve parça arama motoru. Girdi doğrudan sayfaya basılmaktadır.
      </p>

      <form action="/search" method="GET">
        <input type="text" name="q" value="${q.replace(/"/g, '&quot;')}" placeholder="Arama terimi girin..." autocomplete="off">
        <button type="submit">Arama Yap</button>
      </form>

      <div style="margin-top: 20px;">
        ${searchResultsHtml}
      </div>

      <!-- Kasa belirteci ve bayrak -->
      <script>
        window.vault_xss_flag = "FLAG{xss_b4s1c_r3fl3ct_pwn3d}";
        document.cookie = "xss_session=FLAG{xss_b4s1c_r3fl3ct_pwn3d}; path=/";
      </script>
    </div>`
  );

  const responseHeaders: Record<string, string> = { 'Content-Type': 'text/html; charset=utf-8' };
  const responseCookies: Record<string, string> = {
    xss_session: 'FLAG{xss_b4s1c_r3fl3ct_pwn3d}'
  };

  return {
    status: 200,
    statusText: 'OK',
    headers: responseHeaders,
    setCookies: responseCookies,
    html
  };
}
