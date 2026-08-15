import { KnowledgeChunk, ContextSelectionResult, ConflictEvent } from '../types/domain';

/**
 * Knowledge Engine Contract (ADRs 0001 - 0005)
 */

export interface ChunkingOptions {
  maxChunkSize: number;
  overlapSize: number;
  preserveHeaders?: boolean;
}

export interface IChunkingStrategy {
  readonly strategyName: string;
  chunk(documentText: string, options?: ChunkingOptions): Promise<KnowledgeChunk[]>;
}

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  modelName: string;
}

export interface IEmbeddingProvider {
  readonly providerName: string;
  generateEmbedding(text: string): Promise<EmbeddingResult>;
}

export interface IKnowledgeEngine {
  /**
   * Nightly Differential Batch Ingestion (ADR 0003)
   */
  runNightlyBatchSync(): Promise<{ ingestedCount: number; evictedCount: number }>;

  /**
   * Candidate Retrieval over Managed RAG Platform (ADR 0002)
   */
  retrieveCandidates(query: string, topK?: number): Promise<KnowledgeChunk[]>;

  /**
   * Context Selection with Bayesian Source Reliability & MMR (ADR 0001 & ADR 0004)
   */
  selectContext(query: string, candidateChunks: KnowledgeChunk[]): Promise<ContextSelectionResult>;

  /**
   * Asynchronous Knowledge Conflict Logger (ADR 0001)
   */
  publishConflictEvent(event: ConflictEvent): Promise<void>;
}
