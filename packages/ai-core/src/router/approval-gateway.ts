// DB integration — will be connected when db package is ready
import { randomUUID } from 'crypto';
import type { RouterOutput, AuthUser } from '../types/index.js';

export interface GatewayResult {
  status: 'pass' | 'queued';
  output?: string;
  approvalId?: string;
  message?: string;
}

export async function runApprovalGateway(
  engineOutput: string,
  reasoning: string,
  actionType: string,
  payload: Record<string, unknown>,
  route: RouterOutput,
  user: AuthUser,
  interactionId: string
): Promise<GatewayResult> {
  if (!route.requiresApproval) {
    return { status: 'pass', output: engineOutput };
  }

  const approvalId = randomUUID();

  // TODO: Insert into aiApprovals table when db package is connected
  // await db.insert(aiApprovals).values({
  //   id:            approvalId,
  //   interactionId,
  //   templeId:      user.templeId,
  //   actionType,
  //   payload,
  //   explanation:   reasoning,
  //   requestedBy:   user.userId,
  //   status:        'pending',
  // });

  return {
    status: 'queued',
    approvalId,
    message: `This ${actionType.replace('_', ' ')} has been sent to your approval inbox. ` +
             `It will not be actioned until you approve it. ` +
             `Here is a preview of what was prepared:\n\n${engineOutput}`
  };
}
