# ADR 0033: Failure Mode Analytics & Self-Improvement Bounding Strategy

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Evaluation & Improvement Module
- **Relates To**: `checkpoint.md` (Known/Unknown Failure Grid), [ADR 0031](0031-evaluation-shadow-mode-experimentation-and-ragas.md)

---

## 1. Context & Problem Statement

Self-improving agent loops (e.g. automatic prompt optimization) can diverge or optimize proxy metrics at the expense of real customer satisfaction.

Decision Rules:
1. **Automated Failure Clustering**: Log and cluster all failed turns ($P(\text{Faithfulness}) < 0.70$) into failure taxonomy categories (Retrieval Miss, Intent Misclassification, Tool Error).
2. **Bounded Self-Improvement**: Automated prompt optimization proposals are generated offline, but require human sign-off before entering shadow mode (ADR 0031). Fully autonomous online prompt mutation is explicitly forbidden.

---

## 2. Consequences

- Protects system integrity by preventing runaway self-reinforcing prompt drift.
- Provides actionable failure taxonomy dashboards for engineering teams.
