import { defineMiddleware } from 'astro:middleware';
import { createClient } from './lib/supabase-server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isProtected) {
    const { supabase } = createClient(context.request, context.cookies);
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
  }

  const response = await next();

  // Security headers for ALL routes
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Cache-control only for protected routes
  if (isProtected) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
});
