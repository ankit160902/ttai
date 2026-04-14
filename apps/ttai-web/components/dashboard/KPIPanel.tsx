'use client';

interface KPIItem {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

interface KPIPanelProps {
  title: string;
  items: KPIItem[];
}

export default function KPIPanel({ title, items }: KPIPanelProps) {
  return (
    <div className="bg-temple-card border border-temple-border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-temple-text mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-sm text-temple-muted">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-temple-text">{item.value}</span>
              {item.change && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  item.changeType === 'positive' ? 'bg-green-50 text-green-700' :
                  item.changeType === 'negative' ? 'bg-red-50 text-red-700' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {item.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
