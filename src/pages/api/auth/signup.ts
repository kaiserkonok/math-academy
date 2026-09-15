import type { APIRoute } from 'astro';
import { createClient } from '../../../lib/supabase-server';

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

  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[signup] Missing Supabase env vars — account cannot be created.');
    return Response.json(
      { error: 'Online registration is not available right now. Please contact the center office.' },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(cookies);
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

    if (data.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('student_id')
        .eq('id', data.user.id)
        .single();
      return Response.json({ redirect: '/dashboard/', studentId: profile?.student_id ?? null });
    }

    return Response.json({ needsConfirmation: true });
  } catch (err) {
    console.error('[signup] failed:', err);
    return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
};
