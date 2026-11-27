-- Lumbrario — Esquema de base de datos (PostgreSQL / Supabase)
-- Fase siguiente: cuando la app tenga cuentas de usuario y panel admin seguro.
-- Ejecutar en Supabase → SQL Editor. Refleja exactamente la estructura de content.js.

create extension if not exists "pgcrypto";

-- ---------- Catálogo ----------
create table categories (
  id          text primary key,                 -- 'ciencia', 'historia'…
  name        text not null,
  icon        text not null default '✦',
  color       text not null default '#8f7cff',
  description text,
  sort_order  int  not null default 0
);

create type content_type   as enum ('articulo', 'curiosidad', 'mito');
create type content_status as enum ('borrador', 'revision', 'publicado', 'archivado');

create table contents (
  id            text primary key,               -- slug estable: 'a-pulpo'
  type          content_type   not null,
  status        content_status not null default 'borrador',
  category_id   text not null references categories(id),
  subcategory   text,
  title         text not null,
  subtitle      text,
  description   text not null,                  -- resumen corto para tarjetas
  intro         text,                           -- artículos
  sections      jsonb not null default '[]',    -- [{ "h": "...", "p": ["...", "..."] }]
  facts         jsonb not null default '[]',    -- ["dato 1", "dato 2"]
  conclusion    text,
  body          text,                           -- curiosidades y mitos
  verdict       text check (verdict in ('falso','matizado','verdadero')),
  image_url     text,
  image_credit  text,
  level         smallint not null default 1 check (level between 1 and 3),
  read_minutes  smallint,
  published_at  date,
  author_id     uuid references auth.users(id),
  reviewed_by   uuid references auth.users(id), -- revisión editorial / verificación
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  search        tsvector generated always as (
                  to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(intro,'') || ' ' || coalesce(body,''))
                ) stored
);
create index contents_cat_idx    on contents (category_id, status);
create index contents_pub_idx    on contents (published_at desc) where status = 'publicado';
create index contents_search_idx on contents using gin (search);

-- Fuentes como tabla propia: se pueden revisar, marcar como rotas y reutilizar.
create table sources (
  id          uuid primary key default gen_random_uuid(),
  content_id  text not null references contents(id) on delete cascade,
  title       text not null,
  url         text not null check (url ~ '^https?://'),
  checked_at  timestamptz,                      -- última verificación del enlace
  is_broken   boolean not null default false,
  sort_order  int not null default 0
);
create index sources_content_idx on sources (content_id);

-- Regla editorial: no se puede publicar sin al menos una fuente.
create or replace function enforce_sources_on_publish() returns trigger language plpgsql as $$
begin
  if new.status = 'publicado' and not exists (select 1 from sources where content_id = new.id) then
    raise exception 'No se puede publicar "%": falta al menos una fuente', new.id;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger contents_publish_check before update on contents
  for each row execute function enforce_sources_on_publish();

create table questions (
  id          text primary key,
  category_id text not null references categories(id),
  content_id  text references contents(id) on delete set null,  -- respaldo documental
  level       smallint not null check (level between 1 and 3),
  question    text not null,
  options     jsonb not null check (jsonb_array_length(options) = 4),
  answer      smallint not null check (answer between 0 and 3),
  explanation text not null,
  status      content_status not null default 'borrador',
  created_at  timestamptz not null default now()
);

-- ---------- Usuarios ----------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  role          text not null default 'lector' check (role in ('lector','editor','admin')),
  xp            int not null default 0,
  streak_cur    int not null default 0,
  streak_best   int not null default 0,
  last_active   date,
  created_at    timestamptz not null default now()
);

create table favorites (
  user_id    uuid references profiles(id) on delete cascade,
  content_id text references contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table reading_history (       -- leído (artículos) o visto (curiosidades/mitos)
  user_id    uuid references profiles(id) on delete cascade,
  content_id text references contents(id) on delete cascade,
  kind       text not null check (kind in ('leido','visto')),
  at         timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  level       smallint not null,      -- 0 = mixto
  category_id text,
  total       smallint not null,
  correct     smallint not null,
  xp          int not null default 0,
  played_at   timestamptz not null default now()
);

create table quiz_answers (           -- permite no repetir preguntas por usuario
  attempt_id  uuid references quiz_attempts(id) on delete cascade,
  question_id text references questions(id) on delete cascade,
  correct     boolean not null,
  primary key (attempt_id, question_id)
);

-- ---------- Seguridad (Row Level Security) ----------
alter table categories      enable row level security;
alter table contents        enable row level security;
alter table sources         enable row level security;
alter table questions       enable row level security;
alter table profiles        enable row level security;
alter table favorites       enable row level security;
alter table reading_history enable row level security;
alter table quiz_attempts   enable row level security;
alter table quiz_answers    enable row level security;

create or replace function is_editor() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))
$$;

-- Lectura pública solo de lo publicado; edición solo para editores.
create policy "cat_read"   on categories for select using (true);
create policy "cat_write"  on categories for all    using (is_editor()) with check (is_editor());
create policy "cnt_read"   on contents   for select using (status = 'publicado' or is_editor());
create policy "cnt_write"  on contents   for all    using (is_editor()) with check (is_editor());
create policy "src_read"   on sources    for select using (true);
create policy "src_write"  on sources    for all    using (is_editor()) with check (is_editor());
create policy "q_read"     on questions  for select using (status = 'publicado' or is_editor());
create policy "q_write"    on questions  for all    using (is_editor()) with check (is_editor());

-- Cada usuario solo ve y modifica sus propios datos.
create policy "prof_self"  on profiles        for all using (id = auth.uid()) with check (id = auth.uid() and role = 'lector');
create policy "fav_self"   on favorites       for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "hist_self"  on reading_history for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "att_self"   on quiz_attempts   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ans_self"   on quiz_answers    for all
  using (exists (select 1 from quiz_attempts a where a.id = attempt_id and a.user_id = auth.uid()))
  with check (exists (select 1 from quiz_attempts a where a.id = attempt_id and a.user_id = auth.uid()));
