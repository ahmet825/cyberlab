import type { RouteContext, VirtualHttpResponse } from '../types';
import { escapeHtml } from '../template';

export async function handleForgotPassword(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const email = ctx.query['email'] || '';
  const host = ctx.headers['x-forwarded-host'] || ctx.headers['host'] || 'corp-auth.local';
  let resetNotification = '';

  if (ctx.req.method === 'POST' && email) {
    const isPoisoned = host.includes('evil-collector.local') || (host !== 'corp-auth.local' && host !== 'localhost');
    const resetToken = 'tok_reset_ceo_998124_alpha';
    const resetUrl = `https://${host}/reset-password?token=${resetToken}`;

    if (isPoisoned) {
      resetNotification = `
        <div class="badge-success">
          <strong>PAROLA SIFIRLAMA İSTEĞİ ZEHİRLENDİ!</strong>
          <p style="font-size: 12px; margin-top: 4px;">
            E-posta bağlantısı saldırgan sunucusuna yönlendirildi: <code>${escapeHtml(resetUrl)}</code>
          </p>
          <p style="font-size: 12px; margin-top: 6px;">
            <strong>Bayrak:</strong> <code>FLAG{h0st_h34d3r_p01s0n_succ3ss}</code>
          </p>
        </div>`;
    } else {
      resetNotification = `
        <div class="badge-success">
          <strong>Sıfırlama E-postası Gönderildi!</strong>
          <p style="font-size: 12px; margin-top: 4px;">
            Bağlantı: <code>${escapeHtml(resetUrl)}</code>
          </p>
        </div>`;
    }
  }

  const html = ctx.createHtml(
    'Parolamı Unuttum // ACME Kimlik Doğrulama',
    `<div class="container" style="max-width: 480px;">
      <h2 style="font-size: 20px; margin-bottom: 6px;">Parola Sıfırlama Servisi</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 16px;">
        Kurumsal e-posta adresinizi girerek sıfırlama bağlantısı talep edin.
      </p>

      ${resetNotification}

      <form action="/forgot-password" method="POST">
        <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">E-Posta:</label>
        <input type="text" name="email" value="${escapeHtml(email)}" placeholder="victim_ceo@corp.internal">
        <button type="submit" style="width: 100%; margin-top: 6px;">Sıfırlama Bağlantısı Gönder</button>
      </form>

      <div style="margin-top: 16px;">
        <a href="/login" style="color: #38bdf8; text-decoration: none; font-size: 12px;">&larr; Giriş Paneline Dön</a>
      </div>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    html
  };
}
