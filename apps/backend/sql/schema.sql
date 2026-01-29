-- Mentora backend schema (idempotent-ish)
create extension if not exists "uuid-ossp";

-- USERS
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('teacher','student')),
  created_at timestamptz not null default now()
);

-- QUIZZES
do $$
begin
  if not exists (select 1 from information_schema.tables where table_name='quizzes') then
    create table quizzes (
      id uuid primary key default uuid_generate_v4(),
      owner_id uuid references users(id) on delete set null,
      title text not null,
      description text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  else
    -- Legacy table: add missing columns
    if not exists (select 1 from information_schema.columns where table_name='quizzes' and column_name='id') then
      alter table quizzes add column id uuid default uuid_generate_v4();
    end if;
    if not exists (select 1 from information_schema.columns where table_name='quizzes' and column_name='owner_id') then
      alter table quizzes add column owner_id uuid references users(id) on delete set null;
    end if;
    if not exists (select 1 from information_schema.columns where table_name='quizzes' and column_name='description') then
      alter table quizzes add column description text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name='quizzes' and column_name='updated_at') then
      alter table quizzes add column updated_at timestamptz not null default now();
    end if;
  end if;
end $$;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

do $$
begin
  if exists (select 1 from information_schema.tables where table_name='quizzes')
     and not exists (select 1 from pg_trigger where tgname='trg_quizzes_updated') then
    create trigger trg_quizzes_updated
    before update on quizzes
    for each row execute function set_updated_at();
  end if;
end $$;

-- QUESTIONS
create table if not exists questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_index int not null check (correct_index >= 0),
  explanation text
);

-- SHARES
create table if not exists quiz_shares (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

-- ATTEMPTS
create table if not exists attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  answers jsonb not null,
  score int not null,
  created_at timestamptz not null default now()
);
