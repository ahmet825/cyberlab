import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, RefreshCw } from 'lucide-react';
import type { LabItem, ChatMessage } from '../../types/lab';
import { askAiMentor } from '../../lib/ai/aiMentorEngine';

interface AiMentorPanelProps {
  currentLab: LabItem;
  deepInfraApiKey: string;
  deepInfraModel: string;
  geminiApiKey: string;
}

export const AiMentorPanel: React.FC<AiMentorPanelProps> = ({
  currentLab,
  deepInfraApiKey,
  deepInfraModel,
  geminiApiKey
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
        geminiApiKey
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
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Bir hata oluştu: ${err.message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
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
        borderLeft: '1px solid var(--border-subtle)'
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
            <span style={{ fontSize: '10px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="live-dot" style={{ width: '6px', height: '6px' }} />
              Sokratik Metodoloji Aktif
            </span>
          </div>
        </div>

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
            onClick={() => handleSendMessage(p.query)}
            style={{
              whiteSpace: 'nowrap',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
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

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          padding: '10px 12px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Yapay Zeka Mentoruna sor (Socratic mod)..."
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        <button
          type="submit"
          className="btn-cyber-primary"
          style={{ padding: '8px 12px' }}
          disabled={isTyping}
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
};
