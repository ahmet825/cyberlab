import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import type { LabItem, HttpRequestLog } from '../../types/lab';
import { dispatchVirtualHttpRequest } from '../../lib/sandbox/virtualServer';
import { verifyLabFlag, synthesizeExploitFlag } from '../../lib/sandbox/flagVault';
import { BrowserAddressBar, type BrowserTab } from './BrowserAddressBar';
import { RepeaterPanel } from './RepeaterPanel';
import { NetworkConsole } from './NetworkConsole';

export type { BrowserTab };
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const FALLBACK_HOST = 'target-app.local';
const FALLBACK_ORIGIN = 'https://corp-defense.local';
const USER_AGENT = 'Mozilla/5.0 (PentestLab/2.0 NativeBrowser)';

const getHost = (u: string): string => {
  try {
    return new URL(u).hostname;
  } catch {
    return FALLBACK_HOST;
  }
};

const getOrigin = (u: string): string => {
  try {
    return new URL(u).origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/** Builds the default raw HTTP/1.1 request shown in the Repeater tab. */
const buildRawRequest = (
  method: HttpMethod,
  targetUrl: string,
  bodyData: string | undefined,
  cookieJar: Record<string, string>
): string => {
  let pathOnly: string;
  try {
    const u = new URL(targetUrl);
    pathOnly = u.pathname + u.search;
  } catch {
    pathOnly = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
  }

  const lines = [
    `${method} ${pathOnly} HTTP/1.1`,
    `Host: ${getHost(targetUrl)}`,
    `User-Agent: ${USER_AGENT}`,
    'Accept: text/html,application/json,*/*'
  ];

  // HTTP carries all cookies in ONE Cookie header, separated by "; "
  const cookieHeader = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
  if (cookieHeader) lines.push(`Cookie: ${cookieHeader}`);

  if (bodyData) {
    lines.push('Content-Type: application/x-www-form-urlencoded', `Content-Length: ${bodyData.length}`, '', bodyData);
    return lines.join('\r\n');
  }
  return lines.join('\r\n') + '\r\n\r\n';
};

interface TargetBrowserProps {
  lab: LabItem;
  url: string;
  setUrl: (url: string) => void;
  cookies: Record<string, string>;
  setCookie: (key: string, value: string) => void;
  httpLogs: HttpRequestLog[];
  onTriggerXssAlert: (payload: string) => void;
  onLabSolved: (labId: string, verifiedFlag?: string) => void;
  onLogHttpRequest: (req: any) => void;
  activeTab?: BrowserTab;
  onTabChange?: (tab: BrowserTab) => void;
}

export const TargetBrowser: React.FC<TargetBrowserProps> = ({
  lab,
  url,
  setUrl,
  cookies,
  setCookie,
  httpLogs,
  onTriggerXssAlert,
  onLabSolved,
  onLogHttpRequest,
  activeTab: externalTab,
  onTabChange: externalOnTabChange
}) => {
  const [internalTab, setInternalTab] = useState<BrowserTab>('view');
  const activeTab = externalTab !== undefined ? externalTab : internalTab;
  const setActiveTab = (tab: BrowserTab) => {
    setInternalTab(tab);
    externalOnTabChange?.(tab);
  };
  const [inputUrl, setInputUrl] = useState(url);
  const [selectedLog, setSelectedLog] = useState<HttpRequestLog | null>(null);

  // Live Server HTML rendered in the sandboxed iframe.
  // renderKey forces a fresh iframe for every response (so a refresh re-executes the page).
  const [currentHtml, setCurrentHtml] = useState<string>('');
  const [renderKey, setRenderKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Realistic browser navigation & history (derived from the url, so external url changes are recorded too)
  const [nav, setNav] = useState<{ entries: string[]; index: number }>({ entries: [url], index: 0 });
  const history = nav.entries;
  const historyIndex = nav.index;

  // Every navigation bumps reloadTick so that re-visiting the SAME url still triggers a request.
  const [reloadTick, setReloadTick] = useState(0);
  // Method/body of the navigation that is about to be rendered by the url effect (e.g. a form POST).
  const pendingRequestRef = useRef<{ method: HttpMethod; body?: string } | null>(null);
  // Tracks which lab's starting URL has already been loaded so initial page load doesn't auto-complete stages
  const lastLoadedLabIdRef = useRef<string | null>(null);
  // Used to drop responses of requests that were superseded by a newer navigation.
  const requestSeqRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(100);
  const [statusBarText, setStatusBarText] = useState('Hazır');

  // Flag submission input
  const [flagInput, setFlagInput] = useState('');
  const [flagFeedback, setFlagFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // In-Browser Burp Repeater State
  const [rawRequestText, setRawRequestText] = useState<string>('');
  const [rawResponseText, setRawResponseText] = useState<string>('');
  const [isSendingRaw, setIsSendingRaw] = useState(false);

  // New cookie inputs
  const [newCookieKey, setNewCookieKey] = useState('');
  const [newCookieVal, setNewCookieVal] = useState('');

  // Don't carry a solved/failed flag banner or a selected log over to another lab
  useEffect(() => {
    setFlagInput('');
    setFlagFeedback(null);
    setSelectedLog(null);
  }, [lab.id]);

  // Dispatch real HTTP request against Virtual Server and render in Iframe
  const renderServerPage = async (
    targetUrl: string,
    method: HttpMethod = 'GET',
    bodyData?: string,
    customHeaders?: Record<string, string>,
    isInitialLoad: boolean = false
  ) => {
    const seq = ++requestSeqRef.current;
    const targetHost = getHost(targetUrl);

    setIsLoading(true);
    setLoadProgress(20);
    setStatusBarText(`Bağlanıyor: ${targetHost}...`);

    const requestHeaders = {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      ...(customHeaders || {})
    };
    const startTime = Date.now();

    try {
      const resp = await dispatchVirtualHttpRequest({
        method,
        path: targetUrl,
        query: {},
        headers: requestHeaders,
        body: bodyData,
        cookies
      });
      const durationMs = Math.max(1, Date.now() - startTime);

      // Apply any Set-Cookie from server (a real server's cookies stick even if the page was superseded)
      if (resp.setCookies) {
        for (const [k, v] of Object.entries(resp.setCookies)) {
          setCookie(k, v);
        }
      }

      // Log to DevTools Network Tab
      onLogHttpRequest({
        method,
        url: targetUrl,
        headers: requestHeaders,
        body: bodyData,
        responseStatus: resp.status,
        responseHeaders: resp.headers,
        responseBody: resp.html,
        durationMs,
        isInitialLoad
      });

      // A newer navigation started while we were waiting: don't let this response overwrite it.
      if (seq !== requestSeqRef.current) return;

      setLoadProgress(70);
      setCurrentHtml(resp.html);
      setRenderKey((k) => k + 1);
      setLoadProgress(100);
      setStatusBarText(`${resp.status} ${resp.statusText} (${durationMs}ms) // ${targetHost}`);

      // Update Burp Repeater default raw template
      setRawRequestText(buildRawRequest(method, targetUrl, bodyData, cookies));
    } catch (err: any) {
      const durationMs = Math.max(1, Date.now() - startTime);
      const message = String(err?.message ?? err);

      onLogHttpRequest({
        method,
        url: targetUrl,
        headers: requestHeaders,
        body: bodyData,
        responseStatus: 500,
        responseHeaders: {},
        responseBody: message,
        durationMs
      });

      if (seq !== requestSeqRef.current) return;

      // Never leave the browser stuck in the "loading" state when the virtual server throws
      setCurrentHtml(
        `<!DOCTYPE html><html><body style="background:#0b1120;color:#fca5a5;font-family:monospace;padding:24px">` +
        `<h3>500 Internal Server Error</h3><pre style="white-space:pre-wrap">${escapeHtml(message)}</pre></body></html>`
      );
      setRenderKey((k) => k + 1);
      setLoadProgress(100);
      setStatusBarText(`500 Internal Server Error (${durationMs}ms) // ${targetHost}`);
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoading(false);
        setLoadProgress(100);
      }
    }
  };

  // Load the page whenever the target URL changes OR a navigation to the same URL is requested.
  useEffect(() => {
    setInputUrl(url);

    // Record the visit in the history unless it is already the current entry (back/forward)
    setNav((prev) =>
      prev.entries[prev.index] === url
        ? prev
        : { entries: [...prev.entries.slice(0, prev.index + 1), url], index: prev.index + 1 }
    );

    // A form POST (or any non-GET navigation) hands its method/body over through the ref, so that
    // exactly ONE request is made.
    const pending = pendingRequestRef.current;
    pendingRequestRef.current = null;
    const isInitialLoad =
      (lastLoadedLabIdRef.current !== lab.id || (url === lab.startingUrl && reloadTick === 0)) && !pending;
    lastLoadedLabIdRef.current = lab.id;
    renderServerPage(url, pending?.method ?? 'GET', pending?.body, undefined, isInitialLoad);
  }, [url, reloadTick]);

  const navigateTo = (newUrl: string, request?: { method: HttpMethod; body?: string }) => {
    pendingRequestRef.current = request ?? null;
    if (newUrl === url) {
      setReloadTick((t) => t + 1);
    } else {
      setUrl(newUrl);
    }
  };

  // Listen to Window PostMessages from the Sandboxed Iframe (Native DOM & XSS Monitor)
  useEffect(() => {
    // Resolves absolute, root-relative ("/x"), relative ("x", "?q=1", "") and fragment ("#a") URLs
    // against the page that is currently displayed.
    const resolveUrl = (href: string): string | null => {
      try {
        return new URL(href, url).toString();
      } catch {
        return null;
      }
    };

    const handleWindowMessage = (event: MessageEvent) => {
      // Only trust messages coming from OUR sandboxed iframe (opaque origin => 'null' or empty)
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      if (event.origin !== 'null' && event.origin !== window.location.origin && event.origin !== '') return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'LAB_NATIVE_ALERT') {
        // Real JS alert executed inside the sandboxed iframe!
        const alertMsg = String(data.payload);
        onTriggerXssAlert(alertMsg);
        if (lab.category === 'XSS' || lab.id.includes('xss')) {
          const proof = lab.id === 'lab-xss-stored-markdown' ? 'xss_stored_comment_exec' : 'xss_reflect_dom_exec';
          const dynFlag = synthesizeExploitFlag(lab.id, proof) || undefined;
          onLabSolved(lab.id, dynFlag);
        }
      } else if (data.type === 'LAB_NAVIGATE' && typeof data.url === 'string') {
        const nextUrl = resolveUrl(data.url);
        if (nextUrl) navigateTo(nextUrl);
      } else if (data.type === 'LAB_FORM_SUBMIT' && typeof data.action === 'string') {
        const actionUrl = resolveUrl(data.action);
        if (!actionUrl) return;
        const formBody = typeof data.data === 'string' ? data.data : '';

        if (String(data.method).toUpperCase() === 'GET') {
          // Browsers REPLACE the action's query string with the form data (they don't append to it)
          const target = new URL(actionUrl);
          target.search = formBody;
          navigateTo(target.toString(), { method: 'GET' });
        } else {
          navigateTo(actionUrl, { method: 'POST', body: formBody });
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [url, lab.id, lab.category, onTriggerXssAlert, onLabSolved]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = inputUrl.trim();
    if (!formatted) return;
    if (!/^https?:\/\//i.test(formatted)) {
      // "/admin" -> current origin + /admin ; "host/path" -> https://host/path
      formatted = formatted.startsWith('/') ? `${getOrigin(url)}${formatted}` : `https://${formatted}`;
    }
    navigateTo(formatted);
  };

  const handleRefresh = () => {
    navigateTo(url);
  };

  const goToHistoryIndex = (idx: number) => {
    if (idx < 0 || idx >= history.length) return;
    setNav((prev) => ({ ...prev, index: idx }));
    navigateTo(history[idx]);
  };

  const handleGoBack = () => goToHistoryIndex(historyIndex - 1);
  const handleGoForward = () => goToHistoryIndex(historyIndex + 1);

  const handleAddCookie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCookieKey.trim()) return;
    setCookie(newCookieKey.trim(), newCookieVal.trim());
    setNewCookieKey('');
    setNewCookieVal('');
    // Goes through the url effect, which runs after the new cookie has been applied to props
    handleRefresh();
  };

  const handleVerifyFlag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFlag = flagInput.trim();
    if (!cleanFlag) return;

    if (verifyLabFlag(lab.id, cleanFlag)) {
      setFlagFeedback({
        success: true,
        msg: 'DOĞRU BAYRAK (Hash Doğrulandı)! Güvenlik bulmacası çözüldü!'
      });
      onLabSolved(lab.id, cleanFlag);
    } else {
      setFlagFeedback({
        success: false,
        msg: 'Hatalı bayrak! Zafiyeti istismar ederek dinamik üretilen FLAG{} değerini elde edin.'
      });
    }
  };

  // Burp Suite Style Raw HTTP Dispatcher
  const handleSendRepeaterRaw = async () => {
    setIsSendingRaw(true);
    setRawResponseText('Sending HTTP request...');

    try {
      const lines = rawRequestText.split(/\r?\n/);
      const requestLine = (lines[0] || 'GET / HTTP/1.1').trim();
      // "<METHOD> <target> [HTTP/x.y]" – the target may contain spaces (e.g. payloads), so don't split on ' '
      const match = requestLine.match(/^(\S+)\s+(.+?)(?:\s+HTTP\/\d(?:\.\d)?)?$/i);
      const method = (match?.[1] || 'GET').toUpperCase() as HttpMethod;
      const path = match?.[2] || '/';

      const headers: Record<string, string> = {};
      const bodyLines: string[] = [];
      let isBody = false;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!isBody) {
          if (line.trim() === '') {
            isBody = true;
            continue;
          }
          const cIdx = line.indexOf(':');
          if (cIdx > 0) {
            headers[line.substring(0, cIdx).trim()] = line.substring(cIdx + 1).trim();
          }
        } else {
          bodyLines.push(line);
        }
      }

      // Drop the trailing blank lines of the template; an empty body means "no body"
      const rawBody = bodyLines.join('\n').replace(/(\r?\n)+$/, '');
      const body = rawBody.length > 0 ? rawBody : undefined;

      // Use the Cookie header the user actually sent (they may have edited it), not the stored jar
      const cookieHeaderKey = Object.keys(headers).find((k) => k.toLowerCase() === 'cookie');
      const requestCookies: Record<string, string> = {};
      if (cookieHeaderKey) {
        for (const part of headers[cookieHeaderKey].split(';')) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          const eq = trimmed.indexOf('=');
          if (eq > 0) requestCookies[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
        }
      }

      const startMs = Date.now();
      const resp = await dispatchVirtualHttpRequest({
        method,
        path,
        query: {},
        headers,
        body,
        cookies: requestCookies
      });
      const durationMs = Math.max(1, Date.now() - startMs);

      // Render raw HTTP response
      let rawResp = `HTTP/1.1 ${resp.status} ${resp.statusText}\r\n`;
      for (const [k, v] of Object.entries(resp.headers)) {
        rawResp += `${k}: ${v}\r\n`;
      }
      rawResp += `\r\n${resp.html}`;
      setRawResponseText(rawResp);

      // Update DevTools
      onLogHttpRequest({
        method,
        url: path,
        headers,
        body,
        responseStatus: resp.status,
        responseHeaders: resp.headers,
        responseBody: resp.html,
        durationMs
      });
    } catch (err: any) {
      setRawResponseText(`HTTP Dispatch Error: ${err.message}`);
    } finally {
      setIsSendingRaw(false);
    }
  };

  return (
    <div id="tour-browser" data-tour="browser" className="panel w-full h-full min-w-0 min-h-0 flex flex-col overflow-hidden">
      {/* Top Browser Loading Progress Bar */}
      <div style={{ height: '3px', width: '100%', background: 'transparent', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {isLoading && (
          <div
            style={{
              height: '100%',
              width: `${loadProgress}%`,
              background: 'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))',
              boxShadow: '0 0 10px var(--accent-cyan)',
              transition: 'width 0.15s ease-out'
            }}
          />
        )}
      </div>

      {/* Browser Address & Tools Bar */}
      <div className="shrink-0">
        <BrowserAddressBar
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
          onSubmitUrl={handleUrlSubmit}
          onRefresh={handleRefresh}
          canGoBack={historyIndex > 0}
          canGoForward={historyIndex < history.length - 1}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          isLoading={isLoading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cookiesCount={Object.keys(cookies).length}
          httpLogsCount={httpLogs.length}
          flagInput={flagInput}
          setFlagInput={setFlagInput}
          onVerifyFlag={handleVerifyFlag}
          flagFeedback={flagFeedback}
        />
      </div>

      {/* Browser View Body */}
      <div className="flex-1 min-h-0 overflow-hidden relative bg-[#0b1120]">
        {/* Tab 1: Real Sandboxed Target Client Iframe. */}
        <div style={{ width: '100%', height: '100%', position: 'relative', display: activeTab === 'view' ? 'block' : 'none' }}>
          <iframe
            key={renderKey}
            ref={iframeRef}
            srcDoc={currentHtml}
            sandbox="allow-scripts allow-forms allow-modals"
            title="Target Web Application"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              background: '#0b1120'
            }}
          />
        </div>

        {/* Tab 2: Burp Suite Style Repeater */}
        {activeTab === 'repeater' && (
          <RepeaterPanel
            rawRequestText={rawRequestText}
            setRawRequestText={setRawRequestText}
            rawResponseText={rawResponseText}
            isSendingRaw={isSendingRaw}
            onSendRepeaterRaw={handleSendRepeaterRaw}
          />
        )}

        {/* Tab 3: Network & HTTP DevTools Tab */}
        {activeTab === 'network' && (
          <NetworkConsole
            httpLogs={httpLogs}
            selectedLog={selectedLog}
            setSelectedLog={setSelectedLog}
          />
        )}

        {/* Tab 4: Cookies & Storage Tab */}
        {activeTab === 'cookies' && (
          <div style={{ padding: '20px', maxWidth: '640px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '4px' }}>Tarayıcı Çerezleri (Session Cookies)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              İstemci tarafında saklanan çerezleri düzenleyin. Değişiklik yaptığınızda sayfa otomatik yenilenir.
            </p>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Anahtar (Name)</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Değer (Value)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cookies).map(([k, v]) => (
                    <tr
                      key={k}
                      onClick={() => {
                        setNewCookieKey(k);
                        setNewCookieVal(v);
                      }}
                      title="Düzenlemek için tıklayın"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{k}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: '#fff' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Set Cookie Form */}
            <form onSubmit={handleAddCookie} style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '10px' }}>
                Çerez Ekle / Değiştir
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Çerez Adı (örn: session_id)"
                  value={newCookieKey}
                  onChange={(e) => setNewCookieKey(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    color: '#fff',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Değer"
                  value={newCookieVal}
                  onChange={(e) => setNewCookieVal(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    color: '#fff',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <button type="submit" className="btn-cyber-primary" style={{ padding: '8px 14px' }}>
                  <Plus size={14} />
                  <span>Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Page Source Tab */}
        {activeTab === 'source' && (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Sunucudan Dönen Gerçek HTML Kaynağı ({url}):
              </span>
              <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                Content-Type: text/html; charset=utf-8
              </span>
            </div>
            <pre className="code-block" style={{ fontSize: '12px', lineHeight: 1.6, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
              {currentHtml}
            </pre>
          </div>
        )}
      </div>

      {/* Realistic Browser Status Bar at Bottom */}
      <div
        style={{
          height: '26px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-dim)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLoading ? 'var(--accent-orange)' : 'var(--accent-green)' }} />
          <span>{statusBarText}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Sandbox: allow-scripts, allow-forms, allow-modals</span>
          <span>SSL: TLS 1.3</span>
          <span>HTTP/2</span>
        </div>
      </div>
    </div>
  );
};