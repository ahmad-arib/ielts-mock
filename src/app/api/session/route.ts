import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { token } = await req.json();
  const { data } = await supabase.from('tokens').select('*').eq('token', token).eq('is_active', true).single();

  if (!data) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set('session_token', token, { httpOnly: true, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 14 });
  return res;
}
