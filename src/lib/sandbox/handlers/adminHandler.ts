import type { RouteContext, VirtualHttpResponse } from '../types';
import { synthesizeExploitFlag } from '../flagVault';

export async function handleAdmin(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const userRole = (ctx.cookies['user_role'] || ctx.cookies['access_tier'] || '').toLowerCase();
  const gateway = ctx.headers['x-internal-gateway'];
  const signature = ctx.headers['x-client-signature'];

  // Check 1: Cookie Tampering (Challenge-05) - if user_role or access_tier cookie is "admin"
  const isCookieAdmin = userRole === 'admin' || userRole === 'administrator';
  // Check 2: Header Spoofing (Advanced)
  const isHeaderAdmin = gateway === '10.0.0.1' && signature === 'sig_adm_root_2026';

  if (!isCookieAdmin && !isHeaderAdmin) {
    const html = ctx.createHtml(
      '403 Forbidden // ACME Yönetim Konsolu',
      `<div class="container">
        <div class="badge-error">
          <h2 style="font-size: 18px; margin-bottom: 6px;">403 Forbidden — Yetersiz Yetki!</h2>
          <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 8px;">
            Yalnızca <strong>admin</strong> rolüne sahip yöneticiler bu yönetim paneline erişebilir.
          </p>
          <p style="font-size: 12px; color: #94a3b8;">
            Mevcut istemci oturum rolünüz: <code>user_role=${userRole || 'guest'}</code>
          </p>
        </div>
        <div style="background: #0f172a; padding: 14px; border-radius: 6px; border: 1px solid #334155; margin-top: 16px; font-size: 12px; color: #cbd5e1;">
          <strong>İpucu:</strong> Tarayıcı üzerindeki <strong>"Çerezler"</strong> sekmesini açın ve <code>user_role</code> değerini <code>admin</code> olarak değiştirip sayfayı yenileyin.
        </div>
      </div>`
    );

    return {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': 'user_role=guest; Path=/'
      },
      setCookies: {
        user_role: userRole || 'guest'
      },
      html
    };
  }

  // Access Granted!
  const dynamicFlag = synthesizeExploitFlag('lab-cookie-tamper', 'cookie_role_admin') || '';
  const html = ctx.createHtml(
    'Yönetici Konsolu // ACME Savunma',
    `<div class="container">
      <div class="badge-success">
        <h2 style="font-size: 18px; margin-bottom: 6px;">YÖNETİM KONSOLU AÇILDI: Tam Yetki!</h2>
        <p style="font-size: 12px; margin-bottom: 8px;">
          Oturum çerezi başarıyla manipüle edildi (Privilege Escalation).
        </p>
        <p style="font-size: 13px; font-weight: bold;">
          Sistem Bayrağı: <code>${dynamicFlag}</code>
        </p>
      </div>

      <div style="background: #0f172a; padding: 16px; border-radius: 6px; border: 1px solid #334155; margin-top: 16px;">
        <h3 style="font-size: 14px; color: #38bdf8; margin-bottom: 8px;">Dahili Sistem Durumu:</h3>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.8;">
          Aktif Oturum Rolü: <strong style="color: #00ff9d;">admin (Süper Kullanıcı)</strong><br>
          Yetki Düzeyi: <code>ROOT_LEVEL_0</code><br>
          Erişim Protokolü: <code>Cookie-Based Authorization Validated</code>
        </p>
      </div>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': 'user_role=admin; Path=/'
    },
    setCookies: {
      user_role: 'admin'
    },
    html
  };
}
