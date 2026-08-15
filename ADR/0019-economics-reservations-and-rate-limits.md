# ADR 0019: Token Budget Reservation and Reconciliation

- Status: Accepted
- Component: Economics

## Context
Concurrent runs can overspend before usage is reported by providers.

## Theoretical formulation
Reserve budget `b` before execution and reconcile actual `u`; admit only when `E[u] + reserved <= quota`. Minimize `E[L(denied work)] + C_overrun` using tenant-tier policy.

## Decision rules
Track tenant/user/run budgets, reserve estimated tokens, reconcile provider usage, rate-limit concurrency, and degrade in order: cache → smaller model → shorter context → human escalation.

## Consequences
Spend predictability improves; estimates can cause conservative admission and require reconciliation repair.
