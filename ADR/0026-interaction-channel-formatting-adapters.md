# ADR 0026: Strategy-Pattern Channel Formatting Adapters

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Interaction & Channel Gateway (Communication Channels / Response Delivery)
- **Relates To**: [ADR 0025](0025-interaction-unified-channel-gateway.md), `IChannelAdapter`

---

## 1. Context & Problem Statement

Each `ChannelType` has incompatible presentation constraints: SMS length and GSM charset, email subject/threading, Slack blocks, voice SSML and barge timing, web markdown. Putting format logic in Runtime couples the brain to transport.

The fork is:
1. **Runtime emits native payloads** per channel.
2. **One generic renderer** with if/else on `channel`.
3. **`IChannelAdapter` strategy** per channel, selected by factory.

---

## 2. Theoretical Formulation

Formatting is $g_c: \text{normalizedText} \times \text{metadata} \to m_c$.

### Pillar A: Prior that presentation is not reasoning

$$P(\text{correct action} \mid \text{plan}) \perp g_c$$

The plan should not change because the user is on SMS. Adapters may *truncate or split* but must not invent facts.

### Pillar B: Information Gain of channel constraints

$$IG(\text{deliverability}; g_c) = H(\text{send failure}) - H(\text{send failure} \mid \text{length, charset, thread-id})$$

Adapters exist to maximize this $IG$ (messages that actually send and thread).

### Pillar C: Expected Loss

$$\mathbb{E}[L] = P(\text{unsendable})\, C_{\text{drop}} + P(\text{hallucinated rewrite})\, C_{\text{fidelity}} + C_{\text{code-dup}}$$

Runtime-owned formatting maximizes $C_{\text{code-dup}}$ and $C_{\text{fidelity}}$ risk. A monolith renderer maximizes coupling. Strategies isolate $g_c$ and keep Runtime text canonical.

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: `IChannelAdapter` strategies**.

1. **Interface**: `normalizeInbound` / `formatOutbound` only. No Knowledge or Tools imports.
2. **Baseline adapters**: `WebChatAdapter`, `EmailAdapter` (RFC 5322 thread headers), `SmsAdapter` (160/70-char segments, no silent truncation of legal text — split or link-out), `VoiceAdapter` (SSML wrap, max utterance), `SlackAdapter` (mrkdwn / blocks).
3. **Fidelity rule**: outbound text after ADR 0021 output rails is the source of truth. Adapters may add channel chrome, not new claims.
4. **Inbound rule**: strip channel chrome; preserve attachments as metadata references, not as un-scanned blobs into the prompt.
5. **Extensibility**: new `ChannelType` = new adapter + registry entry; gateway and runtime stay unchanged.
6. **Failure**: format errors surface as delivery failures to Observability, not as a new agent turn.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Clean Strategy Pattern consistent with ADR 0004.
- Channel constraints become testable without the LLM.
- Prevents SMS/voice from leaking unformatted markdown or vault tokens.

### Negative / Neutral Trade-offs
- Rich media (images, voice recordings) needs a future attachment store — not owned here (OPEN).
- Legal-required full text on SMS may require a hosted link (Platform).

---

## 5. References
- ADR 0025, ADR 0027, ADR 0004 (strategy precedent)
- `IChannelAdapter`
