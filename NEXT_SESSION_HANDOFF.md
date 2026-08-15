# Next Session Teammate Handoff & AI Execution Prompt

This document provides the complete handoff instructions and copy-paste prompt for the incoming teammate and their AI agent to clone the repository, acquire full context efficiently, and commence Phase 2 (Implementation).

---

## Copy-Paste Handoff Prompt for Next Teammate / AI Agent

```markdown
You are an expert Lead Software Engineer initializing Phase 2 (Production Code Implementation) for the Enterprise AI Customer Support Agent project.

### 1. Repository Setup & Context Acquisition
1. **Clone Repository**:
   `git clone https://github.com/jkarthi-6666/enterprise-customer-support-agent.git`
   `cd enterprise-customer-support-agent`

2. **Efficient Context Acquisition Order** (Read these files first to gain 100% context):
   - `ROADMAP.md`: Read the 12 Jira Epics, Topological Phases, and Sprint Assignments.
   - `HARNESSED_LOOP.md`: Read the 12-step LLD Protocol and Knowledge Benchmark Telemetry.
   - `checkpoint.md`: Read the complete log of all 22 confirmed architectural decisions.
   - `ADR/`: Browse the 36 neutral Architecture Decision Records (`ADR/0001` through `ADR/0036`).
   - `src/contracts/`: Inspect the compiled TypeScript interfaces for all 12 capabilities.
   - `src/pipeline/AgentOrchestratorSkeleton.ts`: Inspect the master single-request orchestrator skeleton.

3. **Verify Canvas & Codebase**:
   - Run `npm install` and `npm run dev` in `whiteboard/` to view the TLDraw architecture board at `http://localhost:5173`.
   - Run `./whiteboard/node_modules/typescript/bin/tsc --noEmit` to verify 0 TypeScript compilation errors.

---

### 2. Implementation Protocol & Phase 2 Instructions
Follow `IMPLEMENTATION_LOOP.md` to begin implementing production service code in `src/modules/`:

1. **Pick Target Component**: Refer to `ROADMAP.md` Phase 1 / Sprint 1 (e.g. `Knowledge Module` in `src/modules/knowledge/` or `Memory & State Store` in `src/modules/memory/`).
2. **Implement Contracts**: Bind to the TypeScript interfaces in `src/contracts/` (e.g. `IKnowledgeEngine.ts`, `IMemoryStateStore.ts`).
3. **Enforce ADR Rules**: Strictly follow decision rules from the respective ADRs (`ADR/0001` to `ADR/0036`).
4. **Write Unit Tests**: Add test suites in `tests/` covering both happy paths and error handling.
5. **Verify & Push**: Run typecheck (`tsc --noEmit`), commit, and push changes to GitHub (`git add . && git commit -m "feat(<component>): implement production service"`).
```
