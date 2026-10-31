import type { RxCollection, RxDatabase, RxDocument } from 'rxdb';

export interface LabProgressDocType {
  labId: string;
  completedStages: number[];
  isSolved: boolean;
  solvedAt: string | null;
  updatedAt: string;
}

export type LabProgressDocument = RxDocument<LabProgressDocType>;
export type LabProgressCollection = RxCollection<LabProgressDocType>;

export interface CapturedFlagDocType {
  labId: string;
  flag: string;
  capturedAt: string;
}

export type CapturedFlagDocument = RxDocument<CapturedFlagDocType>;
export type CapturedFlagCollection = RxCollection<CapturedFlagDocType>;

export interface HotelQuizAnswerDocType {
  id: string; // `${scenario}_q${questionId}`
  scenario: 'api' | 'file-upload';
  questionId: number;
  selectedKey: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  answeredAt: string;
}

export type HotelQuizAnswerDocument = RxDocument<HotelQuizAnswerDocType>;
export type HotelQuizAnswerCollection = RxCollection<HotelQuizAnswerDocType>;

export interface HotelQuizSessionDocType {
  scenario: 'api' | 'file-upload';
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  isSubmitted: boolean;
  isPass: boolean;
  updatedAt: string;
}

export type HotelQuizSessionDocument = RxDocument<HotelQuizSessionDocType>;
export type HotelQuizSessionCollection = RxCollection<HotelQuizSessionDocType>;

export interface CurriculumTrackDocType {
  id: string; // 'track-recon-entry', etc.
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  level: string;
  orderIndex: number;
}

export type CurriculumTrackDocument = RxDocument<CurriculumTrackDocType>;
export type CurriculumTrackCollection = RxCollection<CurriculumTrackDocType>;

export interface CurriculumLabDocType {
  id: string; // 'lab-recon-robots', etc.
  title: string;
  trackId: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
  objective: string;
  startingUrl: string;
  tags: string[];
  hints: {
    level: number;
    title: string;
    content: string;
  }[];
  stages: {
    id: number;
    title: string;
    objective: string;
    guidance: string;
    isCompleted?: boolean;
  }[];
  solutionExplanation: string;
  defenseMechanisms: string[];
  flagHash: string;
  orderIndex: number;
}

export type CurriculumLabDocument = RxDocument<CurriculumLabDocType>;
export type CurriculumLabCollection = RxCollection<CurriculumLabDocType>;

export interface HotelQuizItemDocType {
  id: string; // `${scenario}_q${questionId}`
  scenario: 'api' | 'file-upload';
  questionId: number;
  title: string;
  category: string;
  vulnerableCode?: string;
  fixedCode?: string;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  theoryHint: string;
  orderIndex: number;
}

export type HotelQuizItemDocument = RxDocument<HotelQuizItemDocType>;
export type HotelQuizItemCollection = RxCollection<HotelQuizItemDocType>;

export interface SiberAdamCollections {
  lab_progress: LabProgressCollection;
  captured_flags: CapturedFlagCollection;
  hotel_quiz_answers: HotelQuizAnswerCollection;
  hotel_quiz_sessions: HotelQuizSessionCollection;
  curriculum_tracks: CurriculumTrackCollection;
  curriculum_labs: CurriculumLabCollection;
  hotel_quiz_items: HotelQuizItemCollection;
}

export type SiberAdamRxDatabase = RxDatabase<SiberAdamCollections>;

