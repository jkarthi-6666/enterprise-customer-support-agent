/**
 * Platform Engineering Contract (ADRs 0034–0036)
 */

export interface HealthSnapshot {
  ready: boolean;
  live: boolean;
  dependencies: Record<string, 'up' | 'degraded' | 'down'>;
}

export interface IPlatformRuntime {
  getHealth(): Promise<HealthSnapshot>;
  snapshotStateStore(reason: string): Promise<{ snapshotId: string; location: string }>;
  restoreStateStore(snapshotId: string): Promise<void>;
}
