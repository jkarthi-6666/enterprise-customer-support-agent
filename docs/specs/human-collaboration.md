# Human Collaboration Module LLD

Status: CONFIRMED baseline; SLA thresholds are tenant policy.

## Boundary and trajectories

The module receives escalation requests, risk/context summaries, and operator decisions. It returns approval, rejection, clarification, or handoff events. It does not classify intent, execute tools, or replace the channel gateway.

Trajectory A: runtime risk gate → approval queue → operator decision → runtime resume/abort. Trajectory B: escalation trigger → live-agent handoff → transcript/context package → human ownership → closure event.

## Decisions

- Durable approval queue with priority, SLA timers, and escalation-on-timeout. (ADR 0016)
- Context-preserving handoff envelope with redaction and explicit ownership transfer. (ADR 0017)

## Failure grid and mitigations

Known-knowns: queue starvation and lost context → priority aging and immutable handoff envelope. Known-unknowns: appropriate SLA by tier → policy configuration and telemetry. Unknown-knowns: operator sees unnecessary sensitive fields → role-based redaction. Unknown-unknowns: partial ownership during reconnect → single-owner lease and reconciliation.
