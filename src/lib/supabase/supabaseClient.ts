import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile } from '../../types/user';

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('hackerarena_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('hackerarena_supabase_anon_key') : null;

  const url = (envUrl || storedUrl || '').trim();
  const anonKey = (envKey || storedKey || '').trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    !url.includes('placeholder')
  );

  return {
    url: url || 'https://placeholder.supabase.co',
    anonKey: anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',
    isConfigured
  };
};

let currentConfig = getSupabaseConfig();

export let supabase: SupabaseClient = createClient(currentConfig.url, currentConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const reinitializeSupabaseClient = () => {
  currentConfig = getSupabaseConfig();
  supabase = createClient(currentConfig.url, currentConfig.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return supabase;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

export const setSupabaseCredentials = (url: string, anonKey: string) => {
  localStorage.setItem('hackerarena_supabase_url', url.trim());
  localStorage.setItem('hackerarena_supabase_anon_key', anonKey.trim());
  reinitializeSupabaseClient();
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('hackerarena_supabase_url');
  localStorage.removeItem('hackerarena_supabase_anon_key');
  reinitializeSupabaseClient();
};

/**
 * Production Google OAuth Sign In
 */
export const signInWithGoogleOAuth = async () => {
  const { isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      data: null,
      error: new Error('Kimlik doğrulama sunucusu yapılandırılmamış. Lütfen sistem yöneticisiyle iletişime geçin.')
    };
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
};

/**
 * Production Email & Password Sign In
 */
export const signInWithEmail = async (email: string, pass: string) => {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      user: null,
      error: 'Kimlik doğrulama sunucusu yapılandırılmamış. Lütfen sistem yöneticisiyle iletişime geçin.'
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: pass
  });

  if (error) {
    let msg = error.message;
    if (error.message.includes('Invalid login credentials')) {
      msg = 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
    } else if (error.message.includes('Email not confirmed')) {
      msg = 'E-posta adresiniz henüz onaylanmamış. Lütfen gelen kutunuzu kontrol edin.';
    }
    return { user: null, error: msg };
  }

  const sbUser = data.user;
  const username = sbUser?.user_metadata?.username || email.split('@')[0];
  const profile: UserProfile = {
    id: sbUser.id,
    email: sbUser.email || email,
    username,
    role: (sbUser?.user_metadata?.role as any) || 'Practitioner',
    provider: 'email',
    avatarUrl: sbUser?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    createdAt: sbUser.created_at || new Date().toISOString()
  };

  localStorage.setItem('hackerarena_user', JSON.stringify(profile));
  return { user: profile, error: null };
};

/**
 * Production Email & Password Sign Up
 */
export const signUpWithEmail = async (email: string, pass: string, chosenUsername?: string) => {
  const { isConfigured } = getSupabaseConfig();
  const username = chosenUsername?.trim() || email.split('@')[0] || 'operatör';

  if (!isConfigured) {
    return {
      user: null,
      error: 'Kimlik doğrulama sunucusu yapılandırılmamış. Lütfen sistem yöneticisiyle iletişime geçin.'
    };
  }

  if (pass.length < 6) {
    return {
      user: null,
      error: 'Şifreniz güvenlik standartları gereği en az 6 karakter olmalıdır.'
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: pass,
    options: {
      data: {
        username,
        role: 'Practitioner',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
      }
    }
  });

  if (error) {
    let msg = error.message;
    if (error.message.includes('User already registered')) {
      msg = 'Bu e-posta adresiyle kayıtlı bir hesap zaten var. Lütfen giriş yapın.';
    }
    return { user: null, error: msg };
  }

  const sbUser = data.user;
  if (!sbUser) {
    return { user: null, error: 'Kayıt işlemi tamamlanamadı.' };
  }

  const profile: UserProfile = {
    id: sbUser.id,
    email: sbUser.email || email,
    username,
    role: 'Practitioner',
    provider: 'email',
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    createdAt: sbUser.created_at || new Date().toISOString()
  };

  localStorage.setItem('hackerarena_user', JSON.stringify(profile));
  return {
    user: profile,
    error: null,
    needsEmailConfirmation: !data.session
  };
};

/**
 * Production Password Reset Request
 */
export const requestPasswordReset = async (email: string) => {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { error: 'Kimlik doğrulama sunucusu yapılandırılmamış.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/#/auth/reset`
  });

  if (error) {
    return { error: error.message };
  }
  return { error: null };
};

/**
 * Production User Sign Out
 */
export const signOutUser = async () => {
  const { isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut warning:', err);
    }
  }
  localStorage.removeItem('hackerarena_user');
};

export const getSupabaseSession = async () => {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
};
