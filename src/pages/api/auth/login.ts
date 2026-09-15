import type { APIRoute } from 'astro';
import { createClient, cookieSetCookieHeaders } from '../../../lib/supabase-server';
import { checkRateLimit } from '../../../lib/rate-limit';

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) {
    return Response.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (!checkRateLimit(email, 5, 60000)) {
    return Response.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[login] Missing Supabase env vars — sign-in impossible.');
    return Response.json(
      { error: 'Online login is not available right now. Please contact the center office.' },
      { status: 503 }
    );
  }

  try {
    const { supabase, pendingSet } = createClient(request, cookies);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[login] auth error:', error.message);
      return Response.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      return Response.json(
        { error: 'Account has no student profile. Please contact the office.' },
        { status: 403 }
      );
    }

    const headers = new Headers({ 'Content-Type': 'application/json' });
    for (const sc of cookieSetCookieHeaders(pendingSet)) {
      headers.append('Set-Cookie', sc);
    }

    return new Response(
      JSON.stringify({ redirect: profile.role === 'admin' ? '/admin/' : '/dashboard/' }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error('[login] failed:', err);
    return Response.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
};
