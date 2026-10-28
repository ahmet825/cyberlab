import type { RouteContext, VirtualHttpResponse } from '../types';
import { synthesizeExploitFlag } from '../flagVault';

export async function handleSearch(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const q = ctx.query['q'] || '';

  const isXssPayload =
    /<script|<img|<svg|<iframe|<body|onerror\s*=|onload\s*=|onmouseover\s*=|onfocus\s*=|javascript:\s*alert|alert\s*\(/i.test(
      q
    );

  const dynamicFlag = isXssPayload ? synthesizeExploitFlag('lab-xss-multi-filter', 'xss_reflect_dom_exec') : null;

  let searchResultsHtml = '';
  if (q) {
    // Challenge-01: Reflected XSS - User input is reflected directly into HTML without entity encoding
    searchResultsHtml = `
      <div class="badge-success">
        <p style="font-size: 13px; margin-bottom: 6px;">Arama terimi için sonuçlar: <strong>${q}</strong> (0 kayıt bulundu)</p>
        <p style="font-size: 11px; color: #94a3b8;">
          Sorgu doğrudan DOM çıktısına yansıtıldı.
        </p>
        ${
          dynamicFlag
            ? `<div style="margin-top: 10px; padding: 8px 10px; background: rgba(0, 255, 157, 0.12); border: 1px solid rgba(0, 255, 157, 0.35); border-radius: 4px;">
                <strong>[REFLECTED XSS DOĞRULANDI] Sistem Bayrağı:</strong> <code style="color: #00ff9d;">${dynamicFlag}</code>
              </div>`
            : ''
        }
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
    </div>`
  );

  const responseHeaders: Record<string, string> = { 'Content-Type': 'text/html; charset=utf-8' };

  return {
    status: 200,
    statusText: 'OK',
    headers: responseHeaders,
    ...(dynamicFlag ? { setCookies: { xss_session: dynamicFlag } } : {}),
    html
  };
}
