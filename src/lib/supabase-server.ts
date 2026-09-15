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
        : { name: c.slice(0, eqIdx), value: decodeURIComponent(c.slice(eqIdx + 1)) };
    });

  const pendingSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll(cookiesToSet) {
          pendingSet.push(...cookiesToSet);
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies.set(name, value, options as never)
            );
          } catch {}
        },
      },
    }
  );

  return { supabase, pendingSet };
}

export function cookieSetCookieHeaders(pendingSet: { name: string; value: string; options: Record<string, unknown> }[]) {
  return pendingSet.map(({ name, value, options }) => {
    const parts = [`${name}=${value}`, 'Path=/'];
    if (options.httpOnly) parts.push('HttpOnly');
    if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
    if (options.secure) parts.push('Secure');
    if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
    if (options.domain) parts.push(`Domain=${options.domain}`);
    if (options.path) parts[1] = `Path=${options.path}`;
    return parts.join('; ');
  });
}
