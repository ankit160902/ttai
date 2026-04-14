import type { AuthUser, TempleContext, EngineType } from '../types/index.js';

export interface ContentEngineResult {
  engine: EngineType;
  response: string;
  toolCalls: unknown[];
}

export async function runContentEngine(
  message: string,
  user: AuthUser,
  temple: TempleContext
): Promise<ContentEngineResult> {
  // TODO: Implement content engine — Phase 2
  return {
    engine: 'content',
    response: '[Content engine not yet implemented]',
    toolCalls: [],
  };
}
