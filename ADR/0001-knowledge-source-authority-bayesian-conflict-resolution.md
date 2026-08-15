# ADR 0001: Probabilistic Knowledge Source Authority & Information-Theoretic Conflict Resolution

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Knowledge Module (Retrieval & Context Selection)

---

## 1. Context & Problem Statement

The Enterprise AI Customer Support Agent retrieves knowledge across heterogeneous, multi-system enterprise repositories:
1. **Canonical Product Documentation & API Specs**
2. **Internal Engineering Wiki / Confluence**
3. **Historical Resolved Support Tickets (Zendesk/Freshdesk/Jira)**
4. **Informal Real-time Communication (Slack/Discord channels)**

These knowledge sources exhibit varying degrees of noise, variance, temporal decay, and reliability. When two sources provide conflicting statements (e.g., an official API doc specifies a limit of 100 req/min, while a 6-month-old resolved support ticket suggests a limit of 500 req/min), the agent must:
- Deterministically and probabilistically choose the correct source for online generation.
- Quantify uncertainty and information gain.
- Ensure that lower-tier outdated knowledge is not silently ignored, but actively remediated.

---

## 2. Decision Framework & Theoretical Formulation

We adopt a **Probabilistic & Information-Theoretic Knowledge Selection Framework** built on three pillars:

### Pillar A: Bayesian Source Reliability $P(\text{Truth} \mid \text{Source}, \text{Evidence})$

Each knowledge source $S_i$ is assigned a prior reliability score $R(S_i) \in [0, 1]$ based on empirical noise and variance characteristics:

$$P(\text{Truth} \mid S_i) = \frac{P(S_i \mid \text{Truth}) \cdot P(\text{Truth})}{P(S_i)}$$

- **Tier 1 (Canonical Docs & API Specs)**: $R(S_1) \approx 0.99$ — Low noise ($\sigma^2 \to 0$), high consistency, authoritative governance. Expected error rate $\approx 1\%$.
- **Tier 2 (Confluence / Internal Wiki)**: $R(S_2) \approx 0.90$ — Moderate review cadence, structured.
- **Tier 3 (Resolved Support Tickets)**: $R(S_3) \approx 0.79$ — Contextually rich but subject to historical decay and analyst error. Expected error rate $\approx 15\%$.
- **Tier 4 (Slack / Discord / Community Chat)**: $R(S_4) \approx 0.50$ — High noise, unverified.

> **Enterprise Adaptability Parameter**: The prior weights $R(S_i)$ are configurable per enterprise tenant. If an organization has an AI-curated ticket system or unmaintained docs, $R(S_i)$ can be dynamically calibrated via human feedback loops.

---

### Pillar B: Information Gain ($IG$) & Entropy Reduction ($H$)

During context selection, candidate knowledge chunks $X$ are evaluated against the query $Y$ to maximize **Information Gain**:

$$IG(Y; X) = H(Y) - H(Y \mid X)$$

Where $H(Y)$ is the Shannon Entropy (uncertainty) of the answer distribution. The agent prioritizes sources that maximize $IG$ while minimizing downstream ambiguity/variance in agent output.

---

### Pillar C: Expected Cost of Error / Loss Minimization $\mathbb{E}[L]$

The expected cost of selecting source $S_i$ given decision outcome $\hat{y}$ is:

$$\mathbb{E}[L(S_i)] = P(\text{Error} \mid S_i) \cdot C_{\text{impact}}$$

Where $C_{\text{impact}}$ is the operational cost of hallucination or wrong guidance (e.g., misconfiguring a customer environment vs. minor formatting difference). High-authority sources drastically minimize expected operational cost.

---

## 3. Decision Rules & Conflict Resolution Algorithm

1. **Online Ranking & Selection**:
   - For retrieved candidate chunks $C = \{c_1, c_2, \dots, c_k\}$, score each chunk using:
     $$\text{Score}(c_i) = \alpha \cdot \text{Similarity}(c_i, Q) + \beta \cdot R(S(c_i)) + \gamma \cdot \text{Freshness}(c_i)$$
   - In the event of a direct contradiction between $c_i \in S_{\text{high}}$ and $c_j \in S_{\text{low}}$:
     - **Winner**: $c_i \in S_{\text{high}}$ is selected for the prompt context.

2. **Offline Knowledge Remediation Trigger (Closed-Loop Feedback)**:
   - When a high-confidence contradiction is detected ($| \text{Similarity}(c_i, c_j) | > \tau_{\text{conflict}}$ but $S(c_i) \neq S(c_j)$):
     - The system publishes a `KnowledgeConflictDetected` event containing:
       - `canonical_doc_id`: ID of winning document
       - `conflicting_doc_id`: ID of lower-tier document
       - `passage_diff`: Extracted semantic mismatch
       - `confidence_delta`: Delta between $P(\text{Truth} \mid S_i)$ and $P(\text{Truth} \mid S_j)$
     - **Action**: Triggers an automated remediation ticket (e.g. Jira / Zendesk doc update task) for knowledge base maintainers to update or deprecate stale lower-tier content.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- **Mathematically Grounded**: Avoids arbitrary heuristic picks by grounding decisions in Bayesian statistics and Information Theory.
- **Data Quality Self-Healing**: Continuous active logging of contradictions systematically cleans enterprise documentation over time.
- **Risk Control**: Minimizes expected operational loss in high-stakes customer support queries.

### Negative / Neutral Trade-offs
- Requires maintaining configurable source priors $R(S_i)$ per tenant.
- Requires asynchronous conflict logger event handler in the ingestion/ingest pipeline.

---

## 5. References
- Anthropic Research: *Information-Theoretic Foundations of Agent Reasoning & Context Selection*
- Shannon, C. E. (1948). *A Mathematical Theory of Communication*
- Bayesian Decision Theory & Risk Minimization in Multi-Agent Systems
