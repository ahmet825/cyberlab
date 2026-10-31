import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Globe,
  Network,
  FileCode,
  Cookie as CookieIcon,
  Flag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export type BrowserTab = 'view' | 'repeater' | 'network' | 'source' | 'cookies';

interface BrowserAddressBarProps {
  inputUrl: string;
  setInputUrl: (url: string) => void;
  onSubmitUrl: (e: React.FormEvent) => void;
  onRefresh: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
  isLoading: boolean;
  activeTab: BrowserTab;
  setActiveTab: (tab: BrowserTab) => void;
  cookiesCount: number;
  httpLogsCount: number;
  flagInput: string;
  setFlagInput: (val: string) => void;
  onVerifyFlag: (e: React.FormEvent) => void;
  flagFeedback: { success: boolean; msg: string } | null;
}

export const BrowserAddressBar: React.FC<BrowserAddressBarProps> = ({
  inputUrl,
  setInputUrl,
  onSubmitUrl,
  onRefresh,
  canGoBack = false,
  canGoForward = false,
  onGoBack,
  onGoForward,
  isLoading,
  activeTab,
  setActiveTab,
  cookiesCount,
  httpLogsCount,
  flagInput,
  setFlagInput,
  onVerifyFlag,
  flagFeedback
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex flex-col gap-2.5 shadow-sm">
      {/* Top Address & Navigation Row */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Navigation Arrows & Refresh */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onGoBack}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:text-slate-600 cursor-pointer disabled:cursor-default"
            title="Geri"
            disabled={!canGoBack}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onGoForward}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:text-slate-600 cursor-pointer disabled:cursor-default"
            title="İleri"
            disabled={!canGoForward}
          >
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className={`p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 cursor-pointer ${
              isLoading ? 'animate-spin text-emerald-400' : ''
            }`}
            title="Yenile"
          >
            <RotateCw size={16} />
          </button>
        </div>

        {/* Address Input Bar */}
        <form onSubmit={onSubmitUrl} className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 gap-2.5 focus-within:border-cyan-500/60 transition-colors">
          <Lock size={14} className="text-emerald-400 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-transparent border-none text-sm font-mono text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="http://target-app.local/..."
          />
        </form>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'view'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Canlı Hedef Uygulama Görünümü"
          >
            <Globe size={14} />
            <span>Görünüm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('repeater')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'repeater'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Burp Suite Benzeri HTTP Repeater"
          >
            <RotateCw size={14} />
            <span>Repeater</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'network'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Ağ Trafiği ve DevTools İstekleri"
          >
            <Network size={14} />
            <span>Ağ ({httpLogsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cookies')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'cookies'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400 shadow-[0_0_10px_rgba(0,255,157,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Çerezler ve Oturum Bilgileri"
          >
            <CookieIcon size={14} />
            <span>Çerez ({cookiesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('source')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'source'
                ? 'bg-blue-500/20 text-blue-200 border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Sayfa HTML Kaynak Kodu"
          >
            <FileCode size={14} />
            <span>Kaynak</span>
          </button>
        </div>
      </div>

      {/* Flag Verification Strip */}
      <div className="flex items-center gap-2.5 bg-slate-950/90 border border-slate-800 rounded-md px-3 py-1.5">
        <div className="flex items-center gap-2 shrink-0">
          <Flag size={14} className="text-cyan-400" />
          <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">BAYRAK (FLAG):</span>
        </div>

        <form onSubmit={onVerifyFlag} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="FLAG{...} yapıştırın"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs sm:text-sm font-mono text-white outline-none focus:border-cyan-500/60"
          />
          <button
            type="submit"
            className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-3.5 py-1 rounded text-xs sm:text-sm font-mono font-bold cursor-pointer transition-colors"
          >
            Doğrula
          </button>
        </form>

        {flagFeedback && (
          <div
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-mono font-semibold ${
              flagFeedback.success ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {flagFeedback.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span>{flagFeedback.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
