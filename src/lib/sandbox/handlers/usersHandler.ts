import type { RouteContext, VirtualHttpResponse } from '../types';
import { synthesizeExploitFlag } from '../flagVault';

export async function handleUsers(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const method = ctx.req.method.toUpperCase();
  const overrideHeader = (ctx.headers['x-http-method-override'] || ctx.headers['x-method'] || '').toUpperCase();

  // Verb Tampering check:
  // Direct GET or direct POST without override is rejected with 403 Forbidden
  const isBypassed =
    method === 'HEAD' ||
    method === 'OPTIONS' ||
    (method === 'POST' && overrideHeader === 'GET') ||
    overrideHeader === 'GET';

  if (!isBypassed) {
    const html = ctx.createHtml(
      '403 Forbidden // ACME Savunma Güvenlik Duvarı',
      `<div class="container">
        <div class="badge-error">
          <h2 style="font-size: 18px; margin-bottom: 6px;">403 Forbidden — Erişim Engellendi</h2>
          <p style="font-size: 12px; color: #cbd5e1;">
            WAF KURAL İHLALİ: <code>/api/v1/users</code> endpointine doğrudan <code>${method}</code> erişimleri sınırlandırılmıştır.
          </p>
        </div>
      </div>`
    );

    return {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Allow': 'OPTIONS, HEAD, POST',
        'X-WAF-Block-Reason': 'HTTP_METHOD_RESTRICTED',
        'X-Allowed-Methods': 'OPTIONS, HEAD, POST',
        'X-Verb-Override-Supported': 'X-HTTP-Method-Override'
      },
      html
    };
  }

  // Bypass successful!
  const dynamicFlag = synthesizeExploitFlag('lab-recon-verb-tampering', 'verb_override_get') || '';
  const html = ctx.createHtml(
    'Personel API // ACME Savunma Portalı',
    `<div class="container">
      <div class="badge-success">
        <h3 style="font-size: 15px; margin-bottom: 4px;">Erişim Doğrulandı: Protokol Kuralı Aşıldı!</h3>
        <p style="font-size: 12px; margin-bottom: 8px;">
          HTTP Verb Tampering başarılı. Sistem Bayrağı: <code>${dynamicFlag}</code>
        </p>
      </div>

      <h3 style="font-size: 16px; margin: 16px 0 8px 0;">Dahili Personel Dizini:</h3>
      <table>
        <thead>
          <tr><th>UID</th><th>Kullanıcı Adı</th><th>Departman</th><th>Yetki</th></tr>
        </thead>
        <tbody>
          <tr><td>101</td><td>sysadmin_chief</td><td>Siber Savunma Direktörlüğü</td><td>Süper Yönetici</td></tr>
          <tr><td>102</td><td>dev_auditor</td><td>Yazılım Güvenliği</td><td>Denetçi</td></tr>
          <tr><td>103</td><td>ops_engineer</td><td>Ağ Operasyonları</td><td>Mühendis</td></tr>
        </tbody>
      </table>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Access-Level': 'Internal-Personnel'
    },
    html
  };
}
