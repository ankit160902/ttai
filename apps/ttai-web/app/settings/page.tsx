'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ConnectorCatalogEntry, ConnectorTestResult } from '../../lib/connectors/types';
import type { TempleSnapshot } from '../../lib/temple-types';
import Spinner from '../../components/ui/Spinner';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Profile fields
  const [form, setForm] = useState({
    name: '',
    deity: '',
    city: '',
    state: '',
    founded: '',
    languages: '',
    description: '',
    trustChairman: '',
  });

  // Connector state
  const [catalog, setCatalog] = useState<ConnectorCatalogEntry[]>([]);
  const [connectorType, setConnectorType] = useState<string>('mock');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<ConnectorTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  // Load catalog + current temple
  useEffect(() => {
    Promise.all([
      fetch('/api/connectors').then((r) => r.json()),
      fetch('/api/temple').then((r) => r.json()),
    ]).then(([cat, tmp]) => {
      setCatalog(cat.connectors);
      const t: TempleSnapshot = tmp.temple;
      setForm({
        name: t.name,
        deity: t.deity,
        city: t.city,
        state: t.state,
        founded: String(t.founded),
        languages: t.languages.join(', '),
        description: t.description,
        trustChairman: t.trustChairman,
      });
      if (t.connector) {
        setConnectorType(t.connector.type);
        setCredentials(t.connector.credentials ?? {});
      }
      setLoading(false);
    });
  }, []);

  const selectedCatalog = catalog.find((c) => c.type === connectorType);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateCredential(key: string, value: string) {
    setCredentials((c) => ({ ...c, [key]: value }));
    setTestResult(null);
  }

  function handleConnectorChange(type: string) {
    setConnectorType(type);
    setCredentials({});
    setTestResult(null);
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/connectors/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: connectorType, credentials }),
      });
      const data = await res.json();
      setTestResult({ ok: data.ok, message: data.message } as ConnectorTestResult);
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : 'Test failed' } as ConnectorTestResult);
    } finally {
      setTesting(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedAt(null);

    if (!form.name || !form.deity || !form.city || !form.state) {
      setError('Please fill in temple name, deity, city and state.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        deity: form.deity,
        city: form.city,
        state: form.state,
        founded: form.founded ? parseInt(form.founded, 10) : undefined,
        languages: form.languages
          ? form.languages.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        description: form.description || undefined,
        trustChairman: form.trustChairman || undefined,
        connector: { type: connectorType, credentials },
      };

      const res = await fetch('/api/temple', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Save failed (${res.status})`);
      }

      setSavedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <header className="bg-white border-b border-ink-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-ink-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">T</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900 leading-none tracking-tight">TTAI</p>
              <p className="text-[11px] text-ink-500 leading-none mt-1">Trustee Portal</p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs text-ink-500 hover:text-ink-900 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to chat
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold text-accent-700 uppercase tracking-wider mb-2">
            Temple Settings
          </p>
          <h1 className="text-3xl font-bold text-ink-900 tracking-tight">Configure your temple</h1>
          <p className="mt-3 text-sm text-ink-600 leading-relaxed max-w-2xl">
            Edit the temple profile and connect a data source. Saving will
            re-fetch operational data from the new source if you change it.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white border border-ink-200 rounded-lg shadow-card overflow-hidden"
        >
          {/* Section 1 — Identity */}
          <div className="px-6 lg:px-8 py-6 border-b border-ink-100">
            <SectionHeader index="01" title="Temple identity" subtitle="Required" />
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Temple name" required>
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Primary deity" required>
                <input type="text" value={form.deity} onChange={(e) => update('deity', e.target.value)} className={inputClass} />
              </Field>
              <Field label="City" required>
                <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
              </Field>
              <Field label="State" required>
                <input type="text" value={form.state} onChange={(e) => update('state', e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>

          {/* Section 2 — Profile */}
          <div className="px-6 lg:px-8 py-6 border-b border-ink-100">
            <SectionHeader index="02" title="Temple profile" subtitle="Optional" />
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Year founded">
                <input type="number" value={form.founded} onChange={(e) => update('founded', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Trust chairman">
                <input type="text" value={form.trustChairman} onChange={(e) => update('trustChairman', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Languages spoken" hint="Comma separated">
                <input type="text" value={form.languages} onChange={(e) => update('languages', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Description">
                <input type="text" value={form.description} onChange={(e) => update('description', e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>

          {/* Section 3 — Data source */}
          <div className="px-6 lg:px-8 py-6 border-b border-ink-100">
            <SectionHeader
              index="03"
              title="Data source"
              subtitle="Where TTAI fetches this temple's operational data"
            />

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catalog.map((c) => {
                const selected = c.type === connectorType;
                return (
                  <button
                    type="button"
                    key={c.type}
                    onClick={() => handleConnectorChange(c.type)}
                    className={`text-left p-4 rounded-md border transition-all ${
                      selected
                        ? 'border-ink-900 bg-ink-50 shadow-card'
                        : 'border-ink-200 bg-white hover:border-ink-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className="text-sm font-semibold text-ink-900">{c.label}</span>
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                          selected ? 'border-ink-900 bg-ink-900' : 'border-ink-300'
                        }`}
                      >
                        {selected && (
                          <svg className="w-full h-full text-white" fill="none" viewBox="0 0 12 12">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              stroke="currentColor" d="M3 6l2 2 4-4" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 leading-relaxed">{c.description}</p>
                  </button>
                );
              })}
            </div>

            {selectedCatalog && selectedCatalog.credentialFields.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium text-ink-700 mb-3">
                  Credentials for{' '}
                  <span className="font-semibold text-ink-900">{selectedCatalog.label}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-ink-50 border border-ink-200 rounded-md">
                  {selectedCatalog.credentialFields.map((f) => (
                    <Field key={f.key} label={f.label} required={f.required}>
                      <input
                        type={f.type ?? 'text'}
                        value={credentials[f.key] ?? ''}
                        onChange={(e) => updateCredential(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className={inputClass}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            )}

            {connectorType !== 'mock' && (
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-ink-300 hover:border-ink-400 hover:bg-ink-50 disabled:opacity-50 text-ink-900 text-sm font-medium rounded-md transition-colors"
                >
                  {testing ? (
                    <>
                      <Spinner />
                      Testing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Test connection
                    </>
                  )}
                </button>
                {testResult && (
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      testResult.ok ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {testResult.ok ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="px-6 lg:px-8 py-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {savedAt && !error && (
            <div className="px-6 lg:px-8 py-4 bg-emerald-50 border-b border-emerald-200">
              <p className="text-sm text-emerald-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Settings saved. Operational data refreshed from source.
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className="px-6 lg:px-8 py-5 bg-white flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ink-900 hover:bg-ink-800 disabled:bg-ink-400 text-white text-sm font-medium rounded-md transition-colors"
            >
              {saving ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                <>
                  Save changes
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2 bg-white border border-ink-200 rounded-md text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-400 transition';

// Spinner imported from components/ui/Spinner.tsx

function SectionHeader({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[10px] font-mono text-ink-400 tracking-wider">{index}</span>
      <div>
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-ink-700">
          {label}
          {required && <span className="text-accent-600 ml-1">*</span>}
        </span>
        {hint && <span className="text-[10px] text-ink-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
