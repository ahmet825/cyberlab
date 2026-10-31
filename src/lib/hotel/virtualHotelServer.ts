/**
 * VIRTUAL HOTEL EXPRESS ENGINE & LIVE REST RUNNER
 * ------------------------------------------------
 * Tarayıcı içinde çalışan in-memory Express simülatörü ve canlı fetch istemcisi.
 */

export interface SimulatedResponse {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: any;
}

// In-Memory Otel Veritabanı
const getInitialDb = () => ({
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
      notes: "Süit oda talep etti, fıstık alerjisi var."
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
      notes: "Devlet protokolü VIP misafiri, tam gizlilik talep ediyor."
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
      notes: "Ekonomik tek kişilik oda müşterisi."
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
  deletedReservationIds: [] as number[]
});

let activeDb = getInitialDb();

export function resetHotelDatabase() {
  activeDb = getInitialDb();
}

/**
 * Thunder Client'tan gelen isteği Sanal Express motorunda veya gerçek sunucuda çalıştırır
 */
export async function dispatchHotelRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  headers: Record<string, string>,
  bodyStr?: string
): Promise<SimulatedResponse> {
  const startTime = performance.now();

  // Eğer url http:// veya https:// ile başlıyorsa gerçek fetch dene
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: ['GET', 'HEAD'].includes(method) ? undefined : bodyStr
      });
      const data = await res.json().catch(() => ({ raw: 'Yanıt JSON formatında değil' }));
      const endTime = performance.now();
      const stringified = JSON.stringify(data);

      const respHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        respHeaders[key] = val;
      });

      return {
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : 'Response'),
        timeMs: Math.round(endTime - startTime),
        sizeBytes: new Blob([stringified]).size,
        headers: respHeaders,
        data
      };
    } catch (err: any) {
      // Localhost kapalıysa sanal motora devam et veya hata dön
      console.warn("Gerçek backend'e ulaşılamadı, Virtual Express Engine çalıştırılıyor.", err);
    }
  }

  // Sanal Express Router Simülasyonu
  await new Promise(r => setTimeout(r, 45 + Math.random() * 50)); // Gerçekçi ağ gecikmesi

  const cleanUrl = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  let parsedBody: any = {};
  if (bodyStr && bodyStr.trim()) {
    try {
      parsedBody = JSON.parse(bodyStr);
    } catch {
      return {
        status: 400,
        statusText: 'Bad Request',
        timeMs: Math.round(performance.now() - startTime),
        sizeBytes: 64,
        headers: { 'content-type': 'application/json' },
        data: { success: false, error: "SyntaxError: Geçersiz JSON gövdesi!" }
      };
    }
  }

  // 1. GET /api/customers
  if (method === 'GET' && cleanUrl === '/api/customers') {
    const data = {
      success: true,
      message: "Tüm müşteri kayıtları listelendi.",
      vulnerability_notice: "🚨 PII Sızıntısı: Tüm TC, telefon ve kart bilgileri şifresiz dönüyor!",
      count: activeDb.customers.length,
      customers: activeDb.customers
    };
    return buildResp(200, 'OK', startTime, data);
  }

  // 2. GET /api/customers/:id (IDOR)
  const custMatch = cleanUrl.match(/^\/api\/customers\/(\d+)$/);
  if (method === 'GET' && custMatch) {
    const id = parseInt(custMatch[1], 10);
    const customer = activeDb.customers.find(c => c.id === id);
    if (!customer) {
      return buildResp(404, 'Not Found', startTime, { success: false, error: "Müşteri bulunamadı!" });
    }

    const isAttackerTargetingOther = id !== 3; // 3 saldırganın kendi hesabı
    const data = {
      success: true,
      idor_exploited: isAttackerTargetingOther,
      warning: isAttackerTargetingOther 
        ? `🔥 [IDOR / BOLA BAŞARILI]: Oturum açmış müşteri (ID: 3) olmasına rağmen müşteri (ID: ${id}) ${customer.name}'in gizli VIP verilerine eriştiniz!` 
        : "Kendi profil verinizi görüntülüyorsunuz.",
      customer
    };
    return buildResp(200, 'OK', startTime, data);
  }

  // 3. GET /api/reservations
  if (method === 'GET' && cleanUrl === '/api/reservations') {
    return buildResp(200, 'OK', startTime, {
      success: true,
      count: activeDb.reservations.length,
      reservations: activeDb.reservations
    });
  }

  // 4. GET /api/reservations/:id
  const resMatch = cleanUrl.match(/^\/api\/reservations\/(\d+)$/);
  if (method === 'GET' && resMatch) {
    const id = parseInt(resMatch[1], 10);
    if (activeDb.deletedReservationIds.includes(id)) {
      return buildResp(404, 'Not Found', startTime, {
        success: false,
        status: 404,
        error: "Rezervasyon bulunamadı: Kullanıcı rezervasyonu silinmiş!",
        isDeleted: true,
        details: `ID #${id} numaralı rezervasyon daha önce sistemden silinmiştir (İptal Durumu: CANCELLED_AND_DELETED).`
      });
    }

    const reservation = activeDb.reservations.find(r => r.id === id);
    if (!reservation) {
      return buildResp(404, 'Not Found', startTime, { success: false, error: "Rezervasyon bulunamadı!" });
    }
    return buildResp(200, 'OK', startTime, { success: true, reservation });
  }

  // 4.1. DELETE /api/reservations/:id (Kullanıcı Rezervasyonu Silinmiş IDOR Senaryosu)
  if (method === 'DELETE' && resMatch) {
    const id = parseInt(resMatch[1], 10);
    const index = activeDb.reservations.findIndex(r => r.id === id);
    if (index === -1) {
      const isAlreadyDeleted = activeDb.deletedReservationIds.includes(id);
      return buildResp(404, 'Not Found', startTime, {
        success: false,
        status: 404,
        error: isAlreadyDeleted
          ? "Kullanıcı rezervasyonu daha önce silinmiş!"
          : "Silinecek rezervasyon kaydı bulunamadı!",
        isDeleted: true
      });
    }

    const deletedItem = activeDb.reservations[index];
    activeDb.reservations.splice(index, 1);
    activeDb.deletedReservationIds.push(id);

    return buildResp(200, 'OK', startTime, {
      success: true,
      action: "RESERVATION_DELETED",
      message: `Kullanıcı rezervasyonu (#${id} - ${deletedItem.guestName}) sistemden başarıyla silindi.`,
      deletedReservation: {
        id: deletedItem.id,
        guestName: deletedItem.guestName,
        roomNumber: deletedItem.roomNumber,
        status: "CANCELLED_AND_DELETED"
      },
      vulnerability_notice: "🚨 [IDOR SİLME ZAFİYETİ]: Rota üzerinde oturum ve sahiplik denetimi (Ownership Verification) eksik! Giriş yapan müşteri (Caner - ID: 3), Ahmet'in rezervasyonunu (ID: 101) yetkisiz bir DELETE isteğiyle sildi."
    });
  }

  // 5. PUT /api/reservations/:id (Mass Assignment)
  if (method === 'PUT' && resMatch) {
    const id = parseInt(resMatch[1], 10);
    const index = activeDb.reservations.findIndex(r => r.id === id);
    if (index === -1) {
      return buildResp(404, 'Not Found', startTime, { success: false, error: "Rezervasyon bulunamadı!" });
    }

    const previousPrice = activeDb.reservations[index].totalPrice;
    // ZAFİYET: req.body filtrelenmeden doğrudan üzerine yazılıyor
    const updated = {
      ...activeDb.reservations[index],
      ...parsedBody
    };
    activeDb.reservations[index] = updated;

    const priceHacked = parsedBody.totalPrice !== undefined && parsedBody.totalPrice !== previousPrice;

    return buildResp(200, 'OK', startTime, {
      success: true,
      message: "Rezervasyon güncellendi!",
      mass_assignment_triggered: priceHacked,
      alert: priceHacked ? `🚨 [MASS ASSIGNMENT BAŞARILI]: Rezervasyon fiyatı ₺${previousPrice} yerine ₺${parsedBody.totalPrice} olarak değiştirildi!` : null,
      updatedReservation: updated
    });
  }

  // 6. POST /api/reservations
  if (method === 'POST' && cleanUrl === '/api/reservations') {
    const newRes = {
      id: activeDb.reservations.length + 101,
      customerId: parsedBody.customerId || 3,
      guestName: parsedBody.guestName || "Caner Öztürk",
      roomNumber: parsedBody.roomNumber || "205 - Standart",
      checkIn: parsedBody.checkIn || "2026-11-20",
      checkOut: parsedBody.checkOut || "2026-11-25",
      pricePerNight: parsedBody.pricePerNight || 3000,
      totalPrice: parsedBody.totalPrice || 15000,
      status: parsedBody.status || "CONFIRMED",
      paymentStatus: parsedBody.paymentStatus || "PENDING",
      specialRequests: parsedBody.specialRequests || "Yok",
      discountApplied: parsedBody.discountApplied || "NONE"
    };
    activeDb.reservations.push(newRes);
    return buildResp(201, 'Created', startTime, {
      success: true,
      message: "Yeni rezervasyon başarıyla oluşturuldu!",
      reservation: newRes
    });
  }

  // 7. GET /api/managers/dashboard (Broken Access Control)
  if (method === 'GET' && cleanUrl === '/api/managers/dashboard') {
    // Header kontrolü
    const roleHeader = headers['x-user-role'] || headers['X-User-Role'] || headers['x-role'];
    if (roleHeader !== 'manager' && roleHeader !== 'general_manager') {
      return buildResp(403, 'Forbidden', startTime, {
        success: false,
        status: 403,
        error: "403 Forbidden: Bu yönetim paneline sadece otel müdürleri erişebilir!",
        hint: "Sunucu rol denetimini HTTP Headers içindeki 'x-user-role' anahtarına bakarak yapıyor. Bir saldırgan header manipülasyonu yapabilir mi?"
      });
    }

    return buildResp(200, 'OK', startTime, {
      success: true,
      privilege_escalation: true,
      alert: "🏆 [BROKEN ACCESS CONTROL / YETKİ AŞIMI]: 'x-user-role: manager' başlığı ile Genel Müdür paneline sızdınız!",
      hotel_status: "CRITICAL_COMPROMISED",
      managers: activeDb.managers,
      secretKeyManagement: {
        rawSecretExposed: false,
        security_standard: "SECRET_KEY Hashleme & Kriptografik Saklama (PBKDF2 / SHA-256 + Salt)",
        masterSecretHash: "sha256$8f91c94b288df794bfa25dfb39d10842247b9aa1bb413c6e9317b9d997235a90",
        saltUsed: "grand_horizon_salt_2026_9x",
        defense_rule: "SECRET_KEY değerleri veritabanında asla açık metin (plaintext) tutulmamalı, tuzlanmış (salted) SHA-256 veya argon2id ile hash'lenmelidir."
      },
      treasury: {
        safeVaultCash: "₺ 2,450,000",
        bankReserve: "₺ 18,900,000",
        masterSafePasscode: "77-41-99"
      },
      flag: "FLAG{HOTEL_MANAGEMENT_CONTROL_SEIZED_2026}"
    });
  }

  // 7.1. POST /api/managers/verify-secret-hash (SECRET_KEY Hashleme Doğrulama Testi)
  if (method === 'POST' && cleanUrl === '/api/managers/verify-secret-hash') {
    const candidate = parsedBody.candidateSecret || '';
    const isMasterMatch = candidate === 'GRAND_HORIZON_SECRET_MASTER_2026';
    return buildResp(200, 'OK', startTime, {
      success: true,
      mode: "SECRET_HASH_VERIFICATION",
      providedCandidate: candidate ? "****** (Gizlendi)" : "BOŞ",
      hashAlgorithm: "SHA-256 (PBKDF2/Salted)",
      expectedHash: "sha256$8f91c94b288df794bfa25dfb39d10842247b9aa1bb413c6e9317b9d997235a90",
      isHashValid: isMasterMatch,
      statusMessage: isMasterMatch
        ? "✓ [HASH EŞLEŞTİ]: Düz metin SECRET_KEY başarıyla hash ile eşleşti. Sunucu düz metni asla diske kaydetmez."
        : "✗ [HASH UYUŞMADI]: Verilen anahtar hash ile uyuşmuyor.",
      best_practice: "Parolalar ve SECRET_KEY'ler karşılaştırılırken timing-attack önlemek için crypto.timingSafeEqual() fonksiyonu kullanılmalıdır."
    });
  }

  // 8. POST /api/managers/override-room-key
  if (method === 'POST' && cleanUrl === '/api/managers/override-room-key') {
    const roleHeader = headers['x-user-role'] || headers['X-User-Role'];
    if (roleHeader !== 'manager' && roleHeader !== 'general_manager') {
      return buildResp(401, 'Unauthorized', startTime, {
        success: false,
        error: "Yetkisiz istek! Yalnızca müdürler RFID Master Key kodlarını geçersiz kılabilir."
      });
    }

    return buildResp(200, 'OK', startTime, {
      success: true,
      action: "MASTER_OVERRIDE_EXECUTED",
      message: `Tüm otel kapıları için dijital anahtar kodları güncellendi! Yeni RFID erişim kodu: ${parsedBody.newMasterCode || '000000'}`,
      targetRoom: parsedBody.roomNumber || "ALL_HOTEL_ROOMS",
      security_alert: "Fiziksel kilit kontrolü ele geçirildi!"
    });
  }

  // 9. POST /api/documents/upload (ZAFİYETLİ DOSYA YÜKLEME)
  if (method === 'POST' && cleanUrl === '/api/documents/upload') {
    const fileName = parsedBody.fileName || "belge.jpg";
    const fileSize = parsedBody.fileSize || 512000;
    const mimeType = parsedBody.mimeType || "application/octet-stream";
    const authHeader = headers['authorization'] || headers['Authorization'];

    const hasAuth = !!authHeader;
    const isOverLimit = fileSize > 2 * 1024 * 1024;
    const isDangerousExt = /\.(php|jsp|exe|sh|phtml|phar|cgi|pl|py|bat)$/i.test(fileName);

    return buildResp(200, 'OK', startTime, {
      success: true,
      mode: "VULNERABLE_UPLOAD",
      message: "Dosya genel erişime açık web köküne kaydedildi!",
      savedPath: `/public/uploads/${fileName}`,
      analysis: {
        auth_status: hasAuth 
          ? "Oturum mevcut ancak rota seviyesinde zorunlu tutulmuyor." 
          : "⚠️ [AUTH EKSİK]: Anonim kullanıcı kimlik doğrulaması olmadan dosya yükledi!",
        filesize_status: isOverLimit
          ? `🚨 [FILESIZE EKSİK]: Boyut sınırı kontrol edilmedi (${Math.round(fileSize / (1024*1024))} MB). DoS ve depolama tükenmesi riski!`
          : "Boyut kabul edildi (ancak sunucuda limit filtresi yok).",
        filetype_status: isDangerousExt
          ? `🔥 [CRITICAL RCE]: '${fileName}' (${mimeType}) zararlı betiği /public/uploads/ dizinine yüklendi! Sunucuda Web Shell tetiklendi: uid=0(root) gid=0(root)`
          : `Uzantı ve MIME (${mimeType}) zararsız görünüyor ancak Magic Bytes doğrulaması yapılmadı.`
      },
      flag: isDangerousExt ? "FLAG{UNRESTRICTED_FILE_UPLOAD_WEB_SHELL_PWNED_2026}" : null
    });
  }

  // 10. POST /api/documents/secure-upload (MAVİ TAKIM GÜVENLİ PIPELINE)
  if (method === 'POST' && cleanUrl === '/api/documents/secure-upload') {
    const authHeader = headers['authorization'] || headers['Authorization'];
    const fileName = parsedBody.fileName || "kimlik.jpg";
    const fileSize = parsedBody.fileSize || 512000;
    const mimeType = parsedBody.mimeType || "image/jpeg";

    // 1. ADIM: AUTH KONTROLÜ (JWT Token Kontrolü)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return buildResp(401, 'Unauthorized', startTime, {
        success: false,
        error: "401 Unauthorized: Geçerli bir 'Authorization: Bearer <jwt_token>' başlığı zorunludur!",
        step_failed: "Adım 1: Auth (Kimlik Doğrulama)"
      });
    }

    // 2. ADIM: FILESIZE KONTROLÜ (Maksimum 2MB Sınırı)
    if (fileSize > 2 * 1024 * 1024) {
      return buildResp(413, 'Payload Too Large', startTime, {
        success: false,
        error: `413 Payload Too Large: Gönderilen dosya (${(fileSize / (1024 * 1024)).toFixed(1)} MB) izin verilen 2 MB sınırını aşıyor!`,
        step_failed: "Adım 2: Filesize Validation (DoS Engelleme)"
      });
    }

    // 3. ADIM: FILETYPE KONTROLÜ (Uzantı Allowlist + Magic Bytes)
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();

    if (!allowedExts.includes(ext) || !allowedMimes.includes(mimeType)) {
      return buildResp(415, 'Unsupported Media Type', startTime, {
        success: false,
        error: `415 Unsupported Media Type: '${ext}' uzantısı ve '${mimeType}' türü reddedildi! Yalnızca doğrulanmış .pdf, .jpg, .png dosyaları kabul edilir.`,
        step_failed: "Adım 3: Filetype Validation (RCE Engelleme)"
      });
    }

    // 4. ADIM: GÜVENLİ DEPOLAMA & JWT İLE İMZALAMA
    const secureStorageId = `doc_${Math.random().toString(36).substring(2, 10)}_${Date.now()}${ext}`;
    const mockSignedToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.file_${secureStorageId}.signature`;

    return buildResp(201, 'Created', startTime, {
      success: true,
      mode: "SECURE_PIPELINE_SUCCESS",
      message: "🏆 Mavi Takım: Dosya 4 güvenlik katmanından başarıyla geçerek güvenli özel dizine kaydedildi!",
      pipeline_verifications: {
        step1_auth: "✓ Geçerli JWT kimliği doğrulandı (Misafir ID: 3)",
        step2_filesize: `✓ Dosya boyutu güvenli aralıkta (${(fileSize / 1024).toFixed(0)} KB < 2 MB)`,
        step3_filetype: "✓ Magic Bytes ve Allowlist uzantı onaylandı",
        step4_jwt_storage: "✓ Rastgele UUID ile web kökü dışına kaydedildi ve imzalı token üretildi"
      },
      fileInfo: {
        originalName: fileName,
        secureStorageKey: secureStorageId,
        signedDownloadUrl: `/api/documents/download?token=${mockSignedToken}`,
        expiresIn: "15 Dakika (Tek Kullanımlık İmzalı Bağlantı)"
      }
    });
  }

  // 404 Route Bulunamadı
  return buildResp(404, 'Not Found', startTime, {
    success: false,
    error: `404 Not Found: '${method} ${cleanUrl}' endpoint'i sunucuda tanımlı değil.`,
    available_endpoints: [
      "GET    /api/customers",
      "GET    /api/customers/:id",
      "GET    /api/reservations",
      "GET    /api/reservations/:id",
      "PUT    /api/reservations/:id",
      "DELETE /api/reservations/:id",
      "POST   /api/reservations",
      "GET    /api/managers/dashboard",
      "POST   /api/managers/verify-secret-hash",
      "POST   /api/managers/override-room-key",
      "POST   /api/documents/upload",
      "POST   /api/documents/secure-upload"
    ]
  });
}

function buildResp(status: number, statusText: string, startTime: number, data: any): SimulatedResponse {
  const jsonStr = JSON.stringify(data, null, 2);
  return {
    status,
    statusText,
    timeMs: Math.round(performance.now() - startTime),
    sizeBytes: new Blob([jsonStr]).size,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-powered-by': 'Express 4.19.2',
      'access-control-allow-origin': '*'
    },
    data
  };
}
