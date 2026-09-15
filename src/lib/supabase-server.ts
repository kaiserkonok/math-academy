import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createClient(request: Request, cookies: AstroCookies) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const allCookies = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const eqIdx = c.indexOf('=');
      return eqIdx === -1
        ? { name: c, value: '' }
        : { name: c.slice(0, eqIdx), value: c.slice(eqIdx + 1) };
    });

  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return allCookies;
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
