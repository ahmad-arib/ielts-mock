'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError('');
    const token = (e.currentTarget.elements.namedItem('token') as HTMLInputElement).value;
    const res = await fetch('/api/session', { method: 'POST', body: JSON.stringify({ token }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) window.location.href = '/test';
    else { const data = await res.json(); setError(data.error || 'Login failed'); }
    setLoading(false);
  }

  return (
    <main className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login with Token</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input name="token" placeholder="Enter token" className="border p-2 rounded" required />
        <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading ? 'Loading...' : 'Login'}</button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </main>
  );
}
