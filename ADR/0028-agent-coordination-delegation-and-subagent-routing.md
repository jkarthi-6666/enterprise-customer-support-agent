# ADR 0028: Agent Coordination — Delegation & Sub-Agent Routing

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Agent Coordination Module (Routing & Delegation)
- **Relates To**: `src/contracts/IAgentCoordinator.ts`, [ADR 0010](0010-agent-runtime-hybrid-intent-classification.md)

---

## 1. Context & Problem Statement

Complex enterprise support tickets (e.g. multi-line billing disputes involving technical outage diagnosis) exceed single-agent prompt boundaries. The architecture requires a delegation mechanism to route domain-specific sub-intents to specialized sub-agents (e.g. Billing Agent, Technical Diagnostics Agent, Refund Approver).

Options:
1. **Flat Monolithic Agent** — handle all domain tasks in one monolithic prompt.
2. **Free-Form Dynamic Agent Spawn** — agents spawn arbitrary downstream sub-agents dynamically.
3. **Deterministic Capability-Based Delegation Router** — a centralized coordinator routes sub-intents to a statically defined registry of specialized sub-agents via bounded delegation contracts.

---

## 2. Theoretical Formulation

Let $Q$ be a complex query with sub-intents $q_1, q_2, \dots, q_m$.

### Pillar A: Information Gain of Specialized Delegation
$$\Delta IG(q_i) = IG(\text{Response} \mid \text{SubAgent}_k) - IG(\text{Response} \mid \text{GeneralAgent})$$
Specialized sub-agents operate over domain-constrained prompt spaces and specialized tool subsets, significantly reducing response entropy $H(\text{Response} \mid q_i)$.

### Pillar B: Expected Loss Minimization
$$\mathbb{E}[L_{\text{coordination}}] = \sum_{i=1}^m P(\text{Error} \mid \text{SubAgent}_{k(i)})\, C_{\text{error}} + C_{\text{delegation\_latency}}$$

We select the optimal sub-agent $k^*$ using:
$$k^* = \arg\min_k \mathbb{E}[L_{\text{coordination}}(k)]$$

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: Deterministic Capability-Based Delegation Router**.

1. **Delegation Contract**: Sub-agents expose explicit capability schemas (`ICapabilityDescriptor`).
2. **Bounded Depth**: Maximum delegation depth is strictly capped at $N_{\text{depth}} = 2$ to prevent infinite delegation loops.
3. **State Isolation**: Sub-agents execute within child context frames (`SessionTurnContext`), returning structured results to the parent coordinator.
4. **Fallback Handling**: If a sub-agent fails or times out ($T_{\text{timeout}} = 5\text{s}$), execution falls back to the primary Agent Runtime harness.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Bounds execution complexity and avoids uncontrollable agent-to-agent cascade loops.
- Maintains auditable trajectory trails for each delegated sub-task.

### Negative / Neutral Trade-offs
- Requires maintaining explicit capability schemas for all specialized sub-agents.

---

## 5. References
- ADR 0010 (Hybrid Intent Classification)
- `src/contracts/IAgentCoordinator.ts`
