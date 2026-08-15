# ADR 0005: Architectural Boundary Between Enterprise Knowledge & Dynamic Agent Memory

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Knowledge vs. Memory & State System Boundary
- **Relates To**: [ADR 0001](file:///Users/karthi/Desktop/Enterprise%20Customer%20Support%20Agent/ADR/0001-knowledge-source-authority-bayesian-conflict-resolution.md), `Thoughts.md` (12-Capability Architecture)

---

## 1. Context & Problem Statement

In enterprise agent design, confusion often arises regarding the boundary between **Knowledge** and **Memory & State**. For instance, are past customer interaction logs "Knowledge" or "Memory"? Where do user preferences and agent episodic reflections reside?

Without a strict architectural boundary:
- Read/write access patterns become tangled.
- Static enterprise domain facts get corrupted by session-specific state.
- Data residency and cache invalidation rules become ambiguous.

---

## 2. Theoretical Boundary Definition

We establish a formal separation based on **Scope**, **Access Mutability during Turn Execution**, and **Lifecycle Pipeline**:

```
+-----------------------------------------------------------------------------------+
|                            ENTERPRISE SUPPORT AGENT                               |
+----------------------------------------------------+------------------------------+
|                KNOWLEDGE MODULE                    |    MEMORY & STATE MODULE     |
+----------------------------------------------------+------------------------------+
| Scope: Enterprise-Wide, Shared Domain Facts        | Scope: User/Session Specific |
| Access: READ-ONLY during conversation turn         | Access: READ-WRITE per turn  |
| Update Engine: Nightly Ingestion Pipeline (ADR 3) | Update Engine: Agent Runtime |
| Content: Product Docs, Confluence, Resolved Tix    | Content: Turn History, User  |
|                                                    | Profile, Episodic Scratchpad |
+----------------------------------------------------+------------------------------+
```

### Mathematical Formalization

- **Knowledge Domain $\mathcal{K}$**:
  $$\mathcal{K} = \{ (d_i, \text{meta}_i, R(S_i)) \}$$
  Where $\mathcal{K}$ represents globally invariant enterprise facts. For any conversation session $S_k$ at turn $t$:
  $$\frac{\partial \mathcal{K}}{\partial t}_{\text{turn}} = 0 \quad \text{(Read-Only Invariant)}$$

- **Memory & State Domain $\mathcal{M}$**:
  $$\mathcal{M}_{S_k}(t) = f(\mathcal{M}_{S_k}(t-1), u_t, a_t)$$
  Where state evolves dynamically at every interaction turn based on user input $u_t$ and agent action $a_t$.

---

## 3. Decision

1. **Knowledge System Boundary**:
   - Stores enterprise-wide, multi-tenant public/canonical information.
   - Strictly **Read-Only** for the Agent Runtime during user chat turns.
   - Updated exclusively out-of-band via the Ingestion Pipeline (ADR 0003).

2. **Memory & State Boundary**:
   - Stores session context, conversation turn history, user profile/preferences, and episodic agent reflections.
   - Dynamically **Read-Write** for the Agent Runtime during live chat execution.

3. **Organizational Memory Rule**:
   - Historical resolved tickets used as general support reference = **Knowledge Component** (read-only reference corpus).
   - A specific customer's open ticket history or recent refund state = **Memory & State Component** (user-scoped session context).

---

## 4. Consequences & Trade-offs

### Positive Consequences
- **Clean Interface Segregation**: Clear isolation of concerns between global factual search and session state management.
- **Security & Multi-Tenancy**: Prevents session state or user PII from accidentally leaking into global Knowledge indices.
- **Cache Optimization**: Knowledge indices can be cached aggressively since they are invariant during conversational turns.

### Negative / Neutral Trade-offs
- Agent Runtime must maintain two distinct client connectors (`IKnowledgeClient` for factual retrieval and `IMemoryStateClient` for turn context).
