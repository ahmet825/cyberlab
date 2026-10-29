import type { RouteContext, VirtualHttpResponse } from '../types';
import { escapeHtml } from '../template';
import { synthesizeExploitFlag } from '../flagVault';

export async function handleHome(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const html = ctx.createHtml(
    'ACME Savunma & Envanter Portalı',
    `<div class="container">
      <h1 style="font-size: 22px; margin-bottom: 8px;">ACME Savunma & Donanım Sistemleri</h1>
      <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">
        Kurumsal ağ, envanter yönetimi ve savunma portalı.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 20px;">
        <div style="background: #0f172a; padding: 16px; border-radius: 6px; border: 1px solid #334155;">
          <h3 style="font-size: 14px; color: #38bdf8; margin-bottom: 6px;">Donanım Kataloğu</h3>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">Filtrelenebilir SQLite envanter veritabanı.</p>
          <a href="/inventory?category=Electronics" style="color: #00ff9d; font-size: 12px; font-weight: 700; text-decoration: none;">Envantere Git &rarr;</a>
        </div>

        <div style="background: #0f172a; padding: 16px; border-radius: 6px; border: 1px solid #334155;">
          <h3 style="font-size: 14px; color: #38bdf8; margin-bottom: 6px;">İç Arama Motoru</h3>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">WAF korumalı iç arama servisi.</p>
          <a href="/search" style="color: #00ff9d; font-size: 12px; font-weight: 700; text-decoration: none;">Aramayı Başlat &rarr;</a>
        </div>
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

export async function handleAbout(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const html = ctx.createHtml(
    'Hakkımızda // ACME Savunma',
    `<div class="container">
      <h2 style="font-size: 20px; margin-bottom: 8px;">Ağ Mimarisi & Güvenlik Politikası</h2>
      <p style="color: #94a3b8; font-size: 13px; margin-bottom: 18px;">
        ACME Savunma Teknolojileri ağ mimarisi, çok katmanlı savunma ilkelerine göre yapılandırılmıştır.
      </p>
      <div style="background: #0f172a; padding: 16px; border-radius: 6px; border: 1px solid #334155; margin-bottom: 16px;">
        <ul style="margin-left: 20px; font-size: 13px; color: #cbd5e1; line-height: 1.8;">
          <li><strong>Dış Ağ Geçidi:</strong> Bulut WAF ve ters proxy katmanı.</li>
          <li><strong>İç Ağ Bloğu:</strong> Reverse proxy ağ adresi <code>10.0.0.1</code> üzerinde sınırlandırılmıştır.</li>
          <li><strong>Kimlik Doğrulama:</strong> İstemci HMAC imzası ve JSON Web Token (JWT) mekanizması.</li>
        </ul>
      </div>
      <a href="/" style="color: #38bdf8; font-size: 12px; text-decoration: none;">&larr; Ana Sayfaya Dön</a>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    html
  };
}

export async function handleStatus(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const html = ctx.createHtml(
    'Sistem Durumu // ACME Savunma',
    `<div class="container">
      <h2 style="font-size: 20px; margin-bottom: 8px;">Sistem Sağlığı & Canlı Durum Monitörü</h2>
      <table>
        <thead>
          <tr><th>Servis</th><th>Durum</th><th>Protokol</th><th>Yanıt Süresi</th></tr>
        </thead>
        <tbody>
          <tr><td>İç Ağ Geçidi (Internal Gateway)</td><td><span style="color: #00ff9d; font-weight: 700;">● Aktif</span></td><td>Apache/2.4.52 (10.0.0.1)</td><td>12ms</td></tr>
          <tr><td>İlişkisel Veritabanı</td><td><span style="color: #00ff9d; font-weight: 700;">● Aktif</span></td><td>SQLite 3.42 WASM</td><td>2ms</td></tr>
          <tr><td>WAF Filtre Motoru</td><td><span style="color: #f59e0b; font-weight: 700;">● Denetimde</span></td><td>ModSecurity 2026</td><td>18ms</td></tr>
          <tr><td>Kasa Kimlik Doğrulama</td><td><span style="color: #00ff9d; font-weight: 700;">● Aktif</span></td><td>JWT Vault</td><td>5ms</td></tr>
        </tbody>
      </table>
      <div style="margin-top: 18px;">
        <a href="/" style="color: #38bdf8; font-size: 12px; text-decoration: none;">&larr; Ana Portala Dön</a>
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

export async function handleLogin(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const username = ctx.query['username'] || '';
  const password = ctx.query['password'] || '';
  let authFeedback = '';
  let sessionValue: string | undefined = undefined;

  if (ctx.req.method === 'POST') {
    const lowerUser = username.toLowerCase();
    // Challenge-02: SQL Injection Auth Bypass (e.g. admin' OR 1=1-- or ' OR 1=1--)
    const isSqliBypass =
      lowerUser.includes("' or") ||
      lowerUser.includes("'or") ||
      lowerUser.includes("1=1") ||
      lowerUser.includes("'--") ||
      lowerUser.includes("admin' --");

    if (isSqliBypass) {
      sessionValue = 'session_admin_sqli_pwned_root';
      const dynamicFlag = synthesizeExploitFlag('lab-sqli-auth-bypass', 'sqli_or_true_bypass') || '';
      authFeedback = `
        <div class="badge-success" style="border-left: 4px solid #00ff9d;">
          <h4 style="font-size: 14px; color: #00ff9d; margin-bottom: 4px;">[SQLi AUTH BYPASS BAŞARILI!]</h4>
          <p style="font-size: 12px; margin-bottom: 6px;">
            Sorgu mantığı kırıldı: <code>SELECT * FROM users WHERE username = '${escapeHtml(username)}' AND password = '...'</code> daima DOĞRU döndü.
          </p>
          <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px;">
            Hoş geldiniz, <strong>Sistem Yöneticisi (administrator)</strong>!
          </p>
          <div style="background: rgba(0, 255, 157, 0.12); padding: 8px 10px; border-radius: 4px; border: 1px solid rgba(0, 255, 157, 0.3);">
            <strong>SİSTEM BAYRAĞI:</strong> <code style="color: #00ff9d; font-size: 13px;">${dynamicFlag}</code>
          </div>
        </div>`;
    } else if (username.includes("'") || password.includes("'")) {
      authFeedback = `
        <div class="badge-error">
          <strong>Sözdizimi Uyarısı (SQL Warning):</strong> SQL ayrıştırma hatası oluştu.
          <p style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
            Sorgu: <code>SELECT * FROM users WHERE username = '${escapeHtml(username)}' AND password = '...'</code>
          </p>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
            💡 <strong>Keşif İpucu:</strong> Tek tırnak karakteri SQL yapısını bozdu. Giriş sorgusunu her zaman doğru yapacak mantıksal bir bypass (örn: <code>' OR 1=1--</code>) kurgulamayı deneyin.
          </p>
        </div>`;
    } else if ((username === 'wiener' && password === 'peter') || (username === 'carlos' && password === 'carlosPassword99')) {
      authFeedback = `<div class="badge-success"><strong>Giriş Başarılı!</strong> Oturum açıldı: ${escapeHtml(username)}.</div>`;
      sessionValue = `usr_auth_${username}_active`;
    } else if (username || password) {
      authFeedback = `<div class="badge-error">Hatalı kullanıcı adı veya parola. Lütfen bilgilerinizi kontrol edin.</div>`;
    }
  }

  const html = ctx.createHtml(
    'Personel Girişi // ACME Savunma',
    `<div class="container" style="max-width: 480px;">
      <h2 style="font-size: 20px; margin-bottom: 6px;">Kurumsal Personel Portalı</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 18px;">Kimlik bilgilerinizle oturum açın.</p>
      ${authFeedback}
      <form action="/login" method="POST">
        <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Kullanıcı Adı:</label>
        <input type="text" name="username" value="${escapeHtml(username)}" placeholder="Örn: admin' OR 1=1--" autocomplete="off">
        <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Parola:</label>
        <input type="password" name="password" placeholder="Parolanız">
        <button type="submit" style="width: 100%; margin-top: 8px;">Giriş Yap</button>
      </form>
      <div style="margin-top: 16px; display: flex; justify-content: space-between; font-size: 11px;">
        <a href="/forgot-password" style="color: #38bdf8; text-decoration: none;">Parolamı Unuttum</a>
        <span style="color: #64748b;">Test: wiener:peter</span>
      </div>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...(sessionValue ? { 'Set-Cookie': `session_id=${sessionValue}; Path=/` } : {})
    },
    ...(sessionValue ? { setCookies: { session_id: sessionValue } } : {}),
    html
  };
}

// Challenge-04: robots.txt Recon
export async function handleRobotsTxt(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const robotsContent = `User-agent: *
Disallow: /admin_secret_portal
Disallow: /backup/
Disallow: /config/
# ACME Savunma Dahili Arama Botları Direktifi`;

  const html = ctx.createHtml(
    'robots.txt // ACME Savunma',
    `<div class="container">
      <h2 style="font-size: 18px; margin-bottom: 8px;">Web Kök Dizin Direktifi: robots.txt</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 14px;">
        Arama motoru robotları için kamuya açık rota kısıtlamaları.
      </p>
      <pre style="background: #090e1a; padding: 14px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #38bdf8; border: 1px solid #334155; line-height: 1.6;">${robotsContent}</pre>
      <p style="color: #64748b; font-size: 11px; margin-top: 12px;">
        İpucu: Yasaklanan (Disallow) rotayı doğrudan adres çubuğundan ziyaret edin.
      </p>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    html
  };
}

// Challenge-04: Admin Secret Portal
export async function handleAdminSecretPortal(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const dynamicFlag =
    ctx.path === '/admin_secret_portal'
      ? synthesizeExploitFlag('lab-recon-robots', 'recon_admin_secret_portal') || ''
      : '';
  const html = ctx.createHtml(
    'Gizli Yönetim Portalı // ACME Savunma',
    `<div class="container">
      <div class="badge-success">
        <h3 style="font-size: 16px; margin-bottom: 6px;">[GİZLİ YÖNETİM PORTALI AÇIĞA ÇIKTI!]</h3>
        <p style="font-size: 12px; margin-bottom: 8px;">
          robots.txt dosyasında ifşa olan gizli rota başarıyla keşfedildi.
        </p>
        <p style="font-size: 13px;">
          <strong>Sistem Bayrağı:</strong> <code style="color: #00ff9d; font-size: 13px;">${dynamicFlag}</code>
        </p>
      </div>
      <div style="background: #0f172a; padding: 14px; border-radius: 6px; border: 1px solid #334155; margin-top: 16px; font-size: 12px; color: #cbd5e1;">
        <strong>Kritik Bilgi:</strong> Hassas rotaları robots.txt dosyasında gizlemek "Gizlilik Yoluyla Güvenlik" (Security through Obscurity) yanılgısıdır.
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

// Challenge-08: Path Traversal (/documents?file=...)
export async function handleDocuments(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const file = ctx.query['file'] || 'report.pdf';
  let fileContent = '';
  let isTraversed = false;
  let dynamicFlag = '';

  if (file.includes('..') || file.includes('secret.txt') || file.includes('/etc/passwd')) {
    isTraversed = true;
    dynamicFlag = synthesizeExploitFlag('lab-path-traversal', 'traversal_secret_txt') || '';
    fileContent = `[ROOT SECRETS ARCHIVE // SİSTEM KASASI]
Dosya Yolu: /var/secrets/secret.txt
Gizlilik: EN YÜKSEK (TOP SECRET)

Kritik Güvenlik Bayrağı: ${dynamicFlag}
Sunucu Anahtarı: k3y_s3rv3r_r00t_882914
Oluşturulma Tarihi: 2026-03-15`;
  } else if (file.includes('config') || file.includes('.env') || file.includes('web.config') || file.includes('apache')) {
    fileContent = `[SİSTEM YAPILANDIRMASI // web.config]
Server: Apache/2.4.52 (Linux 64-bit)
DocumentRoot: /var/www/acme-portal/
Database: sqlite:///var/data/inventory.db
InternalGateway: 10.0.0.1 (Reverse Proxy)
SecurityPolicy: Enforce HMAC & JWT Vault
SecretsDirectory: /var/secrets/secret.txt (Protected)
# Not: Canlı ortama aktarmadan önce gizli dosya yollarını temizleyin.`;
  } else {
    fileContent = `ACME Savunma Sanayii — Aylık Siber Güvenlik Değerlendirme Raporu
Dosya: report.pdf
Durum: Kamuya Açık Özet
İçerik: Tüm sunucu altyapısı ve ağ geçitleri normal seyrinde çalışmaktadır.`;
  }

  const html = ctx.createHtml(
    `Doküman Görüntüleyici: ${escapeHtml(file)} // ACME`,
    `<div class="container">
      <h2 style="font-size: 18px; margin-bottom: 6px;">Doküman Arşivi & Servisi</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 14px;">
        Talep edilen dosya: <code>${escapeHtml(file)}</code>
      </p>

      ${isTraversed ? `
        <div class="badge-success" style="margin-bottom: 14px;">
          <strong>DİZİN ATLAMA BAŞARILI (Path Traversal)!</strong>
          <p style="font-size: 12px; margin-top: 4px;">
            Sunucu kök dizinindeki kilitli sistem dosyası okundu.
          </p>
          <p style="font-size: 13px; margin-top: 6px;">
            <strong>Bayrak:</strong> <code>${dynamicFlag}</code>
          </p>
        </div>
      ` : ''}

      <pre style="background: #090e1a; padding: 14px; border-radius: 6px; font-family: monospace; font-size: 12px; color: ${isTraversed ? '#00ff9d' : '#cbd5e1'}; border: 1px solid #334155; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(fileContent)}</pre>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    html
  };
}

export async function handleBackup(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const html = ctx.createHtml(
    '403 Forbidden // ACME Backup Directory',
    `<div class="container">
      <div class="badge-error">
        <h3 style="font-size: 16px; margin-bottom: 6px;">403 Forbidden — Dizin Listeleme Engellendi</h3>
        <p style="font-size: 12px; color: #cbd5e1;">
          <code>/backup/</code> dizinine doğrudan web erişimi engellendi.
        </p>
      </div>
      <div style="background: #0f172a; padding: 14px; border-radius: 6px; border: 1px solid #334155; margin-top: 14px; font-size: 12px; color: #cbd5e1;">
        <strong>💡 Keşif İpucu:</strong> <code>robots.txt</code> içinde listelenen dizinler siber güvenlikte bilgi ifşası (Information Disclosure) sayılır. Gerçek senaryolarda saldırganlar bu dizinlerdeki <code>.bak</code>, <code>.sql</code> gibi unutulmuş yedek dosyalarını ararlar.
      </div>
      <div style="margin-top: 14px;">
        <a href="/" style="color: #38bdf8; font-size: 12px; text-decoration: none;">&larr; Ana Portala Dön</a>
      </div>
    </div>`
  );

  return {
    status: 403,
    statusText: 'Forbidden',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff'
    },
    html
  };
}

export async function handleConfig(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const html = ctx.createHtml(
    '403 Forbidden // ACME Configuration Directory',
    `<div class="container">
      <div class="badge-error">
        <h3 style="font-size: 16px; margin-bottom: 6px;">403 Forbidden — Yapılandırma Dizini</h3>
        <p style="font-size: 12px; color: #cbd5e1;">
          Web sunucu konfigürasyonu doğrudan HTTP üzerinden servis edilemez.
        </p>
      </div>
      <div style="background: #0f172a; padding: 14px; border-radius: 6px; border: 1px solid #334155; margin-top: 14px; font-size: 12px; color: #cbd5e1;">
        <strong>💡 Keşif İpucu:</strong> Doğrudan erişim kapalı olsa da, uygulamadaki dosya okuma parametreleri (örn: <code>/documents?file=web.config</code>) dolaylı bilgi sızıntılarına yol açabilir.
      </div>
      <div style="margin-top: 14px;">
        <a href="/" style="color: #38bdf8; font-size: 12px; text-decoration: none;">&larr; Ana Portala Dön</a>
      </div>
    </div>`
  );

  return {
    status: 403,
    statusText: 'Forbidden',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow'
    },
    html
  };
}
