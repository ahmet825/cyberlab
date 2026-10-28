-- ==============================================================================
-- SİBERADAM // GERÇEK SUPABASE POSTGRESQL ROW LEVEL SECURITY (RLS) MİMARİSİ
-- ==============================================================================
-- Bu SQL betiğini Supabase Dashboard -> SQL Editor içine yapıştırıp RUN diyerek
-- tüm tabloları, RLS güvenlik politikalarını ve otomatik kullanıcı trigger'ını kurabilirsiniz.

-- 1. PROFILES TABLOSU (Kullanıcı Kimlik ve Yetki Bilgileri)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'Practitioner',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. USER_LAB_PROGRESS TABLOSU (Çözülen Lablar ve Aşama İlerlemeleri)
CREATE TABLE IF NOT EXISTS public.user_lab_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lab_id TEXT NOT NULL,
  completed_stages INTEGER[] DEFAULT '{}'::INTEGER[],
  is_solved BOOLEAN DEFAULT FALSE,
  solved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_lab UNIQUE (user_id, lab_id)
);

-- 3. USER_CAPTURED_FLAGS TABLOSU (Ele Geçirilen Sistem Bayrakları Kasa Kaydı)
CREATE TABLE IF NOT EXISTS public.user_captured_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lab_id TEXT NOT NULL,
  flag TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_flag UNIQUE (user_id, lab_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI (Veri İzolasyonu & Güvenlik Kalkanı)
-- ==============================================================================

-- 4. PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanıcılar kendi profilini görebilir" ON public.profiles;
CREATE POLICY "Kullanıcılar kendi profilini görebilir"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Kullanıcılar kendi profilini güncelleyebilir" ON public.profiles;
CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Kullanıcılar kendi profilini ekleyebilir" ON public.profiles;
CREATE POLICY "Kullanıcılar kendi profilini ekleyebilir"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. USER_LAB_PROGRESS RLS
ALTER TABLE public.user_lab_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanıcı sadece kendi lab ilerlemesini okuyabilir" ON public.user_lab_progress;
CREATE POLICY "Kullanıcı sadece kendi lab ilerlemesini okuyabilir"
  ON public.user_lab_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi lab ilerlemesini kaydedebilir" ON public.user_lab_progress;
CREATE POLICY "Kullanıcı kendi lab ilerlemesini kaydedebilir"
  ON public.user_lab_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi lab ilerlemesini güncelleyebilir" ON public.user_lab_progress;
CREATE POLICY "Kullanıcı kendi lab ilerlemesini güncelleyebilir"
  ON public.user_lab_progress FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi lab ilerlemesini silebilir" ON public.user_lab_progress;
CREATE POLICY "Kullanıcı kendi lab ilerlemesini silebilir"
  ON public.user_lab_progress FOR DELETE
  USING (auth.uid() = user_id);

-- 6. USER_CAPTURED_FLAGS RLS
ALTER TABLE public.user_captured_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanıcı sadece kendi bayraklarını görebilir" ON public.user_captured_flags;
CREATE POLICY "Kullanıcı sadece kendi bayraklarını görebilir"
  ON public.user_captured_flags FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi bayrağını kaydedebilir" ON public.user_captured_flags;
CREATE POLICY "Kullanıcı kendi bayrağını kaydedebilir"
  ON public.user_captured_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcı kendi bayrağını silebilir" ON public.user_captured_flags;
CREATE POLICY "Kullanıcı kendi bayrağını silebilir"
  ON public.user_captured_flags FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- OTOMATİK KULLANICI PROFİLİ OLUŞTURMA TRIGGER'I (Yeni Kayıtlarda Çalışır)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
BEGIN
  -- Eğer metadata'dan gelen username yoksa email prefix'ini al
  default_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text FROM 1 FOR 4)
  );

  INSERT INTO public.profiles (id, email, username, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    default_username,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Practitioner'),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/bottts/svg?seed=' || default_username
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- HIZLI İNDEKSLEME
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_user_lab_progress_user ON public.user_lab_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_captured_flags_user ON public.user_captured_flags(user_id);
