import { defineMiddleware } from 'astro:middleware';
import { createClient } from './lib/supabase-server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (!isProtected) return next();

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

  const response = await next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
});
