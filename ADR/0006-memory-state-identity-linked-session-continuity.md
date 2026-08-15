# ADR 0006: Identity-Linked Session Continuity

- Status: Accepted
- Component: Memory & State

## Context
Channel identifiers change during web/email/voice handoff, but the support relationship should remain coherent.

## Theoretical formulation
For candidate state key `k`, select `k* = argmax P(identity | evidence) - E[L(leakage)]`. Identity evidence is explicit authentication first, verified channel linkage second; ambiguous linkage is rejected. Information gain from linking is `IG = H(state) - H(state | identity)`, bounded by the privacy loss of a mistaken merge.

## Decision rules
Use canonical `userId` plus `sessionId` as the primary key; store channel IDs as aliases. Require verified identity evidence for cross-channel reads, isolate tenants, version turns, and use idempotency keys on appends.

## Consequences
Continuity improves, while identity-resolution and merge-review infrastructure are required. Cross-channel state is never inferred from name similarity alone.

## Links
`IMemoryStateStore.ts`; ADR 0005.
