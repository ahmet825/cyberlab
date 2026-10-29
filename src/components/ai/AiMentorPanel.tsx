import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Lock,
  ShieldCheck,
  ShieldAlert,
  LogIn
} from 'lucide-react';
import type { LabItem, ChatMessage } from '../../types/lab';
import type { UserProfile } from '../../types/user';
import { askAiMentor, ApiClientAuthError } from '../../lib/ai/aiMentorEngine';

interface AiMentorPanelProps {
  currentLab: LabItem;
  deepInfraApiKey: string;
  deepInfraModel: string;
  geminiApiKey: string;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (reason?: string) => void;
}

export const AiMentorPanel: React.FC<AiMentorPanelProps> = ({
  currentLab,
  deepInfraApiKey,
  deepInfraModel,
  geminiApiKey,
  currentUser,
  onOpenAuthModal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Merhaba! Ben senin siber güvenlik yapay zeka mentorunum. 

Şu anda **${currentLab.title}** üzerindesin. Amacım sana doğrudan kopyala-yapıştır cevabı vermek değil; **Tarayıcı (DevTools), Terminal ve Yapay Zeka** üçlüsünü bir profesyonel gibi nasıl kullanacağını öğretmektir.

Başlamak için aşağıdaki hızlı butonlara tıklayabilir veya aklındaki soruyu yazabilirsin!`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial message when lab changes
  useEffect(() => {
    setMessages([
      {
        id: `intro-${currentLab.id}`,
        sender: 'ai',
        text: `Yeni Laboratuvar Seçildi: **${currentLab.title}** (${currentLab.category} - ${currentLab.difficulty}).\n\n${currentLab.description}\n\nNereden başlayacağını bilmiyorsan aşağıdaki "Nereden başlamalıyım?" butonuna tıkla!`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [currentLab.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    // Frontend Auth Protection Gate
    if (!currentUser) {
      onOpenAuthModal?.('Lütfen giriş yapın.');
      return;
    }

    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const aiReply = await askAiMentor({
        lab: currentLab,
        userMessage: text,
        terminalLogs: [],
        deepInfraApiKey,
        deepInfraModel,
        geminiApiKey,
        currentUser
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err: any) {
      if (err instanceof ApiClientAuthError || err?.name === 'ApiClientAuthError' || err?.code === 'AUTH_REQUIRED') {
        const authReason = 'Lütfen giriş yapın.';
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-auth-${Date.now()}`,
            sender: 'ai',
            text: `🔒 **[LÜTFEN GİRİŞ YAPIN]**\n\n${err.message || 'Lütfen giriş yapın.'}\n\nAI Mentor servisinden yararlanabilmek için lütfen giriş yapın veya ücretsiz hesap oluşturun.`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        onOpenAuthModal?.(authReason);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: `Bir hata oluştu: ${err.message}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const hasDeepInfra = Boolean(deepInfraApiKey?.trim());
  const shortModelName = deepInfraModel ? deepInfraModel.split('/').pop() : 'Llama-3.3-70B';

  const quickPrompts = [
    { label: '💡 Nereden başlamalıyım?', query: 'Nereden başlamalıyım?' },
    { label: '🔍 Açığın mantığı nedir?', query: 'Bu zafiyetin mantığı nedir?' },
    { label: '🛡️ Keşif Metodolojisi', query: 'Bu zafiyeti keşfetmek için hangi adımları izlemeliyim?' },
    { label: '⚡ WAF/Filtre atlatma ipucu', query: 'Bu filtreyi bypass etmek için ne yapmalıyım?' }
  ];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-dark)',
        borderLeft: '1px solid var(--border-subtle)',
        position: 'relative'
      }}
    >
      {/* Mentor Header */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={16} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                CyberAI Mentor
              </span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: hasDeepInfra ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 255, 157, 0.1)',
                  color: hasDeepInfra ? 'var(--accent-cyan)' : 'var(--accent-green)',
                  border: `1px solid ${hasDeepInfra ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 255, 157, 0.2)'}`
                }}
              >
                {hasDeepInfra ? `DeepInfra // ${shortModelName}` : 'Sokratik Motor'}
              </span>
            </div>
            <span
              style={{
                fontSize: '10px',
                color: currentUser ? 'var(--accent-green)' : 'var(--accent-orange)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {currentUser ? (
                <>
                  <ShieldCheck size={11} />
                  <span>API Client Doğrulandı ({currentUser.username})</span>
                </>
              ) : (
                <>
                  <Lock size={10} />
                  <span>API Client: Lütfen giriş yapın</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!currentUser && (
            <button
              onClick={() => onOpenAuthModal?.('Lütfen giriş yapın.')}
              style={{
                background: 'rgba(0, 255, 157, 0.12)',
                border: '1px solid var(--accent-green)',
                color: 'var(--accent-green)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Giriş Yap"
            >
              <LogIn size={11} />
              <span>Giriş Yap</span>
            </button>
          )}

          <button
            onClick={() => {
              setMessages([
                {
                  id: 'reset',
                  sender: 'ai',
                  text: `Sohbet sıfırlandı. Aktif Lab: **${currentLab.title}**. Sorunu sorabilirsin!`,
                  timestamp: new Date().toLocaleTimeString()
                }
              ]);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '4px'
            }}
            title="Sohbeti Sıfırla"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Quick Prompts Chips Bar */}
      <div
        style={{
          padding: '8px 12px',
          background: 'rgba(15, 23, 42, 0.4)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto'
        }}
      >
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!currentUser) {
                onOpenAuthModal?.('Lütfen giriş yapın.');
                return;
              }
              handleSendMessage(p.query);
            }}
            style={{
              whiteSpace: 'nowrap',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: currentUser ? 'var(--text-muted)' : '#64748b',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: currentUser ? 1 : 0.85
            }}
            title={!currentUser ? 'Kullanmak için lütfen giriş yapın' : p.label}
          >
            {!currentUser && <Lock size={10} color="var(--accent-orange)" />}
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Frontend Auth Guard / Messages Scroll Area */}
      {!currentUser ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px',
            textAlign: 'center',
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, rgba(5, 8, 15, 0.95) 75%)',
            overflowY: 'auto'
          }}
        >
          {/* Glowing Lock Badge */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(0, 240, 255, 0.2))',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(139, 92, 246, 0.35)',
              marginBottom: '14px'
            }}
          >
            <Lock size={26} color="#a78bfa" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              color: '#fde68a',
              marginBottom: '10px'
            }}
          >
            <ShieldAlert size={12} color="#f59e0b" />
            <span>KİMLİK DOĞRULAMA KORUMASI</span>
          </div>

          <h3
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: '#fff',
              fontFamily: 'var(--font-display)',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}
          >
            Lütfen Giriş Yapın
          </h3>

          <p
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '320px',
              marginBottom: '18px'
            }}
          >
            CyberAI Mentor ile laboratuvarlarda yapay zeka rehberliği almak, zafiyet ipuçlarını ve Sokratik analizleri görüntülemek için lütfen giriş yapın.
          </p>

          <button
            type="button"
            onClick={() => onOpenAuthModal?.('Lütfen giriş yapın.')}
            className="btn-cyber-primary"
            style={{
              padding: '9px 20px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 255, 157, 0.3)'
            }}
          >
            <Lock size={13} />
            <span>Giriş Yap / Kayıt Ol</span>
          </button>

          {/* Feature Highlights */}
          <div
            style={{
              marginTop: '22px',
              width: '100%',
              maxWidth: '320px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#cbd5e1' }}>
              <Sparkles size={12} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
              <span>Sokratik yöntemle zafiyet analiz ve ipuçları</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#cbd5e1' }}>
              <Bot size={12} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <span>Llama 3.3 70B & Qwen 2.5 Coder MoE entegrasyonu</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#cbd5e1' }}>
              <ShieldCheck size={12} color="var(--accent-green)" style={{ flexShrink: 0 }} />
              <span>Bulut senkronizasyonu ve korumalı API client</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAi ? 'flex-start' : 'flex-end',
                  maxWidth: '92%',
                  alignSelf: isAi ? 'flex-start' : 'flex-end'
                }}
              >
                <div
                  style={{
                    background: isAi ? 'var(--bg-card)' : 'rgba(0, 240, 255, 0.12)',
                    border: isAi ? '1px solid var(--border-subtle)' : '1px solid var(--border-cyan)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: isAi ? '#e2e8f0' : '#fff',
                    fontSize: '12.5px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.text}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {m.timestamp}
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '11px', padding: '6px' }}>
              <Sparkles size={12} color="var(--accent-purple)" className="animate-spin" />
              <span>AI Mentor düşünüyor...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Form with Auth Gate */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!currentUser) {
            onOpenAuthModal?.('Lütfen giriş yapın.');
            return;
          }
          handleSendMessage();
        }}
        style={{
          padding: '10px 12px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          opacity: !currentUser ? 0.75 : 1
        }}
      >
        <input
          type="text"
          value={currentUser ? inputText : ''}
          onChange={(e) => currentUser && setInputText(e.target.value)}
          placeholder={currentUser ? 'Yapay Zeka Mentoruna sor (Socratic mod)...' : 'Lütfen giriş yapın (AI Mentor kilitli)...'}
          disabled={!currentUser || isTyping}
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: !currentUser ? 'not-allowed' : 'text'
          }}
        />
        <button
          type="submit"
          className="btn-cyber-primary"
          style={{
            padding: '8px 12px',
            background: !currentUser ? 'rgba(245, 158, 11, 0.2)' : undefined,
            borderColor: !currentUser ? 'var(--border-orange)' : undefined,
            color: !currentUser ? 'var(--accent-orange)' : undefined,
            cursor: 'pointer'
          }}
          disabled={isTyping}
          title={!currentUser ? 'Lütfen giriş yapın' : 'Mesaj Gönder'}
        >
          {!currentUser ? <Lock size={13} /> : <Send size={13} />}
        </button>
      </form>
    </div>
  );
};
