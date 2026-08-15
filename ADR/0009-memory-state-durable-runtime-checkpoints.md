# ADR 0009: Idempotent Durable Runtime Checkpoints

- Status: Accepted
- Component: Memory & State

## Context
Agent runs can fail after a side effect and before response persistence.

## Theoretical formulation
Checkpoint when `IG(recovery state) > C_checkpoint`; minimize `E[L(duplicate side effect)]` with idempotency keys. The durable baseline has lower expected loss than in-process state for tool-bearing runs.

## Decision rules
Persist plan version, step status, input hash, result reference, and idempotency key after each step. Resume only from a committed boundary; delegate retention/purge to Governance.

## Consequences
Recovery is auditable but adds write latency and storage cost.
