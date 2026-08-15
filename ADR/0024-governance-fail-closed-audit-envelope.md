# ADR 0024: Fail-Closed Refusal Semantics and Immutable Audit Envelope

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Governance & Safety Module (Compliance / AI Safety)
- **Relates To**: [ADR 0021](0021-governance-input-output-guardrail-cascade.md), [ADR 0023](0023-governance-opa-policy-decision-point.md)

---

## 1. Context & Problem Statement

When a rail or PDP is uncertain, timed out, or in disagreement, the system must choose refuse, allow, or ask a human. Enterprise compliance (SOC 2, GDPR Art. 22, PCI, HIPAA) additionally requires non-repudiable records of what was decided and why.

The fork is:
1. **Fail-open** — prefer customer progress; accept breach $\mathbb{E}[L]$.
2. **Fail-closed** — prefer refusal; accept friction.
3. **Fail-closed with structured escalate** — refuse autonomous action, emit an audit envelope, and route `escalate` effects to Human Collaboration.

Governance owns the decision record. It does not own log shipping (Observability) or the approval queue (Human Collaboration).

---

## 2. Theoretical Formulation

Let $u$ be the uncertainty of the latest safety/policy posterior.

### Pillar A: Uncertainty-conditioned action prior

$$P(\text{safe-to-act} \mid u) = 1 - u$$

When $u > \tau_u$ for a compliance-class action, $P(\text{safe-to-act})$ is treated as 0. This is a prior, not a user preference.

### Pillar B: Information Gain of the audit envelope

The envelope $A$ records $(s, r, a, e, \delta, P(T \mid x), \text{policyIds})$.

$$IG(\text{forensics}; A) = H(\text{incident cause}) - H(\text{incident cause} \mid A)$$

Without $A$, post-incident entropy stays near $H_{\max}$. With $A$, Evaluation can promote new regression cases (ADR 0033).

### Pillar C: Expected Loss

$$\mathbb{E}[L] = P(\text{act} \mid \text{unsafe})\, C_{\text{breach}} + P(\text{refuse} \mid \text{safe})\, C_{\text{friction}} + P(\text{no audit})\, C_{\text{attestation}}$$

$C_{\text{breach}}$ and $C_{\text{attestation}}$ dominate $C_{\text{friction}}$ for refunds, PII, and auth bypass. Fail-open is therefore dominated. Fail-closed without escalate maximizes $C_{\text{friction}}$ on recoverable cases. Structured escalate minimizes the sum.

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: Fail-closed with structured escalate**.

1. **Refusal rule**: if any compliance-class rail fails, or PDP returns `deny` / timeout / disagreement, the orchestrator does not call tools and does not persist an agent “success” turn as if the action occurred.
2. **User-visible text**: a generic, non-leaking refusal or “routed for review” message. Internal `reason` and taxonomy stay off-channel.
3. **Escalate rule**: `PolicyEffect = escalate` or $u > \tau_u$ on a Maker-Checker action publishes a redacted `GovernanceDecision` event for Human Collaboration. Governance does not wait on the human.
4. **Audit envelope** (WORM semantics): `decisionId`, tenant, session, actor, action, effect, policyIds, hashed input, sanitized attributes, `expectedLoss`, timestamp. Raw PII is not stored (ADR 0022).
5. **Handoff**: Observability ships the envelope; Evaluation may copy it into the golden suite. Neither may mutate the decision.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Makes COPC auto-fail classes mechanically un-bypassable.
- Produces the attestation trail required by SOC 2 / GDPR.
- Closes the loop into Evaluation (failed decisions become tests).

### Negative / Neutral Trade-offs
- Raises AHT/friction on uncertain high-risk turns — accepted under the AHT vs quality trade-off in the literature review.
- Envelope schema must stay stable; additive fields only.

---

## 5. References
- GDPR Article 22; SOC 2 Type II; COPC auto-fail taxonomy
- ADR 0021, ADR 0022, ADR 0023
- Human Collaboration module (approval queue owns resume/abort)
