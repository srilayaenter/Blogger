# Archived — not part of the live architecture

The project moved off Supabase to a static-export architecture (Next.js `output: "export"` on
Cloudflare Pages, content read from `content/*.json` files at build time — see
`docs/architecture.md`). There is no database, no Postgres, no RLS, and no service-role key
anywhere in the live site.

`migrations/0001_init.sql` and `seed.sql` are kept here **only as reference** — a snapshot of
what the schema looked like when the project briefly used Supabase (see `docs/database-schema.md`
for the full design writeup from that period). Nothing runs these migrations, and nothing in the
application imports a Supabase client (`src/lib/supabase/` was removed, not just unused).

Do not treat anything in this directory as current. If a future stage reintroduces a database,
treat this as a historical starting point to review, not something to apply as-is.
