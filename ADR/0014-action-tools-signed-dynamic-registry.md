# ADR 0014: Signed Versioned Tool Registry

- Status: Accepted — experiment
- Component: Action & Tools

## Context
Dynamic discovery reduces deployment friction but expands the attack surface.

## Theoretical formulation
Accept registry snapshot `r` only if `P(authentic|signature,version) >= tau` and `E[L(rogue tool)]` is below policy threshold. Shadow discovery measures coverage and stale-definition rate.

## Decision rules
Maintain signed, versioned registry snapshots, allowlist capabilities, support rollback, and retain a last-known-good static snapshot. Registration is never sufficient for authorization.

## Consequences
Operational flexibility with signing, distribution, and rollback requirements.
