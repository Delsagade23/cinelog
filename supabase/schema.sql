-- ==============================================================================
-- CINELOG: Personal Interactive Movie & Series Curation Database Schema
-- Supabase / PostgreSQL with Seamless Client Sync
-- ==============================================================================

-- 1. Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 2. Create the media_logs table
create table if not exists public.media_logs (
    id text primary key default uuid_generate_v4()::text,
    tmdb_id integer not null,
    title text not null,
    media_type text not null check (media_type in ('movie', 'tv', 'anime', 'kdrama')),
    release_year integer not null,
    runtime_minutes integer default 120,
    poster_url text not null,
    backdrop_url text not null,
    director text not null default 'Unknown',
    cast_members text[] default '{}',
    genres text[] not null default '{}',
    watched_date date not null default current_date,
    personal_rating numeric(3, 1) not null check (personal_rating >= 0 and personal_rating <= 10),
    gut_reaction text not null,
    full_review text not null,
    mood_coordinates jsonb not null default '{"x": 0, "y": 0}'::jsonb,
    custom_tags text[] not null default '{}',
    dominant_color text default '#6366f1',
    rewatch_count integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure id column is text type to support both custom IDs and UUIDs
alter table public.media_logs alter column id type text using id::text;

-- 3. Indexes for fast filtering, sorting, and tag searches
create index if not exists idx_media_logs_watched_date on public.media_logs(watched_date desc);
create index if not exists idx_media_logs_personal_rating on public.media_logs(personal_rating desc);
create index if not exists idx_media_logs_media_type on public.media_logs(media_type);

-- 4. Enable Row Level Security (RLS) and permit app read/write
alter table public.media_logs enable row level security;

-- Drop old restrictive policies
drop policy if exists "Allow public read access on media_logs" on public.media_logs;
drop policy if exists "Allow authenticated admin to insert media logs" on public.media_logs;
drop policy if exists "Allow authenticated admin to update media logs" on public.media_logs;
drop policy if exists "Allow authenticated admin to delete media logs" on public.media_logs;
drop policy if exists "Allow public full access on media_logs" on public.media_logs;

-- Allow read, insert, update, and delete
create policy "Allow public full access on media_logs"
    on public.media_logs
    for all
    using (true)
    with check (true);

