# Harnessed Implementation Loop Specification (Phase 2)

**Version**: 1.0  
**Target Architecture**: Enterprise AI Customer Support Agent  
**Prerequisites**: Low-Level Design Complete (ADRs 0001–0006) & Blueprint Contracts (`src/contracts/`)

---

## 1. Executive Implementation Protocol

Any autonomous agent or software engineer implementing production code for the 12 capability modules must follow this 6-step evaluatory implementation protocol.

```
REPEAT for each assigned component module (e.g. src/modules/knowledge/):

  STEP 1: CONTRACT & ADR BINDING
  - Import the capability interface from `src/contracts/<IComponent>.ts`.
  - Read all relevant ADRs in `ADR/` for this component.
  - Enforce all decision rules, data residency constraints, and failure mitigations.

  STEP 2: MODULAR SERVICE IMPLEMENTATION
  - Write clean TypeScript service classes in `src/modules/<component>/`.
  - Implement Strategy Pattern abstractions (e.g. `IChunkingStrategy`, `IEmbeddingProvider`).
  - Zero hardcoded secrets; use environment configuration (`process.env`).

  STEP 3: MOCK EXTERNAL PROVIDERS & ZERO-COST OFFLINE STUBS
  - Provide mock provider adapters (Mock Managed RAG, Mock Redis, Mock LiteLLM) in `src/mocks/`.
  - Ensure all unit tests can run offline without external cloud API dependencies.

  STEP 4: AUTOMATED UNIT & INTEGRATION TEST SUITE
  - Write test files in `tests/<component>.test.ts`.
  - Test both nominal trajectories and failure modes (e.g. timeout, rate limits, PII sanitization).
  - Run typecheck and test runner (`npx tsc --noEmit` and test command).

  STEP 5: TELEMETRY & GOVERNANCE INSTRUMENTATION
  - Instrument OpenTelemetry traces for key method entries/exits (ADR 0018).
  - Pass all output text through `IGovernanceGuardrail` (ADR 0021).

  STEP 6: GIT COMMIT & GITHUB PR
  - Run build verification (`npm run build` in `whiteboard/` and root `tsc --noEmit`).
  - Commit and push to GitHub (`git add . && git commit -m "feat(<component>): implement production service and unit tests"`).
```
