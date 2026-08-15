import { UserMessage, AgentIntent, AgentPlan, ToolResult } from '../types/domain';
import { KnowledgeChunk } from '../types/domain';

/**
 * Agent Runtime Engine Contract
 */

export interface IIntentClassifier {
  classifyIntent(message: UserMessage): Promise<AgentIntent>;
}

export interface IPlanner {
  generatePlan(intent: AgentIntent, retrievedContext: KnowledgeChunk[]): Promise<AgentPlan>;
}

export interface IAgentHarness {
  executePlan(sessionId: string, plan: AgentPlan): Promise<{ responseText: string; toolResults: ToolResult[] }>;
}

export interface IAgentRuntime {
  intentClassifier: IIntentClassifier;
  planner: IPlanner;
  harness: IAgentHarness;
  processRequest(message: UserMessage): Promise<string>;
}
