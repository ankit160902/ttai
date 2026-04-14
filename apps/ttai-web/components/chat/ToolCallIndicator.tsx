'use client';

interface ToolCallIndicatorProps {
  toolName: string;
  status: 'running' | 'complete' | 'error';
}

const TOOL_LABELS: Record<string, string> = {
  getDailyBriefing: 'Checking daily briefing data...',
  getDonorIntelligence: 'Analysing donor records...',
  getAuditSummary: 'Pulling audit data...',
  getMeetingBrief: 'Preparing meeting brief...',
  getComplaintDiagnosis: 'Reviewing complaints...',
  getFestivalReadiness: 'Checking festival readiness...',
};

export default function ToolCallIndicator({ toolName, status }: ToolCallIndicatorProps) {
  const label = TOOL_LABELS[toolName] ?? `Running ${toolName}...`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-saffron-50 border border-saffron-200 rounded-lg text-sm">
      {status === 'running' && (
        <div className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
      {status === 'complete' && (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'error' && (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className={`${status === 'running' ? 'text-saffron-700' : status === 'error' ? 'text-red-600' : 'text-green-700'}`}>
        {status === 'complete' ? label.replace('...', ' - Done') : status === 'error' ? label.replace('...', ' - Failed') : label}
      </span>
    </div>
  );
}
