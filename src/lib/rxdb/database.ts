import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import {
  labProgressSchema,
  capturedFlagsSchema,
  hotelQuizAnswersSchema,
  hotelQuizSessionsSchema,
  curriculumTracksSchema,
  curriculumLabsSchema,
  hotelQuizItemsSchema
} from './schemas';
import type { SiberAdamRxDatabase } from './types';
import { seedRxDatabase } from './seedData';

let dbPromise: Promise<SiberAdamRxDatabase> | null = null;

const createDatabase = async (): Promise<SiberAdamRxDatabase> => {
  const storage = typeof window !== 'undefined' && window.indexedDB
    ? getRxStorageDexie()
    : getRxStorageMemory();

  const db = await createRxDatabase<SiberAdamRxDatabase>({
    name: 'siberadam_rxdb_v1',
    storage,
    ignoreDuplicate: true
  });

  await db.addCollections({
    lab_progress: { schema: labProgressSchema },
    captured_flags: { schema: capturedFlagsSchema },
    hotel_quiz_answers: { schema: hotelQuizAnswersSchema },
    hotel_quiz_sessions: { schema: hotelQuizSessionsSchema },
    curriculum_tracks: { schema: curriculumTracksSchema },
    curriculum_labs: { schema: curriculumLabsSchema },
    hotel_quiz_items: { schema: hotelQuizItemsSchema }
  });

  // Seed static curriculum and quiz items into RxDB on first initialization
  await seedRxDatabase(db);

  return db;
};

export const getRxDatabase = (): Promise<SiberAdamRxDatabase> => {
  if (!dbPromise) {
    dbPromise = createDatabase();
  }
  return dbPromise;
};

