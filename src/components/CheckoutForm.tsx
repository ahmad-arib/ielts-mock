'use client';

import { FormEvent, useState } from 'react';

type CheckoutFormProps = {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  buttonLabel?: string;
  buttonClassName?: string;
  inputClassName?: string;
};

export default function CheckoutForm({
  orientation = 'vertical',
  className = '',
  buttonLabel = 'Pay & Get Try Out Token',
  buttonClassName = '',
  inputClassName = '',
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    if (typeof name !== 'string' || typeof email !== 'string') {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        const message = typeof data?.error === 'string' ? data.error : 'Failed to start payment.';
        alert(message);
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url as string;
      } else if (data.pay_code) {
        if (Array.isArray(data.instructions) && data.instructions.length > 0) {
          console.table(data.instructions);
        }
        alert(`Use this pay code: ${data.pay_code}. After paying, go to Login.`);
        window.location.href = '/login?paid=1';
      } else {
        console.warn('Tripay response missing payment link', data);
        alert('Failed to start payment');
      }
    } catch (error) {
      console.error(error);
      alert('Unable to start payment right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const isHorizontal = orientation === 'horizontal';
  const layoutClasses = isHorizontal
    ? 'flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2'
    : 'flex flex-col gap-3';

  const baseInputClasses =
    'w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0';

  const finalInputClasses = `${baseInputClasses} ${inputClassName}`.trim();
  const nameInputClasses = `${finalInputClasses} ${isHorizontal ? 'sm:flex-1' : ''}`.trim();

  const baseButtonClasses =
    'inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-80';

  const finalButtonClasses = `${baseButtonClasses} ${buttonClassName}`.trim();

  return (
    <form onSubmit={handleSubmit} className={`${layoutClasses} ${className}`.trim()}>
      <input
        name="name"
        placeholder="Your full name"
        autoComplete="name"
        className={nameInputClasses}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email for token delivery"
        autoComplete="email"
        className={nameInputClasses}
        required
      />
      <button type="submit" disabled={loading} className={finalButtonClasses}>
        {loading ? 'Starting payment…' : buttonLabel}
      </button>
    </form>
  );
}
