'use client';

import { useRef, useEffect } from 'react';
import type { Message } from 'ai';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-saffron-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-saffron-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-temple-text mb-2">
            Ask your AI Assistant
          </h3>
          <p className="text-sm text-temple-muted mb-6">
            Query donations, bookings, devotee data, festival readiness, and more.
          </p>
          <div className="space-y-2 text-left">
            {[
              "Give me today's briefing",
              'Who are our top 10 donors this month?',
              'How is Navratri preparation going?',
              'Show me the audit summary for last quarter',
            ].map((suggestion) => (
              <div
                key={suggestion}
                className="px-3 py-2 bg-saffron-50 border border-saffron-100 rounded-lg text-sm text-saffron-800 cursor-default"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role as 'user' | 'assistant'}
          content={message.content}
          toolInvocations={message.toolInvocations as Array<{ toolName: string; state: 'call' | 'result' | 'partial-call'; args?: Record<string, unknown>; result?: unknown }>}
          isStreaming={isLoading && message.id === messages[messages.length - 1]?.id && message.role === 'assistant'}
        />
      ))}

      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex justify-start mb-4">
          <div className="flex items-center gap-2 px-4 py-3 bg-temple-card border border-temple-border rounded-2xl rounded-bl-md shadow-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-temple-muted">Thinking...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
