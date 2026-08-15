# ADR 0011: Static Playbooks as Planning Baseline

- Status: Accepted — experiment
- Component: Agent Runtime

## Context
Dynamic plans adapt well but can create unsafe or unauditable steps.

## Theoretical formulation
Choose plan `p* = argmax IG(p; goal) - E[L(unsafe step)] - C_latency(p)`. Dynamic plans run in shadow mode and must beat playbooks on task success without increasing policy violations or p95 latency.

## Decision rules
`IPlanner.generatePlan` returns typed, auditable steps. Static playbooks handle known intents; a constrained planner may propose alternatives, but policy and step schema validation remain mandatory.

## Consequences
High auditability and easy rollback; new intents require playbook coverage until promotion.
