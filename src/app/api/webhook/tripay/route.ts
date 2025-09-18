import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { addDays, generateToken } from '@/lib/token';
import { sendTokenEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('Supabase admin client unavailable for Tripay webhook.');
    return NextResponse.json({ error: 'Supabase integration unavailable' }, { status: 500 });
  }

  const raw = await req.text();
  const sentSig = req.headers.get('x-callback-signature') || '';
  const event = req.headers.get('x-callback-event') || '';

  const privateKey = process.env.TRIPAY_PRIVATE_KEY!;
  const localSig = crypto.createHmac('sha256', privateKey).update(raw).digest('hex');

  if (sentSig !== localSig || event !== 'payment_status') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = JSON.parse(raw);
  const { reference, status, customer_email, total_amount, amount_received } = payload;

  await supabase.from('payments').insert({
    provider: 'tripay',
    external_id: reference,
    email: customer_email || null,
    amount: amount_received ?? total_amount ?? null,
    status,
    payload,
  });

  if (status !== 'PAID') return NextResponse.json({ ok: true });

  const email = customer_email || null;
  let userId: string | null = null;

  if (email) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing?.id) userId = existing.id;
    else {
      const { data: inserted } = await supabase.from('users').insert({ email }).select('id').single();
      userId = inserted?.id ?? null;
    }
  }

  const token = generateToken(18);
  const expiresAt = addDays(14);

  await supabase.from('tokens').insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    is_active: true,
  });

  if (email) {
    try { await sendTokenEmail({ to: email, name: null, token, expiresAt }); }
    catch (e) { console.error('Email send error', e); }
  }

  return NextResponse.json({ ok: true });
}
