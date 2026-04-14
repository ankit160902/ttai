# CLAUDE.md — Temple Trustee AI Assistant (TTAI)
# 3ionetra Faith and Technology Services Pvt. Ltd.
# This is the authoritative context file for all Claude Code sessions on this repository.
# Read this entire file before writing any code. Do not skip sections.

---

## WHAT YOU ARE BUILDING

TTAI is an AI-powered decision intelligence layer for Hindu temple trustees.
It gives temple leadership a single conversational interface to query, forecast,
and act on everything happening across their temple — donations, bookings, stock,
priests, compliance, devotees, festivals — in plain language.

It is NOT a chatbot. It is NOT a dashboard. It is a role-aware AI operating
companion built on top of the existing 3ionetra Dharma Stack.

Four AI engines power the product:
  - Trustee Assistant  → answers operational questions, generates briefings
  - Thinking Assistant → recommends campaigns, segments, reactivation journeys
  - Content Assistant  → drafts spiritually-aligned communications and content
  - CRO Assistant      → optimises bookings, donations, add-ons, conversions

All four engines share a common data layer, an intent router, an approval
gateway, and a learning loop. Nothing reaches a devotee without trustee approval.

---

## STACK — DO NOT DEVIATE WITHOUT EXPLICIT INSTRUCTION

```
Runtime:          Node.js 20 LTS (TypeScript strict mode throughout)
Frontend:         Next.js 14 (App Router, RSC where appropriate)
Backend API:      Express 4 + TypeScript (within the Next.js API routes for now)
AI Orchestration: Vercel AI SDK (useChat, streamText, tool calling)
LLM:              Anthropic Claude — model: claude-sonnet-4-20250514 for all reasoning
                  Anthropic Claude — model: claude-haiku-4-5-20251001 for classification/drafts
Embeddings:       OpenAI text-embedding-3-small
Vector DB:        Qdrant (running locally via Docker for dev, cloud for prod)
Relational DB:    MySQL 8 (existing Dharma Stack DB — read access only until schema is extended)
Cache/Queue:      Redis 7 + BullMQ
ORM:              Drizzle ORM (MySQL dialect)
Auth:             JWT — extends existing Dharma ID / UDI auth system
Monorepo:         Turborepo
Package manager:  pnpm (workspaces)
Testing:          Vitest (unit), Playwright (E2E for critical flows)
LLM Observability: Langfuse (self-hosted via Docker)
Containerisation: Docker + docker-compose for all local services
Deployment:       Vercel (frontend) + existing AWS EC2 (backend services)
```

---

## REPOSITORY STRUCTURE

This repository is a Turborepo monorepo. The structure below is the target.
Create files and folders exactly as named. Do not invent new top-level folders.

```
ttai/
├── CLAUDE.md                          ← this file — always present at root
├── package.json                       ← root workspace config
├── turbo.json                         ← Turborepo pipeline config
├── pnpm-workspace.yaml
├── docker-compose.yml                 ← Qdrant + Redis + Langfuse + MySQL (dev)
├── .env.example                       ← all required env vars with descriptions
├── .env.local                         ← local values — never commit
│
├── apps/
│   └── ttai-web/                      ← Next.js 14 frontend + API routes
│       ├── app/
│       │   ├── (auth)/
│       │   │   └── login/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx           ← morning brief / KPI dashboard
│       │   │   ├── chat/page.tsx      ← trustee chat interface
│       │   │   └── approvals/page.tsx ← approval inbox
│       │   └── api/
│       │       ├── chat/route.ts      ← main AI chat endpoint (streaming)
│       │       ├── approvals/route.ts
│       │       └── health/route.ts
│       ├── components/
│       │   ├── chat/
│       │   │   ├── ChatWindow.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── ToolCallIndicator.tsx
│       │   │   └── ConfidenceTag.tsx
│       │   ├── dashboard/
│       │   │   ├── MorningBrief.tsx
│       │   │   ├── KPIPanel.tsx
│       │   │   └── AlertBanner.tsx
│       │   └── approvals/
│       │       └── ApprovalCard.tsx
│       ├── lib/
│       │   └── auth.ts
│       └── package.json
│
├── packages/
│   ├── ai-core/                       ← all AI logic lives here, never in the app
│   │   ├── src/
│   │   │   ├── router/
│   │   │   │   ├── intent-classifier.ts
│   │   │   │   └── approval-gateway.ts
│   │   │   ├── engines/
│   │   │   │   ├── trustee.ts
│   │   │   │   ├── thinking.ts
│   │   │   │   ├── content.ts
│   │   │   │   └── cro.ts
│   │   │   ├── tools/
│   │   │   │   ├── dharma-stack/
│   │   │   │   │   ├── donations.ts
│   │   │   │   │   ├── bookings.ts
│   │   │   │   │   ├── devotees.ts
│   │   │   │   │   ├── inventory.ts
│   │   │   │   │   ├── finance.ts
│   │   │   │   │   ├── priests.ts
│   │   │   │   │   ├── festivals.ts
│   │   │   │   │   ├── compliance.ts
│   │   │   │   │   ├── staff.ts
│   │   │   │   │   └── vendors.ts
│   │   │   │   └── external/
│   │   │   │       ├── panchang.ts
│   │   │   │       ├── weather.ts
│   │   │   │       └── holidays.ts
│   │   │   ├── prompts/
│   │   │   │   ├── trustee-system.ts
│   │   │   │   ├── thinking-system.ts
│   │   │   │   ├── content-system.ts
│   │   │   │   ├── cro-system.ts
│   │   │   │   └── intent-classifier-system.ts
│   │   │   ├── rag/
│   │   │   │   ├── embedder.ts
│   │   │   │   └── retriever.ts
│   │   │   ├── memory/
│   │   │   │   └── interaction-logger.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── package.json
│   │
│   └── db/                            ← Drizzle schema + migrations
│       ├── src/
│       │   ├── schema/
│       │   │   ├── ai-tables.ts       ← new AI-specific tables only
│       │   │   └── index.ts
│       │   ├── migrations/
│       │   └── client.ts
│       └── package.json
│
└── services/
    ├── scoring-service/               ← Python FastAPI
    │   ├── main.py
    │   ├── requirements.txt
    │   └── models/                    ← .pkl files go here (gitignored)
    └── signal-ingester/               ← cron jobs for external data
        ├── panchang.ts
        ├── weather.ts
        └── index.ts
```

---

## ENVIRONMENT VARIABLES

Create `.env.example` at the root with these exact keys.
Never hardcode any of these values in source files.

```bash
# Anthropic
ANTHROPIC_API_KEY=

# OpenAI (embeddings only)
OPENAI_API_KEY=

# Dharma Stack MySQL (read-only connection for now)
DHARMA_DB_HOST=
DHARMA_DB_PORT=3306
DHARMA_DB_NAME=
DHARMA_DB_USER=
DHARMA_DB_PASSWORD=

# TTAI MySQL (for new AI tables)
TTAI_DB_HOST=
TTAI_DB_PORT=3306
TTAI_DB_NAME=ttai
TTAI_DB_USER=
TTAI_DB_PASSWORD=

# Redis
REDIS_URL=redis://localhost:6379

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_TTAI=ttai-knowledge

# Langfuse (LLM observability)
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=http://localhost:3001

# JWT
JWT_SECRET=
JWT_EXPIRY=7d

# Scoring microservice
SCORING_SERVICE_URL=http://localhost:8001

# External APIs
OPENWEATHER_API_KEY=
DRIK_PANCHANG_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## CORE TYPE DEFINITIONS

Before writing any engine or tool code, create
`packages/ai-core/src/types/index.ts` with exactly these types.
Every file in the project imports types from here.

```typescript
// ─── Temple Context ───────────────────────────────────────────────────────────
export interface TempleContext {
  templeId: string;
  templeName: string;
  deity: string;
  city: string;
  state: string;
  timezone: string;         // e.g. "Asia/Kolkata"
  languages: string[];      // e.g. ["Marathi", "Hindi", "English"]
  activeFeatures: FeatureFlag[];
  dataHealthScore: number;  // 0–100
}

// ─── User / Role ──────────────────────────────────────────────────────────────
export type UserRole =
  | 'trustee_head'
  | 'temple_admin'
  | 'finance_manager'
  | 'communications_lead'
  | 'operations_staff';

export interface AuthUser {
  userId: string;
  templeId: string;
  role: UserRole;
  name: string;
}

// ─── Engine Types ─────────────────────────────────────────────────────────────
export type EngineType = 'trustee' | 'thinking' | 'content' | 'cro';

export interface RouterOutput {
  engine: EngineType;
  useCaseId: string;        // e.g. "TA-01", "TH-02", "CRO-03"
  requiresApproval: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
  toolsNeeded: string[];
  reasoning: string;
}

// ─── Tool Response ────────────────────────────────────────────────────────────
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  dataConfidence: DataConfidence;
  source: string;           // which DB table / API was queried
  queriedAt: string;        // ISO timestamp
}

export interface DataConfidence {
  level: 'HIGH' | 'PARTIAL' | 'LOW' | 'NONE';
  monthsOfData: number;
  completenessScore: number; // 0–1
  message: string;
}

// ─── AI Interaction ───────────────────────────────────────────────────────────
export interface AIInteraction {
  id: string;
  templeId: string;
  userId: string;
  engine: EngineType;
  userMessage: string;
  assistantResponse: string;
  toolCallsJson: string;
  approvalStatus: 'not_required' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// ─── Approval ─────────────────────────────────────────────────────────────────
export type ApprovalActionType =
  | 'content_publish'
  | 'campaign_launch'
  | 'package_create'
  | 'outreach_send'
  | 'slot_expansion'
  | 'purchase_order';

export interface ApprovalRequest {
  id: string;
  interactionId: string;
  actionType: ApprovalActionType;
  payload: Record<string, unknown>;
  explanation: string;
  requestedBy: string;
  templeId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// ─── Feature Flags ────────────────────────────────────────────────────────────
export type FeatureFlag =
  | 'daily_briefing'
  | 'donor_intelligence'
  | 'audit_summary'
  | 'festival_readiness'
  | 'spiritual_graph'
  | 'reactivation_journeys'
  | 'content_engine'
  | 'cro_engine'
  | 'predictive_footfall'
  | 'live_war_room';

// ─── Proactive Alert ──────────────────────────────────────────────────────────
export interface ProactiveAlert {
  id: string;
  templeId: string;
  triggerName: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL' | 'OPPORTUNITY';
  title: string;
  body: string;
  recommendedAction: string;
  requiresApproval: boolean;
  actionType?: ApprovalActionType;
  payload?: Record<string, unknown>;
  createdAt: Date;
  expiresAt: Date;
}
```

---

## DATABASE SCHEMA — NEW AI TABLES ONLY

Create `packages/db/src/schema/ai-tables.ts`.
These tables extend the existing Dharma Stack MySQL database.
Do NOT modify existing Dharma Stack tables. Only add new ones.

```typescript
import { mysqlTable, varchar, text, json, timestamp,
         decimal, tinyint, boolean, mysqlEnum, int, float } from 'drizzle-orm/mysql-core';

export const aiInteractions = mysqlTable('ai_interactions', {
  id:             varchar('id', { length: 36 }).primaryKey(),
  templeId:       varchar('temple_id', { length: 36 }).notNull(),
  userId:         varchar('user_id', { length: 36 }).notNull(),
  engine:         mysqlEnum('engine', ['trustee','thinking','content','cro']).notNull(),
  userMessage:    text('user_message').notNull(),
  assistantResponse: text('assistant_response'),
  toolCallsJson:  json('tool_calls_json'),
  approvalStatus: mysqlEnum('approval_status',
                    ['not_required','pending','approved','rejected'])
                    .default('not_required'),
  createdAt:      timestamp('created_at').defaultNow(),
});

export const aiApprovals = mysqlTable('ai_approvals', {
  id:             varchar('id', { length: 36 }).primaryKey(),
  interactionId:  varchar('interaction_id', { length: 36 }),
  templeId:       varchar('temple_id', { length: 36 }).notNull(),
  actionType:     varchar('action_type', { length: 50 }).notNull(),
  payload:        json('payload'),
  explanation:    text('explanation'),
  requestedBy:    varchar('requested_by', { length: 36 }),
  approvedBy:     varchar('approved_by', { length: 36 }),
  approvedAt:     timestamp('approved_at'),
  status:         mysqlEnum('status', ['pending','approved','rejected']).default('pending'),
  createdAt:      timestamp('created_at').defaultNow(),
});

export const recommendationOutcomes = mysqlTable('recommendation_outcomes', {
  id:                varchar('id', { length: 36 }).primaryKey(),
  recommendationId:  varchar('recommendation_id', { length: 36 }),
  templeId:          varchar('temple_id', { length: 36 }),
  engine:            varchar('engine', { length: 50 }),
  useCaseId:         varchar('use_case_id', { length: 20 }),
  wasAccepted:       boolean('was_accepted'),
  wasActioned:       boolean('was_actioned'),
  outcomeValue:      decimal('outcome_value', { precision: 10, scale: 2 }),
  feedbackAt:        timestamp('feedback_at'),
});

export const devoteeSegments = mysqlTable('devotee_segments', {
  id:             varchar('id', { length: 36 }).primaryKey(),
  udiId:          varchar('udi_id', { length: 36 }).notNull(),
  templeId:       varchar('temple_id', { length: 36 }).notNull(),
  segmentLabel:   varchar('segment_label', { length: 100 }),
  segmentScore:   float('segment_score'),
  ltvEstimate:    decimal('ltv_estimate', { precision: 10, scale: 2 }),
  churnRisk:      float('churn_risk'),
  lastComputed:   timestamp('last_computed'),
});

export const knowledgeDocuments = mysqlTable('knowledge_documents', {
  id:           varchar('id', { length: 36 }).primaryKey(),
  templeId:     varchar('temple_id', { length: 36 }).notNull(),
  docType:      varchar('doc_type', { length: 50 }),
  title:        varchar('title', { length: 255 }),
  contentHash:  varchar('content_hash', { length: 64 }),
  embeddingRef: varchar('embedding_ref', { length: 255 }),
  createdAt:    timestamp('created_at').defaultNow(),
});

export const proactiveAlerts = mysqlTable('proactive_alerts', {
  id:                varchar('id', { length: 36 }).primaryKey(),
  templeId:          varchar('temple_id', { length: 36 }).notNull(),
  triggerName:       varchar('trigger_name', { length: 100 }),
  level:             mysqlEnum('level', ['INFO','WARNING','CRITICAL','OPPORTUNITY']),
  title:             varchar('title', { length: 255 }),
  body:              text('body'),
  recommendedAction: text('recommended_action'),
  requiresApproval:  boolean('requires_approval').default(false),
  actionType:        varchar('action_type', { length: 50 }),
  payload:           json('payload'),
  dismissed:         boolean('dismissed').default(false),
  createdAt:         timestamp('created_at').defaultNow(),
  expiresAt:         timestamp('expires_at'),
});

export const dataHealthScores = mysqlTable('data_health_scores', {
  id:        varchar('id', { length: 36 }).primaryKey(),
  templeId:  varchar('temple_id', { length: 36 }).notNull(),
  score:     tinyint('score'),
  breakdown: json('breakdown'),
  scoredAt:  timestamp('scored_at').defaultNow(),
});
```

---

## THE INTENT ROUTER — BUILD THIS FIRST

`packages/ai-core/src/router/intent-classifier.ts`

This is the entry point for every user message. Build it before any engine.

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { RouterOutput, AuthUser, TempleContext } from '../types';

const client = new Anthropic();

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
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: INTENT_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Temple: ${temple.templeName} | User role: ${user.role} | Message: "${message}"`
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

  try {
    return JSON.parse(text) as RouterOutput;
  } catch {
    // Fallback to trustee engine if classification fails
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
```

**Done when:**
- `classifyIntent("Give me today's briefing", ...)` returns engine: "trustee", useCaseId: "TA-01"
- `classifyIntent("Draft a Shravan WhatsApp message", ...)` returns engine: "content", requiresApproval: true
- `classifyIntent("Which devotees are lapsed?", ...)` returns engine: "trustee", useCaseId: "TA-02"
- Unit tests pass for all 24 use case IDs

---

## THE APPROVAL GATEWAY — BUILD THIS SECOND

`packages/ai-core/src/router/approval-gateway.ts`

Every AI response passes through this before reaching the user.

```typescript
import { RouterOutput, ApprovalRequest, AuthUser } from '../types';
import { db } from '@ttai/db';
import { aiApprovals } from '@ttai/db/schema';
import { randomUUID } from 'crypto';

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

  await db.insert(aiApprovals).values({
    id:            approvalId,
    interactionId,
    templeId:      user.templeId,
    actionType,
    payload,
    explanation:   reasoning,
    requestedBy:   user.userId,
    status:        'pending',
  });

  return {
    status:     'queued',
    approvalId,
    message:    `This ${actionType.replace('_', ' ')} has been sent to your approval inbox. ` +
                `It will not be actioned until you approve it. ` +
                `Here is a preview of what was prepared:\n\n${engineOutput}`
  };
}
```

**Done when:**
- Content engine output with sensitivityLevel "high" always creates an approval row
- CRO engine output with sensitivityLevel "high" always creates an approval row
- Trustee and Thinking engine outputs with sensitivityLevel "low"/"medium" always pass through
- Approval rows are visible in the approvals table

---

## PHASE 0 — COMPLETE BEFORE ANY ENGINE WORK

**Goal:** Prove connectivity. Prove the stack works end to end.
**Time:** 3–5 days. Do not move to Phase 1 until all items below pass.

### Task 0.1 — docker-compose.yml

Create `docker-compose.yml` at root. It must start:
- MySQL 8 (port 3307 — avoid conflict with local MySQL)
- Redis 7 (port 6379)
- Qdrant latest (port 6333)
- Langfuse (port 3001) — use the official langfuse/langfuse image

```yaml
# Create this file. All services must start with: docker-compose up -d
# Verify with: docker-compose ps — all four services show "Up"
```

### Task 0.2 — Database Connection Test

In `packages/db/src/client.ts`, create a Drizzle MySQL client.
Run all migrations from `ai-tables.ts`.
Verify all 7 new tables exist in the ttai database.

```bash
# Command to verify:
pnpm db:migrate
pnpm db:studio  # Drizzle Studio should show all 7 tables
```

### Task 0.3 — Anthropic API Test

Create `packages/ai-core/src/tests/api-check.ts`.
Call `claude-haiku-4-5-20251001` with the message "Say: TTAI API connection confirmed."
Log the response. Must receive that exact string back.

```bash
pnpm test:api-check
# Expected output: "TTAI API connection confirmed"
```

### Task 0.4 — Qdrant Connection Test

Create `packages/ai-core/src/tests/qdrant-check.ts`.
Connect to Qdrant. Create collection "ttai-knowledge" with vector size 1536.
Insert one test document. Query it back. Delete the test document.

```bash
pnpm test:qdrant-check
# Expected output: "Qdrant collection ready. Insert/query/delete: OK"
```

### Task 0.5 — Intent Router Test

Run the intent classifier against these 5 test inputs.
All 5 must route correctly.

```typescript
const tests = [
  { input: "Give me today's briefing",        expect: { engine: 'trustee',  useCaseId: 'TA-01' } },
  { input: "Who are our lapsed donors?",      expect: { engine: 'trustee',  useCaseId: 'TA-02' } },
  { input: "Draft a Navratri WhatsApp blast", expect: { engine: 'content',  requiresApproval: true } },
  { input: "Which devotees will book next?",  expect: { engine: 'thinking', useCaseId: 'TH-01' } },
  { input: "Recover abandoned bookings",      expect: { engine: 'cro',      useCaseId: 'CRO-04' } },
];
```

```bash
pnpm test:router
# Expected: 5/5 pass
```

### Task 0.6 — Next.js App Boots

```bash
cd apps/ttai-web && pnpm dev
# localhost:3000 must load without errors
# /api/health must return { status: "ok", timestamp: "..." }
```

**Phase 0 is complete when all 6 tasks above pass. Do not start Phase 1 until they do.**

---

## PHASE 1 — TRUSTEE ENGINE MVP

**Goal:** A trustee can ask 6 types of operational questions and get accurate,
sourced answers drawn from real Dharma Stack data.

**Time:** 3 weeks  
**Use cases to ship:** TA-01, TA-02, TA-03, TA-04, TA-05, TA-06

### Phase 1 Rules

- All tool functions must query MySQL directly using Drizzle
- Every tool result must include a `dataConfidence` object
- If a query returns zero rows, the tool must explain why, not return empty
- The chat API route must stream responses using Vercel AI SDK `streamText`
- Every completed interaction must be logged to `ai_interactions`
- Role-based filtering must be applied at the tool level, not the prompt level

### Task 1.1 — Build the Trustee System Prompt

Create `packages/ai-core/src/prompts/trustee-system.ts`

```typescript
export function buildTrusteeSystemPrompt(temple: TempleContext, user: AuthUser): string {
  return `
You are the Temple Trustee AI Assistant for ${temple.templeName}, a Hindu temple
in ${temple.city}, ${temple.state}, dedicated to ${temple.deity}.

You are speaking with ${user.name}, who has the role: ${user.role}.

YOUR CAPABILITIES:
You have access to tools that query live temple data across:
donations, puja bookings, devotee records, priest schedules,
inventory, compliance filings, festival planning, complaints, and finances.

RESPONSE RULES:
1. Always call the relevant tool before answering. Never answer from memory alone.
2. After receiving tool data, give a clear, structured answer.
3. Always show the data confidence level at the end of your response:
   → "Based on [N] months of complete data" or "Note: only [N] weeks of data available"
4. Always suggest one follow-up action where relevant.
5. If data is missing, say so clearly and show the path to fill the gap.
6. Never invent numbers. If unsure, say uncertain.

ROLE RESTRICTIONS for ${user.role}:
${getRoleRestrictions(user.role)}

NON-NEGOTIABLE:
You may not suggest changes to rituals, puja procedures, or sacred processes.
You may not approve any financial entries or accounting decisions.
You may not send any communication to devotees — only drafts and suggestions.
Today's date and time: ${new Date().toLocaleString('en-IN', { timeZone: temple.timezone })}
`.trim();
}

function getRoleRestrictions(role: string): string {
  const restrictions: Record<string, string> = {
    trustee_head:        'Full access to all data and all recommendations.',
    temple_admin:        'Full operational access. No individual donor PII. No financial ledger details.',
    finance_manager:     'Finance and audit data only. No donor contact details. No campaign tools.',
    communications_lead: 'Campaign performance data only. No donor or financial data.',
    operations_staff:    'Operational briefing and complaint data only. No financial or donor data.',
  };
  return restrictions[role] ?? 'Standard access.';
}
```

### Task 1.2 — Build All Six Trustee Tools

For each tool, create a file under `packages/ai-core/src/tools/dharma-stack/`.

Each tool must follow this exact signature pattern:

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { ToolResult } from '../../types';

export const getDailyBriefing = tool({
  description: 'Fetch today\'s bookings count, donation inflow, VIP visits expected, ' +
               'open issues count, and stock alerts for a temple',
  parameters: z.object({
    templeId: z.string(),
    date:     z.string().describe('ISO date string, e.g. 2025-10-04'),
  }),
  execute: async ({ templeId, date }): Promise<ToolResult> => {
    try {
      // Query Dharma Stack tables:
      // - vedicvidhi.bookings for today's booking count
      // - dharmapay.transactions for today's donation total
      // - ttai.proactive_alerts for open alerts
      // - inventory_stock for items below critical_level

      // Replace with actual Drizzle queries against your Dharma Stack schema:
      const bookings  = await queryTodayBookings(templeId, date);
      const donations = await queryTodayDonations(templeId, date);
      const alerts    = await queryOpenAlerts(templeId);
      const stockLow  = await queryLowStockItems(templeId);

      return {
        success: true,
        data: { bookings, donations, alerts, stockLow },
        dataConfidence: await computeConfidence(templeId, 'finance'),
        source: 'vedicvidhi.bookings + dharmapay.transactions + ttai.proactive_alerts',
        queriedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
        dataConfidence: { level: 'NONE', monthsOfData: 0, completenessScore: 0,
                          message: 'Query failed' },
        source: 'dharma-stack',
        queriedAt: new Date().toISOString(),
      };
    }
  }
});
```

Build all six tools in this order:
1. `getDailyBriefing`       → TA-01
2. `getDonorIntelligence`   → TA-02
3. `getAuditSummary`        → TA-03
4. `getMeetingBrief`        → TA-04
5. `getComplaintDiagnosis`  → TA-05
6. `getFestivalReadiness`   → TA-06

### Task 1.3 — Wire the Chat API Route

Create `apps/ttai-web/app/api/chat/route.ts`

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { classifyIntent } from '@ttai/ai-core/router/intent-classifier';
import { runTrusteeEngine } from '@ttai/ai-core/engines/trustee';
import { buildTrusteeSystemPrompt } from '@ttai/ai-core/prompts/trustee-system';
import { logInteraction } from '@ttai/ai-core/memory/interaction-logger';
import { getUserFromRequest, getTempleContext } from '../../lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const user   = await getUserFromRequest(req);
  const temple = await getTempleContext(user.templeId);

  const lastMessage = messages[messages.length - 1].content;
  const route = await classifyIntent(lastMessage, user, temple);

  // Phase 1: only trustee engine is built
  const systemPrompt = buildTrusteeSystemPrompt(temple, user);
  const tools = getTrusteeTools(user, temple);

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: systemPrompt,
    messages,
    tools,
    maxSteps: 5,
    onFinish: async ({ text, toolCalls }) => {
      await logInteraction({
        templeId: temple.templeId,
        userId:   user.userId,
        engine:   route.engine,
        userMessage:        lastMessage,
        assistantResponse:  text,
        toolCallsJson:      JSON.stringify(toolCalls),
        approvalStatus:     'not_required',
      });
    }
  });

  return result.toDataStreamResponse();
}
```

### Task 1.4 — Build the Chat UI

Create `apps/ttai-web/app/(dashboard)/chat/page.tsx`

Use `useChat` from `ai/react`. Requirements:
- Streaming responses render word by word
- Tool call progress shows: "Checking donation records..." while tool executes
- Confidence tag renders below each AI response
- Input disabled while streaming
- Mobile responsive — works on a phone browser

### Task 1.5 — Build the Morning Brief

Create `apps/ttai-web/app/(dashboard)/page.tsx`

On page load, auto-call `/api/chat` with the message:
`"Generate my morning briefing for today including bookings, donations, open issues, and stock alerts"`

Render the result in a structured card layout, not as a chat bubble.

**Phase 1 done when:**
- [ ] All 6 Trustee Engine tools return data from real Dharma Stack tables
- [ ] Chat interface streams responses correctly
- [ ] Morning brief auto-generates on login
- [ ] All interactions are logged to `ai_interactions`
- [ ] Role restrictions filter data correctly (test with finance_manager — donor PII must not appear)
- [ ] Data confidence level shown on every response
- [ ] `pnpm test` passes all Phase 1 unit tests

---

## PHASE 2 — THINKING ENGINE + CONTENT ENGINE

**Start only after Phase 1 done criteria are fully met.**

### Thinking Engine Additional Setup Required Before Building

Before building TH-01 through TH-06, the Spiritual Graph pipeline must exist.

Create `services/spiritual-graph/` with:
- A daily cron job that runs feature extraction for all active temples
- K-means clustering on devotee feature vectors (use Python + scikit-learn)
- LLM-based cluster labelling (call Claude Haiku with centroid features)
- Write results to `devotee_segments` table

**The Thinking Engine cannot give useful recommendations until at least 1 cluster
run has completed for the pilot temple. Do not demo TH-01 without real clusters.**

### Content Engine Constraint — Enforce in Code

Every content engine tool call must append this to the generated output:

```
---
⚠ APPROVAL REQUIRED: This content has been saved to your approval inbox.
It will not be sent to any devotee until you explicitly approve it.
Approval ID: [id]
```

This is not optional. It is a non-negotiable product guardrail. Implement it in the
approval gateway, not in the prompt.

**Phase 2 done when:**
- [ ] Spiritual Graph pipeline runs successfully on pilot temple data
- [ ] TH-01 and TH-02 return segment-specific recommendations with reasoning
- [ ] CA-01 generates a complete festival campaign kit (3 channels, 2 languages)
- [ ] CA-01 output always creates an approval record before returning
- [ ] Approval inbox page lists pending approvals with approve/reject buttons
- [ ] Approving a content item marks it as approved in the database

---

## PHASE 3 — CRO ENGINE

**Start only after Phase 2 done criteria are fully met.**

### CRO Engine Additional Setup Required

The scoring service must be running before CRO tools are built.

Create `services/scoring-service/main.py`:
- FastAPI app on port 8001
- `POST /score/addon` — returns ranked add-ons for a booking type
- `POST /score/conversion` — returns conversion probability for a devotee + offering
- For Phase 3 launch, use a rule-based model (not ML yet) — ML retraining comes in Phase 4

**Phase 3 done when:**
- [ ] Scoring service runs and returns ranked add-ons for a test booking
- [ ] CRO-01 surfaces max 3 add-on suggestions during a booking flow
- [ ] CRO-02 generates a post-booking donation ask with correct framing
- [ ] CRO-04 identifies abandoned bookings from last 48 hours
- [ ] Frequency cap enforced: same devotee cannot receive more than 2 CRO prompts in 7 days

---

## CODING STANDARDS — APPLY THROUGHOUT

**TypeScript:**
- Strict mode always: `"strict": true` in tsconfig
- No `any` types. Use `unknown` and narrow.
- All async functions return typed promises
- All errors are caught and returned as `ToolResult` with `success: false`

**AI Prompts:**
- System prompts live only in `packages/ai-core/src/prompts/`
- Never write prompt strings inline in route handlers
- Every prompt file exports a builder function, not a raw string
- All prompts must include the current date/time from the temple's timezone

**Tools:**
- Every tool has a `description` that is specific enough for the router to select it
- Every tool returns `ToolResult<T>` — never returns raw data
- Every tool includes `dataConfidence` — never omit this field
- Tools never read from more than 3 tables in a single call — decompose if needed

**Database:**
- All Dharma Stack reads use read-only credentials
- All TTAI table writes use a separate connection with write permissions
- Use Drizzle query builder — no raw SQL strings
- All queries include a `templeId` filter on every table — never query cross-temple data

**Security:**
- Every API route validates JWT before processing
- Role is checked before any tool runs — not inside the prompt
- Finance and donor PII fields are filtered at the query level by role
- No temple data is ever included in a response to a different temple's session

**Logging:**
- Every AI interaction logged to `ai_interactions`
- Every tool call logged with duration and success/failure
- Every approval action (create/approve/reject) logged with user and timestamp
- Langfuse trace created for every LLM call — use the Langfuse SDK

---

## WHAT TO BUILD WHEN YOU ARE STUCK

If a query against the Dharma Stack tables returns no data because the
pilot temple's data has not been migrated yet, do not block — return
a realistic mock from a `__mocks__/dharma-stack.ts` file and label
the response with: `[DEMO DATA — replace with live Dharma Stack connection]`

If a feature depends on a model that does not exist yet (e.g. scoring model
in Phase 3), implement a rule-based placeholder that returns plausible output.
Label it: `[RULE-BASED PLACEHOLDER — ML model to be trained in Phase 4]`

Never block progress on perfect data. Build the interface, build the tool,
build the prompt — and plug in real data when it arrives.

---

## DEFINITION OF DONE — PER PHASE

A phase is done when ALL of the following are true:

```
□ All use cases for that phase answer correctly for at least 5 test queries
□ All interactions are logged with no missing fields
□ Role-based access is verified — finance_manager cannot see donor PII
□ Data confidence level appears on every response
□ No TypeScript errors in strict mode
□ pnpm test passes with no failures
□ docker-compose up starts all services cleanly from a fresh clone
□ A real trustee (or 3ionetra team member acting as trustee) has used the
  feature for 1 full working day and given a thumbs up
```

The last criterion is not optional. Ship to a real person before declaring done.

---

## QUICK REFERENCE — KEY COMMANDS

```bash
# Setup
pnpm install
docker-compose up -d
pnpm db:migrate

# Development
pnpm dev                    # starts all apps in watch mode
pnpm dev --filter=ttai-web  # starts only the web app

# Testing
pnpm test                   # run all unit tests
pnpm test:api-check         # verify Anthropic API connection
pnpm test:router            # verify intent classifier
pnpm test:qdrant-check      # verify vector DB connection
pnpm playwright test        # run E2E tests

# Database
pnpm db:migrate             # run pending migrations
pnpm db:studio              # open Drizzle Studio
pnpm db:generate            # generate migration from schema change

# Type checking
pnpm typecheck              # tsc --noEmit across all packages
```

---

## REFERENCE DOCUMENTS

These documents contain the full product thinking behind every decision in this file.
Read them to understand WHY before changing anything.

```
docs/01-build-guide.md           ← Full system architecture, all 4 engines,
                                    learning loop, monetization, 21-day pilot plan,
                                    temple onboarding and data migration

docs/02-knowledge-universe.md    ← All 12 data domains, complete schema,
                                    200+ query types, cross-domain insight engine

docs/03-predictive-intelligence.md ← Predictive models, live festival war room,
                                      proactive recommendation trigger library
```

If this CLAUDE.md conflicts with those documents, this CLAUDE.md wins.
Those documents are product thinking. This file is build instructions.

---

*CLAUDE.md version 1.0 — 3ionetra Faith and Technology Services Pvt. Ltd.*
*Update this file at the start of every new phase. Keep it current.*
