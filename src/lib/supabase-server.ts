import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Server-side Supabase client with cookie-based sessions.
// Uses getAll/setAll API required by @supabase/ssr v0.12+.
export function createClient(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies.set(name, value, options as never)
            );
          } catch {
            // setAll may be called from a Server Component where cookies are read-only.
          }
        },
      },
    }
  );
}
