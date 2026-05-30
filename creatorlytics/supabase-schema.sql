-- ══════════════════════════════════════════════════════════════
-- Creatorlytics v2 — Full Supabase Schema
-- Jalankan SQL ini di Supabase SQL Editor (satu kali)
-- ══════════════════════════════════════════════════════════════

-- ══ TABEL 1: User Profiles ══
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  display_name TEXT,
  niche       TEXT DEFAULT '',
  er_mode     TEXT DEFAULT 'impression',
  theme       TEXT DEFAULT 'dark',
  created_at  TIMESTAMPTZ DEFAULT now(),
  last_seen   TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile saat user baru register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ══ TABEL 2: Accounts ══
CREATE TABLE IF NOT EXISTS accounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 3: Platforms ══
CREATE TABLE IF NOT EXISTS platforms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL,
  name        TEXT NOT NULL,
  emoji       TEXT DEFAULT ''
);

-- ══ TABEL 4: Posts ══
CREATE TABLE IF NOT EXISTS posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account          TEXT NOT NULL,
  platform         TEXT NOT NULL,
  date             DATE,
  name             TEXT DEFAULT '',
  reach            INT DEFAULT 0,
  impression       INT DEFAULT 0,
  "like"           INT DEFAULT 0,
  "comment"        INT DEFAULT 0,
  "share"          INT DEFAULT 0,
  save             INT DEFAULT 0,
  repost           INT DEFAULT 0,
  followers_gained INT DEFAULT 0,
  profile_visit    INT DEFAULT 0,
  pillar           TEXT DEFAULT 'other',
  format           TEXT DEFAULT '',
  caption_len      INT DEFAULT 0,
  link             TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_date_idx ON posts(date DESC);
CREATE INDEX IF NOT EXISTS posts_platform_idx ON posts(platform);
CREATE INDEX IF NOT EXISTS posts_user_date_idx ON posts(user_id, date DESC);

-- ══ TABEL 5: Goals ══
CREATE TABLE IF NOT EXISTS goals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  emoji      TEXT DEFAULT '',
  target     NUMERIC DEFAULT 0,
  platform   TEXT DEFAULT 'all',
  metric     TEXT NOT NULL,
  month      INT,
  year       INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 6: Content Ideas ══
CREATE TABLE IF NOT EXISTS content_ideas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  "desc"     TEXT DEFAULT '',
  platform   TEXT DEFAULT '',
  pillar     TEXT DEFAULT '',
  format     TEXT DEFAULT '',
  "status"   TEXT DEFAULT 'idea',
  priority   TEXT DEFAULT 'med',
  tags       TEXT[] DEFAULT '{}',
  brief      JSONB DEFAULT '{}',
  ref_links  JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 7: Calendar Events ══
CREATE TABLE IF NOT EXISTS calendar_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  platform       TEXT DEFAULT '',
  account        TEXT DEFAULT '',
  pillar         TEXT DEFAULT '',
  format         TEXT DEFAULT '',
  scheduled_date DATE,
  scheduled_time TEXT DEFAULT '',
  "status"       TEXT DEFAULT 'idea',
  idea_id        UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  notes          TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 8: Competitors ══
CREATE TABLE IF NOT EXISTS competitors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  platform    TEXT NOT NULL,
  followers   INT DEFAULT 0,
  avg_reach   INT DEFAULT 0,
  avg_er      NUMERIC DEFAULT 0,
  post_freq   NUMERIC DEFAULT 0,
  notes       TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 9: Pillars ══
CREATE TABLE IF NOT EXISTS pillars (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id  TEXT NOT NULL,
  label      TEXT NOT NULL,
  emoji      TEXT DEFAULT '',
  color      TEXT DEFAULT '#6B7280',
  bg         TEXT DEFAULT '#F9FAFB'
);

-- ══ ROW LEVEL SECURITY ══

ALTER TABLE user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms       ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars         ENABLE ROW LEVEL SECURITY;

-- Hapus policies lama (kalau ada)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can view own platforms" ON platforms;
  DROP POLICY IF EXISTS "Users can insert own platforms" ON platforms;
  DROP POLICY IF EXISTS "Users can update own platforms" ON platforms;
  DROP POLICY IF EXISTS "Users can delete own platforms" ON platforms;
  DROP POLICY IF EXISTS "Users can view own posts" ON posts;
  DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
  DROP POLICY IF EXISTS "Users can update own posts" ON posts;
  DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
  DROP POLICY IF EXISTS "Users can view own goals" ON goals;
  DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
  DROP POLICY IF EXISTS "Users can update own goals" ON goals;
  DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
  DROP POLICY IF EXISTS "Users can view own ideas" ON content_ideas;
  DROP POLICY IF EXISTS "Users can insert own ideas" ON content_ideas;
  DROP POLICY IF EXISTS "Users can update own ideas" ON content_ideas;
  DROP POLICY IF EXISTS "Users can delete own ideas" ON content_ideas;
  DROP POLICY IF EXISTS "Users can view own events" ON calendar_events;
  DROP POLICY IF EXISTS "Users can insert own events" ON calendar_events;
  DROP POLICY IF EXISTS "Users can update own events" ON calendar_events;
  DROP POLICY IF EXISTS "Users can delete own events" ON calendar_events;
  DROP POLICY IF EXISTS "Users can view own competitors" ON competitors;
  DROP POLICY IF EXISTS "Users can insert own competitors" ON competitors;
  DROP POLICY IF EXISTS "Users can update own competitors" ON competitors;
  DROP POLICY IF EXISTS "Users can delete own competitors" ON competitors;
  DROP POLICY IF EXISTS "Users can view own pillars" ON pillars;
  DROP POLICY IF EXISTS "Users can insert own pillars" ON pillars;
  DROP POLICY IF EXISTS "Users can update own pillars" ON pillars;
  DROP POLICY IF EXISTS "Users can delete own pillars" ON pillars;
END $$;

-- User Profiles (special — only select/update)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Helper function to generate policy SQL for other tables
DO $$
DECLARE
  tables TEXT[] := ARRAY['accounts', 'platforms', 'posts', 'goals', 'content_ideas', 'calendar_events', 'competitors', 'pillars'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE POLICY "Users can view own %s" ON %I FOR SELECT USING (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "Users can insert own %s" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "Users can update own %s" ON %I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "Users can delete own %s" ON %I FOR DELETE USING (auth.uid() = user_id);', t, t);
  END LOOP;
END $$;
