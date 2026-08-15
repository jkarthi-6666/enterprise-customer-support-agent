# ADR 0021: Input/Output Guardrail Cascade with Fail-Closed Safety Classification

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Governance & Safety Module (Guardrails)
- **Relates To**: [ADR 0002](0002-retrieval-engine-managed-rag-platform.md), `src/contracts/IGovernanceGuardrail.ts`

---

## 1. Context & Problem Statement

Every inbound `UserMessage` and every outbound agent response can carry prompt-injection, jailbreak, PII leakage, unauthorized promises, or policy-violating content. The literature review specifies a **guardrail cascade** (NeMo-style Input / Dialog / Execution / Output rails plus a Llama Guard-class classifier) rather than a single prompt instruction.

The architectural fork is:
1. **Prompt-only policy** — encode safety in the system prompt and trust the generator.
2. **Single LLM-as-judge gate** — one classifier call at ingress or egress.
3. **Deterministic-first cascade** — cheap deny-lists and schema checks, then a calibrated safety classifier, then policy PDP (ADR 0023), with output rails after generation.

The cascade must implement `IGovernanceGuardrail.verifyInputMessage` and `verifyOutputResponse` without owning intent classification, tool execution, or channel transport.

---

## 2. Theoretical Formulation

Let $x$ be an inbound or outbound text span and $T$ the event that $x$ is unsafe under the enterprise safety taxonomy. A detector $D$ emits $P(T \mid x)$.

### Pillar A: Bayesian Safety Posterior

$$P(T \mid x) = \frac{P(x \mid T)\, P(T)}{P(x)}$$

Priors $P(T)$ are tenant-calibrated from Quality Monitoring auto-fail rates (COPC compliance errors). High-impact classes (PII disclosure, unauthorized refunds, jailbreak) receive $P(T)$ floors so rare but catastrophic events are not washed out by the majority-benign prior.

### Pillar B: Information Gain of Each Rail

Rail $r$ is retained only if it reduces residual entropy of the safety label $Y$:

$$IG(Y; r) = H(Y) - H(Y \mid r)$$

Deterministic injection patterns and PII regexes have high $IG$ at near-zero latency. The classifier rail is invoked only when residual $H(Y \mid r_{\text{det}}) > \tau_H$.

### Pillar C: Expected Loss Minimization

$$\mathbb{E}[L] = P(\text{FN})\, C_{\text{breach}} + P(\text{FP})\, C_{\text{friction}} + C_{\text{latency}}$$

For compliance-class taxonomy ($C_{\text{breach}} \gg C_{\text{friction}}$), the Bayes decision is **fail-closed**:

$$\text{deny if } P(T \mid x)\, C_{\text{breach}} \ge (1 - P(T \mid x))\, C_{\text{friction}}$$

Prompt-only policy maximizes $P(\text{FN})$ and is rejected. A single judge gate wastes $C_{\text{latency}}$ on every turn and still misses cheap deterministic cases.

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: Deterministic-first guardrail cascade**.

1. **Input rail (pre-runtime)**: Unicode normalization, secret/URL exfil patterns, known jailbreak lexicons, then optional Llama Guard-class classifier when residual entropy exceeds $\tau_H$.
2. **Dialog rail**: conversation-state constraints (authentication incomplete ⇒ block account-mutating intents). This rail *signals* `escalate`; Human Collaboration owns the queue.
3. **Execution rail**: does not execute tools. It calls `evaluatePolicy` (ADR 0023) before Action & Tools may proceed.
4. **Output rail**: PII re-scan, unauthorized-promise detectors, brand/policy phrase denylist. `sanitizedContent` is what Memory persists and Interaction delivers.
5. **Fail-closed default**: `passed = false` when the classifier is unavailable or $P(T \mid x)$ is uncalibrated for a compliance-class label.
6. **Contract**: `verifyInputMessage` / `verifyOutputResponse` return `GuardrailCheckResult` including the optional `PolicyDecision`.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Matches the literature cascade and the orchestrator skeleton (input check → runtime → output check).
- Bounds $\mathbb{E}[L]$ for COPC auto-fail classes without putting policy text in the generator prompt.
- Deterministic rails keep $C_{\text{latency}}$ low for the common benign path.

### Negative / Neutral Trade-offs
- False positives increase customer friction; thresholds are tenant-configurable and evaluated in shadow (ADR 0031).
- Classifier model choice remains a calibrated experiment (OPEN: exact model SKU).

---

## 5. References
- Reuchert et al., *NeMo Guardrails* (2023)
- Inan et al., *Llama Guard* (2023)
- COPC CX Standard; ISO 18295 Parts 1 & 2
- ADR 0022 (PII), ADR 0023 (Policy PDP), ADR 0024 (Audit envelope)
