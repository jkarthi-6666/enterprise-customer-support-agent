import { ToolDefinition, ToolResult } from '../types/domain';

/**
 * Action & Tools Module Contract
 */

export interface IToolRegistry {
  registerTool(tool: ToolDefinition): void;
  getTool(toolName: string): ToolDefinition | undefined;
  listTools(): ToolDefinition[];
}

export interface IToolExecutor {
  executeTool(toolName: string, parameters: Record<string, unknown>, callerContext: Record<string, unknown>): Promise<ToolResult>;
  validateSideEffect(toolName: string, result: ToolResult): Promise<boolean>;
}
