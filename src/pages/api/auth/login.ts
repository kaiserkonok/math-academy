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

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
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

    const userId = data.user.id;
    const accessToken = data.session?.access_token;

    let profile: { role: string } | null = null;

    if (accessToken) {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const rows = await resp.json();
      profile = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    }

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
