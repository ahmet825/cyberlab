import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Target
} from 'lucide-react';
import { CURRICULUM_TRACKS } from '../../data/curriculum';
import type { LabItem } from '../../types/lab';
import type { UserProfile } from '../../types/user';
import { MissionBriefing } from './MissionBriefing';

interface CurriculumSidebarProps {
  currentLab: LabItem;
  onSelectLab: (lab: LabItem) => void;
  solvedLabIds: Set<string>;
  stageProgress: Record<string, number[]>;
  onToggleStage: (labId: string, stageId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (reason?: string) => void;
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({
  currentLab,
  solvedLabIds,
  stageProgress,
  onToggleStage,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [unlockedHints, setUnlockedHints] = useState<Record<string, number>>({});

  const allLabs = CURRICULUM_TRACKS.flatMap((t) => t.labs);

  const handleUnlockHint = (labId: string, hintIndex: number) => {
    setUnlockedHints((prev) => ({
      ...prev,
      [labId]: Math.max(prev[labId] || 0, hintIndex)
    }));
  };

  const currentTrack = CURRICULUM_TRACKS.find((t) => t.labs.some((l) => l.id === currentLab.id));
  const trackLabs = currentTrack?.labs || allLabs;
  const indexInTrack = trackLabs.findIndex((l) => l.id === currentLab.id);
  const prevLabInChain = indexInTrack > 0 ? trackLabs[indexInTrack - 1] : null;
  const isCurrentSequentialLocked = prevLabInChain !== null && !solvedLabIds.has(prevLabInChain.id);

  if (isCollapsed) {
    return (
      <aside className="w-14 h-full flex flex-col items-center py-3 gap-3.5 bg-slate-900 border-r border-slate-800">
        <button
          onClick={onToggleCollapse}
          title="Görevi ve Brifingi Genişlet"
          className="bg-slate-950 border border-slate-800 text-cyan-400 p-2.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        <div className="w-8 h-px bg-slate-800" />

        <button
          onClick={onToggleCollapse}
          title="Görev & İpucu Brifingi"
          className="p-2.5 rounded-lg cursor-pointer bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition-colors"
        >
          <Target size={20} />
        </button>

        <div className="mt-auto flex flex-col items-center pb-4">
          <span className="[writing-mode:vertical-rl] font-mono text-xs text-cyan-400 tracking-wider font-bold">
            LAB #{allLabs.findIndex((l) => l.id === currentLab.id) + 1}
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside id="tour-sidebar" data-tour="sidebar-briefing" className="w-full h-full flex flex-col bg-slate-900 border-r border-slate-800">
      {/* Header Bar */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Target size={15} />
          </div>
          <div>
            <h2 className="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>GÖREV BRİFİNGİ</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                LAB #{allLabs.findIndex((l) => l.id === currentLab.id) + 1}
              </span>
            </h2>
          </div>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Sol Menüyü Gizle / Daralt"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Body Area: Dedicated Mission Briefing */}
      <div className="p-3.5 flex-1 overflow-y-auto">
        <MissionBriefing
          currentLab={currentLab}
          allLabs={allLabs}
          solvedLabIds={solvedLabIds}
          stageProgress={stageProgress}
          onToggleStage={onToggleStage}
          unlockedHints={unlockedHints}
          onUnlockHint={handleUnlockHint}
          isCurrentSequentialLocked={isCurrentSequentialLocked}
          indexInTrack={indexInTrack}
        />
      </div>
    </aside>
  );
};
