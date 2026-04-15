'use client';

import { useState } from 'react';
import { parseResponseSections } from '../../lib/parse-response';

interface TopicAccordionProps {
  content: string;
  className?: string;
}

export default function TopicAccordion({ content, className = '' }: TopicAccordionProps) {
  const parsed = parseResponseSections(content);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  if (parsed.sections.length < 2) {
    return <div className={`whitespace-pre-wrap ${className}`}>{content}</div>;
  }

  const isOpen = (i: number) => openMap[i] !== false;

  return (
    <div className={className}>
      {parsed.summary && (
        <div className="whitespace-pre-wrap mb-3 text-ink-800">{parsed.summary}</div>
      )}
      <div className="divide-y divide-ink-200 border border-ink-200 rounded-md overflow-hidden bg-white">
        {parsed.sections.map((s, i) => {
          const open = isOpen(i);
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpenMap((m) => ({ ...m, [i]: !open }))}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-ink-50 transition-colors"
                aria-expanded={open}
              >
                <span className="text-xs font-semibold tracking-wide text-ink-900 uppercase">
                  {s.title}
                </span>
                <svg
                  className={`w-4 h-4 text-ink-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open && (
                <div className="px-3 pb-3 pt-1 text-sm leading-relaxed text-ink-800 whitespace-pre-wrap">
                  {s.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
