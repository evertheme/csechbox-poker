import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client for use in Server Components and Route Handlers.
 * Uses service role key — never expose this to the client.
 * Install @supabase/ssr for cookie-based auth in Server Components.
 */
export async function createServerClient() {
  // Accessing cookies() marks this function as dynamic
  await cookies();
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
