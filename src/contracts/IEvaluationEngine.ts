import { EvaluationSample, PromotionGateResult } from '../types/domain';

/**
 * Evaluation & Improvement Contract (ADRs 0031–0033)
 */

export interface ShadowExperimentSpec {
  experimentId: string;
  controlVariant: string;
  candidateVariant: string;
  primaryMetric: string;
  minSamples: number;
  maxLatencyRegression: number;
  maxCostRegression: number;
}

export interface IEvaluationEngine {
  recordShadowSample(sample: EvaluationSample): Promise<void>;
  scoreTrajectory(trajectoryId: string, variant: 'control' | 'candidate'): Promise<Record<string, number>>;
  evaluatePromotionGate(spec: ShadowExperimentSpec): Promise<PromotionGateResult>;
  runRegressionSuite(suiteId: string): Promise<{ passed: boolean; failedCases: string[] }>;
}
