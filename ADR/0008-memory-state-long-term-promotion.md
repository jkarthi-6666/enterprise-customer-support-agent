# ADR 0008: Explicit Long-Term Memory Promotion

- Status: Accepted
- Component: Memory & State

## Context
Automatic extraction can turn guesses into persistent customer facts.

## Theoretical formulation
Promote fact `f` only when `P(f | explicit evidence) >= tau` and `E[L(false memory)] < E[L(omission)]`. Explicit preference/CRM evidence has the highest prior; model inference is an experiment, never the default.

## Decision rules
Persist explicit preferences and approved CRM facts with provenance, timestamp, consent, and confidence. Inferred facts remain ephemeral unless approved. Conflicts favor the authoritative CRM record and create an audit event.

## Consequences
Lower recall of implicit preferences buys safer personalization and explainability.
