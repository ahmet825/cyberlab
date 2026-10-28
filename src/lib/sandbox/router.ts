import type {
  VirtualHttpRequest,
  VirtualHttpResponse,
  RouteHandler,
  RouteContext,
  HttpMethod
} from './types';
import { renderHtmlPage } from './template';

interface RouteEntry {
  method?: HttpMethod | 'ALL';
  path: string | RegExp;
  handler: RouteHandler;
}

export class VirtualRouter {
  private routes: RouteEntry[] = [];

  get(path: string | RegExp, handler: RouteHandler): this {
    this.routes.push({ method: 'GET', path, handler });
    return this;
  }

  post(path: string | RegExp, handler: RouteHandler): this {
    this.routes.push({ method: 'POST', path, handler });
    return this;
  }

  all(path: string | RegExp, handler: RouteHandler): this {
    this.routes.push({ method: 'ALL', path, handler });
    return this;
  }

  async handle(incoming: VirtualHttpRequest): Promise<VirtualHttpResponse> {
    let cleanPath = incoming.path || '/';
    let hash = '';
    const query: Record<string, string> = { ...(incoming.query || {}) };

    try {
      if (/^https?:\/\//i.test(cleanPath)) {
        const parsed = new URL(cleanPath);
        cleanPath = parsed.pathname;
        hash = parsed.hash;
        for (const [k, v] of parsed.searchParams.entries()) {
          if (!query[k]) query[k] = v;
        }
      } else {
        const hashIdx = cleanPath.indexOf('#');
        if (hashIdx !== -1) {
          hash = cleanPath.slice(hashIdx);
          cleanPath = cleanPath.slice(0, hashIdx);
        }
        const qIdx = cleanPath.indexOf('?');
        if (qIdx !== -1) {
          const sp = new URLSearchParams(cleanPath.slice(qIdx + 1));
          for (const [k, v] of sp.entries()) {
            if (!query[k]) query[k] = v;
          }
          cleanPath = cleanPath.slice(0, qIdx);
        }
      }
    } catch {
      cleanPath = cleanPath.split('#')[0].split('?')[0];
    }

    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (cleanPath.length > 1) cleanPath = cleanPath.replace(/\/+$/, '') || '/';

    // Normalize incoming headers to lowercase
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(incoming.headers || {})) {
      headers[k.toLowerCase()] = v;
    }

    // Merge request body into query if it is form urlencoded
    if (incoming.body && incoming.method === 'POST') {
      try {
        const sp = new URLSearchParams(incoming.body);
        for (const [k, v] of sp.entries()) {
          if (!query[k]) query[k] = v;
        }
      } catch {
        // keep as is
      }
    }

    const cookies = incoming.cookies || {};
    const createHtml = (title: string, bodyContent: string) =>
      renderHtmlPage(title, bodyContent, { cookies, hash });

    const ctx: RouteContext = {
      req: incoming,
      path: cleanPath,
      query,
      headers,
      cookies,
      createHtml
    };

    const method = incoming.method || 'GET';

    for (const r of this.routes) {
      if (r.method !== 'ALL' && r.method !== method) continue;

      let matches = false;
      if (typeof r.path === 'string') {
        matches = r.path === cleanPath;
      } else if (r.path instanceof RegExp) {
        matches = r.path.test(cleanPath);
      }

      if (matches) {
        try {
          return await r.handler(ctx);
        } catch (err: any) {
          return {
            status: 500,
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            html: createHtml(
              '500 // Sunucu Hatası',
              `<div class="container"><div class="badge-error"><h3>500 Internal Server Error</h3><p>${err?.message || err}</p></div></div>`
            )
          };
        }
      }
    }

    // Default 404 handler
    return {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      html: createHtml(
        '404 // Sayfa Bulunamadı',
        `<div class="container">
          <div class="badge-error">
            <h2 style="font-size: 18px; margin-bottom: 6px;">404 — Kaynak Bulunamadı</h2>
            <p style="font-size: 12px; color: #cbd5e1;">İstenen rota mevcut değil: <code>${cleanPath}</code></p>
          </div>
          <a href="/" style="color: #38bdf8; font-size: 12px; text-decoration: none;">&larr; Ana Portala Dön</a>
        </div>`
      )
    };
  }
}
