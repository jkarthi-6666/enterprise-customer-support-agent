# Governance & Safety Module LLD

Status: CONFIRMED baseline; classifier SKU and Cedar promotion remain experiments.

## Boundary and trajectories

The module receives inbound `UserMessage` text, outbound response text, Knowledge ingestion payloads, and ABAC 4-tuples from Runtime / Action & Tools. It returns `GuardrailCheckResult` and `PolicyDecision`. It does not classify customer intent, execute tools, deliver channel payloads, or own the human approval queue.

Trajectory A (online request): Interaction envelope → input rails (ADR 0021) → optional `evaluatePolicy` on planned actions (ADR 0023) → Runtime / Tools → output rails → fail-closed audit envelope (ADR 0024) → Interaction delivery.

Trajectory B (offline ingestion): Knowledge crawl payload → irreversible PII sanitizer (ADR 0022) → Managed RAG client (ADR 0002). Operational detokenization is a separate vault path used only after `allow`.

## Decisions

- Deterministic-first input/output cascade with fail-closed compliance classes. (ADR 0021)
- Two-tier PII: irreversible for Knowledge, reversible vault tokens for fulfillment. (ADR 0022)
- OPA is the canonical PDP; Cedar is a shadow-evaluated adapter. (ADR 0023)
- Uncertain or denied high-risk actions refuse autonomously and emit a WORM audit envelope; `escalate` is handed to Human Collaboration. (ADR 0024)

## Failure grid and mitigations

Known-knowns: prompt injection, PII in tickets, PDP timeout → cascade + two-tier sanitizer + default deny. Known-unknowns: classifier calibration and Cedar parity → shadow eval (ADR 0031) and golden policy suite (ADR 0033). Unknown-knowns: policy authors encoding prompt text instead of Rego → review lint and “no policy in prompt” check. Unknown-unknowns: novel jailbreak families → residual risk owned; logged to Evaluation as new cases.

## DoD / handoff

Sub-components Security, Authorization, Guardrails, Policies, Privacy, Data Protection, AI Safety, and Compliance have step-4 tags. Trajectories A/B and Not-Owned boundaries are explicit. Implementations must preserve `IGovernanceGuardrail` including `evaluatePolicy`.
