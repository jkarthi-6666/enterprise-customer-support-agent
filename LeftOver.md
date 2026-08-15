Here's everything still open, grouped by what kind of decision it is:

1. **Retrieval Architecture**: `RESOLVED` via [ADR 0002](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0002-retrieval-engine-managed-rag-platform.md) (Managed RAG Platform selected; native built-in reranking + PII pre-scrubbing at ingestion boundary).

2. Round 2 questions (haven't been asked yet at all)
These are the ones I deliberately deferred so I didn't overload you in one round:

[x] **Which knowledge source is the "authority" when two systems disagree** — `RESOLVED` via [ADR 0001](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0001-knowledge-source-authority-bayesian-conflict-resolution.md) (Bayesian priors + Information Gain + Offline Asynchronous Remediation Trigger).
[x] **How new/changed/deleted source documents get picked up** — `RESOLVED` via [ADR 0003](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0003-document-ingestion-sync-strategy.md) (Scheduled Nightly Batch Crawl at 02:00 UTC).
[x] **How documents get chunked/split, and which embedding model to use** — `RESOLVED` via [ADR 0004](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0004-extensible-chunking-and-embedding-abstractions.md) (`IChunkingStrategy` with `FixedWindowChunkingStrategy` default baseline; `IEmbeddingProvider` with native Managed RAG model baseline).
[x] **Organizational Memory vs. Knowledge Boundary** — `RESOLVED` via [ADR 0005](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0005-knowledge-versus-memory-architectural-boundary.md) (Formally separates read-only enterprise Knowledge from dynamic read-write Memory & State).

3. Components not touched at all yet
Knowledge is 1 of 12. Nothing has been done in detail for:

Agent Runtime (the one you were also considering first)
Memory & State
Action & Tools
Agent Coordination
Governance & Safety
Human Collaboration
Evaluation & Improvement
Observability
Economics
Platform Engineering
Interaction
You said earlier not more than 3 total for now — so realistically 2 more slots after Knowledge, whenever you want to pick them.

## Assigned LLD Pass Status — ALL 12 COMPONENTS COMPLETE

- [x] **1. Interaction Gateway** — `RESOLVED` via ADRs 0025–0027 (`IInteractionGateway.ts`).
- [x] **2. Agent Runtime** — `RESOLVED` via ADRs 0010–0012 (`IAgentRuntime.ts`).
- [x] **3. Knowledge** — `RESOLVED` via ADRs 0001–0005 (`IKnowledgeEngine.ts`).
- [x] **4. Memory & State** — `RESOLVED` via ADRs 0006–0009 (`IMemoryStateStore.ts`).
- [x] **5. Action & Tools** — `RESOLVED` via ADRs 0013–0015 (`IToolRegistry.ts`).
- [x] **6. Agent Coordination** — `RESOLVED` via ADRs 0028–0030 (`IAgentCoordinator.ts`).
- [x] **7. Governance & Safety** — `RESOLVED` via ADRs 0021–0024 (`IGovernanceGuardrail.ts`).
- [x] **8. Human Collaboration** — `RESOLVED` via ADRs 0016–0017 (`IHumanCollaboration.ts`).
- [x] **9. Evaluation & Improvement** — `RESOLVED` via ADRs 0031–0033 (`IEvaluationEngine.ts`).
- [x] **10. Observability** — `RESOLVED` via ADR 0018 (`IObservability.ts`).
- [x] **11. Economics** — `RESOLVED` via ADRs 0019–0020 (`IEconomics.ts`).
- [x] **12. Platform Engineering** — `RESOLVED` via ADRs 0034–0036 (`IPlatformRuntime.ts`).

All 12 component LLD passes have been audited, formalized into 36 neutral ADRs, compiled into the `src/` blueprint skeleton, and backed by GitHub Issues #1 through #12.

4. A loose end from the existing canvas
The old, shallower summary card for Knowledge (the one that was already on the main page before today) is still sitting there untouched, now duplicating — at a shallower level — what the new detailed page covers. You said earlier this could be trimmed down to just a pointer once the new page existed. That trim hasn't happened; it's just sitting as-is.

5. A process question that's been implicit, not asked
Whether you want me to keep checking in after every batch of decisions (like I've been doing), or let some categories of open item ride until you're ready to sit down and go through a whole batch at once.

That's the full list. Nothing on it has been decided by me — it's all waiting on you.
