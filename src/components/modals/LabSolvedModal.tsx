import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Sparkles,
  X,
  ShieldCheck
} from 'lucide-react';
import type { LabItem } from '../../types/lab';
import { getLabSecurityReferences } from '../../data/labReferences';
import { ALL_SANDBOX_LABS } from '../../data/curriculum';

interface LabSolvedModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: LabItem | null;
  flag: string;
  pointsEarned?: number;
  onBackToLanding?: () => void;
}

export const LabSolvedModal: React.FC<LabSolvedModalProps> = ({
  isOpen,
  onClose,
  lab,
  flag,
  pointsEarned = 50,
  onBackToLanding
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lab) return null;

  const refData = getLabSecurityReferences(lab.id);

  // Find related internal labs (for informational context)
  const relatedLabs: LabItem[] = refData.relatedLabIds
    .map((id) => ALL_SANDBOX_LABS.find((l) => l.id === id))
    .filter((l): l is LabItem => Boolean(l));

  const handleCopyFlag = () => {
    if (flag) {
      navigator.clipboard.writeText(flag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-950 border border-emerald-500/40 rounded-xl shadow-2xl shadow-emerald-500/10 overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 animate-pulse" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          aria-label="Kapat"
        >
          <X size={18} />
        </button>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Victory Hero */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
              <Trophy size={28} className="animate-bounce" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  GÖREV TAMAMLANDI
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  +{pointsEarned} XP PUAN
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {lab.difficulty}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Tebrikler! Hedef Sistem Ele Geçirildi
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                <strong className="text-emerald-400 font-semibold">{lab.title}</strong> zafiyetini başarıyla tespit edip istismar ettiniz.
              </p>
            </div>
          </div>

          {/* Captured FLAG Card */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck size={14} />
                ELE GEÇİRİLEN BAYRAK (CAPTURED FLAG)
              </span>
              <span>Kriptografik İspat</span>
            </div>

            <div className="flex items-center gap-2 bg-black/60 border border-slate-800 rounded p-2.5">
              <code className="text-xs sm:text-sm font-mono text-emerald-300 flex-1 select-all break-all font-semibold">
                {flag || 'FLAG{TARGET_PWNED_COMPLETED}'}
              </code>
              <button
                type="button"
                onClick={handleCopyFlag}
                className="px-3 py-1.5 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Return to Landing / Hub Primary Action */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onBackToLanding) {
                  onBackToLanding();
                }
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-sm flex items-center justify-center gap-2 transition-transform transform active:scale-95 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Ana Sayfaya Dön (Yeni Görev Seç)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-800 transition-colors cursor-pointer"
            >
              Bu Ekranda Kal
            </button>
          </div>

          {/* Site İçi İlgili Lab Konuları (Bilgilendirme) */}
          {relatedLabs.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                  <Sparkles size={14} />
                  Ana Sayfadan Seçebileceğiniz İlgili Görevler
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Ana Sayfa Üzerinden Erişilebilir
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {relatedLabs.map((relLab) => (
                  <div
                    key={relLab.id}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-mono font-semibold text-cyan-400">
                          {relLab.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {relLab.estimatedMinutes} dk
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white line-clamp-1">
                        {relLab.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                      <span>{relLab.difficulty}</span>
                      <span className="text-emerald-400 font-semibold text-[10px]">
                        Ana Sayfada Mevcut
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statik Dış Kaynaklar (OWASP & PortSwigger) */}
          {refData.externalLinks.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
                <BookOpen size={14} />
                <span>Resmi Zafiyet &amp; Savunma Referansları</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {refData.externalLinks.map((ext, idx) => (
                  <a
                    key={idx}
                    href={ext.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs transition-colors group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 block mb-1">
                        {ext.provider} STANDARDI
                      </span>
                      <p className="text-[11px] text-slate-300 group-hover:text-white line-clamp-2 leading-tight">
                        {ext.label}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 group-hover:text-amber-300 mt-2">
                      Dokümanı Oku <ExternalLink size={10} />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
