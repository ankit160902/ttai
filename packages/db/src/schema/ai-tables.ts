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
