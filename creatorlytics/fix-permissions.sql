-- Fix all permissions and RLS policies

-- Grant all permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own platforms" ON public.platforms;
DROP POLICY IF EXISTS "Users can insert own platforms" ON public.platforms;
DROP POLICY IF EXISTS "Users can update own platforms" ON public.platforms;
DROP POLICY IF EXISTS "Users can delete own platforms" ON public.platforms;
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can view own pillars" ON public.pillars;
DROP POLICY IF EXISTS "Users can insert own pillars" ON public.pillars;
DROP POLICY IF EXISTS "Users can update own pillars" ON public.pillars;
DROP POLICY IF EXISTS "Users can delete own pillars" ON public.pillars;
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can view own content ideas" ON public.content_ideas;
DROP POLICY IF EXISTS "Users can insert own content ideas" ON public.content_ideas;
DROP POLICY IF EXISTS "Users can update own content ideas" ON public.content_ideas;
DROP POLICY IF EXISTS "Users can delete own content ideas" ON public.content_ideas;
DROP POLICY IF EXISTS "Users can view own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can view own competitors" ON public.competitors;
DROP POLICY IF EXISTS "Users can insert own competitors" ON public.competitors;
DROP POLICY IF EXISTS "Users can update own competitors" ON public.competitors;
DROP POLICY IF EXISTS "Users can delete own competitors" ON public.competitors;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- Create NEW policies with proper auth.uid() check

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Platforms policies
CREATE POLICY "Users can view own platforms"
  ON public.platforms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platforms"
  ON public.platforms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platforms"
  ON public.platforms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own platforms"
  ON public.platforms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Accounts policies
CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON public.accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON public.accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON public.accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Pillars policies
CREATE POLICY "Users can view own pillars"
  ON public.pillars FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pillars"
  ON public.pillars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pillars"
  ON public.pillars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pillars"
  ON public.pillars FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view own posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Content Ideas policies
CREATE POLICY "Users can view own content ideas"
  ON public.content_ideas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content ideas"
  ON public.content_ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content ideas"
  ON public.content_ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content ideas"
  ON public.content_ideas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Calendar Events policies
CREATE POLICY "Users can view own calendar events"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Competitors policies
CREATE POLICY "Users can view own competitors"
  ON public.competitors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitors"
  ON public.competitors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitors"
  ON public.competitors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitors"
  ON public.competitors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
