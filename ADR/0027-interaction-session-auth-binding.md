# ADR 0027: Channel-Agnostic Session Binding after Authentication Context

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Interaction & Channel Gateway (Session / Authentication Context)
- **Relates To**: [ADR 0005](0005-knowledge-versus-memory-architectural-boundary.md), [ADR 0025](0025-interaction-unified-channel-gateway.md)

---

## 1. Context & Problem Statement

The same customer may arrive on web, email, and SMS. Memory & State keys conversation history on `sessionId` / `userId`, not on raw channel IDs. Interaction must bind a channel identity to those keys without becoming the profile store.

The fork is:
1. **Channel ID is the session** — fragments history across channels.
2. **Gateway owns the identity graph** — duplicates Memory.
3. **Gateway resolves, Memory stores** — Interaction calls `resolveSession(channel, channelIdentity)` then Memory owns turns (ADR 0005).

This decision is **CONFIRMED – conditional** on Memory treating identity-linked conversation state as the continuity key.

---

## 2. Theoretical Formulation

Let $i_c$ be a channel-scoped identifier and $u$ the enterprise user id.

### Pillar A: Prior that $u$ is the continuity variable

$$P(\text{correct context} \mid u) > P(\text{correct context} \mid i_c)$$

because $i_c$ is an alias with high churn (new phone, new Slack workspace).

### Pillar B: Information Gain of auth context

$$IG(u; \text{auth}) = H(u) - H(u \mid \text{token, verified email, verified phone})$$

Unverified $i_c \mapsto u$ maps have low $IG$ and must not merge sessions.

### Pillar C: Expected Loss

$$\mathbb{E}[L] = P(\text{wrong merge})\, C_{\text{privacy}} + P(\text{no merge})\, C_{\text{repeat}} + C_{\text{store-dup}}$$

Wrong merge is a COPC auto-fail (PII/cross-account). Therefore low-confidence binds create a *new* anonymous session and prompt step-up auth rather than merge.

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: Gateway resolves, Memory stores**.

1. **`resolveSession`**: returns `{ sessionId, userId }`. Anonymous users get an ephemeral `userId` scoped to the device/channel until step-up.
2. **Merge rule**: only bind $i_c \to u$ when auth strength meets tenant policy (evaluated via ADR 0023). Soft identifiers (typed email in chat) never merge.
3. **Session lifecycle**: Interaction mints transport resume tokens; Memory owns turn append/read. Clearing a web socket does not delete history.
4. **Auth context** travels on `ChannelEnvelope.authContext` (scheme, strength, expiry) into Governance ABAC attributes.
5. **Not owned**: password/IdP implementation, CRM golden-record, long-term preference curation.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Preserves ADR 0005 mutability boundary.
- Prevents cross-account transcript merge — the dominant privacy loss mode.
- Gives policy a real `auth.strength` attribute for side-effecting tools.

### Negative / Neutral Trade-offs
- Cross-channel continuity requires explicit verification (friction accepted).
- Identity-confidence threshold is tenant policy (OPEN numeric value).

---

## 5. References
- ADR 0005, ADR 0023, ADR 0025
- ISO 18295 authentication / privacy requirements
