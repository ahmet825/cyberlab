import React from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Lock,
  Search,
  Code2,
  Database,
  ShieldAlert,
  Bot
} from 'lucide-react';
import type { LabItem, LabTrack } from '../../types/lab';
import type { UserProfile } from '../../types/user';

interface TrackAccordionProps {
  tracks: LabTrack[];
  allLabs: LabItem[];
  currentLab: LabItem;
  solvedLabIds: Set<string>;
  stageProgress: Record<string, number[]>;
  currentUser?: UserProfile | null;
  openTracks: Record<string, boolean>;
  onToggleTrack: (trackId: string) => void;
  onLabItemClick: (lab: LabItem) => void;
}

const getTrackIcon = (iconName: string) => {
  switch (iconName) {
    case 'search':
      return <Search size={16} />;
    case 'code':
      return <Code2 size={16} />;
    case 'database':
      return <Database size={16} />;
    case 'shield-alert':
      return <ShieldAlert size={16} />;
    case 'bot':
      return <Bot size={16} />;
    default:
      return <Code2 size={16} />;
  }
};

export const TrackAccordion: React.FC<TrackAccordionProps> = ({
  tracks,
  allLabs,
  currentLab,
  solvedLabIds,
  stageProgress,
  currentUser,
  openTracks,
  onToggleTrack,
  onLabItemClick
}) => {
  return (
    <div className="flex flex-col gap-3.5">
      {tracks.map((track) => {
        const isOpen = openTracks[track.id] ?? true;
        const solvedInTrack = track.labs.filter((l) => solvedLabIds.has(l.id)).length;

        return (
          <div
            key={track.id}
            className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-sm"
          >
            {/* Track Header */}
            <div
              onClick={() => onToggleTrack(track.id)}
              className="px-3.5 py-3 flex items-center justify-between cursor-pointer bg-slate-900/80 hover:bg-slate-900 transition-colors select-none"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-cyan-400">{getTrackIcon(track.icon)}</span>
                <span className="text-sm font-bold text-white">{track.title}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  className={`font-mono text-xs font-bold ${
                    solvedInTrack === track.labs.length ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {solvedInTrack}/{track.labs.length}
                </span>
                {isOpen ? (
                  <ChevronDown size={16} className="text-slate-400" />
                ) : (
                  <ChevronRight size={16} className="text-slate-400" />
                )}
              </div>
            </div>

            {/* Labs in Track */}
            {isOpen && (
              <div className="flex flex-col divide-y divide-slate-800/50">
                {track.labs.map((lab) => {
                  const isSelected = lab.id === currentLab.id;
                  const isSolved = solvedLabIds.has(lab.id);
                  const globalIndex = allLabs.findIndex((l) => l.id === lab.id);
                  const isFreeLab = globalIndex >= 0 && globalIndex < 4;
                  const isAuthLocked = !currentUser && !isFreeLab;
                  const prevLabInChain = globalIndex > 0 ? allLabs[globalIndex - 1] : null;
                  const isSequentialLocked =
                    prevLabInChain !== null && !solvedLabIds.has(prevLabInChain.id);
                  const isLocked = isAuthLocked || isSequentialLocked;
                  const completedStagesCount = (stageProgress[lab.id] || []).length;

                  return (
                    <div
                      key={lab.id}
                      onClick={() => onLabItemClick(lab)}
                      className={`p-3 flex flex-col gap-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-l-4 border-emerald-400 pl-2.5'
                          : isLocked
                          ? 'bg-slate-950/50 opacity-80 hover:opacity-100 hover:bg-slate-900/40'
                          : 'hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {isSolved ? (
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          ) : isLocked ? (
                            <Lock size={15} className="text-amber-400 shrink-0" />
                          ) : (
                            <Circle size={15} className="text-slate-500 shrink-0" />
                          )}
                          <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
                            #{String(globalIndex + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-sm truncate ${
                              isSelected
                                ? 'font-bold text-white'
                                : isLocked
                                ? 'text-slate-300 font-medium'
                                : 'text-slate-100 font-medium'
                            }`}
                          >
                            {lab.title}
                          </span>
                        </div>

                        {isLocked && (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 font-bold">
                            {isAuthLocked ? 'Giriş Gerekli' : 'Kilitli'}
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center justify-between pl-6 text-xs font-mono text-slate-400">
                        <span>{lab.category}</span>
                        {completedStagesCount > 0 && !isSolved && (
                          <span className="text-cyan-400 font-semibold">
                            {completedStagesCount}/{lab.stages?.length || 3} Aşama
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
