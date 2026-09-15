import { defineMiddleware } from 'astro:middleware';
import { createClient } from './lib/supabase-server';

// Protects /dashboard/* (any logged-in user) and /admin/* (admins only).
// Unauthenticated visitors are sent to /login; non-admins to /dashboard/.
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (!isProtected) return next();

  // TEMPORARY local-testing bypass: with no Supabase credentials configured
  // there is no user store yet, so auth checks are skipped and every page
  // is browsable with mock data. The moment .env contains
  // PUBLIC_SUPABASE_URL, real authentication engages automatically.
  // DO NOT deploy without .env — the admin panel would be public.
  if (!import.meta.env.PUBLIC_SUPABASE_URL) {
    console.warn('[DEV] Supabase not configured — auth checks bypassed. Add .env to enable real auth.');
    return next();
  }

  try {
    const supabase = createClient(context.cookies);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return context.redirect('/login?next=' + encodeURIComponent(pathname));
    }
    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!profile || profile.role !== 'admin') {
        return context.redirect('/dashboard/');
      }
    }
  } catch {
    return context.redirect('/login');
  }
  return next();
});
