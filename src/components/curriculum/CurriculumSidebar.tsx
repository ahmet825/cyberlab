import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Target,
  BookOpen,
  Search,
  Code2,
  Database,
  ShieldAlert,
  Bot,
  ArrowLeft,
  ArrowRight,
  Compass,
  Sparkles,
  Lock
} from 'lucide-react';
import { CURRICULUM_TRACKS } from '../../data/curriculum';
import type { LabItem } from '../../types/lab';
import type { UserProfile } from '../../types/user';

interface CurriculumSidebarProps {
  currentLab: LabItem;
  onSelectLab: (lab: LabItem) => void;
  solvedLabIds: Set<string>;
  stageProgress: Record<string, number[]>;
  onToggleStage: (labId: string, stageId: number) => void;
  onGoToNextLab?: () => void;
  onGoToPrevLab?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (reason?: string) => void;
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({
  currentLab,
  onSelectLab,
  solvedLabIds,
  stageProgress,
  onToggleStage,
  onGoToNextLab,
  onGoToPrevLab,
  isCollapsed = false,
  onToggleCollapse,
  currentUser,
  onOpenAuthModal
}) => {
  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>({
    'track-recon-entry': true,
    'track-client-state': true,
    'track-vault-auth': true,
    'track-deep-exploit': true,
    'track-recon': true,
    'track-xss': true,
    'track-sqli': true,
    'track-auth-api': true,
    'track-ai-workflow': true
  });
  const [activeTab, setActiveTab] = useState<'curriculum' | 'briefing'>('briefing');
  const [unlockedHints, setUnlockedHints] = useState<Record<string, number>>({});

  const allLabs = CURRICULUM_TRACKS.flatMap((t) => t.labs);
  const firstUnsolvedLab = allLabs.find((l) => !solvedLabIds.has(l.id)) || allLabs[0];

  const toggleTrack = (trackId: string) => {
    setOpenTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search size={14} />;
      case 'Code2': return <Code2 size={14} />;
      case 'Database': return <Database size={14} />;
      case 'ShieldAlert': return <ShieldAlert size={14} />;
      case 'Bot': return <Bot size={14} />;
      default: return <BookOpen size={14} />;
    }
  };

  const currentHintLevel = unlockedHints[currentLab.id] || 1;

  const unlockNextHint = () => {
    setUnlockedHints((prev) => ({
      ...prev,
      [currentLab.id]: Math.min((prev[currentLab.id] || 1) + 1, currentLab.hints.length)
    }));
  };

  const handleLabItemClick = (lab: LabItem) => {
    const labIndex = allLabs.findIndex((l) => l.id === lab.id);
    const isFreeLab = labIndex >= 0 && labIndex < 4;
    // İlk 4 challenge herkese açık, sonrası için giriş gerekir
    if (!currentUser && !isFreeLab) {
      onOpenAuthModal?.(`"${lab.title}" laboratuvarına erişmek ve ilerlemenizi kaydetmek için lütfen giriş yapın. (İlk 4 challenge herkese açıktır).`);
      return;
    }
    onSelectLab(lab);
    // Öğrencinin kaybolmaması için doğrudan görev & ipucu paneline geç
    setActiveTab('briefing');
  };

  if (isCollapsed) {
    return (
      <aside
        className="panel"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 0',
          gap: '12px',
          background: 'var(--bg-card)'
        }}
      >
        <button
          onClick={onToggleCollapse}
          title="Menüyü Genişlet (Görevi & Müfredatı Göster)"
          style={{
            background: 'var(--bg-darker)',
            border: '1px solid var(--border-medium)',
            color: 'var(--accent-cyan)',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronRight size={16} />
        </button>

        <div style={{ width: '28px', height: '1px', background: 'var(--border-subtle)' }} />

        <button
          onClick={() => {
            setActiveTab('briefing');
            onToggleCollapse?.();
          }}
          title="Görev & İpucu Paneli"
          style={{
            background: activeTab === 'briefing' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
            border: 'none',
            color: activeTab === 'briefing' ? 'var(--accent-cyan)' : 'var(--text-dim)',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Target size={18} />
        </button>

        <button
          onClick={() => {
            setActiveTab('curriculum');
            onToggleCollapse?.();
          }}
          title="Müfredat & Bulmaca Listesi"
          style={{
            background: activeTab === 'curriculum' ? 'rgba(0, 255, 157, 0.15)' : 'transparent',
            border: 'none',
            color: activeTab === 'curriculum' ? 'var(--accent-green)' : 'var(--text-dim)',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={18} />
        </button>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingBottom: '12px' }}>
          <span
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--accent-cyan)',
              letterSpacing: '1px',
              fontWeight: 700
            }}
          >
            LAB #{allLabs.findIndex((l) => l.id === currentLab.id) + 1}
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside id="tour-sidebar" data-tour="sidebar-briefing" className="panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header Tabs */}
      <div className="panel-header" style={{ padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
          <button
            onClick={() => setActiveTab('briefing')}
            style={{
              flex: 1,
              background: activeTab === 'briefing' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'briefing' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === 'briefing' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              padding: '10px 4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Target size={13} />
            <span>GÖREV & İPUCU</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            style={{
              flex: 1,
              background: activeTab === 'curriculum' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'curriculum' ? 'var(--accent-green)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === 'curriculum' ? '2px solid var(--accent-green)' : '2px solid transparent',
              padding: '10px 4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={13} />
            <span>MÜFREDAT ({solvedLabIds.size}/{allLabs.length})</span>
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Sol Menüyü Gizle / Daralt"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="panel-body" style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'curriculum' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Guide box on curriculum list */}
            {solvedLabIds.size === 0 && (
              <div style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid var(--accent-cyan)', padding: '10px 12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '11px', fontWeight: 700 }}>
                  <Compass size={13} />
                  <span>ÖNERİLEN BAŞLANGIÇ</span>
                </div>
                <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.4 }}>
                  Laboratuvara yeni başladıysanız doğrudan <strong>Puzzle 1.1 (Recon & Headers)</strong> ile başlayın.
                </p>
                <button
                  onClick={() => handleLabItemClick(allLabs[0])}
                  style={{
                    marginTop: '8px',
                    background: 'var(--accent-cyan)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Puzzle 1.1'i Başlat &rarr;
                </button>
              </div>
            )}

            {CURRICULUM_TRACKS.map((track) => {
              const isOpen = openTracks[track.id] ?? true;
              const solvedInTrack = track.labs.filter((l) => solvedLabIds.has(l.id)).length;

              return (
                <div
                  key={track.id}
                  style={{
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Track Accordion Title */}
                  <div
                    onClick={() => toggleTrack(track.id)}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>{getTrackIcon(track.icon)}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                        {track.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: solvedInTrack === track.labs.length ? 'var(--accent-green)' : 'var(--text-dim)'
                      }}>
                        {solvedInTrack}/{track.labs.length}
                      </span>
                      {isOpen ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Labs List */}
                  {isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {track.labs.map((lab) => {
                        const isSelected = lab.id === currentLab.id;
                        const isSolved = solvedLabIds.has(lab.id);
                        const globalIndex = allLabs.findIndex((l) => l.id === lab.id);
                        const isFreeLab = globalIndex >= 0 && globalIndex < 4;
                        const isLocked = !currentUser && !isFreeLab;
                        const isRecommendedStart = globalIndex === 0 && !isSolved;
                        const isNextTask = lab.id === firstUnsolvedLab.id && !isRecommendedStart && !isLocked;
                        const completedStagesCount = (stageProgress[lab.id] || []).length;

                        const difficultyTurkish = 
                          lab.difficulty === 'Apprentice' ? 'Başlangıç' :
                          lab.difficulty === 'Practitioner' ? 'Orta Seviye' : 'İleri Seviye';

                        return (
                          <div
                            key={lab.id}
                            onClick={() => handleLabItemClick(lab)}
                            style={{
                              padding: '10px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(0, 255, 157, 0.08)' : isLocked ? 'rgba(15, 23, 42, 0.3)' : 'transparent',
                              borderLeft: isSelected ? '3px solid var(--accent-green)' : '3px solid transparent',
                              opacity: isLocked ? 0.75 : 1,
                              transition: 'all 0.15s ease',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                {isSolved ? (
                                  <CheckCircle2 size={13} color="var(--accent-green)" style={{ flexShrink: 0 }} />
                                ) : isLocked ? (
                                  <Lock size={13} color="var(--accent-orange)" style={{ flexShrink: 0 }} />
                                ) : (
                                  <Circle size={13} color="var(--text-dim)" style={{ flexShrink: 0 }} />
                                )}
                                <span style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  color: isSelected ? 'var(--accent-green)' : isLocked ? 'var(--accent-orange)' : 'var(--text-dim)',
                                  flexShrink: 0
                                }}>
                                  #{String(globalIndex + 1).padStart(2, '0')}
                                </span>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: isSelected ? 700 : 500,
                                    color: isSelected ? '#fff' : isLocked ? '#94a3b8' : 'var(--text-muted)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {lab.title}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {isLocked && (
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '8px',
                                      padding: '1px 5px',
                                      borderRadius: '3px',
                                      background: 'rgba(245, 158, 11, 0.15)',
                                      color: 'var(--accent-orange)',
                                      fontWeight: 700
                                    }}
                                  >
                                    GİRİŞ GEREKLİ
                                  </span>
                                )}
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '9px',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    flexShrink: 0,
                                    background: lab.difficulty === 'Apprentice' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: lab.difficulty === 'Apprentice' ? 'var(--accent-cyan)' : 'var(--accent-orange)'
                                  }}
                                >
                                  {difficultyTurkish}
                                </span>
                              </div>
                            </div>

                            {/* Status & Guidance Sub-pills */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '21px' }}>
                              {isRecommendedStart && (
                                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', background: 'rgba(0, 255, 157, 0.15)', color: 'var(--accent-green)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                                  🚀 BAŞLANGIÇ (AÇIK)
                                </span>
                              )}
                              {!isRecommendedStart && isFreeLab && !isSolved && (
                                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', background: 'rgba(0, 240, 255, 0.12)', color: 'var(--accent-cyan)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                                  🔓 ÜCRETSİZ (AÇIK)
                                </span>
                              )}
                              {isLocked ? (
                                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)' }}>
                                  🔒 Erişmek için giriş yapın
                                </span>
                              ) : (
                                <>
                                  {isNextTask && (
                                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                                      🎯 SIRADAKİ GÖREV
                                    </span>
                                  )}
                                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                                    {isSolved ? '✓ Çözüldü' : `${completedStagesCount}/${lab.stages.length} Adım Kaydedildi`}
                                  </span>
                                </>
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
        ) : (
          /* Active Lab Briefing & Step-by-Step Task Tracker */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Active Puzzle Header Card */}
            <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  BULMACA #{String(allLabs.findIndex((l) => l.id === currentLab.id) + 1).padStart(2, '0')} // {currentLab.category}
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                  Tahmini Süre: {currentLab.estimatedMinutes} dk
                </span>
              </div>

              {allLabs.findIndex((l) => l.id === currentLab.id) === 0 && !solvedLabIds.has(currentLab.id) && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', background: 'rgba(0, 255, 157, 0.2)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={10} />
                    ÖNERİLEN İLK BULMACA (BAŞLANGIÇ NOKTASI)
                  </span>
                </div>
              )}

              <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
                {currentLab.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', background: 'rgba(0, 255, 157, 0.1)', padding: '2px 6px', borderRadius: '3px' }}>
                  Hedef URL: {currentLab.startingUrl}
                </span>
              </div>
            </div>

            {/* Objective Box */}
            <div
              style={{
                background: 'rgba(0, 255, 157, 0.05)',
                border: '1px solid var(--border-accent)',
                borderRadius: '6px',
                padding: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Target size={14} color="var(--accent-green)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase' }}>
                  Laboratuvar Hedefi
                </span>
              </div>
              <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#e2e8f0' }}>
                {currentLab.objective}
              </p>
            </div>

            {/* Multi-Stage Progression Plan with Checkboxes */}
            {currentLab.stages && currentLab.stages.length > 0 && (
              <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    Adım Adım Görev Planı ({currentLab.stages.length} Aşama)
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                    İlerlemeniz Otomatik Kaydedilir
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentLab.stages.map((st) => {
                    const isCompleted = (stageProgress[currentLab.id] || []).includes(st.id) || solvedLabIds.has(currentLab.id);

                    return (
                      <div
                        key={st.id}
                        onClick={() => onToggleStage(currentLab.id, st.id)}
                        style={{
                          background: isCompleted ? 'rgba(0, 255, 157, 0.05)' : 'var(--bg-darker)',
                          padding: '10px',
                          borderRadius: '6px',
                          border: `1px solid ${isCompleted ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.06)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isCompleted ? 'var(--accent-green)' : 'var(--text-dim)',
                              cursor: 'pointer',
                              padding: '2px',
                              marginTop: '1px'
                            }}
                          >
                            {isCompleted ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                          </button>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontSize: '10px',
                                fontFamily: 'var(--font-mono)',
                                background: isCompleted ? 'rgba(0, 255, 157, 0.15)' : 'rgba(0, 240, 255, 0.1)',
                                color: isCompleted ? 'var(--accent-green)' : 'var(--accent-cyan)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontWeight: 700
                              }}>
                                Aşama {st.id}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: isCompleted ? '#86efac' : '#fff' }}>
                                {st.title.split(':')[1] || st.title}
                              </span>
                            </div>

                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                              {st.objective}
                            </p>

                            <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px', fontSize: '11px', color: '#cbd5e1' }}>
                              <strong style={{ color: 'var(--accent-cyan)' }}>Talimat:</strong> {st.guidance}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Classified Mission Dossier & Espionage Story */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 29, 0.95) 100%)',
              padding: '14px',
              borderRadius: '6px',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.5px' }}>
                  📁 OPERASYON BRİFİNGİ & İSTİHBARAT
                </span>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1px 6px', borderRadius: '3px', fontWeight: 700 }}>
                  GİZLİLİK: DERECE-1
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                {currentLab.description}
              </p>
            </div>

            {/* Progressive Hints Accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-orange)' }}>
                  KADEMELİ İPUÇLARI ({currentHintLevel}/{currentLab.hints.length})
                </span>
                {currentHintLevel < currentLab.hints.length && (
                  <button
                    onClick={unlockNextHint}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-orange)',
                      color: 'var(--accent-orange)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer'
                    }}
                  >
                    + Sonraki İpucunu Aç
                  </button>
                )}
              </div>

              {currentLab.hints.slice(0, currentHintLevel).map((hint, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '6px',
                    padding: '10px 12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <HelpCircle size={12} color="var(--accent-orange)" />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-orange)' }}>
                      İpucu {hint.level}: {hint.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {hint.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Quick Navigation */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              {onGoToPrevLab && (
                <button
                  onClick={onGoToPrevLab}
                  className="action-btn"
                  style={{ flex: 1, padding: '8px', fontSize: '11px', justifyContent: 'center' }}
                >
                  <ArrowLeft size={13} />
                  <span>Önceki Challenge</span>
                </button>
              )}
              {onGoToNextLab && (
                <button
                  onClick={onGoToNextLab}
                  className="btn-cyber-primary"
                  style={{ flex: 1, padding: '8px', fontSize: '11px', justifyContent: 'center' }}
                >
                  <span>Sonraki Challenge</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </aside>
  );
};
