-- Supabase SQL Schema for ClarityAI
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
alter database postgres set "app.jwt_secret" to 'your-super-secret-jwt-token-with-at-least-32-characters-long';

-- Create profiles table
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  email text unique not null,
  full_name text,
  avatar_url text,
  preferences jsonb default '{}',
  therapy_goals jsonb default '[]',
  privacy_settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create user_sessions table for therapy sessions
create table public.user_sessions (
  id uuid default gen_random_uuid() primary key,
  session_id text unique not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Create session_messages table
create table public.session_messages (
  id uuid default gen_random_uuid() primary key,
  session_id text references public.user_sessions(session_id) on delete cascade not null,
  content text not null,
  sender text not null check (sender in ('user', 'ai')),
  psychological_insight jsonb,
  emotional_state text,
  topic_classification text,
  confidence_score float,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create therapy_sessions table for session management
create table public.therapy_sessions (
  id uuid default gen_random_uuid() primary key,
  session_id text unique not null,
  user_id uuid references auth.users on delete cascade not null,
  session_name text,
  session_summary text,
  mood_before text,
  mood_after text,
  topics_discussed jsonb default '[]',
  insights_generated jsonb default '[]',
  session_duration integer, -- Duration in minutes
  session_rating integer check (session_rating >= 1 and session_rating <= 5),
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_sessions enable row level security;
alter table public.session_messages enable row level security;
alter table public.therapy_sessions enable row level security;

-- RLS Policies for profiles table
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- RLS Policies for user_sessions table
create policy "Users can view own sessions" on public.user_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on public.user_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions" on public.user_sessions
  for update using (auth.uid() = user_id);

-- RLS Policies for session_messages table
create policy "Users can view own session messages" on public.session_messages
  for select using (
    auth.uid() in (
      select user_id from public.user_sessions where session_id = session_messages.session_id
    )
  );

create policy "Users can insert own session messages" on public.session_messages
  for insert with check (
    auth.uid() in (
      select user_id from public.user_sessions where session_id = session_messages.session_id
    )
  );

-- RLS Policies for therapy_sessions table
create policy "Users can view own therapy sessions" on public.therapy_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own therapy sessions" on public.therapy_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own therapy sessions" on public.therapy_sessions
  for update using (auth.uid() = user_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_user_sessions
  before update on public.user_sessions
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_therapy_sessions
  before update on public.therapy_sessions
  for each row execute procedure public.handle_updated_at();

-- Create function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes for better performance
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_user_sessions_user_id on public.user_sessions(user_id);
create index idx_user_sessions_session_id on public.user_sessions(session_id);
create index idx_session_messages_session_id on public.session_messages(session_id);
create index idx_therapy_sessions_user_id on public.therapy_sessions(user_id);
create index idx_therapy_sessions_session_id on public.therapy_sessions(session_id);
