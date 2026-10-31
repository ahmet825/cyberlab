import { getRxDatabase } from './database';
import type { HotelQuizAnswerDocType, HotelQuizSessionDocType } from './types';

export interface HotelQuizState {
  userAnswers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  session: HotelQuizSessionDocType | null;
}

export const saveHotelAnswerRx = async (
  scenario: 'api' | 'file-upload',
  questionId: number,
  selectedKey: 'A' | 'B' | 'C' | 'D',
  isCorrect: boolean
): Promise<void> => {
  try {
    const db = await getRxDatabase();
    const id = `${scenario}_q${questionId}`;

    await db.hotel_quiz_answers.upsert({
      id,
      scenario,
      questionId,
      selectedKey,
      isCorrect,
      answeredAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RxDB] saveHotelAnswerRx error:', err);
  }
};

export const saveHotelQuizSessionRx = async (
  session: HotelQuizSessionDocType
): Promise<void> => {
  try {
    const db = await getRxDatabase();
    await db.hotel_quiz_sessions.upsert({
      ...session,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RxDB] saveHotelQuizSessionRx error:', err);
  }
};

export const loadHotelQuizStateRx = async (
  scenario: 'api' | 'file-upload'
): Promise<HotelQuizState> => {
  try {
    const db = await getRxDatabase();
    const [answerDocs, sessionDoc] = await Promise.all([
      db.hotel_quiz_answers.find({
        selector: { scenario }
      }).exec(),
      db.hotel_quiz_sessions.findOne(scenario).exec()
    ]);

    const userAnswers: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
    answerDocs.forEach((doc: any) => {
      const data: HotelQuizAnswerDocType = doc.toJSON();
      userAnswers[data.questionId] = data.selectedKey;
    });

    const session: HotelQuizSessionDocType | null = sessionDoc ? sessionDoc.toJSON() : null;

    return { userAnswers, session };
  } catch (err) {
    console.warn('[RxDB] loadHotelQuizStateRx error:', err);
    return { userAnswers: {}, session: null };
  }
};

export const resetHotelQuizRx = async (
  scenario: 'api' | 'file-upload'
): Promise<void> => {
  try {
    const db = await getRxDatabase();
    const [answers, session] = await Promise.all([
      db.hotel_quiz_answers.find({ selector: { scenario } }).exec(),
      db.hotel_quiz_sessions.findOne(scenario).exec()
    ]);

    await Promise.all([
      ...answers.map((doc: any) => doc.remove()),
      session ? session.remove() : Promise.resolve()
    ]);
  } catch (err) {
    console.warn('[RxDB] resetHotelQuizRx error:', err);
  }
};

export const subscribeToHotelQuizRx = (
  scenario: 'api' | 'file-upload',
  onChange: (state: HotelQuizState) => void
): (() => void) => {
  let isSubscribed = true;
  let sub1Unsub: (() => void) | null = null;
  let sub2Unsub: (() => void) | null = null;

  getRxDatabase().then((db) => {
    if (!isSubscribed) return;

    const notify = async () => {
      const state = await loadHotelQuizStateRx(scenario);
      if (isSubscribed) {
        onChange(state);
      }
    };

    const sub1 = db.hotel_quiz_answers.find({ selector: { scenario } }).$.subscribe(() => {
      notify();
    });

    const sub2 = db.hotel_quiz_sessions.findOne(scenario).$.subscribe(() => {
      notify();
    });

    sub1Unsub = () => sub1.unsubscribe();
    sub2Unsub = () => sub2.unsubscribe();
  }).catch((err) => {
    console.warn('[RxDB] subscribeToHotelQuizRx error:', err);
  });

  return () => {
    isSubscribed = false;
    if (sub1Unsub) sub1Unsub();
    if (sub2Unsub) sub2Unsub();
  };
};

