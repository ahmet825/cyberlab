import React from 'react';
import { Send } from 'lucide-react';

interface RepeaterPanelProps {
  rawRequestText: string;
  setRawRequestText: (val: string) => void;
  rawResponseText: string;
  isSendingRaw: boolean;
  onSendRepeaterRaw: () => void;
}

export const RepeaterPanel: React.FC<RepeaterPanelProps> = ({
  rawRequestText,
  setRawRequestText,
  rawResponseText,
  isSendingRaw,
  onSendRepeaterRaw
}) => {
  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Top Bar */}
      <div className="p-3 px-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-sm font-bold text-amber-400">
            HTTP REPEATER // RAW PROTOCOL MANIPULATOR
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">
            (Header Spoofing, Method Override, JWT ve SQLi için raw HTTP isteği düzenleyin)
          </span>
        </div>
        <button
          type="button"
          onClick={onSendRepeaterRaw}
          disabled={isSendingRaw}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs sm:text-sm font-bold px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
        >
          <Send size={15} />
          <span>{isSendingRaw ? 'Gönderiliyor...' : 'İsteği Gönder (Send)'}</span>
        </button>
      </div>

      {/* Grid editor */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Request Column */}
        <div className="border-b md:border-b-0 md:border-r border-slate-800 flex flex-col">
          <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            RAW HTTP REQUEST (İstek)
          </div>
          <textarea
            value={rawRequestText}
            onChange={(e) => setRawRequestText(e.target.value)}
            className="flex-1 bg-slate-950 text-slate-100 border-none p-3.5 font-mono text-sm leading-relaxed resize-none outline-none focus:ring-0"
            spellCheck={false}
          />
        </div>

        {/* Response Column */}
        <div className="flex flex-col">
          <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            RAW HTTP RESPONSE (Sunucu Yanıtı)
          </div>
          <pre className="flex-1 m-0 bg-slate-950 text-emerald-200 p-3.5 font-mono text-sm leading-relaxed overflow-auto whitespace-pre-wrap select-text">
            {rawResponseText || 'İsteği göndermek için sağ üstteki "İsteği Gönder" butonuna basın.'}
          </pre>
        </div>
      </div>
    </div>
  );
};

