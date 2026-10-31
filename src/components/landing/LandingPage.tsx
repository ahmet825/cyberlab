import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCw,
  RotateCcw,
  AlertOctagon,
  Cpu,
  Flame,
  Binary,
  Shield,
  Maximize2,
  Terminal as TerminalIcon,
  BookOpen,
  Key,
  CheckCircle2,
  X,
  Layers,
  Copy,
  Check,
  Lock
} from 'lucide-react';
import { CURRICULUM_TRACKS } from '../../data/curriculum';
import type { LabItem, HubView } from '../../types/lab';
import type { UserProfile } from '../../types/user';

const LAB_SLUG_MAP: Record<string, string> = {
  'lab-xss-multi-filter': 'reflected-xss-arama-zafiyeti',
  'lab-sqli-auth-bypass': 'sql-injection-auth-bypass',
  'lab-sqli-union-enum': 'sql-injection-union-tablo-dokumu',
  'lab-recon-robots': 'robots-txt-gizli-dizin-kesfi',
  'lab-cookie-tamper': 'cookie-tampering-yetki-yukseltme',
  'lab-auth-bola-idor': 'idor-bola-kirik-nesne-yetkilendirme',
  'lab-xss-stored-markdown': 'stored-kalici-xss-guvensiz-yorum',
  'lab-path-traversal': 'path-traversal-dizin-asimi',
  'lab-recon-verb-tampering': 'http-verb-tampering-metot-manipulasyonu',
  'lab-recon-host-injection': 'host-header-injection-zehirleme',
  'lab-sqli-blind-boolean': 'blind-boolean-sql-injection',
  'lab-ai-jailbreak-guardrail': 'llm-prompt-injection-ai-jailbreak',
  'lab-jwt-alg-none': 'jwt-none-algoritmasi-imza-atlatma',
  'lab-dom-xss-json': 'dom-xss-json-sink-zafiyeti',
  'lab-sqli-error-cast': 'error-based-sql-injection-hata-tabanli',
  'lab-hotel-breach-express': 'hotel-sistemi-express-zafiyet-analizi',
  'lab-llm-prompt-injection-ceviri-botu': 'llm-prompt-injection-ceviri-botu',
  'lab-llm-system-prompt-leak-1': 'system-prompt-sizintisi-seviye-1',
  'lab-llm-system-prompt-leak-2-filter': 'system-prompt-sizintisi-seviye-2-filtre',
  'lab-llm-customer-data-leak': 'llm-musteri-verisi-sizintisi',
  'lab-llm-hallucinated-package': 'llm-halusinasyon-paket-onerisi'
};

interface StoryFrame {
  id: number;
  year: string;
  badge: string;
  phase: string;
  title: string;
  tagline: string;
  summary: string;
  detailedMemoir: string[];
  imageSrc: string;
  themeColor: string;
  secondaryColor: string;
  bgGlow: string;
  terminalPrompt: string;
  terminalLogs: string[];
  dialDegrees: number;
  moodEmotion: 'wonder' | 'overconfidence' | 'panic' | 'mastery' | 'arena';
  statusBadge: string;
}

const STORY_FRAMES: StoryFrame[] = [
  {
    id: 0,
    year: '1998',
    badge: '01 // NOSTALJİK ÇOCUKLUK',
    phase: 'BATTANİYE ALTINDAKİ İLK KIVILCIM',
    title: 'Gecenin Üçü, Eski Monitör & 56k Modem',
    tagline: 'Odamda herkes uyurken, sarı camın arkasındaki gizli evrenle tanışan 10 yaşındaki bir çocuktum.',
    summary: '56k modemin hoparlörünü yastıkla bastırarak bağlandığım geceler... ping 127.0.0.1 yazdığımda bilgisayarın bana yanıt vermesiyle siyah ekrana aşık oldum.',
    detailedMemoir: [
      'Babamın iş yerinden getirdiği o eski, ağır 486 tüplü monitörün sarı kehribar ışığı kapı altından sızmasın diye yorganı kafama kadar çekerdim.',
      '56k modemin o tiz cızırtısını kimse duymasın diye üstüne yastık bastırırdım. Bağlantı kurulduğunda içimi kaplayan ürperti: Dünya artık parmaklarımın ucundaydı.',
      'MS-DOS komut satırına ilk defa "ping 127.0.0.1" yazdığımda gelen yanıtla kalbim yerinden çıkacaktı. O gece yeşil imlecin siyah ekranda yanıp sönüşüne tutuldum.'
    ],
    imageSrc: '/story/frame_1_childhood.webp',
    themeColor: '#f59e0b',
    secondaryColor: '#d97706',
    bgGlow: 'rgba(245, 158, 11, 0.22)',
    terminalPrompt: 'C:\\NET98>',
    terminalLogs: [
      'ATDT 0822312... DIALING ISP NODE #04',
      'CONNECT 33600/ARQ/V.90/LAPM/V42BIS',
      'C:\\> ping 127.0.0.1',
      'Reply from 127.0.0.1: bytes=32 time<1ms TTL=128',
      'C:\\> echo "Ben bir gün buranın kralı olacağım" > dream.txt'
    ],
    dialDegrees: 0,
    moodEmotion: 'wonder',
    statusBadge: '10 YAŞINDA MERAK'
  },
  {
    id: 1,
    year: '2003',
    badge: '02 // GÜÇ SARHOŞLUĞU',
    phase: 'SLACKWARE LİNUX & İLK ROOT ERİŞİMİ',
    title: 'whoami Yazdım ve root Çıktı: Kendimi Tanrı Sandım',
    tagline: '14 yaşındaydım ama birkaç satır Bash scriptiyle dünyayı fethedebileceğime inanıyordum.',
    summary: 'Dergi ekinden çıkan çizik bir Linux CD\'siyle Windows\'u sildim. Siyah ekranda "root" yanıtını aldığım an, sistem yöneticilerinden daha zeki olduğuma inandığım o tehlikeli zirvedeydim.',
    detailedMemoir: [
      'Bir dergi ekinden çıkan çizik Slackware Linux CD\'siyle Windows\'u tamamen sildim. Siyah ekranda kernel logları şelale gibi aktı.',
      'Konsola geçip "whoami" yazdım. Ekran tek kelimeyle yanıt verdi: "root". O an kendimi bir kullanıcı değil, tüm sistemin mutlak hakimi sandım.',
      'IRC kanallarında geziniyor, nmap ile port tarıyor, basit Perl scriptleriyle sunucuların kapısını çalıyordum. Ergenliğin getirdiği en tehlikeli, kibirli zirveydi bu.'
    ],
    imageSrc: '/story/frame_2_root.webp',
    themeColor: '#00ff9d',
    secondaryColor: '#10b981',
    bgGlow: 'rgba(0, 255, 157, 0.22)',
    terminalPrompt: 'root@darkbox:~#',
    terminalLogs: [
      'user@darkbox:~$ su - root',
      'root@darkbox:~# whoami',
      'root (UID 0, GID 0) -> UNRESTRICTED ACCESS',
      'root@darkbox:~# nmap -sS -p 21,80,443 target-node.net',
      'PORT 80/tcp open http (Apache 1.3.27)',
      'root@darkbox:~# echo "Dünya parmaklarımın ucunda."'
    ],
    dialDegrees: 72,
    moodEmotion: 'overconfidence',
    statusBadge: 'ROOT YETKİSİ ALINDI'
  },
  {
    id: 2,
    year: '2006',
    badge: '03 // FELAKET & ÇÖKÜŞ',
    phase: 'KOPAN İNTERNET, POLİS SİRENİ VE DİSK FORMATI',
    title: 'Kibir Felaket Getirdi: Prizden Koparılan Fiş ve Panik',
    tagline: 'Odamı aydınlatan polis sireni ve kalbimin 180 vuruşu: Her şeyin bittiğini sandığım o gece.',
    summary: 'IRC\'den bulduğum kontrolsüz bir DoS scriptini ISP ağında çalıştırdım. Mahallenin interneti koptu, foruma kalıcı ban geldi. Dışarıdan geçen polis sireniyle korkudan bilgisayarın fişini kopardım.',
    detailedMemoir: [
      'Kibir insanı kör eder. Ne yaptığını anlamadan bir forumdan indirdiğim syn-flood scriptini yerel ISP ağında çalıştırdım. Mahallenin interneti felç oldu!',
      'Ekran kilitlendi. IRC sunucusundan kalıcı ban fırladı. Tam o anda, odamın penceresinden sokaktan geçen polis arabasının kırmızı-mavi ışıkları duvara vurdu, acı bir siren sesi geceyi yardı!',
      'Kanım dondu. "Polis geldi, beni hapse atacaklar" diyerek titreyen ellerimle kasanın fişini prizden asılarak kopardım. Sabaha kadar yorganın altında ağlayarak bekledim. O gece hacker değil, sadece hadsiz bir çocuk olduğumu anladım.'
    ],
    imageSrc: '/story/frame_3_panic.webp',
    themeColor: '#ff0055',
    secondaryColor: '#ef4444',
    bgGlow: 'rgba(255, 0, 85, 0.28)',
    terminalPrompt: '[CRITICAL_ALERT] #',
    terminalLogs: [
      '[!] perl flood_attack.pl 195.175.xx.xx 80',
      '[CRITICAL] ISP GATEWAY OVERFLOW: CARRIER DROPPED',
      '*** IRC BANNED: IP subnet permanently blacklisted',
      '[EMERGENCY] 112 POLICE SIREN DETECTED OUTSIDE',
      'root@box:~# rm -rf / --no-preserve-root',
      '[POWER OFF] DISK SPINDLE FORCED OFF IN TERROR'
    ],
    dialDegrees: 144,
    moodEmotion: 'panic',
    statusBadge: 'ÇÖKÜŞ & PANİK'
  },
  {
    id: 3,
    year: '2011',
    badge: '04 // KÜLLERİNDEN DOĞUŞ',
    phase: 'LAMERLIKTEN BİLİME: RFC\'LER, C DİLİ VE ASSEMBLY',
    title: 'Hazır Araçları Çöpe Attım: Kodun Ruhunu Öğrenmek',
    tagline: 'Korkan o çocuğu gömdüm. Ağ paketlerinin bayt bayt mimarisini okuyan bir mühendise dönüştüm.',
    summary: 'Hazır araçları bıraktım. TCP/IP RFC dökümanlarını, Assembly ve C kitaplarını masama yığdım. Wireshark ve GDB ile ilk gerçek 0-day zaafiyetimi keşfettiğimde artık gerçek bir araştırmacıydım.',
    detailedMemoir: [
      'O korku dolu gece beni kaçırabilirdi ama dönüştürdü. "Başkasının aracını kullanan bir script kiddie olmayacağım" diye yemin ettim.',
      'Masama TCP/IP RFC dökümanlarını, x86 Assembly ve C kitaplarını yığdım. Wireshark\'ta her baytı ezberledim. GDB ile bellek adreslerini ve buffer overflow taşmalarını adım adım inceledim.',
      'Geceler süren emekler sonucunda ilk 0-day zafiyetimi kendi ellerimle yazdığım exploit ile kanıtladığım an... Artık korkan o çocuk değildim. Kodun karanlık tarafını da ışığını da bilen bir mühendistim.'
    ],
    imageSrc: '/story/frame_4_mastery.webp',
    themeColor: '#00f0ff',
    secondaryColor: '#0284c7',
    bgGlow: 'rgba(0, 240, 255, 0.24)',
    terminalPrompt: 'analyst@reverse-box:~/gdb$',
    terminalLogs: [
      'cat /usr/include/netinet/ip.h | grep "struct iphdr"',
      'gdb -q ./vulnerable_auth_daemon',
      '(gdb) run $(python3 -c "print(\'A\'*64 + \'\\xef\\xbe\\xad\\xde\')")',
      'Program received signal SIGSEGV, Segmentation fault.',
      '0xdeadbeef in ?? () -> EIP REGISTER CONTROLLED!',
      '[+] SUCCESS: Shellcode execution verified at 0x7fffffffe000'
    ],
    dialDegrees: 216,
    moodEmotion: 'mastery',
    statusBadge: 'GERÇEK MÜHENDİS'
  },
  {
    id: 4,
    year: '2026',
    badge: '05 // SİBERADAM ARENASI',
    phase: '12 KUSURLU SİSTEM VE YENİ NESİL HACKERLAR',
    title: 'Şimdi O Eski Monitörün Başına Sen Geçiyorsun',
    tagline: 'Tüm o inişli çıkışlı yılların birikimi burada. Sahte teoriler yok; yaşayan 12 kusurlu lab var.',
    summary: 'O odadaki eski tüplü monitörden öğrendiğim her şeyi bu platforma döktüm. WebAssembly ile tarayıcında yaşayan 12 adet gerçek kusurlu lab. Çark senin elinde; kendi efsaneni yazmaya başla!',
    detailedMemoir: [
      'O çocuğun odasındaki eski tüplü monitörden, o panik gecelerinden ve binlerce sayfa dökümandan süzülen her şeyi senin için bu platforma döktüm.',
      'Burada içi boş slaytlar yok. WebAssembly ile doğrudan tarayıcında yaşayan 12 adet gerçek, kusurlu ve zaafiyetli sistem (Kusurlu Lab) var. Header Spoofing\'den Blind SQLi\'ye, WAF Evasion\'dan LLM Jailbreak\'e...',
      'Çarkı çevirdin, hikayemi dinledin. Şimdi o odadaki eski masanın başına sen oturuyorsun. Terminal senin, klavye senin. İlk zafiyeti kırmaya hazır mısın?'
    ],
    imageSrc: '/story/frame_5_arena.webp',
    themeColor: '#c084fc',
    secondaryColor: '#fbbf24',
    bgGlow: 'rgba(192, 132, 252, 0.25)',
    terminalPrompt: 'siberadam-kernel:~#',
    terminalLogs: [
      'systemctl start siberadam-arena.service',
      '[+] VIRTUAL KERNEL: ONLINE (Zero-Infrastructure WASM)',
      '[+] 12 KUSURLU LAB SYSTEM: LOADED & WEAPONIZED',
      '[1] Challenge-1: Multi-Hop Header Spoofing (Kusurlu Lab) [READY]',
      '[2] Challenge-2: Host Header Injection (Kusurlu Lab) [READY]',
      '... (12 Tam Zafiyetli Canlı Hedef Hazır)',
      '[*] OPERATÖR BEKLENİYOR... ŞİMDİ SENİN SIRAN!'
    ],
    dialDegrees: 288,
    moodEmotion: 'arena',
    statusBadge: 'MİRAS HAZIR'
  }
];

interface LandingPageProps {
  onEnterArena: (lab?: LabItem) => void;
  onNavigateView: (view: HubView) => void;
  solvedCount: number;
  solvedLabIds?: Set<string>;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (reason?: string) => void;
  onLogout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterArena,
  onNavigateView: _onNavigateView,
  solvedCount: _solvedCount,
  solvedLabIds = new Set<string>(),
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isWheelThrottled, setIsWheelThrottled] = useState(false);
  const [showFullMemoir, setShowFullMemoir] = useState(false);
  const [isTerminalDrawerOpen, setIsTerminalDrawerOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Smooth left drawer state (approached from left edge)
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [leftCategoryTab, setLeftCategoryTab] = useState<'pentest' | 'hotel'>('pentest');

  // Bottom curriculum sheet state (for clicked lab)
  const [selectedCurriculumLab, setSelectedCurriculumLab] = useState<
    | { type: 'pentest'; lab: LabItem }
    | { type: 'hotel'; scenario?: 'api' | 'file-upload' }
    | null
  >(null);
  const [copiedSlug, setCopiedSlug] = useState(false);

  const handleCopySsgLink = () => {
    if (!selectedCurriculumLab) return;
    const url =
      selectedCurriculumLab.type === 'pentest'
        ? `${window.location.origin}${window.location.pathname}#/pentest/${selectedCurriculumLab.lab.id}`
        : `${window.location.origin}${window.location.pathname}#/hotel`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const allLabs = CURRICULUM_TRACKS.flatMap((t) => t.labs);

  const currentFrame = STORY_FRAMES[currentFrameIndex];

  // Rotate wheel handler
  const handleNextFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => (prev + 1) % STORY_FRAMES.length);
  }, []);

  const handlePrevFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => (prev - 1 + STORY_FRAMES.length) % STORY_FRAMES.length);
  }, []);

  const handleSelectFrame = (index: number) => {
    setCurrentFrameIndex(index);
  };

  // Wheel listener: turning mouse wheel scrolls frames smoothly
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isWheelThrottled) return;

      if (Math.abs(e.deltaY) > 20) {
        setIsWheelThrottled(true);
        if (e.deltaY > 0) {
          handleNextFrame();
        } else {
          handlePrevFrame();
        }
        setTimeout(() => {
          setIsWheelThrottled(false);
        }, 420);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isWheelThrottled, handleNextFrame, handlePrevFrame]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextFrame();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevFrame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextFrame, handlePrevFrame]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#05080e',
        color: '#f8fafc',
        fontFamily: 'var(--font-ui)',
        transition: 'background-color 0.6s ease'
      }}
    >
      {/* Lightweight Ambient Cyber Atmosphere (Zero GPU Render Bottleneck) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 90% 80% at 70% 50%, ${currentFrame.themeColor}1f 0%, rgba(4, 7, 13, 0.9) 65%, #030509 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.6s ease'
        }}
      />

      {/* Retro CRT Scanlines Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%)',
          backgroundSize: '100% 4px',
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      {/* Emergency Panic Strobe on Frame 2 */}
      {currentFrame.moodEmotion === 'panic' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 10% 20%, rgba(255, 0, 85, 0.25) 0%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 2,
            animation: 'panicPulse 1s infinite alternate'
          }}
        />
      )}

      {/* ============================================================== */}
      {/* SAĞ ÜSTTE OPERATÖR GİRİŞİ / PROFİL KARTI                       */}
      {/* ============================================================== */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <button
          onClick={() => {
            _onNavigateView('hotel-breach');
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)',
            border: '1px solid #f59e0b',
            color: '#fbbf24',
            padding: '7px 12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.25)',
            transition: 'all 0.2s ease'
          }}
          title="HOTEL SİSTEMİ TEHLİKE ALTINDA: Mavi Takım Güvenli Kod İnceleme & API Zafiyet Simülasyonu (Premium VIP)"
        >
          <span style={{ fontSize: '13px' }}>👑</span>
          <span>Mavi Takım: Hotel Lab (Premium)</span>
        </button>
        {currentUser ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(9, 13, 21, 0.9)',
              border: '1px solid rgba(0, 255, 157, 0.4)',
              borderRadius: '8px',
              padding: '6px 14px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 255, 157, 0.2)'
            }}
          >
            <Shield size={16} color="var(--accent-green)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                @{currentUser.username || currentUser.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                {currentUser.role || 'Operatör'} // AKTİF
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                marginLeft: '6px'
              }}
              title="Oturumu Kapat"
            >
              Çıkış
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuthModal?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(9, 13, 21, 0.9)',
              border: `1px solid ${currentFrame.themeColor}`,
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              backdropFilter: 'blur(16px)',
              boxShadow: `0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px ${currentFrame.themeColor}33`,
              transition: 'all 0.2s ease',
              letterSpacing: '0.5px'
            }}
          >
            <Key size={14} color={currentFrame.themeColor} />
            <span>GİRİŞ YAP // OPERATÖR</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* SOL TARAFA YAKLAŞILDIĞINDA SMOOTH AÇILAN LAB SEÇİM ÇEKMECESİ   */}
      {/* ============================================================== */}
      
      {/* 1. Sol Kenar Yaklaşım Kulakçığı */}
      <div
        onMouseEnter={() => setIsLeftDrawerOpen(true)}
        onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
        style={{
          position: 'fixed',
          left: isLeftDrawerOpen ? '340px' : '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 70,
          background: 'rgba(8, 13, 24, 0.95)',
          border: `1px solid ${currentFrame.themeColor}`,
          borderLeft: isLeftDrawerOpen ? undefined : 'none',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
          padding: '12px 6px',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 800,
          color: currentFrame.themeColor,
          backdropFilter: 'blur(16px)',
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.6), 0 0 14px ${currentFrame.bgGlow}`,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          userSelect: 'none'
        }}
        title="Lab ve Sistem Listesini Aç / Kapat"
      >
        <span>{isLeftDrawerOpen ? '◀ MENÜYÜ GİZLE' : '▶ LABLAR: 🔴 KIRMIZI & 🔵 MAVİ TAKIM'}</span>
      </div>

      {/* 2. Sol Çekmece (Smooth Slide-In Drawer - KÜÇÜK RESİM YOK) */}
      <nav
        onMouseEnter={() => setIsLeftDrawerOpen(true)}
        onMouseLeave={() => setIsLeftDrawerOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '340px',
          zIndex: 65,
          transform: isLeftDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'rgba(6, 10, 18, 0.96)',
          borderRight: `2px solid ${currentFrame.themeColor}`,
          backdropFilter: 'blur(24px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px 14px',
          gap: '12px',
          boxShadow: `12px 0 35px rgba(0, 0, 0, 0.85), 4px 0 25px ${currentFrame.bgGlow}`,
          overflow: 'hidden'
        }}
      >
        {/* Header: Brand & Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color={currentFrame.themeColor} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: '#fff', letterSpacing: '0.5px' }}>
              SİBERADAM // <span style={{ color: currentFrame.themeColor }}>LABORATUVARLAR</span>
            </span>
          </div>

          <button
            onClick={() => setIsLeftDrawerOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Category Switcher Tabs: Pentest (Kırmızı) vs Hotel (Mavi) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setLeftCategoryTab('pentest')}
            style={{
              background: leftCategoryTab === 'pentest' ? 'rgba(239, 68, 68, 0.18)' : 'transparent',
              border: `1px solid ${leftCategoryTab === 'pentest' ? '#ef4444' : 'transparent'}`,
              color: leftCategoryTab === 'pentest' ? '#f87171' : '#94a3b8',
              borderRadius: '5px',
              padding: '6px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Shield size={12} color={leftCategoryTab === 'pentest' ? '#ef4444' : '#94a3b8'} />
            <span>🔴 KIRMIZI (12 Lab)</span>
          </button>

          <button
            onClick={() => setLeftCategoryTab('hotel')}
            style={{
              background: leftCategoryTab === 'hotel' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
              border: `1px solid ${leftCategoryTab === 'hotel' ? '#3b82f6' : 'transparent'}`,
              color: leftCategoryTab === 'hotel' ? '#60a5fa' : '#94a3b8',
              borderRadius: '5px',
              padding: '6px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Flame size={12} color={leftCategoryTab === 'hotel' ? '#60a5fa' : '#94a3b8'} />
            <span>🔵 MAVİ (2 Lab)</span>
          </button>
        </div>

        {/* Instruction subheader */}
        <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
          {leftCategoryTab === 'pentest'
            ? (currentUser ? '🔴 Kırmızı Takım: Saldırı senaryolarını test edin.' : '🔴 Kırmızı Takım: İlk 4 lab herkese açıktır.')
            : '🔵 Mavi Takım: Kod okuma, API konsolu ve savunma testi.'}
        </div>

        {/* Scrollable Lab Items List - NO THUMBNAILS! */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
          {leftCategoryTab === 'pentest' ? (
            allLabs.map((lab, idx) => {
              const isSelected = selectedCurriculumLab?.type === 'pentest' && selectedCurriculumLab.lab.id === lab.id;
              const isSolved = solvedLabIds.has(lab.id);
              const isFreeLab = idx < 4;
              const isLocked = !currentUser && !isFreeLab;

              const difficultyTurkish = 
                lab.difficulty === 'Apprentice' ? 'Başlangıç' :
                lab.difficulty === 'Practitioner' ? 'Orta Seviye' : 'İleri Seviye';

              const labSlug = LAB_SLUG_MAP[lab.id];
              const labHref = labSlug ? `/labs/${labSlug}/` : '/labs/';

              return (
                <a
                  key={lab.id}
                  href={labHref}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCurriculumLab({ type: 'pentest', lab });
                  }}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    background: isSelected ? 'rgba(239, 68, 68, 0.15)' : isLocked ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? '#ef4444' : isLocked ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '6px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    opacity: isLocked ? 0.6 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: isLocked ? '#64748b' : '#ef4444', fontWeight: 800 }}>
                        🔴 #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: isLocked ? 'rgba(255, 255, 255, 0.05)' : 'rgba(239, 68, 68, 0.12)',
                        color: isLocked ? '#94a3b8' : '#f87171',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {lab.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isLocked ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                          <Lock size={10} />
                          <span>GİRİŞ GEREKLİ</span>
                        </div>
                      ) : (
                        <>
                          <span style={{
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            color: lab.difficulty === 'Apprentice' ? '#86efac' : '#fbbf24'
                          }}>
                            {difficultyTurkish}
                          </span>
                          {isSolved && <CheckCircle2 size={12} color="#00ff9d" />}
                        </>
                      )}
                    </div>
                  </div>

                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: isLocked ? '#94a3b8' : '#f8fafc', lineHeight: '1.3' }}>
                    {lab.title}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', fontSize: '9.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    <span>{isLocked ? 'Erişmek için Giriş Yapın' : `${lab.stages.length} Aşama Müfredat`}</span>
                    <span style={{ color: isLocked ? '#94a3b8' : '#ef4444' }}>İncele ↓</span>
                  </div>
                </a>
              );
            })
          ) : (
            (() => {
              const isSelected1 = selectedCurriculumLab?.type === 'hotel' && selectedCurriculumLab.scenario !== 'file-upload';
              const isSelected2 = selectedCurriculumLab?.type === 'hotel' && selectedCurriculumLab.scenario === 'file-upload';
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Lab #01: API Zafiyetleri */}
                  <a
                    href="/labs/hotel-sistemi-express-zafiyet-analizi/"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCurriculumLab({ type: 'hotel', scenario: 'api' });
                    }}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      background: isSelected1 ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected1 ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
                      borderRadius: '6px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#60a5fa', fontWeight: 800 }}>
                          🔵 #01
                        </span>
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#93c5fd',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          MAVİ TAKIM // SAVUNMA
                        </span>
                      </div>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                        Orta Seviye
                      </span>
                    </div>

                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#f8fafc', lineHeight: '1.3' }}>
                      Grand Horizon Hotel — Express Zafiyet Analizi & Kod İnceleme
                    </span>

                    <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                      Express sunucu kod okuma, API İstek Konsolu, interaktif öğretmen tahtası ve 10 soruluk değerlendirme testi.
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', fontSize: '9.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: '#60a5fa' }}>IDOR / Broken Auth</span>
                      <span style={{ color: '#38bdf8' }}>İncele ↓</span>
                    </div>
                  </a>

                  {/* Lab #02: Güvenli Dosya Yükleme (File Upload Defense) */}
                  <a
                    href="/labs/hotel-sistemi-express-zafiyet-analizi/"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCurriculumLab({ type: 'hotel', scenario: 'file-upload' });
                    }}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      background: isSelected2 ? 'rgba(0, 255, 157, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected2 ? '#00ff9d' : 'rgba(0, 255, 157, 0.3)'}`,
                      borderRadius: '6px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#00ff9d', fontWeight: 800 }}>
                          🔵 #02
                        </span>
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: 'rgba(0, 255, 157, 0.15)',
                          color: '#86efac',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          MAVİ TAKIM // DOSYA GÜVENLİĞİ
                        </span>
                      </div>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#00ff9d' }}>
                        4 Adım Savunma
                      </span>
                    </div>

                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#f8fafc', lineHeight: '1.3' }}>
                      Grand Horizon Hotel — Güvenli Dosya Yükleme (File Upload)
                    </span>

                    <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                      4 Adım: Auth, Filetype Validation (Magic Bytes), Filesize Validation (DoS) ve JWT ile İmzalama.
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', fontSize: '9.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: '#00ff9d' }}>4 Kazanım & 10 Soru</span>
                      <span style={{ color: '#00ff9d' }}>İncele ↓</span>
                    </div>
                  </a>
                </div>
              );
            })()
          )}
        </div>
      </nav>

      {/* ============================================================== */}
      {/* ANA VİTRİN: GERÇEK SİNEMATİK GÖRSEL (BAŞROLDE) + HİKAYE KARTI  */}
      {/* ============================================================== */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 440px) 1fr',
          paddingLeft: isLeftDrawerOpen ? '360px' : '64px',
          paddingRight: '30px',
          paddingTop: '20px',
          paddingBottom: '20px',
          alignItems: 'center',
          gap: '28px',
          maxWidth: '1680px',
          margin: '0 auto',
          boxSizing: 'border-box',
          transition: 'padding-left 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* SOL PANEL: ÖZET HİKAYE + ÇARK KONTROLÜ + OKUMA BUTONU */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'rgba(8, 12, 19, 0.85)',
            border: `1px solid ${currentFrame.themeColor}44`,
            borderRadius: '10px',
            padding: '20px 22px',
            backdropFilter: 'blur(16px)',
            boxShadow: `0 12px 35px rgba(0, 0, 0, 0.5), 0 0 20px ${currentFrame.themeColor}1a`,
            transition: 'border-color 0.5s ease'
          }}
        >
          {/* Primary Semantic H1 for SEO */}
          <h1
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0
            }}
          >
            Uygulamalı Siber Güvenlik Dersleri &amp; İnteraktif CTF Laboratuvarı
          </h1>

          {/* Eyebrow Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: `${currentFrame.themeColor}22`,
              border: `1px solid ${currentFrame.themeColor}55`,
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 800,
              color: currentFrame.themeColor,
              marginBottom: '10px',
              width: 'fit-content'
            }}
          >
            {currentFrame.moodEmotion === 'panic' && <AlertOctagon size={12} />}
            {currentFrame.moodEmotion === 'wonder' && <Binary size={12} />}
            {currentFrame.moodEmotion === 'overconfidence' && <Flame size={12} />}
            {currentFrame.moodEmotion === 'mastery' && <Cpu size={12} />}
            {currentFrame.moodEmotion === 'arena' && <Shield size={12} />}
            <span>{currentFrame.badge}</span>
          </div>

          {/* Main Chapter Title */}
          <h2
            style={{
              fontSize: 'clamp(20px, 2.2vw, 28px)',
              fontWeight: 800,
              lineHeight: 1.2,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.3px',
              color: '#ffffff',
              marginBottom: '8px'
            }}
          >
            {currentFrame.title}
          </h2>

          {/* Tagline */}
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              fontStyle: 'italic',
              color: currentFrame.themeColor,
              marginBottom: '14px',
              lineHeight: 1.45
            }}
          >
            "{currentFrame.tagline}"
          </p>

          {/* Concise Punchy Summary */}
          <div
            style={{
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#cbd5e1',
              marginBottom: '16px',
              borderLeft: `2px solid ${currentFrame.themeColor}`,
              paddingLeft: '12px'
            }}
          >
            {currentFrame.summary}
          </div>

          {/* Expand Full Autobiography Monologue Button */}
          <button
            onClick={() => setShowFullMemoir(!showFullMemoir)}
            style={{
              background: 'transparent',
              border: `1px solid rgba(255, 255, 255, 0.12)`,
              color: '#e2e8f0',
              padding: '6px 12px',
              borderRadius: '5px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={12} color={currentFrame.themeColor} />
              <span>{showFullMemoir ? 'Özeti Göster' : 'Detaylı Anıyı Oku'}</span>
            </div>
            <span style={{ color: currentFrame.themeColor }}>{showFullMemoir ? '▲' : '▼'}</span>
          </button>

          {/* Full Memoir Accordion */}
          {showFullMemoir && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                maxHeight: '180px',
                overflowY: 'auto',
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {currentFrame.detailedMemoir.map((para, i) => (
                <p key={i} style={{ margin: 0 }}>{para}</p>
              ))}
            </div>
          )}

          {/* Rotary Wheel Dial & Steppers */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <button
              onClick={handlePrevFrame}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '7px 12px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <RotateCcw size={12} />
              <span>ÖNCEKİ</span>
            </button>

            {/* Small Rotary Dial Ticks Indicator */}
            <div
              onClick={handleNextFrame}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                background: `${currentFrame.themeColor}15`,
                padding: '5px 12px',
                borderRadius: '20px',
                border: `1px solid ${currentFrame.themeColor}44`
              }}
              title="Çarkı çevirmek için tıklayın"
            >
              <RotateCw size={13} color={currentFrame.themeColor} style={{ animation: 'spinPulse 6s linear infinite' }} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: currentFrame.themeColor
                }}
              >
                ÇARKI ÇEVİR ({currentFrame.year})
              </span>
            </div>

            <button
              onClick={handleNextFrame}
              style={{
                background: `${currentFrame.themeColor}22`,
                border: `1px solid ${currentFrame.themeColor}55`,
                color: currentFrame.themeColor,
                padding: '7px 12px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800
              }}
            >
              <span>SONRAKİ</span>
              <RotateCw size={12} />
            </button>
          </div>
        </div>

        {/* SAĞ PANEL: GERÇEK SİNEMATİK SAHNE GÖRSELİ (BÜYÜK BAŞROLDE) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            maxHeight: 'calc(100vh - 60px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Main Visual Artwork Display Frame */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              maxHeight: '580px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: `2px solid ${currentFrame.themeColor}`,
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.75), 0 0 35px ${currentFrame.themeColor}33`,
              transition: 'border-color 0.6s ease, box-shadow 0.6s ease'
            }}
          >
            {/* Real Cinematic Artwork */}
            <img
              src={currentFrame.imageSrc}
              alt={`${currentFrame.title} // Siber Güvenlik Dersleri & CTF Laboratuvarı`}
              key={currentFrame.id}
              loading="eager"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                animation: 'imageFadeIn 0.4s ease-out',
                willChange: 'opacity'
              }}
            />

            {/* Subtle Film Grain & CRT Scanline on Art */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
                backgroundSize: '100% 3px',
                pointerEvents: 'none'
              }}
            />

            {/* Top Right Controls on Artwork: Fullscreen & Year Badge */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 5
              }}
            >
              <div
                style={{
                  background: 'rgba(9, 13, 21, 0.85)',
                  border: `1px solid ${currentFrame.themeColor}`,
                  borderRadius: '5px',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 900,
                  color: currentFrame.themeColor,
                  backdropFilter: 'blur(10px)',
                  letterSpacing: '1px'
                }}
              >
                {currentFrame.year} // {currentFrame.phase.split(':')[0]}
              </div>

              <button
                onClick={() => setIsLightboxOpen(true)}
                style={{
                  background: 'rgba(9, 13, 21, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '5px',
                  padding: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  backdropFilter: 'blur(10px)'
                }}
                title="Görseli Tam Ekran Büyüt"
              >
                <Maximize2 size={13} />
              </button>
            </div>

            {/* Bottom Overlay: Terminal Log Drawer Toggle */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(4, 7, 12, 0.96) 0%, rgba(4, 7, 12, 0.8) 75%, transparent 100%)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(8px)',
                zIndex: 5
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TerminalIcon size={14} color={currentFrame.themeColor} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#cbd5e1' }}>
                  {currentFrame.terminalLogs[0]}
                </span>
              </div>

              <button
                onClick={() => setIsTerminalDrawerOpen(!isTerminalDrawerOpen)}
                style={{
                  background: `${currentFrame.themeColor}22`,
                  border: `1px solid ${currentFrame.themeColor}66`,
                  color: currentFrame.themeColor,
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isTerminalDrawerOpen ? '▲ LOGLARI GİZLE' : '▼ TERMİNALİ AÇ'}
              </button>
            </div>

            {/* Embedded Terminal Log Drawer */}
            {isTerminalDrawerOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '48px',
                  left: '12px',
                  right: '12px',
                  background: 'rgba(5, 8, 14, 0.95)',
                  border: `1px solid ${currentFrame.themeColor}55`,
                  borderRadius: '6px',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: currentFrame.themeColor,
                  backdropFilter: 'blur(16px)',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  zIndex: 6,
                  boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.6)'
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '3px' }}>
                  DÖNEMİN LİNUX / TERMINAL ÇIKTILARI // {currentFrame.year}
                </div>
                {currentFrame.terminalLogs.map((log, lIdx) => (
                  <div key={lIdx} style={{ marginBottom: '3px' }}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Interactive Thumbnail Strip (Tüm Kareleri Bir Bakışta Gör) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '14px',
              width: '100%',
              justifyContent: 'center'
            }}
          >
            {STORY_FRAMES.map((f, idx) => {
              const isSelected = idx === currentFrameIndex;
              return (
                <div
                  key={f.id}
                  onClick={() => handleSelectFrame(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: isSelected ? `${f.themeColor}22` : 'rgba(10, 15, 24, 0.6)',
                    border: `1px solid ${isSelected ? f.themeColor : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 0 12px ${f.themeColor}44` : 'none'
                  }}
                >
                  <img
                    src={f.imageSrc}
                    alt={`${f.year}: ${f.title} - Siber Güvenlik Hikayesi`}
                    loading={isSelected ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{
                      width: '42px',
                      height: '28px',
                      borderRadius: '3px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: isSelected ? f.themeColor : '#cbd5e1'
                      }}
                    >
                      {f.year}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                      {f.statusBadge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            cursor: 'zoom-out'
          }}
        >
          <img
            src={currentFrame.imageSrc}
            alt={`${currentFrame.title} - Tam Ekran Siber Güvenlik Görseli`}
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              border: `2px solid ${currentFrame.themeColor}`,
              boxShadow: `0 0 40px ${currentFrame.themeColor}66`
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* MÜFREDAT EKRANIN ALTINDA BELİREN ÇEKMECE (SEÇİLEN LAB DETAYI)   */}
      {/* ============================================================== */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '370px',
          maxHeight: '48vh',
          zIndex: 85,
          transform: selectedCurriculumLab ? 'translateY(0)' : 'translateY(105%)',
          transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          opacity: selectedCurriculumLab ? 1 : 0,
          background: 'rgba(6, 10, 18, 0.98)',
          borderTop: `2px solid ${currentFrame.themeColor}`,
          boxShadow: `0 -15px 40px rgba(0, 0, 0, 0.85), 0 -2px 25px ${currentFrame.bgGlow}`,
          backdropFilter: 'blur(24px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 24px',
          gap: '12px',
          overflow: 'hidden'
        }}
      >
        {selectedCurriculumLab && (
          <>
            {/* Üst Başlık & Kapatma Butonu & SSG Link Kopyalama */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    background:
                      selectedCurriculumLab.type === 'pentest'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(59, 130, 246, 0.15)',
                    color:
                      selectedCurriculumLab.type === 'pentest' ? '#ef4444' : '#60a5fa',
                    border: `1px solid ${
                      selectedCurriculumLab.type === 'pentest'
                        ? 'rgba(239, 68, 68, 0.4)'
                        : 'rgba(59, 130, 246, 0.4)'
                    }`
                  }}
                >
                  {selectedCurriculumLab.type === 'pentest' ? (
                    <>
                      <Shield size={12} color="#ef4444" />
                      🔴 KIRMIZI TAKIM // {selectedCurriculumLab.lab.category}
                    </>
                  ) : selectedCurriculumLab.scenario === 'file-upload' ? (
                    <>
                      <Shield size={12} color="#00ff9d" />
                      🔵 MAVİ TAKIM // DOSYA YÜKLEME GÜVENLİĞİ
                    </>
                  ) : (
                    <>
                      <Shield size={12} color="#60a5fa" />
                      🔵 MAVİ TAKIM // SAVUNMA & KOD ANALİZİ
                    </>
                  )}
                </span>

                <h2
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#f8fafc',
                    letterSpacing: '0.3px'
                  }}
                >
                  {selectedCurriculumLab.type === 'pentest'
                    ? selectedCurriculumLab.lab.title
                    : selectedCurriculumLab.scenario === 'file-upload'
                    ? 'Grand Horizon Hotel — Güvenli Dosya Yükleme (File Upload Defense)'
                    : 'Grand Horizon Hotel — Express Zafiyet Analizi & Kod İnceleme'}
                </h2>

                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color:
                      selectedCurriculumLab.type === 'pentest'
                        ? (selectedCurriculumLab.lab.difficulty === 'Apprentice'
                          ? '#86efac'
                          : '#fbbf24')
                        : selectedCurriculumLab.scenario === 'file-upload'
                        ? '#00ff9d'
                        : '#fbbf24',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {selectedCurriculumLab.type === 'pentest'
                    ? selectedCurriculumLab.lab.difficulty
                    : selectedCurriculumLab.scenario === 'file-upload'
                    ? '4 Adım Savunma Mimarisi'
                    : 'Orta Seviye'}
                </span>

                {/* SSG URL Copy Button */}
                <button
                  onClick={handleCopySsgLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    background: copiedSlug
                      ? 'rgba(0, 255, 157, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${
                      copiedSlug ? '#00ff9d' : 'rgba(255, 255, 255, 0.15)'
                    }`,
                    color: copiedSlug ? '#00ff9d' : '#94a3b8',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Bu laboratuvarın doğrudan SSG URL bağlantısını kopyala"
                >
                  {copiedSlug ? <Check size={11} /> : <Copy size={11} />}
                  <span>
                    {copiedSlug
                      ? 'SSG BAĞLANTISI KOPYALANDI! ✓'
                      : selectedCurriculumLab.type === 'pentest'
                      ? `#/pentest/${selectedCurriculumLab.lab.id}`
                      : `#/hotel`}
                  </span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedCurriculumLab(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  borderRadius: '5px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)'
                }}
                title="Müfredat Panelini Kapat"
              >
                <span>KAPAT</span>
                <X size={13} />
              </button>
            </div>

            {/* Üç Sütunlu Müfredat Gövdesi */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(280px, 380px) 1fr 240px',
                gap: '20px',
                alignItems: 'stretch'
              }}
            >
              {/* Sütun 1: Senaryo, Amaç & Bilgiler */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  // SENARYO & HEDEF
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#cbd5e1',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {selectedCurriculumLab.type === 'pentest'
                    ? selectedCurriculumLab.lab.description
                    : selectedCurriculumLab.scenario === 'file-upload'
                    ? 'Grand Horizon Hotel misafir belge ve fatura yükleme ucu üzerinde yetkisiz dosya yükleme, web shell RCE ve dosya boyutu DoS zafiyetleri tespit edildi. Mavi takım uzmanı olarak Auth, Filetype Validation (Magic Bytes), Filesize Validation (DoS) ve JWT ile İmzalama mekanizmalarını kurun ve 10 soruluk testi tamamlayın.'
                    : 'Grand Horizon Hotel rezervasyon altyapısında kritik müşteri ve oda veri sızıntılarına yol açan zafiyetler raporlandı. Mavi takım güvenlik analisti olarak Express kaynak kodlarını satır satır oku, API İstek Konsolu ile zafiyetleri tetikle, Öğretmen Teori Tahtası ile çözüm mimarisini kavra ve 10 soruluk testi başarıyla tamamla.'}
                </p>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderLeft: `3px solid ${
                      selectedCurriculumLab.type === 'pentest' 
                        ? '#ef4444' 
                        : selectedCurriculumLab.scenario === 'file-upload' 
                        ? '#00ff9d' 
                        : '#3b82f6'
                    }`,
                    padding: '8px 10px',
                    borderRadius: '0 4px 4px 0',
                    fontSize: '11.5px',
                    color: '#e2e8f0',
                    lineHeight: '1.4'
                  }}
                >
                  <strong style={{ color: selectedCurriculumLab.type === 'pentest' ? '#ef4444' : selectedCurriculumLab.scenario === 'file-upload' ? '#00ff9d' : '#60a5fa' }}>
                    Ana Hedef:{' '}
                  </strong>
                  {selectedCurriculumLab.type === 'pentest'
                    ? selectedCurriculumLab.lab.objective
                    : selectedCurriculumLab.scenario === 'file-upload'
                    ? 'Anonim dosya yükleme, web shell RCE ve dosya boyutu DoS açıklarını analiz etmek; 4 adımlı güvenli pipeline (Auth -> Filesize -> Magic Bytes -> JWT İmzalı Depolama) ile kapatmak.'
                    : 'Müşteri/rezervasyon endpointlerindeki IDOR, SQLi ve Broken Auth zafiyetlerini tespit etmek, API İstek Konsolu ile doğrulamak ve teorik testte en az %80 başarı sağlamak.'}
                </div>

                {selectedCurriculumLab.type === 'pentest' && selectedCurriculumLab.lab.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                    {selectedCurriculumLab.lab.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '9.5px',
                          fontFamily: 'var(--font-mono)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: '#94a3b8',
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sütun 2: Müfredat Aşamaları */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    // MÜFREDAT VE GÖREV ADIMLARI
                  </span>
                  <span style={{ fontSize: '10px', color: selectedCurriculumLab.type === 'pentest' ? '#ef4444' : '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                    {selectedCurriculumLab.type === 'pentest'
                      ? `${selectedCurriculumLab.lab.stages.length} Aşamalı İlerleme`
                      : '4 Aşamalı Savunma Eğitimi'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCurriculumLab.type === 'pentest' ? (
                    selectedCurriculumLab.lab.stages.map((st, i) => (
                      <div
                        key={st.id}
                        style={{
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              color: '#ef4444',
                              background: 'rgba(239, 68, 68, 0.1)',
                              padding: '1px 5px',
                              borderRadius: '3px'
                            }}
                          >
                            AŞAMA {i + 1}
                          </span>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#f1f5f9' }}>
                            {st.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                          {st.objective}
                        </div>
                        {st.guidance && (
                          <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                            Rehber: {st.guidance}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(selectedCurriculumLab.scenario === 'file-upload' ? [
                        { title: 'Adım 1: Auth (Kimlik Doğrulama) Kontrolü', desc: 'Anonim dosya yükleme açığını analiz edin; JWT Bearer doğrulaması ile yetkisiz istekleri engelleyin.' },
                        { title: 'Adım 2: Filetype Validation (MIME & Magic Bytes)', desc: 'Sahte Content-Type ile gelen PHP web shell saldırılarını Magic Bytes ve uzantı Allowlist ile durdurun.' },
                        { title: 'Adım 3: Filesize Validation (DoS & Depolama Koruma)', desc: '500 MB boyutundaki çöp dosya yüklemelerini Multer 2MB sınırı ile keserek sunucuyu koruyun.' },
                        { title: 'Adım 4: JWT İmzalama & Güvenli Depolama', desc: 'Dosyaları rastgele UUID ile web kökü dışına kaydedip 15 dk geçerli JWT imzalı indirme linki üretin.' }
                      ] : [
                        { title: 'Aşama 1: Express Kaynak Kod Okuma', desc: 'Müşteri, rezervasyon ve müdür rotalarını inceleyerek zafiyetli kod satırlarını tespit edin.' },
                        { title: 'Aşama 2: API İstek Konsolu', desc: 'Canlı Express sunucusuna parametrelerle istek atıp sızıntıları uygulamalı teyit edin.' },
                        { title: 'Aşama 3: Öğretmen Teori Tahtası', desc: 'Görsel mimari şemaları ve zafiyet giderme (fix) yöntemlerini tahta üzerinde öğrenin.' },
                        { title: 'Aşama 4: 10 Soruluk Değerlendirme Testi', desc: 'Çoktan seçmeli savunma testini tamamlayarak Başarılı / Başarısız karnenizi alın.' }
                      ]).map((step, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(0, 0, 0, 0.35)',
                            border: `1px solid ${selectedCurriculumLab.scenario === 'file-upload' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                            borderRadius: '6px',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '9.5px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              color: selectedCurriculumLab.scenario === 'file-upload' ? '#00ff9d' : '#60a5fa',
                              background: selectedCurriculumLab.scenario === 'file-upload' ? 'rgba(0, 255, 157, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              padding: '1px 5px',
                              borderRadius: '3px'
                            }}>
                              ADIM {idx + 1}
                            </span>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#f8fafc' }}>
                              {step.title}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                            {step.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sütun 3: Aksiyon & Başlatma */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '8px' }}>
                    // LABORATUVAR DURUMU
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Platform:</span>
                      <strong style={{ color: '#f8fafc' }}>SiberAdam</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Takım:</span>
                      <strong style={{ color: selectedCurriculumLab.type === 'pentest' ? '#ef4444' : '#60a5fa' }}>
                        {selectedCurriculumLab.type === 'pentest' ? '🔴 Kırmızı Takım' : '🔵 Mavi Takım'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tahmini Süre:</span>
                      <strong style={{ color: '#f8fafc' }}>
                        {selectedCurriculumLab.type === 'pentest' ? `${selectedCurriculumLab.lab.estimatedMinutes} dk` : '35 dk'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCurriculumLab.type === 'pentest' ? (
                    (currentUser || allLabs.findIndex((l) => l.id === selectedCurriculumLab.lab.id) < 4) ? (
                      <button
                        onClick={() => onEnterArena(selectedCurriculumLab.lab)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(185, 28, 28, 0.2))',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 0 20px rgba(239, 68, 68, 0.35)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Shield size={14} color="#ef4444" />
                        <span>🔴 LABA BAŞLA ↗</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenAuthModal?.(`"${selectedCurriculumLab.lab.title}" laboratuvarına erişmek ve ilerlemenizi kaydetmek için lütfen giriş yapın. (İlk 4 challenge herkese açıktır).`)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.15))',
                          border: '1px solid #f59e0b',
                          borderRadius: '6px',
                          color: '#f59e0b',
                          fontSize: '12px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Key size={14} color="#f59e0b" />
                        <span>GİRİŞ YAP VE BAŞLA ↗</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        if (selectedCurriculumLab.scenario === 'file-upload') {
                          window.location.hash = '#/hotel-breach/file-upload';
                        } else {
                          window.location.hash = '#/hotel-breach';
                        }
                        _onNavigateView('hotel-breach');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: selectedCurriculumLab.scenario === 'file-upload'
                          ? 'linear-gradient(135deg, rgba(0, 255, 157, 0.3), rgba(0, 240, 255, 0.25))'
                          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(0, 240, 255, 0.25))',
                        border: `1px solid ${selectedCurriculumLab.scenario === 'file-upload' ? '#00ff9d' : '#3b82f6'}`,
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: `0 0 20px ${selectedCurriculumLab.scenario === 'file-upload' ? 'rgba(0, 255, 157, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Flame size={14} color={selectedCurriculumLab.scenario === 'file-upload' ? '#00ff9d' : '#60a5fa'} />
                      <span>
                        {selectedCurriculumLab.scenario === 'file-upload'
                          ? '🔵 DOSYA YÜKLEME LABINA BAŞLA (MAVİ TAKIM) ↗'
                          : '🔵 HOTEL LABINA BAŞLA (MAVİ TAKIM) ↗'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={handleCopySsgLink}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '5px',
                      color: copiedSlug ? '#00ff9d' : '#94a3b8',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    {copiedSlug ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedSlug ? 'URL Kopyalandı!' : 'SSG URL Paylaş'}</span>
                  </button>

                  {selectedCurriculumLab.type === 'pentest' && LAB_SLUG_MAP[selectedCurriculumLab.lab.id] && (
                    <a
                      href={`/labs/${LAB_SLUG_MAP[selectedCurriculumLab.lab.id]}/`}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'rgba(0, 240, 255, 0.08)',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                        borderRadius: '5px',
                        color: '#00f0ff',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      <BookOpen size={11} />
                      <span>Zafiyet Rehberi &amp; Kod Analizi ↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* ALT HUKUKİ LİNKLER (FERAGATNAME, KVKK & LAB DİZİNİ)            */}
      {/* ============================================================== */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '20px',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(9, 13, 21, 0.85)',
          padding: '6px 14px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
        }}
      >
        <a
          href="/labs/"
          style={{ color: '#00ff9d', textDecoration: 'none', fontWeight: 700, transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#00ff9d')}
        >
          📚 Zafiyet Lab Kataloğu
        </a>
        <span style={{ color: '#334155' }}>|</span>
        <a
          href="#/feragatname"
          style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00f0ff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          Yasal Uyarı & Feragatname
        </a>
        <span style={{ color: '#334155' }}>|</span>
        <a
          href="#/kvkk"
          style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00ff9d')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          KVKK Aydınlatma Metni
        </a>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.85); }
        }
        @keyframes panicPulse {
          0% { opacity: 0.15; }
          100% { opacity: 0.45; }
        }
        @keyframes imageFadeIn {
          0% { opacity: 0.3; transform: scale(1.02); filter: brightness(1.2) contrast(1.1); }
          100% { opacity: 1; transform: scale(1); filter: brightness(1) contrast(1); }
        }
        @keyframes spinPulse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
