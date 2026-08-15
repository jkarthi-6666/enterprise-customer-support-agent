# ADR 0020: Tenant-Scoped Semantic Prompt Cache

- Status: Accepted — experiment
- Component: Economics

## Context
Repeated stable prompts can reduce latency and token cost, but stale or cross-tenant reuse is unsafe.

## Theoretical formulation
Promote cache threshold `tau` when `P(answer_equivalence | similarity) >= tau` and `E[L(stale/cross-tenant hit)] < savings`. Shadow mode measures hit rate, faithfulness, freshness, and cost.

## Decision rules
Cache only deterministic, policy-approved prompt segments; namespace by tenant and model/prompt version, apply TTL and invalidation, encrypt entries, and bypass for personalized or side-effecting requests.

## Consequences
Lower spend and latency for eligible traffic; cache invalidation and semantic false-positive risk remain.
