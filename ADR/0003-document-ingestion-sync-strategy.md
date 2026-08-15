# ADR 0003: Document Ingestion & Temporal Sync Strategy — Scheduled Nightly Batch

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Knowledge Module (Ingestion & Sync Pipeline)
- **Relates To**: [ADR 0001](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0001-knowledge-source-authority-bayesian-conflict-resolution.md), [ADR 0002](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0002-retrieval-engine-managed-rag-platform.md)

---

## 1. Context & Problem Statement

Knowledge sources (Product Documentation, Confluence Wiki, Resolved Tickets) evolve over time. The agent requires an ingestion sync strategy to update the search index when documents are added, updated, or deleted.

We must decide between:
1. **Real-time Event-Driven Webhooks / CDC (Change Data Capture)**: Immediate ingestion upon document modification.
2. **Scheduled Nightly Batch Sync**: Deterministic, periodic re-indexing and differential update window ($T_{\text{sync}} = 24\text{ hours}$).
3. **Hybrid Sync**: Real-time for high-velocity sources + batch for static docs.

---

## 2. Theoretical Formulation & Decision Trade-offs

Using our Information-Theoretic and System Complexity Framework:

### A. Temporal Entropy Bounding $H(S_i, t)$
The staleness/entropy of document corpus $S_i$ accumulates as a function of elapsed time $t$ since last sync:

$$\Delta H(t) = \int_{0}^{t} \lambda_{\text{change}}(\tau) \, d\tau$$

Where $\lambda_{\text{change}}$ is the enterprise document edit rate. By enforcing a fixed batch window $T_{\text{sync}} = 24\text{ hours}$, maximum temporal staleness is strictly upper-bounded:

$$\max \Delta H = \Delta H(T_{\text{sync}})$$

For enterprise customer support, documentation and resolved ticket updates change predictably overnight rather than second-by-second.

### B. Operational Cost & Synchronization Stability ($C_{\text{ops}}$)
- **Real-Time CDC / Webhooks**: Introduces complex event consumer infrastructure, webhook retry queues, race conditions during rapid multi-edit drafts, and high API payload costs ($C_{\text{ops\_webhooks}}$ is high).
- **Scheduled Nightly Batch**: Executes a single idempotent differential crawl job during off-peak hours. Eliminates event queue infrastructure, reduces rate-limit exhaustion risks, and guarantees deterministic index state ($C_{\text{ops\_batch}} \to 0$).

---

## 3. Decision

We choose **Option 2: Scheduled Nightly Batch Sync** as the canonical document synchronization strategy for the Knowledge component.

### Concrete Implementation Rules:
1. **Crawl Window**: Execute differential batch ingestion nightly at 02:00 UTC.
2. **Differential Indexing**: Hash document contents (`SHA-256`) to re-index only updated or newly created items.
3. **Soft Deletions**: Mark removed source documents with a tombstone flag during the nightly crawl, evicting them from the active search index.
4. **Manual Trigger Override**: Provide an admin endpoint (`POST /api/v1/knowledge/sync`) for emergency on-demand batch indexing when critical product notices or zero-day patch docs are published.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- **Predictable & Robust**: Eliminates transient state bugs, missing webhooks, and complex distributed event queues.
- **Low Operational Cost**: Off-peak batch processing avoids hitting enterprise SaaS API rate limits during operational hours.
- **Idempotency**: Simple to re-run or replay full index rebuilds if schema changes occur.

### Negative / Neutral Trade-offs
- **Intra-day Latency**: Documents updated during the workday will not reflect in the agent's knowledge index until the next 02:00 UTC batch cycle (unless manually triggered).

---

## 5. References
- ADR 0001 & ADR 0002
- Enterprise Checkpoint Log (`checkpoint.md`)
