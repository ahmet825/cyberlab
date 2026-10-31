import React, { useState } from 'react';
import './hotel.css';
import { Bot, Sparkles, ChevronRight, ChevronLeft, RefreshCw, Layers, ShieldCheck, AlertOctagon, Terminal } from 'lucide-react';

interface TheoryLesson {
  id: string;
  title: string;
  vulnType: string;
  aiCommentary: string[];
  diagramType: 'idor' | 'mass_assignment' | 'broken_auth' | 'defense_depth' | 'upload_auth' | 'upload_type' | 'upload_size' | 'upload_jwt_storage';
}

interface HotelWhiteboardAIProps {
  scenario?: 'api' | 'file-upload';
}

const API_LESSONS: TheoryLesson[] = [
  {
    id: 'idor',
    title: '1. IDOR / BOLA Zafiyeti Teori Çizimi',
    vulnType: 'Broken Object Level Authorization (OWASP API #1)',
    aiCommentary: [
      'Selam siber dedektif! Tahtaya dikkatle bak: Normal şartlarda müşteri (ID: 3) Caner, sisteme giriş yapmış durumda.',
      'Saldırgan URL parametresini değiştirerek "/api/customers/2" isteği atıyor.',
      'Kırmızı ile işaretlediğim Express sunucu katmanında SAHİPLİK KONTROLÜ (Ownership Check) eksik!',
      'Sunucu veritabanına doğrudan "SELECT * FROM customers WHERE id = 2" sorgusu atıyor ve Devlet Protokolü VIP misafiri Elif Demir\'in TC ve kredi kartını teslim ediyor.',
      'Aynı IDOR zafiyetiyle "DELETE /api/reservations/101" çağrıldığında, Ahmet Yılmaz\'ın rezervasyonu sistemden yetkisiz olarak kalıcı silinir!'
    ],
    diagramType: 'idor'
  },
  {
    id: 'mass_assignment',
    title: '2. Mass Assignment (Toplu Atama) Zafiyeti',
    vulnType: 'Object Injection / Mass Assignment (OWASP API #6)',
    aiCommentary: [
      'Şimdi rezervasyon sistemindeki ölümcül hatayı çiziyorum.',
      'Kullanıcı sadece "özel yastık talebi" girmesi gereken bir güncelleme isteğine gizlice `{ "totalPrice": 0, "status": "FREE_VIP" }` ekliyor.',
      'Express kodundaki `const updated = { ...res, ...req.body }` mantığı, istemciden gelen HER alanı sorgulamadan kabul ediyor!',
      'Sonuç: Otel muhasebesinde ₺168.000\'lik kral dairesi rezervasyonu sistemde ₺0 ve "ÖDENDİ" statüsüne geçiyor.'
    ],
    diagramType: 'mass_assignment'
  },
  {
    id: 'broken_auth',
    title: '3. Broken Access Control & Header Spoofing',
    vulnType: 'Broken Function Level Authorization (OWASP API #5)',
    aiCommentary: [
      'Burası otelin en kritik noktası: Müdür Yönetim Paneli ve RFID Master Key kapı kontrolü.',
      'Geliştirici acemice bir hata yaparak `req.headers["x-user-role"] === "manager"` kontrolü koymuş.',
      'Unutmayın: HTTP Header\'ları tamamen istemcinin kontrolündedir! Bir tarayıcı veya REST istemcisi bu başlığı tek tıkla enjekte edebilir.',
      'Sunucu kriptografik JWT imzası aramadığı için saldırgana otel kasasının şifresi ve Master Key kodları hediye ediliyor.'
    ],
    diagramType: 'broken_auth'
  },
  {
    id: 'defense_depth',
    title: '4. Kurumsal Savunma & İyileştirme Mimarisi',
    vulnType: 'Defense in Depth & Secure Express Pipeline',
    aiCommentary: [
      'Peki bu otel sistemini nasıl tam zırhlı kale haline getiririz? İşte kurumsal mimari:',
      '1. Rate Limiting + Helmet ile brute-force ve başlık enjeksiyonları filtrelenir.',
      '2. Kriptografik imzalı JWT ile oturum doğrulanır; istemci rolleri manipüle edemez.',
      '3. Allowlist / DTO şemaları (Zod) ile sadece izin verilen input alanları sunucuya kabul edilir.',
      '4. Veritabanından PII verisi çekilirken TC ve kart numaraları kesinlikle filtrelenir.',
      '5. SECRET_KEY Hashleme: Sistem ve müdür sırları asla düz metin saklanmaz; tuzlanmış SHA-256 / argon2 ile şifrelenir ve DELETE işlemlerinde sahiplik denetlenir.'
    ],
    diagramType: 'defense_depth'
  }
];

const FILE_UPLOAD_LESSONS: TheoryLesson[] = [
  {
    id: 'upload_auth',
    title: 'Adım 1: Auth (Kimlik Doğrulama) Kontrolü',
    vulnType: 'Unauthenticated File Upload / Anonim Disk Yazma',
    aiCommentary: [
      'Tahtaya odaklan: Dosya yükleme ucu `/api/documents/upload` herhangi bir kimlik kontrolü yapmıyor!',
      'Zafiyet Nereden Kaynaklanıyor? Rota üzerinde hiçbir JWT / Session doğrulama middleware\'i bulunmuyor; sunucu gelen her isteği anonim kabul ediyor.',
      'Tehlike: İnternetteki herhangi bir bot veya saldırgan sunucu diskine kontrolsüzce dosya bırakabiliyor.',
      'Nasıl Kapatırız? Endpoint\'e `authenticateJWT` middleware\'i eklenir. `Authorization: Bearer <token>` taşımayan tüm istekler anında 401 Unauthorized ile kesilir.'
    ],
    diagramType: 'upload_auth'
  },
  {
    id: 'upload_type',
    title: 'Adım 2: Filetype Validation (MIME & Magic Bytes)',
    vulnType: 'Remote Code Execution (RCE) / Web Shell',
    aiCommentary: [
      'Şimdi en tehlikeli saldırı senaryosunu çiziyorum: Web Shell Enjeksiyonu.',
      'Zafiyet Nereden Kaynaklanıyor? Sunucu sadece `file.originalname` sonundaki uzantıya veya istemcinin beyan ettiği sahte `Content-Type: image/png` başlığına güveniyor!',
      'Saldırgan `c99_shell.php` zararlı betiğini resim başlığıyla yüklüyor ve sunucuda doğrudan komut çalıştırma (RCE) elde ediyor.',
      'Nasıl Kapatırız? İstemci başlığına güvenilmez! `fileTypeFromBuffer` ile dosyanın ilk baytları (Magic Bytes) taranır, katı Allowlist (.pdf, .jpg, .png) uygulanır ve dosya çalıştırma izni kaldırılır.'
    ],
    diagramType: 'upload_type'
  },
  {
    id: 'upload_size',
    title: 'Adım 3: Filesize Validation (DoS & Depolama Koruma)',
    vulnType: 'Denial of Service (DoS) & Disk Exhaustion',
    aiCommentary: [
      'Dosya boyutu kısıtlanmadığında sunucunun başına ne gelir? İşte felaket senaryosu:',
      'Zafiyet Nereden Kaynaklanıyor? Multer yapılandırmasında `limits: { fileSize: ... }` parametresi unutulmuş!',
      'Saldırgan döngüsel isteklerle 500 MB - 1 GB\'lık devasa dosyalar pompalayarak sunucu diskini ve RAM belleğini tüketiyor.',
      'Nasıl Kapatırız? Multer seviyesinde katı bir 2 MB sınırı (`fileSize: 2 * 1024 * 1024`) konur. Limit aşıldığında istek anında 413 Payload Too Large ile diske yazılmadan reddedilir.'
    ],
    diagramType: 'upload_size'
  },
  {
    id: 'upload_jwt_storage',
    title: 'Adım 4: JWT ile İmzalama & Güvenli Depolama',
    vulnType: 'PII Exposure & Protected Presigned URL Architecture',
    aiCommentary: [
      'Otel misafirlerinin kimlik fotokopilerini `/public/uploads/kimlik.jpg` olarak saklarsanız tüm dünya indirebilir!',
      'Zafiyet Nereden Kaynaklanıyor? Dosyaların web köküne konulması, orijinal isimlerin tahmin edilebilir olması ve indirme için imza doğrulaması yapılmamasıdır.',
      'Mavi Takım Çözümü: 1) Dosyaya rastgele `crypto.randomUUID()` adı verilir. 2) Web kökü dışındaki özel güvenli dizinde (veya S3 Private Bucket) saklanır.',
      'Nasıl Kapatırız? Dosyayı indirmek isteyen misafire 15 dakika geçerli JWT İmzalı URL (Presigned Token) üretilir. Sunucu bu imzayı doğrulamadan dosyayı asla teslim etmez.'
    ],
    diagramType: 'upload_jwt_storage'
  }
];

export const HotelWhiteboardAI: React.FC<HotelWhiteboardAIProps> = ({ scenario = 'api' }) => {
  const lessons = scenario === 'file-upload' ? FILE_UPLOAD_LESSONS : API_LESSONS;
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const lesson = lessons[activeLessonIndex] || lessons[0];

  const handleNextStep = () => {
    if (currentStep < lesson.aiCommentary.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectLesson = (idx: number) => {
    setActiveLessonIndex(idx);
    setCurrentStep(0);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-darker, #060910)',
      color: 'var(--text-main, #f8fafc)',
      fontFamily: 'var(--font-mono, monospace)',
      overflow: 'hidden'
    }}>
      {/* Top Frame */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        backgroundColor: 'var(--bg-dark, #0a0f1d)',
        borderBottom: '1px solid var(--border-subtle, #1e293b)',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            padding: '3px',
            borderRadius: '4px',
            background: 'rgba(0, 255, 157, 0.1)',
            color: 'var(--accent-green, #00ff9d)',
            border: '1px solid var(--border-accent, rgba(0, 255, 157, 0.3))'
          }}>
            <Bot size={14} />
          </div>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--accent-green, #00ff9d)' }}>Öğretmen Tahtası</span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)', marginLeft: '6px' }}>Dr. Sentinel AI Siber Teori Çizimi</span>
          </div>
        </div>

        {/* Lesson Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {lessons.map((l: TheoryLesson, i: number) => (
            <button
              key={l.id}
              onClick={() => handleSelectLesson(i)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: activeLessonIndex === i ? 800 : 500,
                background: activeLessonIndex === i ? 'rgba(0, 255, 157, 0.2)' : 'transparent',
                color: activeLessonIndex === i ? 'var(--accent-green, #00ff9d)' : 'var(--text-dim, #64748b)',
                border: activeLessonIndex === i ? '1px solid var(--accent-green, #00ff9d)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              #{i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* AI Speech Bubble & Assistant */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 14px',
        backgroundColor: 'var(--bg-dark, #0a0f1d)',
        borderBottom: '1px solid var(--border-subtle, #1e293b)'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-cyan, #00f0ff) 0%, var(--accent-green, #00ff9d) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 15px rgba(0, 255, 157, 0.3)'
        }}>
          <Sparkles size={15} color="#000" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan, #00f0ff)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Dr. Sentinel (AI Teori Anlatıcısı)</span>
              <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-card, #0f172a)', color: 'var(--accent-green, #00ff9d)', border: '1px solid var(--border-subtle, #1e293b)' }}>
                Adım {currentStep + 1} / {lesson.aiCommentary.length}
              </span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  background: 'var(--bg-card, #0f172a)',
                  color: 'var(--text-muted, #94a3b8)',
                  border: '1px solid var(--border-subtle, #1e293b)',
                  cursor: currentStep > 0 ? 'pointer' : 'default',
                  opacity: currentStep === 0 ? 0.3 : 1
                }}
                title="Önceki Adım"
              >
                <ChevronLeft size={12} />
              </button>
              <button
                onClick={handleNextStep}
                disabled={currentStep === lesson.aiCommentary.length - 1}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.2) 0%, rgba(0, 240, 255, 0.2) 100%)',
                  border: '1px solid var(--border-accent, rgba(0, 255, 157, 0.4))',
                  color: 'var(--accent-green, #00ff9d)',
                  fontWeight: 700,
                  fontSize: '10.5px',
                  cursor: currentStep < lesson.aiCommentary.length - 1 ? 'pointer' : 'default',
                  opacity: currentStep === lesson.aiCommentary.length - 1 ? 0.3 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
                title="Sonraki Adımı Çiz"
              >
                <span>İleri</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-main, #f8fafc)', lineHeight: 1.5, fontFamily: 'var(--font-ui, sans-serif)' }}>
            "{lesson.aiCommentary[currentStep]}"
          </p>
        </div>
      </div>

      {/* Board Canvas */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflow: 'auto',
        position: 'relative',
        backgroundColor: 'var(--bg-darker, #060910)',
        backgroundImage: 'radial-gradient(rgba(0, 255, 157, 0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}>
        {/* 1. IDOR DIYAGRAMI */}
        {lesson.diagramType === 'idor' && (
          <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(0, 255, 157, 0.12)', color: 'var(--accent-green, #00ff9d)', border: '1px solid var(--border-accent)' }}>
                BOLA / IDOR Zafiyet Akışı
              </span>
            </div>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
              {/* Node 1: Saldırgan */}
              <div style={{ padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255, 51, 102, 0.6)', background: 'rgba(255, 51, 102, 0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>🥷</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-red, #ff3366)' }}>Saldırgan (Caner)</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)' }}>Oturum ID: 3</div>
                <div style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 51, 102, 0.2)', color: '#fecaca', marginTop: '4px' }}>
                  GET /api/customers/2
                </div>
              </div>

              {/* Arrow 1 */}
              <div style={{ textAlign: 'center', color: 'var(--accent-orange, #f59e0b)', fontSize: '10px', fontWeight: 800 }}>
                <span>Parametre ➔</span>
                <div style={{ height: '2px', background: 'linear-gradient(90deg, #ff3366, #f59e0b)', margin: '4px 0' }} />
                <span style={{ fontSize: '9px', color: 'var(--text-dim, #64748b)' }}>id = 2</span>
              </div>

              {/* Node 2: Express Server (Açıklı Nokta) */}
              <div style={{ padding: '12px', borderRadius: '8px', border: '1px dashed rgba(245, 158, 11, 0.7)', background: 'rgba(245, 158, 11, 0.08)', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-8px', right: '-6px', background: 'var(--accent-red, #ff3366)', color: '#fff', fontSize: '8px', fontWeight: 900, padding: '2px 6px', borderRadius: '10px' }}>
                  AÇIK BURADA!
                </div>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>⚙️</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-orange, #f59e0b)' }}>Express Router</div>
                <div style={{ fontSize: '9px', color: 'var(--accent-red, #ff3366)', background: 'rgba(255, 51, 102, 0.2)', padding: '2px 4px', borderRadius: '4px', marginTop: '4px' }}>
                  ❌ req.user Kontrolü Yok!
                </div>
              </div>
            </div>

            {/* Down Arrow to DB */}
            <div style={{ textAlign: 'center', color: 'var(--accent-red, #ff3366)', fontSize: '10px', fontWeight: 800 }}>
              <span>⬇ Yetkisiz DB Sorgusu ⬇</span>
              <div style={{ width: '2px', height: '16px', background: 'var(--accent-red, #ff3366)', margin: '2px auto' }} />
            </div>

            {/* Node 3: Otel DB & Hedef Veri */}
            <div style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-accent, rgba(0, 255, 157, 0.4))', background: 'rgba(0, 255, 157, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>🏨</span>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--accent-green, #00ff9d)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Otel Müşteri Veritabanı</span>
                    <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255, 51, 102, 0.15)', color: 'var(--accent-red, #ff3366)' }}>
                      PII SIZINTISI
                    </span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-main, #f8fafc)', marginTop: '2px' }}>
                    Kayıt: <strong>Elif Demir (VIP Platinum)</strong> | TC: 19284719283 | Kart: **** 8832
                  </div>
                </div>
              </div>
              <div style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 51, 102, 0.15)', color: 'var(--accent-red, #ff3366)', border: '1px solid rgba(255, 51, 102, 0.3)', fontSize: '9.5px', fontWeight: 800 }}>
                VERİ İFŞA OLDU!
              </div>
            </div>
          </div>
        )}

        {/* 2. MASS ASSIGNMENT DIYAGRAMI */}
        {lesson.diagramType === 'mass_assignment' && (
          <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-orange, #f59e0b)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                Mass Assignment (Toplu Atama) Fiyat Sıfırlama
              </span>
            </div>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 51, 102, 0.4)', background: 'var(--bg-card, #0f172a)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-red, #ff3366)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertOctagon size={12} /> İstemci JSON Body
                </div>
                <pre style={{ margin: 0, fontSize: '10px', color: '#fca5a5', background: 'var(--bg-input, #090e1a)', padding: '6px', borderRadius: '4px' }}>
{`{
  "totalPrice": 0,    <-- HACK!
  "status": "FREE_VIP"
}`}
                </pre>
              </div>

              <div style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'var(--bg-card, #0f172a)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-orange, #f59e0b)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Terminal size={12} /> Express Kodu
                </div>
                <pre style={{ margin: 0, fontSize: '10px', color: '#fde68a', background: 'var(--bg-input, #090e1a)', padding: '6px', borderRadius: '4px' }}>
{`const updated = {
  ...reservation,
  ...req.body // ZAFİYET!
};`}
                </pre>
              </div>
            </div>

            <div style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid rgba(255, 51, 102, 0.3)', textAlign: 'center', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                Orijinal: <del>₺168.000</del>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--accent-red, #ff3366)', fontWeight: 900 }}>
                ➔ Yeni Fiyat: ₺0 (BEDAVA KONAKLAMA)
              </span>
            </div>
          </div>
        )}

        {/* 3. BROKEN AUTH DIYAGRAMI */}
        {lesson.diagramType === 'broken_auth' && (
          <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                Header Spoofing & Yetki Aşımı
              </span>
            </div>

            <div style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.4)', background: 'var(--bg-card, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#d8b4fe' }}>Enjekte Edilen HTTP Header:</div>
                <code style={{ fontSize: '11.5px', color: 'var(--accent-green, #00ff9d)', fontWeight: 800 }}>x-user-role: manager</code>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-orange, #f59e0b)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                İmzalanmamış Başlık!
              </span>
            </div>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle, #1e293b)', background: 'var(--bg-input, #090e1a)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)', display: 'block', marginBottom: '2px' }}>Aşılan Bariyer:</span>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--accent-red, #ff3366)' }}>Müdür Finans Kasası</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)', marginTop: '2px' }}>₺2,450,000 Şifre: 77-41-99</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle, #1e293b)', background: 'var(--bg-input, #090e1a)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)', display: 'block', marginBottom: '2px' }}>Fiziksel Tehdit:</span>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--accent-red, #ff3366)' }}>Oda RFID Master Kodu</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)', marginTop: '2px' }}>Tüm kapı kilitleri devralındı</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. DEFENSE IN DEPTH DIYAGRAMI */}
        {lesson.diagramType === 'defense_depth' && (
          <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(0, 255, 157, 0.12)', color: 'var(--accent-green, #00ff9d)', border: '1px solid var(--border-accent)' }}>
                Kurumsal Savunma Katmanları
              </span>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0, 255, 157, 0.06)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green, #00ff9d)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="var(--accent-green, #00ff9d)" /> Katman 1: WAF & Rate Limiter
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)' }}>Brute-force ve DDoS engelleme</span>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.06)', border: '1px solid var(--border-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan, #00f0ff)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="var(--accent-cyan, #00f0ff)" /> Katman 2: Kriptografik İmzalı JWT
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)' }}>Header manipülasyonu imkansız</span>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-orange, #f59e0b)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="var(--accent-orange, #f59e0b)" /> Katman 3: DTO & Allowlist (Zod)
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)' }}>Sadece izin verilen alanlar yazılır</span>
            </div>
          </div>
        )}

        {/* 5. UPLOAD AUTH DIYAGRAMI */}
        {lesson.diagramType === 'upload_auth' && (
          <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                Adım 1: Kimlik Doğrulamasız (Unauthenticated) Dosya Yükleme Zafiyeti
              </span>
            </div>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '8px', border: '1px dashed #ef4444', background: 'rgba(239, 68, 68, 0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px' }}>🤖</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171' }}>Anonim Saldırgan / Bot</div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Oturum Tokenı YOK</div>
                <div style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', color: '#fecaca', marginTop: '4px' }}>
                  POST /api/documents/upload
                </div>
              </div>

              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '10px', fontWeight: 800 }}>
                <span>❌ Token Yok ➔</span>
                <div style={{ height: '2px', background: '#ef4444', margin: '4px 0' }} />
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Filtresiz Geçiş</span>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px' }}>⚙️</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444' }}>Express Rota Katmanı</div>
                <div style={{ fontSize: '9px', color: '#f87171', marginTop: '2px' }}>❌ authenticateJWT Eksik!</div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Tüm anonim dosya isteklerini kabul ediyor</div>
              </div>
            </div>

            <div style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#60a5fa' }}>🛡️ Mavi Takım Çözümü:</span>
                <span style={{ fontSize: '10px', color: '#cbd5e1', marginLeft: '6px' }}>Rotaya 'authenticateJWT' middleware'i ekle; token yoksa 401 Unauthorized dön.</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. UPLOAD TYPE DIYAGRAMI */}
        {lesson.diagramType === 'upload_type' && (
          <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                Adım 2: Sahte MIME / Uzantı Hilesi & Web Shell RCE Anatomisi
              </span>
            </div>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', marginBottom: '4px' }}>🔥 Saldırganın Sahte Yüklemesi:</div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  Dosya: <strong>c99_shell.php</strong><br/>
                  Header: <code>Content-Type: image/png</code> (Sahte)<br/>
                  İçerik: <code>&lt;?php system($_GET['cmd']); ?&gt;</code>
                </div>
              </div>

              <div style={{ padding: '10px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>❌ Sunucunun Hatalı Doğrulaması:</div>
                <div style={{ fontSize: '10px', color: '#cbd5e1' }}>
                  Sunucu yalnızca istemcinin yolladığı HTTP başlığına bakıyor!<br/>
                  Magic Bytes (Dosya bayt imzası) taranmadığı için web shell sunucuda çalıştırılıyor!
                </div>
              </div>
            </div>

            <div style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#60a5fa' }}>🛡️ Mavi Takım Çözümü:</span>
              <span style={{ fontSize: '10px', color: '#cbd5e1', marginLeft: '6px' }}>'file-type' kütüphanesi ile dosya baytları (Magic Bytes) taranır; Allowlist (.pdf, .jpg, .png) dışındaki her dosya 415 ile reddedilir.</span>
            </div>
          </div>
        )}

        {/* 7. UPLOAD SIZE DIYAGRAMI */}
        {lesson.diagramType === 'upload_size' && (
          <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                Adım 3: Boyut Sınırlandırması (Filesize) Eksikliği & DoS Saldırısı
              </span>
            </div>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '8px', border: '1px dashed #fbbf24', background: 'rgba(245, 158, 11, 0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px' }}>💣</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>Devasa Dosya Saldırısı</div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>Boyut: 500 MB - 5 GB</div>
                <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>Döngüsel POST İstekleri</div>
              </div>

              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '10px', fontWeight: 800 }}>
                <span>limits Yok ➔</span>
                <div style={{ height: '2px', background: '#ef4444', margin: '4px 0' }} />
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Disk Tükenmesi</span>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px' }}>💥</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444' }}>Sunucu Çöküşü (DoS)</div>
                <div style={{ fontSize: '9px', color: '#cbd5e1', marginTop: '2px' }}>Disk %100 Dolu | RAM Taşması</div>
                <div style={{ fontSize: '9px', color: '#f87171', fontWeight: 700, marginTop: '2px' }}>Rezervasyon Sistemi Kilitlendi!</div>
              </div>
            </div>

            <div style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#60a5fa' }}>🛡️ Mavi Takım Çözümü:</span>
              <span style={{ fontSize: '10px', color: '#cbd5e1', marginLeft: '6px' }}>Multer ayarlarında 'limits: &#123; fileSize: 2 * 1024 * 1024 &#125;' tanımlanır; 2MB üzerindeki istekler diske yazılmadan 413 Payload Too Large ile reddedilir.</span>
            </div>
          </div>
        )}

        {/* 8. UPLOAD JWT & SECURE STORAGE DIYAGRAMI */}
        {lesson.diagramType === 'upload_jwt_storage' && (
          <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                Adım 4: Kriptografik UUID Depolama & JWT İmzalı Presigned URL Mimarisi
              </span>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#60a5fa" /> 1. Kriptografik Rastgele İsimlendirme:
              </span>
              <code style={{ fontSize: '10px', color: '#cbd5e1' }}>crypto.randomUUID() + .pdf</code>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0, 255, 157, 0.08)', border: '1px solid rgba(0, 255, 157, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#00ff9d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#00ff9d" /> 2. Web Kökü Dışı Özel Depolama:
              </span>
              <code style={{ fontSize: '10px', color: '#cbd5e1' }}>/secure_vault/documents/ (İnternete Kapalı)</code>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#c084fc" /> 3. İmzalı JWT İndirme URL'si:
              </span>
              <code style={{ fontSize: '10px', color: '#cbd5e1' }}>/api/documents/download?token=eyJhbGci...</code>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '10.5px', color: '#94a3b8', lineHeight: 1.4 }}>
              💡 Misafir belgesini indirmek istediğinde sunucu JWT imzasını doğrular; token süresi dolmuşsa (15 dk) veya dosya başkasına aitse erişimi engeller.
            </div>
          </div>
        )}
      </div>

      {/* Footer Notes */}
      <div style={{
        padding: '6px 14px',
        background: 'var(--bg-dark, #0a0f1d)',
        borderTop: '1px solid var(--border-subtle, #1e293b)',
        fontSize: '11px',
        color: 'var(--accent-green, #00ff9d)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={12} color="var(--accent-green, #00ff9d)" /> Teori: {lesson.vulnType}
        </span>
        <button
          onClick={() => setCurrentStep(0)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-dim, #64748b)', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          <RefreshCw size={10} /> Sıfırla
        </button>
      </div>
    </div>
  );
};
