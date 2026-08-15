# ADR 0023: OPA Policy Decision Point with Cedar Adapter Experiment

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Governance & Safety Module (Policies / Authorization)
- **Relates To**: [ADR 0021](0021-governance-input-output-guardrail-cascade.md), `src/contracts/IToolRegistry.ts`, NIST SP 800-162

---

## 1. Context & Problem Statement

Tool authorization and high-risk conversation actions cannot live in the generator prompt. The literature review requires Attribute-Based Access Control (ABAC) with a declarative policy engine (OPA) decoupled from agent text.

The fork is:
1. **Hard-coded permission lists** in Action & Tools.
2. **OPA (Rego) as the sole PDP**.
3. **Cedar as the sole PDP** (AWS Verified Permissions native).
4. **OPA as the canonical PDP**, with a Cedar compile/adapter path as a tenant experiment.

`IGovernanceGuardrail.evaluatePolicy` is the only authorization primitive other components may call.

---

## 2. Theoretical Formulation

A request is the ABAC 4-tuple $(s, r, a, e)$ — subject, resource, action, environment. The PDP returns effect $\delta \in \{\text{allow}, \text{deny}, \text{escalate}\}$.

### Pillar A: Policy as a prior over lawful actions

$$P(\text{lawful} \mid s, r, a, e) = \mathbf{1}[\pi(s, r, a, e) = \text{allow}]$$

Priors on $\pi$ come from enterprise SoD / Maker-Checker rules (refunds above threshold, account takeover, data export). The agent prompt is *not* a source of $P(\text{lawful})$.

### Pillar B: Information Gain of externalized policy

$$IG(Y_{\text{auth}}; \pi_{\text{external}}) \gg IG(Y_{\text{auth}}; \text{prompt text})$$

because prompt policy is non-deterministic and unauditable. External $\pi$ yields a binary, replayable decision.

### Pillar C: Expected Loss

$$\mathbb{E}[L] = P(\text{unauthorized side effect})\, C_{\text{fraud}} + C_{\text{pdp}} + C_{\text{lock-in}}$$

Hard-coded lists minimize $C_{\text{pdp}}$ but maximize drift and $C_{\text{fraud}}$. A single-vendor Cedar-only PDP raises $C_{\text{lock-in}}$ for non-AWS tenants. OPA is portable, sidecars are cheap ($C_{\text{pdp}} \to 0$ at request scale), and a Cedar adapter preserves option value.

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 4: OPA canonical PDP + Cedar adapter experiment**.

1. **Canonical engine**: Open Policy Agent evaluating Rego bundles. Policy is data, versioned, and signed. Runtime loads bundles; it does not embed policy strings in prompts.
2. **Request schema**: `PolicyEvaluationRequest` with `subject` (userId, tier, roles, auth strength), `resource` (toolName, entity type/id, amount), `action`, `environment` (channel, geo, time, tenantId).
3. **Effects**: `allow` proceeds; `deny` is fail-closed; `escalate` hands a redacted package to Human Collaboration (Maker-Checker). Governance does not own the human queue.
4. **Tool gate**: Action & Tools must call `evaluatePolicy` before any `isSideEffecting` execution. A missing decision is `deny`.
5. **Cedar experiment**: tenants on AWS Verified Permissions may compile a supported policy subset to Cedar. Promotion requires shadow parity with OPA (ADR 0031) and no decision disagreement on the golden suite (ADR 0033).
6. **Default deny** for unknown tools, expired auth, or PDP timeout.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Separates policy from generation; satisfies least privilege and SoD.
- Portable across clouds; Cedar remains an experiment, not a rewrite.
- Gives Evaluation a deterministic authorization oracle for regression.

### Negative / Neutral Trade-offs
- Policy-authoring skill (Rego) is required of the Security Pod.
- Dual-engine shadow adds temporary operational cost until the Cedar experiment is accepted or retired.

---

## 5. References
- NIST SP 800-162 (ABAC)
- Saltzer & Schroeder, *Protection of Information in Computer Systems* (1975)
- Open Policy Agent; AWS Cedar / Verified Permissions
- ADR 0021, ADR 0024, Action & Tools `IToolExecutor`
