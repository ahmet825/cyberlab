import type { Mission } from './types';

export interface LinuxMachineDef {
  id: string;
  number: string;
  title: string;
  codename: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri Düzey';
  os: string;
  description: string;
  status: 'active' | 'coming_soon';
}

export const LINUX_MACHINES: LinuxMachineDef[] = [
  {
    id: 'machine-01',
    number: '01',
    title: "Y'nin Bilgisayarı (İş İstasyonu)",
    codename: 'TARGET-STATION-Y',
    difficulty: 'Başlangıç',
    os: 'Debian 12 Bookworm (Minimal WASM)',
    description: "Y'nin açık bıraktığı kişisel iş istasyonu. 7 aşamalı gizem zinciri: kimlik tespiti, gizli dosyalar, log analizi, arama motoru, izinler, paketler ve root kasası.",
    status: 'active'
  },
  {
    id: 'machine-02',
    number: '02',
    title: 'DMZ Web Sunucusu (Nginx & PHP)',
    codename: 'EDGE-GATEWAY-02',
    difficulty: 'Orta',
    os: 'Ubuntu 24.04 LTS Server',
    description: 'Şirketin dışa açık web sunucusu. Web log analizi, gizli config avı ve yanlış yapılandırılmış servis yetkileri.',
    status: 'coming_soon'
  },
  {
    id: 'machine-03',
    number: '03',
    title: 'İç Ağ Veritabanı & Sysadmin Kasası',
    codename: 'INTERNAL-VAULT-DB',
    difficulty: 'İleri Düzey',
    os: 'Alpine Linux (Hardened)',
    description: 'Kritik veritabanı yedeği, cron zamanlanmış görevleri ve karmaşık Linux yetki yükseltme (Privilege Escalation) zinciri.',
    status: 'coming_soon'
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 1,
    section: 1,
    sectionTitle: 'Bölüm 1 — Sessiz Oda & Kimlik Tespiti',
    name: '01 // Kapıdaki Gölge & Sisteme İlk Bakış',
    storySnippet: `Y mutfağa gittiğinde kapının arkasındaki su ısıtıcısının cızırtısı duyuluyor. Masadaki eski monitörün yeşil imleci karanlık odada yanıp sönüyor. X klavyeye dokunmadan önce duraksıyor: "Kim bu makinenin kullanıcısı, nerede duruyorum ve bu sistem neyin nesi?" Masadaki kahve bardağının altında bir not: "Sistemde kaybolmamak için önce nerede durduğunu bilmelisin..."`,
    objective: 'pwd komutuyla bulunduğun dizini, whoami ile mevcut kullanıcı kimliğini ve uname -a ile sistemin çekirdek mimarisini tespit et.',
    startDir: '/home/x',
    relatedFiles: ['/home/x'],
    learnedConcept: 'Linux Süreç Kimliği (UID), Çalışma Dizini (PWD) ve Çekirdek Bilgisi (uname)',
    conceptSummary: `Linux'ta her kabuk oturumu belirli bir kullanıcı (UID) ve geçerli çalışma dizini (current working directory) bağlamında çalışır. "pwd" (Print Working Directory) o anki konumu; "whoami" oturum sahibini; "uname -a" ise donanım mimarisi ve çekirdek sürümünü döner. Bir sisteme sızıldığında veya oturum açıldığında ilk yapılan işlem bu keşif (recon) adımıdır.`,
    checkCondition: (ctx) => {
      const cmd = ctx.lastCommand.trim();
      return (
        cmd === 'uname' ||
        cmd.startsWith('uname ') ||
        cmd === 'pwd' ||
        cmd === 'whoami'
      );
    },
    nextMissionId: 2
  },
  {
    id: 2,
    section: 1,
    sectionTitle: 'Bölüm 1 — Dosya Ağacı & Gizli Dosyalar',
    name: '02 // Masaüstünün Ötesi & Gizli Notlar',
    storySnippet: `Masaüstünde açık duran Desktop/readme.txt dosyasında Y şöyle bir not bırakmış: "Gözünün önündeki açık dosyalar sadece dikkatsizleri oyalamak içindir. Asıl önemli şeyler her zaman görünmez olanların ardındadır." Linux'ta dosya isimlerinin başına konan bir noktanın (.) dosyaları standart listelemelerden sakladığını hatırlıyorsun...`,
    objective: 'Ev dizinindeki tüm dosyaları gizlilerle birlikte listele (ls -la), keşfettiğin gizli .secrets dizinine ulaş ve içindeki first_clue.txt belgesini cat ile oku.',
    startDir: '/home/x',
    relatedFiles: ['/home/x/Desktop/readme.txt', '/home/x/.secrets/first_clue.txt'],
    learnedConcept: 'Linux Gizli Dosyaları (.) ve Genişletilmiş Listeleme (ls -la)',
    conceptSummary: `Linux işletim sisteminde nokta (.) ile başlayan dosya ve dizinler (örneğin .bashrc, .secrets, .ssh) kullanıcı arayüzünde ve standart "ls" çıktısında kasten gizlenir. Bu dosyaları listelemek için "ls" komutuna "-a" (all) parametresi eklenir. "-l" parametresi ise dosya izinlerini, sahiplerini ve boyutlarını ayrıntılı bir tabloda sunar.`,
    checkCondition: (ctx) => {
      return (
        ctx.readFiles.has('/home/x/.secrets/first_clue.txt') ||
        ctx.lastOutput.includes('[İPUCU #01 // GİZLİ DİZİN BULUNDU]')
      );
    },
    nextMissionId: 3
  },
  {
    id: 3,
    section: 2,
    sectionTitle: 'Bölüm 2 — Dosya Dedektifi & Metin Filtreleme',
    name: '03 // Log Dedektifi & Şifreli Parola İpucu',
    storySnippet: `Gizli notta Y şu çarpıcı cümleyi düşmüş: "Parolaları asla kafamda tutmam; sistem loglarının derinliklerine şifreli bir kayıt bıraktım. /var/log/system_audit.log dosyasını açıp tek tek okumaya kalkışma, yüzlerce satır var! Terminalin arama keskinliğini kullan: 'PASSPHRASE' kelimesini süz."`,
    objective: 'grep komutunu kullanarak /var/log/system_audit.log dosyasında "PASSPHRASE" kalıbını filtrele ve Y\'nin kilit parolasını açığa çıkar.',
    startDir: '/home/x',
    relatedFiles: ['/var/log/system_audit.log'],
    learnedConcept: 'Metin Filtreleme (grep) ve Sistem Günlükleri (/var/log)',
    conceptSummary: `Linux'ta /var/log dizini işletim sisteminin ve servislerin tuttuğu tüm kayıtları barındırır. "grep" (Global Regular Expression Print), belirtilen dosyalarda belirli kelime veya kalıpları eşleştirerek yalnızca o satırları ekrana basar. Sistem yöneticileri ve siber güvenlik analistleri saldırı izlerini ve hataları bulmak için sürekli grep kullanır.`,
    checkCondition: (ctx) => {
      return (
        (ctx.lastCommand.includes('grep') && ctx.lastOutput.includes('y_was_here_1998')) ||
        ctx.lastOutput.includes("PASSPHRASE='y_was_here_1998'")
      );
    },
    nextMissionId: 4
  },
  {
    id: 4,
    section: 2,
    sectionTitle: 'Bölüm 2 — Dosya Türü ve Hiyerarşik Arama',
    name: '04 // Sistemde Kayıp Scripti Arama',
    storySnippet: `Loglardan 'y_was_here_1998' parolasını buldun! Fakat Y, bu parolanın hangi dosyayı açacağını açıkça belirtmemiş. Notunda sadece şöyle diyor: "Bir yerlere .sh uzantılı bir otomasyon betiği gizledim. Koca diskte dizin dizin gezip vakit kaybetme; find komutuyla arattır."`,
    objective: 'find komutunu kullanarak .sh uzantılı dosyaları ara (find . -name "*.sh" veya find /home/x). Ardından bulduğun dosyanın tipini "file" komutuyla doğrula.',
    startDir: '/home/x',
    relatedFiles: ['/home/x/scripts/unlock.sh'],
    learnedConcept: 'Dosya Arama Motoru (find) ve Dosya Tip Tespiti (file)',
    conceptSummary: `"find" komutu, Linux dizin ağacında isim, boyut, değiştirilme tarihi gibi kriterlere göre özyinelemeli (recursive) arama yapar. "file" komutu ise dosya uzantısına aldanmadan, dosyanın başlığındaki sihirli baytları (magic bytes) okuyarak dosyanın gerçek biçimini (ASCII, ELF binary, script vb.) söyler.`,
    checkCondition: (ctx) => {
      return (
        (ctx.lastCommand.includes('find') && ctx.lastOutput.includes('unlock.sh')) ||
        (ctx.lastCommand.includes('file') && ctx.lastOutput.includes('shell script'))
      );
    },
    nextMissionId: 5
  },
  {
    id: 5,
    section: 3,
    sectionTitle: 'Bölüm 3 & 4 — İzinler (rwx) & Script Koşma',
    name: '05 // Kilitli Kapı & Çalıştırma İznini (chmod +x) Verme',
    storySnippet: `Scriptin tam yerini buldun: scripts/unlock.sh. Büyük bir heyecanla ./scripts/unlock.sh yazıp Enter'a basıyorsun ama terminal yüzüne sertçe çarpıyor: "bash: ./scripts/unlock.sh: Permission denied"! Dosyanın izinlerini incelediğinde Y'nin çalıştırma (x) yetkisini kasten kapattığını anlıyorsun.`,
    objective: 'ls -l scripts/unlock.sh ile dosyanın izinlerini gör. chmod +x scripts/unlock.sh ile dosyaya yürütme yetkisi ver ve doğru parolayla scripti çalıştır (./scripts/unlock.sh y_was_here_1998).',
    startDir: '/home/x',
    relatedFiles: ['/home/x/scripts/unlock.sh'],
    learnedConcept: 'Linux İzin Matrisi (rwx), chmod Değiştiricisi ve Argüman ($1) Kullanımı',
    conceptSummary: `Linux'ta her dosya Sahip (u), Grup (g) ve Diğerleri (o) için Okuma (r=4), Yazma (w=2) ve Çalıştırma (x=1) izinlerine sahiptir. Bir metin dosyasının doğrudan ikili gibi çalışabilmesi için 'x' yetkisi zorunludur. "chmod +x" bu bayrağı ekler. Script çalışırken komutun yanına yazılan kelime, script kodunda "$1" argümanı olarak yakalanır.`,
    checkCondition: (ctx) => {
      return (
        ctx.lastOutput.includes('[+] KİLİT AÇILDI: Anahtar doğrulandı!') ||
        ctx.lastOutput.includes('Y_AUTH_TOKEN_77a9b0c2')
      );
    },
    nextMissionId: 6
  },
  {
    id: 6,
    section: 5,
    sectionTitle: 'Bölüm 5 — Paket Yöneticileri & Mimari Sınırlar',
    name: '06 // Paket Altyapısı & WASM Ortam Analizi',
    storySnippet: `Unlock scriptinin çıktısında Y'nin bir sonraki meydan okuması beliriyor: "Tebrikler, scriptin kilidini açtın. Fakat bir güvenlikçi sistemin altyapısını bilmek zorundadır. Bu makineye yeni bir araç kurmak istesen ne yapardın? Neden minimal kapsayıcılarda Snap çalışmaz?" X, makinenin paket altyapısını test eder.`,
    objective: 'apt veya snap komutunu çalıştırarak sistemin paket yönetim altyapısını ve WebAssembly kumhavuzunun mimari sınırlarını gözlemle.',
    startDir: '/home/x',
    relatedFiles: ['/etc/passwd'],
    learnedConcept: 'Paket Yöneticileri (APT vs Snap) ve Minimal Konteyner Kısıtları',
    conceptSummary: `Debian tabanlı Linux sistemlerinde APT doğrudan paket arşivlerini (.deb) çözer. Snap ise uygulamaları izole squashfs imajları olarak loop-device üzerinde çalıştırmayı dener; bu nedenle kernel loop mount ve systemd servisi gerektirir. WebAssembly veya minimal Docker konteynerlerinde Snap çalışamaz, statik ikililer ve APT tercih edilir.`,
    checkCondition: (ctx) => {
      const cmd = ctx.lastCommand.trim();
      return (
        cmd === 'apt' ||
        cmd.startsWith('apt ') ||
        cmd === 'snap' ||
        cmd.startsWith('snap ') ||
        ctx.lastOutput.includes('Paket Yöneticisi') ||
        ctx.lastOutput.includes('snapd')
      );
    },
    nextMissionId: 7
  },
  {
    id: 7,
    section: 6,
    sectionTitle: 'Bölüm 6 — Root Kasası & Yetki Yükseltme',
    name: '07 // Root Kasasına Hücum & Y\'nin Son Mesajı',
    storySnippet: `Ve işte büyük final... Y'nin bu bilgisayarda sakladığı en gizli dosya: /root/final_message.txt! Normal kullanıcı 'x' olarak okumayı denediğinde terminal 'Permission denied' hatası fırlatıyor; çünkü dosya sadece root için (0600 izni) kilitli. Y'nin /etc/sudoers içinde sana tanıdığı süper kullanıcı (sudo) gücünü kullanarak kasayı aç ve son mesajı deşifre et!`,
    objective: 'Önce normal kullanıcı olarak dosyayı okumayı dene (cat /root/final_message.txt), ardından sudo cat /root/final_message.txt komutuyla root kasasını aç ve CTF bayrağını yakala!',
    startDir: '/home/x',
    relatedFiles: ['/root/final_message.txt', '/etc/sudoers'],
    learnedConcept: 'Süper Kullanıcı (Root, UID 0), Dosya Koruması (0600) ve Yetki Yükseltme (Privilege Escalation)',
    conceptSummary: `Linux sistemlerinde "root" kullanıcısı mutlak yöneticidir (UID 0). /root dizini ve 0600 iznine sahip dosyalar sıradan kullanıcılara tamamen kapalıdır. "sudo" (SuperUser DO) komutu, yetkili bir kullanıcının geçici olarak root kimliğine bürünerek işlem yapmasını sağlar. Siber güvenlikte yetkisiz bir durumdan root yetkilerine ulaşma sürecine 'Yetki Yükseltme' (Privilege Escalation) adı verilir.`,
    checkCondition: (ctx) => {
      return (
        ctx.readFiles.has('/root/final_message.txt') ||
        ctx.lastOutput.includes("[Y'NİN SON MESAJI - GİZLİ GÖREV TAMAMLANDI]") ||
        ctx.lastOutput.includes('CTF{y_terminal_master_2026_conquered}')
      );
    },
    nextMissionId: null
  }
];

export interface LinuxCheatSheetItem {
  cmd: string;
  usage: string;
  desc: string;
  example: string;
}

export const LINUX_CHEATSHEET: LinuxCheatSheetItem[] = [
  {
    cmd: 'pwd',
    usage: 'pwd',
    desc: 'Bulunduğun dizinin mutlak (tam) yolunu ekrana yazdırır (Print Working Directory).',
    example: 'pwd'
  },
  {
    cmd: 'whoami',
    usage: 'whoami',
    desc: 'Şu an hangi kullanıcı kimliğiyle oturum açtığını gösterir.',
    example: 'whoami'
  },
  {
    cmd: 'uname',
    usage: 'uname -a',
    desc: 'Çalışan Linux çekirdeği ve işletim sistemi sürümü hakkında teknik bilgi verir.',
    example: 'uname -a'
  },
  {
    cmd: 'ls',
    usage: 'ls [-la] [hedef]',
    desc: 'Dizin içeriğini listeler. -a gizli dosyaları gösterir, -l izinleri ve boyutları ayrıntılar.',
    example: 'ls -la /home/x'
  },
  {
    cmd: 'cat',
    usage: 'cat <dosya>',
    desc: 'Dosya içeriğini terminal ekranında baştan sona görüntüler.',
    example: 'cat Desktop/readme.txt'
  },
  {
    cmd: 'grep',
    usage: 'grep <aranan_metin> <dosya>',
    desc: 'Dosya içinde belirli bir kelimeyi veya kalıbı satır satır arar.',
    example: 'grep "PASSPHRASE" /var/log/system_audit.log'
  },
  {
    cmd: 'find',
    usage: 'find <dizin> -name "<kalıp>"',
    desc: 'Belirtilen dizin altında dosya ismine göre özyinelemeli (recursive) arama yapar.',
    example: 'find /home/x -name "*.sh"'
  },
  {
    cmd: 'file',
    usage: 'file <dosya>',
    desc: 'Dosyanın uzantısına aldanmadan gerçek ikili/metin biçimini tespit eder.',
    example: 'file scripts/unlock.sh'
  },
  {
    cmd: 'chmod',
    usage: 'chmod [+x | 755 | 600] <dosya>',
    desc: 'Dosya veya dizinlerin okuma (r), yazma (w) ve çalıştırma (x) izinlerini düzenler.',
    example: 'chmod +x scripts/unlock.sh'
  },
  {
    cmd: 'sudo',
    usage: 'sudo <komut> [argümanlar]',
    desc: 'Komutu en yüksek yetkili kullanıcı olan root (Süper Kullanıcı) haklarıyla çalıştırır.',
    example: 'sudo cat /root/final_message.txt'
  }
];
