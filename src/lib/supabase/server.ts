/**
 * Server-side Supabase client (CLAUDE.md section 27), for use in Server Components, Server
 * Actions, and Route Handlers. Uses the anon key plus the caller's own session cookies, so reads
 * and writes still go through RLS as that specific user -- this is NOT the elevated client.
 *
 * For privileged operations that must bypass RLS (admin mutations, the future import endpoint),
 * use admin.ts instead, after an explicit authorization check.
 */

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component that can't set cookies -- safe to ignore as long
            // as middleware is refreshing the session (added when auth is implemented).
          }
        },
      },
    },
  );
}
