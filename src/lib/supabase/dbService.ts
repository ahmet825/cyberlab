import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { UserProfile } from '../../types/user';

export interface CloudLabProgressRow {
  id?: string;
  user_id: string;
  lab_id: string;
  completed_stages: number[];
  is_solved: boolean;
  solved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CloudCapturedFlagRow {
  id?: string;
  user_id: string;
  lab_id: string;
  flag: string;
  captured_at?: string;
}

/**
 * Fetch profile for authenticated user from 'profiles' table protected by RLS
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      username: data.username || data.email.split('@')[0],
      role: data.role || 'Practitioner',
      provider: 'email',
      avatarUrl: data.avatar_url,
      createdAt: data.created_at
    };
  } catch (err) {
    console.warn('[Supabase RLS] fetchUserProfile exception:', err);
    return null;
  }
};

/**
 * Upsert user profile to 'profiles' table protected by RLS (auth.uid() = id)
 */
export const upsertUserProfile = async (profile: UserProfile): Promise<boolean> => {
  if (!isSupabaseConfigured() || !profile?.id) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          role: profile.role,
          avatar_url: profile.avatarUrl,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('[Supabase RLS] upsertUserProfile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase RLS] upsertUserProfile exception:', err);
    return false;
  }
};

/**
 * Fetch all lab progress for user from 'user_lab_progress' table protected by RLS
 */
export const fetchUserLabProgress = async (
  userId: string
): Promise<{ solvedLabIds: string[]; stageProgress: Record<string, number[]> } | null> => {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_lab_progress')
      .select('lab_id, completed_stages, is_solved')
      .eq('user_id', userId);

    if (error) {
      console.warn('[Supabase RLS] fetchUserLabProgress error:', error.message);
      return null;
    }

    const solvedLabIds: string[] = [];
    const stageProgress: Record<string, number[]> = {};

    for (const row of (data || []) as CloudLabProgressRow[]) {
      if (row.is_solved) {
        solvedLabIds.push(row.lab_id);
      }
      if (Array.isArray(row.completed_stages)) {
        stageProgress[row.lab_id] = row.completed_stages;
      }
    }

    return { solvedLabIds, stageProgress };
  } catch (err) {
    console.warn('[Supabase RLS] fetchUserLabProgress exception:', err);
    return null;
  }
};

/**
 * Persist or update lab stage progress and solved state into Supabase RLS database
 */
export const saveLabProgress = async (
  userId: string,
  labId: string,
  completedStages: number[],
  isSolved: boolean
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId || !labId) return false;

  try {
    const payload = {
      user_id: userId,
      lab_id: labId,
      completed_stages: completedStages,
      is_solved: isSolved,
      solved_at: isSolved ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_lab_progress')
      .upsert(payload, { onConflict: 'user_id,lab_id' });

    if (error) {
      console.warn(`[Supabase RLS] saveLabProgress error for ${labId}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase RLS] saveLabProgress exception for ${labId}:`, err);
    return false;
  }
};

/**
 * Fetch captured flags from 'user_captured_flags' table protected by RLS
 */
export const fetchCapturedFlags = async (
  userId: string
): Promise<Record<string, { flag: string; solvedAt: string }> | null> => {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_captured_flags')
      .select('lab_id, flag, captured_at')
      .eq('user_id', userId);

    if (error) {
      console.warn('[Supabase RLS] fetchCapturedFlags error:', error.message);
      return null;
    }

    const result: Record<string, { flag: string; solvedAt: string }> = {};
    for (const row of (data || []) as CloudCapturedFlagRow[]) {
      result[row.lab_id] = {
        flag: row.flag,
        solvedAt: row.captured_at || new Date().toISOString()
      };
    }
    return result;
  } catch (err) {
    console.warn('[Supabase RLS] fetchCapturedFlags exception:', err);
    return null;
  }
};

/**
 * Save captured flag to vault in Supabase RLS table
 */
export const saveCapturedFlag = async (
  userId: string,
  labId: string,
  flag: string
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId || !labId || !flag) return false;

  try {
    const { error } = await supabase
      .from('user_captured_flags')
      .upsert(
        {
          user_id: userId,
          lab_id: labId,
          flag,
          captured_at: new Date().toISOString()
        },
        { onConflict: 'user_id,lab_id' }
      );

    if (error) {
      console.warn(`[Supabase RLS] saveCapturedFlag error for ${labId}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase RLS] saveCapturedFlag exception for ${labId}:`, err);
    return false;
  }
};

/**
 * Bidirectional Synchronizer:
 * Merges local guest progress with cloud Supabase RLS database records.
 * Returns the merged sets so the UI is immediately up-to-date.
 */
export const syncLocalProgressWithCloud = async (
  userId: string,
  localSolved: Set<string>,
  localStages: Record<string, number[]>,
  localFlags: Record<string, { flag: string; solvedAt: string }>
): Promise<{
  mergedSolved: Set<string>;
  mergedStages: Record<string, number[]>;
  mergedFlags: Record<string, { flag: string; solvedAt: string }>;
}> => {
  if (!isSupabaseConfigured() || !userId) {
    return {
      mergedSolved: localSolved,
      mergedStages: localStages,
      mergedFlags: localFlags
    };
  }

  // 1. Fetch remote cloud records
  const cloudProgress = await fetchUserLabProgress(userId);
  const cloudFlags = await fetchCapturedFlags(userId);

  const mergedSolved = new Set<string>(localSolved);
  const mergedStages: Record<string, number[]> = { ...localStages };
  const mergedFlags: Record<string, { flag: string; solvedAt: string }> = { ...localFlags };

  // 2. Merge cloud data into local
  if (cloudProgress) {
    cloudProgress.solvedLabIds.forEach((id) => mergedSolved.add(id));
    for (const [labId, stages] of Object.entries(cloudProgress.stageProgress)) {
      const current = mergedStages[labId] || [];
      mergedStages[labId] = Array.from(new Set([...current, ...stages]));
    }
  }

  if (cloudFlags) {
    for (const [labId, item] of Object.entries(cloudFlags)) {
      if (!mergedFlags[labId]) {
        mergedFlags[labId] = item;
      }
    }
  }

  // 3. Write merged results back to Supabase RLS so cloud has all completed labs
  for (const labId of Object.keys(mergedStages)) {
    const isSolved = mergedSolved.has(labId);
    await saveLabProgress(userId, labId, mergedStages[labId], isSolved);
  }

  for (const [labId, flagInfo] of Object.entries(mergedFlags)) {
    await saveCapturedFlag(userId, labId, flagInfo.flag);
  }

  return {
    mergedSolved,
    mergedStages,
    mergedFlags
  };
};
