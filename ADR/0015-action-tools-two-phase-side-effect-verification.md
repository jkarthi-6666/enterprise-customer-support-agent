# ADR 0015: Two-Phase Side-Effect Execution

- Status: Accepted
- Component: Action & Tools

## Context
A transport-level success can still produce the wrong business effect.

## Theoretical formulation
For side effect `x`, execute only when `E[L(unconfirmed effect)] > C_verify`. Expected loss is reduced by prepare/confirm, idempotency, and read-after-write verification.

## Decision rules
Classify tools using `isSideEffecting`; require authorization, idempotency key, prepare/confirm where supported, and `validateSideEffect` after execution. Unknown verification becomes `success: false` with remediation state.

## Consequences
Safer actions and more latency/API calls for high-impact operations.
