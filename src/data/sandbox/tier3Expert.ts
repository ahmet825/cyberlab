import type { LabItem } from '../../types/lab';

export const EXPERT_LABS: LabItem[] = [
  {
    id: 'lab-recon-verb-tampering',
    title: 'Challenge-09 // Protokol Kör Noktası & HTTP Metot Manipülasyonu (Verb Tampering)',
    trackId: 'track-deep-exploit',
    category: 'Recon',
    difficulty: 'Expert',
    estimatedMinutes: 20,
    description: `[GİZLİ // DOSYA NO: ACME-NET-██09]\n\nACME iç personel dizinine giden ağ yolu (/api/v1/users) güvenlik duvarı tarafından katı kurallarla korunuyor. Doğrudan GET veya POST istekleri 403 Forbidden ile engellenmektedir. Muhbir Y fısıldıyor:\n\n"Güvenlik duvarı yalnızca bilinen standart HTTP fiilini (GET) engelliyor. Ancak arka uç çerçevesi 'X-HTTP-Method-Override: GET' başlığını dinliyor! İsteği POST olarak gönderip başlığı ekle, güvenlik duvarını kör noktadan vur!"`,
    objective: "Repeater veya Terminal üzerinden POST /api/v1/users isteğine 'X-HTTP-Method-Override: GET' başlığını ekleyerek 403 engelini aşın ve personel bayrağını alın.",
    startingUrl: 'https://api.corp-internal.local/api/v1/users',
    tags: ['Verb Tampering', 'Method Override', 'Access Control Bypass', 'WAF Bypass'],
    flagHash: 'a758427cca43e76d65c89a88e42b721f',
    defenseMechanisms: [
      'Bütüncül HTTP Metot Beyaz Listesi',
      'Ters Proxy Düzeyinde Override Başlıklarının Temizlenmesi',
      'Yetkilendirmenin Rota Bazında Zorunlu Kılınması'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: 403 Erişim Engeli Analizi',
        objective: '/api/v1/users adresini açarak güvenlik duvarının GET isteğini engellediğini gözlemleyin.',
        guidance: "Ekranda 403 Forbidden ve 'Doğrudan GET erişimi yasaklanmıştır' uyarısını görün.",
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: Repeater ile Override Başlığı Ekleme',
        objective: 'Repeater sekmesini açın, isteği POST metoduna çevirip X-HTTP-Method-Override: GET başlığını ekleyin.',
        guidance: 'Arka uç sunucu WAF filtresini atlatıp GET işlemini çalıştıracaktır.',
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Personel Listesi & Bayrak Teslimi',
        objective: 'İsteği Gönder (Send) butonuna basarak yanıt gövdesindeki sistem bayrağını teslim alın.',
        guidance: 'Yetkisiz personel dizini ve dinamik üretilen sistem bayrağı ekrana basılacaktır.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'Metot Manipülasyonu Mantığı',
        content: 'Erişim kontrol kuralları çoğunlukla sadece GET fiilini denetler. Metodu değiştirmek kuralları atlatabilir.'
      },
      {
        level: 2,
        title: 'Repeater Kullanımı',
        content: "Repeater sekmesine geçin. İstek satırını POST /api/v1/users yapın ve başlıklar arasına X-HTTP-Method-Override: GET ekleyin."
      },
      {
        level: 3,
        title: 'Terminal Alternatifi',
        content: 'curl -X POST -H "X-HTTP-Method-Override: GET" https://api.corp-internal.local/api/v1/users komutunu çalıştırabilirsiniz.'
      }
    ],
    solutionExplanation: 'Güvenlik filtreleri HTTP fiilini yüzeysel inceleyip uygulama çerçevesinin desteklediği override başlıklarını göz ardı ettiğinde erişim kontrolü tamamen bypass edilebilir.'
  },
  {
    id: 'lab-recon-host-injection',
    title: 'Challenge-10 // Sahte Rota & Host Başlığı Zehirleme (Host Header Injection)',
    trackId: 'track-deep-exploit',
    category: 'Recon',
    difficulty: 'Expert',
    estimatedMinutes: 20,
    description: `[GİZLİ // DOSYA NO: ACME-AUTH-██10]\n\nACME Savunma Yönetim Kurulu Başkanı'nın (victim_ceo@corp.internal) parola sıfırlama mekanizması hedefte. Muhbir Y'nin aktardığı istihbarat:\n\n"Parola sıfırlama servisi, e-posta linkini oluştururken HTTP 'Host' veya 'X-Forwarded-Host' başlığını okuyor. Repeater ile istek başlığına 'X-Forwarded-Host: evil-collector.local' eklersen, CEO'nun sıfırlama bağlantısı doğrudan saldırgan sunucusuna zehirlenir ve sistem bayrağı açığa çıkar!"`,
    objective: "Parola sıfırlama formunu kullanırken Repeater üzerinden 'X-Forwarded-Host: evil-collector.local' başlığı ekleyerek sıfırlama linkini zehirleyin ve bayrağı kapın.",
    startingUrl: 'https://corp-auth.local/forgot-password',
    tags: ['Host Header Injection', 'Password Reset Poisoning', 'Başlık Zehirleme'],
    flagHash: '052b189fcf228b3807cda4419a104eb8',
    defenseMechanisms: [
      'Mutlak Alan Adı Sabitlemesi (SERVER_NAME)',
      'Ters Proxy Üzerinde Güvenilmeyen Host Başlıklarının Engellenmesi',
      'Reset Token Bağlantılarında Yalnızca Beyaz Listedeki Domainlerin Kullanılması'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Parola Sıfırlama İstek Akışı',
        objective: 'victim_ceo@corp.internal e-postası ile parola sıfırlama isteği gönderin.',
        guidance: "Formu gönderin ve giden HTTP isteğini Repeater paneline taşıyın.",
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: X-Forwarded-Host Başlığı Ekleme',
        objective: 'İstek başlıklarına X-Forwarded-Host: evil-collector.local satırını ekleyin.',
        guidance: 'Sunucu e-posta linkini oluştururken bu sahte host adresini temel alacaktır.',
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Zehirlenen Bağlantı & Bayrak',
        objective: 'İsteği Gönder (Send) butonuna basarak kurbanın sıfırlama tokenını ve bayrağı teslim alın.',
        guidance: 'Başarılı manipülasyonda sistem sıfırlama bağlantısıyla birlikte dinamik bayrağı üretecektir.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'Host Başlığına Aşırı Güven',
        content: 'Sunucular dışarıdan gelen Host veya X-Forwarded-Host başlığına güvenerek e-posta linki oluşturursa yönlendirme zehirlenir.'
      },
      {
        level: 2,
        title: 'Repeater Ayarı',
        content: 'Repeater sekmesinde istek başlıklarının altına X-Forwarded-Host: evil-collector.local ekleyin.'
      },
      {
        level: 3,
        title: 'Hedef Hesap',
        content: 'E-posta parametresine victim_ceo@corp.internal yazarak isteği gönderin.'
      }
    ],
    solutionExplanation: 'Dinamik Host başlığına güvenmek, parola sıfırlama bağlantılarının saldırganın sunucusuna yönlendirilmesine yol açar. Çözüm, e-posta linklerinde her zaman sunucu yapılandırmasında sabitlenmiş etki alanının kullanılmasıdır.'
  },
  {
    id: 'lab-sqli-blind-boolean',
    title: 'Challenge-11 // Karanlıkta Dinleme: Mantıksal Kör SQL Enjeksiyonu (Blind Boolean)',
    trackId: 'track-deep-exploit',
    category: 'SQLi',
    difficulty: 'Expert',
    estimatedMinutes: 20,
    description: `[GİZLİ // DOSYA NO: ACME-VAULT-██11]\n\nACME Envanter sisteminde ekranda hiçbir SQL hatası basılmıyor. Ancak sayfa doğru ve yanlış koşullara farklı tepkiler veriyor. Muhbir Y fısıldıyor:\n\n"category=Electronics' AND 1=1-- yazdığında ürünler listelenir; category=Electronics' AND 1=2-- yazdığında ise sayfa boş gelir! Bu mantıksal farkı kullanarak 'secure_vault' tablosundaki 'root_vault_flag' parolasını sorgula ve gizli bayrağı doğrula!"`,
    objective: "Envanter arama parametresine Boolean SQL enjeksiyonu yaparak (' AND 1=1--) doğru ve yanlış koşulları test edin ve kasanın bayrağını teslim alın.",
    startingUrl: 'https://corp-inventory.local/inventory?category=Electronics',
    tags: ['Blind SQLi', 'Boolean-Based', 'Mantıksal Çıkarım', 'Veritabanı Güvenliği'],
    flagHash: '9fa77ee6edf0f0d18ad91e400c181365',
    defenseMechanisms: [
      'Parametreli Sorgular (Prepared Statements)',
      'Girdi Doğrulama',
      'Hassas Verilerin Ayrı Veritabanında Tutulması'
    ],
    stages: [
      {
        id: 1,
        title: 'Aşama 1: Doğru Koşul (True) Testi',
        objective: "category parametresine Electronics' AND 1=1-- yazarak ürünlerin normal listelendiğini görün.",
        guidance: "Koşul doğru olduğu için veritabanı orijinal ürünleri dönecektir.",
        isCompleted: false
      },
      {
        id: 2,
        title: 'Aşama 2: Yanlış Koşul (False) Testi',
        objective: "category parametresine Electronics' AND 1=2-- yazarak ürünlerin kaybolduğunu görün.",
        guidance: "Koşul yanlış olduğu için 'Sonuç bulunamadı' mesajı gelecektir. Bu kör SQLi varlığını kanıtlar.",
        isCompleted: false
      },
      {
        id: 3,
        title: 'Aşama 3: Kasa Varlığı Doğrulaması & Bayrak',
        objective: 'Kör sorgu mantığını tamamlayarak kasanın dinamik ürettiği bayrağı teslim alın.',
        guidance: 'Doğru mantıksal çıkarım sonrasında ekranda beliren sistem bayrağını onaylayın.',
        isCompleted: false
      }
    ],
    hints: [
      {
        level: 1,
        title: 'Kör SQLi Mantığı',
        content: 'Veritabanı ekrana veri basmasa bile doğru ve yanlış koşullara farklı HTTP yanıtları dönerek bilgi sızdırır.'
      },
      {
        level: 2,
        title: 'Doğru ve Yanlış Ayrımı',
        content: "Electronics' AND 1=1-- ile Electronics' AND 1=2-- arasındaki sayfa farkını gözlemleyin."
      },
      {
        level: 3,
        title: 'Kasa Çıkarımı',
        content: "Kategori filtresinde Electronics' AND 1=2-- veya system_secrets alt sorgusunu çalıştırarak boolean doğrulamasını tetikleyin."
      }
    ],
    solutionExplanation: 'Kör SQL enjeksiyonunda veriler doğrudan ekrana yansımaz; ancak uygulamanın mantıksal (Boolean) tepkileri ölçülerek veritabanındaki tüm karakterler teker teker deşifre edilebilir.'
  }
];
