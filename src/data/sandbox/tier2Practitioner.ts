import type { LabItem } from '../../types/lab';

export const PRACTITIONER_LABS: LabItem[] = [
  {
    id: 'lab-cookie-tamper',
    title: 'Challenge-05 // Çerez Manipülasyonu & Yetki Yükseltme (Cookie Tampering)',
    trackId: 'track-client-state',
    category: 'Auth',
    difficulty: 'Practitioner',
    estimatedMinutes: 15,
    description: `[GİZLİ // DOSYA NO: ACME-AUTH-██05]\n\nACME Ana Yönetim Konsolu (/admin) açıldığında "Yetersiz Yetki: Yalnızca yöneticiler (admin) erişebilir" uyarısı veriyor. Muhbir Y'nin terminal notu:\n\n"Geliştiriciler yetkilendirmeyi sunucu oturumunda saklamak yerine tarayıcı çerezi olarak kaydetmiş: 'user_role=guest'. Çerezler sekmesini veya geliştirici araçlarını aç, 'user_role' değerini 'admin' olarak değiştir ve sayfayı yenile... Yönetici kapısı anında ardına kadar açılacaktır!"`,
    objective: "Tarayıcıdaki 'user_role' çerez değerini 'guest' yerine 'admin' olarak değiştirin, /admin sayfasını yenileyerek süper kullanıcı paneline sızın ve bayrağı ele geçirin.",
    startingUrl: 'https://corp-portal.local/admin',
    tags: ['Cookie Tampering', 'Yetki Yükseltme', 'Privilege Escalation', 'Oturum Güvenliği'],
    flagHash: '3c92fad772d7bd6ec138d2ebe70a4d7e',
    defenseMechanisms: [
      'Yetki Bilgisinin Sunucu Tarafında Saklanması (Server-Side Session)',
      'Çerezlerin Kriptografik Olarak İmzalanması (HMAC Signed Cookies)',
      'HttpOnly ve Secure Çerez Bayrakları'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Yetki Uyarısını İnceleme',
        objective: '/admin adresini açarak misafir kullanıcının engellendiği ekranı görüntüleyin.',
        guidance: "Ekranda 'user_role=guest yetkisi ile giriş yapıldı, admin yetkisi gerekli' mesajını gözlemleyin.",
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: Çerez Değerini Değiştirme',
        objective: "Target Browser üstündeki 'Çerezler' sekmesini açın ve user_role anahtarının değerini 'admin' yapın.",
        guidance: "user_role=admin çerezini kaydedin veya yeni çerez olarak ekleyin.",
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Yönetici Paneli & Bayrak Çıkarımı',
        objective: 'Sayfayı yenileyerek yönetim konsolunun açıldığını ve bayrağın verildiğini doğrulayın.',
        guidance: 'Yetki kontrolü başarıyla aşıldığında sistem yöneticisi bayrağı ekrana yansıyacaktır.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'İstemci Tarafı Çerez Tehlikesi',
        content: 'Tarayıcıda saklanan her veri kullanıcı tarafından kolayca düzenlenebilir. Asla yetki kararları çerezdeki düz metne dayandırılmamalıdır.'
      },
      {
        level: 2,
        title: 'Çerezler Sekmesi',
        content: "Tarayıcı adres çubuğunun hemen altındaki 'Çerezler' butonuna tıklayarak mevcut çerezleri listeleyin."
      },
      {
        level: 3,
        title: 'Değiştirilecek Değer',
        content: 'user_role çerezini "admin" olarak güncelleyin ve Yenile (Refresh) butonuna basın.'
      }
    ],
    solutionExplanation: 'Rol ve yetki bilgileri asla istemcinin değiştirebileceği çerezlerde düz metin tutulmamalıdır. Sunucu tarafı oturum yönetimi (sessions) veya JWT kullanılmalıdır.'
  },
  {
    id: 'lab-auth-bola-idor',
    title: 'Challenge-06 // Kırık Nesne Yetkilendirmesi (BOLA / IDOR)',
    trackId: 'track-client-state',
    category: 'Auth',
    difficulty: 'Practitioner',
    estimatedMinutes: 15,
    description: `[GİZLİ // DOSYA NO: ACME-DOC-██06]\n\nOperatör X, ACME Savunma Doküman Arşivi API'sine bağlandı. Ekranda kendi personeline ait 101 numaralı çalışma direktifi görüntüleniyor. Muhbir Y'nin istihbarat notu:\n\n"Arka uç API'si kullanıcının bu dokümana erişim hakkı olup olmadığını kontrol etmiyor; URL'deki 'doc_id' parametresini körü körüne okuyor. doc_id=101 değerini 105 yaparak 'Proje Kasırga Savunma Direktifi' belgesini ve içindeki kilit bayrağı yetkisizce çek!"`,
    objective: "URL parametresindeki doc_id=101 değerini 105 yaparak başka bir birime ait gizli savunma direktifini görüntüleyin ve bayrağı elde edin.",
    startingUrl: 'https://corp-vault.local/api/v2/vault/flag?doc_id=101',
    tags: ['IDOR', 'BOLA', 'Yetkisiz Nesne Erişimi', 'API Güvenliği'],
    flagHash: '42e7e0b51f55dd0ae633a2bfdc27ea42',
    defenseMechanisms: [
      'Nesne Bazında Yetki Denetimi (Object-Level Authorization)',
      'Tahmin Edilemeyen Tanımlayıcılar (UUID / GUID)',
      'Rol ve Sahiplik Doğrulama Katmanı'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Yetkili Doküman İstek İncelemesi',
        objective: 'doc_id=101 parametresi ile açılan mevcut dokümanı ve URL yapısını inceleyin.',
        guidance: "Adres çubuğundaki doc_id parametresinin veritabanındaki kayıt ID'si olduğunu fark edin.",
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: Parametre Değiştirme (ID Enumeration)',
        objective: 'Adres çubuğundaki doc_id=101 değerini doc_id=105 olarak değiştirip Enter tuşuna basın.',
        guidance: 'Uygulama yetki kontrolü yapmadığı için 105 numaralı üst düzey gizli dokümanı doğrudan ekrana basacaktır.',
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Gizli Belge & Bayrak Tespiti',
        objective: 'Açılan savunma direktifindeki FLAG değerini kopyalayın.',
        guidance: 'Gizli savunma direktifinde dinamik olarak üretilen sistem bayrağını kopyalayıp doğrulayın.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'IDOR / BOLA Nedir?',
        content: 'Kullanıcının doğrudan URL veya parametredeki ID numarasını değiştirerek başkasına ait verilere erişebilmesi durumudur.'
      },
      {
        level: 2,
        title: 'Adres Çubuğunu Düzenleme',
        content: 'URL çubuğundaki "?doc_id=101" kısmını "?doc_id=105" yapıp Git (Enter) tuşuna basın.'
      },
      {
        level: 3,
        title: 'Hedef Doküman',
        content: 'https://corp-vault.local/api/v2/vault/flag?doc_id=105 adresini ziyaret edin.'
      }
    ],
    solutionExplanation: 'Veritabanı kayıt IDleri açıkta olduğunda saldırganlar ardışık numaraları deneyerek tüm sistemi sızdırabilir. Çözüm, kullanıcının o IDye erişim yetkisini sunucu tarafında doğrulamaktır.'
  },
  {
    id: 'lab-xss-stored-markdown',
    title: 'Challenge-07 // Kalıcı Blog Yorumu & Stored XSS',
    trackId: 'track-client-state',
    category: 'XSS',
    difficulty: 'Practitioner',
    estimatedMinutes: 20,
    description: `[GİZLİ // DOSYA NO: ACME-STOR-██07]\n\nACME İç Mühendislik Blogu (/post?id=1) hedefte. Çalışanların bıraktığı yorumlar doğrudan veritabanına kaydediliyor ve sistem yöneticisi (admin) tarafından denetleniyor. Muhbir Y'nin uyarısı:\n\n"Yorum kutusu HTML etiketlerini ve JavaScript kodlarını filtrelemiyor. Yorum olarak <script>alert(1)</script> veya <img src=x onerror=alert(1)> bırakırsan, sayfayı her ziyaret eden kişinin ve kurban yöneticinin tarayıcısında kalıcı olarak alert tetiklenecektir!"`,
    objective: "Blog yorum formuna bir XSS yükü (<script>alert(1)</script> veya <img src=x onerror=alert(1)>) göndererek sayfaya kalıcı olarak kaydedin ve yönetici çerezini kapın.",
    startingUrl: 'https://corp-portal.local/post?id=1',
    tags: ['Stored XSS', 'Kalıcı XSS', 'Yorum Enjeksiyonu', 'Çerez Hırsızlığı'],
    flagHash: '51b739145a43683fa8d36d18e7c23743',
    defenseMechanisms: [
      'Girdi Temizleme (Sanitization - DOMPurify)',
      'Bağlamsal Çıktı Kodlama',
      'HttpOnly Çerez Bayrakları'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Yorum Formu Analizi',
        objective: 'Sayfanın altındaki yorum kutusuna test yorumu yazıp Gönder butonuna tıklayın.',
        guidance: 'Yorumun sayfada kaydedildiğini ve sayfa yenilendiğinde silinmediğini gözlemleyin.',
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: Zararlı XSS Yorumu Bırakma',
        objective: 'Yorum metni olarak <script>alert(1)</script> veya <img src=x onerror=alert(1)> yazarak gönderin.',
        guidance: 'Sunucu yorumu doğrudan veritabanına işleyecek ve sayfa yeniden render edildiğinde kod çalışacaktır.',
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Kalıcı Kod Yürütme & Bayrak Ele Geçirme',
        objective: 'Alert tetiklendiğinde kurban yöneticinin oturum çerezini ve sistem bayrağını teslim alın.',
        guidance: 'Kalıcı XSS başarıyla çalıştığında simüle yönetici çerezi ve bayrak açığa çıkacaktır.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'Stored XSS Farkı',
        content: 'Reflected XSS sadece URL tıklandığında çalışır; Stored XSS ise veritabanına kaydedildiği için sayfayı açan herkeste çalışır.'
      },
      {
        level: 2,
        title: 'Yorum Kutusu',
        content: 'Yorum kutusuna <script>alert(document.cookie)</script> veya <img src=x onerror=alert(1)> yazıp gönderin.'
      },
      {
        level: 3,
        title: 'Otomatik Çözüm',
        content: 'Alert penceresi açıldığında platform kalıcı XSS zafiyetini doğrulayacak ve bayrağı verecektir.'
      }
    ],
    solutionExplanation: 'Stored XSS en tehlikeli istemci zaafiyetlerindendir. Çözüm, veritabanına kaydedilen tüm kullanıcı girdilerini ekrana basarken güvenilir HTML sanitize kütüphanelerinden geçirmektir.'
  },
  {
    id: 'lab-path-traversal',
    title: 'Challenge-08 // Dizin Atlama & Gizli Dosya Okuma (Path Traversal)',
    trackId: 'track-client-state',
    category: 'Recon',
    difficulty: 'Practitioner',
    estimatedMinutes: 15,
    description: `[GİZLİ // DOSYA NO: ACME-FILE-██08]\n\nACME Doküman Görüntüleme Servisi (/documents?file=report.pdf) sunucudan dosya çekiyor. Muhbir Y fısıldıyor:\n\n"Geliştiriciler dosya yolunu kontrol etmiyor; doğrudan sunucunun diskinden okuma yapıyor. Parametreye '../../secret.txt' veya '../../etc/passwd' enjekte ederek dizin ağacında yukarı tırmanabilir, sistemin en gizli kilit dosyasını okuyabilirsin!"`,
    objective: "file parametresine '../../secret.txt' yazarak dizin atlama (Path Traversal) gerçekleştirin ve sunucudaki gizli sistem dosyasını okuyup bayrağı alın.",
    startingUrl: 'https://corp-portal.local/documents?file=report.pdf',
    tags: ['Path Traversal', 'Directory Traversal', 'Dosya İfşası', 'Key Leak'],
    flagHash: 'fdfcc2513217bd0e394eb3c707475aca',
    defenseMechanisms: [
      'Girdi Doğrulama ve ../ Karakterlerinin Ayıklanması',
      'İzin Verilen Dosya İsimleri Beyaz Listesi (Whitelist)',
      'Dosya Erişiminin Sabit Dizinle Kısıtlanması (chroot / realpath)'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Dosya Parametresi İncelemesi',
        objective: 'Adres çubuğundaki file=report.pdf parametresini ve dönen rapor metnini gözlemleyin.',
        guidance: "Sunucunun parametredeki dosya ismini diskten okuduğunu anlayın.",
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: Dizin Atlama (../) Enjeksiyonu',
        objective: 'Parametreyi file=../../secret.txt olarak değiştirerek dizin ağacında yukarı çıkmayı deneyin.',
        guidance: "../ ayracı sunucu işletim sisteminde bir üst klasöre tırmanmayı sağlar.",
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Gizli Dosya & Bayrak Tespiti',
        objective: 'Ekrana basılan secret.txt içeriğindeki sistem bayrağını yakalayın.',
        guidance: 'Gizli dosya içeriğinde dinamik olarak üretilen sistem bayrağını kopyalayıp doğrulayın.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'Dizin Atlama (../) Nedir?',
        content: 'İşletim sistemlerinde "../" bir üst dizine geçmek anlamına gelir. Yeterince "../" ekleyerek kök dizine ulaşılabilir.'
      },
      {
        level: 2,
        title: 'Adres Çubuğu Parametresi',
        content: 'URLdeki "file=report.pdf" yerine "file=../../secret.txt" yazıp Enter tuşuna basın.'
      },
      {
        level: 3,
        title: 'Hedef URL',
        content: 'https://corp-portal.local/documents?file=../../secret.txt adresine gidin.'
      }
    ],
    solutionExplanation: 'Kullanıcı girdisi doğrudan dosya yolu olarak kullanıldığında saldırganlar sistem dosyalarını okuyabilir. Çözüm, sadece izin verilen dosya isimlerinin kabul edildiği bir beyaz liste kullanmaktır.'
  }
];
