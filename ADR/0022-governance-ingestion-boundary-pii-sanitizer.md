# ADR 0022: Two-Tier Ingestion-Boundary PII Sanitizer

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Governance & Safety Module (Privacy / Data Protection)
- **Relates To**: [ADR 0002](0002-retrieval-engine-managed-rag-platform.md), [ADR 0005](0005-knowledge-versus-memory-architectural-boundary.md), [ADR 0021](0021-governance-input-output-guardrail-cascade.md)

---

## 1. Context & Problem Statement

ADR 0002 requires PII redaction at the Knowledge ingestion boundary before payloads reach the Managed RAG platform. Support traffic also contains operational identifiers (order IDs, emails, phone numbers) that Action & Tools must use to fulfill requests.

The fork is:
1. **Irreversible redaction everywhere** — maximize $C_{\text{compliance}}$ reduction; break fulfillment.
2. **Pass-through with VPC trust** — minimize friction; maximize breach $\mathbb{E}[L]$.
3. **Two-tier sanitizer** — irreversible redaction for Knowledge index documents; reversible vault tokens for live Interaction / Memory / Tools paths.

`IGovernanceGuardrail.sanitizeIngestionPayload` is the Knowledge-tier entry point. Live-path tokenization is a sibling method used by Interaction and Memory, not a Knowledge write.

---

## 2. Theoretical Formulation

Let $e$ be a detected entity span and $D$ the destination store.

### Pillar A: Destination-conditioned posterior

$$P(\text{breach} \mid D, e) \propto P(\text{retention} \mid D)\, P(\text{exfil} \mid D)$$

Managed RAG indices have long retention and broad retrieval fan-out, so $P(\text{breach} \mid D_{\mathcal{K}}, e)$ is high even if $e$ is only mildly sensitive. Session Memory (ADR 0005) is short-lived and user-scoped, so operational tokens can be reversible under vault control.

### Pillar B: Information Gain of detection

A hybrid detector (deterministic patterns + NER) is retained because

$$IG(Y_{\text{PII}}; \text{regex} \cup \text{NER}) > IG(Y_{\text{PII}}; \text{regex})$$

for names, addresses, and free-text account numbers that regexes miss.

### Pillar C: Expected Loss

$$\mathbb{E}[L] = P(\text{missed PII})\, C_{\text{regulatory}} + P(\text{over-redact})\, C_{\text{unresolved}} + C_{\text{ops}}$$

Option 1 drives $C_{\text{unresolved}}$ (cannot look up the order). Option 2 drives $C_{\text{regulatory}}$ (GDPR/PCI/HIPAA auto-fail). Option 3 minimizes the sum by making the transform destination-aware.

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: Two-tier sanitizer**.

1. **Knowledge tier (irreversible)**: `sanitizeIngestionPayload` replaces detected PII with typed placeholders (`[EMAIL]`, `[PHONE]`, `[ACCOUNT]`) before ADR 0003 nightly crawl hands documents to the Managed RAG client. No vault mapping is stored for this tier.
2. **Operational tier (reversible)**: Interaction and Memory receive vault tokens (`{{pii:email:v1:...}}`). Only Action & Tools with an `allow` policy decision (ADR 0023) may detokenize, and only for the attributes the policy names.
3. **Detector order**: deterministic regex/Luhn/IBAN first; NER second; classifier third if residual entropy remains.
4. **Never index operational tokens into Knowledge** (ADR 0005 invariant $\partial \mathcal{K}/\partial t_{\text{turn}} = 0$ and no session PII in $\mathcal{K}$).
5. **Output rail** (ADR 0021) re-runs the Knowledge-tier detector on user-visible text so vault tokens never leak to a channel.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Satisfies ADR 0002 ingestion-boundary compliance without disabling fulfillment tools.
- Preserves the Knowledge vs Memory boundary (ADR 0005).
- Gives Observability a redaction point before traces are exported.

### Negative / Neutral Trade-offs
- Vault availability becomes a runtime dependency for detokenization (mitigated by fail-closed + Platform HA, ADR 0035).
- Exact per-jurisdiction entity catalog remains tenant policy (OPEN).

---

## 5. References
- ADR 0002, ADR 0005, ADR 0021, ADR 0023
- GDPR Art. 5/32; PCI-DSS; ISO 18295 data-privacy requirements
