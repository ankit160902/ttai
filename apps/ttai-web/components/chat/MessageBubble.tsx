'use client';

import ToolCallIndicator from './ToolCallIndicator';

interface ToolInvocation {
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
  args?: Record<string, unknown>;
  result?: unknown;
}

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolInvocations?: ToolInvocation[];
  isStreaming?: boolean;
}

export default function MessageBubble({ role, content, toolInvocations, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] lg:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar and label */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
            isUser
              ? 'bg-saffron-100 text-saffron-700'
              : 'bg-saffron-500 text-white'
          }`}>
            {isUser ? 'You' : 'AI'}
          </div>
          <span className="text-xs text-temple-muted">
            {isUser ? 'You' : 'TTAI Assistant'}
          </span>
        </div>

        {/* Tool call indicators */}
        {toolInvocations && toolInvocations.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {toolInvocations.map((tool, idx) => (
              <ToolCallIndicator
                key={idx}
                toolName={tool.toolName}
                status={tool.state === 'result' ? 'complete' : 'running'}
              />
            ))}
          </div>
        )}

        {/* Message content */}
        {content && (
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              isUser
                ? 'bg-saffron-500 text-white rounded-br-md'
                : 'bg-temple-card border border-temple-border text-temple-text rounded-bl-md shadow-sm'
            }`}
          >
            {content}
            {isStreaming && role === 'assistant' && (
              <span className="inline-block w-1.5 h-4 bg-saffron-500 ml-0.5 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
