import React, { useState } from 'react';
import { X, Key, RotateCcw, Cpu, ShieldCheck, Sparkles } from 'lucide-react';
import { DEEPINFRA_AVAILABLE_MODELS } from '../../lib/ai/aiMentorEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deepInfraApiKey: string;
  setDeepInfraApiKey: (key: string) => void;
  deepInfraModel: string;
  setDeepInfraModel: (model: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  onResetAllProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  deepInfraApiKey,
  setDeepInfraApiKey,
  deepInfraModel,
  setDeepInfraModel,
  geminiApiKey,
  setGeminiApiKey,
  onResetAllProgress
}) => {
  const [showGemini, setShowGemini] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '24px',
          boxShadow: 'var(--glow-card)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: 700 }}>Platform & Yapay Zeka Ayarları</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* DeepInfra AI Integration Section (Primary) */}
        <div
          style={{
            background: 'rgba(0, 240, 255, 0.04)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              DeepInfra Model Entegrasyonu (Önerilen)
            </span>
          </div>

          <p style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.5 }}>
            CyberAI Mentor için <strong>DeepInfra</strong> üzerinden yüksek hızlı, akıllı açık kaynaklı modeller bağlayın.
            Anahtar girilmezse yerleşik çevrimdışı Sokratik motor devreye girer.
          </p>

          {/* DeepInfra API Key */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
              <Key size={13} color="var(--accent-cyan)" />
              <span>DeepInfra API Key</span>
            </label>
            <input
              type="password"
              placeholder="dp-..."
              value={deepInfraApiKey}
              onChange={(e) => setDeepInfraApiKey(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                color: '#fff',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          {/* Model Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
              DeepInfra Modeli Seçin:
            </label>
            <select
              value={deepInfraModel}
              onChange={(e) => setDeepInfraModel(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-darker)',
                border: '1px solid var(--border-medium)',
                color: '#fff',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              {DEEPINFRA_AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Veya özel model adı girin (örn: meta-llama/Llama-3.3-70B-Instruct-Turbo)"
              value={deepInfraModel}
              onChange={(e) => setDeepInfraModel(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: '#94a3b8',
                padding: '7px 10px',
                borderRadius: '5px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>
        </div>

        {/* Optional Gemini Section (Collapsible) */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setShowGemini(!showGemini)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px'
            }}
          >
            <span>{showGemini ? '▲ Google Gemini Ayarlarını Gizle' : '▼ Google Gemini API Key (İsteğe Bağlı Yedek)'}</span>
          </button>

          {showGemini && (
            <div style={{ padding: '10px 12px', background: 'var(--bg-darker)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  color: '#fff',
                  padding: '8px 10px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          )}
        </div>

        {/* Architecture details */}
        <div style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
            <ShieldCheck size={14} />
            <span>Sıfır Altyapı Maliyeti & İstemci Tarafı Güvenliği</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            API anahtarlarınız yalnızca yerel tarayıcınızda (localStorage) saklanır ve hiçbir merkezi sunucuya iletilmez.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => {
              if (window.confirm('Tüm çözülen laboratuvar ilerlemeniz sıfırlanacak. Emin misiniz?')) {
                onResetAllProgress();
              }
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-orange)',
              color: 'var(--accent-orange)',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={13} />
            <span>İlerlemeyi Sıfırla</span>
          </button>

          <button
            onClick={onClose}
            className="btn-cyber-primary"
            style={{ padding: '8px 18px', fontSize: '12px' }}
          >
            Kaydet & Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
