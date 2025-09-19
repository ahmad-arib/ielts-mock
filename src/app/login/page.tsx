'use client';

import { FormEvent, useState } from 'react';

import { DEFAULT_TEST_PATH } from '@/config/tests';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const token = String(form.get('token') ?? '').trim();

    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      window.location.href = DEFAULT_TEST_PATH;
      return;
    }

    try {
      const data = await response.json();
      setError(typeof data.error === 'string' ? data.error : 'Login failed');
    } catch (err) {
      console.error('Failed to parse login error', err);
      setError('Login failed');
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-md rounded-3xl bg-white/5 p-10 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur">
        <h1 className="mb-2 text-2xl font-bold text-white">Login to the IELTS Try Out</h1>
        <p className="mb-6 text-sm text-slate-200">
          Enter your token to access the Listening &amp; Reading try out. Writing &amp; Speaking modules are being prepared and will be
          announced by email soon.
        </p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="text-sm font-semibold text-white" htmlFor="token">
            Token
          </label>
          <input
            id="token"
            name="token"
            placeholder="Enter token"
            className="rounded-xl border border-white/20 bg-white/90 p-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-200">Scoring will be delivered by email.</p>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </div>
    </main>
  );
}
