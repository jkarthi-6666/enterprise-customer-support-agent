import { UserMessage } from '../types/domain';
import { IKnowledgeEngine } from '../contracts/IKnowledgeEngine';
import { IMemoryStateStore } from '../contracts/IMemoryStateStore';
import { IAgentRuntime } from '../contracts/IAgentRuntime';
import { IToolRegistry, IToolExecutor } from '../contracts/IToolRegistry';
import { IGovernanceGuardrail } from '../contracts/IGovernanceGuardrail';

/**
 * Enterprise Agent Blueprint Orchestrator (Skeleton Architecture)
 * Demonstrates single-request trajectory execution flow across the 12 capabilities.
 */
export class AgentOrchestratorSkeleton {
  constructor(
    private readonly knowledgeEngine: IKnowledgeEngine,
    private readonly memoryStore: IMemoryStateStore,
    private readonly runtime: IAgentRuntime,
    private readonly toolRegistry: IToolRegistry,
    private readonly toolExecutor: IToolExecutor,
    private readonly guardrail: IGovernanceGuardrail
  ) {}

  /**
   * Primary Request Trajectory Handler
   */
  public async handleUserRequest(message: UserMessage): Promise<string> {
    // 1. Governance Input Safety Check
    const inputGuard = await this.guardrail.verifyInputMessage(message);
    if (!inputGuard.passed) {
      return `Request blocked by security policy: ${inputGuard.violatedPolicies.join(', ')}`;
    }

    // 2. Memory State Retrieval (ADR 0005)
    const conversationHistory = await this.memoryStore.getConversationHistory(message.sessionId);
    const userProfile = await this.memoryStore.getUserProfile(message.userId);

    // 3. Agent Runtime Intent Classification
    const intent = await this.runtime.intentClassifier.classifyIntent({
      ...message,
      rawText: inputGuard.sanitizedContent,
    });

    // 4. Knowledge Engine Retrieval & Bayesian Context Selection (ADR 0001 & ADR 0002)
    const candidateChunks = await this.knowledgeEngine.retrieveCandidates(intent.primaryIntent);
    const contextSelection = await this.knowledgeEngine.selectContext(intent.primaryIntent, candidateChunks);

    // 5. Agent Runtime Planning
    const plan = await this.runtime.planner.generatePlan(intent, contextSelection.selectedChunks);

    // 6. Plan Execution & Tool Calling Loop
    const executionResult = await this.runtime.harness.executePlan(message.sessionId, plan);

    // 7. Output Governance Verification
    const outputGuard = await this.guardrail.verifyOutputResponse(executionResult.responseText);
    const finalResponse = outputGuard.sanitizedContent;

    // 8. Update Memory & State (ADR 0005)
    await this.memoryStore.appendTurn(message.sessionId, {
      turnId: `turn-${Date.now()}`,
      role: 'user',
      content: message.rawText,
      timestamp: new Date().toISOString(),
    });
    await this.memoryStore.appendTurn(message.sessionId, {
      turnId: `turn-${Date.now() + 1}`,
      role: 'agent',
      content: finalResponse,
      timestamp: new Date().toISOString(),
    });

    return finalResponse;
  }
}
