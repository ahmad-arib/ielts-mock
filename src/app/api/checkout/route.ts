import { NextResponse } from 'next/server';
import { tripayBase } from '@/lib/tripay';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { name, email } = await req.json();

  const amount = 50000;
  const method = process.env.TRIPAY_METHOD || 'QRIS';
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE!;
  const privateKey = process.env.TRIPAY_PRIVATE_KEY!;
  const apiKey = process.env.TRIPAY_API_KEY!;
  const base = tripayBase();

  const merchantRef = `INV_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const expiredUnix = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  const signature = crypto
    .createHmac('sha256', privateKey)
    .update(merchantCode + merchantRef + amount)
    .digest('hex');

  const payload: Record<string, any> = {
    method,
    merchant_ref: merchantRef,
    amount,
    customer_name: name,
    customer_email: email,
    order_items: [
      { sku: 'IELTS-MOCK-ONE', name: 'IELTS Mock Test Token (14 days)', price: amount, quantity: 1, product_url: `${process.env.APP_BASE_URL}/` },
    ],
    callback_url: `${process.env.APP_BASE_URL}/api/webhook/tripay`,
    return_url: `${process.env.APP_BASE_URL}/login?paid=1`,
    expired_time: expiredUnix,
    signature,
  };

  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) {
    if (Array.isArray(v)) {
      v.forEach((item, i) => Object.entries(item).forEach(([kk, vv]) => body.append(`order_items[${i}][${kk}]`, String(vv))));
    } else {
      body.append(k, String(v));
    }
  }

  const resp = await fetch(`${base}/transaction/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Bearer ' + apiKey },
    body,
  });

  if (!resp.ok) {
    console.error('Tripay create error:', await resp.text());
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }

  const data = await resp.json();
  return NextResponse.json({
    reference: data?.data?.reference,
    checkout_url: data?.data?.checkout_url,
    pay_code: data?.data?.pay_code,
    instructions: data?.data?.instructions,
  });
}
