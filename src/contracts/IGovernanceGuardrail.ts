import { UserMessage } from '../types/domain';

/**
 * Governance & Safety Contract
 */

export interface GuardrailCheckResult {
  passed: boolean;
  violatedPolicies: string[];
  sanitizedContent: string;
}

export interface IGovernanceGuardrail {
  /**
   * PII Sanitization & Ingestion Boundary Filter (ADR 0002)
   */
  sanitizeIngestionPayload(rawPayload: string): Promise<string>;

  /**
   * Prompt Injection & Policy Verification
   */
  verifyInputMessage(message: UserMessage): Promise<GuardrailCheckResult>;

  /**
   * Output Safety & Compliance Verification
   */
  verifyOutputResponse(responseText: string): Promise<GuardrailCheckResult>;
}
