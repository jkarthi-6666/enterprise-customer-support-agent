# ADR 0010: Hybrid Intent Classification

- Status: Accepted
- Component: Agent Runtime

## Context
Fixed classifiers are cheap but brittle; unconstrained LLM parsing is flexible but less predictable.

## Theoretical formulation
Route to classifier when `P(intent|message) >= tau`; otherwise use structured-output fallback. Select `tau` by minimizing `E[L(misroute)] + C_model`, and measure `IG` from extracted entities versus raw text.

## Decision rules
Return `AgentIntent` with confidence, entities, and escalation flag. Unknown, multi-intent, or low-confidence results go to the fallback or human policy; no free-form intent is accepted downstream.

## Consequences
Predictable common-case cost with a slower fallback path.
