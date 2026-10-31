import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CURRICULUM_TRACKS } from '../data/curriculum';
import type { LabItem, HttpRequestLog, HubView } from '../types/lab';
import type { UserProfile } from '../types/user';
import { verifyLabFlag } from '../lib/sandbox/flagVault';
import { evaluateLabProgress } from '../lib/sandbox/progressTracker';
import { resetDatabase } from '../lib/sql/sqliteEngine';
import { dispatchVirtualHttpRequest } from '../lib/sandbox/virtualServer';
import { supabase, isSupabaseConfigured, signOutUser } from '../lib/supabase/supabaseClient';
import {
  saveLabProgress,
  saveCapturedFlag,
  syncLocalProgressWithCloud,
  resetUserCloudProgress
} from '../lib/supabase/dbService';
import {
  saveLabProgressRx,
  saveCapturedFlagRx,
  loadAllLabProgressRx,
  clearAllLocalProgressRx,
  subscribeToLabProgressRx
} from '../lib/rxdb';

export const allLabs = CURRICULUM_TRACKS.flatMap((track) => track.labs);

export function useArenaState() {
  const activeLabIdRef = useRef<string | null>(allLabs[0].id);

  // Active lab state
  const [currentLab, setCurrentLab] = useState<LabItem>(() => allLabs[0]);

  // Solved labs state
  const [solvedLabIds, setSolvedLabIds] = useState<Set<string>>(() => new Set<string>());

  // Multi-stage progression per lab
  const [stageProgress, setStageProgress] = useState<Record<string, number[]>>(() => ({}));

  // Captured flags vault
  const [capturedFlags, setCapturedFlags] = useState<Record<string, { flag: string; solvedAt: string }>>(() => ({}));

  // Target Browser URL
  const [browserUrl, setBrowserUrl] = useState<string>(() => allLabs[0].startingUrl);

  // Target Cookies
  const [cookies, setCookies] = useState<Record<string, string>>({
    session_id: 'sess_99a8b1c4',
    user_role: 'guest'
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

  // Settings Modal & API Keys
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deepInfraApiKey, setDeepInfraApiKey] = useState<string>(() => {
    return localStorage.getItem('hackerarena_deepinfra_key') || import.meta.env.VITE_DEEPINFRA_API_KEY || '';
  });
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('hackerarena_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  // UI Panels Layout
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [browserTab, setBrowserTab] = useState<'view' | 'repeater' | 'network' | 'source' | 'cookies'>('view');

  // DeepInfra Model
  const [deepInfraModel, setDeepInfraModel] = useState<string>(() => {
    return (
      localStorage.getItem('hackerarena_deepinfra_model') ||
      import.meta.env.VITE_DEEPINFRA_MODEL ||
      'meta-llama/Llama-3.3-70B-Instruct-Turbo'
    );
  });

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

  const handleToggleStage = (labId: string, stageId: number) => {
    setStageProgress((prev) => {
      const current = prev[labId] || [];
      const updated = current.includes(stageId)
        ? current.filter((id) => id !== stageId)
        : [...current, stageId];
      saveLabProgressRx(labId, updated, solvedLabIds.has(labId));
      if (currentUser?.id) {
        saveLabProgress(currentUser.id, labId, updated, solvedLabIds.has(labId));
      }
      return { ...prev, [labId]: updated };
    });
  };

  const handleTriggerXssAlert = (payload: string) => {
    setXssModal({ isOpen: true, payload });
  };

  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setAuthModal({ isOpen: false });
    await performCloudSync(user.id);
  };

  // Hub View Router
  const [currentView, setCurrentView] = useState<HubView>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.startsWith('#/legal') || hash.startsWith('#/disclaimer')) return 'disclaimer';
    if (hash.startsWith('#/kvkk')) return 'kvkk';
    if (hash.startsWith('#/hotel-breach')) return 'hotel-breach';
    if (hash.startsWith('#/arena') || hash.startsWith('#/challenge') || hash.startsWith('#/pentest')) return 'arena';
    return 'landing';
  });

  const [legalTopic, setLegalTopic] = useState<'disclaimer' | 'kvkk'>('disclaimer');

  // Supabase Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSyncingWithCloud, setIsSyncingWithCloud] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; reasonMessage?: string }>({ isOpen: false });

  // Quick Flag Input State
  const [quickFlagInput, setQuickFlagInput] = useState('');
  const [quickFlagStatus, setQuickFlagStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'already_solved';
    message: string;
  }>({ type: 'idle', message: '' });

  // Victory / Solved Modal State
  const [victoryModal, setVictoryModal] = useState<{
    isOpen: boolean;
    lab: LabItem | null;
    flag: string;
    points: number;
  }>({
    isOpen: false,
    lab: null,
    flag: '',
    points: 50
  });

  const handleCloseVictoryModal = useCallback(() => {
    setVictoryModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // RxDB subscription & initialization
  useEffect(() => {
    let unsubscribeRx: (() => void) | null = null;

    async function initFromRxDB() {
      try {
        const { solvedLabIds: sIds, stageProgress: stages, capturedFlags: flags } = await loadAllLabProgressRx();
        if (sIds.size > 0) {
          setSolvedLabIds(sIds);
        }
        if (Object.keys(stages).length > 0) {
          setStageProgress(stages);
        }
        if (Object.keys(flags).length > 0) {
          setCapturedFlags(flags);
        }

        unsubscribeRx = subscribeToLabProgressRx((state) => {
          setSolvedLabIds(state.solvedLabIds);
          setStageProgress((prev) => ({ ...prev, ...state.stageProgress }));
          setCapturedFlags((prev) => ({ ...prev, ...state.capturedFlags }));
        });
      } catch (err) {
        console.error('[RxDB Init] Progress fetch error:', err);
      }
    }

    initFromRxDB();
    return () => {
      if (unsubscribeRx) unsubscribeRx();
    };
  }, []);

  // Supabase Auth listener & cloud sync
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Ajan',
          role: 'Apprentice',
          provider: 'email',
          createdAt: session.user.created_at || new Date().toISOString(),
          avatarUrl: session.user.user_metadata?.avatar_url
        };
        setCurrentUser(user);
        performCloudSync(user.id);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Ajan',
          role: 'Apprentice',
          provider: 'email',
          createdAt: session.user.created_at || new Date().toISOString(),
          avatarUrl: session.user.user_metadata?.avatar_url
        };
        setCurrentUser(user);
        await performCloudSync(user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const performCloudSync = async (userId: string) => {
    setIsSyncingWithCloud(true);
    try {
      const merged = await syncLocalProgressWithCloud(userId, solvedLabIds, stageProgress, capturedFlags);
      setSolvedLabIds(merged.mergedSolved);
      setStageProgress(merged.mergedStages);
      setCapturedFlags(merged.mergedFlags);
    } catch (err) {
      console.error('Cloud sync error:', err);
    } finally {
      setIsSyncingWithCloud(false);
    }
  };

  // URL Hash router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();

      if (hash.startsWith('#/legal') || hash.startsWith('#/disclaimer')) {
        setCurrentView('disclaimer');
        setLegalTopic('disclaimer');
        return;
      }

      if (hash.startsWith('#/kvkk')) {
        setCurrentView('kvkk');
        setLegalTopic('kvkk');
        return;
      }

      if (hash.startsWith('#/hotel-breach')) {
        setCurrentView('hotel-breach');
        return;
      }

      if (hash.startsWith('#/landing')) {
        setCurrentView('landing');
        return;
      }

      const match = hash.match(/^#\/(?:pentest|challenge|lab)\/(.+)$/);
      if (match && match[1]) {
        const targetId = match[1];
        const lab = allLabs.find(
          (l) =>
            l.id.toLowerCase() === targetId ||
            l.id.toLowerCase() === `lab-${targetId}` ||
            l.id.toLowerCase() === targetId.replace('lab-', '')
        );
        if (lab && lab.id !== activeLabIdRef.current) {
          activeLabIdRef.current = lab.id;
          setCurrentLab(lab);
          setBrowserUrl(lab.startingUrl);
          setCurrentView('arena');
          return;
        }
      }

      if (hash === '#/arena') {
        setCurrentView('arena');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectLab = (lab: LabItem) => {
    activeLabIdRef.current = lab.id;
    setCurrentLab(lab);
    setBrowserUrl(lab.startingUrl);
    setHttpLogs([]);
    setQuickFlagStatus({ type: 'idle', message: '' });
    setQuickFlagInput('');
    resetDatabase();

    setCookies({
      session_id: `sess_${Math.random().toString(36).substr(2, 8)}`,
      user_role: 'guest'
    });

    if (window.location.hash !== `#/pentest/${lab.id}`) {
      window.location.hash = `#/pentest/${lab.id}`;
    }
  };

  const handleLabSolved = (labId: string, flagText?: string) => {
    const wasAlreadySolved = solvedLabIds.has(labId);
    setSolvedLabIds((prev) => new Set(prev).add(labId));

    const finalFlag = flagText || `FLAG{${labId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_SOLVED}`;
    const solvedAtIso = new Date().toISOString();

    setCapturedFlags((prev) => {
      const updated = {
        ...prev,
        [labId]: { flag: finalFlag, solvedAt: solvedAtIso }
      };
      saveCapturedFlagRx(labId, finalFlag);
      if (currentUser?.id) {
        saveCapturedFlag(currentUser.id, labId, finalFlag);
      }
      return updated;
    });

    const currentStages = stageProgress[labId] || [];
    saveLabProgressRx(labId, currentStages, true);

    if (currentUser?.id) {
      saveLabProgress(currentUser.id, labId, currentStages, true);
    }

    if (!wasAlreadySolved) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00ff9d', '#00f0ff', '#f59e0b', '#ffffff']
      });

      const solvedLabObj = allLabs.find((l) => l.id === labId) || currentLab;
      setVictoryModal({
        isOpen: true,
        lab: solvedLabObj,
        flag: finalFlag,
        points: 50
      });
    }
  };

  const handleFlagSubmit = (submittedFlag: string) => {
    const trimmed = submittedFlag.trim();
    if (!trimmed) {
      setQuickFlagStatus({ type: 'error', message: 'Lütfen bir bayrak girin!' });
      return;
    }

    const labId = currentLab.id;
    const isAlreadySolved = solvedLabIds.has(labId);

    const isValid = verifyLabFlag(labId, trimmed);

    if (isValid) {
      if (isAlreadySolved) {
        setQuickFlagStatus({
          type: 'already_solved',
          message: 'Bu laboratuvarın bayrağını zaten teslim ettiniz! Tebrikler.'
        });
      } else {
        handleLabSolved(labId, trimmed);
        setQuickFlagStatus({
          type: 'success',
          message: 'Tebrikler! Doğru bayrak kabul edildi (+100 Puan).'
        });
      }
      setQuickFlagInput('');
    } else {
      setQuickFlagStatus({
        type: 'error',
        message: 'Hatalı bayrak! Formatı veya istismar çıktısını kontrol edin.'
      });
    }
  };

  const handleLogHttpRequest = (req: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers: Record<string, string>;
    body?: string;
    responseStatus: number;
    responseHeaders: Record<string, string>;
    responseBody: string;
    durationMs?: number;
    isInitialLoad?: boolean;
  }) => {
    const newLog: HttpRequestLog = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      durationMs: req.durationMs || 25,
      ...req
    };
    setHttpLogs((prev) => [newLog, ...prev.slice(0, 49)]);

    if (currentLab && !req.isInitialLoad) {
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
          saveLabProgressRx(currentLab.id, updated, solvedLabIds.has(currentLab.id));
          if (currentUser?.id) {
            saveLabProgress(currentUser.id, currentLab.id, updated, solvedLabIds.has(currentLab.id));
          }
          return next;
        });
      }

      if (evalRes.isSolved && !solvedLabIds.has(currentLab.id)) {
        handleLabSolved(currentLab.id, evalRes.capturedFlag);
      }
    }

    return newLog;
  };

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
      handleSelectLab(allLabs[0]);
    }
  };

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
      setCurrentView('arena');
      if (window.location.hash !== `#/pentest/${currentLab.id}`) {
        window.location.hash = `#/pentest/${currentLab.id}`;
      }
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  const handleResetLocalData = async () => {
    if (window.confirm('Tüm çevrimdışı ilerlemeniz (RxDB & LocalStorage) sıfırlanacak. Emin misiniz?')) {
      await clearAllLocalProgressRx();
      setSolvedLabIds(new Set());
      setStageProgress({});
      setCapturedFlags({});
      localStorage.removeItem('hackerarena_progress');
      localStorage.removeItem('hackerarena_stages');
      localStorage.removeItem('hackerarena_captured_flags');
      window.location.reload();
    }
  };

  const handleResetCloudProgress = async () => {
    if (!currentUser) return;
    if (window.confirm('Buluttaki (Supabase) ve cihazınızdaki tüm çözümler silinecektir. Devam edilsin mi?')) {
      await resetUserCloudProgress(currentUser.id);
      await clearAllLocalProgressRx();
      setSolvedLabIds(new Set());
      setStageProgress({});
      setCapturedFlags({});
      window.location.reload();
    }
  };

  return {
    allLabs,
    currentLab,
    setCurrentLab,
    solvedLabIds,
    stageProgress,
    capturedFlags,
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
    setDeepInfraApiKey,
    geminiApiKey,
    setGeminiApiKey,
    isLeftCollapsed,
    setIsLeftCollapsed,
    isRightCollapsed,
    setIsRightCollapsed,
    browserTab,
    setBrowserTab,
    deepInfraModel,
    setDeepInfraModel,
    handleSaveDeepInfraKey,
    handleSaveDeepInfraModel,
    handleSaveGeminiKey,
    handleToggleStage,
    handleTriggerXssAlert,
    handleLoginSuccess,
    currentView,
    setCurrentView,
    legalTopic,
    setLegalTopic,
    currentUser,
    isSyncingWithCloud,
    authModal,
    setAuthModal,
    quickFlagInput,
    setQuickFlagInput,
    quickFlagStatus,
    setQuickFlagStatus,
    victoryModal,
    handleCloseVictoryModal,
    handleSelectLab,
    handleLabSolved,
    handleFlagSubmit,
    handleLogHttpRequest,
    handleTerminalHttpRequest,
    handleGoToNextLab,
    handleEnterArena,
    handleSignOut,
    handleResetLocalData,
    handleResetCloudProgress
  };
}
