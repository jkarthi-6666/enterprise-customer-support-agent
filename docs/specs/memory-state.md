# Memory & State Module LLD

Status: CONFIRMED for the baseline; retention and promotion thresholds remain configurable policy inputs.

## Boundary and trajectories

The module receives an authenticated `sessionId`, `userId`, channel-normalized turns, and runtime scratchpad mutations. It returns ordered `SessionTurn[]`, a `UserProfileMemory`, and typed working-memory values through `IMemoryStateStore`. It does not retrieve global knowledge, classify intent, authorize tools, or decide customer policy.

Trajectory A (online): channel adapter → identity resolver → conversation history read → runtime → append user/agent turns. Trajectory B (memory curation): explicit user preference or approved CRM update → validation → profile store → audit/expiry worker.

## Decisions

- Identity-linked conversation state is the continuity key; raw channel IDs are aliases. (ADR 0006)
- Working memory is run-scoped, externalized, and TTL-bound; 30 minutes is the baseline experiment. (ADR 0007)
- Long-term memory promotion is explicit-preference/CRM-driven; inferred facts require approval. (ADR 0008)
- Runtime checkpoints are durable and idempotent; retention/purge policy is delegated to Governance. (ADR 0009)

## Failure grid and mitigations

Known-knowns: stale sessions and duplicate turns → versioned append/idempotency keys. Known-unknowns: ideal TTL and cross-channel identity confidence → shadow metrics and configurable thresholds. Unknown-knowns: a user may revoke consent after promotion → tombstone propagation and audit trail. Unknown-unknowns: profile drift across systems → reconciliation alarms and manual review.

## DoD / handoff

All sub-components have status tags; A/B trajectories and ownership boundaries are explicit; ADRs 0006–0009 define the contract; implementation must preserve the generic methods in `src/contracts/IMemoryStateStore.ts`.
