import { NextResponse } from 'next/server';
import { tripayBase } from '@/lib/tripay';
import crypto from 'crypto';

type TripayOrderItem = {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  product_url: string;
};

export async function POST(req: Request) {
  const { name, email } = (await req.json()) as { name: string; email: string };

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
  const orderItems: TripayOrderItem[] = [
    {
      sku: 'IELTS-MOCK-ONE',
      name: 'IELTS Mock Test Token (14 days)',
      price: amount,
      quantity: 1,
      product_url: `${process.env.APP_BASE_URL}/`,
    },
  ];

  const body = new URLSearchParams();
  body.set('method', method);
  body.set('merchant_ref', merchantRef);
  body.set('amount', String(amount));
  body.set('customer_name', name);
  body.set('customer_email', email);
  body.set('callback_url', `${process.env.APP_BASE_URL}/api/webhook/tripay`);
  body.set('return_url', `${process.env.APP_BASE_URL}/login?paid=1`);
  body.set('expired_time', String(expiredUnix));
  body.set('signature', signature);

  orderItems.forEach((item, index) => {
    body.set(`order_items[${index}][sku]`, item.sku);
    body.set(`order_items[${index}][name]`, item.name);
    body.set(`order_items[${index}][price]`, String(item.price));
    body.set(`order_items[${index}][quantity]`, String(item.quantity));
    body.set(`order_items[${index}][product_url]`, item.product_url);
  });

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
