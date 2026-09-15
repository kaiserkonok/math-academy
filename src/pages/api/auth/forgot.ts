import type { APIRoute } from 'astro';
import { createClient } from '../../../lib/supabase-server';

// Always returns ok:true so attackers cannot enumerate registered emails.
export const POST: APIRoute = async ({ request, cookies }) => {
  let email = '';
  try {
    const body = await request.json();
    email = body.email?.trim() || '';
  } catch {
    return Response.json({ ok: true });
  }
  if (!email) {
    return Response.json({ error: 'Please enter your email address.' }, { status: 400 });
  }

  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[forgot] Missing Supabase env vars.');
    return Response.json(
      { error: 'Password reset is not available right now. Please contact the center office.' },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(cookies);
    const origin = new URL(request.url).origin;
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/login`,
    });
  } catch {
    // intentionally ignored — see note above
  }
  return Response.json({ ok: true });
};
