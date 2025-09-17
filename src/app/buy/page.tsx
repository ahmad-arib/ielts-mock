'use client';
import { useState } from 'react';

export default function BuyPage() {
  const [loading, setLoading] = useState(false);

  async function handleBuy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.checkout_url) window.location.href = data.checkout_url;
    else if (data.pay_code) { alert(`Use this pay code: ${data.pay_code}. After paying, go to Login.`); window.location.href = '/login?paid=1'; }
    else alert('Failed to start payment');
    setLoading(false);
  }

  return (
    <main className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buy IELTS Mock Test</h1>
      <form onSubmit={handleBuy} className="flex flex-col gap-4">
        <input name="name" placeholder="Your name" className="border p-2 rounded" required />
        <input name="email" type="email" placeholder="Your email" className="border p-2 rounded" required />
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? 'Loading...' : 'Pay & Get Token'}</button>
      </form>
    </main>
  );
}
