import type { LabItem } from '../../types/lab';

export const APPRENTICE_LABS: LabItem[] = [
  {
    id: 'lab-xss-multi-filter',
    title: 'Challenge-01 // Operasyon: Gölge Arama & Temel Reflected XSS',
    trackId: 'track-recon-entry',
    category: 'XSS',
    difficulty: 'Apprentice',
    estimatedMinutes: 10,
    description: `[GİZLİ // DOSYA NO: ACME-SEC-██01]\n\nGece 02:40. ACME Savunma Sanayii'nin dış portala açık arama motoru tespit edildi. Muhbir Y'nin bıraktığı kriptolu raporda şu satırlar yer alıyor:\n\n"Arama kutusuna girilen parametre hiçbir güvenlik filtresinden (HTML encoding) geçirilmeden doğrudan sayfaya basılıyor. Operatör X, arama kutusuna yazacağın basit bir JavaScript betiği ile tarayıcıda alert() penceresi açabilirsen kasanın ilk güvenlik anahtarını (FLAG) açığa çıkarabilirsin."`,
    objective: 'Arama kutusuna bir XSS yükü (<script>alert(1)</script> veya <img src=x onerror=alert(1)>) yazarak tarayıcıda alert() tetikleyin ve sistem bayrağını ele geçirin.',
    startingUrl: 'https://corp-portal.local/search?q=',
    tags: ['Reflected XSS', 'DOM Injection', 'Script Tag', 'Web Güvenliği Temelleri'],
    flagHash: 'd3cc091216bcfaa770d3a372962bc685',
    defenseMechanisms: [
      'HTML Varlık Kodlaması (HTML Entity Encoding)',
      'İçerik Güvenlik Politikası (Content Security Policy - CSP)',
      'Güvenli Şablon Motorları Kullanımı'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Girdi Yansıma Noktası Tespiti',
        objective: "Arama kutusuna 'test' yazıp aratarak arama kelimesinin HTML sayfasında nereye basıldığını görün.",
        guidance: "Arama kutusuna bir kelime yazıp gönderin; sayfa başlığında girdinizin filtresiz yansıdığını gözlemleyin.",
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: JavaScript Kodu Enjekte Etme',
        objective: 'Arama kutusuna <script>alert(1)</script> veya <img src=x onerror=alert(1)> yazarak sayfayı yenileyin.',
        guidance: 'Tarayıcı HTML kodunu işlerken enjekte ettiğiniz etiketi çalıştıracak ve alert penceresi fırlatacaktır.',
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: XSS Doğrulaması & Bayrak Teslimi',
        objective: 'Açılan uyarı penceresiyle birlikte simülasyonun bayrağı açığa çıkarmasını sağlayın.',
        guidance: 'Alert tetiklendiğinde platform zafiyeti doğrulayacak ve ekranın üstünde çözüldü bildirimi verecektir.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'Temel XSS Mantığı',
        content: 'Kullanıcı girdisi doğrudan HTML içine yazıldığında, tarayıcı metin ile HTML kodunu birbirinden ayıramaz.'
      },
      {
        level: 2,
        title: 'Örnek Payload',
        content: '<script>alert(1)</script> veya <img src=x onerror=alert(1)> kalıbını arama kutusuna yazıp Ara butonuna tıklayın.'
      },
      {
        level: 3,
        title: 'Alert Fonksiyonu',
        content: 'Arama kutusuna <script>alert("PWNED")</script> yazarak formu gönderin.'
      }
    ],
    solutionExplanation: 'Kullanıcıdan alınan veriler HTML çıktısına eklenmeden önce özel karakterler (&, <, >, ", \') encode edilmelidir. Güvenli kodlama kütüphaneleri bu açığı tamamen kapatır.'
  },
  {
    id: 'lab-sqli-auth-bypass',
    title: 'Challenge-02 // Giriş Kapısını Atlama: SQLi ile Parolasız Oturum (Auth Bypass)',
    trackId: 'track-recon-entry',
    category: 'SQLi',
    difficulty: 'Apprentice',
    estimatedMinutes: 10,
    description: `[GİZLİ // DOSYA NO: ACME-DB-██02]\n\nACME Personel Giriş Kapısı (/login) hedefte. Operatör X'in elinde parola yok ancak arka plandaki sorgu zafiyeti açıkça görülüyor. Muhbir Y fısıldıyor:\n\n"Giriş kontrolü doğrudan SELECT * FROM users WHERE username = '$user' AND password = '$pass' sorgusuyla yapılıyor. Kullanıcı adı kutusuna admin' OR 1=1-- enjekte edersen şifre kontrolü iptal olur ve doğrudan yönetici koltuğuna oturursun!"`,
    objective: "Giriş formundaki kullanıcı adı alanına SQL Auth Bypass yükü (admin' OR 1=1--) girerek parola bilmeden yönetici olarak oturum açın ve bayrağı kapın.",
    startingUrl: 'https://corp-portal.local/login',
    tags: ['SQL Injection', 'Auth Bypass', 'OR 1=1', 'Kimlik Doğrulama Zafiyeti'],
    flagHash: '8155b05fb42803ec69c937c33a46d640',
    defenseMechanisms: [
      'Parametreli Sorgular (Prepared Statements / Parameterized Queries)',
      'ORM Kullanımı',
      'Girdi Temizleme ve Tip Denetimi'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Giriş Formu ve SQL Mantığı İncelemesi',
        objective: '/login sayfasına giderek kullanıcı adı ve parola formunu görüntüleyin.',
        guidance: 'Arka planda çalışan SQL sorgusunun tek tırnakla kapandığını ve AND koşulu ile şifre aradığını hayal edin.',
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: Mantıksal OR Enjeksiyonu',
        objective: "Kullanıcı adı kutusuna admin' OR 1=1-- yazarak şifre alanını boş bırakın veya rastgele bir şey yazın.",
        guidance: "Tek tırnak (') orijinal sorguyu kapatır, OR 1=1 koşulu daima doğru (TRUE) sonuç verir, -- ise şifre kontrolünü yoruma alır.",
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Yönetici Oturumu & Sistem Bayrağı',
        objective: 'Giriş Yap butonuna tıklayarak yönetici olarak oturum açın ve sistem bayrağını teslim alın.',
        guidance: 'Sorgu başarıyla baypas edildiğinde sistem yönetici yetkisi verir ve ekranda bayrak belirecektir.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'SQL Mantığını Kırma',
        content: "SQL'de WHERE username = '' OR 1=1 ifadesi her zaman DOĞRU (true) sonucunu döner."
      },
      {
        level: 2,
        title: 'Yorum Satırı Karakteri',
        content: "Sorgunun geri kalan şifre kontrolünü iptal etmek için SQLite ve MySQL'de çift tire (--) kullanılır."
      },
      {
        level: 3,
        title: 'Tam Payload',
        content: "Kullanıcı adı kutusuna admin' OR 1=1-- yazın ve şifreye herhangi bir şey yazıp Giriş Yap'a basın."
      }
    ],
    solutionExplanation: 'Dinamik string birleştirme ile SQL sorguları yazıldığında tek tırnak mantıksal denetimi bozar. Çözüm, kullanıcı girdisini veri olarak bağlayan parametreli sorgu (PreparedStatement) kullanmaktır.'
  },
  {
    id: 'lab-sqli-union-schema',
    title: 'Challenge-03 // Envanter Veritabanı & UNION SQL Enjeksiyonu',
    trackId: 'track-recon-entry',
    category: 'SQLi',
    difficulty: 'Apprentice',
    estimatedMinutes: 15,
    description: `[GİZLİ // DOSYA NO: ACME-DB-██03]\n\nOperatör X, ACME Savunma Donanım Kataloğu'na sızdı. Muhbir Y'nin ses kaydı:\n\n"Katalog sorgusu URL'deki 'category' parametresini filtresiz alıyor. ' UNION SELECT ile veritabanındaki gizli 'corp_accounts' tablosunu mevcut ürün tablosuna ekleyebilirsin. Sistem yöneticisi sysadmin_chief'in parolasını ekrana bastır ve bayrağı kap!"`,
    objective: "Katalog URL'sine UNION SELECT enjeksiyonu yaparak corp_accounts tablosundaki sysadmin_chief kullanıcısının parolasını (FLAG) ekranda görüntüleyin.",
    startingUrl: 'https://corp-inventory.local/inventory?category=Electronics',
    tags: ['SQL Injection', 'UNION Attack', 'Veritabanı Sızıntısı', 'SQLite'],
    flagHash: '86c84d078f991dd0ace67c8d23df69bc',
    defenseMechanisms: [
      'Parametreli Sorgular (Prepared Statements)',
      'Girdi Beyaz Listesi (Kategori değerlerinin sınırlanması)',
      'En Az Yetki Prensibi'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Sütun Sayısını Test Etme',
        objective: 'category parametresine ORDER BY enjeksiyonu yaparak ürün tablosunun kaç sütun (4 sütun) olduğunu tespit edin.',
        guidance: "ORDER BY 4 sorunsuz çalışırken ORDER BY 5 hata verir; bu orijinal sorgunun 4 sütun olduğunu gösterir.",
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: UNION SELECT ile Tabloları Birleştirme',
        objective: "' UNION SELECT 1, acc_username, acc_pass_hash, acc_role FROM corp_accounts-- sorgusunu enjekte edin.",
        guidance: 'UNION operatörü ikinci sorgunun sonuçlarını ürünler tablosunun altına yeni satırlar olarak ekler.',
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Bayrak Sızıntısı ve Kasa Açımı',
        objective: 'Ürün listesinde sysadmin_chief kullanıcısının parola alanına basılan FLAG değerini kopyalayın.',
        guidance: 'Yeşil vurgu ile tabloda dinamik olarak beliren sistem bayrağını kopyalayıp doğrulayın.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'UNION Kuralı',
        content: 'UNION SELECT yapabilmek için iki sorgunun da sütun sayısı ve veri tipleri birbiriyle eşleşmelidir (4 sütun).'
      },
      {
        level: 2,
        title: 'Hedef Tablo ve Sütunlar',
        content: 'corp_accounts tablosunda acc_username ve acc_pass_hash sütunları bulunmaktadır.'
      },
      {
        level: 3,
        title: 'Örnek Sorgu',
        content: "Kategori arama kutusuna ' UNION SELECT 1, acc_username, acc_pass_hash, 'admin' FROM corp_accounts-- yazıp aratın."
      }
    ],
    solutionExplanation: 'UNION SQL enjeksiyonunda saldırgan mevcut sorgunun yanına kendi istediği ek sorguyu iliştirir. Çözüm, dinamik string birleştirme yerine ORM veya parametreli sorgu kullanmaktır.'
  },
  {
    id: 'lab-recon-robots',
    title: 'Challenge-04 // Ağ Keşfi & Gizli robots.txt Sayfası',
    trackId: 'track-recon-entry',
    category: 'Recon',
    difficulty: 'Apprentice',
    estimatedMinutes: 5,
    description: `[GİZLİ // DOSYA NO: ACME-NET-██04]\n\nOperatör X, ACME Savunma web sunucusunun açıklarını tarıyor. Muhbir Y fısıldıyor:\n\n"Geliştiriciler arama motorlarının (Google, Bing) indekslemesini istemedikleri gizli sayfaları web kök dizinindeki 'robots.txt' dosyasında belirtirler. robots.txt dosyasını aç, 'Disallow' edilen gizli yönetim rotasını keşfet ve doğrudan o gizli sayfaya giderek bayrağı teslim al!"`,
    objective: "Adres çubuğuna /robots.txt yazarak gizli yönetim yolunu (/admin_secret_portal) bulun, sayfayı ziyaret edip bayrağı yakalayın.",
    startingUrl: 'https://corp-portal.local/',
    tags: ['Recon', 'robots.txt', 'Bilgi İfşası', 'Gizli Rotalar'],
    flagHash: 'faefb05a2bd4668f7e6f6be2cd669cbf',
    defenseMechanisms: [
      'Hassas Sayfaları robots.txt ile Gizlemeye Çalışmamak (Security through Obscurity)',
      'Güçlü Kimlik Doğrulama ile Erişim Kısıtlama',
      'Ağ Düzeyinde IP Sınırlandırması'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: robots.txt Dosyasına İstek Atma',
        objective: 'Hedef tarayıcının adres çubuğuna /robots.txt yazıp Enter tuşuna basın.',
        guidance: 'Sunucu arama motoru direktiflerini içeren metin belgesini ekrana basacaktır.',
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: Gizli Rotayı Okuma',
        objective: 'Disallow satırında yasaklanan gizli yönetim panelinin URL yolunu not edin.',
        guidance: 'Disallow: /admin_secret_portal satırındaki gizli rotayı kopyalayın.',
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Gizli Paneli Ziyaret Etme',
        objective: 'Adres çubuğuna /admin_secret_portal yazarak sayfayı açın ve bayrağı alın.',
        guidance: 'Gizli panele ulaşıldığında kilitli savunma verisi ve bayrak teslim edilecektir.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'robots.txt Nedir?',
        content: 'Arama motoru botlarına hangi sayfaları taramamaları gerektiğini söyleyen kamuya açık bir dosyadır.'
      },
      {
        level: 2,
        title: 'Disallow Direktifi',
        content: 'robots.txt içeriğinde "Disallow: /..." şeklinde listelenen yollar gizli veya yönetici rotalarını ifşa eder.'
      },
      {
        level: 3,
        title: 'Hedef URL',
        content: 'Adres çubuğuna https://corp-portal.local/admin_secret_portal yazıp Enter tuşuna basın.'
      }
    ],
    solutionExplanation: 'Gizlilik yoluyla güvenlik (Security through Obscurity) gerçek bir güvenlik sağlamaz. robots.txt bir erişim engeli değildir; kamuya açık olduğu için saldırganlar ilk olarak burayı inceler.'
  }
];
