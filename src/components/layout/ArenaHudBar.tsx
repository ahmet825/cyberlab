import React from 'react';
import {
  Shield,
  Database,
  Terminal,
  Bot,
  Settings as SettingsIcon,
  Lock
} from 'lucide-react';
import type { LabItem } from '../../types/lab';
import type { UserProfile } from '../../types/user';

interface ArenaHudBarProps {
  currentLab: LabItem;
  allLabs: LabItem[];
  solvedLabIds: Set<string>;
  currentUser: UserProfile | null;
  activeRightTab: 'ai' | 'terminal';
  setActiveRightTab: (tab: 'ai' | 'terminal') => void;
  isTerminalExpanded: boolean;
  setIsTerminalExpanded: (fn: (prev: boolean) => boolean) => void;
  quickFlagInput: string;
  setQuickFlagInput: (val: string) => void;
  quickFlagStatus: {
    type: 'idle' | 'success' | 'error' | 'already_solved';
    message: string;
  };
  onFlagSubmit: (flag: string) => void;
  onNavigateView: (view: 'landing' | 'hotel-breach' | 'arena') => void;
  onOpenSettings: () => void;
  onOpenAuthModal: (reason?: string) => void;
  onSignOut: () => void;
}

export const ArenaHudBar: React.FC<ArenaHudBarProps> = ({
  currentLab,
  allLabs,
  solvedLabIds,
  currentUser,
  activeRightTab,
  setActiveRightTab,
  isTerminalExpanded,
  setIsTerminalExpanded,
  quickFlagInput,
  setQuickFlagInput,
  quickFlagStatus,
  onFlagSubmit,
  onNavigateView,
  onOpenSettings,
  onOpenAuthModal,
  onSignOut
}) => {
  const isLlmActive = currentLab.trackId === 'track-llm-security';
  const webLabs = allLabs.filter((l) => l.trackId !== 'track-llm-security');
  const llmLabs = allLabs.filter((l) => l.trackId === 'track-llm-security');
  const activeCategoryList = isLlmActive ? llmLabs : webLabs;
  const activeCategoryIndex = activeCategoryList.findIndex((l) => l.id === currentLab.id);

  return (
    <header className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3 flex-wrap shadow-sm">
      {/* Brand & Lab Overview */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => onNavigateView('landing')}
          className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 px-3.5 py-1.5 rounded-md font-mono text-xs sm:text-sm font-bold cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,157,0.2)] transition-colors"
          title="Ana Sayfaya Dön ve Tüm Labları Görüntüle"
        >
          <span>&larr; ANA SAYFAYA DÖN</span>
        </button>

        <div className="flex items-center gap-2 pr-2.5 border-r border-slate-800">
          <Shield size={18} className="text-emerald-400" />
          <span className="font-display font-black text-sm sm:text-base text-white tracking-wider">
            SİBER<span className="text-emerald-400">ADAM</span>
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30"
            title="RxDB Çevrimdışı Reaktif Veritabanı Aktif"
          >
            <Database size={11} />
            <span>RxDB</span>
          </span>
        </div>

        {/* Active Lab Number & Title */}
        <div className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
            {isLlmActive ? 'LLM' : 'SIRA'}
          </span>
          <span
            className={`text-xs sm:text-sm font-extrabold font-mono ${
              isLlmActive ? 'text-purple-300' : 'text-cyan-300'
            }`}
          >
            {isLlmActive
              ? `Lab ${activeCategoryIndex + 1} / ${llmLabs.length}`
              : `Challenge ${activeCategoryIndex + 1} / ${webLabs.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-white max-w-[240px] truncate sm:max-w-none">
            {currentLab.title}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
              currentLab.difficulty === 'Apprentice'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : currentLab.difficulty === 'Practitioner'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {currentLab.difficulty}
          </span>
        </div>
      </div>

      {/* Flag Submission & Controls */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onFlagSubmit(quickFlagInput);
          }}
          className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-800 focus-within:border-cyan-500/50 transition-colors"
        >
          <Lock size={14} className="text-slate-400" />
          <input
            type="text"
            value={quickFlagInput}
            onChange={(e) => setQuickFlagInput(e.target.value)}
            placeholder="FLAG{...}"
            className="bg-transparent border-none text-xs sm:text-sm font-mono text-slate-100 outline-none w-32 placeholder:text-slate-500 focus:w-44 transition-all"
          />
          <button
            type="submit"
            className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            GÖNDER
          </button>
        </form>

        {quickFlagStatus.message && (
          <span
            className={`text-xs font-mono font-semibold max-w-[200px] truncate ${
              quickFlagStatus.type === 'success' || quickFlagStatus.type === 'already_solved'
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
            title={quickFlagStatus.message}
          >
            {quickFlagStatus.message}
          </span>
        )}

        {/* Solved Counter */}
        <div className="bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-xs sm:text-sm font-mono text-slate-300">
          <span className="text-emerald-400 font-bold">{solvedLabIds.size}</span>
          <span className="text-slate-500 font-medium">/{allLabs.length}</span>
        </div>

        {/* Tab / Terminal Toggles */}
        <div className="flex items-center bg-slate-950 rounded-md p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveRightTab('terminal')}
            className={`p-2 rounded transition-colors cursor-pointer ${
              activeRightTab === 'terminal'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Web Terminal (Bash & Curl)"
          >
            <Terminal size={16} />
          </button>
          <button
            type="button"
            onClick={() => setActiveRightTab('ai')}
            className={`p-2 rounded transition-colors cursor-pointer ${
              activeRightTab === 'ai'
                ? 'bg-slate-800 text-purple-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Yapay Zeka Asistanı"
          >
            <Bot size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsTerminalExpanded((prev) => !prev)}
          className="text-slate-400 hover:text-white p-2 rounded-md hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          title={isTerminalExpanded ? 'Paneli Küçült' : 'Paneli Genişlet'}
        >
          <span className="text-xs font-mono font-bold">
            {isTerminalExpanded ? '↙' : '↗'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="text-slate-400 hover:text-white p-2 rounded-md hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          title="Ayarlar & LLM API Anahtarları"
        >
          <SettingsIcon size={16} />
        </button>

        {/* User Account / Auth */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className="text-xs sm:text-sm font-mono text-emerald-400 font-bold max-w-[100px] truncate">
              {currentUser.username}
            </span>
            <button
              onClick={onSignOut}
              className="text-xs text-slate-400 hover:text-rose-400 font-mono transition-colors cursor-pointer"
              title="Çıkış Yap"
            >
              (Çıkış)
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAuthModal()}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-xs sm:text-sm font-mono font-bold px-3 py-1.5 rounded-md cursor-pointer transition-colors"
          >
            Giriş Yap
          </button>
        )}
      </div>
    </header>
  );
};
