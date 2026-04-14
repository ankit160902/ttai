import type { AuthUser, TempleContext, EngineType } from '../types/index.js';

export interface CROEngineResult {
  engine: EngineType;
  response: string;
  toolCalls: unknown[];
}

export async function runCROEngine(
  message: string,
  user: AuthUser,
  temple: TempleContext
): Promise<CROEngineResult> {
  // TODO: Implement CRO engine — Phase 3
  return {
    engine: 'cro',
    response: '[CRO engine not yet implemented]',
    toolCalls: [],
  };
}
