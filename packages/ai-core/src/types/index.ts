// --- Temple Context ---
export interface TempleContext {
  templeId: string;
  templeName: string;
  deity: string;
  city: string;
  state: string;
  timezone: string;         // e.g. "Asia/Kolkata"
  languages: string[];      // e.g. ["Marathi", "Hindi", "English"]
  activeFeatures: FeatureFlag[];
  dataHealthScore: number;  // 0-100
}

// --- User / Role ---
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

// --- Engine Types ---
export type EngineType = 'trustee' | 'thinking' | 'content' | 'cro';

export interface RouterOutput {
  engine: EngineType;
  useCaseId: string;        // e.g. "TA-01", "TH-02", "CRO-03"
  requiresApproval: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
  toolsNeeded: string[];
  reasoning: string;
}

// --- Tool Response ---
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
  completenessScore: number; // 0-1
  message: string;
}

// --- AI Interaction ---
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

// --- Approval ---
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

// --- Feature Flags ---
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

// --- Proactive Alert ---
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
