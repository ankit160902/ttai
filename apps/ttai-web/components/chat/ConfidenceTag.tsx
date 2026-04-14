'use client';

interface ConfidenceTagProps {
  level: 'HIGH' | 'PARTIAL' | 'LOW' | 'NONE';
  message?: string;
}

const DEFAULT_STYLE = {
  bg: 'bg-red-50 border-red-200',
  text: 'text-red-700',
  dot: 'bg-red-500',
  label: 'No Data',
} as const;

const CONFIDENCE_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  HIGH: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'High Confidence',
  },
  PARTIAL: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    label: 'Partial Data',
  },
  LOW: {
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    label: 'Low Confidence',
  },
  NONE: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'No Data',
  },
};

export default function ConfidenceTag({ level, message }: ConfidenceTagProps) {
  const style = CONFIDENCE_STYLES[level] ?? DEFAULT_STYLE;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
      {message && (
        <span className="opacity-75 ml-1">- {message}</span>
      )}
    </div>
  );
}
