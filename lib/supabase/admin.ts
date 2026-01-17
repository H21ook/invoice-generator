import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/env";

/**
 * Supabase client with service role key.
 * This client bypasses RLS and should ONLY be used in server-side code (route handlers, server actions).
 */
let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
    if (supabaseAdminClient) {
        return supabaseAdminClient;
    }

    const env = requireSupabaseEnv();
    supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return supabaseAdminClient;
}
