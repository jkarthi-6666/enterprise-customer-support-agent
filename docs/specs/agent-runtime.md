# Agent Runtime Module LLD

Status: CONFIRMED baseline with experiments for model routing and high-stakes verification.

## Boundary and trajectories

The runtime receives `UserMessage`, retrieved `KnowledgeChunk[]`, guardrail results, and tool capabilities. It returns a response string plus auditable `AgentPlan` and `ToolResult[]`. It does not own channel transport, knowledge ingestion, policy definitions, or tool implementation.

Online trajectory: `UserMessage` → intent classification → context assembly → plan generation → bounded harness → tool/knowledge/human handoff → response. Recovery trajectory: persisted step checkpoint → idempotency check → resume or compensate → final response.

## Decisions

- Structured intent classification uses a hybrid taxonomy classifier with an LLM fallback. (ADR 0010)
- Static playbooks are the baseline planner; dynamic planning is an experiment behind the same `IPlanner`. (ADR 0011)
- Provider abstraction with cost/latency-aware routing and bounded durable execution is the model gateway baseline. (ADR 0012)

## Failure grid and mitigations

Known-knowns: malformed plans, model timeouts, duplicate tool calls → schema validation, budgets, idempotency. Known-unknowns: taxonomy coverage and routing thresholds → shadow evaluation. Unknown-knowns: confident but weakly grounded answers → confidence gates and context checks. Unknown-unknowns: emergent prompt/model behavior → replay corpus, canaries, kill switch.

## DoD / handoff

Implementations must satisfy `IAgentRuntime`, preserve `AgentIntent`/`AgentPlan` types, emit checkpointable step IDs, and expose deterministic replay inputs.
