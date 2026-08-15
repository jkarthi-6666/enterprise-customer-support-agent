# Observability & Economics Module LLD

Status: CONFIRMED baseline; cache promotion and budget thresholds are experiments.

## Boundary and trajectories

Observability receives runtime/tool/memory events and emits traces, metrics, and audit records. Economics receives token/model/cache usage and emits budget decisions. Neither changes business answers or owns provider execution.

Trajectory A: request → trace/span context → model/tool events → cost attribution → dashboards/alerts. Trajectory B: budget check → allow/degrade/escalate → usage reconciliation.

## Decisions

- OpenTelemetry-compatible traces with tenant/session/run correlation and redaction at collection. (ADR 0018)
- Token budgets use reservation, reconciliation, and rate limits with graceful degradation. (ADR 0019)
- Semantic prompt caching is opt-in, tenant-scoped, TTL-bound, and promoted only after shadow validation. (ADR 0020)

## Failure grid and mitigations

Known-knowns: missing spans and cost undercount → mandatory lifecycle spans and reconciliation. Known-unknowns: useful cache similarity threshold → shadow hit/quality evaluation. Unknown-knowns: PII in telemetry → redaction and access controls. Unknown-unknowns: cardinality/cost explosion → sampling, quotas, and circuit breakers.
