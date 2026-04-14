'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmtINR, fmtCompact, formatRelative } from '../lib/format';
import { findCatalogEntry } from '../lib/connectors/registry';
import type { TempleSnapshot } from '../lib/temple-types';
import Spinner from '../components/ui/Spinner';

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [templeId, setTempleId] = useState<string | null>(null);
  const [temple, setTemple] = useState<TempleSnapshot | null>(null);
  const [templeLoading, setTempleLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: { templeId },
    onFinish: () => inputRef.current?.focus(),
  });

  async function loadTemple(id: string) {
    setTempleLoading(true);
    const r = await fetch(`/api/temple?id=${id}`);
    const d = await r.json();
    setTemple(d.temple);
    setTempleLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem('ttai_templeId');
    localStorage.removeItem('ttai_templeName');
    router.push('/login');
  }

  async function handleRefreshFromSource() {
    if (!templeId) return;
    setSyncing(true);
    setSyncError(null);
    try {
      await loadTemple(templeId);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    const storedId = localStorage.getItem('ttai_templeId');
    if (!storedId) {
      router.push('/login');
      return;
    }
    setTempleId(storedId);
    loadTemple(storedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // fmtINR and fmtCompact imported from lib/format.ts

  const suggestions = [
    "Give me today's trustee briefing from 7 AM to 10 PM",
    'Show me top donors, repeat donors, and devotees who have not donated in 90 days',
    'Prepare an audit brief with exceptions and reconciliations',
    'Create a trustee meeting brief for this month',
    'Why are devotees complaining more in Saturday evening bookings?',
    'Prepare a readiness review for our next festival',
    'What revenue opportunities am I missing right now?',
    'What are the top 5 things I should act on this week for temple betterment?',
  ];

  function sendSuggestion(text: string) {
    handleInputChange({
      target: { value: text },
    } as React.ChangeEvent<HTMLTextAreaElement>);
    setTimeout(() => document.querySelector('form')?.requestSubmit(), 50);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside className="w-80 bg-white border-r border-ink-200 flex-col hidden lg:flex">
        {/* Brand strip */}
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-ink-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">T</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-900 leading-none tracking-tight">TTAI</p>
              <p className="text-[10px] text-ink-500 leading-none mt-0.5">Trustee Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] text-ink-500 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Temple identity */}
        <div className="px-5 py-5 border-b border-ink-100">
          {templeLoading ? (
            <div className="space-y-2">
              <div className="h-5 bg-ink-100 rounded animate-pulse" />
              <div className="h-3 bg-ink-100 rounded animate-pulse w-2/3" />
            </div>
          ) : temple ? (
            <>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-accent-50 border border-accent-200 rounded-md flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m-1 4h1m4-4h1m-1 4h1m-5 4h4" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">Trustee of</p>
                  <h2 className="font-semibold text-ink-900 leading-tight tracking-tight text-sm mt-0.5">
                    {temple.name}
                  </h2>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs">
                <Row label="Deity" value={temple.deity} />
                <Row label="Location" value={`${temple.city}, ${temple.state}`} />
                <Row label="Founded" value={temple.founded + ' CE'} />
                <Row label="Languages" value={temple.languages.join(', ')} />
                <Row label="Chairman" value={temple.trustChairman} />
              </div>
            </>
          ) : null}
        </div>

        {/* Scrollable metrics area */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {temple && (
            <>
              {/* Data source */}
              <SectionLabel>Data source</SectionLabel>
              <div className="bg-white border border-ink-200 rounded-md overflow-hidden">
                <div className="px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-500">Connector</span>
                    <span className="font-semibold text-ink-900">
                      {findCatalogEntry(temple.connector?.type ?? 'mock')?.label ?? 'Mock'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-500">Last synced</span>
                    <span className="font-medium text-ink-700 tabular-nums">
                      {temple.connector?.lastSyncedAt
                        ? formatRelative(temple.connector.lastSyncedAt)
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-500">Status</span>
                    <SyncStatusBadge status={temple.connector?.lastSyncStatus ?? 'never'} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshFromSource}
                  disabled={syncing}
                  className="w-full px-3 py-2 border-t border-ink-200 bg-ink-50 hover:bg-ink-100 disabled:opacity-50 text-[11px] font-semibold text-ink-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  {syncing ? (
                    <>
                      <Spinner small />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh from source
                    </>
                  )}
                </button>
                {syncError && (
                  <div className="px-3 py-2 border-t border-red-200 bg-red-50 text-[10px] text-red-700">
                    {syncError}
                  </div>
                )}
              </div>

              {/* Live operations */}
              <SectionLabel className="mt-6">Live operations</SectionLabel>
              <div className="space-y-px bg-ink-100 border border-ink-200 rounded-md overflow-hidden">
                <Metric label="Registered Devotees" value={temple.stats.devoteeCount.toLocaleString('en-IN')} />
                <Metric label="Monthly Donations" value={fmtCompact(temple.stats.monthlyDonationsINR)} />
                <Metric label="Monthly Bookings" value={temple.stats.monthlyBookingsCount.toLocaleString('en-IN')} />
                <Metric label="Daily Footfall" value={temple.stats.dailyFootfall.toLocaleString('en-IN')} />
                <Metric label="Priests on Roll" value={String(temple.stats.priestsCount)} />
                <Metric
                  label="Active Complaints"
                  value={String(temple.stats.activeComplaints)}
                  warn={temple.stats.activeComplaints > 5}
                />
              </div>

              {/* Finance */}
              <SectionLabel className="mt-6">Finance (this month)</SectionLabel>
              <div className="space-y-px bg-ink-100 border border-ink-200 rounded-md overflow-hidden">
                <Metric label="Revenue" value={fmtCompact(temple.monthlyFinance.revenueINR)} />
                <Metric label="Expenses" value={fmtCompact(temple.monthlyFinance.expensesINR)} />
                <Metric label="Net Surplus" value={fmtCompact(temple.monthlyFinance.netSurplusINR)} positive />
              </div>

              {/* Next festival */}
              {temple.upcomingFestivals.length > 0 && (
                <>
                  <SectionLabel className="mt-6">Next festival</SectionLabel>
                  <div className="bg-white border border-ink-200 rounded-md p-3">
                    <p className="text-sm font-semibold text-ink-900">
                      {temple.upcomingFestivals[0]!.name}
                    </p>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      {temple.upcomingFestivals[0]!.date}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-ink-500">
                        ~{temple.upcomingFestivals[0]!.expectedFootfall.toLocaleString('en-IN')} expected
                      </span>
                      <PrepBadge status={temple.upcomingFestivals[0]!.preparationStatus} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-ink-100 bg-ink-50/50">
          <p className="text-[10px] text-ink-500 leading-relaxed">
            All data scoped to <strong className="text-ink-700">{temple?.name ?? 'this temple'}</strong>.
          </p>
        </div>
      </aside>

      {/* ─── Main pane ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-ink-200 px-4 lg:px-6 py-3 flex items-center gap-3">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-ink-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">T</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">
              You are signed in as Trustee of
            </p>
            <h1 className="text-sm font-semibold text-ink-900 truncate tracking-tight">
              {temple?.name ?? 'Loading...'}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="lg:hidden text-xs text-ink-500 hover:text-red-600"
          >
            Logout
          </button>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
              Live
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center px-6 py-12">
              <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                  <div className="w-14 h-14 bg-white border border-ink-200 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-card">
                    <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-ink-900 tracking-tight">
                    Namaste — how can I assist?
                  </h2>
                  <p className="text-sm text-ink-600 mt-2">
                    I have access to live data for{' '}
                    <span className="font-semibold text-ink-900">{temple?.name ?? 'this temple'}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendSuggestion(s)}
                      disabled={isLoading}
                      className="group px-4 py-3 bg-white border border-ink-200 rounded-md text-sm text-ink-700 hover:border-ink-300 hover:bg-ink-50 hover:text-ink-900 transition-all text-left disabled:opacity-50 flex items-center justify-between gap-2"
                    >
                      <span>{s}</span>
                      <svg className="w-3.5 h-3.5 text-ink-400 group-hover:text-ink-700 group-hover:translate-x-0.5 transition-all"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} content={m.content} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-start gap-3">
                  <Avatar role="assistant" />
                  <div className="bg-white border border-ink-200 rounded-md rounded-tl-none px-4 py-3 shadow-card">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 lg:px-6 pt-2">
            <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-md px-4 py-2.5 text-sm text-red-700">
              {error.message || 'Something went wrong. Please try again.'}
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-ink-200 bg-white px-4 lg:px-6 py-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative bg-white border border-ink-200 rounded-lg shadow-card focus-within:border-ink-400 focus-within:ring-2 focus-within:ring-ink-900/10 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => handleInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || templeLoading}
                placeholder={
                  isLoading
                    ? 'AI is responding...'
                    : `Ask anything about ${temple?.name ?? 'this temple'}...`
                }
                rows={1}
                className="w-full px-4 py-3 pr-14 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none disabled:opacity-60 resize-none max-h-32"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || templeLoading || !input.trim()}
                className="absolute right-2 bottom-2 w-9 h-9 bg-ink-900 hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed text-white rounded-md flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-ink-400 mt-2 text-center">
              TTAI may produce inaccurate responses. Always verify critical numbers against the source.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

/* ─── Helpers ─── */

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar role={role} />
      <div
        className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap rounded-md ${
          isUser
            ? 'bg-ink-900 text-white rounded-tr-none'
            : 'bg-white border border-ink-200 text-ink-900 rounded-tl-none shadow-card'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function Avatar({ role }: { role: string }) {
  if (role === 'user') {
    return (
      <div className="w-7 h-7 bg-ink-200 text-ink-700 rounded-md flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-7 h-7 bg-ink-900 text-white rounded-md flex items-center justify-center flex-shrink-0">
      <span className="text-[10px] font-bold tracking-tight">T</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-ink-500 text-[11px]">{label}</span>
      <span className="text-ink-900 text-[11px] font-medium text-right truncate">{value}</span>
    </div>
  );
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-2 ${className}`}>
      {children}
    </p>
  );
}

function Metric({
  label,
  value,
  warn,
  positive,
}: {
  label: string;
  value: string;
  warn?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="bg-white px-3 py-2.5 flex items-center justify-between">
      <span className="text-[11px] text-ink-600">{label}</span>
      <span
        className={`text-xs font-semibold tabular-nums ${
          warn ? 'text-red-600' : positive ? 'text-emerald-700' : 'text-ink-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SyncStatusBadge({ status }: { status: 'success' | 'error' | 'never' }) {
  const styles: Record<string, { cls: string; label: string; dot: string }> = {
    success: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Synced', dot: 'bg-emerald-500' },
    error: { cls: 'bg-red-50 text-red-700 border-red-200', label: 'Error', dot: 'bg-red-500' },
    never: { cls: 'bg-ink-100 text-ink-600 border-ink-200', label: 'Never', dot: 'bg-ink-400' },
  };
  const s = styles[status] ?? styles.never!;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold border rounded ${s.cls}`}>
      <span className={`w-1 h-1 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function PrepBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'on-track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'needs-attention': 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };
  const cls = styles[status] ?? 'bg-ink-100 text-ink-700 border-ink-200';
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border rounded ${cls}`}>
      {status.replace('-', ' ')}
    </span>
  );
}

// Spinner imported from components/ui/Spinner.tsx
