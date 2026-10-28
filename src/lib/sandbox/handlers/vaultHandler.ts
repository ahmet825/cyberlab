import type { RouteContext, VirtualHttpResponse } from '../types';
import { executeVulnerableQuery } from '../../sql/sqliteEngine';
import { synthesizeExploitFlag } from '../flagVault';

function decodeBase64Url(input: string): string {
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function handleVaultFlag(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const docId = ctx.query['doc_id'];

  // Sub-case A: BOLA / IDOR parameter manipulation (doc_id=105)
  if (docId !== undefined) {
    if (docId === '105') {
      const dynamicFlag = synthesizeExploitFlag('lab-auth-bola-idor', `idor_doc_${docId}`) || '';
      const html = ctx.createHtml(
        'Savunma Direktifi #105 // ACME Gizli Arşivi',
        `<div class="container">
          <div class="badge-success">
            <h3 style="font-size: 16px; margin-bottom: 6px;">DOKÜMAN ERİŞİMİ AÇILDI: Gizlilik Seviyesi: DERECE-4</h3>
            <p style="font-size: 12px; margin-bottom: 8px;">
              BOLA / IDOR zafiyetiyle başkasına ait gizli savunma direktifine sızıldı.
            </p>
            <p style="font-size: 13px;">
              <strong>Sistem Bayrağı:</strong> <code>${dynamicFlag}</code>
            </p>
          </div>
          <div style="background: #0f172a; padding: 14px; border-radius: 6px; font-size: 12px; color: #cbd5e1;">
            <strong>Konu:</strong> Proje Kasırga Acil Durum Protokolü Revizyonu (2026)
          </div>
        </div>`
      );
      return { status: 200, statusText: 'OK', headers: { 'Content-Type': 'text/html; charset=utf-8' }, html };
    } else {
      const html = ctx.createHtml(
        `Doküman #${docId} // ACME Arşivi`,
        `<div class="container">
          <h3 style="font-size: 15px; margin-bottom: 6px;">Personel Dokümanı: #${docId}</h3>
          <p style="font-size: 12px; color: #94a3b8;">Standart personel çalışma direktifi. Gizli veri içermez.</p>
        </div>`
      );
      return { status: 200, statusText: 'OK', headers: { 'Content-Type': 'text/html; charset=utf-8' }, html };
    }
  }

  // Sub-case B: JWT Algorithm None Attack
  const authHeader = ctx.headers['authorization'] || '';
  let isJwtAdmin = false;

  if (authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.slice(7).trim();
    const parts = rawToken.split('.');
    if (parts.length >= 2) {
      try {
        const headerObj = JSON.parse(decodeBase64Url(parts[0]));
        const payloadObj = JSON.parse(decodeBase64Url(parts[1]));
        if (
          String(headerObj.alg).toLowerCase() === 'none' &&
          (payloadObj.role === 'admin' || payloadObj.user === 'admin')
        ) {
          isJwtAdmin = true;
        }
      } catch {
        // invalid token
      }
    }
  }

  if (isJwtAdmin) {
    const dynamicJwtFlag = synthesizeExploitFlag('lab-jwt-alg-none', 'jwt_alg_none_admin') || '';
    const html = ctx.createHtml(
      'Kasa Doğrulandı // ACME Kripto Kasası',
      `<div class="container">
        <div class="badge-success">
          <h2 style="font-size: 18px; margin-bottom: 6px;">KASA KİLİDİ AÇILDI: Yönetici Yetkisi!</h2>
          <p style="font-size: 12px;">JWT 'alg: none' imza denetim zafiyeti başarıyla istismar edildi.</p>
          <p style="font-size: 13px; font-weight: bold; margin-top: 8px;">
            Kasa Bayrağı: <code>${dynamicJwtFlag}</code>
          </p>
        </div>
      </div>`
    );
    return { status: 200, statusText: 'OK', headers: { 'Content-Type': 'text/html; charset=utf-8' }, html };
  }

  const html = ctx.createHtml(
    'Kasa Kilitli // ACME Güvenlik Kasası',
    `<div class="container">
      <div class="badge-error">
        <h3 style="font-size: 16px; margin-bottom: 4px;">401 Yetkisiz Erişim — Yönetici JWT Belirteci Gerekli</h3>
        <p style="font-size: 12px; color: #cbd5e1;">Geçerli bir Bearer admin tokenı sağlanmadı.</p>
      </div>
    </div>`
  );
  return { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'text/html; charset=utf-8' }, html };
}

export async function handleVaultLookup(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const idParam = ctx.query['id'] || '1';
  const query = `SELECT key_id, secret_name FROM system_secrets WHERE key_id = ${idParam}`;
  const res = await executeVulnerableQuery(query);

  if (res.error) {
    const html = ctx.createHtml(
      'SQLite Hatası // ACME Kasa Sorgusu',
      `<div class="container">
        <div class="badge-error">
          <h3 style="font-size: 16px; margin-bottom: 6px;">SQLITE VERBOSE EXCEPTION:</h3>
          <pre style="background: #090e1a; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #fca5a5; white-space: pre-wrap;">${res.error}</pre>
        </div>
      </div>`
    );
    return { status: 500, statusText: 'Internal Error', headers: { 'Content-Type': 'text/html; charset=utf-8' }, html };
  }

  const html = ctx.createHtml(
    'Kasa Sorgu Sonucu // ACME Kasa',
    `<div class="container">
      <h3 style="font-size: 16px; margin-bottom: 8px;">Kasa Kaydı: ID ${idParam}</h3>
      <p style="font-size: 12px; color: #94a3b8;">Kayıt bulundu ancak gizlilik derecesi nedeniyle maskelenmiştir.</p>
    </div>`
  );
  return { status: 200, statusText: 'OK', headers: { 'Content-Type': 'text/html; charset=utf-8' }, html };
}
