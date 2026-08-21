/**
 * Browser-safe Supabase client (CLAUDE.md section 27). Uses only the anon key -- every read
 * through this client is subject to the RLS policies in supabase/migrations/0001_init.sql, so it
 * can only ever see published recipes/categories, never drafts, source scans, or admin_users.
 *
 * Safe to import from Client Components. Never import admin.ts here or anywhere client-side.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createClient() {
  return createBrowserClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}
