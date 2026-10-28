import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CURRICULUM_TRACKS } from './data/curriculum';
import type { LabItem, HttpRequestLog, HubView } from './types/lab';
import type { UserProfile } from './types/user';
import { CurriculumSidebar } from './components/curriculum/CurriculumSidebar';
import { TargetBrowser } from './components/browser/TargetBrowser';
import { WebTerminal } from './components/terminal/WebTerminal';
import { AiMentorPanel } from './components/ai/AiMentorPanel';
import { SettingsModal } from './components/modals/SettingsModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/modals/AuthModal';
import { LinuxMachineView } from './components/linux-machine/LinuxMachineView';
import { LegalView } from './components/legal/LegalView';
import { evaluateLabProgress } from './lib/sandbox/progressTracker';
import {
  CheckCircle2,
  Compass,
  ArrowRight,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Target,
  Circle,
  Maximize2,
  Minimize2,
  Terminal,
  Bot,
  RotateCcw,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import { resetDatabase } from './lib/sql/sqliteEngine';
import { dispatchVirtualHttpRequest } from './lib/sandbox/virtualServer';
import { supabase, isSupabaseConfigured, signOutUser } from './lib/supabase/supabaseClient';
import {
  saveLabProgress,
  saveCapturedFlag,
  syncLocalProgressWithCloud
} from './lib/supabase/dbService';

// All labs flattened at module scope to preserve stable reference
const allLabs = CURRICULUM_TRACKS.flatMap((track) => track.labs);

export const App: React.FC = () => {
  const activeLabIdRef = React.useRef<string | null>(null);

  // Active lab state
  const [currentLab, setCurrentLab] = useState<LabItem>(() => {
    try {
      const savedId = localStorage.getItem('hackerarena_last_active_lab');
      if (savedId) {
        const found = allLabs.find((l) => l.id === savedId);
        if (found) {
          activeLabIdRef.current = found.id;
          return found;
        }
      }
    } catch {
      // fallback
    }
    activeLabIdRef.current = allLabs[0].id;
    return allLabs[0];
  });

  // Solved labs state with localStorage persistence
  const [solvedLabIds, setSolvedLabIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('hackerarena_solved');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Multi-stage progression per lab persistence
  const [stageProgress, setStageProgress] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('hackerarena_stage_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Captured flags vault persistence
  const [capturedFlags, setCapturedFlags] = useState<Record<string, { flag: string; solvedAt: string }>>(() => {
    try {
      const saved = localStorage.getItem('hackerarena_captured_flags');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Target Browser URL
  const [browserUrl, setBrowserUrl] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('hackerarena_last_active_lab');
      if (savedId) {
        const found = allLabs.find((l) => l.id === savedId);
        if (found) return found.startingUrl;
      }
    } catch {
      // fallback
    }
    return allLabs[0].startingUrl;
  });

  // Target Cookies
  const [cookies, setCookies] = useState<Record<string, string>>({
    session_id: 'sess_99a8b1c4',
    access_tier: 'guest'
  });

  // HTTP Request Logs (DevTools)
  const [httpLogs, setHttpLogs] = useState<HttpRequestLog[]>([]);

  // Right Panel Tab
  const [activeRightTab, setActiveRightTab] = useState<'ai' | 'terminal'>('ai');

  // XSS Alert Modal
  const [xssModal, setXssModal] = useState<{ isOpen: boolean; payload: string }>({
    isOpen: false,
    payload: ''
  });

  // Settings Modal & DeepInfra / Gemini Keys
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deepInfraApiKey, setDeepInfraApiKey] = useState<string>(() => {
    return localStorage.getItem('hackerarena_deepinfra_key') || import.meta.env.VITE_DEEPINFRA_API_KEY || '';
  });
  const [deepInfraModel, setDeepInfraModel] = useState<string>(() => {
    return localStorage.getItem('hackerarena_deepinfra_model') || import.meta.env.VITE_DEEPINFRA_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
  });
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('hackerarena_gemini_key') || '';
  });

  // View switcher: default is 'landing' as requested
  const [currentView, setCurrentView] = useState<HubView>('landing');

  // User Profile (unlocking all 12 labs)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('hackerarena_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth Modal State
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; reasonMessage?: string }>({
    isOpen: false,
    reasonMessage: undefined
  });


  // Target Browser Active Tab
  const [browserTab, setBrowserTab] = useState<'view' | 'repeater' | 'network' | 'source' | 'cookies'>('view');

  // Collapsible Workspace Layout
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const isZenMode = isLeftCollapsed && isRightCollapsed;
  const toggleZenMode = () => {
    if (isZenMode) {
      setIsLeftCollapsed(false);
      setIsRightCollapsed(false);
    } else {
      setIsLeftCollapsed(true);
      setIsRightCollapsed(true);
    }
  };

  // Initialize SQLite database on boot
  useEffect(() => {
    resetDatabase().catch((err) => console.warn('SQLite init warning:', err));
  }, []);

  // Supabase Auth Session Synchronizer & Cloud RLS Progress Sync
  useEffect(() => {
    let isMounted = true;

    const initAuthAndSync = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user && isMounted) {
            const sbUser = data.session.user;
            const profile: UserProfile = {
              id: sbUser.id,
              email: sbUser.email || '',
              username: sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || 'operatör',
              role: (sbUser.user_metadata?.role as any) || 'Practitioner',
              provider: 'email',
              avatarUrl: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${sbUser.id}`,
              createdAt: sbUser.created_at || new Date().toISOString()
            };
            setCurrentUser(profile);
            localStorage.setItem('hackerarena_user', JSON.stringify(profile));

            const res = await syncLocalProgressWithCloud(profile.id, solvedLabIds, stageProgress, capturedFlags);
            if (isMounted) {
              setSolvedLabIds(res.mergedSolved);
              setStageProgress(res.mergedStages);
              setCapturedFlags(res.mergedFlags);
            }
          }
        } catch (err) {
          console.warn('[Supabase RLS] Init auth warning:', err);
        }
      }
    };

    initAuthAndSync();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMounted) {
        const sbUser = session.user;
        const profile: UserProfile = {
          id: sbUser.id,
          email: sbUser.email || '',
          username: sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || 'operatör',
          role: (sbUser.user_metadata?.role as any) || 'Practitioner',
          provider: 'email',
          avatarUrl: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${sbUser.id}`,
          createdAt: sbUser.created_at || new Date().toISOString()
        };
        setCurrentUser(profile);
        localStorage.setItem('hackerarena_user', JSON.stringify(profile));

        const res = await syncLocalProgressWithCloud(profile.id, solvedLabIds, stageProgress, capturedFlags);
        if (isMounted) {
          setSolvedLabIds(res.mergedSolved);
          setStageProgress(res.mergedStages);
          setCapturedFlags(res.mergedFlags);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Save solved labs
  useEffect(() => {
    localStorage.setItem('hackerarena_solved', JSON.stringify(Array.from(solvedLabIds)));
  }, [solvedLabIds]);

  // SSG Hash Router & Deep-Link Synchronizer
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/pentest/')) {
        const labId = hash.replace('#/pentest/', '');
        const targetLab = allLabs.find((l) => l.id === labId);
        if (targetLab) {
          const targetIndex = allLabs.findIndex((l) => l.id === targetLab.id);
          const isTargetFree = targetIndex >= 0 && targetIndex < 4;
          const effectiveLab = (currentUser || isTargetFree) ? targetLab : allLabs[0];
          if (!currentUser && !isTargetFree) {
            setAuthModal({
              isOpen: true,
              reasonMessage: `"${targetLab.title}" laboratuvarına erişmek ve ilerlemenizi kaydetmek için lütfen giriş yapın. (İlk 4 challenge herkese açıktır).`
            });
          }
          if (activeLabIdRef.current !== effectiveLab.id) {
            activeLabIdRef.current = effectiveLab.id;
            setCurrentLab(effectiveLab);
            setBrowserUrl(effectiveLab.startingUrl);
          }
          setCurrentView('arena');
        }
      } else if (hash.startsWith('#/linux')) {
        activeLabIdRef.current = null;
        setCurrentView('linux-machine');
      } else if (hash === '#/feragatname' || hash === '#/yasal/feragatname') {
        activeLabIdRef.current = null;
        setCurrentView('disclaimer');
      } else if (hash === '#/kvkk' || hash === '#/yasal/kvkk') {
        activeLabIdRef.current = null;
        setCurrentView('kvkk');
      } else if (hash === '#/arena') {
        if (activeLabIdRef.current !== allLabs[0].id) {
          activeLabIdRef.current = allLabs[0].id;
          setCurrentLab(allLabs[0]);
          setBrowserUrl(allLabs[0].startingUrl);
        }
        setCurrentView('arena');
      } else if (hash === '' || hash === '#/' || hash === '#/landing') {
        activeLabIdRef.current = null;
        setCurrentView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashSync);
    handleHashSync();
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [currentUser]);

  // Dynamic SEO Page Title Synchronizer
  useEffect(() => {
    if (currentView === 'landing') {
      document.title = 'SiberAdam // Uygulamalı Siber Güvenlik Eğitimi & Web Security Academy (CTF)';
    } else if (currentView === 'linux-machine') {
      document.title = 'SiberAdam // Linux Sistemleri & CTF Öğrenme Makinesi';
    } else if (currentView === 'disclaimer') {
      document.title = 'SiberAdam // Siber Güvenlik Eğitim Feragatnamesi & Yasal Uyarı';
    } else if (currentView === 'kvkk') {
      document.title = 'SiberAdam // 6698 Sayılı KVKK Aydınlatma Metni & Çerez Politikası';
    } else {
      document.title = `${currentLab.title} - ${currentLab.category} (${currentLab.difficulty}) // SiberAdam Labs`;
    }
  }, [currentView, currentLab]);

  // Save AI Keys & Models
  const handleSaveDeepInfraKey = (key: string) => {
    setDeepInfraApiKey(key);
    localStorage.setItem('hackerarena_deepinfra_key', key);
  };

  const handleSaveDeepInfraModel = (model: string) => {
    setDeepInfraModel(model);
    localStorage.setItem('hackerarena_deepinfra_model', model);
  };

  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('hackerarena_gemini_key', key);
  };

  // Lab change handler: Logged-in user can choose any challenge; anonymous can play Challenge 01 - 04 (First 4 labs)
  const handleSelectLab = (lab: LabItem) => {
    const labIndex = allLabs.findIndex((l) => l.id === lab.id);
    const isFreeLab = labIndex >= 0 && labIndex < 4;
    if (!currentUser && !isFreeLab) {
      setAuthModal({
        isOpen: true,
        reasonMessage: `"${lab.title}" laboratuvarına erişmek ve ilerlemenizi kaydetmek için lütfen giriş yapın. (İlk 4 challenge herkese açıktır).`
      });
      return;
    }
    activeLabIdRef.current = lab.id;
    setCurrentLab(lab);
    setBrowserUrl(lab.startingUrl);
    localStorage.setItem('hackerarena_last_active_lab', lab.id);
    setCookies({
      session_id: 'sess_99a8b1c4',
      access_tier: 'guest'
    });
    if (window.location.hash !== `#/pentest/${lab.id}`) {
      window.location.hash = `#/pentest/${lab.id}`;
    }
  };

  // Toggle stage completion and persist
  const handleToggleStage = (labId: string, stageId: number) => {
    setStageProgress((prev) => {
      const current = prev[labId] || [];
      const updated = current.includes(stageId)
        ? current.filter((id) => id !== stageId)
        : [...current, stageId];
      const nextState = { ...prev, [labId]: updated };
      localStorage.setItem('hackerarena_stage_progress', JSON.stringify(nextState));
      if (currentUser?.id) {
        saveLabProgress(currentUser.id, labId, updated, solvedLabIds.has(labId));
      }
      return nextState;
    });
  };

  // Previous lab navigator
  const handleGoToPrevLab = () => {
    const currentIndex = allLabs.findIndex((l) => l.id === currentLab.id);
    if (currentIndex > 0) {
      handleSelectLab(allLabs[currentIndex - 1]);
    }
  };


  // Lab solved trigger (PortSwigger banner + confetti)
  const handleLabSolved = (labId: string) => {
    if (!solvedLabIds.has(labId)) {
      setSolvedLabIds((prev) => new Set([...prev, labId]));

      const targetLab = allLabs.find((l) => l.id === labId);
      if (targetLab) {
        const allStages = targetLab.stages.map((s) => s.id);
        setStageProgress((prev) => {
          const next = { ...prev, [labId]: allStages };
          localStorage.setItem('hackerarena_stage_progress', JSON.stringify(next));
          return next;
        });

        setCapturedFlags((prev) => {
          const next = {
            ...prev,
            [labId]: { flag: targetLab.flag, solvedAt: new Date().toLocaleTimeString() }
          };
          localStorage.setItem('hackerarena_captured_flags', JSON.stringify(next));
          return next;
        });

        if (currentUser?.id) {
          saveLabProgress(currentUser.id, labId, allStages, true);
          saveCapturedFlag(currentUser.id, labId, targetLab.flag);
        }
      }

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.2 },
          colors: ['#00ff9d', '#00f0ff', '#f59e0b', '#ffffff']
        });
      } catch (err) {
        console.log('Confetti triggered', err);
      }

      // İlk 4 ücretsiz bulmaca tamamlandığında (Challenge-4 bittiğinde) kullanıcı giriş yapmamışsa modal gelir
      const solvedIndex = allLabs.findIndex((l) => l.id === labId);
      if (solvedIndex === 3 && !currentUser) {
        setTimeout(() => {
          setAuthModal({
            isOpen: true,
            reasonMessage: '🎉 Tebrikler! İlk 4 Ücretsiz Challenge başarıyla tamamlandı. İlerlemenizi kaydetmek ve kalan 8 İleri Düzey Laboratuvarı açmak için giriş yapın.'
          });
        }, 1200);
      }
    }
  };

  // XSS alert trigger
  const handleTriggerXssAlert = (payload: string) => {
    setXssModal({ isOpen: true, payload });
  };

  // Reset current lab
  const handleResetLab = () => {
    setBrowserUrl(currentLab.startingUrl);
    setCookies({
      session_id: 'sess_99a8b1c4',
      access_tier: 'guest'
    });
    setHttpLogs([]);
    resetDatabase();
  };

  // Log HTTP Request (from Browser or Terminal)
  const handleLogHttpRequest = (req: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers: Record<string, string>;
    body?: string;
    responseStatus: number;
    responseHeaders: Record<string, string>;
    responseBody: string;
    durationMs?: number;
  }) => {
    const newLog: HttpRequestLog = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      durationMs: req.durationMs || 25,
      ...req
    };
    setHttpLogs((prev) => [newLog, ...prev.slice(0, 49)]);

    // Automated Progress-Aware Stage Tracker
    if (currentLab) {
      const alreadyDone = stageProgress[currentLab.id] || [];
      const evalRes = evaluateLabProgress(
        currentLab,
        {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body,
          responseStatus: req.responseStatus,
          responseBody: req.responseBody,
          cookies
        },
        alreadyDone
      );

      if (evalRes.newlyCompletedStages.length > 0) {
        setStageProgress((prev) => {
          const prevStages = prev[currentLab.id] || [];
          const updated = Array.from(new Set([...prevStages, ...evalRes.newlyCompletedStages]));
          const next = { ...prev, [currentLab.id]: updated };
          localStorage.setItem('hackerarena_stage_progress', JSON.stringify(next));
          if (currentUser?.id) {
            saveLabProgress(currentUser.id, currentLab.id, updated, solvedLabIds.has(currentLab.id));
          }
          return next;
        });
      }

      if (evalRes.isSolved && !solvedLabIds.has(currentLab.id)) {
        handleLabSolved(currentLab.id);
      }
    }

    return newLog;
  };

  // Terminal HTTP Request Bridge - dispatches against the real in-browser Virtual Server
  const handleTerminalHttpRequest = async (
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: string
  ) => {
    const startTime = Date.now();
    const resp = await dispatchVirtualHttpRequest({
      method: method as any,
      path: url,
      query: {},
      headers,
      body,
      cookies
    });
    const durationMs = Math.max(1, Date.now() - startTime);

    if (resp.setCookies) {
      for (const [k, v] of Object.entries(resp.setCookies)) {
        setCookies((prev) => ({ ...prev, [k]: v }));
      }
    }

    handleLogHttpRequest({
      method: method as any,
      url,
      headers,
      body,
      responseStatus: resp.status,
      responseHeaders: resp.headers,
      responseBody: resp.html,
      durationMs
    });

    return { status: resp.status, headers: resp.headers, body: resp.html };
  };

  // Next lab navigator: sequentially goes to next challenge or to Linux machine
  const handleGoToNextLab = () => {
    const currentIndex = allLabs.findIndex((l) => l.id === currentLab.id);
    if (currentIndex >= 0 && currentIndex + 1 < allLabs.length) {
      const nextLab = allLabs[currentIndex + 1];
      const nextIndex = currentIndex + 1;
      const isNextFree = nextIndex < 4;
      if (!currentUser && !isNextFree) {
        setAuthModal({
          isOpen: true,
          reasonMessage: `Sıradaki laboratuvara (${nextLab.title}) geçmek ve ilerlemenizi kaydetmek için lütfen giriş yapın. (İlk 4 challenge herkese açıktır).`
        });
        return;
      }
      handleSelectLab(nextLab);
    } else {
      setCurrentView('linux-machine');
      window.location.hash = '#/linux';
    }
  };

  // Enter arena from landing page or curriculum
  const handleEnterArena = (lab?: LabItem) => {
    if (lab) {
      const labIndex = allLabs.findIndex((l) => l.id === lab.id);
      const isFree = labIndex >= 0 && labIndex < 4;
      if (!currentUser && !isFree) {
        setAuthModal({
          isOpen: true,
          reasonMessage: `"${lab.title}" laboratuvarına erişmek için lütfen giriş yapın. (İlk 4 challenge herkese açıktır).`
        });
        return;
      }
      setCurrentLab(lab);
      setBrowserUrl(lab.startingUrl);
      setCurrentView('arena');
      if (window.location.hash !== `#/pentest/${lab.id}`) {
        window.location.hash = `#/pentest/${lab.id}`;
      }
    } else {
      setCurrentLab(allLabs[0]);
      setBrowserUrl(allLabs[0].startingUrl);
      setCurrentView('arena');
      if (window.location.hash !== `#/pentest/${allLabs[0].id}`) {
        window.location.hash = `#/pentest/${allLabs[0].id}`;
      }
    }
  };

  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    if (user.id && isSupabaseConfigured()) {
      const res = await syncLocalProgressWithCloud(
        user.id,
        solvedLabIds,
        stageProgress,
        capturedFlags
      );
      setSolvedLabIds(res.mergedSolved);
      setStageProgress(res.mergedStages);
      setCapturedFlags(res.mergedFlags);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  const isCurrentSolved = solvedLabIds.has(currentLab.id);

  // If on landing view, render the interactive wheel-driven hacker terminal Linux autobiography
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterArena={handleEnterArena}
          onNavigateView={(view) => {
            setCurrentView(view);
            if (view === 'linux-machine') {
              window.location.hash = '#/linux';
            } else if (view === 'landing') {
              window.location.hash = '#/landing';
            } else if (view === 'arena') {
              window.location.hash = `#/pentest/${currentLab.id}`;
            }
          }}
          solvedCount={solvedLabIds.size}
          solvedLabIds={solvedLabIds}
          currentUser={currentUser}
          onOpenAuthModal={(reason) => setAuthModal({ isOpen: true, reasonMessage: reason })}
          onLogout={handleLogout}
        />

        {/* Supabase & Operator Authentication Modal accessible on Landing */}
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ isOpen: false, reasonMessage: undefined })}
          reasonMessage={authModal.reasonMessage}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // If on Linux learning machine view, render Y's Computer CTF terminal
  if (currentView === 'linux-machine') {
    return (
      <LinuxMachineView
        onBackToMain={() => {
          setCurrentView('landing');
          window.location.hash = '#/landing';
        }}
      />
    );
  }

  // If on Legal Views (Feragatname & KVKK Aydınlatma Metni)
  if (currentView === 'disclaimer' || currentView === 'kvkk') {
    return (
      <LegalView
        initialTab={currentView === 'kvkk' ? 'kvkk' : 'disclaimer'}
        onBack={() => {
          setCurrentView('landing');
          window.location.hash = '#/landing';
        }}
      />
    );
  }

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="cyber-bg" />

      {/* Solved Top Banner */}
      {isCurrentSolved && (
        <div className="solved-banner">
          <div className="solved-banner-content">
            <CheckCircle2 size={18} color="var(--accent-green)" />
            <span>Tebrikler! Güvenlik bulmacasını başarıyla çözdünüz.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: '#86efac', fontFamily: 'var(--font-mono)' }}>
              Zafiyet: {currentLab.category} ({currentLab.difficulty === 'Apprentice' ? 'Başlangıç' : currentLab.difficulty === 'Practitioner' ? 'Orta Seviye' : 'İleri Seviye'})
            </span>
            <button className="solved-banner-btn" onClick={handleGoToNextLab}>
              <span>
                {allLabs.findIndex((l) => l.id === currentLab.id) < allLabs.length - 1
                  ? `Sıradaki Challenge: Challenge-${allLabs.findIndex((l) => l.id === currentLab.id) + 2}`
                  : 'Linux Sistemleri Laboratuvarına Geç'}
              </span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Arena Workspace Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '8px 12px', gap: '6px' }}>
        {/* Onboarding Directive Banner (if 0 solved) */}
        {solvedLabIds.size === 0 && (
          <div
            style={{
              background: currentLab.id === allLabs[0].id
                ? 'linear-gradient(90deg, rgba(0, 255, 157, 0.12), rgba(0, 240, 255, 0.08))'
                : 'linear-gradient(90deg, rgba(245, 158, 11, 0.12), rgba(0, 240, 255, 0.08))',
              border: currentLab.id === allLabs[0].id ? '1px solid var(--accent-green)' : '1px solid var(--accent-orange)',
              borderRadius: '6px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} color={currentLab.id === allLabs[0].id ? "var(--accent-green)" : "var(--accent-orange)"} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                  {currentLab.id === allLabs[0].id
                    ? '🚀 ŞU AN ÖNERİLEN BAŞLANGIÇ NOKTASINDASINIZ: Challenge-1 (Kusurlu Lab)'
                    : '💡 BAŞLANGIÇ TAVSİYESİ: Hangi Challenge\'dan Başlamalısınız?'}
                </span>
                <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                  {currentLab.id === allLabs[0].id
                    ? 'Sıralı müfredatın 1. durağındasınız. Sol paneldeki \'GÖREV & İPUCU\' sekmesindeki 3 aşamalı talimatları takip ederek ilk bayrağı yakalayın.'
                    : `Şu an Challenge ${allLabs.findIndex((l) => l.id === currentLab.id) + 1}'desiniz. Yeni başladıysanız temel HTTP başlıklarını öğrenmek için önce Challenge-1'i çözmeniz önerilir.`}
                </p>
              </div>
            </div>

            {currentLab.id !== allLabs[0].id && (
              <button
                onClick={() => handleSelectLab(allLabs[0])}
                className="btn-cyber-cyan"
                style={{ padding: '6px 14px', fontSize: '11px', whiteSpace: 'nowrap' }}
              >
                Challenge-1'e Git (Önerilen) &rarr;
              </button>
            )}
          </div>
        )}

        {/* Arena Mission Control HUD Bar */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          {/* Brand & Active Lab Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                setCurrentView('landing');
                window.location.hash = '#/landing';
              }}
              style={{
                background: 'rgba(0, 255, 157, 0.1)',
                border: '1px solid var(--border-accent)',
                color: 'var(--accent-green)',
                padding: '4px 10px',
                borderRadius: '5px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 10px rgba(0, 255, 157, 0.15)'
              }}
              title="Hikaye ve Çark Başlangıç Sayfasına Dön"
            >
              <span>HİKAYEYE GERİ DÖN</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '8px', borderRight: '1px solid var(--border-subtle)' }}>
              <Shield size={16} color="var(--accent-green)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '12px', color: '#fff', letterSpacing: '1px' }}>
                SİBER<span style={{ color: 'var(--accent-green)' }}>ADAM</span>
              </span>
            </div>

            <button
              onClick={() => {
                setCurrentView('linux-machine');
                window.location.hash = '#/linux';
              }}
              style={{
                background: 'rgba(0, 255, 157, 0.08)',
                border: '1px solid rgba(0, 255, 157, 0.3)',
                color: 'var(--accent-green)',
                padding: '4px 8px',
                borderRadius: '5px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Linux Sistemleri CTF Laboratuvarını Aç"
            >
              <Terminal size={12} />
              <span>Linux Sistemleri</span>
            </button>

            <div style={{ background: 'var(--bg-darker)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                SIRA
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                1 / 1 Aktif (Diğerleri Yakında)
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  {currentLab.title}
                </span>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: currentLab.difficulty === 'Apprentice' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: currentLab.difficulty === 'Apprentice' ? 'var(--accent-cyan)' : 'var(--accent-orange)'
                }}>
                  {currentLab.difficulty}
                </span>
                {isCurrentSolved && (
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', background: 'rgba(0, 255, 157, 0.15)', color: 'var(--accent-green)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                    ✓ ÇÖZÜLDÜ
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Target size={11} color="var(--accent-green)" />
                <span style={{ color: '#cbd5e1' }}>
                  <strong>Şu anki Adım:</strong> {currentLab.stages[0]?.title.split(':')[1] || currentLab.objective}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Stage Pills (Interactive) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {currentLab.stages.map((st) => {
              const isCompleted = (stageProgress[currentLab.id] || []).includes(st.id) || isCurrentSolved;
              return (
                <button
                  key={st.id}
                  onClick={() => handleToggleStage(currentLab.id, st.id)}
                  style={{
                    background: isCompleted ? 'rgba(0, 255, 157, 0.15)' : 'var(--bg-darker)',
                    border: `1px solid ${isCompleted ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                    color: isCompleted ? 'var(--accent-green)' : 'var(--text-muted)',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title={`Aşama ${st.id}: ${st.objective} (İlerlemeyi kaydetmek için tıklayın)`}
                >
                  {isCompleted ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                  <span>Adım {st.id}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Controls (Layout, Reset, Settings, Prev/Next) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Layout Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--bg-darker)', padding: '2px 4px', borderRadius: '5px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                className={`action-btn ${!isLeftCollapsed ? 'active' : ''}`}
                style={{ padding: '3px 7px', fontSize: '10px' }}
                title="Sol Müfredat Menüsünü Aç / Kapat"
              >
                {isLeftCollapsed ? '▶ Görev' : '◀ Gizle'}
              </button>

              <button
                onClick={toggleZenMode}
                className={`action-btn ${isZenMode ? 'active' : ''}`}
                style={{ padding: '3px 7px', fontSize: '10px', color: isZenMode ? 'var(--accent-green)' : 'var(--text-muted)' }}
                title={isZenMode ? "Tam Ekran Odak Modundan Çık" : "Odak Modu: Yan Panelleri Kapatıp Tarayıcıyı Büyüt"}
              >
                {isZenMode ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                <span>{isZenMode ? 'Odak Açık' : 'Odak'}</span>
              </button>

              <button
                onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                className={`action-btn ${!isRightCollapsed ? 'active' : ''}`}
                style={{ padding: '3px 7px', fontSize: '10px' }}
                title="Sağ Terminal / AI Menüsünü Aç / Kapat"
              >
                {isRightCollapsed ? 'Terminal ◀' : 'Gizle ▶'}
              </button>
            </div>

            {/* Reset Lab State */}
            <button
              onClick={handleResetLab}
              className="action-btn"
              style={{ padding: '4px 8px', fontSize: '10px' }}
              title="Laboratuvarı Sıfırla"
            >
              <RotateCcw size={12} />
              <span>Sıfırla</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="action-btn"
              style={{ padding: '4px 7px' }}
              title="Platform Ayarları"
            >
              <SettingsIcon size={12} />
            </button>

            {/* Prev / Next Challenge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <button
                onClick={handleGoToPrevLab}
                disabled={allLabs.findIndex((l) => l.id === currentLab.id) <= 0}
                className="action-btn"
                style={{ padding: '4px 8px', fontSize: '10px' }}
                title="Önceki Challenge"
              >
                <ChevronLeft size={12} />
                <span>Önceki</span>
              </button>
              <button
                onClick={handleGoToNextLab}
                disabled={allLabs.findIndex((l) => l.id === currentLab.id) >= allLabs.length - 1}
                className="action-btn"
                style={{ padding: '4px 8px', fontSize: '10px' }}
                title="Sonraki Challenge"
              >
                <span>Sonraki</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Workspace Grid */}
        <main
          className="workspace-grid"
          style={{
            flex: 1,
            minHeight: 0,
            gridTemplateColumns: `${isLeftCollapsed ? '48px' : '310px'} 1fr ${isRightCollapsed ? '48px' : '380px'}`
          }}
        >
          {/* Left Column: Curriculum & Briefing */}
          <CurriculumSidebar
            currentLab={currentLab}
            onSelectLab={handleSelectLab}
            solvedLabIds={solvedLabIds}
            stageProgress={stageProgress}
            onToggleStage={handleToggleStage}
            onGoToNextLab={handleGoToNextLab}
            onGoToPrevLab={handleGoToPrevLab}
            isCollapsed={isLeftCollapsed}
            onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
            currentUser={currentUser}
            onOpenAuthModal={(reason) => setAuthModal({ isOpen: true, reasonMessage: reason })}
          />

          {/* Center Column: Interactive Target Browser & DevTools */}
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

          {/* Right Column: AI Security Mentor & Cyber Terminal */}
          {isRightCollapsed ? (
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
                background: 'var(--bg-card)',
                borderRight: 'none'
              }}
            >
              <button
                onClick={() => setIsRightCollapsed(false)}
                title="Sağ Paneli Genişlet (Terminal & AI)"
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
                <ChevronLeft size={16} />
              </button>

              <div style={{ width: '28px', height: '1px', background: 'var(--border-subtle)' }} />

              <button
                onClick={() => {
                  setActiveRightTab('terminal');
                  setIsRightCollapsed(false);
                }}
                title="Web Terminalini Aç"
                style={{
                  background: activeRightTab === 'terminal' ? 'rgba(0, 255, 157, 0.15)' : 'transparent',
                  border: 'none',
                  color: activeRightTab === 'terminal' ? 'var(--accent-green)' : 'var(--text-dim)',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Terminal size={18} />
              </button>

              <button
                onClick={() => {
                  setActiveRightTab('ai');
                  setIsRightCollapsed(false);
                }}
                title="AI Güvenlik Mentorunu Aç"
                style={{
                  background: activeRightTab === 'ai' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                  border: 'none',
                  color: activeRightTab === 'ai' ? 'var(--accent-purple)' : 'var(--text-dim)',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Bot size={18} />
              </button>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingBottom: '12px' }}>
                <span
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    letterSpacing: '1px'
                  }}
                >
                  TERMINAL / AI
                </span>
              </div>
            </aside>
          ) : (
            <div className="panel" style={{ width: '100%', height: '100%', borderRight: 'none' }}>
              {/* Panel Header with tabs and collapse button */}
              <div style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    id="tour-ai-tab"
                    onClick={() => setActiveRightTab('ai')}
                    style={{
                      background: activeRightTab === 'ai' ? 'var(--bg-dark)' : 'transparent',
                      color: activeRightTab === 'ai' ? 'var(--accent-purple)' : 'var(--text-dim)',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Bot size={13} />
                    <span>AI Mentor</span>
                  </button>

                  <button
                    id="tour-terminal-tab"
                    onClick={() => setActiveRightTab('terminal')}
                    style={{
                      background: activeRightTab === 'terminal' ? 'var(--bg-dark)' : 'transparent',
                      color: activeRightTab === 'terminal' ? 'var(--accent-green)' : 'var(--text-dim)',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Terminal size={13} />
                    <span>Terminal</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsRightCollapsed(true)}
                  title="Sağ Paneli Gizle / Daralt"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    padding: '4px 6px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div style={{ flex: 1, minHeight: 0 }}>
                {activeRightTab === 'ai' ? (
                  <AiMentorPanel
                    currentLab={currentLab}
                    deepInfraApiKey={deepInfraApiKey}
                    deepInfraModel={deepInfraModel}
                    geminiApiKey={geminiApiKey}
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
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Authentic Browser XSS Alert Dialog */}
      {xssModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setXssModal({ isOpen: false, payload: '' })}
        >
          <div
            style={{
              width: '420px',
              background: '#1e293b',
              border: '2px solid var(--accent-green)',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: 'var(--glow-green)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={20} color="var(--accent-green)" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                JavaScript Alert from {new URL(browserUrl).hostname}:
              </span>
            </div>

            <div
              style={{
                background: '#090e1a',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--accent-cyan)',
                marginBottom: '16px',
                wordBreak: 'break-all'
              }}
            >
              {xssModal.payload || '1'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setXssModal({ isOpen: false, payload: '' })}
                className="btn-cyber-primary"
                style={{ padding: '6px 20px', fontSize: '12px' }}
              >
                Tamam (OK)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        deepInfraApiKey={deepInfraApiKey}
        setDeepInfraApiKey={handleSaveDeepInfraKey}
        deepInfraModel={deepInfraModel}
        setDeepInfraModel={handleSaveDeepInfraModel}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={handleSaveGeminiKey}
        onResetAllProgress={() => {
          setSolvedLabIds(new Set());
          localStorage.removeItem('hackerarena_solved');
          setIsSettingsOpen(false);
        }}
      />


      {/* Supabase & Operator Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, reasonMessage: undefined })}
        reasonMessage={authModal.reasonMessage}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
