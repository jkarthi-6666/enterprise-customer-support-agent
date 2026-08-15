# ADR 0034: Kubernetes Infrastructure & Auto-scaling Strategy

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Platform Engineering Module
- **Relates To**: `src/contracts/IPlatformRuntime.ts`, [ADR 0002](0002-retrieval-engine-managed-rag-platform.md)

---

## 1. Context & Problem Statement

The enterprise support agent must maintain 99.95% availability with dynamic horizontal scaling during high-traffic support surges (e.g. product launch or service outage).

Decision Rules:
1. **Container Orchestration**: Deploy agent microservices (Interaction Gateway, Agent Runtime, Tool Executors) as stateless Docker containers on Kubernetes (EKS / GKE / AKS).
2. **Horizontal Pod Autoscaler (HPA)**: Scale pods based on active WebSocket connections and pending queue depth ($T_{\text{target\_cpu}} = 70\%$, $T_{\text{queue\_depth}} = 50$).
3. **Multi-AZ Resilience**: Distribute pod replicas across 3 Availability Zones with automated health checks and failover routing.

---

## 2. Consequences

- Ensures enterprise-grade uptime, high availability, and elastic capacity during traffic spikes.
