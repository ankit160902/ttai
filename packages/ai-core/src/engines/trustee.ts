import type { AuthUser, TempleContext, EngineType } from '../types/index.js';

export interface TrusteeEngineResult {
  engine: EngineType;
  response: string;
  toolCalls: unknown[];
}

export async function runTrusteeEngine(
  message: string,
  user: AuthUser,
  temple: TempleContext
): Promise<TrusteeEngineResult> {
  // TODO: Implement full trustee engine with tool calling via streamText
  // This will be wired up in Phase 1
  return {
    engine: 'trustee',
    response: '[Trustee engine not yet implemented]',
    toolCalls: [],
  };
}
