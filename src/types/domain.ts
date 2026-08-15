/**
 * Core Domain Entities for Enterprise AI Customer Support Agent
 */

export type ChannelType = 'web_chat' | 'email' | 'sms' | 'voice' | 'slack';

export interface UserMessage {
  sessionId: string;
  userId: string;
  channel: ChannelType;
  rawText: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  sourceType: 'canonical_doc' | 'internal_wiki' | 'resolved_ticket' | 'community_chat';
  sourceReliability: number; // Bayesian prior R(S_i)
  freshnessScore: number;
  metadata: Record<string, unknown>;
}

export interface ContextSelectionResult {
  selectedChunks: KnowledgeChunk[];
  totalTokens: number;
  redundancyScore: number;
  strategyUsed: 'fixed_top_k' | 'token_budget_aware' | 'mmr_diversity';
}

export interface AgentIntent {
  primaryIntent: string;
  confidence: number;
  extractedEntities: Record<string, unknown>;
  requiresEscalation: boolean;
}

export interface PlanStep {
  stepId: string;
  actionType: 'retrieve_knowledge' | 'invoke_tool' | 'delegate_agent' | 'human_escalate' | 'respond';
  payload: Record<string, unknown>;
}

export interface AgentPlan {
  planId: string;
  intent: AgentIntent;
  steps: PlanStep[];
  isAuditable: boolean;
}

export interface ToolDefinition {
  toolName: string;
  description: string;
  inputSchema: Record<string, unknown>;
  requiredPermissions: string[];
  isSideEffecting: boolean;
}

export interface ToolResult {
  toolName: string;
  success: boolean;
  data: unknown;
  error?: string;
  executionTimeMs: number;
}

export interface ConflictEvent {
  eventId: string;
  canonicalDocId: string;
  conflictingDocId: string;
  semanticMismatch: string;
  confidenceDelta: number;
  timestamp: string;
}

export type PolicyEffect = 'allow' | 'deny' | 'escalate';

export type SafetyTaxonomy =
  | 'prompt_injection'
  | 'jailbreak'
  | 'pii_disclosure'
  | 'unauthorized_promise'
  | 'hate_or_abuse'
  | 'policy_violation'
  | 'data_exfiltration';

export interface PolicyDecision {
  decisionId: string;
  effect: PolicyEffect;
  policyIds: string[];
  violatedTaxonomy: SafetyTaxonomy[];
  reason: string;
  attributes: Record<string, unknown>;
  expectedLoss: number;
}

export interface ChannelEnvelope {
  envelopeId: string;
  sessionId: string;
  userId: string;
  channel: ChannelType;
  direction: 'inbound' | 'outbound';
  normalizedText: string;
  channelPayload: Record<string, unknown>;
  authContext: Record<string, unknown>;
  timestamp: string;
}

export interface DelegationTask {
  taskId: string;
  parentPlanId: string;
  specialistAgentId: string;
  capability: string;
  payload: Record<string, unknown>;
  timeoutMs: number;
}

export interface SpecialistResult {
  taskId: string;
  specialistAgentId: string;
  success: boolean;
  payload: Record<string, unknown>;
  confidence: number;
  reliabilityPrior: number;
}

export interface CoordinationConflict {
  conflictId: string;
  taskId: string;
  competingResults: SpecialistResult[];
  selectedResult?: SpecialistResult;
  resolution: 'prior_winner' | 'human_escalate' | 'rerun';
}

export type EvaluationVariant = 'control' | 'candidate';

export interface EvaluationSample {
  sampleId: string;
  trajectoryId: string;
  variant: EvaluationVariant;
  metrics: Record<string, number>;
}

export interface PromotionGateResult {
  experimentId: string;
  promoted: boolean;
  winningVariant: string;
  reasons: string[];
}
