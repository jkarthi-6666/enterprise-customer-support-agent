# ADR 0030: Multi-Agent Conflict Arbitration & Resolution Strategy

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Agent Coordination Module (Arbitration)
- **Relates To**: [ADR 0001](0001-knowledge-source-authority-bayesian-conflict-resolution.md), [ADR 0028](0028-agent-coordination-delegation-and-subagent-routing.md)

---

## 1. Context & Problem Statement

In multi-agent trajectories, two specialized sub-agents may produce conflicting recommendations (e.g., Billing Agent recommends a $200 refund, while Policy Agent caps refunds at $50 for this customer tier).

We evaluate:
1. **First-Response Wins** — accept whichever sub-agent responds first.
2. **LLM Consensus Vote** — prompt a meta-agent to vote across conflicting outputs.
3. **Deterministic Policy-Gated Arbitration with Priority Hierarchy** — resolve conflicts using static policy rules (Tiered Domain Priority + Compliance Guardrail Caps), escalating to human collaboration when unresolved.

---

## 2. Theoretical Formulation & Decision Rules

Using Bayesian Risk Minimization:

$$\mathbb{E}[L_{\text{arbitration}}] = P(\text{Policy Violation})\, C_{\text{compliance}} + P(\text{Customer Dissatisfaction})\, C_{\text{churn}}$$

Since $C_{\text{compliance}} \gg C_{\text{churn}}$, safety and policy rules strictly dominate sub-agent recommendations.

### Priority Hierarchy:
1. **Tier 1 (Dominant)**: Governance & Policy Guardrails (ADR 0023).
2. **Tier 2**: Domain-Authoritative Sub-Agent (e.g. Billing Agent dominates for invoice calculations; Tech Agent dominates for outage verification).
3. **Tier 3 (Escalation Gate)**: If confidence score $\Delta C = |S_A - S_B| < \tau_{\text{confidence}}$, trigger Human-in-the-Loop escalation (ADR 0016).

---

## 3. Consequences & Trade-offs

### Positive Consequences
- Prevents rogue sub-agent decisions from violating enterprise risk policies.
- Deterministic and auditable conflict resolution.

### Negative / Neutral Trade-offs
- Requires static priority mapping across sub-agent domains.
