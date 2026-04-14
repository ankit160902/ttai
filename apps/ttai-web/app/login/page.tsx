'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!loginId.trim() || !password.trim()) {
      setError('Please enter both Login ID and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });

      const data = await res.json();

      if (!data.valid) {
        setError(data.message || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('ttai_templeId', data.templeId);
      localStorage.setItem('ttai_templeName', data.templeName);
      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-ink-900 rounded-xl flex items-center justify-center mx-auto mb-5">
            <span className="text-white font-bold text-2xl tracking-tight">T</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">TTAI</h1>
          <p className="text-sm text-ink-500 mt-1">Temple Trustee AI Assistant</p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-ink-200 rounded-lg shadow-card overflow-hidden"
        >
          <div className="px-6 py-8">
            <h2 className="text-lg font-semibold text-ink-900 mb-1">Sign in to your temple</h2>
            <p className="text-xs text-ink-500 mb-6">
              Enter your temple credentials to access the AI assistant.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5">
                  Temple Login ID
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. siddhivinayak"
                  autoFocus
                  className="w-full px-3 py-2.5 bg-white border border-ink-200 rounded-md text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2.5 bg-white border border-ink-200 rounded-md text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-400 transition"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-ink-50/60 border-t border-ink-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 disabled:bg-ink-400 text-white text-sm font-medium rounded-md transition-colors"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Credentials hint */}
        <div className="mt-6 bg-white border border-ink-200 rounded-lg shadow-card px-5 py-4">
          <p className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-3">
            Demo Credentials
          </p>
          <div className="space-y-1.5 text-xs">
            <CredRow id="siddhivinayak" pw="ttai@001" name="Siddhivinayak, Mumbai" />
            <CredRow id="kashivishwanath" pw="ttai@002" name="Kashi Vishwanath, Varanasi" />
            <CredRow id="tirupati" pw="ttai@003" name="Tirupati Balaji, Tirupati" />
            <CredRow id="meenakshi" pw="ttai@004" name="Meenakshi Amman, Madurai" />
            <CredRow id="iskcon" pw="ttai@005" name="ISKCON, Bangalore" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CredRow({ id, pw, name }: { id: string; pw: string; name: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-600">
      <code className="px-1.5 py-0.5 bg-ink-50 rounded text-[11px] font-mono text-ink-900">{id}</code>
      <span className="text-ink-400">/</span>
      <code className="px-1.5 py-0.5 bg-ink-50 rounded text-[11px] font-mono text-ink-900">{pw}</code>
      <span className="text-ink-400 ml-auto text-[10px]">{name}</span>
    </div>
  );
}
