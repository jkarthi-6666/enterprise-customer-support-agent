# ADR 0029: Agent-to-Agent (A2A) Communication Protocol & State Synchronization

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Agent Coordination Module (A2A Protocols)
- **Relates To**: `src/contracts/IAgentCoordinator.ts`, [ADR 0005](0005-knowledge-versus-memory-architectural-boundary.md)

---

## 1. Context & Problem Statement

When multiple specialized agents collaborate on a customer issue, they must exchange intermediate findings, context, and tool outputs without corrupting the global session state.

We evaluate:
1. **Shared Global Memory Mutation** — sub-agents directly write to the primary session store.
2. **Unstructured Text Messaging** — sub-agents exchange free-form natural language strings.
3. **Structured JSON-Schema A2A Protocol with Immutable State Handoff** — sub-agents communicate via typed request/response messages with isolated, read-only parent context views.

---

## 2. Theoretical Formulation

Let $M_p$ be the parent session memory state and $M_c$ the child sub-agent memory frame.

### Pillar A: Entropy & State Isolation
To prevent state mutation entropy $\Delta H(M_p)$ during sub-agent execution:
$$\frac{\partial M_p}{\partial t}_{\text{subagent}} = 0 \quad \text{(Read-Only Parent Invariant)}$$

The child sub-agent produces a delta payload $\Delta M_c = f(M_c, u_{\text{sub}})$. The coordinator selectively applies a validated state transformation:
$$M_p(t+1) = M_p(t) \cup \text{Validate}(\Delta M_c)$$

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: Structured JSON-Schema A2A Protocol with Immutable State Handoff**.

1. **Message Schema**: A2A payloads must conform to `A2AMessageEnvelope`:
   - `senderId`, `receiverId`, `correlationId`, `payloadSchema`, `payloadData`.
2. **State Immutaiblity**: Parent session memory is passed to sub-agents as a read-only snapshot.
3. **Delta Merging**: Only explicit, schema-validated output fields (e.g. `technicalDiagnosisCode`, `refundAmountApproved`) are merged back into primary working memory.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Guarantees session state integrity; sub-agents cannot overwrite unrelated user context or conversation turns.
- Clean auditability of inter-agent messages.

### Negative / Neutral Trade-offs
- Adds serialization overhead for A2A payload validation.

---

## 5. References
- ADR 0005 (Memory Boundary)
- `src/contracts/IAgentCoordinator.ts`
