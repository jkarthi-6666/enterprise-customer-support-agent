# ADR 0031: Shadow Mode Experimentation Engine & RAGAS Evaluator

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Evaluation & Improvement Module
- **Relates To**: `src/contracts/IEvaluationEngine.ts`, [ADR 0004](0004-extensible-chunking-and-embedding-abstractions.md)

---

## 1. Context & Problem Statement

Promoting new retrieval strategies, prompt templates, or model providers directly to production risks customer-facing regressions.

We evaluate:
1. **Direct Production Deployment** — deploy new components live and monitor user feedback.
2. **Offline Static Benchmark Testing** — evaluate on a fixed dataset before deployment.
3. **Shadow Mode Dual-Execution Engine with Automated RAGAS Evaluation** — stream production queries to candidate components in shadow mode, evaluate metrics continuously, and enforce promotion gates.

---

## 2. Theoretical Formulation

Let $M_{\text{prod}}$ be the baseline active component and $M_{\text{candidate}}$ the candidate model running in shadow mode.

### Evaluation Metrics Vector:
$$E(M) = [\text{Faithfulness}, \text{ContextPrecision}, \text{ContextRecall}, C_{\text{latency}}, C_{\text{tokens}}]$$

### Promotion Gate Criteria:
Candidate model $M_{\text{candidate}}$ is promoted if and only if:

$$\text{Faithfulness}(M_{\text{candidate}}) \ge \text{Faithfulness}(M_{\text{prod}}) + \delta$$
$$\text{ContextPrecision}(M_{\text{candidate}}) \ge \text{ContextPrecision}(M_{\text{prod}})$$
$$C_{\text{latency}}(M_{\text{candidate}}) \le C_{\text{max\_sla}}$$

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: Shadow Mode Dual-Execution Engine**.

1. **Async Shadow Pipeline**: Production queries trigger parallel async evaluation of candidate strategies without impacting primary turn latency.
2. **RAGAS Integration**: Automated computation of Faithfulness, Context Recall, and Answer Relevance.
3. **Promotion Gate**: Requires minimum 1,000 shadow runs and measured statistical win before automated promotion.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Zero-risk empirical validation of new models and RAG strategies.
- Data-driven promotion discipline instead of subjective prompt tuning.

### Negative / Neutral Trade-offs
- Incurs token cost for running candidate models asynchronously in shadow mode.
