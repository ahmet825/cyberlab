import React from 'react';
import type { HttpRequestLog } from '../../types/lab';

interface NetworkConsoleProps {
  httpLogs: HttpRequestLog[];
  selectedLog: HttpRequestLog | null;
  setSelectedLog: (log: HttpRequestLog | null) => void;
}

export const NetworkConsole: React.FC<NetworkConsoleProps> = ({
  httpLogs,
  selectedLog,
  setSelectedLog
}) => {
  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="p-3 px-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <span className="font-mono text-xs sm:text-sm text-slate-300 font-bold uppercase tracking-wider">
          Gerçek Zamanlı HTTP Network Denetleyicisi
        </span>
        <span className="text-xs text-slate-400 font-mono font-bold">
          {httpLogs.length} İstek Kaydedildi
        </span>
      </div>

      <div className={`flex-1 grid ${selectedLog ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} overflow-hidden`}>
        {/* Request List */}
        <div className={`overflow-y-auto ${selectedLog ? 'border-r border-slate-800' : ''}`}>
          {httpLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Henüz bir HTTP isteği yakalanmadı. Sayfada işlem yapın veya URL barından yeni bir sayfaya gidin.
            </div>
          ) : (
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-left">
                  <th className="p-2 px-3 text-slate-400 font-bold">Metot</th>
                  <th className="p-2 px-3 text-slate-400 font-bold">İstek URL</th>
                  <th className="p-2 px-3 text-slate-400 font-bold">Durum Kodu</th>
                  <th className="p-2 px-3 text-slate-400 font-bold">Süre</th>
                </tr>
              </thead>
              <tbody>
                {httpLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  const statusColor =
                    log.responseStatus === 200
                      ? 'text-emerald-400'
                      : log.responseStatus === 401 || log.responseStatus === 403
                      ? 'text-amber-400'
                      : 'text-rose-400';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-500/15' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td
                        className={`p-2 px-3 font-mono font-bold ${
                          log.method === 'POST' ? 'text-amber-400' : 'text-cyan-400'
                        }`}
                      >
                        {log.method}
                      </td>
                      <td className="p-2 px-3 font-mono text-slate-200 max-w-[220px] truncate font-medium">
                        {log.url}
                      </td>
                      <td className={`p-2 px-3 font-mono font-bold ${statusColor}`}>
                        {log.responseStatus}
                      </td>
                      <td className="p-2 px-3 font-mono text-slate-400 text-xs">
                        {log.durationMs}ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Log Details */}
        {selectedLog && (
          <div className="flex flex-col overflow-y-auto bg-slate-950 p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <span className="font-mono text-sm font-bold text-white">İstek & Yanıt Detayı</span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-xs font-mono font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded cursor-pointer"
              >
                Kapat ✕
              </button>
            </div>

            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold block mb-1.5 uppercase">
                İstek Başlıkları (Request Headers):
              </span>
              <pre className="text-xs font-mono bg-slate-900 p-2.5 rounded-md text-slate-200 overflow-x-auto border border-slate-800 leading-relaxed">
                {JSON.stringify(selectedLog.headers, null, 2)}
              </pre>
            </div>

            {selectedLog.body && (
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold block mb-1.5 uppercase">
                  İstek Gövdesi (Payload Body):
                </span>
                <pre className="text-xs font-mono bg-slate-900 p-2.5 rounded-md text-amber-200 overflow-x-auto whitespace-pre-wrap border border-slate-800 leading-relaxed">
                  {selectedLog.body}
                </pre>
              </div>
            )}

            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold block mb-1.5 uppercase">
                Sunucu Yanıtı (Response Body Preview):
              </span>
              <pre className="text-xs font-mono bg-slate-900 p-2.5 rounded-md text-emerald-200 overflow-x-auto max-h-56 whitespace-pre-wrap border border-slate-800 leading-relaxed">
                {selectedLog.responseBody?.slice(0, 1000) || '(Boş Yanıt)'}
                {(selectedLog.responseBody?.length || 0) > 1000 && '\n... [Kısaltıldı]'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
