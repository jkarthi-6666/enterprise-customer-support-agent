# ADR 0013: Provider-Neutral Tool Adapter with MCP Boundary

- Status: Accepted
- Component: Action & Tools

## Context
Tool calls must remain portable across models and reusable across agents.

## Theoretical formulation
Select interface `a*` maximizing `IG(reusable capability)` while minimizing `E[L(schema drift)] + C_adapter`. MCP is preferred for reusable tools; direct adapters are allowed for isolated integrations.

## Decision rules
Normalize provider calls into `ToolDefinition` and `ToolResult`; validate JSON-schema-like parameters before invocation. MCP hosts must expose identity, permissions, timeout, and version metadata.

## Consequences
Portability improves; adapters and protocol observability add implementation work.
