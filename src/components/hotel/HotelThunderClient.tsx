import React, { useState } from 'react';
import './hotel.css';
import { Send, Copy, Check, Server, Plus, Trash2 } from 'lucide-react';
import { dispatchHotelRequest, type SimulatedResponse } from '../../lib/hotel/virtualHotelServer';

interface HeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface HotelThunderClientProps {
  scenario?: 'api' | 'file-upload';
}

export const HotelThunderClient: React.FC<HotelThunderClientProps> = ({ scenario = 'api' }) => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>(scenario === 'file-upload' ? 'POST' : 'GET');
  const [url, setUrl] = useState<string>(scenario === 'file-upload' ? '/api/documents/upload' : '/api/customers');
  const [serverMode, setServerMode] = useState<'virtual' | 'live'>('virtual');
  const [activeTab, setActiveTab] = useState<'presets' | 'headers' | 'body'>('presets');
  
  // Headers
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: '2', key: scenario === 'file-upload' ? 'Authorization' : 'x-user-role', value: scenario === 'file-upload' ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user3' : 'guest', enabled: false }
  ]);

  // Body
  const [bodyText, setBodyText] = useState<string>(
    scenario === 'file-upload'
      ? `{\n  "fileName": "kimlik_belgesi.jpg",\n  "fileSize": 450000,\n  "mimeType": "image/jpeg"\n}`
      : `{\n  "totalPrice": 0,\n  "status": "FREE_VIP"\n}`
  );

  // Response State
  const [response, setResponse] = useState<SimulatedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Presets based on Scenario
  const presets = scenario === 'file-upload' ? [
    {
      name: "1. Adım 1: Auth Eksikliği (Anonim Dosya Yükleme)",
      desc: "Herhangi bir kimlik/token olmadan sunucu diskine dosya yazar.",
      method: 'POST' as const,
      url: '/api/documents/upload',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: `{\n  "fileName": "misafir_pasaport.pdf",\n  "fileSize": 650000,\n  "mimeType": "application/pdf"\n}`
    },
    {
      name: "2. Adım 2: Filetype Bypass (Zararlı Betik Yükleme & RCE)",
      desc: "Taranmayan dosya türü sayesinde yürütülebilir .php betiği sunucuya yüklenir.",
      method: 'POST' as const,
      url: '/api/documents/upload',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: `{\n  "fileName": "backdoor_script.php",\n  "fileSize": 32000,\n  "mimeType": "application/x-php",\n  "payload": "SIMULATED_REMOTE_EXECUTION_CALL"\n}`
    },
    {
      name: "3. Adım 3: Filesize Validation Yokluğu (500 MB DoS)",
      desc: "Boyut limiti tanımlanmadığı için sunucu diski ve belleği tükenir.",
      method: 'POST' as const,
      url: '/api/documents/upload',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: `{\n  "fileName": "server_crash_dos.iso",\n  "fileSize": 524288000,\n  "mimeType": "application/octet-stream"\n}`
    },
    {
      name: "4. Adım 4: Mavi Takım Güvenli Upload (Başarılı)",
      desc: "JWT Auth + 2MB Sınır + Magic Bytes + UUID & JWT İmzalı İndirme.",
      method: 'POST' as const,
      url: '/api/documents/secure-upload',
      headers: [
        { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
        { id: '2', key: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user3', enabled: true }
      ],
      body: `{\n  "fileName": "otel_fatura_odeme.pdf",\n  "fileSize": 920000,\n  "mimeType": "application/pdf"\n}`
    },
    {
      name: "5. Test: Güvenli Pipeline Zararlı Türü Reddeder (415)",
      desc: "Magic Bytes ve allowlist sayesinde yetkisiz uzantı engellenir.",
      method: 'POST' as const,
      url: '/api/documents/secure-upload',
      headers: [
        { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
        { id: '2', key: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user3', enabled: true }
      ],
      body: `{\n  "fileName": "zararli_trojan.exe",\n  "fileSize": 54000,\n  "mimeType": "application/x-msdownload"\n}`
    },
    {
      name: "6. Test: Güvenli Pipeline Boyut Aşımını Reddeder (413)",
      desc: "2MB üzerindeki dosyalar 413 Payload Too Large ile reddedilir.",
      method: 'POST' as const,
      url: '/api/documents/secure-upload',
      headers: [
        { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
        { id: '2', key: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user3', enabled: true }
      ],
      body: `{\n  "fileName": "cok_buyuk_video.mp4",\n  "fileSize": 18000000,\n  "mimeType": "video/mp4"\n}`
    }
  ] : [
    {
      name: "1. Müşteri PII Sızıntısı (PII Exposure)",
      desc: "Tüm müşterilerin TC kimlik ve kart bilgilerini şifresiz çeker.",
      method: 'GET' as const,
      url: '/api/customers',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: ''
    },
    {
      name: "2. IDOR / BOLA Atağı (Elif Demir VIP Verisi)",
      desc: "Oturumdaki müşteri ID:3 olmasına rağmen ID:2'nin gizli verilerine erişir.",
      method: 'GET' as const,
      url: '/api/customers/2',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: ''
    },
    {
      name: "3. Mass Assignment: Fiyatı 0 TL Yap",
      desc: "Rezervasyon fiyatını ₺33.000'den ₺0'a çeker ve statüyü VIP yapar.",
      method: 'PUT' as const,
      url: '/api/reservations/101',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: `{\n  "totalPrice": 0,\n  "status": "FREE_VIP",\n  "paymentStatus": "PAID"\n}`
    },
    {
      name: "4. Broken Access Control: Müdür Paneline Sız",
      desc: "'x-user-role: manager' başlığı ile Genel Müdür kasasına ve sırlarına ulaşır.",
      method: 'GET' as const,
      url: '/api/managers/dashboard',
      headers: [
        { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
        { id: '2', key: 'x-user-role', value: 'manager', enabled: true }
      ],
      body: ''
    },
    {
      name: "5. Master Key Kodunu Sıfırla (Fiziksel Tehdit)",
      desc: "Kral dairesinin kapı kilidini yeni '1337' koduyla açar.",
      method: 'POST' as const,
      url: '/api/managers/override-room-key',
      headers: [
        { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
        { id: '2', key: 'x-user-role', value: 'manager', enabled: true }
      ],
      body: `{\n  "roomNumber": "701",\n  "newMasterCode": "1337"\n}`
    },
    {
      name: "6. Kullanıcı Rezervasyonu Sil (IDOR Silme Senaryosu)",
      desc: "Saldırgan (Caner - ID:3), Ahmet'in rezervasyonunu (ID:101) yetkisiz bir DELETE isteğiyle siler.",
      method: 'DELETE' as const,
      url: '/api/reservations/101',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: ''
    },
    {
      name: "7. Silinmiş Rezervasyonu Doğrula (404 / Deleted Kontrolü)",
      desc: "Silinen rezervasyonun sistemden kaldırıldığını ve 404 yanıtı verdiğini doğrular.",
      method: 'GET' as const,
      url: '/api/reservations/101',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: ''
    },
    {
      name: "8. SECRET_KEY Hashleme & Kriptografik Doğrulama",
      desc: "Açık metin SECRET_KEY yerine SHA-256 tuzlu hash ile eşleşme testi gerçekleştirir.",
      method: 'POST' as const,
      url: '/api/managers/verify-secret-hash',
      headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: `{\n  "candidateSecret": "GRAND_HORIZON_SECRET_MASTER_2026"\n}`
    }
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setMethod(p.method);
    setUrl(p.url);
    if (p.headers) setHeaders(p.headers);
    if (p.body !== undefined) setBodyText(p.body);
  };

  const handleSend = async () => {
    setIsLoading(true);
    const headerObj: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.enabled && h.key) headerObj[h.key] = h.value;
    });

    try {
      const targetUrl = serverMode === 'live' && !url.startsWith('http')
        ? `http://localhost:4000${url}`
        : url;
      const resp = await dispatchHotelRequest(method, targetUrl, headerObj, bodyText);
      setResponse(resp);
    } catch (err: any) {
      setResponse({
        status: 500,
        statusText: "Internal Error",
        timeMs: 12,
        sizeBytes: 64,
        headers: {},
        data: { error: err.message || "İstek hatası" }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { id: String(Date.now()), key: '', value: '', enabled: true }]);
  };

  const handleRemoveHeader = (id: string) => {
    setHeaders(headers.filter((h) => h.id !== id));
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-dark, #0a0f1d)', overflow: 'hidden' }}>
      {/* Top Request Bar */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--bg-darker, #060910)',
        borderBottom: '1px solid var(--border-subtle, #1e293b)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Method Select */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
          style={{
            background: 'var(--bg-input, #090e1a)',
            color: method === 'GET' ? '#00f0ff' : method === 'POST' ? '#00ff9d' : method === 'PUT' ? '#fbbf24' : '#ef4444',
            border: '1px solid var(--border-subtle, #1e293b)',
            borderRadius: '5px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)'
          }}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        {/* URL Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/api/..."
          style={{
            flex: 1,
            background: 'var(--bg-input, #090e1a)',
            color: '#fff',
            border: '1px solid var(--border-subtle, #1e293b)',
            borderRadius: '5px',
            padding: '6px 10px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)'
          }}
        />

        {/* Mode Toggle */}
        <button
          onClick={() => setServerMode(serverMode === 'virtual' ? 'live' : 'virtual')}
          style={{
            padding: '6px 10px',
            borderRadius: '5px',
            border: `1px solid ${serverMode === 'live' ? '#00ff9d' : 'rgba(0, 240, 255, 0.3)'}`,
            background: serverMode === 'live' ? 'rgba(0, 255, 157, 0.15)' : 'rgba(0, 240, 255, 0.1)',
            color: serverMode === 'live' ? '#00ff9d' : '#00f0ff',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title={serverMode === 'live' ? 'Canlı Express Sunucu (Port 4000)' : 'Tarayıcı İçi WASM / Virtual Express'}
        >
          <Server size={12} />
          <span>{serverMode === 'live' ? 'CANLI' : 'SANAL'}</span>
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading}
          style={{
            padding: '6px 16px',
            borderRadius: '5px',
            border: '1px solid #00f0ff',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(0, 255, 157, 0.2))',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            cursor: isLoading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
          }}
        >
          <Send size={13} />
          <span>{isLoading ? '...' : 'GÖNDER'}</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        background: 'var(--bg-dark, #0a0f1d)',
        borderBottom: '1px solid var(--border-subtle, #1e293b)',
        gap: '4px'
      }}>
        <button
          onClick={() => setActiveTab('presets')}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'presets' ? '#00f0ff' : 'transparent'}`,
            background: 'transparent',
            color: activeTab === 'presets' ? '#00f0ff' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer'
          }}
        >
          HAZIR ŞABLONLAR ({presets.length})
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'headers' ? '#00f0ff' : 'transparent'}`,
            background: 'transparent',
            color: activeTab === 'headers' ? '#00f0ff' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer'
          }}
        >
          HEADERS ({headers.filter(h => h.enabled).length})
        </button>
        <button
          onClick={() => setActiveTab('body')}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'body' ? '#00f0ff' : 'transparent'}`,
            background: 'transparent',
            color: activeTab === 'body' ? '#00f0ff' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer'
          }}
        >
          BODY (JSON)
        </button>
      </div>

      {/* Tab Contents + Response Area (Split) */}
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: '1fr 1.2fr', overflow: 'hidden' }}>
        {/* Upper Request Tab Content */}
        <div style={{ padding: '12px', overflowY: 'auto', background: 'var(--bg-darker, #060910)' }}>
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {presets.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '5px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f0ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: p.method === 'GET' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 255, 157, 0.15)',
                        color: p.method === 'GET' ? '#00f0ff' : '#00ff9d',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800
                      }}>
                        {p.method}
                      </span>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#f8fafc' }}>
                        {p.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                      {p.desc}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>Seç ➔</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'headers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {headers.map((h) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => setHeaders(headers.map(item => item.id === h.id ? { ...item, enabled: e.target.checked } : item))}
                  />
                  <input
                    type="text"
                    value={h.key}
                    placeholder="Key (örn: x-user-role)"
                    onChange={(e) => setHeaders(headers.map(item => item.id === h.id ? { ...item, key: e.target.value } : item))}
                    style={{ flex: 1, padding: '5px', fontSize: '11px', background: '#090e1a', color: '#fff', border: '1px solid #1e293b', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}
                  />
                  <input
                    type="text"
                    value={h.value}
                    placeholder="Value (örn: manager)"
                    onChange={(e) => setHeaders(headers.map(item => item.id === h.id ? { ...item, value: e.target.value } : item))}
                    style={{ flex: 1.5, padding: '5px', fontSize: '11px', background: '#090e1a', color: '#fff', border: '1px solid #1e293b', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}
                  />
                  <button
                    onClick={() => handleRemoveHeader(h.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddHeader}
                style={{
                  marginTop: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px dashed #64748b',
                  color: '#94a3b8',
                  fontSize: '10.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  width: 'fit-content'
                }}
              >
                <Plus size={11} />
                <span>Header Ekle</span>
              </button>
            </div>
          )}

          {activeTab === 'body' && (
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                height: '100%',
                background: '#090e1a',
                color: '#00ff9d',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #1e293b',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>

        {/* Lower Response View */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-dark, #0a0f1d)',
          borderTop: '1px solid var(--border-subtle, #1e293b)',
          overflow: 'hidden'
        }}>
          {/* Response Metadata Bar */}
          <div style={{
            padding: '6px 14px',
            background: '#060910',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>YANIT (RESPONSE):</span>
              {response && (
                <>
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '3px',
                    fontWeight: 800,
                    background: response.status >= 200 && response.status < 300 ? 'rgba(0, 255, 157, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: response.status >= 200 && response.status < 300 ? '#00ff9d' : '#ef4444',
                    border: `1px solid ${response.status >= 200 && response.status < 300 ? '#00ff9d' : '#ef4444'}`
                  }}>
                    {response.status} {response.statusText}
                  </span>
                  <span style={{ color: '#64748b' }}>⏱ {response.timeMs} ms</span>
                  <span style={{ color: '#64748b' }}>📦 {response.sizeBytes} B</span>
                </>
              )}
            </div>

            {response && (
              <button
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? '#00ff9d' : '#94a3b8',
                  fontSize: '10.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                <span>{copied ? 'KOPYALANDI!' : 'JSON Kopyala'}</span>
              </button>
            )}
          </div>

          {/* Response Body Text */}
          <div style={{ flex: 1, padding: '10px 14px', overflowY: 'auto' }}>
            {response ? (
              <pre style={{
                margin: 0,
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                color: response.status >= 200 && response.status < 300 ? '#e2e8f0' : '#fecaca',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.4'
              }}>
                {JSON.stringify(response.data, null, 2)}
              </pre>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                Henüz istek gönderilmedi. Yukarıdan bir şablon seçin veya GÖNDER'e basın.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
