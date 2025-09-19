'use client';
import { useState } from 'react';

import { DEFAULT_TEST_PATH } from '@/config/tests';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = (e.currentTarget.elements.namedItem('token') as HTMLInputElement).value;
    const res = await fetch('/api/session', {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) window.location.href = DEFAULT_TEST_PATH;
    else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <h1 className="mb-2 text-2xl font-bold text-white">Login to the IELTS Try Out</h1>
        <p className="mb-6 text-sm text-slate-100/80">
          Enter your token to access the Listening & Reading try out. Writing & Speaking modules are being prepared and will be
          announced by email soon.
        </p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            name="token"
            placeholder="Enter token"
            className="rounded border border-white/20 bg-white/95 p-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            disabled={loading}
            className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-100/70">Scoring will be delivered by email.</p>
        {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
      </div>
    </main>
  );
}
