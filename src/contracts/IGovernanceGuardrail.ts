import { PolicyDecision, UserMessage } from '../types/domain';

/**
 * Governance & Safety Contract (ADRs 0021–0024)
 */

export interface GuardrailCheckResult {
  passed: boolean;
  violatedPolicies: string[];
  sanitizedContent: string;
  decision?: PolicyDecision;
}

export interface PolicyEvaluationRequest {
  subject: Record<string, unknown>;
  resource: Record<string, unknown>;
  action: string;
  environment: Record<string, unknown>;
}

export interface IGovernanceGuardrail {
  /**
   * PII Sanitization & Ingestion Boundary Filter (ADR 0002, ADR 0022)
   */
  sanitizeIngestionPayload(rawPayload: string): Promise<string>;

  /**
   * Prompt Injection & Policy Verification (ADR 0021)
   */
  verifyInputMessage(message: UserMessage): Promise<GuardrailCheckResult>;

  /**
   * Output Safety & Compliance Verification (ADR 0021)
   */
  verifyOutputResponse(responseText: string): Promise<GuardrailCheckResult>;

  /**
   * Attribute-based policy decision (ADR 0023)
   */
  evaluatePolicy(request: PolicyEvaluationRequest): Promise<PolicyDecision>;
}
