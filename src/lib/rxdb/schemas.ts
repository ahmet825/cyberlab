import { toTypedRxJsonSchema, type RxJsonSchema } from 'rxdb';
import type {
  LabProgressDocType,
  CapturedFlagDocType,
  HotelQuizAnswerDocType,
  HotelQuizSessionDocType,
  CurriculumTrackDocType,
  CurriculumLabDocType,
  HotelQuizItemDocType
} from './types';

export const LAB_PROGRESS_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: 'labId',
  type: 'object',
  properties: {
    labId: { type: 'string', maxLength: 100 },
    completedStages: { type: 'array', items: { type: 'number' } },
    isSolved: { type: 'boolean' },
    solvedAt: { type: ['string', 'null'] },
    updatedAt: { type: 'string', maxLength: 50 }
  },
  required: ['labId', 'completedStages', 'isSolved', 'updatedAt']
} as const;

export const labProgressSchema: RxJsonSchema<LabProgressDocType> = toTypedRxJsonSchema(LAB_PROGRESS_SCHEMA_LITERAL);

export const CAPTURED_FLAGS_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: 'labId',
  type: 'object',
  properties: {
    labId: { type: 'string', maxLength: 100 },
    flag: { type: 'string' },
    capturedAt: { type: 'string', maxLength: 50 }
  },
  required: ['labId', 'flag', 'capturedAt']
} as const;

export const capturedFlagsSchema: RxJsonSchema<CapturedFlagDocType> = toTypedRxJsonSchema(CAPTURED_FLAGS_SCHEMA_LITERAL);

export const HOTEL_QUIZ_ANSWERS_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    scenario: { type: 'string', maxLength: 50 },
    questionId: { type: 'number' },
    selectedKey: { type: 'string', maxLength: 10 },
    isCorrect: { type: 'boolean' },
    answeredAt: { type: 'string', maxLength: 50 }
  },
  required: ['id', 'scenario', 'questionId', 'selectedKey', 'isCorrect', 'answeredAt']
} as const;

export const hotelQuizAnswersSchema: RxJsonSchema<HotelQuizAnswerDocType> = toTypedRxJsonSchema(HOTEL_QUIZ_ANSWERS_SCHEMA_LITERAL);

export const HOTEL_QUIZ_SESSIONS_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: 'scenario',
  type: 'object',
  properties: {
    scenario: { type: 'string', maxLength: 50 },
    scorePercent: { type: 'number' },
    correctCount: { type: 'number' },
    totalQuestions: { type: 'number' },
    isSubmitted: { type: 'boolean' },
    isPass: { type: 'boolean' },
    updatedAt: { type: 'string', maxLength: 50 }
  },
  required: ['scenario', 'scorePercent', 'correctCount', 'totalQuestions', 'isSubmitted', 'isPass', 'updatedAt']
} as const;

export const hotelQuizSessionsSchema: RxJsonSchema<HotelQuizSessionDocType> = toTypedRxJsonSchema(HOTEL_QUIZ_SESSIONS_SCHEMA_LITERAL);

export const CURRICULUM_TRACKS_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    subtitle: { type: 'string' },
    description: { type: 'string' },
    icon: { type: 'string' },
    level: { type: 'string' },
    orderIndex: { type: 'number' }
  },
  required: ['id', 'title', 'subtitle', 'description', 'icon', 'level', 'orderIndex']
} as const;

export const curriculumTracksSchema: RxJsonSchema<CurriculumTrackDocType> = toTypedRxJsonSchema(CURRICULUM_TRACKS_SCHEMA_LITERAL);

export const CURRICULUM_LABS_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    trackId: { type: 'string', maxLength: 50 },
    category: { type: 'string' },
    difficulty: { type: 'string' },
    estimatedMinutes: { type: 'number' },
    description: { type: 'string' },
    objective: { type: 'string' },
    startingUrl: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    hints: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          level: { type: 'number' },
          title: { type: 'string' },
          content: { type: 'string' }
        },
        required: ['level', 'title', 'content']
      }
    },
    stages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          objective: { type: 'string' },
          guidance: { type: 'string' },
          isCompleted: { type: 'boolean' }
        },
        required: ['id', 'title', 'objective', 'guidance']
      }
    },
    solutionExplanation: { type: 'string' },
    defenseMechanisms: { type: 'array', items: { type: 'string' } },
    flagHash: { type: 'string' },
    orderIndex: { type: 'number' }
  },
  required: [
    'id',
    'title',
    'trackId',
    'category',
    'difficulty',
    'estimatedMinutes',
    'description',
    'objective',
    'startingUrl',
    'tags',
    'hints',
    'stages',
    'solutionExplanation',
    'defenseMechanisms',
    'flagHash',
    'orderIndex'
  ]
} as const;

export const curriculumLabsSchema: RxJsonSchema<CurriculumLabDocType> = toTypedRxJsonSchema(CURRICULUM_LABS_SCHEMA_LITERAL);

export const HOTEL_QUIZ_ITEMS_SCHEMA_LITERAL = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    scenario: { type: 'string', maxLength: 50 },
    questionId: { type: 'number' },
    title: { type: 'string' },
    category: { type: 'string' },
    vulnerableCode: { type: 'string' },
    fixedCode: { type: 'string' },
    question: { type: 'string' },
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          text: { type: 'string' },
          isCorrect: { type: 'boolean' }
        },
        required: ['key', 'text', 'isCorrect']
      }
    },
    explanation: { type: 'string' },
    theoryHint: { type: 'string' },
    orderIndex: { type: 'number' }
  },
  required: [
    'id',
    'scenario',
    'questionId',
    'title',
    'category',
    'question',
    'options',
    'explanation',
    'theoryHint',
    'orderIndex'
  ]
} as const;

export const hotelQuizItemsSchema: RxJsonSchema<HotelQuizItemDocType> = toTypedRxJsonSchema(HOTEL_QUIZ_ITEMS_SCHEMA_LITERAL);


