import { CoordinationConflict, DelegationTask, SpecialistResult } from '../types/domain';

/**
 * Agent Coordination Contract (ADRs 0028–0030)
 */

export interface IAgentCoordinator {
  route(capability: string, payload: Record<string, unknown>, parentPlanId: string): Promise<DelegationTask>;
  collect(taskId: string): Promise<SpecialistResult>;
  arbitrate(conflict: CoordinationConflict): Promise<CoordinationConflict>;
}
