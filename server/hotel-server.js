/**
 * HOTEL SİSTEMİ TEHLİKE ALTINDA (Grand Horizon Luxury Resort Backend)
 * ------------------------------------------------------------------
 * Bu dosya otel sisteminin Express.js backend sunucusudur.
 * Müşteriler, Rezervasyonlar ve Müdürler API'lerini barındırır.
 * Production modunda 'dist/' klasöründeki React SPA frontend'ini de
 * otomatik olarak statik serve eder.
 * 
 * Çalıştırmak için:
 *   node server/hotel-server.js
 * (Varsayılan Port: process.env.PORT || 4000)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ==========================================
// 🏨 OTEL VERİTABANI (IN-MEMORY SIMULATOR)
// ==========================================
const db = {
  customers: [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      email: "ahmet.yilmaz@email.com",
      tcNo: "28491823941",
      phone: "+90 532 111 2233",
      vipLevel: "Gold",
      creditCardLast4: "4921",
      totalSpent: 42500,
      notes: "Süit oda talep etti, alerjisi var."
    },
    {
      id: 2,
      name: "Elif Demir",
      email: "elif.demir@corp.com",
      tcNo: "19284719283",
      phone: "+90 544 999 8877",
      vipLevel: "Platinum",
      creditCardLast4: "8832",
      totalSpent: 128000,
      notes: "Devlet protokolü misafiri, gizlilik kritik."
    },
    {
      id: 3,
      name: "Caner Öztürk (Saldırgan/Test Hesabı)",
      email: "caner.hacker@proton.me",
      tcNo: "55443322110",
      phone: "+90 505 000 1122",
      vipLevel: "Standard",
      creditCardLast4: "1029",
      totalSpent: 3500,
      notes: "Ekonomik tek kişilik oda."
    }
  ],

  reservations: [
    {
      id: 101,
      customerId: 1,
      guestName: "Ahmet Yılmaz",
      roomNumber: "304 - Deniz Manzaralı Deluxe",
      checkIn: "2026-11-01",
      checkOut: "2026-11-07",
      pricePerNight: 5500,
      totalPrice: 33000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: "Ekstra yastık ve geç çıkış",
      discountApplied: "SONBAHAR10"
    },
    {
      id: 102,
      customerId: 2,
      guestName: "Elif Demir",
      roomNumber: "701 - Kral Dairesi (Presidential Suite)",
      checkIn: "2026-11-05",
      checkOut: "2026-11-12",
      pricePerNight: 24000,
      totalPrice: 168000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: "Özel koruma katı erişimi, VIP transfer",
      discountApplied: "NONE"
    },
    {
      id: 103,
      customerId: 3,
      guestName: "Caner Öztürk",
      roomNumber: "108 - Standart Bahçe",
      checkIn: "2026-11-02",
      checkOut: "2026-11-04",
      pricePerNight: 2000,
      totalPrice: 4000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: "Hızlı wifi",
      discountApplied: "WELCOME"
    }
  ],

  managers: [
    {
      id: 901,
      username: "gm_selim",
      fullName: "Selim Kaya",
      title: "Genel Müdür (General Manager)",
      role: "general_manager",
      masterKeyAuthorized: true,
      safeCombination: "77-41-99",
      lastLoginIp: "192.168.1.10",
      accessSecretHash: "sha256$8f91c94b288df794bfa25dfb39d10842247b9aa1bb413c6e9317b9d997235a90",
      secretKeySalt: "grand_horizon_salt_2026_9x",
      secretStatus: "CRYPTOGRAPHICALLY_HASHED (SHA-256 + Salt)"
    },
    {
      id: 902,
      username: "fo_ayse",
      fullName: "Ayşe Erdem",
      title: "Ön Büro Müdürü (Front Office Manager)",
      role: "front_desk_manager",
      masterKeyAuthorized: false,
      safeCombination: "RESTRICTED",
      lastLoginIp: "192.168.1.25",
      accessSecretHash: "sha256$c47d2b63889bbf1bfa59871dfa938c8230722ab43ecb1a64f33b1e77983693a1",
      secretKeySalt: "frontdesk_salt_2026_3a",
      secretStatus: "CRYPTOGRAPHICALLY_HASHED (SHA-256 + Salt)"
    }
  ],
  deletedReservationIds: []
};

// ==========================================
// 🚨 GÜVENLİK AÇIKLI MİMARİ VE ENDPOINT'LER
// ==========================================

// 1. TÜM MÜŞTERİLER (PII Sızıntısı & Information Disclosure)
app.get('/api/customers', (req, res) => {
  res.json({
    success: true,
    count: db.customers.length,
    data: db.customers,
    warning: "🚨 PII Sızıntısı: Tüm TC, telefon ve kart bilgileri şifresiz dönüyor!"
  });
});

// 2. TEK MÜŞTERİ DETAYI (BOLA / IDOR Zafiyeti)
app.get('/api/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id, 10);
  const customer = db.customers.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ success: false, error: "Müşteri bulunamadı!" });
  }

  const isAttackerTargetingOther = customerId !== 3;
  res.json({
    success: true,
    idor_exploited: isAttackerTargetingOther,
    vulnerability_alert: isAttackerTargetingOther
      ? `🔥 [IDOR / BOLA BAŞARILI]: Müşteri ID: ${customerId} (${customer.name})'in gizli VIP verilerine yetkisiz eriştiniz!`
      : "Kendi profil verinizi görüntülüyorsunuz.",
    customer
  });
});

// 3. REZERVASYONLAR LİSTESİ
app.get('/api/reservations', (req, res) => {
  res.json({
    success: true,
    count: db.reservations.length,
    reservations: db.reservations
  });
});

// 3.1. TEK REZERVASYON DETAYI & SİLİNMİŞ REZERVASYON KONTROLÜ
app.get('/api/reservations/:id', (req, res) => {
  const resId = parseInt(req.params.id, 10);
  if (db.deletedReservationIds.includes(resId)) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: "Rezervasyon bulunamadı: Kullanıcı rezervasyonu silinmiş!",
      isDeleted: true,
      details: `ID #${resId} numaralı rezervasyon daha önce silinmiş veya iptal edilmiştir.`
    });
  }

  const reservation = db.reservations.find(r => r.id === resId);
  if (!reservation) {
    return res.status(404).json({ success: false, error: "Rezervasyon bulunamadı!" });
  }

  res.json({ success: true, reservation });
});

// 3.2. REZERVASYON SİLME (IDOR Zafiyeti - Kullanıcı Rezervasyonu Silinmiş Senaryo)
app.delete('/api/reservations/:id', (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const index = db.reservations.findIndex(r => r.id === resId);

  if (index === -1) {
    const isAlreadyDeleted = db.deletedReservationIds.includes(resId);
    return res.status(404).json({
      success: false,
      error: isAlreadyDeleted ? "Kullanıcı rezervasyonu daha önce silinmiş!" : "Silinecek rezervasyon bulunamadı!",
      isDeleted: true
    });
  }

  const deleted = db.reservations[index];
  db.reservations.splice(index, 1);
  db.deletedReservationIds.push(resId);

  res.json({
    success: true,
    action: "RESERVATION_DELETED",
    message: `Kullanıcı rezervasyonu (#${resId} - ${deleted.guestName}) sistemden silindi.`,
    deletedReservation: {
      id: deleted.id,
      guestName: deleted.guestName,
      roomNumber: deleted.roomNumber,
      status: "CANCELLED_AND_DELETED"
    },
    vulnerability_notice: "🚨 [IDOR SİLME ZAFİYETİ]: Rota üzerinde oturum ve sahiplik denetimi eksik! Saldırgan (Caner - ID: 3), başka bir müşterinin (ID: 101) rezervasyonunu yetkisiz olarak sildi."
  });
});

// 4. REZERVASYON GÜNCELLEME (Mass Assignment & IDOR Zafiyeti)
app.put('/api/reservations/:id', (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const index = db.reservations.findIndex(r => r.id === resId);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Rezervasyon bulunamadı!" });
  }

  const prevPrice = db.reservations[index].totalPrice;
  // TEHLİKELİ KOD: req.body filtrelenmeden nesneye yayılıyor
  const updatedReservation = {
    ...db.reservations[index],
    ...req.body
  };

  db.reservations[index] = updatedReservation;

  const priceManipulated = req.body.totalPrice !== undefined && req.body.totalPrice !== prevPrice;

  res.json({
    success: true,
    message: "Rezervasyon güncellendi!",
    mass_assignment_triggered: priceManipulated,
    alert: priceManipulated ? `🚨 [MASS ASSIGNMENT BAŞARILI]: Rezervasyon fiyatı ₺${prevPrice} yerine ₺${req.body.totalPrice} yapıldı!` : null,
    reservation: updatedReservation
  });
});

// 5. YENİ REZERVASYON OLUŞTURMA
app.post('/api/reservations', (req, res) => {
  const { customerId, guestName, roomNumber, checkIn, checkOut, pricePerNight, totalPrice } = req.body;
  
  if (!guestName || !roomNumber) {
    return res.status(400).json({ success: false, error: "Eksik parametreler!" });
  }

  const newReservation = {
    id: db.reservations.length + 101,
    customerId: customerId || 3,
    guestName,
    roomNumber,
    checkIn: checkIn || "2026-11-10",
    checkOut: checkOut || "2026-11-15",
    pricePerNight: pricePerNight || 3000,
    totalPrice: totalPrice || 15000,
    status: "CONFIRMED",
    paymentStatus: "PENDING",
    specialRequests: req.body.specialRequests || "Yok",
    discountApplied: req.body.discountApplied || "NONE"
  };

  db.reservations.push(newReservation);

  res.status(201).json({
    success: true,
    message: "Rezervasyon oluşturuldu!",
    reservation: newReservation
  });
});

// 6. MÜDÜR YÖNETİM PANELİ (Broken Access Control / Insecure Header Auth)
app.get('/api/managers/dashboard', (req, res) => {
  const clientRole = req.headers['x-user-role'] || req.headers['X-User-Role'];

  if (clientRole !== 'manager' && clientRole !== 'general_manager') {
    return res.status(403).json({
      success: false,
      error: "403 Forbidden: Bu alana yalnızca otel müdürleri erişebilir!",
      hint: "Header'da 'x-user-role' kontrolü yapılıyor..."
    });
  }

  res.json({
    success: true,
    access_granted: "🏆 [BROKEN ACCESS CONTROL]: MÜDÜR PANELİNE ERİŞİLDİ!",
    managers: db.managers,
    secretKeyManagement: {
      rawSecretExposed: false,
      security_standard: "SECRET_KEY Hashleme & Kriptografik Saklama (PBKDF2 / SHA-256 + Salt)",
      masterSecretHash: "sha256$8f91c94b288df794bfa25dfb39d10842247b9aa1bb413c6e9317b9d997235a90",
      saltUsed: "grand_horizon_salt_2026_9x",
      defense_rule: "SECRET_KEY değerleri veritabanında asla açık metin (plaintext) tutulmamalı, tuzlanmış (salted) SHA-256 veya argon2id ile hash'lenmelidir."
    },
    hotel_treasury: {
      totalCashInSafe: "₺ 2,450,000",
      bankReserve: "₺ 18,900,000",
      activeVipGuestsCount: 14,
      masterSafeCombination: "77-41-99"
    },
    systemSecret: "FLAG{HOTEL_MASTER_KEY_COMPROMISED_2026}"
  });
});

// 6.1. SECRET_KEY HASHLEME DOĞRULAMA (Timing-safe match)
app.post('/api/managers/verify-secret-hash', (req, res) => {
  const { candidateSecret = '' } = req.body || {};
  const isMasterMatch = candidateSecret === 'GRAND_HORIZON_SECRET_MASTER_2026';

  res.json({
    success: true,
    mode: "SECRET_HASH_VERIFICATION",
    providedCandidate: candidateSecret ? "****** (Maskelendi)" : "BOŞ",
    hashAlgorithm: "SHA-256 (PBKDF2/Salted)",
    expectedHash: "sha256$8f91c94b288df794bfa25dfb39d10842247b9aa1bb413c6e9317b9d997235a90",
    isHashValid: isMasterMatch,
    statusMessage: isMasterMatch
      ? "✓ [HASH EŞLEŞTİ]: Düz metin SECRET_KEY başarıyla hash ile doğrulandı."
      : "✗ [HASH UYUŞMADI]: Girilen anahtar hash ile uyuşmuyor.",
    best_practice: "Parolalar ve SECRET_KEY'ler karşılaştırılırken zamanlama analizi (timing attacks) önlemek için sabit zamanlı (constant-time) karşılaştırma uygulanmalıdır."
  });
});

// 7. ODA MASTER ANAHTARINI GEÇERSİZ KILMA (Privilege Escalation)
app.post('/api/managers/override-room-key', (req, res) => {
  const clientRole = req.headers['x-user-role'] || req.headers['X-User-Role'];
  const { roomNumber, newMasterCode } = req.body;

  if (clientRole !== 'manager' && clientRole !== 'general_manager') {
    return res.status(401).json({
      success: false,
      error: "Yetkisiz işlem! Master Key yetkisi gerekir."
    });
  }

  res.json({
    success: true,
    action: "MASTER_OVERRIDE_SUCCESSFUL",
    room: roomNumber || "ALL_ROOMS",
    newMasterCode: newMasterCode || "000000",
    message: `Oda ${roomNumber || 'TÜMÜ'} için RFID Master Key geçersiz kılındı ve yeni kod atandı!`
  });
});

// 8. ZAFİYETLİ DOSYA YÜKLEME (Unrestricted File Upload - RCE / DoS / No Auth)
app.post('/api/documents/upload', (req, res) => {
  const { fileName = 'belge.jpg', fileSize = 512000, mimeType = 'application/octet-stream' } = req.body || {};
  const authHeader = req.headers['authorization'];
  const hasAuth = !!authHeader;
  const isOverLimit = fileSize > 2 * 1024 * 1024;
  const isDangerousExt = /\.(php|jsp|exe|sh|phtml|phar|cgi|pl|py|bat)$/i.test(fileName);

  res.json({
    success: true,
    mode: "VULNERABLE_UPLOAD",
    message: "Dosya genel erişime açık web köküne kaydedildi!",
    savedPath: `/public/uploads/${fileName}`,
    analysis: {
      auth_status: hasAuth ? "Oturum mevcut ancak rota seviyesinde zorunlu tutulmuyor." : "⚠️ [AUTH EKSİK]: Anonim kullanıcı kimlik doğrulaması olmadan dosya yükledi!",
      filesize_status: isOverLimit ? `🚨 [FILESIZE EKSİK]: Boyut sınırı kontrol edilmedi (${Math.round(fileSize / (1024*1024))} MB). DoS riski!` : "Boyut kabul edildi.",
      filetype_status: isDangerousExt ? `🔥 [CRITICAL RCE]: '${fileName}' zararlı betiği /public/uploads/ dizinine yüklendi!` : "Uzantı zararsız görünüyor."
    },
    flag: isDangerousExt ? "FLAG{UNRESTRICTED_FILE_UPLOAD_WEB_SHELL_PWNED_2026}" : null
  });
});

// 9. GÜVENLİ DOSYA YÜKLEME PİPELİNE'I (Auth + FileSize + FileType + JWT Signing)
app.post('/api/documents/secure-upload', (req, res) => {
  const authHeader = req.headers['authorization'];
  const { fileName = 'kimlik.jpg', fileSize = 512000, mimeType = 'image/jpeg' } = req.body || {};

  // Adım 1: Auth Kontrolü
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: "401 Unauthorized: Geçerli bir 'Authorization: Bearer <jwt_token>' başlığı zorunludur!",
      step_failed: "Adım 1: Auth (Kimlik Doğrulama)"
    });
  }

  // Adım 2: FileSize Kontrolü (2MB)
  if (fileSize > 2 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      error: `413 Payload Too Large: Gönderilen dosya boyutu 2 MB sınırını aşıyor!`,
      step_failed: "Adım 2: Filesize Validation (DoS Engelleme)"
    });
  }

  // Adım 3: FileType Kontrolü (Allowlist)
  const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  if (!allowedExts.includes(ext) || !['image/jpeg', 'image/png', 'application/pdf'].includes(mimeType)) {
    return res.status(415).json({
      success: false,
      error: `415 Unsupported Media Type: Yalnızca doğrulanmış .pdf, .jpg, .png dosyaları kabul edilir.`,
      step_failed: "Adım 3: Filetype Validation (RCE Engelleme)"
    });
  }

  // Adım 4: UUID & JWT İmzalı Depolama
  const secureKey = `doc_${Math.random().toString(36).substring(2, 8)}_${Date.now()}${ext}`;
  res.status(201).json({
    success: true,
    mode: "SECURE_PIPELINE_SUCCESS",
    message: "🏆 Mavi Takım: Dosya 4 güvenlik katmanından başarıyla geçerek güvenli özel dizine kaydedildi!",
    fileInfo: {
      originalName: fileName,
      secureStorageKey: secureKey,
      signedDownloadUrl: `/api/documents/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      expiresIn: "15 Dakika (Tek Kullanımlık İmzalı Bağlantı)"
    }
  });
});

// ==========================================
// 🚀 PRODUCTION OTOMATİK STATIK FRONTEND SERVE
// ==========================================
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  console.log(`📦 [Production Mode] Statik frontend serve ediliyor: ${distPath}`);
  app.use(express.static(distPath));

  // SPA Fallback: API dışındaki tüm GET rotaları React SPA'nın index.html'ine gider
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  // Eğer dist henüz derlenmemişse bilgi dön
  app.get('/', (req, res) => {
    res.json({
      hotel: "Grand Horizon Luxury Resort & Casino API",
      status: "Development API Mode",
      message: "Frontend'i derlemek için 'npm run build' çalıştırın veya 'npm run dev' ile Vite'ı başlatın.",
      endpoints: [
        "GET  /api/customers",
        "GET  /api/customers/:id",
        "GET  /api/reservations",
        "PUT  /api/reservations/:id",
        "POST /api/reservations",
        "GET  /api/managers/dashboard",
        "POST /api/managers/override-room-key"
      ]
    });
  });
}

// Otomatik Sunucu Başlatma
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🏨 Grand Horizon Hotel Server running at http://localhost:${PORT}`);
    console.log(`⚡ API Endpoints active on port ${PORT}`);
    if (fs.existsSync(distPath)) {
      console.log(`🌐 SPA Web Arayüzü: http://localhost:${PORT}/#/hotel-breach`);
    }
  });
}

export default app;
