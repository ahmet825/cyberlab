export interface QuizQuestion {
  id: number;
  title: string;
  category: 'IDOR / BOLA' | 'Mass Assignment' | 'Broken Access Control' | 'PII Exposure' | 'Secure Architecture' | 'File Upload: Auth' | 'File Upload: Filetype' | 'File Upload: Filesize' | 'File Upload: JWT Signing' | 'File Upload: Architecture';
  vulnerableCode?: string;
  fixedCode?: string;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  theoryHint: string;
}

export const HOTEL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: "Müşteri Profil Endpoint'i Analizi",
    category: "IDOR / BOLA",
    vulnerableCode: `// GET /api/customers/:id
app.get('/api/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id, 10);
  const customer = db.customers.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ error: "Müşteri bulunamadı!" });
  }

  // DIKKAT: Oturum sahibi kontrol edilmiyor!
  res.json({ success: true, customer });
});`,
    question: "Yukarıdaki Express route kodunu inceleyiniz. Buradaki temel güvenlik açığı (vulnerability) nedir?",
    options: [
      {
        key: 'A',
        text: "Mass Assignment: URL parametresi doğrudan veritabanı sorgu modeline aktarıldığı için nesne tabanlı yetkisiz alan manipülasyonu gerçekleşir.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "SQL Injection: `req.params.id` değeri tırnak içine alınmadığı ve ORM kullanılmadığı için backend veritabanında doğrudan SQL syntax hatası tetiklenir.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "BOLA / IDOR (Insecure Direct Object Reference): URL'deki id parametresi doğrudan sorgulanmakta, istek atan kullanıcının bu verinin sahibi olup olmadığı (Ownership Verification) kontrol edilmemektedir.",
        isCorrect: true
      },
      {
        key: 'D',
        text: "CORS Misconfiguration: `res.json()` yanıtı varsayılan olarak `Access-Control-Allow-Origin: *` başlığı ürettiği için tarayıcı seviyesinde veri sızıntısına yol açar.",
        isCorrect: false
      }
    ],
    explanation: "Kod incelendiğinde `req.params.id` değeri doğrudan `db.customers.find` içinde kullanılmaktadır. Oturum açmış kullanıcının kimliği (örneğin `req.user.id`) ile istenen müşteri ID'sinin eşleşip eşleşmediği (Ownership Verification) denetlenmemiştir. Bu durum OWASP API Security Top 10 listesindeki 1 numaralı açık olan BOLA / IDOR zafiyetidir.",
    theoryHint: "Saldırgan kendi ID'si 3 iken URL'deki parametreyi /api/customers/2 yaparak başka müşterinin tüm kişisel verilerini çeker."
  },
  {
    id: 2,
    title: "IDOR Açığını Düzeltme Yöntemi",
    category: "IDOR / BOLA",
    vulnerableCode: `// Zafiyetli Kod:
const customer = db.customers.find(c => c.id === parseInt(req.params.id));`,
    fixedCode: `// Güvenli Kod:
app.get('/api/customers/:id', authenticateToken, (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  
  // 1. Yetki ve Sahiplik Kontrolü:
  if (req.user.role !== 'manager' && req.user.id !== requestedId) {
    return res.status(403).json({ error: "Erişim reddedildi! Başka müşterinin profiline bakamazsınız." });
  }

  const customer = db.customers.find(c => c.id === requestedId);
  res.json({ success: true, customer });
});`,
    question: "Otel API'sindeki bu IDOR açığı en güvenli şekilde ne şekilde düzeltilir?",
    options: [
      {
        key: 'A',
        text: "Müşteri ID'sini URL path parametresi yerine request body veya query string içinde şifresiz göndermek (`/api/customers?id=2`).",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Kullanıcının kriptografik olarak doğrulanmış oturumundan (JWT/Session) gelen `req.user.id` ile istenen `req.params.id` değerinin eşleştiğini veya kullanıcının müdür yetkisine sahip olduğunu sunucuda doğrulayarak.",
        isCorrect: true
      },
      {
        key: 'C',
        text: "Müşteri ID'lerini veritabanında incremental tamsayı (1, 2, 3...) yerine Base64 veya MD5 ile hash'leyerek istemci tarafında gizlemek (Obfuscation).",
        isCorrect: false
      },
      {
        key: 'D',
        text: "HTTP GET metodunu POST metoduna çevirip ID'yi frontend formunda `hidden` input olarak taşımak.",
        isCorrect: false
      }
    ],
    explanation: "IDOR zafiyetlerinin kalıcı çözümü, sunucu tarafında her nesne erişiminde istek yapan oturum sahibinin (`req.user`) o nesne üzerinde hak sahibi olup olmadığını (Object-level Authorization) doğrulamaktır. İstemciden gelen parametreleri gizlemek (Base64, hash, hidden input vb.) güvenlik sağlamaz. Aynı sahiplik kontrolü `DELETE /api/reservations/:id` endpoint'inde de zorunlu tutulmalıdır; aksi takdirde kullanıcı rezervasyonu yetkisiz olarak silinir.",
    theoryHint: "İstemciden gelen parametrelere asla güvenilmez; yetki sunucu oturumundaki `req.user` üzerinden doğrulanır. Silme (DELETE) isteklerinde de sahiplik kontrolü şarttır."
  },
  {
    id: 3,
    title: "Rezervasyon Güncelleme Endpoint'i",
    category: "Mass Assignment",
    vulnerableCode: `// PUT /api/reservations/:id
app.put('/api/reservations/:id', (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const index = db.reservations.findIndex(r => r.id === resId);

  // DIKKAT: req.body filtresiz yayılıyor!
  const updatedReservation = {
    ...db.reservations[index],
    ...req.body // <-- Tüm body doğrudan eziliyor!
  };

  db.reservations[index] = updatedReservation;
  res.json({ success: true, reservation: updatedReservation });
});`,
    question: "Yukarıdaki rezervasyon güncelleme kodunda bulunan kritik güvenlik açığı hangisidir?",
    options: [
      {
        key: 'A',
        text: "Prototype Pollution: JSON ayrıştırma işlemi Node.js Object prototipini kirleterek sunucunun çökmesine yol açar.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Path Traversal (Dizin Atlama): `req.params.id` parametresi dosya yolunda rezervasyon klasörünün dışına çıkılmasına neden olur.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "Race Condition (Yarış Durumu): `findIndex` fonksiyonu asenkron çalışmadığı için eşzamanlı iki rezervasyonda bellek kilitlemesi yaşanır.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Mass Assignment (Toplu Atama / Object Injection): İstemcinin gönderdiği `req.body` filtresiz kabul edilerek saldırganın `totalPrice: 0` veya `status: 'FREE_VIP'` gibi kritik alanları değiştirmesine olanak tanır.",
        isCorrect: true
      }
    ],
    explanation: "Mass Assignment açığı, uygulamanın istemciden gelen tüm parametreleri doğrulamadan doğrudan veri modeline yazmasıyla oluşur. Bir saldırgan JSON gövdesine `{ 'totalPrice': 0, 'paymentStatus': 'PAID' }` ekleyerek lüks kral dairesini 0 TL'ye kapatabilir.",
    theoryHint: "Kullanıcı sadece özel isteklerini (ör: ekstra yastık) güncelleyebilmeliyken, fiyat ve ödeme statüsünü de eziyor."
  },
  {
    id: 4,
    title: "Mass Assignment Zafiyetini Giderme",
    category: "Mass Assignment",
    vulnerableCode: `const updatedReservation = { ...db.reservations[index], ...req.body };`,
    fixedCode: `// Güvenli Kod (Allowlist / DTO Deseni):
const { specialRequests, checkIn, checkOut } = req.body;

// Sadece kullanıcının değiştirmesine izin verilen alanlar güncellenir:
db.reservations[index].specialRequests = specialRequests ?? db.reservations[index].specialRequests;

// Fiyat ve ödeme durumu istemciden asla kabul edilmez, sunucu hesaplar!`,
    question: "Bu Mass Assignment zafiyetini engellemek için en doğru yaklaşım nedir?",
    options: [
      {
        key: 'A',
        text: "İzin Verilen Alanlar (Allowlisting / DTO Deseni): Yalnızca müşterinin güncellemesine izin verilen alanları (`specialRequests` vb.) ayıklamak, `totalPrice` ve `status` gibi kritik alanları sunucu kontrolünde tutmak.",
        isCorrect: true
      },
      {
        key: 'B',
        text: "Frontend formundaki fiyat ve statü input'larına `readonly` veya `disabled` niteliği ekleyip form gönderimini JavaScript ile doğrulamak.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "Gelen `req.body` nesnesini veritabanına yazmadan önce `JSON.stringify()` ve `JSON.parse()` işleminden geçirerek temizlemek.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "HTTP PUT metodu yerine HTTP PATCH metodunu zorunlu kılmak; çünkü HTTP standardı PATCH isteklerinde yetkisiz alan güncellemelerini reddeder.",
        isCorrect: false
      }
    ],
    explanation: "Frontend tarafındaki `disabled` veya `readonly` kontrolleri bir saldırganın Thunder Client / cURL kullanarak doğrudan HTTP isteği atmasını engellemez. Çözüm, backend'de DTO (Data Transfer Object) ve Whitelisting uygulayarak yalnızca güvenli alanların güncellenmesini sağlamaktır.",
    theoryHint: "Frontend kontrolleri güvenlik önlemi değildir. Backend kesin sınırları çizmelidir."
  },
  {
    id: 5,
    title: "Müdür Paneli Rol Denetimi Analizi",
    category: "Broken Access Control",
    vulnerableCode: `// GET /api/managers/dashboard
app.get('/api/managers/dashboard', (req, res) => {
  const clientRole = req.headers['x-user-role'];

  // ZAFİYET: İstemcinin gönderdiği header'a doğrudan güveniliyor!
  if (clientRole !== 'manager' && clientRole !== 'general_manager') {
    return res.status(403).json({ error: "403 Forbidden: Yalnızca müdürler erişebilir!" });
  }

  res.json({
    access_granted: "MÜDÜR PANELİNE ERİŞİLDİ",
    managers: db.managers,
    systemSecret: "FLAG{HOTEL_MASTER_KEY_COMPROMISED_2026}"
  });
});`,
    question: "Yukarıdaki müdür paneli rota kodunda bir siber saldırgan nasıl 'Yetki Yükseltme' (Privilege Escalation) gerçekleştirir?",
    options: [
      {
        key: 'A',
        text: "URL'nin sonuna `?admin=true&bypass=1` sorgu parametresi ekleyerek Express route middleware zincirini atlatarak.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Kullanıcı çerezindeki (Cookie) session ID değerinin son karakterini değiştirip hash collision tetikleyerek.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "Thunder Client veya Burp Suite üzerinden HTTP isteğine `x-user-role: manager` başlığını (Header) manuel ekleyerek müdür paneline ve kasa şifrelerine yetkisiz erişir.",
        isCorrect: true
      },
      {
        key: 'D',
        text: "Express routing motorundaki Regex zafiyetinden yararlanıp `/api/managers/..;/dashboard` biçiminde path normalization bypass uygulayarak.",
        isCorrect: false
      }
    ],
    explanation: "İstemciler (tarayıcılar, REST istemcileri) HTTP başlıklarını tamamen serbestçe belirleyebilir. Sunucunun kullanıcı rolünü doğrulamak için istemciden gelen manipüle edilebilir bir `x-user-role` başlığına güvenmesi kritik bir Broken Access Control / Insecure Authorization zafiyetidir.",
    theoryHint: "HTTP Header'ları istemci tarafından 1 saniyede manipüle edilebilir. Kimlik sunucu sırrıyla imzalanmalıdır."
  },
  {
    id: 6,
    title: "Güvenli Kimlik ve Rol Doğrulama",
    category: "Broken Access Control",
    vulnerableCode: `if (req.headers['x-user-role'] !== 'manager') ...`,
    fixedCode: `// Güvenli Middleware Örneği:
function verifyManagerRole(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Oturum token'ı eksik!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedUser) => {
    if (err) return res.status(403).json({ error: "Geçersiz veya süresi dolmuş token!" });
    
    // Rol kontrolü kriptografik olarak imzalanmış payload'dan yapılır:
    if (decodedUser.role !== 'general_manager') {
      return res.status(403).json({ error: "Yetersiz yetki!" });
    }
    req.user = decodedUser;
    next();
  });
}`,
    question: "Müdür paneli rota denetimi endüstri standartlarında ne şekilde güvenceye alınmalıdır?",
    options: [
      {
        key: 'A',
        text: "Header ismini tahmin edilmesi güç bir anahtarla değiştirmek (Örn: `x-internal-secret-auth-key`) ve frontend kodunda bu anahtarı obfuscate ederek gizlemek.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Sunucunun gizli anahtarıyla imzalanmış (Cryptographically signed JWT) veya sunucu tarafında tutulan güvenli Session mekanizması ile kullanıcının rolü doğrulanmalı; istemcinin keyfi header'larına asla güvenilmemelidir.",
        isCorrect: true
      },
      {
        key: 'C',
        text: "Müdür paneli endpoint'ini `/api/admin-v2-private-access` gibi karmaşık bir rotaya taşımak ve robots.txt dosyasında `Disallow` olarak gizlemek.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "İstemcinin IP adresini kontrol edip yalnızca yerel ağdaki (192.168.x.x) cihazlardan gelen isteklerde `x-user-role` başlığını geçerli saymak.",
        isCorrect: false
      }
    ],
    explanation: "Kriptografik olarak imzalanmış JWT veya güvenli sunucu oturumları (HttpOnly Secure Cookies), istemcinin rol verisini manipüle etmesini önler. Sunucu gelen token'ın imzasını doğrular; saldırgan gizli anahtarı bilmeden rolünü 'manager' yapamaz. Ayrıca sistemdeki SECRET_KEY ve yönetici kimlik sırları asla düz metin (plaintext) tutulmamalı, tuzlanmış SHA-256 veya argon2id ile hash'lenmelidir.",
    theoryHint: "Gizlilik yoluyla güvenlik (Security through Obscurity) gerçek güvenlik sağlamaz. Kriptografik imza ve SECRET_KEY hashleme şarttır."
  },
  {
    id: 7,
    title: "Müşteri Listesi ve PII Sızıntısı",
    category: "PII Exposure",
    vulnerableCode: `// GET /api/customers
app.get('/api/customers', (req, res) => {
  // Veritabanındaki tüm objeler olduğu gibi dönüyor!
  res.json({
    success: true,
    count: db.customers.length,
    data: db.customers 
  });
});`,
    question: "Bu endpoint çağrıldığında dönen veri seti incelendiğinde hangi KVKK/GDPR ve siber güvenlik ihlali görülmektedir?",
    options: [
      {
        key: 'A',
        text: "Cross-Site Request Forgery (CSRF): GET isteği ile hassas veriler taşındığı için kullanıcı oturumu üçüncü taraf sitelerce taklit edilebilir.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "HTTP Parameter Pollution (HPP): `req.query` üzerinden birden fazla müşteri parametresi gönderildiğinde veritabanı yanıt dizisi taşar.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "CORS Wildcard Zafiyeti: JSON çıktısı şifrelenmediği için aradaki proxy sunucuları tüm HTTP gövdelerini kalıcı olarak loglar.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Aşırı Veri İfşası (Excessive Data Exposure): Müşterilerin TC Kimlik Numarası, telefon, kredi kartı son 4 hanesi ve VIP protokol notları gibi hassas kişisel veriler (PII) yetkisiz herkese açık şekilde sızmaktadır.",
        isCorrect: true
      }
    ],
    explanation: "API'ler genellikle frontend'in sadece isim göstermesi gerektiği durumlarda bile tüm nesneyi filtrelemeden döner. Bu durum KVKK/GDPR kapsamında ağır cezalar gerektiren PII (Personally Identifiable Information) veri sızıntısıdır.",
    theoryHint: "Bir endpoint sadece o an ihtiyaç duyulan asgari alanları dönmeli; hassas alanlar filtrelenmelidir (Least Privilege)."
  },
  {
    id: 8,
    title: "Veri Maskeleme ve Güvenli API Yanıtı",
    category: "PII Exposure",
    vulnerableCode: `res.json({ data: db.customers });`,
    fixedCode: `// Güvenli Yanıt (Projeksiyon & Maskeleme):
const safeCustomers = db.customers.map(c => ({
  id: c.id,
  name: c.name,
  vipLevel: c.vipLevel,
  // tcNo, creditCardLast4 ve notes ASLA dönülmez!
}));

res.json({ success: true, data: safeCustomers });`,
    question: "Müşteri listesi API yanıtını güvenli hale getirmek için backend tarafında ne yapılmalıdır?",
    options: [
      {
        key: 'A',
        text: "Veri Transfer Nesnesi (DTO / Data Sanitization) projeksiyonu uygulanmalı; TC No, kart bilgisi ve özel notlar backend seviyesinde API yanıtından tamamen çıkarılmalı veya maskelenmelidir.",
        isCorrect: true
      },
      {
        key: 'B',
        text: "Hassas bilgileri React/Frontend bileşeninde `filter()` işlemine sokarak veya CSS ile `display: none` yaparak son kullanıcının ekranında gizlemek.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "Hassas alanları veritabanında Base64 ile encode edip API yanıtında aynı şekilde istemciye göndererek tarayıcının decode etmesini sağlamak.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "HTTP yanıt başlığına `Cache-Control: no-store` ve `X-Content-Type-Options: nosniff` ekleyerek tarayıcının veriyi belleğe kaydetmesini engellemek.",
        isCorrect: false
      }
    ],
    explanation: "Frontend tarafındaki gizlemeler ağ trafiğini dinleyen bir saldırgan için hiçbir koruma sağlamaz. Backend seviyesinde hassas alanlar veritabanından çekilirken veya JSON serileştirilmeden önce kesinlikle filtrelenmelidir.",
    theoryHint: "Ağ üzerinden giden JSON payload'ını tarayıcı DevTools Network sekmesinde herkes görebilir."
  },
  {
    id: 9,
    title: "Master Key Override Endpoint'i",
    category: "Broken Access Control",
    vulnerableCode: `// POST /api/managers/override-room-key
app.post('/api/managers/override-room-key', (req, res) => {
  const clientRole = req.headers['x-user-role'];
  const { roomNumber, newMasterCode } = req.body;

  if (clientRole !== 'manager' && clientRole !== 'general_manager') {
    return res.status(401).json({ error: "Yetkisiz işlem!" });
  }

  res.json({
    success: true,
    message: \`Oda \${roomNumber} için RFID Master Key geçersiz kılındı!\`
  });
});`,
    question: "Bu rota otelin fiziksel güvenliğini de tehlikeye atmaktadır. Buradaki iş mantığı (Business Logic) açığı nedir?",
    options: [
      {
        key: 'A',
        text: "Server-Side Request Forgery (SSRF): Sunucu oda numarası parametresini intranet IoT gateway'ine ilettiği için dahili ağ taranabilir.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "SQL Truncation Zafiyeti: `newMasterCode` dizesi veritabanı sütun sınırını aştığında kilit varsayılan şifreye (0000) geri döner.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "Fiziksel Güvenlik & Yetkisiz Eylem İhlali: Sahte header ile kimlik atlatan bir saldırgan, otelin tüm dijital kapı kilit kodlarını manipüle ederek fiziksel odalara girme imkanı elde eder.",
        isCorrect: true
      },
      {
        key: 'D',
        text: "Replay Attack (Yeniden Oynatma): POST isteklerinde `nonce` parametresi bulunmadığı için aynı kilit kodu yalnızca 1 kez geçerli olur ve kapı kilitli kalır.",
        isCorrect: false
      }
    ],
    explanation: "Siber güvenlik yalnızca web sayfalarıyla sınırlı değildir; IoT ve otel kapı sistemleriyle entegre API'lerdeki bir erişim denetimi zaafiyeti doğrudan fiziksel hırsızlık ve can güvenliği tehdidine dönüşür.",
    theoryHint: "Yazılım zaafiyetleri fiziksel dünyada felaketlere yol açabilir (Cyber-Physical Threat)."
  },
  {
    id: 10,
    title: "Express Güvenli Mimari Bütünlüğü",
    category: "Secure Architecture",
    vulnerableCode: `// Zafiyetli Uygulama Başlangıcı
const app = express();
app.use(cors()); // Herkese açık CORS
app.use(express.json());
// Helmet yok, Rate Limiter yok, Input Validator yok, Audit Logging yok!`,
    fixedCode: `// Kurumsal Güvenli Mimari:
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod'; // Giriş Doğrulama

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(auditLoggerMiddleware);
// RBAC ve DTO doğrulaması her route'a zorunlu kılınır!`,
    question: "Otel sistemini gelecekteki siber saldırılara karşı korumak için Express sunucusuna eklenmesi gereken 'Derinlemesine Savunma' (Defense in Depth) unsurları hangileridir?",
    options: [
      {
        key: 'A',
        text: "Tüm rotaları HTTPS üzerinden HTTP/2 protokolüne geçirmek ve veritabanı bağlantı portunu standart dışı bir porta (Örn: 5433) taşımak.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Helmet (HTTP Güvenlik Başlıkları), Express Rate Limit (Brute-force/DDoS engelleme), Zod/Joi ile şema doğrulaması, RBAC (Rol Tabanlı Yetkilendirme) ve Detaylı Denetim Kayıtları (Audit Logging).",
        isCorrect: true
      },
      {
        key: 'C',
        text: "API rotalarındaki tüm `console.log()` çağrılarını silmek ve Express uygulamasının `NODE_ENV` değişkenini `production` yapmakla yetinmek.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Tüm gelen istek gövdelerini (req.body) Node.js `crypto` modülü ile AES-256 simetrik şifreleyerek RAM belleğinde saklamak.",
        isCorrect: false
      }
    ],
    explanation: "Derinlemesine savunma (Defense-in-Depth) stratejisi; tek bir güvenlik katmanına güvenmek yerine ağ, HTTP başlıkları, hız sınırları, girdi doğrulama, kimlik yetkilendirme ve loglama katmanlarını birlikte çalıştırmayı gerektirir.",
    theoryHint: "Tek bir zırh yetmez; zincirin tüm halkaları (Helmet, Rate Limit, Input Validation, Auth) sağlam olmalıdır."
  }
];

// ============================================================================
// 🏨 SENARYO 2: GÜVENLİ DOSYA YÜKLEME (FILE UPLOAD DEFENSE & MİMARİSİ)
// Kazanımlar: Auth, Filetype Validation, Filesize Validation, JWT ile İmzalama
// Soru Tarzı: "Zafiyet Nereden Kaynaklanıyor? / Bu Açığı Nasıl Kapatırız?"
// ============================================================================
export const HOTEL_FILE_UPLOAD_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: "Adım 1: Auth Kontrolü // Zafiyet Kaynağı",
    category: "File Upload: Auth",
    vulnerableCode: `// POST /api/documents/upload (Otel Müşteri Belge Yükleme)
app.post('/api/documents/upload', upload.single('idCard'), (req, res) => {
  // DİKKAT: Herhangi bir oturum veya token kontrolü YOK!
  const filePath = \`/uploads/\${req.file.filename}\`;
  res.json({ success: true, message: "Belge yüklendi!", filePath });
});`,
    question: "Yukarıdaki otel belge yükleme endpoint'inde anonim kullanıcılar diledikleri gibi dosya yükleyebilmektedir. Bu zafiyet temel olarak nereden kaynaklanmaktadır?",
    options: [
      {
        key: 'A',
        text: "Multer kütüphanesinin `upload.single()` fonksiyonu dosya yükleme akışını asenkron yönetemediği için bellek taşması (Buffer Overflow) meydana gelmesinden.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Dosya kaydetme yolunun `/uploads/` şeklinde göreceli (relative path) verilmesi sonucu işletim sistemi çekirdek izinlerinin bozulmasından.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "HTTP POST isteğinde CSRF token doğrulaması yapılmadığı için tarayıcının Cross-Origin dosya yüklemelerini zorunlu kılmasından.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Kimlik Doğrulama (Authentication) ve Yetkilendirme (Authorization) mekanizmasının rota seviyesinde bulunmamasından; sunucunun diske yazma işlemini oturum açmamış anonim istemcilere açmasından.",
        isCorrect: true
      }
    ],
    explanation: "Bir dosya yükleme ucu (endpoint) sunucu dosya sistemine doğrudan veri yazdığı için en yüksek riskli bileşenlerdendir. Herhangi bir kimlik denetimi (Auth Middleware) olmaması, yetkisiz saldırganların sunucu diskini doldurmasına, zararlı betik bırakmasına ve bot saldırılarına zemin hazırlar.",
    theoryHint: "Sunucuya yazma yetkisi vermeden önce 'Sen kimsin?' sorusu (Authentication) mutlaka sorulmalıdır."
  },
  {
    id: 2,
    title: "Adım 1: Auth Kontrolü // Açığı Kapatma Yöntemi",
    category: "File Upload: Auth",
    fixedCode: `// Güvenli Auth Doğrulaması:
import { authenticateJWT, requireGuestOrStaff } from './middleware/auth.js';

app.post(
  '/api/documents/upload',
  authenticateJWT,             // 1. JWT İmzası doğrulanır
  requireGuestOrStaff,         // 2. Rol denetlenir
  upload.single('idCard'),
  (req, res) => {
    // req.user.id üzerinden güvenli işlem yapılır
    res.json({ success: true, customerId: req.user.id });
  }
);`,
    question: "Otel misafirlerinin veya personelinin kimlik belgesi yükleme ucunu anonim erişime karşı nasıl kapatırız?",
    options: [
      {
        key: 'A',
        text: "Endpoint'e JWT tabanlı kimlik doğrulama middleware'i (`authenticateJWT`) ekleyerek; geçerli ve kriptografik imzalı Authorization: Bearer <token> başlığı taşımayan tüm istekleri 401 Unauthorized ile reddederek.",
        isCorrect: true
      },
      {
        key: 'B',
        text: "Dosya yükleme formuna reCAPTCHA veya Cloudflare bot koruması ekleyerek isteklerin insandan geldiğini doğrulamak.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "İstemciden gelen dosya adına kullanıcının TC Kimlik Numarasını prefix olarak ekleyip dosya sisteminde kontrol etmek.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Dosya yükleme isteğini yalnızca belirli IP adres aralıklarına açmak ve `X-Forwarded-For` başlığını kontrol eden bir filtre yazmak.",
        isCorrect: false
      }
    ],
    explanation: "İstemci tarafındaki hiçbir kurala güvenilemez. Sunucu tarafında `authenticateJWT` gibi bir middleware ile Bearer token doğrulanmalı, token içindeki `sub` (kullanıcı ID) ve `role` claim'leri kontrol edilerek oturum açmamış kullanıcıların dosya yazması engellenmelidir.",
    theoryHint: "Savunma: Sıkı JWT doğrulaması ile anonim yüklemeleri tamamen bloklamak."
  },
  {
    id: 3,
    title: "Adım 2: Filetype Validation // Zafiyet Kaynağı",
    category: "File Upload: Filetype",
    vulnerableCode: `// Zafiyetli Uzantı Denetimi:
const fileFilter = (req, file, cb) => {
  // Saldırgan: exploit.php.png veya exploit.phtml yükleyebilir!
  if (file.originalname.endsWith('.png') || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Yalnızca PNG kabul edilir'));
  }
};`,
    question: "Yalnızca istemciden gelen `originalname` sonuna veya `file.mimetype` HTTP başlığına güvenmek neden Remote Code Execution (RCE) açığına yol açar ve zafiyet nereden kaynaklanır?",
    options: [
      {
        key: 'A',
        text: "Sunucuda çalışan Express framework'ünün ikili (binary) MIME tiplerini otomatik olarak UTF-8 metne dönüştürerek derlemesinden.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "PNG dosya başlığındaki Exif meta verilerinin Node.js ortamında bellek sızıntısına ve heap bozulmasına (Heap Corruption) yol açmasından.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "İstemcinin hem Content-Type başlığını hem dosya adını serbestçe manipüle edebilmesinden; saldırganın içine PHP/JS web shell kodu yerleştirilmiş dosyayı sahte 'image/png' başlığıyla göndererek sunucuyu aldatabilmesinden.",
        isCorrect: true
      },
      {
        key: 'D',
        text: "Uzantı kontrolünde `toLowerCase()` kullanılmadığı için saldırganın `.PNG` veya `.Png` uzantılarıyla filtreyi doğrudan bypass edebilmesinden.",
        isCorrect: false
      }
    ],
    explanation: "HTTP istek başlıkları (örneğin `Content-Type: image/png`) tamamen istemcinin kontrolündedir. Bir saldırgan Postman, curl veya API İstek Konsolu ile `.php` kodlarını `Content-Type: image/png` olarak gönderebilir. Dosyanın iç baytları (Magic Bytes) incelenmediğinde sunucu web shell dosyasını kabul eder ve çalıştırır.",
    theoryHint: "İstemcinin beyan ettiği Content-Type başlığına asla güvenilmez; gerçek bayt imzası denetlenmelidir."
  },
  {
    id: 4,
    title: "Adım 2: Filetype Validation // Açığı Kapatma Yöntemi",
    category: "File Upload: Filetype",
    fixedCode: `// Güvenli Tür Doğrulaması:
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.pdf'];

async function validateFileSignature(buffer, originalname) {
  // 1. Magic Bytes (Dosya Bayt İmzası) Taranır:
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME.includes(detected.mime)) {
    throw new Error('Geçersiz veya sahte dosya türü tespit edildi!');
  }
  // 2. Uzantı Beyaz Listesi (Allowlist):
  const ext = path.extname(originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    throw new Error('İzin verilmeyen dosya uzantısı!');
  }
}`,
    question: "Otel sistemine yalnızca gerçek ve güvenli kimlik/fatura dosyalarının yüklendiğinden emin olmak için bu açığı nasıl kapatırız?",
    options: [
      {
        key: 'A',
        text: "Dosya uzantısını sunucuda silerek dosyaları diske uzantısız kaydetmek ve kullanıcı indirirken tarayıcının dosya türünü tahmin etmesine güvenmek.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Dosyanın ilk baytlarını (Magic Bytes / File Signature) sunucuda 'file-type' gibi bir kütüphaneyle okuyarak doğrulamak, katı bir uzantı beyaz listesi (Allowlist: .pdf, .jpg, .png) uygulamak ve upload dizinindeki çalıştırma (execute) yetkisini kaldırmak.",
        isCorrect: true
      },
      {
        key: 'C',
        text: "Gelen dosyayı bir antivirüs tarayıcısına göndermek ve yalnızca `file.mimetype.startsWith('image/')` koşulunu sağlayan dosyaları diske yazmak.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Dosyayı backend'e aktarmadan önce istemci tarafında HTML5 File API ile `file.type` değerini doğrulayan bir JavaScript kontrolü yazmak.",
        isCorrect: false
      }
    ],
    explanation: "Doğru dosya türü denetimi 3 aşamadan oluşur: 1) Katı Allowlist (Beyaz Liste) uzantı kontrolü, 2) Bellekte dosyanın ilk birkaç baytının gerçek türüyle (Magic Bytes) eşleştiğinin teyidi, 3) Dosyaların sunucuda doğrudan çalıştırılmasını (execute) engelleyen izin ve dizin yapılandırması.",
    theoryHint: "Savunma: Magic Bytes doğrulaması + Allowlist uzantı kontrolü + Execution iznini kaldırma."
  },
  {
    id: 5,
    title: "Adım 3: Filesize Validation // Zafiyet Kaynağı",
    category: "File Upload: Filesize",
    vulnerableCode: `// Multer Yapılandırması:
const upload = multer({
  dest: 'uploads/'
  // DİKKAT: limits: { fileSize: ... } TANIMLANMAMIŞ!
});`,
    question: "Dosya yükleme ucunda dosya boyutu (fileSize) kısıtlaması tanımlanmaması hangi kritik güvenlik tehdidine yol açar ve açık nereden kaynaklanır?",
    options: [
      {
        key: 'A',
        text: "Hizmet Engelleme (Denial of Service - DoS) ve Depolama Alanı Tükenmesi (Storage Exhaustion); saldırganın onlarca gigabaytlık çöp veri göndererek sunucu diskini ve RAM belleğini tüketip tüm otel sistemini kilitlemesinden.",
        isCorrect: true
      },
      {
        key: 'B',
        text: "Node.js V8 motorunun 2 GB üzerindeki dosyalarda 64-bit integer taşması yaşayarak veritabanındaki primary key alanlarını sıfırlamasından.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "Büyük boyutlu dosyaların HTTP Chunked Transfer Encoding sırasında TCP paketlerini düşürüp SSL/TLS sertifika doğrulamasını bozmasından.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Yüklenen büyük dosyaların Express router belleğinde cache'lenerek diğer müşterilerin oturum token'larını üzerine yazmasından.",
        isCorrect: false
      }
    ],
    explanation: "Sınırsız dosya boyutu, kaynak tüketimi saldırılarına (Resource Exhaustion) davetiye çıkarır. Bir saldırgan döngüsel isteklerle 500 MB - 1 GB'lık dosyalar yükleyerek sunucunun diskini dakikalar içinde doldurabilir; bu durum işletim sisteminin kilitlenmesine ve rezervasyon veritabanının çökmesine yol açar.",
    theoryHint: "Sınırsız boyut = Çöken disk ve kilitlenen sunucu (DoS)."
  },
  {
    id: 6,
    title: "Adım 3: Filesize Validation // Açığı Kapatma Yöntemi",
    category: "File Upload: Filesize",
    fixedCode: `// Katı Boyut Sınırlandırması (2 MB Sınırı):
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // Maksimum 2 Megabyte
    files: 1                    // Tek seferde en fazla 1 dosya
  }
});

// Hata Yakalama Middleware'i:
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: "413 Payload Too Large: Dosya boyutu 2 MB sınırını aşamaz!"
    });
  }
  next(err);
});`,
    question: "Otel sisteminde kimlik veya fatura yüklemelerinde aşırı büyük dosya yükleme (DoS) tehdidini nasıl kapatırız?",
    options: [
      {
        key: 'A',
        text: "Nginx reverse proxy'de gzip sıkıştırmasını en üst seviyeye çekerek yüklenen her dosyanın boyutunu sunucuya ulaşmadan küçültmek.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Frontend yükleme formunda `<input type=\"file\" max-size=\"2097152\">` HTML5 niteliği tanımlayarak istemci seviyesinde gönderimi durdurmak.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "Multer yapılandırmasında 'limits: { fileSize: 2 * 1024 * 1024 }' katı sınırını tanımlamak ve sınır aşıldığında isteği anında yakalayıp standart '413 Payload Too Large' durum koduyla reddetmek.",
        isCorrect: true
      },
      {
        key: 'D',
        text: "Dosyayı diske yazdıktan sonra `fs.statSync(filePath).size` ile kontrol etmek; 2 MB'tan büyükse dosyayı `fs.unlink()` ile diskten silmek.",
        isCorrect: false
      }
    ],
    explanation: "Express ve Multer seviyesinde `limits: { fileSize: 2 * 1024 * 1024 }` tanımlanmalıdır. Limit aşıldığında Multer `LIMIT_FILE_SIZE` hatası fırlatır; bu hata yakalanarak HTTP standardı olan 413 Payload Too Large kodu dönülür ve sunucu kaynağı korunur. Dosya diske yazıldıktan sonra boyut kontrolü yapmak DoS saldırısını engellemez.",
    theoryHint: "Savunma: Multer limits.fileSize tanımlaması + 413 Payload Too Large yanıtı."
  },
  {
    id: 7,
    title: "Adım 4: JWT İmzalama & Depolama // Zafiyet Kaynağı",
    category: "File Upload: JWT Signing",
    vulnerableCode: `// Zafiyetli Saklama Mantığı:
app.post('/api/documents/upload', upload.single('idCard'), (req, res) => {
  // Dosya orijinal adıyla doğrudan PUBLIC web köküne kaydediliyor!
  fs.writeFileSync(\`./public/uploads/\${req.file.originalname}\`, req.file.buffer);
  
  // Saldırgan: https://hotel.com/uploads/kimlik_101.jpg adresinden herkesin belgesini indirir!
  res.json({ publicUrl: \`/uploads/\${req.file.originalname}\` });
});`,
    question: "Yüklenen belgelerin tahmin edilebilir orijinal isimlerle doğrudan internete açık `/public/uploads/` dizinine kaydedilmesi nereden kaynaklanan bir zafiyettir?",
    options: [
      {
        key: 'A',
        text: "Same-Site Cookie zafiyeti: Public dizindeki dosyaların `SameSite=Lax` başlığı taşımaması nedeniyle harici sitelerden iframe ile çağrılabilmesi.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Hassas Veri İfşası (PII Exposure) ve Yetkisiz Doğrudan Dosya Erişimi (Unprotected Direct File Access); belgelerin web köküne kaydedilmesinden ve erişim için herhangi bir kimlik/imza kontrolü yapılmamasından kaynaklanır.",
        isCorrect: true
      },
      {
        key: 'C',
        text: "Dosya adlarındaki Türkçe karakterlerin ASCII dönüşümü sırasında URL encoding çakışması yaratarak web sunucusunu crash etmesinden kaynaklanır.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Statik dosya sunucusu olarak Express.js yerine Apache HTTP Server kullanılmamasından kaynaklanan mimari uyuşmazlıktan.",
        isCorrect: false
      }
    ],
    explanation: "Misafirlerin kimlik ve pasaportları gibi hassas PII (Personally Identifiable Information) belgelerinin statik public web dizinlerine (`/public/uploads/`) orijinal isimleriyle konulması büyük bir güvenlik açığıdır. Saldırgan basit bir URL fuzzer/enumerator ile tüm otel misafirlerinin kimlik fotokopilerini indirebilir.",
    theoryHint: "Hassas dosyalar ASLA public web kökünde ve orijinal isimleriyle saklanmaz."
  },
  {
    id: 8,
    title: "Adım 4: JWT İmzalama & Depolama // Açığı Kapatma Yöntemi",
    category: "File Upload: JWT Signing",
    fixedCode: `// Güvenli Rastgele İsimlendirme & İmzalı JWT İndirme URL'si:
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

function generateSecureFileStorage(fileBuffer, originalname, userId) {
  // 1. Rastgele Kriptografik UUID Dosya Adı:
  const safeExt = path.extname(originalname).toLowerCase();
  const storageKey = \`\${crypto.randomUUID()}\${safeExt}\`;
  
  // 2. Web Kökü Dışında Özel Güvenli Dizine Kayıt:
  fs.writeFileSync(path.join('/secure_storage/documents/', storageKey), fileBuffer);

  // 3. Dosyaya Erişim İçin Kısa Ömürlü İmzalı JWT Token Üretimi:
  const signedAccessToken = jwt.sign(
    { fileKey: storageKey, ownerId: userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // 15 dakika geçerli
  );

  return { storageKey, downloadUrl: \`/api/documents/download?token=\${signedAccessToken}\` };
}`,
    question: "Otel misafirlerinin yüklediği hassas belgelerin (kimlik, pasaport, fatura) yetkisiz kişilerce indirilmesini engellemek için JWT ile imzalama yöntemini nasıl uygularız?",
    options: [
      {
        key: 'A',
        text: "Dosyaları public web kökünde tutmaya devam etmek; ancak dosya adını SHA-256 ile hash'leyerek saldırganların URL'yi tahmin etmesini zorlaştırmak (Obscurity).",
        isCorrect: false
      },
      {
        key: 'B',
        text: "Yüklenen tüm kimlik ve fatura dosyalarını tek bir parola korumalı ZIP arşivine ekleyip şifreyi veritabanında saklamak.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "İndirme URL'lerini `Content-Disposition: inline` yerine `Content-Disposition: attachment` yaparak tarayıcının dosyayı doğrudan görüntülemesini engellemek.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "Dosyaları web kökü dışındaki özel bir dizinde rastgele UUID isimlerle saklamak; indirme bağlantılarına misafirin ID'sini ve kısa geçerlilik süresini içeren imzalı bir JWT token (Signed URL) bağlayıp sunucuda doğrulamadan dosyayı sunmamak.",
        isCorrect: true
      }
    ],
    explanation: "Doğru kurumsal mimaride: 1) Orijinal dosya adı yerine `crypto.randomUUID()` kullanılır (Tahmin edilemezlik). 2) Dosya public web kökünün dışına (private disk veya S3 private bucket) kaydedilir. 3) Dosyayı indirmek isteyen kullanıcıya kısa süreli (ör. 15 dk) JWT imzalı erişim linki verilir; indirme anında JWT doğrulanır.",
    theoryHint: "Savunma: UUID rastgele isimlendirme + Web kökü dışı depolama + İmzalı JWT erişim tokenı."
  },
  {
    id: 9,
    title: "Kapsamlı Kod Okuma // Zafiyet Nereden Kaynaklanıyor?",
    category: "File Upload: Architecture",
    vulnerableCode: `// GRAND SERENITY RESORT - DOSYA YÜKLEME KODU
app.post('/api/documents/upload', (req, res) => {
  const { fileName, fileContentBase64 } = req.body;
  const buffer = Buffer.from(fileContentBase64, 'base64');
  
  // Satır 6: public dizine doğrudan yazıyor
  fs.writeFileSync(\`./public/\${fileName}\`, buffer);
  res.json({ status: "OK", url: \`http://hotel.com/\${fileName}\` });
});`,
    question: "Yukarıdaki Express kod bloğu incelendiğinde sistemin siber saldırganlar tarafından ele geçirilmesine yol açan zafiyetler nereden kaynaklanmaktadır?",
    options: [
      {
        key: 'A',
        text: "`Buffer.from(fileContentBase64, 'base64')` kullanımının Node.js event loop'unu tek iş parçacığında kilitlediği için Prototype DoS açığı doğurmasından.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "1) Rota seviyesinde hiçbir Auth denetimi olmaması, 2) Dosya türü (filetype) ve boyutu (filesize) doğrulanmaması, 3) Dosyanın doğrudan public web köküne orijinal adıyla yazılması nedeniyle saldırganın Web Shell yükleyip komut çalıştırabilmesinden (RCE).",
        isCorrect: true
      },
      {
        key: 'C',
        text: "`fs.writeFileSync` metodunun senkron olması sebebiyle çok kullanıcılı senaryolarda dosya kilitlenme (File Locking) deadlock'u oluşturmasından.",
        isCorrect: false
      },
      {
        key: 'D',
        text: "HTTP yanıtında HTTP 201 Created yerine `{ status: 'OK' }` dönülerek REST API mimari kurallarının ihlal edilmesinden.",
        isCorrect: false
      }
    ],
    explanation: "Bu kod parçası bir web uygulaması için en tehlikeli 'Unrestricted File Upload' açığını barındırır: Kimlik doğrulama yok, uzantı ve bayt kontrolü yok, boyut sınırı yok ve doğrudan web sunucusunun kök dizinine `./public/${fileName}` olarak yazılmaktadır. Saldırgan `shell.php` göndererek sunucuda komut çalıştırma yetkisi (RCE) elde eder.",
    theoryHint: "Auth yok + Tür kontrolü yok + Boyut sınırı yok + Public yazma = Tam sistem ele geçirme (RCE)."
  },
  {
    id: 10,
    title: "Mavi Takım Güvenli Mimarisi // Açığı Nasıl Kapatırız?",
    category: "File Upload: Architecture",
    fixedCode: `// MAVİ TAKIM END-TO-END GÜVENLİ DOSYA YÜKLEME PİPELİNE'I:
export const secureUploadPipeline = [
  authenticateJWT,                    // 1. ADIM: JWT Kimlik & Rol Doğrulaması
  multer({                            // 2. ADIM: Katı Boyut Sınırı
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }
  }).single('document'),
  async (req, res, next) => {         // 3. ADIM: Magic Bytes & Allowlist Uzantı
    const detected = await fileTypeFromBuffer(req.file.buffer);
    if (!detected || !['image/jpeg', 'image/png', 'application/pdf'].includes(detected.mime)) {
      return res.status(415).json({ error: "415: Geçersiz dosya türü!" });
    }
    next();
  },
  (req, res) => {                     // 4. ADIM: UUID ile Özel Depolama & JWT İmzalı URL
    const uuidName = \`\${crypto.randomUUID()}.\${req.file.originalname.split('.').pop()}\`;
    saveToPrivateBucket(uuidName, req.file.buffer);
    const token = jwt.sign({ file: uuidName, user: req.user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.status(201).json({ success: true, downloadUrl: \`/api/documents/download?token=\${token}\` });
  }
];`,
    question: "Mavi Takım güvenlik uzmanı olarak otel sisteminde dosya yükleme zafiyetlerini kalıcı olarak kapatmak için hangi 4 adımlı mimariyi uygulamalıyız?",
    options: [
      {
        key: 'A',
        text: "1. Adım: Cloudflare WAF kuralları -> 2. Adım: SSL/TLS sertifika pinning -> 3. Adım: Veritabanı sütun şifrelemesi -> 4. Adım: Kullanıcı IP adresini kara listeye alma.",
        isCorrect: false
      },
      {
        key: 'B',
        text: "1. Adım: Dosyaları Base64 formatında MongoDB veritabanına doğrudan gömmek -> 2. Adım: Boyut sınırını frontend JS'ye bırakmak -> 3. Adım: MIME type'ı HTTP başlığından okumak -> 4. Adım: Rotaları HTTPS ile korumak.",
        isCorrect: false
      },
      {
        key: 'C',
        text: "1. Adım: JWT ile kimlik ve rol doğrulama -> 2. Adım: Multer ile 2MB katı boyut sınırı -> 3. Adım: Magic Bytes & Allowlist uzantı doğrulaması -> 4. Adım: UUID ile rastgele isimlendirme, private dizinde saklama ve JWT ile imzalı indirme linki üretme.",
        isCorrect: true
      },
      {
        key: 'D',
        text: "1. Adım: Yükleme klasörüne Linux üzerinde `chmod 777` izni verip Nginx cache'ini açmak -> 2. Adım: Dosyaları ZIP olarak sıkıştırmak -> 3. Adım: Sadece mesai saatlerinde yükleme izni vermek -> 4. Adım: Günlük log temizliği yapmak.",
        isCorrect: false
      }
    ],
    explanation: "Güvenli bir dosya yükleme mimarisi (Secure Upload Pipeline) bu 4 altın adımı bir arada içermelidir: 1) Yetkilendirme (Auth), 2) Boyut Sınırı (Filesize Validation - DoS engelleme), 3) Bayt ve Uzantı Doğrulama (Filetype Validation - RCE engelleme), 4) Rastgele İsimlendirme ve İmzalı Erişim (JWT Signing - PII ifşasını engelleme).",
    theoryHint: "Uçtan uca savunma: Auth -> Boyut Sınırı -> Magic Bytes -> JWT İmzalı Güvenli Depolama."
  }
];
