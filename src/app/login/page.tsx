'use client';
import { useState } from 'react';

import { DEFAULT_TEST_PATH } from '@/config/tests';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError('');
    const token = (e.currentTarget.elements.namedItem('token') as HTMLInputElement).value;
    const res = await fetch('/api/session', { method: 'POST', body: JSON.stringify({ token }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) window.location.href = DEFAULT_TEST_PATH;
    else { const data = await res.json(); setError(data.error || 'Login failed'); }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md p-10">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Login to the IELTS Try Out</h1>
      <p className="mb-6 text-sm text-slate-600">
        Enter your token to access the Listening & Reading try out. Writing & Speaking modules are being prepared and will be
        announced by email soon.
      </p>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input name="token" placeholder="Enter token" className="rounded border border-slate-300 p-3 text-sm" required />
        <button disabled={loading} className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      <p className="mt-3 text-xs text-slate-500">Scoring will be delivered by email.</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </main>
  );
}
