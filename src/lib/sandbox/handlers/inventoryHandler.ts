import type { RouteContext, VirtualHttpResponse } from '../types';
import { executeVulnerableQuery } from '../../sql/sqliteEngine';
import { synthesizeExploitFlag } from '../flagVault';

export async function handleInventory(ctx: RouteContext): Promise<VirtualHttpResponse> {
  const category = ctx.query['category'] || 'Electronics';
  let errorMessage: string | null = null;
  let rows: any[] = [];
  let blindFlagAlert: string | null = null;

  // Execute vulnerable SQLite query
  const sqlQuery = `SELECT id, name, price, category FROM products WHERE category = '${category}'`;
  const res = await executeVulnerableQuery(sqlQuery);

  if (res.error) {
    errorMessage = `SQL SYNTAX EXCEPTION: ${res.error}`;
  } else {
    rows = res.values;
  }

  // Check for Blind Boolean SQLi confirmation (Challenge-11)
  const lowerCat = category.toLowerCase();
  if (
    lowerCat.includes('system_secrets') ||
    lowerCat.includes('secure_vault') ||
    lowerCat.includes('root_vault_flag') ||
    lowerCat.includes('1=2') ||
    lowerCat.includes('1 = 2')
  ) {
    const dynamicFlag = synthesizeExploitFlag('lab-sqli-blind-boolean', 'blind_boolean_diff') || '';
    blindFlagAlert = `
      <div class="badge-success" style="margin-bottom: 14px;">
        <strong>KÖR SQL ENJEKSİYONU (Blind Boolean SQLi) BAŞARILI!</strong>
        <p style="font-size: 12px; margin-top: 4px;">
          Doğru (True: 1=1) ve Yanlış (False: 1=2) mantıksal yanıt farkıyla gizli kasa anahtarı deşifre edildi.
        </p>
        <p style="font-size: 13px; margin-top: 6px;">
          <strong>Bayrak:</strong> <code>${dynamicFlag}</code>
        </p>
      </div>`;
  }

  const tableRows = rows.map((r) => {
    const hasFlag = r.some((cell: any) => String(cell).includes('FLAG'));
    return `
    <tr style="${hasFlag ? 'background: rgba(0, 255, 157, 0.12); font-weight: bold;' : ''}">
      <td>${r[0]}</td>
      <td>${r[1]}</td>
      <td style="${hasFlag ? 'color: #00ff9d;' : ''}">${r[2]}</td>
      <td>${r[3]}</td>
    </tr>
  `;
  }).join('');

  const html = ctx.createHtml(
    'Envanter // ACME Savunma Portalı',
    `<div class="container">
      <h2 style="font-size: 20px; margin-bottom: 8px;">Donanım & Ürün Kataloğu</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 18px;">
        Kategori bazlı SQL filtreleme (Zafiyetli parametre: <code>category</code>).
      </p>

      <form action="/inventory" method="GET">
        <input type="text" name="category" value="${category.replace(/"/g, '&quot;')}" placeholder="Örn: Electronics' UNION SELECT 1, acc_username, acc_pass_hash, acc_role FROM corp_accounts--">
        <button type="submit">Filtrele</button>
      </form>

      ${blindFlagAlert || ''}
      ${errorMessage ? `<div class="badge-error" style="margin-top: 16px;">${errorMessage}</div>` : ''}

      <table style="margin-top: 16px;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ürün / Başlık</th>
            <th>Fiyat / Parola</th>
            <th>Kategori / Rol</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || '<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 16px;">Sorgu sonucu boş döndü (False condition veya eşleşen kayıt yok).</td></tr>'}
        </tbody>
      </table>
    </div>`
  );

  return {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    html
  };
}
