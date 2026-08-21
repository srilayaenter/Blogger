-- 0001_init.sql
-- Initial schema for the Tamil-English recipe website.
-- Source of truth for table/column intent: CLAUDE.md sections 13-15.
-- Design rationale for anything CLAUDE.md doesn't specify (import_events, the two extra enums,
-- the RLS/grants strategy, idempotency keys): docs/database-schema.md.

create extension if not exists pgcrypto;

-- ============================================================================
-- Enums
-- ============================================================================

-- CLAUDE.md section 14, verbatim.
create type recipe_status as enum ('draft', 'review', 'published', 'archived');
create type recipe_difficulty as enum ('easy', 'medium', 'hard');
create type scan_ocr_status as enum ('pending', 'processing', 'extracted', 'failed', 'corrected', 'verified');
create type admin_role as enum ('owner', 'editor');

-- Not specified anywhere in CLAUDE.md (source_scans.review_status has no enum defined) --
-- see docs/database-schema.md for the reasoning.
create type source_scan_review_status as enum ('pending', 'approved');

-- New table, not in CLAUDE.md section 13 (added per explicit Stage 3A request) --
-- see docs/database-schema.md for the idempotency strategy this supports.
create type import_event_status as enum ('received', 'applied', 'rejected', 'failed');

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- admin_users
-- ============================================================================
-- CLAUDE.md section 13 lists only id/email/role/created_at for this table (no updated_at) --
-- followed exactly, even though role changes go untimestamped as a result.

create table admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role admin_role not null default 'editor',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- categories
-- ============================================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ta text not null,
  name_en text not null,
  description_ta text,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on categories
  for each row
  execute function set_updated_at();

-- ============================================================================
-- recipes
-- ============================================================================

create table recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ta text not null,
  title_en text not null,
  description_ta text,
  description_en text,
  source_page_number int,
  prep_time_minutes int,
  cook_time_minutes int,
  total_time_minutes int,
  servings int,
  difficulty recipe_difficulty,
  featured_image_url text,
  status recipe_status not null default 'draft',
  seo_title_ta text,
  seo_title_en text,
  seo_description_ta text,
  seo_description_en text,
  -- Natural idempotency key for /api/import/v1 (future stage) -- see docs/database-schema.md,
  -- "Import idempotency strategy". Nullable + unique: multiple NULLs are allowed by Postgres,
  -- so recipes never created via the Workspace pipeline don't collide with each other.
  google_drive_source_file_id text unique,
  created_by uuid references admin_users (id) on delete set null,
  updated_by uuid references admin_users (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_status_idx on recipes (status);

create trigger recipes_set_updated_at
  before update on recipes
  for each row
  execute function set_updated_at();

-- ============================================================================
-- ingredients
-- ============================================================================
-- CLAUDE.md section 13 lists no timestamp columns for this table -- followed exactly.

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  name_ta text not null,
  name_en text not null,
  quantity text,
  unit_ta text,
  unit_en text,
  notes_ta text,
  notes_en text,
  display_order int not null default 0,
  is_uncertain boolean not null default false,
  uncertainty_notes text,
  unique (recipe_id, display_order)
);

create index ingredients_recipe_id_idx on ingredients (recipe_id, display_order);

-- ============================================================================
-- instructions
-- ============================================================================
-- CLAUDE.md section 13 lists no timestamp columns for this table -- followed exactly.

create table instructions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  step_number int not null,
  instruction_ta text not null,
  instruction_en text not null,
  image_url text,
  display_order int not null default 0,
  is_uncertain boolean not null default false,
  uncertainty_notes text,
  unique (recipe_id, step_number),
  unique (recipe_id, display_order)
);

create index instructions_recipe_id_idx on instructions (recipe_id, display_order);

-- ============================================================================
-- recipe_categories
-- ============================================================================

create table recipe_categories (
  recipe_id uuid not null references recipes (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  primary key (recipe_id, category_id)
);

create index recipe_categories_category_id_idx on recipe_categories (category_id);

-- ============================================================================
-- source_scans
-- ============================================================================
-- `image_url` is a private Drive view-link for admin convenience (CLAUDE.md section 21,
-- "Source scan reference") -- it must NEVER be a Supabase Storage URL. Scans are never
-- duplicated into Supabase Storage (CLAUDE.md sections 6 and 23).

create table source_scans (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes (id) on delete set null,
  page_number int,
  image_url text,
  google_drive_file_id text not null unique,
  google_doc_id text,
  ocr_provider text,
  ocr_raw_text text,
  ocr_status scan_ocr_status not null default 'pending',
  corrected_text_ta text,
  review_status source_scan_review_status not null default 'pending',
  uploaded_by uuid references admin_users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index source_scans_recipe_id_idx on source_scans (recipe_id);

create trigger source_scans_set_updated_at
  before update on source_scans
  for each row
  execute function set_updated_at();

-- ============================================================================
-- import_events
-- ============================================================================
-- Not in CLAUDE.md section 13 -- added per explicit Stage 3A request to support the
-- idempotency strategy in docs/database-schema.md. Nothing writes to this table yet;
-- /api/import/v1 is a future stage.

create table import_events (
  id uuid primary key default gen_random_uuid(),
  recipe_external_id text not null,
  recipe_id uuid references recipes (id) on delete set null,
  source_drive_file_id text,
  source_google_doc_id text,
  payload jsonb not null,
  payload_hash text not null,
  status import_event_status not null default 'received',
  status_reason text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index import_events_recipe_external_id_idx on import_events (recipe_external_id, payload_hash);
create index import_events_recipe_id_idx on import_events (recipe_id);

-- ============================================================================
-- Row-Level Security
-- ============================================================================
-- No table has an INSERT/UPDATE/DELETE policy for anon/authenticated -- every mutation goes
-- through the service-role client (src/lib/supabase/admin.ts) after an app-level authorization
-- check, per CLAUDE.md sections 15 and 27. RLS here only ever grants reads.

alter table admin_users enable row level security;
alter table categories enable row level security;
alter table recipes enable row level security;
alter table ingredients enable row level security;
alter table instructions enable row level security;
alter table recipe_categories enable row level security;
alter table source_scans enable row level security;
alter table import_events enable row level security;

-- admin_users, source_scans, import_events intentionally have NO policies below --
-- default-deny for anon/authenticated. Only the service role (which bypasses RLS) can read them.

create policy "public read categories"
  on categories for select
  to anon, authenticated
  using (true);

create policy "public read published recipes"
  on recipes for select
  to anon, authenticated
  using (status = 'published');

create policy "public read ingredients of published recipes"
  on ingredients for select
  to anon, authenticated
  using (
    exists (
      select 1 from recipes r
      where r.id = ingredients.recipe_id
        and r.status = 'published'
    )
  );

create policy "public read instructions of published recipes"
  on instructions for select
  to anon, authenticated
  using (
    exists (
      select 1 from recipes r
      where r.id = instructions.recipe_id
        and r.status = 'published'
    )
  );

create policy "public read recipe_categories of published recipes"
  on recipe_categories for select
  to anon, authenticated
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_categories.recipe_id
        and r.status = 'published'
    )
  );

-- ============================================================================
-- Column-level grants (defense in depth on top of the row-level policies above)
-- ============================================================================
-- ingredients/instructions ARE publicly readable at the row level once their recipe is
-- published, but uncertainty_notes must never be -- RLS can't hide individual columns, so this
-- is enforced with column privileges instead. Consequence: a public `select('*')` on these
-- tables will get a permission-denied error, not a silent omission -- that's the intended safe
-- failure mode. Public queries must always name columns explicitly. See docs/database-schema.md.

grant select on categories to anon, authenticated;
grant select on recipes to anon, authenticated;
grant select on ingredients to anon, authenticated;
grant select on instructions to anon, authenticated;
grant select on recipe_categories to anon, authenticated;

revoke select (uncertainty_notes) on ingredients from anon, authenticated;
revoke select (uncertainty_notes) on instructions from anon, authenticated;
revoke select (google_drive_source_file_id) on recipes from anon, authenticated;

-- admin_users, source_scans, import_events: no grants at all for anon/authenticated -- combined
-- with "no policy" above, this is a second, independent layer of denial for these tables.
