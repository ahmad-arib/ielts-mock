import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { tripayBase } from '@/lib/tripay';
import { resolveTripayCallbackUrl, resolveTripayProductUrl, resolveTripayReturnUrl } from '@/lib/appConfig';

export const runtime = 'nodejs';

type TripayOrderItem = {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  product_url: string;
};

type TripayCreateResponse = {
  success: boolean;
  message?: string;
  data?: {
    reference?: string;
    merchant_ref?: string;
    checkout_url?: string;
    pay_code?: string;
    payment_code?: string;
    pay_url?: string;
    payment_name?: string;
    amount?: number;
    total_amount?: number;
    instructions?: unknown;
  };
};

export async function POST(req: Request) {
  let payload: { name?: string; email?: string };

  try {
    payload = await req.json();
  } catch (error) {
    console.error('Invalid checkout payload', error);
    return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  const configuredAmount = Number(process.env.TRIPAY_AMOUNT);
  const amount = Number.isFinite(configuredAmount) && configuredAmount > 0 ? Math.round(configuredAmount) : 50000;
  const method = process.env.TRIPAY_METHOD?.trim() || '';
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  const apiKey = process.env.TRIPAY_API_KEY;

  const missing: string[] = [];
  if (!method) missing.push('TRIPAY_METHOD');
  if (!merchantCode) missing.push('TRIPAY_MERCHANT_CODE');
  if (!privateKey) missing.push('TRIPAY_PRIVATE_KEY');
  if (!apiKey) missing.push('TRIPAY_API_KEY');

  if (missing.length > 0) {
    console.error('Tripay configuration missing:', missing.join(', '));
    return NextResponse.json(
      { error: 'Payment gateway is not configured. Please contact support.' },
      { status: 500 }
    );
  }

  const base = tripayBase();
  const merchantRef = `INV_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const expiredUnix = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  const signature = crypto
    .createHmac('sha256', privateKey!)
    .update(merchantCode! + merchantRef + amount)
    .digest('hex');

  const orderItems: TripayOrderItem[] = [
    {
      sku: 'IELTS-TRY-OUT-ONE',
      name: 'IELTS Try Out Token (14 days)',
      price: amount,
      quantity: 1,
      product_url: resolveTripayProductUrl(),
    },
  ];

  const requestBody = {
    method,
    merchant_ref: merchantRef,
    amount,
    customer_name: name,
    customer_email: email,
    order_items: orderItems,
    callback_url: resolveTripayCallbackUrl(),
    return_url: resolveTripayReturnUrl(),
    expired_time: expiredUnix,
    signature,
  };

  const resp = await fetch(`${base}/transaction/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify(requestBody),
  });

  const rawResponse = await resp.text();

  if (!resp.ok) {
    console.error('Tripay create error:', rawResponse);
    let message = 'Failed to create transaction';
    try {
      const parsed = JSON.parse(rawResponse);
      if (typeof parsed?.message === 'string') message = parsed.message;
    } catch {
      // ignore json parse error
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let parsed: TripayCreateResponse;
  try {
    parsed = JSON.parse(rawResponse) as TripayCreateResponse;
  } catch (error) {
    console.error('Tripay response parse error', error, rawResponse);
    return NextResponse.json(
      { error: 'Unexpected response from payment gateway.' },
      { status: 502 }
    );
  }

  if (!parsed.success) {
    console.error('Tripay rejected transaction:', parsed);
    return NextResponse.json(
      { error: parsed.message || 'Tripay could not create the transaction.' },
      { status: 400 }
    );
  }

  const data = parsed.data || {};
  const checkoutUrl = (data.checkout_url || data.pay_url || null) as string | null;
  const payCode = (data.pay_code || data.payment_code || null) as string | null;

  if (!checkoutUrl && !payCode) {
    console.warn('Tripay response missing checkout_url and pay_code', parsed);
  }

  return NextResponse.json({
    reference: data.reference,
    merchant_ref: data.merchant_ref,
    checkout_url: checkoutUrl,
    pay_code: payCode,
    payment_name: data.payment_name,
    amount: data.amount ?? amount,
    total_amount: data.total_amount,
    instructions: data.instructions,
  });
}
