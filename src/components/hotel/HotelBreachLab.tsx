import React, { useState } from 'react';
import './hotel.css';
import { HotelThunderClient } from './HotelThunderClient';
import { HotelWhiteboardAI } from './HotelWhiteboardAI';
import { HotelQuizModule } from './HotelQuizModule';
import { HotelCodeViewer } from './HotelCodeViewer';
import {
  Columns,
  Award,
  Zap,
  RotateCcw,
  Bot,
  Code2,
  Crown,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { resetHotelDatabase } from '../../lib/hotel/virtualHotelServer';

interface HotelBreachLabProps {
  onBackToHub?: () => void;
  initialScenario?: 'api' | 'file-upload';
}

export const HotelBreachLab: React.FC<HotelBreachLabProps> = ({ onBackToHub, initialScenario = 'api' }) => {
  // Scenario state: 'api' | 'file-upload'
  const [activeScenario, setActiveScenario] = useState<'api' | 'file-upload'>(initialScenario);

  // Split view mode: 'split' | 'left-only' | 'right-only'
  const [viewMode, setViewMode] = useState<'split' | 'left-only' | 'right-only'>('split');
  
  // Left Panel Sub-tab: 'client' | 'code'
  const [leftTab, setLeftTab] = useState<'client' | 'code'>('client');

  // Right Panel Sub-tab: 'whiteboard' | 'quiz'
  const [rightTab, setRightTab] = useState<'whiteboard' | 'quiz'>('whiteboard');

  const [dbResetKey, setDbResetKey] = useState(0);

  const handleResetDb = () => {
    resetHotelDatabase();
    setDbResetKey(prev => prev + 1);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-darker, #060910)',
      color: 'var(--text-main, #f8fafc)',
      fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
      overflow: 'hidden'
    }}>
      {/* Top Header - First Labs Cyber Aesthetic */}
      <header style={{
        height: '56px',
        background: 'linear-gradient(180deg, var(--bg-dark, #0a0f1d) 0%, var(--bg-darker, #060910) 100%)',
        borderBottom: '1px solid var(--border-subtle, #1e293b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
        zIndex: 30,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '5px',
                background: 'var(--bg-card, #0f172a)',
                color: 'var(--text-muted, #94a3b8)',
                border: '1px solid var(--border-subtle, #1e293b)',
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowLeft size={13} />
              <span>Ana Menü</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Team Badge: BLUE TEAM */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '5px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid var(--border-cyan, rgba(0, 240, 255, 0.4))',
              color: 'var(--accent-cyan, #00f0ff)',
              fontSize: '10.5px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)'
            }}>
              <Shield size={13} color="var(--accent-cyan, #00f0ff)" />
              <span>MAVİ TAKIM // SAVUNMA</span>
            </div>

            {/* Premium Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '5px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
              border: '1px solid var(--accent-orange, #f59e0b)',
              color: 'var(--accent-orange, #f59e0b)',
              fontSize: '10px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono, monospace)'
            }}>
              <Crown size={12} />
              <span>PREMIUM VIP LAB</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{
                  fontSize: '13px',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                  color: 'var(--text-main, #f8fafc)',
                  margin: 0,
                  fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)'
                }}>
                  HOTEL SİSTEMİ TEHLİKE ALTINDA
                </h1>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: activeScenario === 'file-upload' ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                  color: activeScenario === 'file-upload' ? 'var(--accent-green, #00ff9d)' : 'var(--accent-red, #ff3366)',
                  border: `1px solid ${activeScenario === 'file-upload' ? 'rgba(0, 255, 157, 0.3)' : 'rgba(255, 51, 102, 0.3)'}`,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {activeScenario === 'file-upload' ? 'FILE UPLOAD DEFENSE' : 'EXPRESS API BREACH'}
                </span>
              </div>
            </div>

            {/* Senaryo Seçici Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '2px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '4px'
            }}>
              <button
                onClick={() => setActiveScenario('api')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${activeScenario === 'api' ? 'var(--accent-cyan)' : 'transparent'}`,
                  background: activeScenario === 'api' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                  color: activeScenario === 'api' ? 'var(--accent-cyan)' : 'var(--text-dim)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                1️⃣ API Zafiyetleri
              </button>
              <button
                onClick={() => setActiveScenario('file-upload')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${activeScenario === 'file-upload' ? 'var(--accent-green)' : 'transparent'}`,
                  background: activeScenario === 'file-upload' ? 'rgba(0, 255, 157, 0.15)' : 'transparent',
                  color: activeScenario === 'file-upload' ? 'var(--accent-green)' : 'var(--text-dim)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                📁 2️⃣ Dosya Yükleme (4 Adım)
              </button>
            </div>
          </div>
        </div>

        {/* View Controls & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Split Mode Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input, #090e1a)',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle, #1e293b)'
          }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: viewMode === 'split' ? 800 : 500,
                background: viewMode === 'split' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                color: viewMode === 'split' ? 'var(--accent-cyan, #00f0ff)' : 'var(--text-dim, #64748b)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
              title="Ekranı Sol ve Sağ olarak ikiye böl (50/50)"
            >
              <Columns size={12} />
              <span>Split Görünüm</span>
            </button>
            <button
              onClick={() => setViewMode('left-only')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: viewMode === 'left-only' ? 800 : 500,
                background: viewMode === 'left-only' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                color: viewMode === 'left-only' ? 'var(--accent-cyan, #00f0ff)' : 'var(--text-dim, #64748b)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
              title="Sadece İstek Konsolu ve Kaynak Kodu Odaklan"
            >
              <Zap size={12} />
              <span>Sol Odak</span>
            </button>
            <button
              onClick={() => setViewMode('right-only')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: viewMode === 'right-only' ? 800 : 500,
                background: viewMode === 'right-only' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                color: viewMode === 'right-only' ? 'var(--accent-cyan, #00f0ff)' : 'var(--text-dim, #64748b)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
              title="Sadece AI Tebeşir Tahtası ve 10 Soruluk Sınav Odaklan"
            >
              <Award size={12} />
              <span>Sağ Odak</span>
            </button>
          </div>

          <button
            onClick={handleResetDb}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '5px',
              background: 'var(--bg-card, #0f172a)',
              color: 'var(--text-muted, #94a3b8)',
              border: '1px solid var(--border-subtle, #1e293b)',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
            title="Otel veritabanını ve müşteri rezervasyonlarını ilk haline döndür"
          >
            <RotateCcw size={12} color="var(--accent-orange, #f59e0b)" />
            <span>DB Sıfırla</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout Workspace */}
      <main style={{
        flex: 1,
        display: 'flex',
        padding: '8px',
        gap: '8px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-darker, #060910)'
      }}>
        {/* ========================================================= */}
        {/* SOL SPLIT PANEL (API İstek Konsolu & Kod İnceleme)       */}
        {/* ========================================================= */}
        {(viewMode === 'split' || viewMode === 'left-only') && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: viewMode === 'split' ? '50%' : '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle, #1e293b)',
            background: 'var(--bg-dark, #0a0f1d)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Sol Panel Sekme Başlığı */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'var(--bg-dark, #0a0f1d)',
              borderBottom: '1px solid var(--border-subtle, #1e293b)',
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setLeftTab('client')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '5px',
                    border: '1px solid',
                    borderColor: leftTab === 'client' ? 'var(--accent-cyan, #00f0ff)' : 'transparent',
                    background: leftTab === 'client' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                    color: leftTab === 'client' ? 'var(--accent-cyan, #00f0ff)' : 'var(--text-dim, #64748b)',
                    fontWeight: leftTab === 'client' ? 800 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <Zap size={12} color="var(--accent-cyan, #00f0ff)" />
                  <span>API İstek Konsolu (Rest Runner)</span>
                </button>
                <button
                  onClick={() => setLeftTab('code')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '5px',
                    border: '1px solid',
                    borderColor: leftTab === 'code' ? 'var(--accent-green, #00ff9d)' : 'transparent',
                    background: leftTab === 'code' ? 'rgba(0, 255, 157, 0.15)' : 'transparent',
                    color: leftTab === 'code' ? 'var(--accent-green, #00ff9d)' : 'var(--text-dim, #64748b)',
                    fontWeight: leftTab === 'code' ? 800 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <Code2 size={12} color="var(--accent-green, #00ff9d)" />
                  <span>Express Sunucu Kodu (Okuma)</span>
                </button>
              </div>

              <div style={{ fontSize: '10.5px', color: 'var(--text-dim, #64748b)' }}>
                MODÜL: {leftTab === 'client' ? 'HTTP RUNNER' : 'CODE REVIEW'}
              </div>
            </div>

            {/* Sol Panel İçeriği */}
            <div style={{ flex: 1, overflow: 'hidden' }} key={`left-${activeScenario}-${dbResetKey}`}>
              {leftTab === 'client' ? <HotelThunderClient scenario={activeScenario} /> : <HotelCodeViewer scenario={activeScenario} />}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SAĞ SPLIT PANEL (Öğretmen Tahtası & 10 Soruluk Sınav)    */}
        {/* ========================================================= */}
        {(viewMode === 'split' || viewMode === 'right-only') && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: viewMode === 'split' ? '50%' : '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle, #1e293b)',
            background: 'var(--bg-dark, #0a0f1d)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Sağ Panel Sekme Başlığı */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'var(--bg-dark, #0a0f1d)',
              borderBottom: '1px solid var(--border-subtle, #1e293b)',
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setRightTab('whiteboard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '5px',
                    border: '1px solid',
                    borderColor: rightTab === 'whiteboard' ? 'var(--accent-green, #00ff9d)' : 'transparent',
                    background: rightTab === 'whiteboard' ? 'rgba(0, 255, 157, 0.15)' : 'transparent',
                    color: rightTab === 'whiteboard' ? 'var(--accent-green, #00ff9d)' : 'var(--text-dim, #64748b)',
                    fontWeight: rightTab === 'whiteboard' ? 800 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <Bot size={12} color="var(--accent-green, #00ff9d)" />
                  <span>Öğretmen Tahtası (AI Teori Çizimi)</span>
                </button>
                <button
                  onClick={() => setRightTab('quiz')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '5px',
                    border: '1px solid',
                    borderColor: rightTab === 'quiz' ? 'var(--accent-orange, #f59e0b)' : 'transparent',
                    background: rightTab === 'quiz' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: rightTab === 'quiz' ? 'var(--accent-orange, #f59e0b)' : 'var(--text-dim, #64748b)',
                    fontWeight: rightTab === 'quiz' ? 800 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <Award size={12} color="var(--accent-orange, #f59e0b)" />
                  <span>10 Soruluk Sınav (Pass/Fail)</span>
                </button>
              </div>

              <div style={{ fontSize: '10.5px', color: 'var(--text-dim, #64748b)' }}>
                MODÜL: {rightTab === 'whiteboard' ? 'THEORY BOARD' : 'ASSESSMENT'}
              </div>
            </div>

            {/* Sağ Panel İçeriği */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {rightTab === 'whiteboard' ? <HotelWhiteboardAI scenario={activeScenario} /> : <HotelQuizModule scenario={activeScenario} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
