import { getRxDatabase } from './database';
import type { LabProgressDocType, CapturedFlagDocType } from './types';

export interface LocalLabState {
  solvedLabIds: Set<string>;
  stageProgress: Record<string, number[]>;
  capturedFlags: Record<string, { flag: string; solvedAt: string }>;
}

export const saveLabProgressRx = async (
  labId: string,
  completedStages: number[],
  isSolved: boolean
): Promise<void> => {
  try {
    const db = await getRxDatabase();
    const existing = await db.lab_progress.findOne(labId).exec();

    await db.lab_progress.upsert({
      labId,
      completedStages,
      isSolved: isSolved || existing?.isSolved || false,
      solvedAt: isSolved ? (existing?.solvedAt || new Date().toISOString()) : (existing?.solvedAt || null),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RxDB] saveLabProgressRx error:', err);
  }
};

export const saveCapturedFlagRx = async (
  labId: string,
  flag: string
): Promise<void> => {
  try {
    const db = await getRxDatabase();
    await db.captured_flags.upsert({
      labId,
      flag,
      capturedAt: new Date().toLocaleTimeString()
    });
  } catch (err) {
    console.warn('[RxDB] saveCapturedFlagRx error:', err);
  }
};

export const loadAllLabProgressRx = async (): Promise<LocalLabState> => {
  try {
    const db = await getRxDatabase();
    const [progressDocs, flagDocs] = await Promise.all([
      db.lab_progress.find().exec(),
      db.captured_flags.find().exec()
    ]);

    const solvedLabIds = new Set<string>();
    const stageProgress: Record<string, number[]> = {};
    const capturedFlags: Record<string, { flag: string; solvedAt: string }> = {};

    progressDocs.forEach((doc: any) => {
      const data: LabProgressDocType = doc.toJSON();
      if (data.isSolved) {
        solvedLabIds.add(data.labId);
      }
      if (data.completedStages && data.completedStages.length > 0) {
        stageProgress[data.labId] = data.completedStages;
      }
    });

    flagDocs.forEach((doc: any) => {
      const data: CapturedFlagDocType = doc.toJSON();
      capturedFlags[data.labId] = {
        flag: data.flag,
        solvedAt: data.capturedAt
      };
    });

    return { solvedLabIds, stageProgress, capturedFlags };
  } catch (err) {
    console.warn('[RxDB] loadAllLabProgressRx error:', err);
    return {
      solvedLabIds: new Set<string>(),
      stageProgress: {},
      capturedFlags: {}
    };
  }
};

export const resetSingleLabRx = async (labId: string): Promise<void> => {
  try {
    const db = await getRxDatabase();
    const progressDoc = await db.lab_progress.findOne(labId).exec();
    if (progressDoc) {
      await progressDoc.remove();
    }
    const flagDoc = await db.captured_flags.findOne(labId).exec();
    if (flagDoc) {
      await flagDoc.remove();
    }
  } catch (err) {
    console.warn('[RxDB] resetSingleLabRx error:', err);
  }
};

export const clearAllLocalProgressRx = async (): Promise<void> => {
  try {
    const db = await getRxDatabase();
    await Promise.all([
      db.lab_progress.find().remove(),
      db.captured_flags.find().remove()
    ]);
  } catch (err) {
    console.warn('[RxDB] clearAllLocalProgressRx error:', err);
  }
};

export const subscribeToLabProgressRx = (
  onChange: (state: LocalLabState) => void
): (() => void) => {
  let isSubscribed = true;
  let progressUnsub: (() => void) | null = null;
  let flagUnsub: (() => void) | null = null;

  getRxDatabase().then((db) => {
    if (!isSubscribed) return;

    const notify = async () => {
      const data = await loadAllLabProgressRx();
      if (isSubscribed) {
        onChange(data);
      }
    };

    const sub1 = db.lab_progress.find().$.subscribe(() => {
      notify();
    });

    const sub2 = db.captured_flags.find().$.subscribe(() => {
      notify();
    });

    progressUnsub = () => sub1.unsubscribe();
    flagUnsub = () => sub2.unsubscribe();
  }).catch((err) => {
    console.warn('[RxDB] subscribeToLabProgressRx error:', err);
  });

  return () => {
    isSubscribed = false;
    if (progressUnsub) progressUnsub();
    if (flagUnsub) flagUnsub();
  };
};

