import { getRxDatabase } from './database';
import type { LabItem, LabTrack, VulnerabilityCategory, DifficultyLevel } from '../../types/lab';
import { ALL_SANDBOX_LABS, CURRICULUM_TRACKS } from '../../data/sandbox';

export const getRxLabs = async (): Promise<LabItem[]> => {
  try {
    const db = await getRxDatabase();
    const docs = await db.curriculum_labs.find({
      sort: [{ orderIndex: 'asc' }]
    }).exec();

    if (docs.length === 0) {
      return ALL_SANDBOX_LABS;
    }

    return docs.map((d: any) => {
      const data = d.toJSON();
      return {
        id: data.id,
        title: data.title,
        trackId: data.trackId,
        category: data.category as VulnerabilityCategory,
        difficulty: data.difficulty as DifficultyLevel,
        estimatedMinutes: data.estimatedMinutes,
        description: data.description,
        objective: data.objective,
        startingUrl: data.startingUrl,
        tags: data.tags,
        hints: data.hints,
        stages: data.stages,
        solutionExplanation: data.solutionExplanation,
        defenseMechanisms: data.defenseMechanisms,
        flagHash: data.flagHash
      };
    });
  } catch (err) {
    console.warn('[RxDB] getRxLabs error:', err);
    return ALL_SANDBOX_LABS;
  }
};

export const getRxTracks = async (): Promise<LabTrack[]> => {
  try {
    const [labs, db] = await Promise.all([getRxLabs(), getRxDatabase()]);
    const docs = await db.curriculum_tracks.find({
      sort: [{ orderIndex: 'asc' }]
    }).exec();

    if (docs.length === 0) {
      return CURRICULUM_TRACKS;
    }

    return docs.map((d: any) => {
      const data = d.toJSON();
      return {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        icon: data.icon,
        level: data.level,
        labs: labs.filter((l) => l.trackId === data.id)
      };
    });
  } catch (err) {
    console.warn('[RxDB] getRxTracks error:', err);
    return CURRICULUM_TRACKS;
  }
};

export const observeRxLabs = (
  onChange: (labs: LabItem[]) => void
): (() => void) => {
  let isSubscribed = true;
  let subUnsub: (() => void) | null = null;

  getRxDatabase().then((db) => {
    if (!isSubscribed) return;

    const sub = db.curriculum_labs.find({
      sort: [{ orderIndex: 'asc' }]
    }).$.subscribe(async () => {
      if (isSubscribed) {
        const labs = await getRxLabs();
        onChange(labs);
      }
    });

    subUnsub = () => sub.unsubscribe();
  }).catch((err) => {
    console.warn('[RxDB] observeRxLabs error:', err);
  });

  return () => {
    isSubscribed = false;
    if (subUnsub) subUnsub();
  };
};

