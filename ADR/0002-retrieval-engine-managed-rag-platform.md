# ADR 0002: Retrieval Architecture Selection — Managed RAG Platform

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Knowledge Module (Retrieval Engine)
- **Relates To**: [ADR 0001](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0001-knowledge-source-authority-bayesian-conflict-resolution.md) (Probabilistic Source Authority & Conflict Resolution)

---

## 1. Context & Problem Statement

The Enterprise AI Customer Support Agent requires an indexing and retrieval pipeline capable of searching over multi-system enterprise knowledge (Documentation, Confluence, Resolved Tickets). 

The primary architectural fork for Retrieval was:
1. **Self-Built Hybrid Retrieval**: Operating dedicated Vector DBs (Qdrant/Milvus), Lexical Search (OpenSearch/Elasticsearch), Reciprocal Rank Fusion (RRF), and custom cross-encoder rerankers within customer VPC.
2. **Managed RAG Platform**: Utilizing fully managed enterprise RAG services (e.g. AWS Bedrock Knowledge Bases, GCP Vertex AI Search, Pinecone Assistant, or Glean).

We must select the retrieval architecture, evaluate the operational trade-offs, and ground the decision in our system loss minimization and trade-off framework.

---

## 2. Theoretical Formulation & Trade-off Analysis

Using our Expected System Loss framework ($\mathbb{E}[L] = C_{\text{ops}} + C_{\text{compliance}} + C_{\text{latency}}$):

### A. Operational Overhead & Maintenance Risk ($C_{\text{ops}}$)
- **Self-Built Engine**: Requires managing distributed vector indices, shard rebalancing, lexical index tuning, hybrid fusion weights ($\alpha, \beta, \gamma$), and cross-encoder model deployment infrastructure. $C_{\text{ops}}$ is extremely high.
- **Managed RAG Platform**: Outsources index infrastructure, auto-scaling, chunking, and baseline vector/hybrid retrieval to cloud providers. $C_{\text{ops}} \to 0$.

### B. Expected Noise & Variance Reduction ($\sigma^2$)
- Managed RAG platforms provide pre-tuned hybrid search algorithms combining vector embedding search and keyword matching. This satisfies the core constraint identified in our literature review: pure vector search misses exact-match terms (SKUs, error codes, account IDs).
- Built-in Native Reranking: In accordance with our confirmed rule in `checkpoint.md`, selecting a Managed RAG Platform binds our reranking pipeline to the platform's **native/built-in reranker**, eliminating the latency penalty ($C_{\text{latency}}$) of a secondary network hop to a self-hosted cross-encoder.

### C. Data Residency & VPC Compliance Mitigation ($C_{\text{compliance}}$)
- **Risk Identified**: Support tickets contain customer PII. Using a Managed RAG platform implies sending ticket corpora to managed services.
- **Mitigation Architecture**: Enterprise Managed RAG platforms (AWS Bedrock KB / GCP Vertex AI Search / Azure AI Search) operate under enterprise VPC service controls (HIPAA, ISO 27001, SOC2, PCI-DSS compliance) with zero data retention for model training. PII redaction filters will be enforced at the ingestion boundary before payload transmission.

---

## 3. Decision

We choose **Option B: Managed RAG Platform** as the foundation for the Enterprise Support Agent's Retrieval Engine.

### Concrete Implementation Rules:
1. **Engine**: Leverage Enterprise Managed RAG Platform APIs for automated indexing and candidate retrieval.
2. **Reranking**: Use the platform's **native built-in reranker** (per confirmed conditional rule in `checkpoint.md`).
3. **Integration with ADR 0001 (Bayesian Source Reliability)**:
   - Metadata tags (`source_tier`, `source_reliability_score`) will be indexed alongside all document chunks in the managed platform.
   - Post-retrieval filtering and context selection will apply the Bayesian Source Reliability priors $R(S_i)$ and Information Gain rules defined in ADR 0001.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- **Rapid Time-to-Market**: Eliminates months of vector/hybrid infrastructure engineering.
- **Zero Ops Burden**: Maintenance, index scaling, and hybrid tuning managed by the cloud platform.
- **Native Reranking Integration**: Lowers query latency by utilizing built-in reranking models without extra network hops.

### Negative / Neutral Trade-offs
- **Vendor Lock-in**: Abstraction layer (e.g. unified `ManagedKnowledgeClient` interface) must be maintained to prevent tight coupling to a single cloud provider.
- **Ingestion Boundary PII Filtering**: Requires pre-processing pipelines to strip/anonymize PII before payload reaches the managed index.

---

## 5. References
- ADR 0001: *Probabilistic Knowledge Source Authority & Information-Theoretic Conflict Resolution*
- Enterprise Checkpoint Log (`checkpoint.md`)
