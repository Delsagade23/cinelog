-- ==============================================================================
-- CINELOG: Personal Interactive Movie & Series Curation Database Schema
-- Supabase / PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 2. Create the media_logs table
create table if not exists public.media_logs (
    id uuid default uuid_generate_v4() primary key,
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

-- 3. Indexes for fast filtering, sorting, and tag searches
create index if not exists idx_media_logs_watched_date on public.media_logs(watched_date desc);
create index if not exists idx_media_logs_personal_rating on public.media_logs(personal_rating desc);
create index if not exists idx_media_logs_media_type on public.media_logs(media_type);
create index if not exists idx_media_logs_genres on public.media_logs using gin(genres);
create index if not exists idx_media_logs_custom_tags on public.media_logs using gin(custom_tags);

-- 4. Enable Row Level Security (RLS)
alter table public.media_logs enable row level security;

-- 5. Public Read Access: Anyone (public visitors / anon) can browse & filter
create policy "Allow public read access on media_logs"
    on public.media_logs
    for select
    using (true);

-- 6. Admin Write Access: Only authenticated admin can insert, update, or delete
create policy "Allow authenticated admin to insert media logs"
    on public.media_logs
    for insert
    to authenticated
    with check (auth.role() = 'authenticated');

create policy "Allow authenticated admin to update media logs"
    on public.media_logs
    for update
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

create policy "Allow authenticated admin to delete media logs"
    on public.media_logs
    for delete
    to authenticated
    using (auth.role() = 'authenticated');

-- ==============================================================================
-- Optional: Restrict strictly to a designated Admin UID
-- (Uncomment and replace 'YOUR-ADMIN-USER-UUID' if you want single-user lock)
--
-- create policy "Allow strictly designated admin user write access"
--     on public.media_logs
--     for all
--     to authenticated
--     using (auth.uid() = 'YOUR-ADMIN-USER-UUID'::uuid)
--     with check (auth.uid() = 'YOUR-ADMIN-USER-UUID'::uuid);
-- ==============================================================================
