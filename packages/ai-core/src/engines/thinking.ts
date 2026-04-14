import type { AuthUser, TempleContext, EngineType } from '../types/index.js';

export interface ThinkingEngineResult {
  engine: EngineType;
  response: string;
  toolCalls: unknown[];
}

export async function runThinkingEngine(
  message: string,
  user: AuthUser,
  temple: TempleContext
): Promise<ThinkingEngineResult> {
  // TODO: Implement thinking engine — Phase 2
  return {
    engine: 'thinking',
    response: '[Thinking engine not yet implemented]',
    toolCalls: [],
  };
}
