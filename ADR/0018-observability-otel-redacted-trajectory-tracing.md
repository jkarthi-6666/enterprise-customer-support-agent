# ADR 0018: OpenTelemetry-Compatible Redacted Tracing

- Status: Accepted
- Component: Observability

## Context
Agent quality and cost require request-to-tool traceability without exposing sensitive content.

## Theoretical formulation
Maximize `IG(incident diagnosis)` subject to privacy loss and cardinality budgets. Sampling rate is selected to minimize `E[L(missed incident)] + C_storage`.

## Decision rules
Propagate tenant/session/run/step correlation; create spans for classification, retrieval, model, memory, tool, guardrail, and handoff. Redact before export, sample low-risk traffic, retain audit events separately.

## Consequences
Strong diagnosis and compliance posture; telemetry pipeline and sampling governance are required.
