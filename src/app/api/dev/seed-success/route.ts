import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { addDays, generateToken } from '@/lib/token';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<{
    email: string;
    user: string;
    amount: number;
    token: string;
  }>;

  const email = body.email?.trim() || 'mail@ahmadarib.com';
  const user = body.user?.trim() || 'ahmadarib';
  const amount = typeof body.amount === 'number' ? body.amount : 0;
  const token = body.token?.trim() || generateToken(18);
  const expiresAt = addDays(14).toISOString();
  const externalId = `dev-${Date.now()}`;

  const paymentPayload = {
    seeded: true,
    user,
    email,
    source: 'manual-dev-seed',
    createdAt: new Date().toISOString(),
  };

  const { error: paymentError } = await supabase.from('payments').insert({
    provider: 'manual_dev',
    external_id: externalId,
    email,
    amount,
    status: 'PAID',
    payload: paymentPayload,
  });

  if (paymentError) {
    console.error('Seed payment insert error', paymentError);
    return NextResponse.json(
      { error: 'Failed to create payment record', details: paymentError.message },
      { status: 500 },
    );
  }

  let userId: string | null = null;

  const { data: existingUser, error: existingError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingError) {
    console.error('Seed user lookup error', existingError);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: existingError.message },
      { status: 500 },
    );
  }

  if (existingUser?.id) {
    userId = existingUser.id;
  } else {
    const { data: insertedUser, error: insertUserError } = await supabase
      .from('users')
      .insert({ email })
      .select('id')
      .single();

    if (insertUserError) {
      console.error('Seed user insert error', insertUserError);
      return NextResponse.json(
        { error: 'Failed to create user', details: insertUserError.message },
        { status: 500 },
      );
    }

    userId = insertedUser?.id ?? null;
  }

  const { error: tokenError } = await supabase.from('tokens').insert({
    user_id: userId,
    token,
    expires_at: expiresAt,
    is_active: true,
  });

  if (tokenError) {
    console.error('Seed token insert error', tokenError);
    return NextResponse.json(
      { error: 'Failed to create token', details: tokenError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    email,
    user,
    token,
    expiresAt,
    externalId,
    userId,
  });
}
