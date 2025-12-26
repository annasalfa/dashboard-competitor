import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client for API routes (no cookies needed for public read)
export function createServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    return createClient(supabaseUrl, supabaseKey)
}

// Re-export for backward compatibility
export { createServerClient as createClient }
