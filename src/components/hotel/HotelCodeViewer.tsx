import React, { useState } from 'react';
import './hotel.css';
import { Code, ShieldCheck, ShieldAlert, Copy, Check, FileText } from 'lucide-react';

interface HotelCodeViewerProps {
  scenario?: 'api' | 'file-upload';
}

export const HotelCodeViewer: React.FC<HotelCodeViewerProps> = ({ scenario = 'api' }) => {
  const [activeTab, setActiveTab] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [copied, setCopied] = useState(false);

  const vulnerableSource = scenario === 'file-upload' ? `/**
 * HOTEL SİSTEMİ - BELGE & FATURA YÜKLEME (ZAFİYETLİ VERSİYON)
 * Endpoint: POST /api/documents/upload
 */
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();

// ZAFİYET #1 (FILESİZE YOK): Boyut sınırı konulmamış! (limits: {} yok)
// Saldırgan 500 MB çöp veri yükleyerek sunucuyu kilitleyebilir (DoS / Disk Exhaustion)
const upload = multer({
  dest: './public/uploads/' // ZAFİYET #4 (PUBLIC DİZİN): Doğrudan internete açık web köküne kaydediliyor!
});

// ZAFİYET #2 (AUTH YOK): Herhangi bir kimlik/oturum middleware'i yok!
// Anonim botlar ve saldırganlar diledikleri gibi sunucuya dosya yazabilir.
app.post('/api/documents/upload', upload.single('document'), (req, res) => {
  // ZAFİYET #3 (FILETYPE YOK): Uzantı ve Magic Bytes kontrolü yok!
  // Saldırgan 'shell.php', 'exploit.jsp' veya 'backdoor.exe' yükleyebilir!
  const originalName = req.file.originalname;
  
  // Orijinal dosya adıyla doğrudan public erişime açık kaydediliyor
  const targetPath = path.join('./public/uploads/', originalName);
  fs.renameSync(req.file.path, targetPath);

  // İnternete açık URL teslim ediliyor (PII İfşası + Web Shell RCE)
  res.json({
    success: true,
    message: "Belge başarıyla yüklendi!",
    publicUrl: \`https://hotel.com/uploads/\${originalName}\`
  });
});` : `/**
 * HOTEL SİSTEMİ - EXPRESS BACKEND MOTORU (ZAFİYETLİ VERSİYON)
 */
import express from 'express';
const app = express();
app.use(express.json());

// 1. MÜŞTERİ BİLGİLERİ (PII Sızıntısı & IDOR)
// ZAFİYET #1: Filtreleme yok, şifresiz TC No ve Kredi Kartı sızıyor!
app.get('/api/customers', (req, res) => {
  res.json({ success: true, count: db.customers.length, customers: db.customers });
});

// ZAFİYET #2: BOLA / IDOR - İstemciden gelen :id doğrudan çekiliyor, oturum doğrulanmıyor!
app.get('/api/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id, 10);
  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Müşteri bulunamadı!" });
  
  // Saldırgan ID:3 iken ID:2'nin tüm VIP verilerini alıyor!
  res.json({ success: true, customer });
});

// 2. REZERVASYONLAR (Mass Assignment Zafiyeti)
// ZAFİYET #3: req.body filtrelenmeden nesneye yayılıyor (Spread / Object.assign)
app.put('/api/reservations/:id', (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const index = db.reservations.findIndex(r => r.id === resId);
  if (index === -1) return res.status(404).json({ error: "Bulunamadı!" });

  // Saldırgan totalPrice: 0 veya status: "FREE_VIP" göndererek fiyatı sıfırlayabilir!
  const updated = {
    ...db.reservations[index],
    ...req.body // <-- MASS ASSIGNMENT!
  };
  db.reservations[index] = updated;
  res.json({ success: true, reservation: updated });
});

// ZAFİYET #4: IDOR İLE REZERVASYON SİLME (Sahiplik Kontrolü Yok)
app.delete('/api/reservations/:id', (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const index = db.reservations.findIndex(r => r.id === resId);
  if (index === -1) return res.status(404).json({ error: "Rezervasyon bulunamadı veya silinmiş!" });

  // Tehlike: İstek yapanın oturumu ve sahipliği kontrol edilmeden siliniyor!
  const deleted = db.reservations.splice(index, 1)[0];
  res.json({ success: true, message: "Rezervasyon silindi!", deleted });
});

// 3. MÜDÜR YÖNETİM PANELİ (Broken Function Level Authorization & Plaintext SECRET_KEY)
// ZAFİYET #5: Rol doğrulaması istemcinin kontrolündeki HTTP Header'a bırakılmış!
// ZAFİYET #6: SECRET_KEY açık metin (plaintext) tutuluyor ve JSON'da sızdırılıyor!
app.get('/api/managers/dashboard', (req, res) => {
  const clientRole = req.headers['x-user-role'];

  // Saldırgan 'x-user-role: manager' ekleyerek bu if bloğunu baypas eder!
  if (clientRole !== 'manager' && clientRole !== 'general_manager') {
    return res.status(403).json({ error: "403 Forbidden: Yalnızca müdürler girebilir!" });
  }

  res.json({
    access_granted: "GENEL MÜDÜR KASASI AÇILDI!",
    treasury_cash: "₺ 2,450,000",
    safe_code: "77-41-99",
    // GÜVENSİZ: Plaintext SECRET_KEY ifşası
    rawSecretKey: "GRAND_HORIZON_SECRET_MASTER_2026",
    flag: "FLAG{HOTEL_MANAGEMENT_CONTROL_SEIZED_2026}"
  });
});

// ZAFİYET #7: Master Key Değiştirme
app.post('/api/managers/override-room-key', (req, res) => {
  const clientRole = req.headers['x-user-role'];
  if (clientRole !== 'manager') return res.status(401).json({ error: "Yetkisiz!" });

  res.json({ success: true, message: "Tüm oda RFID master kodları güncellendi!" });
});`;

  const secureSource = scenario === 'file-upload' ? `/**
 * MAVİ TAKIM - GÜVENLİ DOSYA YÜKLEME MİMARİSİ (ZIRHLI VERSİYON)
 * 4 Altın Adım: Auth -> Filesize Limits -> Filetype Magic Bytes -> JWT İmzalı Özel Depolama
 */
import express from 'express';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { authenticateJWT, requireVerifiedUser } from './middleware/auth.js';

const app = express();

// ADIM 2: FILESİZE VALİDATİON (Katı 2 MB ve 1 Dosya Sınırı - DoS Koruması)
const upload = multer({
  storage: multer.memoryStorage(), // RAM'de geçici tut, doğrulamadan diske yazma!
  limits: {
    fileSize: 2 * 1024 * 1024,      // Maksimum 2 Megabyte
    files: 1
  }
});

// ADIM 1: AUTH KONTROLÜ (JWT Kimlik ve Rol Doğrulaması)
app.post(
  '/api/documents/secure-upload',
  authenticateJWT,                  // 1. JWT Bearer token kontrolü (Anonim erişim imkansız)
  requireVerifiedUser,              // 2. Yalnızca kayıtlı misafir veya personel
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Lütfen bir dosya seçin!" });
      }

      // ADIM 3: FILETYPE VALİDATİON (Magic Bytes + Allowlist Uzantı)
      const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];
      const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.pdf'];

      // İstemci başlığına DEĞİL, dosyanın ilk baytlarına bakıyoruz (Magic Bytes):
      const detected = await fileTypeFromBuffer(req.file.buffer);
      const ext = path.extname(req.file.originalname).toLowerCase();

      if (!detected || !ALLOWED_MIME.includes(detected.mime) || !ALLOWED_EXT.includes(ext)) {
        return res.status(415).json({
          error: "415 Unsupported Media Type: Sahte veya izin verilmeyen dosya türü tespit edildi!"
        });
      }

      // ADIM 4: GÜVENLİ SAKLAMA & JWT İLE İMZALAMA
      // 4.1. Tahmin Edilemez Kriptografik UUID Dosya Adı:
      const safeKey = \`\${crypto.randomUUID()}\${ext}\`;

      // 4.2. Web Kökü Dışında Özel Güvenli Dizine / Private S3 Bucket'a Kayıt:
      await saveToPrivateSecureStorage(safeKey, req.file.buffer);

      // 4.3. Dosyaya Erişim İçin Kısa Ömürlü (15 dk) İmzalı JWT Üretimi:
      const signedDownloadToken = jwt.sign(
        { fileKey: safeKey, ownerId: req.user.id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.status(201).json({
        success: true,
        message: "Dosya 4 güvenlik katmanından geçti ve güvenle saklandı!",
        signedUrl: \`/api/documents/download?token=\${signedDownloadToken}\`,
        expiresIn: "15 Dakika (Tek Kullanımlık İmzalı Bağlantı)"
      });
    } catch (err) {
      res.status(500).json({ error: "Sunucu hatası: " + err.message });
    }
  }
);` : `/**
 * HOTEL SİSTEMİ - GÜVENLİ VE KURUMSAL EXPRESS BACKEND (DÜZELTİLMİŞ)
 */
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const app = express();
app.use(helmet()); // Güvenli HTTP Başlıkları
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // DoS & Brute-force önleme
app.use(express.json());

// 1. GÜVENLİ MÜŞTERİ PROFİLİ (IDOR & PII ÇÖZÜMÜ)
app.get('/api/customers/:id', authenticateToken, (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  // SAHİPLİK DENETİMİ (Ownership Check):
  if (req.user.role !== 'general_manager' && req.user.id !== targetId) {
    return res.status(403).json({ error: "403 Forbidden: Yalnızca kendi profilinize erişebilirsiniz!" });
  }

  const customer = db.customers.find(c => c.id === targetId);
  if (!customer) return res.status(404).json({ error: "Kayıt bulunamadı!" });

  // DTO Maskeleme (TC No ve Kart No API'den temizlenir):
  const sanitized = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    vipLevel: customer.vipLevel
  };
  res.json({ success: true, customer: sanitized });
});

// 2. GÜVENLİ REZERVASYON GÜNCELLEME (ALLOWLISTING / DTO)
const ReservationUpdateSchema = z.object({
  specialRequests: z.string().max(200).optional(),
  contactPhone: z.string().optional()
});

app.put('/api/reservations/:id', authenticateToken, (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const reservation = db.reservations.find(r => r.id === resId);

  // Sahiplik denetimi
  if (reservation.customerId !== req.user.id && req.user.role !== 'general_manager') {
    return res.status(403).json({ error: "Yetkisiz işlem!" });
  }

  // Yalnızca izin verilen alanlar valide edilip güncellenir (totalPrice kabul edilmez!):
  const validatedData = ReservationUpdateSchema.parse(req.body);
  Object.assign(reservation, validatedData);

  res.json({ success: true, message: "Rezervasyon güvenle güncellendi!" });
});

// GÜVENLİ REZERVASYON SİLME (IDOR KORUMASI & SAHİPLİK DENETİMİ)
app.delete('/api/reservations/:id', authenticateToken, (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const index = db.reservations.findIndex(r => r.id === resId);
  if (index === -1) return res.status(404).json({ error: "Rezervasyon bulunamadı veya daha önce silinmiş!" });

  // SAHİPLİK DENETİMİ: Yalnızca kendi rezervasyonunu veya Genel Müdür silebilir
  if (db.reservations[index].customerId !== req.user.id && req.user.role !== 'general_manager') {
    return res.status(403).json({ error: "Yetkisiz işlem! Başka misafirin rezervasyonunu silemezsiniz." });
  }

  db.reservations.splice(index, 1);
  res.json({ success: true, message: "Kullanıcı rezervasyonu güvenle silindi ve iptal edildi." });
});

// 3. GÜVENLİ MÜDÜR YÖNETİM PANELİ (KRİPTOGRAFİK JWT, RBAC & SECRET_KEY HASHLEME)
function requireManagerRole(req, res, next) {
  // İstemcinin keyfi 'x-user-role' başlığına değil, imzalı JWT'ye bakılır:
  if (req.user.role !== 'general_manager') {
    return res.status(403).json({ error: "Yetersiz yetki düzeyi!" });
  }
  next();
}

app.get('/api/managers/dashboard', authenticateToken, requireManagerRole, (req, res) => {
  // KORUMA: SECRET_KEY asla açık metin dönülmez. Salted SHA-256 / argon2 hash kullanılır:
  const secureSecretDigest = crypto
    .createHmac('sha256', process.env.KEY_DERIVATION_SALT)
    .update(process.env.INTERNAL_MASTER_KEY)
    .digest('hex');

  res.json({
    success: true,
    treasury_cash: "₺ 2,450,000",
    secretKeyHash: "sha256$" + secureSecretDigest,
    auditStatus: "SECURE (Plaintext Secrets Excluded)"
  });
});`;

  const copyCode = () => {
    navigator.clipboard.writeText(activeTab === 'vulnerable' ? vulnerableSource : secureSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* Code Viewer Top Bar */}
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
            background: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--accent-orange, #f59e0b)',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <Code size={14} />
          </div>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--text-main, #f8fafc)' }}>Express Backend Kaynak Kodu</span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)', marginLeft: '6px' }}>Kod Okuma & Zafiyet Analiz Laboratuvarı</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input, #090e1a)',
            padding: '2px',
            borderRadius: '5px',
            border: '1px solid var(--border-subtle, #1e293b)'
          }}>
            <button
              onClick={() => setActiveTab('vulnerable')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10.5px',
                border: 'none',
                background: activeTab === 'vulnerable' ? 'rgba(255, 51, 102, 0.2)' : 'transparent',
                color: activeTab === 'vulnerable' ? 'var(--accent-red, #ff3366)' : 'var(--text-dim, #64748b)',
                fontWeight: activeTab === 'vulnerable' ? 800 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ShieldAlert size={11} color="var(--accent-red, #ff3366)" />
              <span>Zafiyetli Kod</span>
            </button>
            <button
              onClick={() => setActiveTab('secure')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10.5px',
                border: 'none',
                background: activeTab === 'secure' ? 'rgba(0, 255, 157, 0.2)' : 'transparent',
                color: activeTab === 'secure' ? 'var(--accent-green, #00ff9d)' : 'var(--text-dim, #64748b)',
                fontWeight: activeTab === 'secure' ? 800 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ShieldCheck size={11} color="var(--accent-green, #00ff9d)" />
              <span>Düzeltilmiş (Patched)</span>
            </button>
          </div>

          <button
            onClick={copyCode}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'var(--bg-card, #0f172a)',
              border: '1px solid var(--border-subtle, #1e293b)',
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '10.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Kodu Kopyala"
          >
            {copied ? <Check size={11} color="var(--accent-green)" /> : <Copy size={11} />}
            <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflow: 'auto',
        background: 'var(--bg-darker, #060910)',
        fontSize: '11.5px',
        lineHeight: 1.6
      }}>
        <pre style={{
          margin: 0,
          color: activeTab === 'vulnerable' ? 'var(--text-main, #f8fafc)' : 'var(--accent-green, #00ff9d)',
          fontFamily: 'var(--font-mono)'
        }}>
          {activeTab === 'vulnerable' ? vulnerableSource : secureSource}
        </pre>
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '6px 14px',
        background: 'var(--bg-dark, #0a0f1d)',
        borderTop: '1px solid var(--border-subtle, #1e293b)',
        fontSize: '11px',
        color: 'var(--text-dim, #64748b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={12} color="var(--accent-cyan, #00f0ff)" />
          <span>Dosya: <code style={{ color: 'var(--text-main)' }}>server/hotel-server.js</code> (Node.js & Express)</span>
        </span>
        <span style={{ fontSize: '10px', color: activeTab === 'vulnerable' ? 'var(--accent-red, #ff3366)' : 'var(--accent-green, #00ff9d)' }}>
          {activeTab === 'vulnerable' ? '🚨 4 Kritik Açık Aktif' : '🛡️ OWASP API Standartlarında Korundu'}
        </span>
      </div>
    </div>
  );
};
