import { getRxDatabase } from './database';
import type { QuizQuestion } from '../../data/hotelQuizData';
import { HOTEL_QUIZ_QUESTIONS, HOTEL_FILE_UPLOAD_QUIZ_QUESTIONS } from '../../data/hotelQuizData';

export const getRxHotelQuestions = async (
  scenario: 'api' | 'file-upload' = 'api'
): Promise<QuizQuestion[]> => {
  const fallback = scenario === 'file-upload' ? HOTEL_FILE_UPLOAD_QUIZ_QUESTIONS : HOTEL_QUIZ_QUESTIONS;

  try {
    const db = await getRxDatabase();
    const docs = await db.hotel_quiz_items.find({
      selector: { scenario },
      sort: [{ orderIndex: 'asc' }]
    }).exec();

    if (docs.length === 0) {
      return fallback;
    }

    return docs.map((d: any) => {
      const data = d.toJSON();
      return {
        id: data.questionId,
        title: data.title,
        category: data.category,
        vulnerableCode: data.vulnerableCode,
        fixedCode: data.fixedCode,
        question: data.question,
        options: data.options,
        explanation: data.explanation,
        theoryHint: data.theoryHint
      };
    });
  } catch (err) {
    console.warn('[RxDB] getRxHotelQuestions error:', err);
    return fallback;
  }
};

export const observeRxHotelQuestions = (
  scenario: 'api' | 'file-upload',
  onChange: (questions: QuizQuestion[]) => void
): (() => void) => {
  let isSubscribed = true;
  let subUnsub: (() => void) | null = null;

  getRxDatabase().then((db) => {
    if (!isSubscribed) return;

    const sub = db.hotel_quiz_items.find({
      selector: { scenario },
      sort: [{ orderIndex: 'asc' }]
    }).$.subscribe(async () => {
      if (isSubscribed) {
        const questions = await getRxHotelQuestions(scenario);
        onChange(questions);
      }
    });

    subUnsub = () => sub.unsubscribe();
  }).catch((err) => {
    console.warn('[RxDB] observeRxHotelQuestions error:', err);
  });

  return () => {
    isSubscribed = false;
    if (subUnsub) subUnsub();
  };
};

