import React, { Suspense } from 'react';
import { useArenaState } from './hooks/useArenaState';
import { SolvedBanner } from './components/layout/SolvedBanner';
import { ArenaHudBar } from './components/layout/ArenaHudBar';
import { CurriculumSidebar } from './components/curriculum/CurriculumSidebar';
import { CURRICULUM_TRACKS } from './data/curriculum';
import { verifyLabFlag } from './lib/sandbox/flagVault';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Bot,
  Lock,
  AlertTriangle
} from 'lucide-react';

// Lazy loading heavy views & components (GEMINI.md Rule 3)
const LandingPage = React.lazy(() =>
  import('./components/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const TargetBrowser = React.lazy(() =>
  import('./components/browser/TargetBrowser').then((m) => ({ default: m.TargetBrowser }))
);
const WebTerminal = React.lazy(() =>
  import('./components/terminal/WebTerminal').then((m) => ({ default: m.WebTerminal }))
);
const AiMentorPanel = React.lazy(() =>
  import('./components/ai/AiMentorPanel').then((m) => ({ default: m.AiMentorPanel }))
);
const LegalView = React.lazy(() =>
  import('./components/legal/LegalView').then((m) => ({ default: m.LegalView }))
);
const HotelBreachLab = React.lazy(() =>
  import('./components/hotel/HotelBreachLab').then((m) => ({ default: m.HotelBreachLab }))
);
const PentestLockedGate = React.lazy(() =>
  import('./components/browser/PentestLockedGate').then((m) => ({ default: m.PentestLockedGate }))
);
const SettingsModal = React.lazy(() =>
  import('./components/modals/SettingsModal').then((m) => ({ default: m.SettingsModal }))
);
const AuthModal = React.lazy(() =>
  import('./components/modals/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const LabSolvedModal = React.lazy(() =>
  import('./components/modals/LabSolvedModal').then((m) => ({ default: m.LabSolvedModal }))
);

const FallbackLoader: React.FC = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-950 text-emerald-400 font-mono text-xs">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      <span>Modül Yükleniyor...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const {
    allLabs,
    currentLab,
    solvedLabIds,
    stageProgress,
    browserUrl,
    setBrowserUrl,
    cookies,
    setCookies,
    httpLogs,
    activeRightTab,
    setActiveRightTab,
    xssModal,
    setXssModal,
    isSettingsOpen,
    setIsSettingsOpen,
    deepInfraApiKey,
    deepInfraModel,
    geminiApiKey,
    isLeftCollapsed,
    setIsLeftCollapsed,
    isRightCollapsed,
    setIsRightCollapsed,
    browserTab,
    setBrowserTab,
    currentView,
    setCurrentView,
    legalTopic,
    currentUser,
    authModal,
    setAuthModal,
    quickFlagInput,
    setQuickFlagInput,
    quickFlagStatus,
    victoryModal,
    handleCloseVictoryModal,
    handleSelectLab,
    handleLabSolved,
    handleFlagSubmit,
    handleLogHttpRequest,
    handleTerminalHttpRequest,
    handleEnterArena,
    handleSignOut,
    handleResetCloudProgress,
    handleSaveDeepInfraKey,
    handleSaveDeepInfraModel,
    handleSaveGeminiKey,
    handleToggleStage,
    handleTriggerXssAlert,
    handleLoginSuccess
  } = useArenaState();

  const isCurrentSolved = solvedLabIds.has(currentLab.id);

  // Landing Page View
  if (currentView === 'landing') {
    return (
      <Suspense fallback={<FallbackLoader />}>
        <LandingPage
          onEnterArena={handleEnterArena}
          onNavigateView={(view) => {
            setCurrentView(view);
            window.location.hash = `#/${view}`;
          }}
          solvedCount={solvedLabIds.size}
          solvedLabIds={solvedLabIds}
          currentUser={currentUser}
          onOpenAuthModal={(reason) => setAuthModal({ isOpen: true, reasonMessage: reason })}
          onLogout={handleSignOut}
        />
        {authModal.isOpen && (
          <AuthModal
            isOpen={authModal.isOpen}
            onClose={() => setAuthModal({ isOpen: false, reasonMessage: undefined })}
            reasonMessage={authModal.reasonMessage}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </Suspense>
    );
  }

  // Legal / KVKK View
  if (currentView === 'disclaimer' || currentView === 'kvkk') {
    return (
      <Suspense fallback={<FallbackLoader />}>
        <LegalView
          initialTab={legalTopic}
          onBack={() => {
            setCurrentView('landing');
            window.location.hash = '#/landing';
          }}
        />
      </Suspense>
    );
  }

  // Hotel Breach Lab View
  if (currentView === 'hotel-breach') {
    const isFileUpload = window.location.hash.includes('upload') || window.location.hash.includes('file');
    return (
      <Suspense fallback={<FallbackLoader />}>
        <HotelBreachLab
          initialScenario={isFileUpload ? 'file-upload' : 'api'}
          onBackToHub={() => {
            setCurrentView('landing');
            window.location.hash = '#/landing';
          }}
        />
      </Suspense>
    );
  }

  // Calculate prev lab for sequential navigation / Red Team lock
  const currentTrack = CURRICULUM_TRACKS.find((t) => t.labs.some((l) => l.id === currentLab.id));
  const trackLabs = currentTrack?.labs || allLabs;
  const indexInTrack = trackLabs.findIndex((l) => l.id === currentLab.id);
  const prevLab = indexInTrack > 0 ? trackLabs[indexInTrack - 1] : null;
  const isSequentialLocked = prevLab !== null && !solvedLabIds.has(prevLab.id);

  return (
    <div className="w-full h-screen max-w-full flex flex-col overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Solved Top Banner */}
      {isCurrentSolved && (
        <SolvedBanner
          currentLab={currentLab}
          currentUser={currentUser}
          onOpenAuthModal={(reason) => setAuthModal({ isOpen: true, reasonMessage: reason })}
          onBackToLanding={() => {
            setCurrentView('landing');
            window.location.hash = '#/landing';
          }}
        />
      )}

      {/* Main Arena Container */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-2 gap-2">
        {/* Onboarding Directive Banner */}
        {solvedLabIds.size === 0 && (
          <div
            className={`rounded-lg px-4 py-2.5 flex items-center justify-between gap-4 border shadow-sm shrink-0 ${
              currentLab.id === allLabs[0].id
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-amber-950/40 border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <Compass
                size={22}
                className={currentLab.id === allLabs[0].id ? 'text-emerald-400 shrink-0' : 'text-amber-400 shrink-0'}
              />
              <div>
                <span className="text-sm font-bold text-white block">
                  {currentLab.id === allLabs[0].id
                    ? '🚀 ÖNERİLEN BAŞLANGIÇ NOKTASINDASINIZ: Challenge-1 (Kusurlu Lab)'
                    : "💡 BAŞLANGIÇ TAVSİYESİ: Hangi Challenge'dan Başlamalısınız?"}
                </span>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed">
                  {currentLab.id === allLabs[0].id
                    ? "Sıralı müfredatın 1. durağındasınız. Sol paneldeki 'GÖREV & İPUCU' sekmesindeki talimatları takip ederek ilk bayrağı yakalayın."
                    : `Şu an Challenge ${allLabs.findIndex((l) => l.id === currentLab.id) + 1}'desiniz. Yeni başladıysanız önce Challenge-1'i çözmeniz önerilir.`}
                </p>
              </div>
            </div>

            {currentLab.id !== allLabs[0].id && (
              <button
                type="button"
                onClick={() => handleSelectLab(allLabs[0])}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold cursor-pointer transition-colors whitespace-nowrap shadow-sm shrink-0"
              >
                Challenge-1'e Git &rarr;
              </button>
            )}
          </div>
        )}

        {/* Arena Mission Control HUD Bar */}
        <div className="shrink-0">
          <ArenaHudBar
            currentLab={currentLab}
            allLabs={allLabs}
            solvedLabIds={solvedLabIds}
            currentUser={currentUser}
            activeRightTab={activeRightTab}
            setActiveRightTab={setActiveRightTab}
            isTerminalExpanded={!isRightCollapsed}
            setIsTerminalExpanded={() => setIsRightCollapsed((prev) => !prev)}
            quickFlagInput={quickFlagInput}
            setQuickFlagInput={setQuickFlagInput}
            quickFlagStatus={quickFlagStatus}
            onFlagSubmit={handleFlagSubmit}
            onNavigateView={(view) => {
              setCurrentView(view);
              window.location.hash = `#/${view}`;
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuthModal={(reason) => setAuthModal({ isOpen: true, reasonMessage: reason })}
            onSignOut={handleSignOut}
          />
        </div>

        {/* 3-Column Workspace Grid */}
        <main
          className="flex-1 min-h-0 min-w-0 grid gap-2 overflow-hidden"
          style={{
            gridTemplateColumns: `${isLeftCollapsed ? '56px' : '330px'} minmax(0, 1fr) ${
              isRightCollapsed ? '56px' : '400px'
            }`
          }}
        >
          {/* Left Column: Curriculum & Briefing */}
          <div className="min-w-0 min-h-0 h-full overflow-hidden">
            <CurriculumSidebar
              currentLab={currentLab}
              onSelectLab={handleSelectLab}
              solvedLabIds={solvedLabIds}
              stageProgress={stageProgress}
              onToggleStage={handleToggleStage}
              isCollapsed={isLeftCollapsed}
              onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
              currentUser={currentUser}
              onOpenAuthModal={(reason) => setAuthModal({ isOpen: true, reasonMessage: reason })}
            />
          </div>

          {/* Center Column: Interactive Target Browser or Red Team Locked Gate */}
          <div className="min-w-0 min-h-0 h-full overflow-hidden flex flex-col">
            <Suspense fallback={<FallbackLoader />}>
              {isSequentialLocked && prevLab ? (
                <PentestLockedGate
                  currentLab={currentLab}
                  currentLabIndex={indexInTrack}
                  prevLab={prevLab}
                  onUnlockWithFlag={(flag) => {
                    if (verifyLabFlag(prevLab.id, flag)) {
                      handleLabSolved(prevLab.id, flag);
                      return { success: true };
                    }
                    return {
                      success: false,
                      error: `Hatalı bayrak! Bu kilit yalnızca önceki laboratuvardan (${prevLab.title}) elde edilen geçerli FLAG ile açılabilir.`
                    };
                  }}
                  onGoToPrevLab={() => handleSelectLab(prevLab)}
                />
              ) : (
                <TargetBrowser
                  lab={currentLab}
                  url={browserUrl}
                  setUrl={setBrowserUrl}
                  cookies={cookies}
                  setCookie={(k, v) => setCookies((prev) => ({ ...prev, [k]: v }))}
                  httpLogs={httpLogs}
                  onTriggerXssAlert={handleTriggerXssAlert}
                  onLabSolved={handleLabSolved}
                  onLogHttpRequest={handleLogHttpRequest}
                  activeTab={browserTab}
                  onTabChange={setBrowserTab}
                />
              )}
            </Suspense>
          </div>

          {/* Right Column: AI Security Mentor & Web Terminal */}
          <div className="min-w-0 min-h-0 h-full overflow-hidden flex flex-col">
            {isRightCollapsed ? (
              <aside className="w-14 h-full flex flex-col items-center py-3 gap-3.5 bg-slate-900 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRightCollapsed(false)}
                  title="Sağ Paneli Genişlet (Terminal & AI)"
                  className="bg-slate-950 border border-slate-800 text-cyan-400 p-2.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="w-8 h-px bg-slate-800" />

                <button
                  type="button"
                  onClick={() => {
                    setActiveRightTab('terminal');
                    setIsRightCollapsed(false);
                  }}
                  title="Web Terminalini Aç"
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                    activeRightTab === 'terminal'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRightTab('ai');
                    setIsRightCollapsed(false);
                  }}
                  title="AI Güvenlik Mentorunu Aç"
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                    activeRightTab === 'ai'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot size={20} />
                </button>
              </aside>
            ) : (
              <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          setAuthModal({
                            isOpen: true,
                            reasonMessage: 'AI Mentoru kullanmak için lütfen giriş yapın.'
                          });
                        }
                        setActiveRightTab('ai');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        activeRightTab === 'ai'
                          ? 'bg-purple-500/20 text-purple-200 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Bot size={15} />
                      <span>AI Mentor</span>
                      {!currentUser && <Lock size={11} className="text-amber-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveRightTab('terminal')}
                      className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        activeRightTab === 'terminal'
                          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400 shadow-[0_0_10px_rgba(0,255,157,0.2)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Terminal size={15} />
                      <span>Terminal</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRightCollapsed(true)}
                    title="Sağ Paneli Gizle"
                    className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 min-h-0 overflow-hidden relative">
                  <Suspense fallback={<FallbackLoader />}>
                    {activeRightTab === 'ai' ? (
                      <AiMentorPanel
                        currentLab={currentLab}
                        deepInfraApiKey={deepInfraApiKey}
                        deepInfraModel={deepInfraModel}
                        geminiApiKey={geminiApiKey}
                        currentUser={currentUser}
                        onOpenAuthModal={(reason) =>
                          setAuthModal({ isOpen: true, reasonMessage: reason || 'Lütfen giriş yapın.' })
                        }
                      />
                    ) : (
                      <WebTerminal
                        activeLabId={currentLab.id}
                        cookies={cookies}
                        setCookie={(k, v) => setCookies((prev) => ({ ...prev, [k]: v }))}
                        onHttpRequest={handleTerminalHttpRequest}
                        onLabSolved={handleLabSolved}
                      />
                    )}
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* XSS Alert Dialog */}
      {xssModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setXssModal({ isOpen: false, payload: '' })}
        >
          <div
            className="w-full max-w-md bg-slate-900 border-2 border-emerald-400 rounded-lg p-5 shadow-[0_0_25px_rgba(0,255,157,0.3)] space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-emerald-400" />
              <span className="text-xs font-mono font-bold text-white">
                JavaScript Alert from {new URL(browserUrl).hostname}:
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded p-3 font-mono text-xs text-cyan-400 break-all">
              {xssModal.payload || '1'}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setXssModal({ isOpen: false, payload: '' })}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold px-4 py-1.5 rounded cursor-pointer transition-colors"
              >
                Tamam (OK)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Suspense fallback={null}>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            deepInfraApiKey={deepInfraApiKey}
            setDeepInfraApiKey={handleSaveDeepInfraKey}
            deepInfraModel={deepInfraModel}
            setDeepInfraModel={handleSaveDeepInfraModel}
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={handleSaveGeminiKey}
            onResetAllProgress={handleResetCloudProgress}
          />
        )}
      </Suspense>

      {/* Auth Modal */}
      <Suspense fallback={null}>
        {authModal.isOpen && (
          <AuthModal
            isOpen={authModal.isOpen}
            onClose={() => setAuthModal({ isOpen: false, reasonMessage: undefined })}
            reasonMessage={authModal.reasonMessage}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </Suspense>

      {/* Lab Solved Victory Modal */}
      <Suspense fallback={null}>
        {victoryModal.isOpen && (
          <LabSolvedModal
            isOpen={victoryModal.isOpen}
            onClose={handleCloseVictoryModal}
            lab={victoryModal.lab}
            flag={victoryModal.flag}
            pointsEarned={victoryModal.points}
            onBackToLanding={() => {
              setCurrentView('landing');
              window.location.hash = '#/landing';
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;
