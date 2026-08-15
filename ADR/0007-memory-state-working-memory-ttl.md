# ADR 0007: TTL-Bound Working Memory

- Status: Accepted — experiment
- Component: Memory & State

## Context
Scratchpad values help multi-step execution but can retain sensitive or stale data.

## Theoretical formulation
Choose TTL `t* = argmin_t E[L(stale)] + E[L(retention)] + C_ops(t)`. Initial prior is 30 minutes; shadow telemetry measures resume rate, stale-read rate, and token savings. `IG` is the reduction in execution uncertainty from retaining a value.

## Decision rules
Every `setWorkingMemory` write receives a TTL, default 1800 seconds, with a hard maximum defined by Governance. Expired values return null; clear is idempotent; values are encrypted and session-scoped.

## Consequences
Crash recovery improves within the window; long workflows must checkpoint durable state separately. Promotion is not automatic.
