import type { APIRoute } from 'astro';
import { createClient } from '../../../lib/supabase-server';

interface AdmissionBody {
  studentName?: string;
  grade?: number;
  batch?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  website?: string;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: AdmissionBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: bots fill this hidden field; humans never see it.
  if (body.website && body.website.trim() !== '') {
    return Response.json({ ok: true });
  }

  const studentName = body.studentName?.trim();
  const grade = Number(body.grade);
  const batch = body.batch?.trim().toLowerCase() || '';
  const phone = body.phone?.trim();
  const parentName = body.parentName?.trim();
  const parentPhone = body.parentPhone?.trim() || '';
  const address = body.address?.trim();

  if (
    !studentName ||
    !Number.isInteger(grade) ||
    grade < 5 ||
    grade > 10 ||
    !['morning', 'afternoon', 'evening'].includes(batch) ||
    !phone ||
    !parentName ||
    !address
  ) {
    return Response.json({ error: 'Please fill in all required fields correctly.' }, { status: 400 });
  }

  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[admissions] Missing Supabase env vars — application cannot be stored.');
    return Response.json(
      { error: 'Online admission is not available right now. Please contact the center office to apply.' },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(cookies);

    // Resolve the human-readable batch to a batches.id (admin assigns it
    // later if no match exists yet).
    let batchId: number | null = null;
    const { data: match } = await supabase
      .from('batches')
      .select('id')
      .eq('grade', grade)
      .ilike('name', `%${batch}%`)
      .limit(1)
      .maybeSingle();
    if (match) batchId = match.id;

    const { error } = await supabase.from('admissions').insert({
      student_name: studentName,
      grade,
      phone,
      parent_name: parentName,
      parent_phone: parentPhone,
      address,
      batch_id: batchId,
      status: 'pending',
    });
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[admissions] failed:', err);
    return Response.json({ error: 'Could not submit application. Please try again.' }, { status: 500 });
  }
};
