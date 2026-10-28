import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Key,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import type { UserProfile } from '../../types/user';
import {
  signInWithGoogleOAuth,
  signInWithEmail,
  signUpWithEmail,
  requestPasswordReset
} from '../../lib/supabase/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  reasonMessage?: string;
}

type AuthViewMode = 'signin' | 'signup' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  reasonMessage
}) => {
  const [mode, setMode] = useState<AuthViewMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await signInWithGoogleOAuth();
      if (res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      if (res?.error) {
        setErrorMsg(res.error.message || 'Google ile giriş yapılırken bir sorun oluştu.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google ile giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Lütfen e-posta adresinizi girin.');
      return;
    }

    if (mode === 'forgot_password') {
      setIsLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const res = await requestPasswordReset(email);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Şifre sıfırlama isteği gönderilemedi.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMsg('Lütfen şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        const res = await signUpWithEmail(email, password, username);
        if (res.error) {
          setErrorMsg(res.error);
          return;
        }
        if (res.needsEmailConfirmation) {
          setSuccessMsg('Hesabınız başarıyla oluşturuldu! Lütfen e-posta adresinize gönderilen aktivasyon bağlantısını onaylayın.');
          return;
        }
        if (res.user) {
          onLoginSuccess(res.user);
          onClose();
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
          return;
        }
        if (res.user) {
          onLoginSuccess(res.user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'İşlem sırasında beklenmeyen bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 6, 12, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-accent)',
          borderRadius: '10px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 255, 157, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            background: 'var(--bg-darker)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={15} color="var(--accent-green)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '13px', color: '#fff', letterSpacing: '0.5px' }}>
              OPERATÖR GİRİŞİ // <span style={{ color: 'var(--accent-green)' }}>SİBERADAM</span>
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Reason Banner */}
        {reasonMessage && (
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#fef3c7'
            }}
          >
            <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>{reasonMessage}</span>
          </div>
        )}

        <div style={{ padding: '20px' }}>
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot_password' ? (
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-darker)',
                padding: '3px',
                borderRadius: '6px',
                marginBottom: '16px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '4px',
                  border: 'none',
                  background: mode === 'signin' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'signin' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: mode === 'signin' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '4px',
                  border: 'none',
                  background: mode === 'signup' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'signup' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: mode === 'signup' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Kayıt Ol
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '14px',
                padding: 0
              }}
            >
              <ArrowLeft size={13} />
              <span>Giriş ekranına geri dön</span>
            </button>
          )}

          {/* Google OAuth Button */}
          {mode !== 'forgot_password' && (
            <>
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-ui)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  marginBottom: '14px',
                  transition: 'opacity 0.2s'
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google ile Devam Et</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  VEYA E-POSTA İLE
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>
            </>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Operatör Takma Adı
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="operatör_01"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '5px',
                      background: 'var(--bg-darker)',
                      border: '1px solid var(--border-medium)',
                      color: '#fff',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                E-posta Adresi
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operatör@sirket.com"
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    borderRadius: '5px',
                    background: 'var(--bg-darker)',
                    border: '1px solid var(--border-medium)',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Şifre
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        fontSize: '10.5px',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Şifremi unuttum?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Key size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '8px 32px 8px 30px',
                      borderRadius: '5px',
                      background: 'var(--bg-darker)',
                      border: '1px solid var(--border-medium)',
                      color: '#fff',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  padding: '8px 10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#f87171',
                  lineHeight: 1.4
                }}
              >
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  padding: '8px 10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={13} />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-cyber-primary"
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '4px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={14} />
              <span>
                {isLoading
                  ? 'İşleniyor...'
                  : mode === 'signup'
                  ? 'Kayıt Ol & Erişimi Aç'
                  : mode === 'forgot_password'
                  ? 'Sıfırlama Bağlantısı Gönder'
                  : 'Giriş Yap'}
              </span>
            </button>

            {/* Legal Notice */}
            <p style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '6px', lineHeight: 1.4 }}>
              Giriş yaparak{' '}
              <a href="#/feragatname" onClick={onClose} style={{ color: '#00f0ff', textDecoration: 'underline' }}>
                Yasal Uyarı & Feragatname
              </a>{' '}
              ve{' '}
              <a href="#/kvkk" onClick={onClose} style={{ color: '#00ff9d', textDecoration: 'underline' }}>
                KVKK Metnini
              </a>{' '}
              kabul etmiş sayılırsınız.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
