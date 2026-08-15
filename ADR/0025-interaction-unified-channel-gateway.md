# ADR 0025: Unified Channel Gateway with Protocol-Normalized Envelope

- **Status**: Accepted
- **Date**: 2026-08-15
- **Deciders**: Architecture Team & Lead Engineer
- **Component**: Interaction & Channel Gateway (Conversation Gateway)
- **Relates To**: `src/contracts/IInteractionGateway.ts`, `ChannelType` in `src/types/domain.ts`

---

## 1. Context & Problem Statement

The agent must serve `web_chat`, `email`, `sms`, `voice`, and `slack` without forking the runtime per channel. Transport realities differ (WebSocket vs REST, push vs pull, sync vs async), but Agent Runtime consumes a single `UserMessage`.

The fork is:
1. **Per-channel runtimes** — five stacks, five bugs.
2. **One HTTP API only** — force all channels through polling/webhooks; degrade voice/web latency.
3. **Unified gateway** — REST + WebSocket multiplex into a `ChannelEnvelope`, then a `UserMessage`.

Interaction owns transport, normalization, and delivery. It does not classify intent, retrieve knowledge, or authorize tools.

---

## 2. Theoretical Formulation

Let $c$ be a channel and $m_c$ its native payload. The gateway is a pair of maps

$$f_{\text{in}}: m_c \mapsto \text{ChannelEnvelope}, \quad f_{\text{out}}: \text{ChannelEnvelope} \mapsto m_c$$

### Pillar A: Prior that runtime should be channel-blind

$$P(\text{correct plan} \mid \text{normalized } x) \ge P(\text{correct plan} \mid m_c)$$

because channel chrome (Slack blocks, MIME, SSML) is noise to intent. The prior favors a single runtime.

### Pillar B: Information Gain of a shared envelope

$$IG(Y_{\text{runtime}}; \text{envelope}) = H(Y) - H(Y \mid \text{sessionId}, \text{userId}, \text{normalizedText}, \text{channel})$$

Channel is retained as a feature (tone, length) but not as a control-flow fork inside Runtime.

### Pillar C: Expected Loss

$$\mathbb{E}[L] = C_{\text{dup-stacks}} + C_{\text{latency}}(c) + C_{\text{drop}}$$

Per-channel runtimes explode $C_{\text{dup-stacks}}$. HTTP-only raises $C_{\text{latency}}$ for voice/web and $C_{\text{drop}}$ under webhook retry storms. A multiplexed gateway keeps one runtime and matches transport to channel class.

---

## 3. Decision Rules & Implementation Specifications

We choose **Option 3: Unified gateway**.

1. **Realtime class** (`web_chat`, `voice`, `slack` interactive): WebSocket (or equivalent bidirectional stream) with heartbeat and resume tokens.
2. **Async class** (`email`, `sms`, inbound Slack events): REST/webhook ingress with idempotency keys on `envelopeId`.
3. **Envelope**: `ChannelEnvelope` is the only object adapters emit. Gateway maps it to `UserMessage` after session bind (ADR 0027) and after input rails (ADR 0021).
4. **Egress**: Runtime returns text; Interaction wraps a outbound `ChannelEnvelope` and asks the adapter to format. Governance output rails run *before* format/deliver.
5. **Backpressure**: per-tenant ingress rate limits; overflow is 429 / retry-after, not silent drop.
6. **Not owned**: transcript persistence (Memory), auth identity store, voice STT/TTS model training.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- One request trajectory from channel to orchestrator skeleton.
- Adapters become the only channel-specific code (ADR 0026).
- Idempotent async ingress prevents duplicate agent turns.

### Negative / Neutral Trade-offs
- Gateway is a critical HA dependency (Platform ADR 0034).
- Voice barge-in / interrupt semantics remain OPEN.

---

## 5. References
- `ChannelType`, `UserMessage`, `IInteractionGateway`
- ADR 0021 (rails wrap ingest/deliver), ADR 0026, ADR 0027
