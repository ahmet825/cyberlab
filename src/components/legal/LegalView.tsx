import React, { useState } from 'react';
import {
  ShieldAlert,
  FileText,
  ArrowLeft,
  Lock,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface LegalViewProps {
  initialTab?: 'disclaimer' | 'kvkk';
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({
  initialTab = 'disclaimer',
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'kvkk'>(initialTab);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#070b13',
        color: '#f1f5f9',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: 'rgba(10, 15, 26, 0.95)',
          borderBottom: '1px solid #1e293b',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid #334155',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.color = '#00f0ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <ArrowLeft size={14} />
            <span>Platforma Dön</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} color="#00f0ff" />
            <h1 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px', color: '#ffffff' }}>
              SİBERADAM // HUKUKİ ŞARTLAR & BİLGİLENDİRME
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#0f172a',
            padding: '3px',
            borderRadius: '6px',
            border: '1px solid #334155'
          }}
        >
          <button
            onClick={() => setActiveTab('disclaimer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'disclaimer' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: activeTab === 'disclaimer' ? '#00f0ff' : '#94a3b8',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <ShieldAlert size={14} />
            <span>Eğitim Feragatnamesi (Yasal Uyarı)</span>
          </button>

          <button
            onClick={() => setActiveTab('kvkk')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'kvkk' ? 'rgba(0, 255, 157, 0.15)' : 'transparent',
              color: activeTab === 'kvkk' ? '#00ff9d' : '#94a3b8',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <FileText size={14} />
            <span>KVKK Aydınlatma Metni</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '40px 24px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            maxWidth: '860px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '36px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            lineHeight: 1.75
          }}
        >
          {activeTab === 'disclaimer' ? (
            /* TAB 1: EĞİTİM FERAGATNAMESİ & YASAL UYARI */
            <article>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  YASAL DÜZENLEME & ETİK KULLANIM
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                  Son Güncelleme: 2026
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                Siber Güvenlik Eğitim Feragatnamesi & Yasal Uyarı
              </h2>

              {/* Warning Alert Box */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderLeft: '4px solid #f59e0b',
                  padding: '14px 18px',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#fde68a', margin: 0 }}>
                  <strong>ÖNEMLİ YASAL UYARI:</strong> Bu platformda sunulan tüm güvenlik açığı tespit, istismar ve analiz
                  yöntemleri <u>yalnızca izole eğitim ortamları için</u> tasarlanmıştır. Bu tekniklerin izin ve yetki alınmamış
                  gerçek bilişim sistemleri üzerinde denenmesi <strong>5237 sayılı Türk Ceza Kanunu kapsamında ağır suçtur</strong>.
                </p>
              </div>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00f0ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> 1. Amaç ve Kapsam
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  SiberAdam , siber güvenlik alanında savunma mekanizmalarını güçlendirmek, yazılım
                  geliştiricilerin güvenli kod yazma (secure coding) bilincini artırmak ve etik siber güvenlik uzmanları (White
                  Hat) yetiştirmek amacıyla hazırlanmış <strong>tamamen kurgusal bir eğitim simülasyonudur</strong>.
                </p>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00f0ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> 2. Kurgusal Senaryo & İzole Kumhavuzu Beyanı
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  Platformdaki tüm senaryolar, kurum adları (örneğin <em>"ACME Savunma Teknolojileri"</em>), şahıs isimleri, veritabanı kayıtları
                  ve etki alanları (örneğin <code>.local</code>) <strong>tamamen hayal ürünüdür</strong>. Gerçek kişi, kurum veya
                  kuruluşlarla hiçbir bağı bulunmamaktadır.
                </p>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1', marginTop: '8px' }}>
                  Laboratuvar ortamında yürütülen tüm HTTP istekleri, SQL sorguları ve komut satırı işlemleri
                  <strong> kullanıcının kendi tarayıcısının RAM belleğinde (in-browser sandboxing)</strong> izole olarak çalıştırılır.
                  Platform dış ağlara veya üçüncü şahıslara ait gerçek sunuculara kesinlikle saldırı trafiği yönlendirmez.
                </p>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00f0ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> 3. 5237 Sayılı Türk Ceza Kanunu Uyarısı
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  Kullanıcı, platformda edindiği bilgi ve tecrübeleri açık ve yazılı izin almadığı hiçbir gerçek bilişim sisteminde
                  kullanamaz. Aksi eylemler aşağıdaki TCK maddeleri kapsamında hapis cezası gerektiren bilişim suçlarıdır:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                  <li><strong>TCK Madde 243:</strong> Bilişim sistemine hukuka aykırı olarak girme ve sistemde kalma.</li>
                  <li><strong>TCK Madde 244:</strong> Bilişim sisteminin işleyişini engelleme, bozma veya verileri yok etme/değiştirme.</li>
                  <li><strong>TCK Madde 245 & 245/A:</strong> Banka ve kredi kartlarının kötüye kullanılması, yasak cihaz ve program üretimi.</li>
                </ul>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00f0ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> 4. Sorumluluk Reddi (Limitation of Liability)
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  Platform geliştiricileri ve yöneticileri; kullanıcıların platformda öğrendikleri teknikleri üçüncü taraf sistemlerde
                  hukuka aykırı şekilde kullanmasından doğabilecek hiçbir adli, idari, hukuki veya cezai yaptırımdan sorumlu
                  tutulamaz. Tüm hukuki ve cezai sorumluluk eylemi gerçekleştiren kullanıcıya aittir.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', color: '#00f0ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> 5. Etik ve Sorumlu İfşa (Responsible Disclosure)
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  Bu platformu kullanan her birey, siber güvenlik tekniklerini sadece sistemleri korumak, zafiyetleri kapatmak ve
                  toplumsal dijital güvenliği artırmak amacıyla kullanacağını kabul ve taahhüt eder.
                </p>
              </section>
            </article>
          ) : (
            /* TAB 2: 6698 SAYILI KVKK AYDINLATMA METNİ */
            <article>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span
                  style={{
                    background: 'rgba(0, 255, 157, 0.15)',
                    color: '#00ff9d',
                    border: '1px solid rgba(0, 255, 157, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  6698 SAYILI KANUN KAPSAMINDA
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                  Aydınlatma Yükümlülüğü
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni & Çerez Politikası
              </h2>

              <div
                style={{
                  background: 'rgba(0, 255, 157, 0.06)',
                  borderLeft: '4px solid #00ff9d',
                  padding: '14px 18px',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <Lock size={20} color="#00ff9d" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#d1fae5', margin: 0 }}>
                  SiberAdam olarak kişisel verilerinizin güvenliğine en üst düzeyde önem veriyoruz. 6698 sayılı Kişisel Verilerin
                  Korunması Kanunu (“KVKK”) m. 10 uyarınca aydınlatma metnimiz aşağıda sunulmuştur.
                </p>
              </div>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00ff9d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} /> 1. Veri Sorumlusu Sıfatı
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  6698 sayılı Kanun kapsamında SiberAdam platformu, platform kullanıcılarına ait kişisel verileri toplayan ve
                  işleyen Veri Sorumlusu sıfatını haizdir.
                </p>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00ff9d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} /> 2. İşlenen Kişisel Veri Kategorileri
                </h3>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1' }}>
                  <li><strong>Kimlik ve Hesap Verileri:</strong> Kullanıcı adı, e-posta adresi, şifrelenmiş parola hash'i.</li>
                  <li><strong>Eğitim & İlerleme Verileri:</strong> Çözülen güvenlik laboratuvarları, tamamlanan aşamalar, bayrak teslim zamanları ve puanlar.</li>
                  <li><strong>Teknik Oturum Verileri:</strong> Oturum çerezleri (<code>session_id</code>), tarayıcı yerel saklama alanı (<code>localStorage</code>) ayarları.</li>
                </ul>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00ff9d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} /> 3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  Kişisel verileriniz KVKK m. 5/2-c (Sözleşmenin kurulması ve ifası) ve m. 5/2-f (Meşru menfaat) uyarınca şu amaçlarla işlenir:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                  <li>Kullanıcı hesabı oluşturulması ve kimlik doğrulama süreçlerinin yürütülmesi,</li>
                  <li>Laboratuvar ilerlemenizin, rozetlerinizin ve seviye durumunuzun kaydedilmesi,</li>
                  <li>Sistem kararlılığının, performansının ve siber güvenliğinin sağlanması.</li>
                </ul>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00ff9d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} /> 4. Kişisel Verilerin Aktarımı
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  Toplanan kişisel verileriniz <strong>kesinlikle üçüncü taraf ticari şirketlere, reklam ağlarına satılmaz veya pazarlama amaçlı paylaşılmaz</strong>.
                  Verileriniz yalnızca yasal bir zorunluluk veya yetkili adli/idari makam talebi vuku bulduğunda yasal sınırlar dahilinde paylaşılabilir.
                </p>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#00ff9d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} /> 5. İlgili Kişinin Hakları (KVKK Madde 11)
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  KVKK’nın 11. maddesi uyarınca her kullanıcı:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                  <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
                  <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                  <li>Kişisel verilerinin silinmesini veya yok edilmesini talep etme,</li>
                  <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme haklarına sahiptir.</li>
                </ul>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                  Kullanıcı profilinizden "İlerlemeyi Sıfırla" veya hesap silme talebi göndererek kayıtlarınızı dilediğiniz zaman silebilirsiniz.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', color: '#00ff9d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} /> 6. Çerez (Cookie) Politikası
                </h3>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
                  Platformumuzda yalnızca oturum doğrulaması ve laboratuvar ilerleme takibi için teknik olarak zorunlu
                  <strong> birinci taraf çerezler</strong> kullanılmaktadır. Platformda reklam, hedefleme veya davranışsal izleme
                  çerezi bulunmamaktadır.
                </p>
              </section>
            </article>
          )}

          {/* Footer of Card */}
          <div
            style={{
              marginTop: '36px',
              borderTop: '1px solid #1e293b',
              paddingTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b',
              fontFamily: 'var(--font-mono, monospace)'
            }}
          >
            <span>SiberAdam Cyber Security Labs // 2026</span>
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00f0ff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              &larr; Ana Ekrana Dön
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
