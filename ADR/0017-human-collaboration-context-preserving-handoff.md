# ADR 0017: Redacted Context-Preserving Handoff

- Status: Accepted
- Component: Human Collaboration

## Context
Live transfer fails when the human lacks the relevant conversation and state.

## Theoretical formulation
Choose envelope fields maximizing `IG(agent_success)` subject to `E[L(PII exposure)]` under the tenant policy threshold.

## Decision rules
Create a signed handoff envelope containing summary, transcript references, unresolved intent, tool history, and next action; redact by role; transfer a single ownership lease and emit closure/resume events.

## Consequences
Lower repetition and safer transfer, with summary generation and redaction complexity.
