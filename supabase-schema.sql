-- ============================================
-- SlateMaker Database Schema
-- Run this in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Stores user profile info linked to Supabase Auth
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text,
  full_name text,
  bio text,
  avatar_url text,
  website text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Anyone can view profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);


-- ============================================
-- DESIGNS TABLE
-- Stores design/project submissions
-- ============================================
create table designs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  tags text[] default '{}',
  thumbnail_url text,
  files jsonb default '[]',
  published boolean default false,
  download_count integer default 0,
  like_count integer default 0,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table designs enable row level security;

-- Anyone can view published designs
create policy "Published designs are viewable by everyone"
  on designs for select using (published = true);

-- Users can view their own unpublished designs
create policy "Users can view own designs"
  on designs for select using (auth.uid() = user_id);

-- Users can insert their own designs
create policy "Users can create designs"
  on designs for insert with check (auth.uid() = user_id);

-- Users can update their own designs
create policy "Users can update own designs"
  on designs for update using (auth.uid() = user_id);

-- Users can delete their own designs
create policy "Users can delete own designs"
  on designs for delete using (auth.uid() = user_id);


-- ============================================
-- DESIGN LIKES TABLE
-- Tracks which users liked which designs
-- ============================================
create table design_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  design_id uuid references designs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, design_id)
);

alter table design_likes enable row level security;

create policy "Anyone can view likes"
  on design_likes for select using (true);

create policy "Users can insert own likes"
  on design_likes for insert with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on design_likes for delete using (auth.uid() = user_id);


-- ============================================
-- COMMENTS TABLE
-- Comments on designs
-- ============================================
create table comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  design_id uuid references designs(id) on delete cascade not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

create policy "Anyone can view comments"
  on comments for select using (true);

create policy "Authenticated users can create comments"
  on comments for insert with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on comments for update using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on comments for delete using (auth.uid() = user_id);


-- ============================================
-- STORAGE BUCKET
-- For design files and thumbnails
-- ============================================
insert into storage.buckets (id, name, public) 
values ('designs', 'designs', true);

-- Allow authenticated users to upload files
create policy "Authenticated users can upload files"
  on storage.objects for insert
  with check (bucket_id = 'designs' and auth.role() = 'authenticated');

-- Anyone can view/download files
create policy "Anyone can view design files"
  on storage.objects for select
  using (bucket_id = 'designs');

-- Users can delete their own files
create policy "Users can delete own files"
  on storage.objects for delete
  using (bucket_id = 'designs' and auth.uid()::text = (storage.foldername(name))[2]);


-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_designs_user_id on designs(user_id);
create index idx_designs_category on designs(category);
create index idx_designs_published on designs(published);
create index idx_designs_created_at on designs(created_at desc);
create index idx_comments_design_id on comments(design_id);
create index idx_design_likes_design_id on design_likes(design_id);
