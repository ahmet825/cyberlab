import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Terminal as TerminalIcon,
  CheckCircle2,
  ArrowRight,
  Shield,
  RotateCcw,
  Sparkles,
  BookOpen,
  Cpu,
  Layers,
  FileCode,
  Server,
  FolderTree,
  ChevronDown,
  Info
} from 'lucide-react';
import { INITIAL_MISSIONS, LINUX_MACHINES, LINUX_CHEATSHEET } from './missionsData';
import {
  createInitialVfs,
  executeVfsCommand,
  getNodeAtPath,
  resolvePath
} from './linuxVfs';
import { CheerpXBridge } from './cheerpxAdapter';
import type { LinuxVfsState, EngineMode, MissionCheckContext } from './types';
import './linuxMachine.css';

interface TerminalLog {
  id: string;
  type: 'prompt' | 'stdout' | 'stderr' | 'system';
  text: string;
  user?: string;
  cwd?: string;
}

interface LinuxMachineViewProps {
  onBackToMain?: () => void;
}

export const LinuxMachineView: React.FC<LinuxMachineViewProps> = ({ onBackToMain }) => {
  const [machines] = useState(LINUX_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState('machine-01');
  const [isMachineDropdownOpen, setIsMachineDropdownOpen] = useState(false);

  // Active Tab in Side Panel: 'briefing' | 'cheatsheet' | 'machines'
  const [activeSideTab, setActiveSideTab] = useState<'briefing' | 'cheatsheet' | 'machines'>('briefing');

  const [missions] = useState(INITIAL_MISSIONS);
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [vfs, setVfs] = useState<LinuxVfsState>(() => createInitialVfs());
  const [cwd, setCwd] = useState('/home/x');
  const [currentUser, setCurrentUser] = useState('x');
  const [engineMode, setEngineMode] = useState<EngineMode>('posix-sandbox');
  const [engineMsg, setEngineMsg] = useState('Başlatılıyor...');

  // Terminal state
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'sys-0',
      type: 'system',
      text: `Debian GNU/Linux 12 (bookworm) - Linux target-station-y 6.1.0-21-amd64\nSon oturum açılışı: Salı Eki 27 18:10:00 2026 (tty1)\n[i] SİBERADAM LINUX SİSTEMLERİ - HEDEF İSTASYON 01 YAYINDA.\n* Sol paneldeki Görev Brifingi ve Komut Rehberini takip ederek ilerleyebilirsiniz.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);

  // Modals & Panels
  const [successMission, setSuccessMission] = useState<typeof INITIAL_MISSIONS[0] | null>(null);

  // Tracking state for mission validation
  const visitedDirsRef = useRef<Set<string>>(new Set(['/home/x']));
  const readFilesRef = useRef<Set<string>>(new Set());
  const executedFilesRef = useRef<Set<string>>(new Set());

  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMission = missions[currentMissionIdx];
  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  // Initialize CheerpX / Sandbox Bridge
  useEffect(() => {
    const bridge = new CheerpXBridge();
    bridge.initialize().then((res) => {
      setEngineMode(res.mode);
      setEngineMsg(res.message);
    });
  }, []);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Focus terminal input
  const handleFocusTerminal = () => {
    inputRef.current?.focus();
  };

  // Execute typed command
  const handleRunCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) {
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: 'prompt',
          text: '',
          user: currentUser,
          cwd
        }
      ]);
      return;
    }

    // Save to history
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryPointer(-1);

    // Record prompt
    const promptEntry: TerminalLog = {
      id: Math.random().toString(),
      type: 'prompt',
      text: trimmed,
      user: currentUser,
      cwd
    };

    // Track commands for mission checks
    if (trimmed.startsWith('cd ')) {
      const target = trimmed.replace('cd ', '').trim();
      const resolved = resolvePath(cwd, target);
      visitedDirsRef.current.add(resolved);
    }
    if (trimmed.startsWith('cat ') || trimmed.startsWith('head ') || trimmed.startsWith('tail ') || trimmed.includes('cat ')) {
      const parts = trimmed.split(' ');
      const fileArg = parts[parts.length - 1];
      const resolved = resolvePath(cwd, fileArg);
      readFilesRef.current.add(resolved);
    }
    if (trimmed.startsWith('./') || trimmed.includes('.sh')) {
      const parts = trimmed.split(' ');
      const execArg = parts[0].replace('sudo ', '');
      const resolved = resolvePath(cwd, execArg);
      executedFilesRef.current.add(resolved);
    }

    // Execute through stateful VFS
    const res = executeVfsCommand(trimmed, cwd, currentUser, vfs);

    // Update terminal logs
    const newLogs: TerminalLog[] = [promptEntry];

    if (res.stdout) {
      if (res.stdout.includes('\x1b[2J')) {
        // clear command
        setLogs([]);
        setInputValue('');
        return;
      }
      newLogs.push({
        id: Math.random().toString(),
        type: 'stdout',
        text: res.stdout
      });
    }

    if (res.stderr) {
      newLogs.push({
        id: Math.random().toString(),
        type: 'stderr',
        text: res.stderr
      });
    }

    setLogs((prev) => [...prev, ...newLogs]);

    // Handle cwd/user updates
    let updatedCwd = cwd;
    let updatedUser = currentUser;
    if (res.newCwd) {
      updatedCwd = res.newCwd;
      setCwd(res.newCwd);
    }
    if (res.newUser) {
      updatedUser = res.newUser;
      setCurrentUser(res.newUser);
    }

    // Evaluate Mission Success
    const checkCtx: MissionCheckContext = {
      lastCommand: trimmed,
      lastArgs: trimmed.split(' ').slice(1),
      lastOutput: res.stdout || res.stderr,
      lastExitCode: res.exitCode,
      currentDir: updatedCwd,
      currentUser: updatedUser,
      visitedDirs: visitedDirsRef.current,
      readFiles: readFilesRef.current,
      executedFiles: executedFilesRef.current,
      vfs
    };

    if (currentMission && !completedIds.has(currentMission.id)) {
      const isPassed = currentMission.checkCondition(checkCtx);
      if (isPassed) {
        setCompletedIds((prev) => new Set(prev).add(currentMission.id));
        setSuccessMission(currentMission);
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    setInputValue('');
  };

  // Keyboard controls: Enter, Up/Down arrow for history, Tab for auto-completion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand(inputValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextPtr = historyPointer === -1 ? cmdHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPtr);
      setInputValue(cmdHistory[nextPtr]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPtr = historyPointer + 1;
      if (nextPtr >= cmdHistory.length) {
        setHistoryPointer(-1);
        setInputValue('');
      } else {
        setHistoryPointer(nextPtr);
        setInputValue(cmdHistory[nextPtr]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentNode = getNodeAtPath(vfs, cwd);
      if (currentNode && currentNode.children) {
        const parts = inputValue.split(' ');
        const lastWord = parts[parts.length - 1];
        const candidate = Object.keys(currentNode.children).find((name) => name.startsWith(lastWord));
        if (candidate) {
          parts[parts.length - 1] = candidate;
          setInputValue(parts.join(' '));
        }
      }
    }
  };

  // Quick fill input from chips or cheatsheet
  const handlePasteCmd = (cmd: string) => {
    setInputValue(cmd);
    inputRef.current?.focus();
  };

  // Advance to next mission
  const handleNextMission = () => {
    setSuccessMission(null);
    if (currentMissionIdx < missions.length - 1) {
      setCurrentMissionIdx((prev) => prev + 1);
    }
  };

  // Reset entire machine
  const handleResetMachine = () => {
    setVfs(createInitialVfs());
    setCwd('/home/x');
    setCurrentUser('x');
    setCurrentMissionIdx(0);
    setCompletedIds(new Set());
    setLogs([
      {
        id: 'sys-reset',
        type: 'system',
        text: `* Sistem sıfırlandı. /home/x çalışma dizinine geri dönüldü.`
      }
    ]);
    visitedDirsRef.current = new Set(['/home/x']);
    readFilesRef.current = new Set();
    executedFilesRef.current = new Set();
  };

  return (
    <div className="lm-container" onClick={handleFocusTerminal}>
      {/* 1. Header Bar: Brand + Machine Selector + Status & Controls */}
      <header className="lm-header">
        <div className="lm-brand-group">
          <div className="lm-brand-badge">
            <TerminalIcon size={18} color="#00ff9d" />
            <span>SİBERADAM // <span style={{ color: '#00ff9d' }}>LİNUX SİSTEMLERİ</span></span>
          </div>

          {/* Machine Selector Trigger */}
          <div
            className="lm-machine-selector"
            onClick={(e) => {
              e.stopPropagation();
              setIsMachineDropdownOpen(!isMachineDropdownOpen);
            }}
            title="Hedef Linux Makinesini Değiştir"
          >
            <Server size={14} color="#00ff9d" />
            <span style={{ fontSize: '11.5px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {selectedMachine.title}
            </span>
            <ChevronDown size={13} color="#94a3b8" />
          </div>
        </div>

        {/* Machine Selector Dropdown Flyout */}
        {isMachineDropdownOpen && (
          <div className="lm-machine-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', fontFamily: 'var(--font-mono)', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              LİNUX SİSTEMLERİ HEDEF LİSTESİ ({machines.length})
            </div>

            {machines.map((m) => {
              const isSelected = m.id === selectedMachineId;
              const isLocked = m.status === 'coming_soon';
              return (
                <div
                  key={m.id}
                  className={`lm-machine-item ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                  onClick={() => {
                    if (!isLocked) {
                      setSelectedMachineId(m.id);
                      setIsMachineDropdownOpen(false);
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#00ff9d', fontWeight: 700 }}>
                        MAKİNE {m.number}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                        {m.title}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '9.5px',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(0,255,157,0.15)',
                      color: isLocked ? '#94a3b8' : '#00ff9d',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {isLocked ? 'YAKINDA' : 'AKTİF'}
                    </span>
                  </div>

                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                    {m.description}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', fontSize: '9.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    <span>OS: {m.os}</span>
                    <span>•</span>
                    <span>Zorluk: {m.difficulty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Right Header Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="lm-status-pill" title={engineMsg}>
            <Cpu size={12} />
            <span>{engineMode === 'cheerpx' ? 'CHEERPX x86 JIT' : 'POSIX WASM CORE'}</span>
          </div>

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#fbbf24', fontWeight: 800 }}>
            GÖREV {String(currentMissionIdx + 1).padStart(2, '0')} / {String(missions.length).padStart(2, '0')}
          </span>

          <button
            onClick={handleResetMachine}
            title="Makineyi İlk Durumuna Sıfırla"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#94a3b8',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} />
            <span>Sıfırla</span>
          </button>

          {onBackToMain && (
            <button
              onClick={onBackToMain}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Ana Ekrana Dön
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Two-Column Studio Layout */}
      <div className="lm-workspace">
        {/* Left Panel: Rich Guidance, Detailed Briefing & Educational Reference */}
        <aside className="lm-side-panel">
          {/* Tabs: Briefing | Cheatsheet | Machines */}
          <div className="lm-nav-tabs">
            <button
              className={`lm-tab-btn ${activeSideTab === 'briefing' ? 'active' : ''}`}
              onClick={() => setActiveSideTab('briefing')}
            >
              <BookOpen size={13} />
              <span>Görev & Brifing</span>
            </button>

            <button
              className={`lm-tab-btn ${activeSideTab === 'cheatsheet' ? 'active' : ''}`}
              onClick={() => setActiveSideTab('cheatsheet')}
            >
              <FileCode size={13} />
              <span>Komut Kılavuzu</span>
            </button>

            <button
              className={`lm-tab-btn ${activeSideTab === 'machines' ? 'active' : ''}`}
              onClick={() => setActiveSideTab('machines')}
            >
              <Layers size={13} />
              <span>Makineler ({machines.length})</span>
            </button>
          </div>

          {/* Panel Content Based on Selected Tab */}
          <div className="lm-panel-scroll">
            {activeSideTab === 'briefing' && (
              <>
                {/* Story Lore Narrative */}
                <div className="lm-story-banner">
                  <div className="lm-story-header">
                    <Sparkles size={13} color="#fbbf24" />
                    <span>HİKÂYE // {currentMission.sectionTitle}</span>
                  </div>
                  <div className="lm-story-body">
                    "{currentMission.storySnippet}"
                  </div>
                </div>

                {/* Primary Mission Objective Card */}
                <div className="lm-objective-card">
                  <div className="lm-obj-title">
                    {completedIds.has(currentMission.id) ? (
                      <CheckCircle2 size={16} color="#00ff9d" />
                    ) : (
                      <Shield size={16} color="#38bdf8" />
                    )}
                    <span>{currentMission.name}</span>
                  </div>

                  <p className="lm-obj-desc">
                    {currentMission.objective}
                  </p>
                </div>

                {/* Detailed Concept Explanation Box */}
                <div className="lm-concept-card">
                  <div className="lm-concept-title">
                    <Info size={14} color="#00ff9d" />
                    <span>ÖĞRENİLEN LİNUX KAVRAMI</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    {currentMission.learnedConcept}
                  </div>
                  <p className="lm-concept-text">
                    {currentMission.conceptSummary}
                  </p>
                </div>

                {/* Relevant Files in Mission */}
                <div style={{ background: '#090e1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderTree size={12} />
                    <span>İLGİLİ DOSYALAR & HEDEFLER</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {currentMission.relatedFiles.map((f) => (
                      <div
                        key={f}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: '#38bdf8',
                          background: 'rgba(0, 240, 255, 0.05)',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ color: '#00ff9d', fontSize: '10px' }}>▸</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeSideTab === 'cheatsheet' && (
              <div className="lm-cheat-list">
                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                  Aşağıdaki komutlara tıklayarak doğrudan terminale yazdırabilir ve hemen deneyebilirsiniz:
                </div>

                {LINUX_CHEATSHEET.map((item) => (
                  <div key={item.cmd} className="lm-cheat-item">
                    <div className="lm-cheat-cmd-row">
                      <span className="lm-cheat-cmd">{item.usage}</span>
                      <button
                        className="lm-cheat-btn-run"
                        onClick={() => handlePasteCmd(item.example.split('#')[0].trim())}
                        title="Bu komutu terminale yaz"
                      >
                        Terminale Yaz ↗
                      </button>
                    </div>
                    <div className="lm-cheat-desc">{item.desc}</div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      Örnek: {item.example}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSideTab === 'machines' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Platforma eklenecek tüm Linux makineleri bu listeden yönetilir:
                </div>

                {machines.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: m.id === selectedMachineId ? 'rgba(0, 255, 157, 0.08)' : '#090e1c',
                      border: `1px solid ${m.id === selectedMachineId ? '#00ff9d' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                        {m.title}
                      </span>
                      <span style={{
                        fontSize: '9.5px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: m.status === 'active' ? 'rgba(0,255,157,0.15)' : 'rgba(255,255,255,0.08)',
                        color: m.status === 'active' ? '#00ff9d' : '#94a3b8',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {m.status === 'active' ? 'ŞU AN AKTİF' : 'YAKINDA'}
                      </span>
                    </div>

                    <p style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4', margin: '4px 0' }}>
                      {m.description}
                    </p>

                    <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      İşletim Sistemi: {m.os}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Area: Linux Terminal & Active System Inspector */}
        <main className="lm-terminal-column">
          {/* Terminal Inspector Topbar */}
          <div className="lm-term-topbar">
            <div className="lm-term-breadcrumbs">
              <div className="lm-crumb-item">
                <span style={{ color: '#00ff9d' }}>HOST:</span>
                <span>target-station-y</span>
              </div>
              <span>•</span>
              <div className="lm-crumb-item">
                <span style={{ color: '#38bdf8' }}>PATH:</span>
                <span>{cwd}</span>
              </div>
              <span>•</span>
              <div className="lm-crumb-item">
                <span style={{ color: currentUser === 'root' ? '#ef4444' : '#fbbf24' }}>USER:</span>
                <span>{currentUser} (UID {currentUser === 'root' ? '0' : '1000'})</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#22c55e' }}>● CANLI KABUK</span>
              <button
                onClick={() => handleRunCommand('clear')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                title="Ekranı Temizle (Ctrl+L)"
              >
                clear
              </button>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div className="lm-terminal-wrapper">
            {logs.map((log) => {
              if (log.type === 'system') {
                return (
                  <div key={log.id} className="lm-log-line" style={{ color: '#38bdf8', marginBottom: '8px' }}>
                    {log.text}
                  </div>
                );
              }
              if (log.type === 'prompt') {
                const isRoot = log.user === 'root';
                return (
                  <div key={log.id} className="lm-log-line">
                    <span className={isRoot ? 'lm-prompt-root' : 'lm-prompt-line'}>
                      {log.user}@target-station-y:{log.cwd === '/home/x' ? '~' : log.cwd}{isRoot ? '#' : '$'}
                    </span>{' '}
                    <span style={{ color: '#fff' }}>{log.text}</span>
                  </div>
                );
              }
              if (log.type === 'stderr') {
                return (
                  <div key={log.id} className="lm-log-line lm-log-stderr">
                    {log.text}
                  </div>
                );
              }
              return (
                <div key={log.id} className="lm-log-line lm-log-stdout">
                  {log.text}
                </div>
              );
            })}

            {/* Current Active Command Input */}
            <div className="lm-input-row">
              <span className={currentUser === 'root' ? 'lm-prompt-root' : 'lm-prompt-line'}>
                {currentUser}@target-station-y:{cwd === '/home/x' ? '~' : cwd}{currentUser === 'root' ? '#' : '$'}
              </span>
              <input
                ref={inputRef}
                type="text"
                className="lm-cli-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>

            <div ref={terminalBottomRef} />
          </div>

          {/* Bottom Fast Action Command Bar */}
          <div className="lm-quick-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                Hızlı Komutlar:
              </span>
              <div className="lm-chip-scroller">
                {[
                  'pwd',
                  'whoami',
                  'uname -a',
                  'ls -la',
                  'grep "PASSPHRASE" /var/log/system_audit.log',
                  'find /home/x -name "*.sh"',
                  'file scripts/unlock.sh',
                  'chmod +x scripts/unlock.sh',
                  'apt',
                  'sudo cat /root/final_message.txt'
                ].map((cmd) => (
                  <button
                    key={cmd}
                    className="lm-cmd-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePasteCmd(cmd);
                    }}
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
              Tab: Tamamla | ↑↓: Geçmiş
            </div>
          </div>
        </main>
      </div>

      {/* 3. Mission Completion Modal */}
      {successMission && (
        <div className="lm-modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="lm-modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00ff9d', fontWeight: 800, fontSize: '16px' }}>
              <Sparkles size={22} color="#00ff9d" />
              <span>GÖREV BAŞARIYLA TAMAMLANDI!</span>
            </div>

            <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>
              {successMission.name}
            </div>

            <div style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.5' }}>
              <strong>Öğrenilen Kavram:</strong> {successMission.learnedConcept}
            </div>

            <div style={{ background: 'rgba(0, 255, 157, 0.08)', border: '1px solid rgba(0, 255, 157, 0.25)', borderRadius: '6px', padding: '12px 14px', fontSize: '12px', lineHeight: '1.6', color: '#e2e8f0' }}>
              {successMission.conceptSummary}
            </div>

            <button
              onClick={handleNextMission}
              style={{
                background: '#00ff9d',
                color: '#000000',
                fontWeight: 800,
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <span>{successMission.nextMissionId ? 'Sonraki Göreve Geç' : 'Tüm Görevleri Tamamladın!'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
