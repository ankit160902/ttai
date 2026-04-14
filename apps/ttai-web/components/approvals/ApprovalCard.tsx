'use client';

import { useState } from 'react';

interface ApprovalCardProps {
  id: string;
  actionType: string;
  explanation: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function formatActionType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const ACTION_TYPE_COLORS: Record<string, string> = {
  content_publish: 'bg-purple-50 text-purple-700 border-purple-200',
  campaign_launch: 'bg-blue-50 text-blue-700 border-blue-200',
  package_create: 'bg-green-50 text-green-700 border-green-200',
  outreach_send: 'bg-saffron-50 text-saffron-700 border-saffron-200',
  slot_expansion: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  purchase_order: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function ApprovalCard({
  id,
  actionType,
  explanation,
  payload,
  status,
  createdAt,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const tagColor = ACTION_TYPE_COLORS[actionType] ?? 'bg-gray-50 text-gray-700 border-gray-200';

  async function handleAction(action: 'approve' | 'reject') {
    setIsActioning(true);
    if (action === 'approve') {
      onApprove(id);
    } else {
      onReject(id);
    }
    // Actioning state will be cleared when parent re-renders with new status
  }

  return (
    <div className="bg-temple-card border border-temple-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tagColor}`}>
              {formatActionType(actionType)}
            </span>
            <p className="text-xs text-temple-muted mt-1.5">
              {new Date(createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          {status !== 'pending' && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'approved'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>

        {/* Explanation */}
        <p className="text-sm text-temple-text leading-relaxed mb-3">
          {explanation}
        </p>

        {/* Payload preview */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-saffron-600 hover:text-saffron-700 font-medium flex items-center gap-1 transition-colors"
        >
          {isExpanded ? 'Hide' : 'Show'} details
          <svg
            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="mt-3 p-3 bg-temple-bg rounded-lg border border-temple-border">
            <pre className="text-xs text-temple-muted overflow-auto whitespace-pre-wrap">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      {status === 'pending' && (
        <div className="px-5 py-3 bg-temple-bg border-t border-temple-border flex items-center gap-3">
          <button
            onClick={() => handleAction('approve')}
            disabled={isActioning}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            {isActioning ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={isActioning}
            className="flex-1 py-2 bg-temple-card hover:bg-red-50 disabled:opacity-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            {isActioning ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
}
