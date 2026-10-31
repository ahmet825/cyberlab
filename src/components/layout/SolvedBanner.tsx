import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { LabItem } from '../../types/lab';
import type { UserProfile } from '../../types/user';

interface SolvedBannerProps {
  currentLab: LabItem;
  currentUser: UserProfile | null;
  allLabs: LabItem[];
  onOpenAuthModal: (reason: string) => void;
  onGoToNextLab: () => void;
}

export const SolvedBanner: React.FC<SolvedBannerProps> = ({
  currentLab,
  currentUser,
  allLabs,
  onOpenAuthModal,
  onGoToNextLab
}) => {
  const currentIndex = allLabs.findIndex((l) => l.id === currentLab.id);
  const nextLabIndex = currentIndex + 1;
  const hasNextLab = currentIndex < allLabs.length - 1;

  const difficultyLabel =
    currentLab.difficulty === 'Apprentice'
      ? 'Başlangıç'
      : currentLab.difficulty === 'Practitioner'
      ? 'Orta Seviye'
      : 'İleri Seviye';

  return (
    <div className="bg-emerald-950/60 border-b border-emerald-500/40 px-4 py-3 flex items-center justify-between text-sm text-white z-20 flex-wrap gap-3 animate-fade-in backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2.5 font-bold tracking-wide">
        <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
        <span className="text-sm sm:text-base font-semibold">Tebrikler! Güvenlik bulmacasını başarıyla çözdünüz.</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {!currentUser && (
          <button
            type="button"
            onClick={() =>
              onOpenAuthModal('Tebrikler! Çözdüğünüz challenge ilerlemesini kalıcı olarak kaydetmek için ücretsiz hesap açın.')
            }
            className="bg-cyan-500/20 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/30 px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <span>☁️ İlerlemeyi Kaydet</span>
          </button>
        )}
        <span className="text-xs sm:text-sm text-emerald-300 font-mono hidden md:inline-block">
          Zafiyet: <strong>{currentLab.category}</strong> ({difficultyLabel})
        </span>
        <button
          onClick={onGoToNextLab}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-md transition-colors cursor-pointer text-xs sm:text-sm shadow-sm"
        >
          <span>
            {hasNextLab
              ? `Sıradaki Challenge: Challenge-${nextLabIndex + 1}`
              : "Tüm Challenge'lar Tamamlandı (Başa Dön)"}
          </span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
