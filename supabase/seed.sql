-- seed.sql
-- Minimal, idempotent seed data for local development.
--
-- Does NOT seed admin_users: that table's primary key is a foreign key into Supabase's own
-- auth.users, which only exists once a real user has signed up/been invited through Supabase
-- Auth (a future stage -- CLAUDE.md M1). Create the owner's auth user first, then insert their
-- admin_users row separately.
--
-- Does NOT seed recipes/ingredients/instructions/source_scans/import_events: there is no real
-- content yet, and this stage doesn't implement the import pipeline that would normally create
-- them.

insert into categories (slug, name_ta, name_en, description_ta, description_en)
values
  ('millet', 'சிறுதானியம்', 'Millet', null, null),
  ('breakfast', 'காலை உணவு', 'Breakfast', null, null),
  ('traditional', 'பாரம்பரிய', 'Traditional', null, null)
on conflict (slug) do nothing;
