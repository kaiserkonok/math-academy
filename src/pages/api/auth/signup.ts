import type { APIRoute } from 'astro';
import { createClient, cookieSetCookieHeaders } from '../../../lib/supabase-server';
import { checkRateLimit } from '../../../lib/rate-limit';

interface SignupBody {
  fullName?: string;
  email?: string;
  phone?: string;
  grade?: number;
  batch?: string;
  password?: string;
  parentName?: string;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: SignupBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const fullName = body.fullName?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim() || '';
  const grade = Number(body.grade);
  const batch = body.batch?.trim() || '';
  const password = body.password || '';
  const parentName = body.parentName?.trim() || '';

  if (!fullName || !email || !password || !Number.isInteger(grade) || grade < 5 || grade > 10 || !batch) {
    return Response.json({ error: 'Please fill in all required fields correctly.' }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }
  if (fullName.length > 100 || email.length > 254 || phone.length > 20 || parentName.length > 100 || password.length > 128) {
    return Response.json({ error: 'Input too long.' }, { status: 400 });
  }

  if (!checkRateLimit(email, 3, 300000)) {
    return Response.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[signup] Missing Supabase env vars — account cannot be created.');
    return Response.json(
      { error: 'Online registration is not available right now. Please contact the center office.' },
      { status: 503 }
    );
  }

  try {
    const { supabase, pendingSet } = createClient(request, cookies);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          grade: String(grade),
          batch,
          parent_name: parentName,
        },
      },
    });
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (!data.user) {
      return Response.json({ error: 'Could not create account. Please try again.' }, { status: 500 });
    }

    const headers = new Headers({ 'Content-Type': 'application/json' });
    for (const sc of cookieSetCookieHeaders(pendingSet)) {
      headers.append('Set-Cookie', sc);
    }

    if (data.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('student_id')
        .eq('id', data.user.id)
        .single();
      return new Response(
        JSON.stringify({ redirect: '/dashboard/', studentId: profile?.student_id ?? null }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ needsConfirmation: true }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error('[signup] failed:', err);
    return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
};
