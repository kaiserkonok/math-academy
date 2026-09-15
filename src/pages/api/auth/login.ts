import type { APIRoute } from 'astro';
import { createClient } from '../../../lib/supabase-server';

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

  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[login] Missing Supabase env vars — sign-in impossible.');
    return Response.json(
      { error: 'Online login is not available right now. Please contact the center office.' },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(cookies);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return Response.json({ error: error.message }, { status: 401 });
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

    return Response.json({ redirect: profile.role === 'admin' ? '/admin/' : '/dashboard/' });
  } catch (err) {
    console.error('[login] failed:', err);
    return Response.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
};
