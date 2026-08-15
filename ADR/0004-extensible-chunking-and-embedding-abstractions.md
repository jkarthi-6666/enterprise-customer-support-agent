# ADR 0004: Extensible Strategy Abstractions for Chunking & Embedding Providers

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Knowledge Module (Ingestion & Representation)
- **Relates To**: [ADR 0002](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0002-retrieval-engine-managed-rag-platform.md)

---

## 1. Context & Problem Statement

Knowledge processing requires two core representation steps:
1. **Document Chunking**: Splitting raw documents $D$ into discrete text passages $\{c_1, c_2, \dots, c_k\}$.
2. **Vector Embedding Generation**: Mapping text passages into high-dimensional vector representations $e_i = E(c_i) \in \mathbb{R}^d$.

Hardcoding a single chunking strategy (e.g. fixed 500-token window) or tying vector embeddings directly to a single provider creates tight coupling. The architecture must:
- Follow clean software design principles (GoF Strategy Pattern & Dependency Inversion).
- Provide a simple baseline implementation out-of-the-box.
- Enable zero-code-change extensibility for advanced strategies (e.g., Section/Header-based, Parent-Child, In-VPC vs Managed embedding models).

---

## 2. Architecture & Design Pattern Specification

### A. Document Chunking Strategy Pattern (`IChunkingStrategy`)

We formulate Document Chunking as a parameterizable transformation function:

$$f_{\text{chunk}}: \mathcal{D} \to \{c_1, c_2, \dots, c_k\}$$

We enforce the **Strategy Pattern** via a clean interface abstraction:

```typescript
export interface ChunkingOptions {
  maxChunkSize: number;
  overlapSize: number;
  preserveHeaders?: boolean;
}

export interface Chunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface IChunkingStrategy {
  readonly strategyName: string;
  chunk(document: RawDocument, options?: ChunkingOptions): Promise<Chunk[]>;
}
```

#### Strategy Implementations:
1. **`FixedWindowChunkingStrategy` (Default Baseline)**:
   - Splits text into fixed 500-word windows with 50-word overlap.
   - *Rationale*: Simplest, reliable baseline with minimal processing overhead.
2. **`HeaderSectionChunkingStrategy` (Extensible Strategy)**:
   - Parses Markdown/HTML AST to split along H1/H2/H3 headers, attaching section breadcrumbs to chunk metadata.
3. **`HierarchicalParentChildStrategy` (Extensible Strategy)**:
   - Creates parent macro-chunks for summary retrieval and child micro-chunks for fine-grained similarity matching.

---

### B. Embedding Provider Abstraction (`IEmbeddingProvider`)

We formulate Vector Embedding as an abstract mapping $E: \mathcal{C} \to \mathbb{R}^d$:

```typescript
export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  modelName: string;
}

export interface IEmbeddingProvider {
  readonly providerName: string;
  generateEmbedding(text: string): Promise<EmbeddingResult>;
  generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
}
```

#### Provider Implementations:
1. **`ManagedPlatformEmbeddingProvider` (Default Baseline)**:
   - Delegates embedding generation directly to the Managed RAG Platform's native model (e.g. AWS Titan / GCP Vertex / OpenAI embeddings).
   - *Rationale*: Aligns with ADR 0002 to minimize infrastructure ops ($C_{\text{ops}} \to 0$).
2. **`InVpcLocalEmbeddingProvider` (Extensible Provider)**:
   - Connects to an in-VPC hosted model server (e.g. `bge-large-en-v1.5` or `nomic-embed-text` via ONNX/Triton) for strict data residency requirements.

---

## 3. Decision

1. **Software Pattern**: Mandate the `IChunkingStrategy` and `IEmbeddingProvider` abstractions for all Knowledge ingestion modules.
2. **Default Baseline Strategy**:
   - Chunking: `FixedWindowChunkingStrategy` (500 words, 50-word overlap).
   - Embedding: `ManagedPlatformEmbeddingProvider` (Native Managed RAG Platform model).
3. **Extensibility Gate**: Swapping strategies requires only updating a configuration parameter (`CHUNKING_STRATEGY=HeaderSection`, `EMBEDDING_PROVIDER=InVpcLocal`) without modifying ingestion or query service code.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- **Clean Architecture**: Decouples business logic from specific chunking heuristics and cloud vendor APIs.
- **Future-Proof Experimentation**: Enables shadow-mode A/B testing of chunking strategies without re-architecting the pipeline.

### Negative / Neutral Trade-offs
- Requires lightweight factory classes (`ChunkingStrategyFactory`, `EmbeddingProviderFactory`) to manage runtime instantiation.
