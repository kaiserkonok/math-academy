import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createClient(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return [...cookies.keys()].map((name) => ({
            name,
            value: cookies.get(name)?.value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies.set(name, value, options as never)
            );
          } catch {}
        },
      },
    }
  );
}
