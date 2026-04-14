import type { TempleContext, AuthUser } from '../types/index.js';

export function buildThinkingSystemPrompt(temple: TempleContext, user: AuthUser): string {
  // TODO: Build full thinking engine system prompt — Phase 2
  return `You are the Thinking Assistant for ${temple.templeName}. You provide strategic recommendations, campaign planning, devotee segmentation, and forecasting insights. Speaking with ${user.name} (${user.role}). Today: ${new Date().toLocaleString('en-IN', { timeZone: temple.timezone })}`;
}
