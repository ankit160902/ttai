'use client';

interface BriefCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { direction: 'up' | 'down' | 'flat'; value: string };
  color: string;
}

interface MorningBriefProps {
  isLoading: boolean;
  briefText?: string;
}

function BriefCard({ title, value, subtitle, icon, trend, color }: BriefCardData) {
  return (
    <div className="bg-temple-card border border-temple-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend.direction === 'up' ? 'bg-green-50 text-green-700' :
            trend.direction === 'down' ? 'bg-red-50 text-red-700' :
            'bg-gray-50 text-gray-600'
          }`}>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.value}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-temple-text">{value}</h3>
      <p className="text-sm font-medium text-temple-text mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-temple-muted mt-1">{subtitle}</p>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-temple-card border border-temple-border rounded-xl p-5 shadow-sm animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-saffron-100" />
            <div className="w-12 h-5 rounded-full bg-gray-100" />
          </div>
          <div className="w-16 h-8 bg-gray-100 rounded mb-1" />
          <div className="w-24 h-4 bg-gray-100 rounded mb-1" />
          <div className="w-32 h-3 bg-gray-50 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function MorningBrief({ isLoading, briefText }: MorningBriefProps) {
  const cards: BriefCardData[] = [
    {
      title: "Today's Bookings",
      value: '--',
      subtitle: 'Loading from Dharma Stack...',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-blue-50',
      trend: { direction: 'flat', value: '--' },
    },
    {
      title: 'Donation Inflow',
      value: '--',
      subtitle: 'Loading from Dharma Stack...',
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-50',
      trend: { direction: 'flat', value: '--' },
    },
    {
      title: 'Open Alerts',
      value: '--',
      subtitle: 'Loading alerts...',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'bg-amber-50',
      trend: { direction: 'flat', value: '--' },
    },
    {
      title: 'Stock Alerts',
      value: '--',
      subtitle: 'Checking inventory...',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-red-50',
      trend: { direction: 'flat', value: '--' },
    },
  ];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <BriefCard key={card.title} {...card} />
        ))}
      </div>

      {/* AI-generated brief text */}
      {briefText && (
        <div className="bg-temple-card border border-temple-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-temple-text">Morning Brief</h3>
              <p className="text-xs text-temple-muted">Generated by TTAI</p>
            </div>
          </div>
          <div className="text-sm text-temple-text leading-relaxed whitespace-pre-wrap">
            {briefText}
          </div>
        </div>
      )}
    </div>
  );
}
