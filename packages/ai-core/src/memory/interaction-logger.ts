import { randomUUID } from 'crypto';
import type { EngineType } from '../types/index.js';

export interface InteractionLogInput {
  templeId: string;
  userId: string;
  engine: EngineType;
  userMessage: string;
  assistantResponse: string;
  toolCallsJson: string;
  approvalStatus: 'not_required' | 'pending' | 'approved' | 'rejected';
}

export async function logInteraction(input: InteractionLogInput): Promise<string> {
  const id = randomUUID();

  // TODO: Write to ai_interactions table when db package is connected
  // await db.insert(aiInteractions).values({
  //   id,
  //   templeId: input.templeId,
  //   userId: input.userId,
  //   engine: input.engine,
  //   userMessage: input.userMessage,
  //   assistantResponse: input.assistantResponse,
  //   toolCallsJson: input.toolCallsJson,
  //   approvalStatus: input.approvalStatus,
  // });

  console.log(`[interaction-logger] Logged interaction ${id} for temple ${input.templeId}, engine: ${input.engine}`);

  return id;
}
