import type { APIRoute } from 'astro';
import { createClient } from '../../../lib/supabase-server';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const supabase = createClient(cookies);
    await supabase.auth.signOut();
  } catch {
    // fall through — redirect to login regardless
  }
  return Response.json({ redirect: '/login' });
};
