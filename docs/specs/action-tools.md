# Action & Tools Module LLD

Status: CONFIRMED baseline; registry discovery and asynchronous execution are bounded experiments.

## Boundary and trajectories

The module receives tool definitions, caller context, validated parameters, and authorization decisions. It returns `ToolResult` and verification evidence. It does not choose business policy, generate user-facing prose, or own runtime step budgets.

Trajectory A: registry snapshot → model/runtime tool selection → schema and permission validation → two-phase execution → side-effect verification → result. Trajectory B: slow integration → async job token → callback/poll → verification → durable result.

## Decisions

- Use a provider-neutral tool-call adapter and MCP for reusable integrations; direct adapters remain allowed for one-off systems. (ADR 0013)
- Registry is signed, versioned, and dynamically refreshable with a static safe snapshot fallback. (ADR 0014)
- Side-effecting calls require prepare/confirm semantics, idempotency keys, and post-call verification. (ADR 0015)

## Failure grid and mitigations

Known-knowns: schema errors and downstream failures → validation/retry classification. Known-unknowns: API latency and verification availability → async thresholds and compensating states. Unknown-knowns: “success” with wrong business effect → read-after-write verification. Unknown-unknowns: compromised tool metadata → signature checks, least privilege, emergency disable.

## DoD / handoff

Implement `IToolRegistry` and `IToolExecutor`; keep `ToolDefinition.isSideEffecting` authoritative for the confirmation path.
