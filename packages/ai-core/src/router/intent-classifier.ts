import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import type { RouterOutput, AuthUser, TempleContext } from '../types/index.js';

const INTENT_SYSTEM_PROMPT = `
You are the intent classifier for the Temple Trustee AI Assistant.
Classify the trustee's message into EXACTLY ONE engine and use case.

ENGINE DEFINITIONS:
  trustee  → operational data retrieval, reports, briefings, audits, complaints,
             daily operations questions, financial queries, compliance questions
  thinking → recommendations, campaign planning, devotee segmentation,
             reactivation, forecasting, strategic suggestions, opportunity analysis
  content  → drafting WhatsApp messages, emails, social posts, announcements,
             gratitude notes, festival communications, crisis messaging
  cro      → booking conversions, add-on recommendations, abandoned bookings,
             donation ask optimization, package presentation

USE CASE IDs (return the closest match):
  TA-01: Daily briefing  TA-02: Donor intelligence  TA-03: Audit summary
  TA-04: Meeting prep    TA-05: Complaint diagnosis  TA-06: Festival readiness
  TH-01: Festival offering recommendations           TH-02: Reactivation journeys
  TH-03: Hyperlocal opportunities                    TH-04: New offering advisory
  TH-05: Spiritual Graph                             TH-06: 90-day journey planning
  CA-01: Festival campaign kit  CA-02: Crisis comms  CA-03: Multilingual content
  CA-04: Donor gratitude        CA-05: Educational   CA-06: Event repurposing
  CRO-01: Add-on recommendations  CRO-02: Donation ask  CRO-03: Conversion targeting
  CRO-04: Abandoned booking recovery                 CRO-05: Package presentation

SENSITIVITY RULES:
  high   → output will be sent to devotees OR involves individual donor/finance PII
  medium → aggregated data, internal reports, strategic recommendations
  low    → general knowledge, temple config, non-personal queries

APPROVAL RULES:
  requiresApproval = true  IF engine is "content" AND sensitivityLevel is "high"
  requiresApproval = true  IF engine is "cro"     AND sensitivityLevel is "high"
  requiresApproval = false OTHERWISE

Return ONLY valid JSON. No explanation. No markdown. Example:
{"engine":"trustee","useCaseId":"TA-01","requiresApproval":false,
 "sensitivityLevel":"medium","toolsNeeded":["getDailyBriefing"],"reasoning":"User asked for morning brief"}
`;

export async function classifyIntent(
  message: string,
  user: AuthUser,
  temple: TempleContext
): Promise<RouterOutput> {
  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: INTENT_SYSTEM_PROMPT,
      prompt: `Temple: ${temple.templeName} | User role: ${user.role} | Message: "${message}"`,
      maxTokens: 300,
    });

    return JSON.parse(text) as RouterOutput;
  } catch {
    return {
      engine: 'trustee',
      useCaseId: 'TA-01',
      requiresApproval: false,
      sensitivityLevel: 'low',
      toolsNeeded: [],
      reasoning: 'Classification failed — defaulting to trustee engine'
    };
  }
}
