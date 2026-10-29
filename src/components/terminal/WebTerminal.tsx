import React, { useState, useRef, useEffect } from 'react';
import { Play, Trash2 } from 'lucide-react';
import type { TerminalHistoryItem } from '../../types/lab';
import { processTerminalCommand, type CommandContext } from '../../lib/terminal/terminalEngine';

interface WebTerminalProps {
  activeLabId: string;
  cookies: Record<string, string>;
  setCookie: (key: string, value: string) => void;
  onHttpRequest: (method: string, url: string, headers: Record<string, string>, body?: string) => Promise<any>;
  onLabSolved: (labId: string, verifiedFlag?: string) => void;
}

export const WebTerminal: React.FC<WebTerminalProps> = ({
  activeLabId,
  cookies,
  setCookie,
  onHttpRequest,
  onLabSolved
}) => {
  const [history, setHistory] = useState<TerminalHistoryItem[]>([
    {
      command: 'system-init',
      output: `\x1b[36m[*] SiberAdam Web Terminal v2.4 hazır. Ofansif ve defansif siber güvenlik araçları yüklendi.\x1b[0m\n[*] Kullanılabilir araçları görmek için \x1b[32m'help'\x1b[0m yazın (curl, sqli, decode, cookie, fuzz, vb.).`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    // Add to command history
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryPointer(-1);
    setInputVal('');

    const context: CommandContext = {
      activeLabId,
      cookies,
      setCookie,
      onHttpRequest,
      onLabSolved
    };

    const res = await processTerminalCommand(cmd, context);

    if (res.output === '__CLEAR__') {
      setHistory([]);
      return;
    }

    setHistory((prev) => [
      ...prev,
      {
        command: cmd,
        output: res.output,
        type: res.type || 'standard',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextPtr = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPtr);
      setInputVal(commandHistory[nextPtr]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPtr = historyPointer + 1;
      if (nextPtr >= commandHistory.length) {
        setHistoryPointer(-1);
        setInputVal('');
      } else {
        setHistoryPointer(nextPtr);
        setInputVal(commandHistory[nextPtr]);
      }
    }
  };


  // Safely escape HTML characters to prevent XSS in host terminal
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Convert ANSI escape codes to basic HTML colors safely
  const formatAnsi = (text: string) => {
    const safeText = escapeHtml(text);
    return safeText
      .replace(/\x1b\[36m/g, '<span style="color: #00f0ff">')
      .replace(/\x1b\[32m/g, '<span style="color: #00ff9d">')
      .replace(/\x1b\[33m/g, '<span style="color: #f59e0b">')
      .replace(/\x1b\[31m/g, '<span style="color: #ff3366">')
      .replace(/\x1b\[34m/g, '<span style="color: #60a5fa">')
      .replace(/\x1b\[35m/g, '<span style="color: #c084fc">')
      .replace(/\x1b\[90m/g, '<span style="color: #64748b">')
      .replace(/\x1b\[0m/g, '</span>');
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#040711',
        fontFamily: 'var(--font-mono)'
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Title Bar */}
      <div
        style={{
          background: 'var(--bg-dark)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            sh // student@siberadam
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setHistory([]); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
            title="Ekranı Temizle"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '12px',
          lineHeight: 1.5
        }}
      >
        {history.map((item, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            {item.command !== 'system-init' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>student@siberadam:~$</span>
                <span style={{ color: '#fff' }}>{item.command}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                  {item.timestamp}
                </span>
              </div>
            )}

            {item.output && (
              <div
                style={{
                  color: item.type === 'error' ? '#fca5a5' : '#cbd5e1',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  paddingLeft: item.command !== 'system-init' ? '12px' : '0'
                }}
                dangerouslySetInnerHTML={{ __html: formatAnsi(item.output) }}
              />
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={handleCommandSubmit}
        style={{
          background: 'rgba(10, 15, 29, 0.95)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '13px' }}>$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Komut girin (örn. help, curl -i ..., sqli query 'SELECT...')"
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px'
          }}
        />
        <button
          type="submit"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-cyan)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <Play size={14} />
        </button>
      </form>
    </div>
  );
};
