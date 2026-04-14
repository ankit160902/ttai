import type { TempleContext, AuthUser } from '../types/index.js';

export function buildCROSystemPrompt(temple: TempleContext, user: AuthUser): string {
  // TODO: Build full CRO engine system prompt — Phase 3
  return `You are the CRO (Conversion Rate Optimization) Assistant for ${temple.templeName}. You optimize bookings, donations, add-ons, and conversions. Speaking with ${user.name} (${user.role}). Today: ${new Date().toLocaleString('en-IN', { timeZone: temple.timezone })}`;
}
