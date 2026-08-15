# ADR 0012: Provider-Neutral Routing with Bounded Durable Execution

- Status: Accepted
- Component: Agent Runtime

## Context
Provider outages, model cost variance, and multi-step failures require abstraction and recovery.

## Theoretical formulation
For provider `m`, minimize `E[L_m] = p_error C_error + p_timeout C_timeout + cost_m`, subject to quality and latency SLOs. Route using measured priors; update them from evaluation telemetry.

## Decision rules
Use a model gateway adapter with timeout, retry, fallback, token, and step budgets. Persist checkpoints and use deterministic idempotency keys. High-risk plans require a verifier/guardrail pass.

## Consequences
Resilience and portability improve at the cost of gateway and checkpoint complexity.
