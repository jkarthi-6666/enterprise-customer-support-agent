# Design Checkpoint Log

Running log of decisions and open questions for the Enterprise AI Customer Support Agent architecture.
Source material: `Enterprise_AI_Customer_Support_Agent_Literature_Review.md`, `Thoughts.md` (12-capability abstraction), `whiteboard/src/App.tsx` (tldraw canvas).

Rule for this log: every entry records **what** was decided/deferred, **why**, and **what it depends on**. Nothing here is final until marked `CONFIRMED`. Anything marked `OPEN` is a question still waiting on you — do not treat it as decided.

---

## Scope for this pass

- **2026-08-08** — Chose to build the first deep low-level design (LLD) pass for the **Knowledge** component (not Agent Runtime). Reason given: knowledge/RAG is "a very big thing" on its own and deserves its own dedicated pass before Agent Runtime, Memory & State, or the other components.
  - Status: `CONFIRMED`
  - Depends on: nothing yet — this is the starting point.

- **2026-08-08** — `whiteboard/src/App.tsx` already contains a lighter-weight LLD summary section (component → sub-component → design tension → candidate tools) for 4 components, including Knowledge, stacked on the single main tldraw page. Decision: **keep that section as-is** (it still covers Agent Runtime, Memory & State, Action & Tools) and add the new, much deeper Knowledge design as a **separate tldraw page**, not a replacement.
  - Status: `CONFIRMED`
  - Reason: no data loss; matches the explicit ask for "a different page of tldraw"; the existing summary card for Knowledge can later be trimmed to a pointer/teaser once the new page exists, if wanted.
  - Depends on: nothing — this is a file-organization decision, not an architecture decision.

---

## Open questions (round 1) — core Knowledge architecture forks

- [x] **Retrieval architecture**: Managed RAG Platform — `CONFIRMED` via [ADR 0002](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0002-retrieval-engine-managed-rag-platform.md)
  - Leverages fully managed enterprise RAG APIs to minimize operational cost $C_{\text{ops}}$, with built-in native reranker integration to reduce query latency.
  - Ingestion boundary PII scrubbing applied to comply with enterprise VPC and data privacy standards.

- [x] **Reranking stage** — `CONFIRMED` as a conditional rule, not a standalone pick:
  - If Retrieval → Managed Platform: use the platform's native/built-in reranker.
  - If Retrieval → Hybrid (self-built): layer a dedicated cross-encoder-style reranking provider on top of the fused candidate set.
  - Depends on: Retrieval decision above (still open) — the *rule* is fixed, the concrete reranker choice under the Hybrid branch isn't yet.

- [x] **Context selection strategy** — `CONFIRMED` as a designed open experiment, not a single choice:
  - All three strategies (Fixed top-k, Token-budget-aware, MMR diversity-aware) implemented behind one swappable `ContextSelector` interface.
  - Evaluated via RAGAS-style metrics (Context Precision, Context Recall, Faithfulness) plus operational metrics (token spend vs. the 25–35% Retrieved-Knowledge budget tier, redundancy rate).
  - Run in shadow mode against real production candidate sets — no user-facing risk during comparison.
  - Promotion gate: a strategy replaces the default only after sufficient shadow volume and a measured win on Faithfulness/Context Precision without regressing token spend or latency (mirrors the lit review's κ ≥ 0.80 human-calibration discipline — data-driven promotion, not a vibe switch).
  - Default while the experiment runs: Fixed top-k (simplest baseline the others must beat).

- [x] **Knowledge Lifecycle / staleness handling** — `CONFIRMED`: Freshness scoring at retrieval time.
  - Deprioritizes older-looking documents in ranking rather than removing/expiring them.
  - Explicitly a mitigation, not a fix: closes the *symptom* (stale docs surfacing) but does not close the underlying known-unknown ("no expiry/versioning mechanism defined") — a doc can still be wrong and still live in the index. A future TTL/versioning layer would be additive, not a replacement.

Deferred to round 2 (not asked yet): chunking/representation strategy, knowledge source authority & conflict resolution, ingestion sync model (batch vs. real-time), embedding model choice, org-memory vs. knowledge-source boundary.

---

## Confirmed decisions

1. **Component sequencing**: Knowledge is the first component to get a deep LLD pass (over Agent Runtime), because it's large enough to deserve its own pass. — 2026-08-08
2. **File organization**: existing lightweight LLD summary in `App.tsx` stays; new deep Knowledge design becomes a separate tldraw page, not a replacement. — 2026-08-08
3. **Reranking**: conditional rule tied to Retrieval choice (see above). — 2026-08-08
4. **Context Selection**: build-and-compare experiment, not a single strategy; Fixed top-k is the interim default. — 2026-08-08
5. **Knowledge Lifecycle**: Freshness scoring at retrieval time (mitigation, not a full fix). — 2026-08-08
6. **Built**: new tldraw page "Knowledge — Low-Level Design" added to `whiteboard/src/App.tsx` (`buildKnowledgeDeepDivePage`, wired in via `handleMount`). Contains: two trajectory diagrams (offline/ingestion loop, online/query path), 7 sub-component detail cards with color-coded status (orange = OPEN, green = CONFIRMED, blue = CONFIRMED-as-experiment), a component-scoped known/unknown failure grid, and a decision-log summary card. Verified rendering in a real browser (Playwright against the Vite dev server) — no console errors, no visual overlap. — 2026-08-08
   - Bug caught and fixed during verification: React dev-mode double-invoked `onMount`, which duplicated shapes on Page 1 and spawned a stray "Knowledge — Low-Level Design 1" page. `handleMount` now guards on actual editor state (existing shape count / existing page name) instead of assuming single invocation, so it's idempotent regardless of how many times mount fires.
7. **Knowledge Source Authority & Probabilistic Conflict Resolution**: `CONFIRMED` via [ADR 0001](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0001-knowledge-source-authority-bayesian-conflict-resolution.md). Framework combines Bayesian Source Reliability priors $P(\text{Truth} \mid S_i)$, Information Gain $IG(Y; X)$, and Expected Cost of Error $\mathbb{E}[L(S_i)]$. Online winner choice (higher tier wins) + Asynchronous Offline Remediation Trigger (`KnowledgeConflictDetected` event logs discrepancy to clean lower-tier doc/ticket corpus over time). — 2026-08-15
8. **Retrieval Architecture**: `CONFIRMED` via [ADR 0002](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0002-retrieval-engine-managed-rag-platform.md). Selected Managed RAG Platform with native built-in reranking, bound to PII sanitization at the ingestion boundary. — 2026-08-15
9. **Document Ingestion & Temporal Sync Strategy**: `CONFIRMED` via [ADR 0003](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0003-document-ingestion-sync-strategy.md). Enforces a scheduled nightly batch differential crawl ($T_{\text{sync}} = 24\text{ hours}$) to bound temporal entropy and minimize webhook state synchronization ops ($C_{\text{ops\_batch}} \to 0$). — 2026-08-15
10. **Extensible Chunking & Embedding Abstractions**: `CONFIRMED` via [ADR 0004](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0004-extensible-chunking-and-embedding-abstractions.md). Enforces the Strategy Pattern (`IChunkingStrategy`) and Provider Abstraction (`IEmbeddingProvider`). Default baseline uses `FixedWindowChunkingStrategy` (500 words) and `ManagedPlatformEmbeddingProvider`, with zero-code-change extensibility for Header-Section chunking or In-VPC embedding providers. — 2026-08-15
11. **Knowledge vs. Memory System Boundary**: `CONFIRMED` via [ADR 0005](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0005-knowledge-versus-memory-architectural-boundary.md). Formally separates globally invariant, read-only Enterprise Knowledge (updated via nightly ingestion) from dynamic, session-scoped Read-Write Memory & State (updated by Agent Runtime per turn). — 2026-08-15
12. **Harnessed LLD Design Loop Specification (v2.0)**: `CONFIRMED` via [HARNESSED_LOOP.md](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/HARNESSED_LOOP.md). Formulates a 12-step evaluatory loop incorporating literature grounding, trajectory tracing, plain-language elicitation, formal ADR math generation, TLDraw canvas materialization, build verification (`npm run build`), and continuous checkpointing. Knowledge component calibrated as Benchmark Component #1 with 100% telemetry scorecard. — 2026-08-15

## Assigned component pass — 2026-08-15

13. **Memory & State**: `CONFIRMED` baseline via ADRs 0006–0009. Identity-linked continuity, TTL-bound working memory, explicit promotion, and durable idempotent checkpoints are synchronized with `docs/specs/memory-state.md` and the canvas cards.
14. **Agent Runtime**: `CONFIRMED` baseline via ADRs 0010–0012. Hybrid intent parsing, static-playbook-first planning, provider-neutral routing, and bounded durable execution are synchronized with `docs/specs/agent-runtime.md`.
15. **Action & Tools**: `CONFIRMED` baseline via ADRs 0013–0015. Provider-neutral adapters, signed dynamic registry with fallback, and two-phase side-effect verification are synchronized with `docs/specs/action-tools.md`.
16. **Human Collaboration**: `CONFIRMED` baseline via ADRs 0016–0017. Durable approval queues and redacted ownership-preserving handoffs are synchronized with `docs/specs/human-collaboration.md`.
17. **Observability & Economics**: `CONFIRMED` baseline via ADRs 0018–0020. Redacted OTel trajectories, token reservation/reconciliation, and tenant-scoped semantic-cache experimentation are synchronized with `docs/specs/observability-economics.md`.
18. **Governance & Safety**: `CONFIRMED` via ADRs 0021–0024. Input/output guardrail cascade, ingestion PII sanitizer, OPA policy decision point (PDP), and fail-closed audit envelope.
19. **Interaction Gateway**: `CONFIRMED` via ADRs 0025–0027. Unified channel gateway, channel formatting adapters, and session authentication context binding.
20. **Agent Coordination**: `CONFIRMED` via ADRs 0028–0030. Sub-agent delegation router, A2A communication protocol with state synchronization, and multi-agent conflict arbitration.
21. **Evaluation & Improvement**: `CONFIRMED` via ADRs 0031–0033. Shadow mode dual-execution engine with RAGAS evaluator, automated regression test suite, and failure mode analytics.
22. **Platform Engineering**: `CONFIRMED` via ADRs 0034–0036. Kubernetes horizontal pod autoscaling, high-availability Redis cluster with state backup engine, and reproducible GitOps deployment pipelines. — 2026-08-15
