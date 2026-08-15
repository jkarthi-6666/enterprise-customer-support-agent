# ADR 0016: Durable Approval Queue with SLA Escalation

- Status: Accepted
- Component: Human Collaboration

## Context
High-risk actions need a human decision that survives worker and channel failure.

## Theoretical formulation
Prioritize item `q` by `risk × customer_impact × age`; choose escalation deadline minimizing `E[L(timeout)] + C_operator`. Queue telemetry supplies information gain about SLA tuning.

## Decision rules
Persist immutable request context, risk, tenant, owner, and deadline. Use leases, priority aging, reminders, and timeout escalation; decisions are append-only and auditable.

## Consequences
Safer decisions with operator load and queue infrastructure costs.
