import { NextResponse } from 'next/server';

import { sendInterestNotification } from '@/lib/email';
import { getSupabaseAdmin, hasSupabaseCredentials } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let payload: { name?: string; email?: string };

  try {
    payload = await req.json();
  } catch (error) {
    console.error('Invalid interest payload', error);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const supabaseConfigured = hasSupabaseCredentials();
  const supabase = getSupabaseAdmin();

  if (supabaseConfigured && !supabase) {
    return NextResponse.json({ error: 'Supabase is configured but unavailable.' }, { status: 503 });
  }

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('writing_speaking_interest')
        .upsert({ full_name: name, email }, { onConflict: 'email' });

      if (error) {
        console.error('Supabase interest upsert failed', error.code, error.message, error.details);
        return NextResponse.json(
          {
            error: 'We could not record your interest right now. Please try again later.',
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Supabase interest upsert threw', error);
      return NextResponse.json(
        { error: 'We could not record your interest right now. Please try again later.' },
        { status: 500 }
      );
    }
  }

  try {
    await sendInterestNotification({ name, email });
  } catch (error) {
    console.error('Failed to send interest notification', error);
    return NextResponse.json(
      { error: 'We could not record your interest right now. Please try again later.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
