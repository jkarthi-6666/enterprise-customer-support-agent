# ADR 0036: Reproducible Infrastructure-as-Code & CI/CD Deployment Pipelines

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Platform Engineering Module
- **Relates To**: `src/contracts/IPlatformRuntime.ts`, [ADR 0034](0034-platform-engineering-kubernetes-infrastructure.md)

---

## 1. Context & Problem Statement

Environment configuration drift between Staging and Production can cause subtle multi-agent execution failures.

Decision Rules:
1. **Infrastructure as Code (IaC)**: Declare all cloud resources (Kubernetes clusters, Redis, VPCs, IAM roles) via Terraform / Helm charts.
2. **GitOps Deployment Pipeline**: Deploy application containers via ArgoCD git-driven pipeline. Every environment state is declaratively tracked in Git.
3. **Immutable Artifacts**: Image tags locked to Git commit SHA hashes (`sha-904831c`). Zero mutating `latest` tags allowed in production.

---

## 2. Consequences

- 100% reproducible deployment pipelines with zero configuration drift and instant rollback capabilities.
