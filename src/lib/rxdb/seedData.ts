import type { SiberAdamRxDatabase, CurriculumTrackDocType, CurriculumLabDocType, HotelQuizItemDocType } from './types';
import { CURRICULUM_TRACKS, ALL_SANDBOX_LABS } from '../../data/sandbox';
import { HOTEL_QUIZ_QUESTIONS, HOTEL_FILE_UPLOAD_QUIZ_QUESTIONS } from '../../data/hotelQuizData';

export const seedRxDatabase = async (db: SiberAdamRxDatabase): Promise<void> => {
  try {
    // 1. Seed Curriculum Tracks if empty
    const trackCount = await db.curriculum_tracks.count().exec();
    if (trackCount === 0) {
      const trackDocs: CurriculumTrackDocType[] = CURRICULUM_TRACKS.map((t, idx) => ({
        id: t.id,
        title: t.title,
        subtitle: t.subtitle,
        description: t.description,
        icon: t.icon,
        level: t.level,
        orderIndex: idx
      }));
      await db.curriculum_tracks.bulkInsert(trackDocs);
    }

    // 2. Seed Curriculum Labs if empty
    const labCount = await db.curriculum_labs.count().exec();
    if (labCount === 0) {
      const labDocs: CurriculumLabDocType[] = ALL_SANDBOX_LABS.map((lab, idx) => ({
        id: lab.id,
        title: lab.title,
        trackId: lab.trackId,
        category: lab.category,
        difficulty: lab.difficulty,
        estimatedMinutes: lab.estimatedMinutes,
        description: lab.description,
        objective: lab.objective,
        startingUrl: lab.startingUrl,
        tags: lab.tags || [],
        hints: lab.hints || [],
        stages: lab.stages || [],
        solutionExplanation: lab.solutionExplanation || '',
        defenseMechanisms: lab.defenseMechanisms || [],
        flagHash: lab.flagHash || '',
        orderIndex: idx
      }));
      await db.curriculum_labs.bulkInsert(labDocs);
    }

    // 3. Seed Hotel Quiz Questions if empty
    const quizCount = await db.hotel_quiz_items.count().exec();
    if (quizCount === 0) {
      const quizDocs: HotelQuizItemDocType[] = [
        ...HOTEL_QUIZ_QUESTIONS.map((q, idx) => ({
          id: `api_q${q.id}`,
          scenario: 'api' as const,
          questionId: q.id,
          title: q.title,
          category: q.category,
          vulnerableCode: q.vulnerableCode,
          fixedCode: q.fixedCode,
          question: q.question,
          options: q.options,
          explanation: q.explanation,
          theoryHint: q.theoryHint,
          orderIndex: idx
        })),
        ...HOTEL_FILE_UPLOAD_QUIZ_QUESTIONS.map((q, idx) => ({
          id: `file-upload_q${q.id}`,
          scenario: 'file-upload' as const,
          questionId: q.id,
          title: q.title,
          category: q.category,
          vulnerableCode: q.vulnerableCode,
          fixedCode: q.fixedCode,
          question: q.question,
          options: q.options,
          explanation: q.explanation,
          theoryHint: q.theoryHint,
          orderIndex: idx + 100
        }))
      ];
      await db.hotel_quiz_items.bulkInsert(quizDocs);
    }
  } catch (err) {
    console.warn('[RxDB] seedRxDatabase error:', err);
  }
};

