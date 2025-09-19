'use client';

import { FormEvent, useState } from 'react';

type InterestFormProps = {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
};

export default function InterestForm({
  className = '',
  inputClassName = '',
  buttonClassName = '',
}: InterestFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess(false);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');

    if (typeof name !== 'string' || typeof email !== 'string') {
      setError('Please complete the form.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = typeof data?.error === 'string' ? data.error : 'Submission failed.';
        throw new Error(message);
      }

      form.reset();
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const baseInputClasses =
    'w-full rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0';
  const finalInputClasses = `${baseInputClasses} ${inputClassName}`.trim();
  const baseButtonClasses =
    'inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-80';
  const finalButtonClasses = `${baseButtonClasses} ${buttonClassName}`.trim();

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`.trim()}>
      <input
        name="name"
        placeholder="Your name"
        autoComplete="name"
        className={finalInputClasses}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email address"
        autoComplete="email"
        className={finalInputClasses}
        required
      />
      <button type="submit" disabled={loading} className={finalButtonClasses}>
        {loading ? 'Submitting…' : 'Notify me when it is ready'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Thanks! We will email you once it launches.</p>}
    </form>
  );
}
