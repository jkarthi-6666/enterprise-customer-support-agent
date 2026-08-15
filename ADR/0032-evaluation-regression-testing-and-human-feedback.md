# ADR 0032: Automated Regression Test Suite & Continuous Human Feedback Loop

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Evaluation & Improvement Module
- **Relates To**: `src/contracts/IEvaluationEngine.ts`, [ADR 0016](0016-human-collaboration-durable-approval-queue.md)

---

## 1. Context & Problem Statement

Agent updates must not degrade performance on previously resolved edge cases or compliance trajectories.

We choose **Automated Regression Suite with Human Calibration Loop**:
1. **Golden Evaluation Dataset**: Maintain a curated dataset of 500+ multi-turn customer support trajectories with ground-truth resolutions.
2. **CI/CD Integration**: Run full regression test suite on every pull request using synthetic and historical test cases.
3. **Human Feedback Incorporation**: Human agent edits during live handoffs (ADR 0017) are tagged and automatically converted into new golden test cases.

---

## 2. Consequences

- Ensures zero regression on high-stakes customer support queries.
- Creates a self-healing evaluation pipeline that continuously learns from human supervisor interventions.
