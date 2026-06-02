-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (auto-created on signup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text not null default 'Kreator',
  avatar_url text,
  niche text default '',
  er_mode text not null default 'impression' check (er_mode in ('impression', 'reach', 'followers')),
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Platforms table
create table public.platforms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform_id text not null,
  name text not null,
  emoji text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, platform_id)
);

-- Accounts table
create table public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pillars table
create table public.pillars (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  pillar_id text not null,
  label text not null,
  emoji text default '',
  color text not null,
  bg text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, pillar_id)
);

-- Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account text not null,
  platform text not null,
  date text not null,
  name text not null,
  reach integer default 0,
  impression integer default 0,
  "like" integer default 0,
  comment integer default 0,
  share integer default 0,
  save integer default 0,
  repost integer default 0,
  followers_gained integer default 0,
  profile_visit integer default 0,
  pillar text not null,
  format text not null,
  caption_len integer default 0,
  link text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Goals table
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,
  emoji text default '',
  target integer not null,
  platform text not null,
  metric text not null,
  month integer not null,
  year integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Content Ideas table
create table public.content_ideas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  platform text not null,
  pillar text not null,
  format text not null,
  status text not null default 'idea' check (status in ('idea', 'brief', 'draft', 'ready')),
  priority text not null default 'med' check (priority in ('low', 'med', 'high')),
  tags text[] default '{}',
  brief jsonb default '{}',
  ref_links text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Calendar Events table
create table public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  platform text not null,
  account text not null,
  pillar text not null,
  format text not null,
  scheduled_date text not null,
  scheduled_time text not null,
  status text not null default 'scheduled' check (status in ('idea', 'scheduled', 'published', 'cancelled')),
  idea_id uuid references public.content_ideas(id) on delete set null,
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Competitors table
create table public.competitors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  platform text not null,
  followers integer default 0,
  avg_reach integer default 0,
  avg_er numeric default 0,
  post_freq integer default 0,
  notes text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.platforms enable row level security;
alter table public.accounts enable row level security;
alter table public.pillars enable row level security;
alter table public.posts enable row level security;
alter table public.goals enable row level security;
alter table public.content_ideas enable row level security;
alter table public.calendar_events enable row level security;
alter table public.competitors enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Platforms policies
create policy "Users can view own platforms"
  on public.platforms for select
  using (auth.uid() = user_id);

create policy "Users can insert own platforms"
  on public.platforms for insert
  with check (auth.uid() = user_id);

create policy "Users can update own platforms"
  on public.platforms for update
  using (auth.uid() = user_id);

create policy "Users can delete own platforms"
  on public.platforms for delete
  using (auth.uid() = user_id);

-- Accounts policies
create policy "Users can view own accounts"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own accounts"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own accounts"
  on public.accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete own accounts"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- Pillars policies
create policy "Users can view own pillars"
  on public.pillars for select
  using (auth.uid() = user_id);

create policy "Users can insert own pillars"
  on public.pillars for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pillars"
  on public.pillars for update
  using (auth.uid() = user_id);

create policy "Users can delete own pillars"
  on public.pillars for delete
  using (auth.uid() = user_id);

-- Posts policies
create policy "Users can view own posts"
  on public.posts for select
  using (auth.uid() = user_id);

create policy "Users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Goals policies
create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Content Ideas policies
create policy "Users can view own content ideas"
  on public.content_ideas for select
  using (auth.uid() = user_id);

create policy "Users can insert own content ideas"
  on public.content_ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can update own content ideas"
  on public.content_ideas for update
  using (auth.uid() = user_id);

create policy "Users can delete own content ideas"
  on public.content_ideas for delete
  using (auth.uid() = user_id);

-- Calendar Events policies
create policy "Users can view own calendar events"
  on public.calendar_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own calendar events"
  on public.calendar_events for insert
  with check (auth.uid() = user_id);

create policy "Users can update own calendar events"
  on public.calendar_events for update
  using (auth.uid() = user_id);

create policy "Users can delete own calendar events"
  on public.calendar_events for delete
  using (auth.uid() = user_id);

-- Competitors policies
create policy "Users can view own competitors"
  on public.competitors for select
  using (auth.uid() = user_id);

create policy "Users can insert own competitors"
  on public.competitors for insert
  with check (auth.uid() = user_id);

create policy "Users can update own competitors"
  on public.competitors for update
  using (auth.uid() = user_id);

create policy "Users can delete own competitors"
  on public.competitors for delete
  using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Kreator'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call function on new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles updated_at
create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Trigger for competitors updated_at
create trigger on_competitor_updated
  before update on public.competitors
  for each row execute procedure public.handle_updated_at();
