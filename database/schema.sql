create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  name text not null check (char_length(name) between 2 and 80),
  password_hash text not null,
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists friendships (
  user_low_id uuid not null references users(id) on delete cascade,
  user_high_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_low_id, user_high_id),
  check (user_low_id < user_high_id)
);

do $$ begin
  create type friend_request_status as enum ('pending', 'accepted', 'declined');
exception
  when duplicate_object then null;
end $$;

create table if not exists friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  status friend_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (sender_id <> receiver_id)
);

create unique index if not exists one_pending_request_per_pair
  on friend_requests (least(sender_id, receiver_id), greatest(sender_id, receiver_id))
  where status = 'pending';

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references users(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 180),
  background_color varchar(7) not null check (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  check (subject_id <> author_id)
);

create index if not exists quotes_subject_created_idx on quotes (subject_id, created_at desc);

create table if not exists quote_likes (
  quote_id uuid not null references quotes(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (quote_id, user_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_quote_created_idx on comments (quote_id, created_at);
