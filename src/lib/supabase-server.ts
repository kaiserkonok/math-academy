import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Server-side Supabase client with cookie-based sessions.
// Used by middleware and /api/* endpoints so auth state is visible
// to the server (required for route protection).
export function createClient(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key: string) {
          return cookies.get(key)?.value;
        },
        set(key: string, value: string, options: Record<string, unknown>) {
          cookies.set(key, value, options as never);
        },
        remove(key: string, options: Record<string, unknown>) {
          cookies.delete(key, options as never);
        },
      },
    }
  );
}
