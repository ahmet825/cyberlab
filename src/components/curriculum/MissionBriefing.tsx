import React from 'react';
import {
  Target,
  Sparkles,
  Lock,
  CheckCircle2,
  Circle,
  HelpCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import type { LabItem } from '../../types/lab';
import { getLabSecurityReferences } from '../../data/labReferences';

interface MissionBriefingProps {
  currentLab: LabItem;
  allLabs: LabItem[];
  solvedLabIds: Set<string>;
  stageProgress: Record<string, number[]>;
  onToggleStage: (labId: string, stageId: number) => void;
  unlockedHints: Record<string, number>;
  onUnlockHint: (labId: string, hintIndex: number) => void;
  isCurrentSequentialLocked: boolean;
  indexInTrack: number;
}

export const MissionBriefing: React.FC<MissionBriefingProps> = ({
  currentLab,
  allLabs,
  solvedLabIds,
  stageProgress,
  onToggleStage,
  unlockedHints,
  onUnlockHint,
  isCurrentSequentialLocked,
  indexInTrack
}) => {
  const currentIndex = allLabs.findIndex((l) => l.id === currentLab.id);

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      {/* Active Puzzle Header Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            BULMACA #{String(currentIndex + 1).padStart(2, '0')} // {currentLab.category}
          </span>
          <span className="text-xs font-mono text-slate-400">
            ⏱️ {currentLab.estimatedMinutes} dk
          </span>
        </div>

        {currentIndex === 0 && !solvedLabIds.has(currentLab.id) && (
          <div className="mb-2.5">
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-bold inline-flex items-center gap-1.5 border border-emerald-500/30">
              <Sparkles size={13} />
              ÖNERİLEN BAŞLANGIÇ NOKTASI (Challenge-1)
            </span>
          </div>
        )}

        <h3 className="text-base text-white font-bold mb-2 leading-snug">{currentLab.title}</h3>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
            Hedef URL: <strong className="text-white font-semibold">{currentLab.startingUrl}</strong>
          </span>
        </div>

        {isCurrentSequentialLocked && (
          <div className="mt-3 p-3 bg-rose-500/15 border border-rose-500/40 rounded-lg flex items-center gap-2.5">
            <Lock size={16} className="text-rose-400 shrink-0" />
            <span className="text-xs sm:text-sm text-rose-200 leading-normal">
              Bu görev kilitlidir. Açmak için ortadaki ekrana <strong>Challenge #{indexInTrack}</strong> bayrağını (FLAG) girin.
            </span>
          </div>
        )}
      </div>

      {/* Objective Box */}
      <div className="bg-emerald-950/25 border border-emerald-500/30 rounded-lg p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} className="text-emerald-400" />
          <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wide">
            Laboratuvar Hedefi
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-200">{currentLab.objective}</p>
      </div>

      {/* Multi-Stage Progression Plan */}
      {currentLab.stages && currentLab.stages.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-400 uppercase">
              Adım Adım Görev Planı ({currentLab.stages.length} Aşama)
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Otomatik Kaydedilir
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {currentLab.stages.map((st) => {
              const isCompleted =
                (stageProgress[currentLab.id] || []).includes(st.id) ||
                solvedLabIds.has(currentLab.id);

              return (
                <div
                  key={st.id}
                  onClick={() => onToggleStage(currentLab.id, st.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span
                        className={`text-sm font-bold block ${
                          isCompleted ? 'text-emerald-300 line-through' : 'text-white'
                        }`}
                      >
                        Aşama {st.id}: {st.title}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {st.objective || st.guidance}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hints Accordion */}
      {currentLab.hints && currentLab.hints.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
              <HelpCircle size={15} />
              İpuçları ({currentLab.hints.length})
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {currentLab.hints.map((hint, idx) => {
              const isHintUnlocked = (unlockedHints[currentLab.id] || 0) > idx;

              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm"
                >
                  {isHintUnlocked ? (
                    <div className="text-slate-200 leading-relaxed font-sans space-y-1">
                      <span className="text-amber-400 font-bold block font-mono text-xs">
                        💡 {hint.title}:
                      </span>
                      <p className="text-sm text-slate-100">{hint.content}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono text-xs font-semibold">
                        İpucu #{idx + 1} (Kilitli)
                      </span>
                      <button
                        type="button"
                        onClick={() => onUnlockHint(currentLab.id, idx + 1)}
                        className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded cursor-pointer transition-colors"
                      >
                        İpucunu Aç &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Authoritative Security External Links (OWASP / CWE / PortSwigger) */}
      {(() => {
        const secRefs = getLabSecurityReferences(currentLab.id);
        if (!secRefs.externalLinks.length) return null;
        return (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <BookOpen size={15} />
                Resmi Referanslar &amp; Standartlar
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                OWASP / CWE
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {secRefs.externalLinks.map((ext, idx) => (
                <a
                  key={idx}
                  href={ext.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-xs transition-colors group flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400 block">
                      [{ext.provider}] {ext.label}
                    </span>
                    <p className="text-[11px] text-slate-400 group-hover:text-slate-200 leading-snug">
                      {ext.description}
                    </p>
                  </div>
                  <ExternalLink size={12} className="text-slate-400 group-hover:text-amber-400 shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
