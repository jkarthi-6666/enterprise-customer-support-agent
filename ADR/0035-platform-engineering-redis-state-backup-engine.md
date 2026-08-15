# ADR 0035: High-Availability Redis & State Backup Engine

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Platform Engineering Module
- **Relates To**: `src/contracts/IPlatformRuntime.ts`, [ADR 0005](0005-knowledge-versus-memory-architectural-boundary.md)

---

## 1. Context & Problem Statement

Session working memory and ephemeral conversation turns (ADR 0005) require sub-millisecond read/write latency with zero data loss during node failures.

Decision Rules:
1. **In-Memory Cache**: Deploy High-Availability Redis Cluster (Cluster Mode Enabled) with multi-node replication and automated failover.
2. **Durable Backup Engine**: Asynchronously snapshot active working memory sessions to durable PostgreSQL storage every 60 seconds (RPO < 60s, RTO < 5s).
3. **Encryption at Rest & Transit**: TLS 1.3 for in-transit Redis communication; AES-256 for snapshot persistence.

---

## 2. Consequences

- Guarantees sub-millisecond memory retrieval for live agent turns while protecting against infrastructure data loss.
