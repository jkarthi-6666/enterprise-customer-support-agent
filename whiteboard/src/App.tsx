import { Tldraw, Editor, createShapeId, toRichText, type TLShapeId } from 'tldraw'
import 'tldraw/tldraw.css'

// ---------------------------------------------------------------------------
// Data model: the 12 capability abstractions + entry point, laid out as a
// single-request flow (top -> bottom) with three cross-cutting bands
// (Governance & Safety, Observability either side; Economics + Platform
// Engineering underneath). Solid numbered arrows trace one user request.
// Dashed arrows are cross-cutting / feedback relationships.
// ---------------------------------------------------------------------------

const TITLE_H = 46
const PAD = 18
const LINE_H = 26

type NodeDef = {
  id: string
  x: number
  y: number
  w: number
  h: number
  title: string
  subs: string[]
  list: 'vertical' | 'horizontal'
}

const nodes: NodeDef[] = [
  {
    id: 'user',
    x: 1350,
    y: 40,
    w: 340,
    h: 90,
    title: 'User / Channel',
    subs: [],
    list: 'vertical',
  },
  {
    id: 'interaction',
    x: 1280,
    y: 280,
    w: 480,
    h: 220,
    title: '1 · Interaction',
    subs: [
      'Communication Channels',
      'Conversation Gateway',
      'Session',
      'Authentication Context',
      'Response Delivery',
    ],
    list: 'vertical',
  },
  {
    id: 'runtime',
    x: 1240,
    y: 600,
    w: 560,
    h: 320,
    title: '2 · Agent Runtime',
    subs: [
      'Intent Understanding',
      'Planning',
      'Context Engineering',
      'Prompt Engineering',
      'Model Management',
      'Agent Harness',
      'Decision Making',
      'Execution Control',
      'Reliability',
    ],
    list: 'vertical',
  },
  {
    id: 'knowledge',
    x: 200,
    y: 1120,
    w: 480,
    h: 270,
    title: '3 · Knowledge',
    subs: [
      'Knowledge Sources',
      'Ingestion',
      'Representation',
      'Retrieval',
      'Ranking',
      'Context Selection',
      'Knowledge Lifecycle',
    ],
    list: 'vertical',
  },
  {
    id: 'memory',
    x: 740,
    y: 1120,
    w: 480,
    h: 270,
    title: '4 · Memory & State',
    subs: [
      'Conversation State',
      'Working Memory',
      'Long-Term Memory',
      'User Memory',
      'Organizational Memory',
      'Agent State',
      'Memory Lifecycle',
    ],
    list: 'vertical',
  },
  {
    id: 'action',
    x: 1280,
    y: 1120,
    w: 480,
    h: 270,
    title: '5 · Action & Tools',
    subs: [
      'Tool Calling',
      'Tool Registry',
      'MCP',
      'API Integrations',
      'Tool Validation',
      'Tool Permissions',
      'Action Execution',
    ],
    list: 'vertical',
  },
  {
    id: 'coordination',
    x: 1820,
    y: 1120,
    w: 480,
    h: 240,
    title: '6 · Agent Coordination',
    subs: [
      'Agent Routing',
      'Delegation',
      'A2A',
      'Multi-Agent Execution',
      'Agent Discovery',
      'Coordination Protocols',
    ],
    list: 'vertical',
  },
  {
    id: 'human',
    x: 2360,
    y: 1120,
    w: 480,
    h: 240,
    title: '7 · Human Collaboration',
    subs: [
      'Human-in-the-Loop',
      'Approval',
      'Escalation',
      'Human Takeover',
      'Human Feedback',
      'Human-Agent Collaboration',
    ],
    list: 'vertical',
  },
  {
    id: 'economics',
    x: 200,
    y: 1490,
    w: 2640,
    h: 110,
    title: 'Economics  (cost tracking — applies across all components)',
    subs: [
      'Token Management · Cost Management · Model Routing · Caching · Resource Optimization · Cost / Outcome Measurement',
    ],
    list: 'horizontal',
  },
  {
    id: 'evaluation',
    x: 2300,
    y: 1680,
    w: 520,
    h: 270,
    title: 'Evaluation & Improvement',
    subs: [
      'Evaluation',
      'Quality Measurement',
      'Feedback',
      'Failure Analysis',
      'Regression',
      'Experimentation',
      'Improvement',
    ],
    list: 'vertical',
  },
  {
    id: 'platform',
    x: -400,
    y: 2050,
    w: 3620,
    h: 170,
    title: 'Platform Engineering  (underlies every component above)',
    subs: [
      'Scalability · Reliability · Availability · Fault Tolerance · Reproducibility · Versioning · Deployment · Configuration · Performance',
    ],
    list: 'horizontal',
  },
  {
    id: 'governance',
    x: -400,
    y: 240,
    w: 320,
    h: 1750,
    title: 'Governance & Safety',
    subs: [
      '(applies across',
      'all components)',
      '',
      'Security',
      'Authorization',
      'Guardrails',
      'Policies',
      'Privacy',
      'Data Protection',
      'AI Safety',
      'Compliance',
    ],
    list: 'vertical',
  },
  {
    id: 'observability',
    x: 2900,
    y: 240,
    w: 320,
    h: 1750,
    title: 'Observability',
    subs: [
      '(applies across',
      'all components)',
      '',
      'Logs',
      'Metrics',
      'Traces',
      'Agent Execution',
      'Tool Execution',
      'Retrieval',
      'Model Usage',
      'Business Outcomes',
    ],
    list: 'vertical',
  },
]

type ArrowDef = {
  from: { x: number; y: number }
  to: { x: number; y: number }
  label: string
  dashed?: boolean
  bend?: number
  labelPosition?: number
}

const arrows: ArrowDef[] = [
  // ---- single request trace (solid, numbered) ----
  // two lanes so the down (request) and up (response) arrows never share a label
  { from: { x: 1400, y: 130 }, to: { x: 1400, y: 280 }, label: '1  request' },
  { from: { x: 1400, y: 500 }, to: { x: 1400, y: 600 }, label: '2  parsed intent' },
  { from: { x: 1520, y: 920 }, to: { x: 440, y: 1120 }, label: '3  retrieve' },
  { from: { x: 1520, y: 920 }, to: { x: 980, y: 1120 }, label: '4  read / write state' },
  { from: { x: 1520, y: 920 }, to: { x: 1520, y: 1120 }, label: '5  invoke tool' },
  { from: { x: 1520, y: 920 }, to: { x: 2060, y: 1120 }, label: '6  delegate (if needed)' },
  { from: { x: 1520, y: 920 }, to: { x: 2600, y: 1120 }, label: '7  escalate (if needed)' },
  { from: { x: 1640, y: 600 }, to: { x: 1640, y: 500 }, label: '8  response' },
  { from: { x: 1640, y: 280 }, to: { x: 1640, y: 130 }, label: '9  reply' },

  // ---- cross-cutting / feedback (dashed) ----
  { from: { x: -80, y: 1115 }, to: { x: 1240, y: 760 }, label: 'guardrail & policy checks', dashed: true },
  { from: { x: 2900, y: 1115 }, to: { x: 2820, y: 1815 }, label: 'telemetry', dashed: true },
  // routed through the clean gap between Agent Coordination and Human Collaboration
  // (x=2330) so it never crosses a box interior, then approaches Agent Runtime
  // from above Row D entirely.
  { from: { x: 2330, y: 1680 }, to: { x: 2330, y: 1090 }, label: 'improvement feedback (async)', dashed: true },
  { from: { x: 2330, y: 1090 }, to: { x: 1800, y: 760 }, label: '', dashed: true },
  { from: { x: 1250, y: 1490 }, to: { x: 1250, y: 920 }, label: 'cost tracking', dashed: true, labelPosition: 0.08 },
  { from: { x: 1520, y: 2050 }, to: { x: 1520, y: 1600 }, label: 'runs on', dashed: true },
]

// ---------------------------------------------------------------------------
// Failure-mode analysis, added as its own section beneath the architecture —
// existing boxes/arrows above are untouched. Same known/unknown 2x2 the user
// uses when scoping a prompt, applied here to the 12 capabilities and the
// numbered request trajectory. No fixes proposed — inventory only.
// ---------------------------------------------------------------------------

type Quadrant = {
  id: string
  x: number
  y: number
  w: number
  h: number
  title: string
  subtitle: string
  items: string[]
  invert?: boolean
}

const FM_GRID_Y = 2460
const FM_COL_W = 1790
const FM_COL_GAP = 40
const FM_ROW_H = 560
const FM_ROW_GAP = 40
const FM_COL1_X = -400
const FM_COL2_X = FM_COL1_X + FM_COL_W + FM_COL_GAP

const quadrants: Quadrant[] = [
  {
    id: 'known-knowns',
    x: FM_COL1_X,
    y: FM_GRID_Y,
    w: FM_COL_W,
    h: FM_ROW_H,
    title: 'Known Knowns',
    subtitle: 'documented failure classes — already expected, not yet fixed',
    items: [
      '[Interaction] Channel formatting breaks (markdown fails over SMS / voice)',
      '[Agent Runtime] Hallucinated fact not grounded in retrieved context',
      '[Agent Runtime] Misclassified intent on ambiguous phrasing',
      '[Knowledge] Stale document served after a policy change',
      '[Memory & State] Context lost across a channel handoff (chat → email)',
      '[Action & Tools] Tool timeout / downstream API failure',
      '[Action & Tools] Wrong tool selected for the parsed intent',
      '[Governance & Safety] PII surfaces in logs or in the response text',
      '[Economics] Runaway token spend from repeated tool retries',
      '[Trajectory T5] Guardrail over-blocks a legitimate authorized request',
    ],
  },
  {
    id: 'known-unknowns',
    x: FM_COL2_X,
    y: FM_GRID_Y,
    w: FM_COL_W,
    h: FM_ROW_H,
    title: 'Known Unknowns',
    subtitle: 'open questions we know we haven’t answered yet',
    items: [
      '[Agent Runtime / T4] What $ threshold actually forces human escalation?',
      '[Governance & Safety] "Authorized" cross-account access — taxonomy undefined',
      '[Knowledge] No staleness / expiry mechanism defined — do docs live forever?',
      '[Memory & State] TTL for Working Memory — when is it discarded?',
      '[Agent Coordination] No conflict rule when two sub-agents write conflicting state',
      '[Evaluation & Improvement] No real baseline error rate — Observability isn’t live yet',
      '[Economics] No real cost-per-resolution baseline to compare against',
      '[Human Collaboration] Human reviewer SLA — undefined (minutes? hours?)',
      '[Trajectory T6] How many retries count as "bounded" before escalating instead?',
    ],
  },
  {
    id: 'unknown-knowns',
    x: FM_COL1_X,
    y: FM_GRID_Y + FM_ROW_H + FM_ROW_GAP,
    w: FM_COL_W,
    h: FM_ROW_H,
    title: 'Unknown Knowns',
    subtitle: 'tacit — obvious the moment you see it, never written down',
    items: [
      '[Interaction] User code-switches languages mid-conversation, unnoticed',
      '[Agent Runtime] Confident tone masking a thin / low-relevance retrieval',
      '[Human Collaboration] Agent keeps responding after a human already took over',
      '[Governance & Safety] A refusal’s own phrasing leaks whether an account exists',
      '[Knowledge] Confidently answering from a doc for a discontinued product line',
      '[Agent Coordination] Delegation is a black box — no sub-agent explains its decision',
      '[Economics] Cost concentrated in a few "retry storm" conversations, not spread evenly',
      '[Action & Tools] Tool "succeeds" but with the wrong side effect (right action, wrong currency/qty)',
    ],
  },
  {
    id: 'unknown-unknowns',
    x: FM_COL2_X,
    y: FM_GRID_Y + FM_ROW_H + FM_ROW_GAP,
    w: FM_COL_W,
    h: FM_ROW_H,
    title: 'Unknown Unknowns',
    subtitle: 'not enumerable by definition — flagged by where they’re likely hiding',
    invert: true,
    items: [
      '[Agent Coordination] Emergent A2A loop behavior never seen in single-agent testing',
      '[Knowledge → Agent Runtime] Prompt injection via a poisoned retrieved document, not user input',
      '[Memory & State] Long-term memory quietly learns a wrong "fact," biasing later turns',
      '[Evaluation & Improvement] Self-improvement loop optimizes a proxy metric that diverges from real satisfaction',
      '[Economics / Platform Engineering] Cost & latency pathologies only visible at real production concurrency',
      '[Governance & Safety] Persona-specific jailbreaks (impersonating internal staff) generic guardrails don’t cover',
      '[Platform Engineering] Infra failure modes only discovered at the first real traffic spike',
    ],
  },
]

function buildFailureModeSection(editor: Editor) {
  const ids: TLShapeId[] = []

  const headerId = createShapeId()
  ids.push(headerId)
  editor.createShape({
    id: headerId,
    type: 'text',
    x: FM_COL1_X,
    y: FM_GRID_Y - 160,
    props: {
      w: FM_COL_W * 2 + FM_COL_GAP,
      color: 'black',
      font: 'sans',
      size: 'xl',
      textAlign: 'start',
      richText: toRichText('Failure Mode Analysis — Known / Unknown Framework'),
    },
  })

  const subheaderId = createShapeId()
  ids.push(subheaderId)
  editor.createShape({
    id: subheaderId,
    type: 'text',
    x: FM_COL1_X,
    y: FM_GRID_Y - 95,
    props: {
      w: FM_COL_W * 2 + FM_COL_GAP,
      color: 'black',
      font: 'sans',
      size: 's',
      textAlign: 'start',
      richText: toRichText(
        'Where each of the 12 capabilities — and the numbered request trajectory — can fail. Inventory only; no fixes proposed yet.'
      ),
    },
  })

  for (const q of quadrants) {
    const textColor = 'black'
    const boxId = createShapeId()
    ids.push(boxId)
    editor.createShape({
      id: boxId,
      type: 'geo',
      x: q.x,
      y: q.y,
      props: {
        geo: 'rectangle',
        w: q.w,
        h: q.h,
        color: 'black',
        fill: 'none',
        dash: 'solid',
        size: q.invert ? 'xl' : 'm',
      },
    })

    const titleId = createShapeId()
    ids.push(titleId)
    editor.createShape({
      id: titleId,
      type: 'text',
      x: q.x + PAD,
      y: q.y + PAD,
      props: {
        w: q.w - PAD * 2,
        color: textColor,
        font: 'sans',
        size: 'l',
        textAlign: 'start',
        richText: toRichText(q.title),
      },
    })

    const subtitleId = createShapeId()
    ids.push(subtitleId)
    editor.createShape({
      id: subtitleId,
      type: 'text',
      x: q.x + PAD,
      y: q.y + PAD + 36,
      props: {
        w: q.w - PAD * 2,
        color: textColor,
        font: 'sans',
        size: 's',
        textAlign: 'start',
        richText: toRichText(q.subtitle),
      },
    })

    q.items.forEach((line, i) => {
      const lineId = createShapeId()
      ids.push(lineId)
      editor.createShape({
        id: lineId,
        type: 'text',
        x: q.x + PAD,
        y: q.y + PAD + 78 + i * LINE_H,
        props: {
          w: q.w - PAD * 2,
          color: textColor,
          font: 'sans',
          size: 's',
          textAlign: 'start',
          richText: toRichText(line),
        },
      })
    })
  }

  editor.sendToBack(ids)
}

// ---------------------------------------------------------------------------
// Low-level design, added as a third section beneath the failure-mode grid —
// nothing above this point is touched. Component -> sub-component -> the
// design tension that has to be resolved -> candidate tools/frameworks with
// their trade-off. Design only, no build. Covers 4 of the 12 components as
// a worked sample; the rest follow the same card shape.
// ---------------------------------------------------------------------------

type LLDSub = { name: string; tension: string; tools: string }
type LLDComponent = { id: string; title: string; subs: LLDSub[] }

const lldComponents: LLDComponent[] = [
  {
    id: 'agent-runtime',
    title: '2 · Agent Runtime — low-level design',
    subs: [
      {
        name: '1. Intent Understanding',
        tension: 'Q — fixed taxonomy vs. open NLU; single-turn or tracked across turns; how are low-confidence / multi-intent cases handled?',
        tools: '→ LLM structured-output (flexible, costly) · Dedicated classifier (cheap, needs data) · Hybrid: classifier + LLM fallback (best balance)',
      },
      {
        name: '2. Planning',
        tension: 'Q — does most traffic even need multi-step planning, or is it retrieve→respond; must plans be auditable/replayable?',
        tools: '→ LangGraph (auditable, more setup) · Temporal (durable, heavy infra) · Free-form ReAct (adaptive, unpredictable) · Static playbooks + fallback planner (recommended)',
      },
      {
        name: '3. Context Engineering',
        tension: 'Q — what belongs in the context window each turn, in what order, and what gets dropped/compressed near the token limit?',
        tools: '→ Supermemory / Mem0 (less build, vendor + data-residency risk) · Roll-your-own assembler (full control, more build) · Provider prompt caching (cheap win regardless)',
      },
      {
        name: '4. Prompt Engineering',
        tension: 'Q — how are prompts versioned/reviewed like code, and tied to eval results before deploy?',
        tools: '→ Langfuse (versioning+eval+tracing, vendor coupling) · PromptLayer / Helicone (lighter logging only) · Git-based prompts-as-code (no vendor, no built-in eval link)',
      },
      {
        name: '5. Model Management',
        tension: 'Q — single model or routed multi-model by complexity/cost; provider lock-in vs. abstraction; fallback on outage?',
        tools: '→ LLM gateway (LiteLLM / Portkey / OpenRouter) (routing+fallback built-in) · Direct SDK + custom routing (control, rebuilds the wheel) · Cloud AI platform (heavier lock-in)',
      },
      {
        name: '6. Agent Harness',
        tension: 'Q — tightly coupled to Planning: does the framework expose a clean hook for a mid-step guardrail / observability check?',
        tools: '→ LangGraph/LangChain executor (reuse Planning choice) · AutoGen / CrewAI / provider Agent SDK (pre-built, opinionated) · Fully custom harness (max control, max cost)',
      },
      {
        name: '7. Decision Making',
        tension: 'Q — distinct from Planning, or "which action wins"? which branches are rule-based vs. LLM-judged, and is rationale logged?',
        tools: '→ Config-driven thresholds (auditable, rigid) · LLM-as-judge (flexible, needs its own eval) · Shared policy engine with Governance (recommended over a second system)',
      },
      {
        name: '8. Execution Control',
        tension: 'Q — highest cost-of-error sub-component: step/time/cost bounds, idempotency on side-effecting calls, safe mid-run interrupt?',
        tools: '→ Durable execution (Temporal / Restate / Inngest) (idempotent by design) · In-process orchestration (no new infra, self-built idempotency risk) · Framework step-limits alone (insufficient)',
      },
      {
        name: '9. Reliability',
        tension: 'Q — is this even a separate build, or an emergent property of Model Management + Execution Control + Evaluation done well?',
        tools: '→ Retry/backoff libraries (table stakes) · LLM-ops reliability dashboards (may already be covered) · Self-consistency/verifier pass (reserved for high-stakes trajectories only)',
      },
    ],
  },
  {
    id: 'knowledge',
    title: '3 · Knowledge — low-level design (Fully Designed: See Page 2 & ADRs 0001–0005)',
    subs: [
      {
        name: '1. Knowledge Sources & Authority',
        tension: 'CONFIRMED (ADR 0001) — Bayesian Reliability Priors P(Truth | Source) + Info Gain IG(Y;X). Higher tier wins online; offline remediation log handles conflicts.',
        tools: '→ Canonical Docs (R=0.99) · Confluence Wiki (R=0.90) · Resolved Tickets (R=0.79) · Slack (R=0.50). ADR 0001 active.',
      },
      {
        name: '2. Ingestion & Sync',
        tension: 'CONFIRMED (ADR 0003) — Scheduled Nightly Batch Crawl at 02:00 UTC (T_sync = 24h) with SHA-256 delta detection & admin override.',
        tools: '→ Differential Batch Crawler · SHA-256 Hash Eviction · Admin On-Demand Trigger Endpoint. ADR 0003 active.',
      },
      {
        name: '3. Representation & Embeddings',
        tension: 'CONFIRMED (ADR 0004) — Strategy Pattern (IChunkingStrategy) + Provider Abstraction (IEmbeddingProvider).',
        tools: '→ Default: FixedWindowChunkingStrategy (500 words) + ManagedPlatformEmbeddingProvider. Extensible to HeaderSection / In-VPC. ADR 0004 active.',
      },
      {
        name: '4. Retrieval Engine',
        tension: 'CONFIRMED (ADR 0002) — Enterprise Managed RAG Platform (Bedrock KB / Vertex Search) with PII sanitization at ingestion boundary.',
        tools: '→ Managed RAG Platform APIs (Vector + Keyword Hybrid) · Ingestion PII Scrubber. ADR 0002 active.',
      },
      {
        name: '5. Ranking',
        tension: 'CONFIRMED (ADR 0002) — Native Built-In Reranker provided by Managed RAG Platform to avoid secondary latency hop.',
        tools: '→ Platform Native Reranker. ADR 0002 active.',
      },
      {
        name: '6. Context Selection',
        tension: 'CONFIRMED — Open shadow-mode experiment comparing Fixed top-k, Token-budget-aware, and MMR diversity-aware strategies.',
        tools: '→ IContextSelector interface · Fixed top-k (default baseline) · RAGAS Shadow Evaluation.',
      },
      {
        name: '7. Knowledge Lifecycle',
        tension: 'CONFIRMED — Retrieval-time freshness scoring deprioritizes older documents while versioning policies evolve.',
        tools: '→ Freshness Scoring at Retrieval Time.',
      },
    ],
  },
  {
    id: 'memory-state',
    title: '4 · Memory & State — low-level design',
    subs: [
      {
        name: '1. Conversation State',
        tension: 'Q — scoped per-channel, or does it persist across a channel switch, per the known failure mode?',
        tools: '→ Session store by conversation ID (breaks on channel switch) · Identity-linked state across channels (solves handoff, needs identity resolution) · Redis (fast, ephemeral) vs. durable DB (survives restarts)',
      },
      {
        name: '2. Working Memory',
        tension: 'Q — no TTL defined today (known-unknown) — what’s held for one run vs. discarded after?',
        tools: '→ Run-scoped in-process state (simplest, framework-native) · External fast cache (Redis) (survives restarts, extra infra) · Explicit TTL policy required either way',
      },
      {
        name: '3. Long-Term Memory',
        tension: 'Q — what earns promotion from working memory to long-term — every fact, or only explicit preferences?',
        tools: '→ Mem0 / Supermemory (built-in promotion heuristics, vendor dependency) · Manual curation rules (explicit, more engineering) · Periodic LLM summarization (risk of drifting “learned facts”)',
      },
      {
        name: '4. User Memory',
        tension: 'Q — CRM vs. agent-learned memory — which is source of truth when they conflict?',
        tools: '→ CRM as source of truth, memory as cache only (safer, needs sync) · Agent-owned profile store (faster, riskier drift) · Read-through cache pattern (balances both)',
      },
      {
        name: '5. Organizational Memory',
        tension: 'Q — how is this different from Knowledge’s document retrieval — is it redundant?',
        tools: '→ May not need separate tooling — could be a Knowledge Sources collection instead of its own system (open design question, resolve before building)',
      },
      {
        name: '6. Agent State',
        tension: 'Q — what happens to in-flight execution state on a crash — is a run resumable?',
        tools: '→ Durable execution engine (Temporal) (resumable by design, heavier infra) · DB checkpointing per step (simpler, manual resume) · Accept non-resumability for low-stakes trajectories only (risky for T4)',
      },
      {
        name: '7. Memory Lifecycle',
        tension: 'Q — how/when is stored memory purged, and who owns that policy?',
        tools: '→ TTL-based auto-expiry (systematic, needs per-type policy) · Manual purge on request (reactive only) · Co-design with Governance’s Data Protection — not built alone',
      },
    ],
  },
  {
    id: 'action-tools',
    title: '5 · Action & Tools — low-level design',
    subs: [
      {
        name: '1. Tool Calling',
        tension: 'Q — native model tool-calling vs. a custom abstraction layer on top?',
        tools: '→ Native provider function-calling (simplest, ties to one schema) · Unified abstraction layer (LiteLLM-style) (portable across models, more build)',
      },
      {
        name: '2. Tool Registry',
        tension: 'Q — static hardcoded registry vs. dynamic runtime discovery?',
        tools: '→ Static config-defined registry (simple, predictable, needs redeploy) · Dynamic registry service (flexible, needs its own governance)',
      },
      {
        name: '3. MCP',
        tension: 'Q — MCP is the exposure mechanism, not a capability — which systems get an MCP server vs. a direct integration?',
        tools: '→ MCP server for anything reusable across agents (standardized, some overhead) · Direct API call for one-off integrations (faster, less reusable)',
      },
      {
        name: '4. API Integrations',
        tension: 'Q — synchronous request/response vs. async/webhook for slow backend systems?',
        tools: '→ Direct sync REST calls (simple, blocks the run) · Async job + callback/poll (better for slow systems, more orchestration complexity)',
      },
      {
        name: '5. Tool Validation',
        tension: 'Q — how much is a tool’s output verified before acting on it — e.g. is “refund succeeded” double-checked?',
        tools: '→ Schema validation only (cheap, not semantic errors) · Post-call verification — re-query to confirm the side effect happened (safer, worth it for high-stakes actions)',
      },
      {
        name: '6. Tool Permissions',
        tension: 'Q — scoped per-tool / intent / user-tier — is this the same policy engine as Governance’s Authorization?',
        tools: '→ Static RBAC (simple, coarse) · Fine-grained policy engine (OPA-style) shared with Governance (recommended — avoid a second parallel system)',
      },
      {
        name: '7. Action Execution',
        tension: 'Q — same idempotency/retry concern as Runtime’s Execution Control — redundant, or does this own tool-specific execution while Runtime owns the bounds?',
        tools: '→ Reuse whatever durable-execution choice was made for Execution Control — a dependency, not an independent tool decision',
      },
    ],
  },
]

const LLD_ITEM_H = 92
const LLD_COL1_X = -400
const LLD_WIDTH = 3620

function buildLowLevelDesignSection(editor: Editor, startY: number) {
  const ids: TLShapeId[] = []

  const headerId = createShapeId()
  ids.push(headerId)
  editor.createShape({
    id: headerId,
    type: 'text',
    x: LLD_COL1_X,
    y: startY - 160,
    props: {
      w: LLD_WIDTH,
      color: 'black',
      font: 'sans',
      size: 'xl',
      textAlign: 'start',
      richText: toRichText('Low-Level Design — Component → Sub-Component → Tooling Trade-offs'),
    },
  })

  const subheaderId = createShapeId()
  ids.push(subheaderId)
  editor.createShape({
    id: subheaderId,
    type: 'text',
    x: LLD_COL1_X,
    y: startY - 95,
    props: {
      w: LLD_WIDTH,
      color: 'black',
      font: 'sans',
      size: 's',
      textAlign: 'start',
      richText: toRichText(
        'Design decisions and candidate tools only — no build yet. 4 of 12 components shown as a worked sample; the rest follow the same card shape.'
      ),
    },
  })

  let cursorY = startY

  for (const c of lldComponents) {
    const boxH = TITLE_H + PAD * 2 + c.subs.length * LLD_ITEM_H

    const boxId = createShapeId()
    ids.push(boxId)
    editor.createShape({
      id: boxId,
      type: 'geo',
      x: LLD_COL1_X,
      y: cursorY,
      props: {
        geo: 'rectangle',
        w: LLD_WIDTH,
        h: boxH,
        color: 'black',
        fill: 'none',
        dash: 'solid',
        size: 'm',
        font: 'sans',
        align: 'start',
        verticalAlign: 'start',
        richText: toRichText(c.title),
      },
    })

    c.subs.forEach((s, i) => {
      const itemTop = cursorY + TITLE_H + PAD + i * LLD_ITEM_H

      const nameId = createShapeId()
      ids.push(nameId)
      editor.createShape({
        id: nameId,
        type: 'text',
        x: LLD_COL1_X + PAD,
        y: itemTop,
        props: {
          w: LLD_WIDTH - PAD * 2,
          color: 'black',
          font: 'sans',
          size: 'm',
          textAlign: 'start',
          richText: toRichText(s.name),
        },
      })

      const tensionId = createShapeId()
      ids.push(tensionId)
      editor.createShape({
        id: tensionId,
        type: 'text',
        x: LLD_COL1_X + PAD,
        y: itemTop + 30,
        props: {
          w: LLD_WIDTH - PAD * 2,
          color: 'black',
          font: 'sans',
          size: 's',
          textAlign: 'start',
          richText: toRichText(s.tension),
        },
      })

      const toolsId = createShapeId()
      ids.push(toolsId)
      editor.createShape({
        id: toolsId,
        type: 'text',
        x: LLD_COL1_X + PAD,
        y: itemTop + 56,
        props: {
          w: LLD_WIDTH - PAD * 2,
          color: 'black',
          font: 'sans',
          size: 's',
          textAlign: 'start',
          richText: toRichText(s.tools),
        },
      })
    })

    cursorY += boxH + 100
  }

  editor.sendToBack(ids)
  return cursorY
}

// ---------------------------------------------------------------------------
// Knowledge — deep low-level design, built on its own tldraw PAGE (not the
// main canvas). Traces the full trajectory through the 7 Knowledge
// sub-components as two flows — an offline/ingestion loop and an online/
// per-request query path — then gives each sub-component a detail card
// stating its mechanic and its decision status (OPEN / CONFIRMED /
// CONFIRMED-conditional / CONFIRMED-experiment), a component-scoped
// known/unknown failure grid, and a decision-log summary. Every open item
// here is also logged in checkpoint.md at the project root with the
// reasoning behind it — this page is the visual counterpart, not a
// replacement for that log.
// ---------------------------------------------------------------------------

const KLD_X = -400
const KLD_WIDTH = 3200
const KLD_WRAP = 120
const KLD_HEADER_BLOCK_H = 80
const KLD_ROW_GAP = 60

const STAGE_W = 460
const STAGE_H = 140
const STAGE_GAP = 90

function wrapLines(text: string, maxChars = KLD_WRAP): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w
    if (next.length > maxChars && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = next
    }
  }
  if (cur) lines.push(cur)
  return lines
}

type KFlowStage = { title: string }

const trajectoryOffline: KFlowStage[] = [
  { title: 'Knowledge Sources' },
  { title: 'Ingestion' },
  { title: 'Representation' },
  { title: '[ Index ]' },
  { title: 'Knowledge Lifecycle' },
]

const trajectoryOnline: KFlowStage[] = [
  { title: '[ Parsed Intent ]' },
  { title: 'Retrieval' },
  { title: 'Ranking' },
  { title: 'Context Selection' },
  { title: '[ Handoff ]' },
]

type KCard = {
  title: string
  status: string
  statusColor: 'green' | 'orange' | 'blue'
  paragraphs: string[]
}

const knowledgeCards: KCard[] = [
  {
    title: '1 · Knowledge Sources',
    status: 'CONFIRMED — ADR 0001 (Bayesian Authority & Remediation)',
    statusColor: 'green',
    paragraphs: [
      'Mechanic: Source registry with Bayesian reliability priors P(Truth | Source) per system tier (Canonical Docs R=0.99, Wiki R=0.90, Tickets R=0.79, Slack R=0.50). Evaluates Information Gain IG(Y;X) and Expected Error Cost E[L].',
      'Conflict Handling: Higher-tier source wins online execution. An offline KnowledgeConflictDetected event triggers automated remediation tasks to clean outdated lower-tier docs.',
    ],
  },
  {
    title: '2 · Ingestion',
    status: 'CONFIRMED — ADR 0003 (Scheduled Nightly Batch Crawl)',
    statusColor: 'green',
    paragraphs: [
      'Mechanic: Scheduled differential batch crawl at 02:00 UTC (T_sync = 24h). Enforces content hash comparison (SHA-256) to re-index changed documents and tombstone evicted items.',
      'Rationale: Enforces upper bound on temporal entropy H(t) while avoiding complex webhook event queue ops (C_ops_batch -> 0). Admin trigger override available for emergency syncs.',
    ],
  },
  {
    title: '3 · Representation',
    status: 'CONFIRMED — ADR 0004 (IChunkingStrategy & IEmbeddingProvider)',
    statusColor: 'green',
    paragraphs: [
      'Mechanic: Strategy Pattern for document chunking (IChunkingStrategy) and provider abstraction for vector embeddings (IEmbeddingProvider).',
      'Default Baseline: FixedWindowChunkingStrategy (500 words, 50-word overlap) and ManagedPlatformEmbeddingProvider. Extensible to HeaderSection/ParentChild strategies or In-VPC embedding models with zero code changes.',
    ],
  },
  {
    title: '4 · Retrieval',
    status: 'CONFIRMED — ADR 0002 (Managed RAG Platform)',
    statusColor: 'green',
    paragraphs: [
      'Mechanic: Fully managed enterprise RAG platform APIs (AWS Bedrock KB / GCP Vertex Search) combining vector similarity and keyword search.',
      'Compliance & Ops: Eliminates vector DB ops burden (C_ops -> 0). Ingestion boundary PII scrubbing applied to comply with enterprise VPC data privacy standards.',
    ],
  },
  {
    title: '5 · Ranking',
    status: 'CONFIRMED — ADR 0002 (Native Built-In Reranker)',
    statusColor: 'green',
    paragraphs: [
      'Mechanic: Reorders candidate retrieved sets using the Managed RAG Platform native built-in reranking model.',
      'Rationale: Avoids secondary network hop latency penalty (C_latency) of a self-hosted cross-encoder model.',
    ],
  },
  {
    title: '6 · Context Selection',
    status: 'CONFIRMED — open experiment',
    statusColor: 'blue',
    paragraphs: [
      'Mechanic: Chooses final chunk set within Retrieved-Knowledge token budget (25-35%), evaluating Fixed top-k, Token-budget-aware, and MMR diversity-aware strategies behind a swappable interface.',
      'Promotion Gate: Shadow mode comparison evaluated on RAGAS Context Precision, Context Recall, and Faithfulness. Default: Fixed top-k.',
    ],
  },
  {
    title: '7 · Knowledge Lifecycle',
    status: 'CONFIRMED — Freshness scoring at retrieval time',
    statusColor: 'green',
    paragraphs: [
      'Mechanic: Governs staleness after initial ingestion via retrieval-time freshness scoring.',
      'Mitigation: Deprioritizes older documents in ranking while additive TTL/versioning policies are established.',
    ],
  },
]

type KQuadrant = { title: string; subtitle: string; items: string[]; invert?: boolean }

const knowledgeFailureQuadrants: KQuadrant[] = [
  {
    title: 'Known Knowns',
    subtitle: 'Knowledge-specific — new entries, not duplicating the main canvas',
    items: [
      'Chunk boundary splits a troubleshooting step across two chunks, breaking retrieval of either half',
      'Embedding model drift after a provider model upgrade silently changes similarity scores',
      'Hybrid search fusion double-counts a chunk that scores high on both vector and keyword',
    ],
  },
  {
    title: 'Known Unknowns',
    subtitle: 'open questions we know we haven’t answered yet',
    items: [
      'What precision/recall target justifies hybrid search’s added infra over pure vector?',
      'At what corpus size does chunking strategy start to matter more than embedding model choice?',
    ],
  },
  {
    title: 'Unknown Knowns',
    subtitle: 'tacit — obvious the moment you see it, never written down',
    items: [
      'A reranker "fixes" ranking for common queries but silently degrades rare long-tail queries no one is watching',
      'Metadata tags (product line, region) go stale faster than the content itself, causing correct-content-wrong-filter misses',
    ],
  },
  {
    title: 'Unknown Unknowns',
    subtitle: 'not enumerable by definition — flagged by where they’re likely hiding',
    invert: true,
    items: [
      'A poisoned or malicious document is ingested and later used as an indirect prompt-injection vector against Agent Runtime — the Knowledge-side entry point for a system-wide risk',
      'Retrieval quality degrades gradually as the corpus grows past whatever scale it was tuned at, with no single failing query to point to',
    ],
  },
]

function buildTrajectoryRow(
  editor: Editor,
  label: string,
  sublabel: string,
  stages: KFlowStage[],
  y: number,
  ids: TLShapeId[]
): number {
  const labelId = createShapeId()
  ids.push(labelId)
  editor.createShape({
    id: labelId,
    type: 'text',
    x: KLD_X,
    y: y - 66,
    props: { w: KLD_WIDTH, color: 'black', font: 'sans', size: 'l', textAlign: 'start', richText: toRichText(label) },
  })

  const sublabelId = createShapeId()
  ids.push(sublabelId)
  editor.createShape({
    id: sublabelId,
    type: 'text',
    x: KLD_X,
    y: y - 32,
    props: { w: KLD_WIDTH, color: 'black', font: 'sans', size: 's', textAlign: 'start', richText: toRichText(sublabel) },
  })

  const centers: number[] = []
  let x = KLD_X
  for (const s of stages) {
    const boxId = createShapeId()
    ids.push(boxId)
    editor.createShape({
      id: boxId,
      type: 'geo',
      x,
      y,
      props: {
        geo: 'rectangle',
        w: STAGE_W,
        h: STAGE_H,
        color: 'black',
        fill: 'none',
        dash: 'solid',
        size: 'm',
        font: 'sans',
        align: 'middle',
        verticalAlign: 'middle',
        richText: toRichText(s.title),
      },
    })
    centers.push(x + STAGE_W / 2)
    x += STAGE_W + STAGE_GAP
  }

  for (let i = 0; i < stages.length - 1; i++) {
    const arrowId = createShapeId()
    ids.push(arrowId)
    editor.createShape({
      id: arrowId,
      type: 'arrow',
      x: 0,
      y: 0,
      props: {
        color: 'black',
        dash: 'solid',
        size: 's',
        font: 'sans',
        arrowheadStart: 'none',
        arrowheadEnd: 'arrow',
        richText: toRichText(''),
        start: { x: centers[i] + STAGE_W / 2, y: y + STAGE_H / 2 },
        end: { x: centers[i + 1] - STAGE_W / 2, y: y + STAGE_H / 2 },
      },
    })
  }

  return y + STAGE_H
}

function buildKnowledgeCards(editor: Editor, startY: number, ids: TLShapeId[]): number {
  let cursorY = startY
  for (const c of knowledgeCards) {
    const bodyLines: string[] = []
    c.paragraphs.forEach((p, pi) => {
      wrapLines(p).forEach((line) => bodyLines.push(line))
      if (pi < c.paragraphs.length - 1) bodyLines.push('')
    })

    const boxH = KLD_HEADER_BLOCK_H + PAD * 2 + bodyLines.length * LINE_H

    const boxId = createShapeId()
    ids.push(boxId)
    editor.createShape({
      id: boxId,
      type: 'geo',
      x: KLD_X,
      y: cursorY,
      props: { geo: 'rectangle', w: KLD_WIDTH, h: boxH, color: 'black', fill: 'none', dash: 'solid', size: 'm' },
    })

    const titleId = createShapeId()
    ids.push(titleId)
    editor.createShape({
      id: titleId,
      type: 'text',
      x: KLD_X + PAD,
      y: cursorY + PAD,
      props: { w: KLD_WIDTH - PAD * 2, color: 'black', font: 'sans', size: 'l', textAlign: 'start', richText: toRichText(c.title) },
    })

    const statusId = createShapeId()
    ids.push(statusId)
    editor.createShape({
      id: statusId,
      type: 'text',
      x: KLD_X + PAD,
      y: cursorY + PAD + 34,
      props: {
        w: KLD_WIDTH - PAD * 2,
        color: c.statusColor,
        font: 'sans',
        size: 'm',
        textAlign: 'start',
        richText: toRichText(c.status),
      },
    })

    bodyLines.forEach((line, i) => {
      if (!line) return
      const lineId = createShapeId()
      ids.push(lineId)
      editor.createShape({
        id: lineId,
        type: 'text',
        x: KLD_X + PAD,
        y: cursorY + KLD_HEADER_BLOCK_H + PAD + i * LINE_H,
        props: { w: KLD_WIDTH - PAD * 2, color: 'black', font: 'sans', size: 's', textAlign: 'start', richText: toRichText(line) },
      })
    })

    cursorY += boxH + KLD_ROW_GAP
  }
  return cursorY
}

const KFM_COL_GAP = 40
const KFM_COL_W = (KLD_WIDTH - KFM_COL_GAP) / 2
const KFM_ROW_H = 400
const KFM_ROW_GAP = 40

function buildKnowledgeFailureGrid(editor: Editor, startY: number, ids: TLShapeId[]): number {
  const headerId = createShapeId()
  ids.push(headerId)
  editor.createShape({
    id: headerId,
    type: 'text',
    x: KLD_X,
    y: startY - 70,
    props: {
      w: KLD_WIDTH,
      color: 'black',
      font: 'sans',
      size: 'xl',
      textAlign: 'start',
      richText: toRichText('Knowledge — Failure Mode Analysis (component-scoped, new entries only)'),
    },
  })

  const cols = [KLD_X, KLD_X + KFM_COL_W + KFM_COL_GAP]
  const rows = [startY, startY + KFM_ROW_H + KFM_ROW_GAP]
  const positions: Array<[number, number]> = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ]

  knowledgeFailureQuadrants.forEach((q, i) => {
    const [r, c] = positions[i]
    const x = cols[c]
    const y = rows[r]

    const boxId = createShapeId()
    ids.push(boxId)
    editor.createShape({
      id: boxId,
      type: 'geo',
      x,
      y,
      props: { geo: 'rectangle', w: KFM_COL_W, h: KFM_ROW_H, color: 'black', fill: 'none', dash: 'solid', size: q.invert ? 'xl' : 'm' },
    })

    const titleId = createShapeId()
    ids.push(titleId)
    editor.createShape({
      id: titleId,
      type: 'text',
      x: x + PAD,
      y: y + PAD,
      props: { w: KFM_COL_W - PAD * 2, color: 'black', font: 'sans', size: 'l', textAlign: 'start', richText: toRichText(q.title) },
    })

    const subtitleId = createShapeId()
    ids.push(subtitleId)
    editor.createShape({
      id: subtitleId,
      type: 'text',
      x: x + PAD,
      y: y + PAD + 36,
      props: { w: KFM_COL_W - PAD * 2, color: 'black', font: 'sans', size: 's', textAlign: 'start', richText: toRichText(q.subtitle) },
    })

    let lineCursor = 0
    q.items.forEach((item) => {
      wrapLines(item, 105).forEach((line) => {
        const lineId = createShapeId()
        ids.push(lineId)
        editor.createShape({
          id: lineId,
          type: 'text',
          x: x + PAD,
          y: y + PAD + 78 + lineCursor * LINE_H,
          props: { w: KFM_COL_W - PAD * 2, color: 'black', font: 'sans', size: 's', textAlign: 'start', richText: toRichText(line) },
        })
        lineCursor += 1
      })
      lineCursor += 1
    })
  })

  return startY + KFM_ROW_H * 2 + KFM_ROW_GAP * 2
}

function buildKnowledgeDecisionLog(editor: Editor, startY: number, ids: TLShapeId[]) {
  const lines = [
    'Decision Log Summary — Full formal reasoning trails live in ADR/ (ADR 0001 to ADR 0005) & checkpoint.md at the project root.',
    '',
    'CONFIRMED (ADR 0001): Knowledge Source Authority & Conflict Resolution — Bayesian priors P(Truth | S_i), Information Gain IG(Y;X), and Expected Error Cost E[L]. Winner chosen online; offline KnowledgeConflictDetected event triggers doc/ticket remediation.',
    'CONFIRMED (ADR 0002): Retrieval Architecture & Reranking — Managed RAG Platform with native built-in reranker and ingestion boundary PII scrubbing.',
    'CONFIRMED (ADR 0003): Document Ingestion & Temporal Sync Strategy — Scheduled Nightly Batch differential crawl at 02:00 UTC (T_sync = 24h) to bound temporal entropy H(t).',
    'CONFIRMED (ADR 0004): Extensible Chunking & Embedding Abstractions — Strategy Pattern (IChunkingStrategy) with FixedWindow baseline (500 words) and Provider Abstraction (IEmbeddingProvider) with native platform model default.',
    'CONFIRMED (ADR 0005): Knowledge vs. Memory System Boundary — Formally separates globally invariant, read-only Enterprise Knowledge (nightly ingestion) from dynamic, session-scoped read-write Memory & State (Agent Runtime per-turn).',
    'CONFIRMED (Open Experiment): Context Selection — Build Fixed top-k, Token-budget-aware, and MMR diversity-aware strategies; compare in shadow mode.',
  ]

  const boxH = PAD * 2 + lines.length * LINE_H
  const boxId = createShapeId()
  ids.push(boxId)
  editor.createShape({
    id: boxId,
    type: 'geo',
    x: KLD_X,
    y: startY,
    props: { geo: 'rectangle', w: KLD_WIDTH, h: boxH, color: 'black', fill: 'none', dash: 'solid', size: 'm' },
  })

  lines.forEach((line, i) => {
    if (!line) return
    const lineId = createShapeId()
    ids.push(lineId)
    editor.createShape({
      id: lineId,
      type: 'text',
      x: KLD_X + PAD,
      y: startY + PAD + i * LINE_H,
      props: { w: KLD_WIDTH - PAD * 2, color: 'black', font: 'sans', size: 's', textAlign: 'start', richText: toRichText(line) },
    })
  })
}

function buildKnowledgeDeepDivePage(editor: Editor) {
  const ids: TLShapeId[] = []

  const headerId = createShapeId()
  ids.push(headerId)
  editor.createShape({
    id: headerId,
    type: 'text',
    x: KLD_X,
    y: -140,
    props: {
      w: KLD_WIDTH,
      color: 'black',
      font: 'sans',
      size: 'xl',
      textAlign: 'start',
      richText: toRichText('Knowledge — Low-Level Design (deep dive)'),
    },
  })

  const subheaderId = createShapeId()
  ids.push(subheaderId)
  editor.createShape({
    id: subheaderId,
    type: 'text',
    x: KLD_X,
    y: -75,
    props: {
      w: KLD_WIDTH,
      color: 'black',
      font: 'sans',
      size: 's',
      textAlign: 'start',
      richText: toRichText(
        'Full trajectory through all 7 sub-components, grounded in the literature review. Open forks are asked as questions, not decided — see checkpoint.md for the reasoning behind every entry marked CONFIRMED or OPEN below.'
      ),
    },
  })

  let cursorY = 40
  cursorY = buildTrajectoryRow(
    editor,
    'Trajectory A — Offline / Ingestion (continuous, not per-request)',
    'Knowledge Sources → Ingestion → Representation → [ Index ] → Knowledge Lifecycle, feeding back to trigger re-ingestion on source change',
    trajectoryOffline,
    cursorY,
    ids
  )

  const loopArrowId = createShapeId()
  ids.push(loopArrowId)
  editor.createShape({
    id: loopArrowId,
    type: 'arrow',
    x: 0,
    y: 0,
    props: {
      color: 'black',
      dash: 'dashed',
      size: 's',
      font: 'sans',
      arrowheadStart: 'none',
      arrowheadEnd: 'arrow',
      bend: 140,
      richText: toRichText('re-ingestion trigger on source change'),
      start: { x: KLD_X + 4 * (STAGE_W + STAGE_GAP) + STAGE_W / 2, y: cursorY + 20 },
      end: { x: KLD_X + (STAGE_W + STAGE_GAP) + STAGE_W / 2, y: cursorY + 20 },
    },
  })

  cursorY += 220

  cursorY = buildTrajectoryRow(
    editor,
    'Trajectory B — Online / Query (once per request, latency-sensitive)',
    'Parsed intent (from Agent Runtime) → Retrieval → Ranking → Context Selection → handoff to Context Engineering (Agent Runtime)',
    trajectoryOnline,
    cursorY,
    ids
  )

  cursorY += 140

  const cardsHeaderId = createShapeId()
  ids.push(cardsHeaderId)
  editor.createShape({
    id: cardsHeaderId,
    type: 'text',
    x: KLD_X,
    y: cursorY,
    props: {
      w: KLD_WIDTH,
      color: 'black',
      font: 'sans',
      size: 'xl',
      textAlign: 'start',
      richText: toRichText('Sub-component detail — mechanic + decision status'),
    },
  })
  cursorY += 70

  cursorY = buildKnowledgeCards(editor, cursorY, ids)
  cursorY = buildKnowledgeFailureGrid(editor, cursorY + 40, ids)
  buildKnowledgeDecisionLog(editor, cursorY + 60, ids)

  editor.sendToBack(ids)
}

function buildShapes(editor: Editor) {
  const boxIds: TLShapeId[] = []

  editor.run(() => {
    for (const n of nodes) {
      const boxId = createShapeId()
      boxIds.push(boxId)

      editor.createShape({
        id: boxId,
        type: 'geo',
        x: n.x,
        y: n.y,
        props: {
          geo: 'rectangle',
          w: n.w,
          h: n.h,
          color: 'black',
          fill: 'none',
          dash: 'solid',
          size: 'm',
          font: 'sans',
          align: 'start',
          verticalAlign: 'start',
          richText: toRichText(n.title),
        },
      })

      if (n.list === 'horizontal') {
        const textId = createShapeId()
        boxIds.push(textId)
        editor.createShape({
          id: textId,
          type: 'text',
          x: n.x + PAD,
          y: n.y + TITLE_H + PAD,
          props: {
            w: n.w - PAD * 2,
            color: 'black',
            font: 'sans',
            size: 's',
            textAlign: 'start',
            richText: toRichText(n.subs.join('\n')),
          },
        })
      } else {
        n.subs.forEach((line, i) => {
          if (!line) return
          const textId = createShapeId()
          boxIds.push(textId)
          editor.createShape({
            id: textId,
            type: 'text',
            x: n.x + PAD,
            y: n.y + TITLE_H + PAD + i * LINE_H,
            props: {
              w: n.w - PAD * 2,
              color: 'black',
              font: 'sans',
              size: 's',
              textAlign: 'start',
              richText: toRichText(line),
            },
          })
        })
      }
    }

    // header + legend
    const headerId = createShapeId()
    boxIds.push(headerId)
    editor.createShape({
      id: headerId,
      type: 'text',
      x: 200,
      y: -140,
      props: {
        w: 2640,
        color: 'black',
        font: 'sans',
        size: 'xl',
        textAlign: 'start',
        richText: toRichText('Enterprise Customer Support Agent — Capability Architecture'),
      },
    })

    const legendId = createShapeId()
    boxIds.push(legendId)
    editor.createShape({
      id: legendId,
      type: 'text',
      x: 200,
      y: -70,
      props: {
        w: 2640,
        color: 'black',
        font: 'sans',
        size: 's',
        textAlign: 'start',
        richText: toRichText(
          'Solid numbered arrows = one request’s path through the system.  Dashed arrows = cross-cutting / feedback relationships.  Lines inside a box = its first-level capabilities.'
        ),
      },
    })

    for (const a of arrows) {
      const arrowId = createShapeId()
      boxIds.push(arrowId)
      editor.createShape({
        id: arrowId,
        type: 'arrow',
        x: 0,
        y: 0,
        props: {
          color: 'black',
          dash: a.dashed ? 'dashed' : 'solid',
          size: 's',
          font: 'sans',
          arrowheadStart: 'none',
          arrowheadEnd: 'arrow',
          bend: a.bend ?? 0,
          start: { x: a.from.x, y: a.from.y },
          end: { x: a.to.x, y: a.to.y },
          richText: toRichText(a.label),
          labelPosition: a.labelPosition ?? 0.5,
        },
      })
    }

    editor.sendToBack(boxIds)
  })

  editor.run(() => {
    buildFailureModeSection(editor)
  })

  const failureModeSectionBottom = FM_GRID_Y + FM_ROW_H * 2 + FM_ROW_GAP
  editor.run(() => {
    buildLowLevelDesignSection(editor, failureModeSectionBottom + 240)
  })

  editor.selectAll()
  editor.zoomToFit({ animation: { duration: 0 } })
  editor.selectNone()
}

const KNOWLEDGE_PAGE_NAME = 'Knowledge — Low-Level Design'

function handleMount(editor: Editor) {
  // React 18/19 dev-mode StrictMode double-invokes onMount on the same editor
  // instance. Since this canvas has no persistence (fresh store every load),
  // that would otherwise stack duplicate shapes on Page 1 and spawn a
  // "Knowledge — Low-Level Design 1" page. Guard on actual editor state
  // (not a JS flag) so a second invocation is a safe no-op.
  const alreadyBuiltMainPage = editor.getCurrentPageShapeIds().size > 0
  if (!alreadyBuiltMainPage) {
    buildShapes(editor)
  }

  const mainPageId = editor.getCurrentPageId()
  const existingKnowledgePage = editor.getPages().find((p) => p.name === KNOWLEDGE_PAGE_NAME)

  if (!existingKnowledgePage) {
    editor.createPage({ name: KNOWLEDGE_PAGE_NAME })
    const knowledgePage = editor.getPages().find((p) => p.name === KNOWLEDGE_PAGE_NAME)
    if (knowledgePage) {
      editor.setCurrentPage(knowledgePage)
      editor.run(() => {
        buildKnowledgeDeepDivePage(editor)
      })
      editor.selectAll()
      editor.zoomToFit({ animation: { duration: 0 } })
      editor.selectNone()
    }
  }

  editor.setCurrentPage(mainPageId)
}

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw onMount={handleMount} />
    </div>
  )
}
