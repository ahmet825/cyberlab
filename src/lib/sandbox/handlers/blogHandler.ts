import type { RouteContext, VirtualHttpResponse } from '../types';
import { escapeHtml } from '../template';

// In-memory comments store for the session
const storedComments: Array<{ author: string; text: string }> = [
  { author: 'Guvenlik_Analisti', text: 'Sistem logları günlük olarak denetlenmektedir.' }
];

function parseVulnerableMarkdown(text: string): string {
  // Vulnerable markdown link parser: allows javascript: links without sanitization!
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #38bdf8; text-decoration: underline;">$1</a>');
}

export async function handleBlogPost(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const newComment = ctx.query['comment'];
  const author = ctx.query['author'] || 'Misafir';

  if (ctx.req.method === 'POST' && newComment) {
    storedComments.push({ author, text: newComment });
  }

  const commentsHtml = storedComments
    .map(
      (c) => `
      <div style="background: #090e1a; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #334155;">
        <strong style="color: #38bdf8; font-size: 12px;">${escapeHtml(c.author)}:</strong>
        <div style="margin-top: 4px; font-size: 13px; color: #f1f5f9;">${parseVulnerableMarkdown(c.text)}</div>
      </div>`
    )
    .join('');

  const html = ctx.createHtml(
    'Mühendislik Günlüğü // ACME Savunma',
    `<div class="container">
      <h2 style="font-size: 20px; margin-bottom: 6px;">İç Güvenlik & Mimari Raporu</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 16px;">
        Yayınlanan teknik makale. Yorumlar Markdown formatında kaydedilir ve yönetici tarafından incelenir.
      </p>

      <div style="background: #0f172a; padding: 16px; border-radius: 6px; border: 1px solid #334155; margin-bottom: 20px;">
        <h4 style="font-size: 14px; color: #00ff9d; margin-bottom: 6px;">Teknik Özet #01</h4>
        <p style="font-size: 12px; color: #cbd5e1;">Markdown ayrıştırıcısı kullanıcı yorumlarını dinamik olarak HTML etiketlerine dönüştürmektedir.</p>
      </div>

      <h3 style="font-size: 15px; margin-bottom: 10px;">Yorumlar (${storedComments.length}):</h3>
      ${commentsHtml}

      <div style="margin-top: 20px;">
        <h4 style="font-size: 13px; color: #94a3b8; margin-bottom: 6px;">Yorum Bırak (Markdown Destekli):</h4>
        <form action="/post" method="POST">
          <input type="text" name="author" placeholder="Adınız / Rumuz..." style="margin-bottom: 8px;">
          <textarea name="comment" rows="3" placeholder="Yorumunuz (Örn: [Rapor](javascript:alert(1)))..."></textarea>
          <button type="submit">Yorumu Gönder</button>
        </form>
      </div>

      <!-- Simulated admin visit triggers the cookie -->
      <script>
        document.cookie = "victim_admin_cookie=FLAG{st0r3d_m4rkd0wn_xss_pwn3d}; path=/";
      </script>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': 'victim_admin_cookie=FLAG{st0r3d_m4rkd0wn_xss_pwn3d}; Path=/'
    },
    setCookies: {
      victim_admin_cookie: 'FLAG{st0r3d_m4rkd0wn_xss_pwn3d}'
    },
    html
  };
}
