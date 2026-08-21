/**
 * Service-role Supabase client (CLAUDE.md section 27). Bypasses RLS entirely -- this is how
 * every privileged read/write (draft recipes, source_scans, admin_users, the future
 * /api/import/v1 handler) actually happens, per the RLS strategy in
 * supabase/migrations/0001_init.sql and docs/database-schema.md.
 *
 * NEVER import this file into a Client Component -- the `server-only` import below makes doing
 * so a build-time error, not just a convention. Every caller of createAdminClient() is
 * responsible for its own authorization check (e.g. confirming the caller is in admin_users)
 * before performing a mutation -- this client itself does not check anything.
 */

import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createAdminClient() {
  return createSupabaseClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
