export interface SkillManifest {
  id: string;
  name: string;
  version: string;
  source: string;
  purpose: string;
  triggers: string[];
  owningAgentRole: string;
  requiredTools: string[];
  priority: number;
  category: 'design' | 'motion' | 'testing' | 'system-design' | 'security' | 'growth' | 'core';
  enabled: boolean;
  systemPromptSnippet: string;
}

export const SKILL_MANIFESTS: SkillManifest[] = [
  // --- Design / Build / Test Skills ---
  {
    id: 'impeccable',
    name: 'UI/UX Design Systems & Precision Heuristics',
    version: '1.2.0',
    source: 'internal/skills/design-heuristics',
    purpose: 'Enforces strict optical alignment, 4px/8px spatial rhythm, typographic contrast, and accessibility compliance. Eliminates generic AI design patterns.',
    triggers: ['design', 'ui', 'polish', 'bolder', 'critique', 'typography', 'spacing', 'alignment'],
    owningAgentRole: 'UI Designer',
    requiredTools: ['readFile', 'editFile'],
    priority: 95,
    category: 'design',
    enabled: true,
    systemPromptSnippet: 'Apply UI/UX design heuristics: enforce optical alignment, strict hierarchy, high contrast ratios, and design from established theme tokens.'
  },
  {
    id: 'taste-skill',
    name: 'Art Direction & Editorial Layouts',
    version: '2.0.0',
    source: 'internal/skills/art-direction',
    purpose: 'Curates authentic color palettes, high-conviction typography, and balanced negative space for modern web and desktop products.',
    triggers: ['taste', 'art-direction', 'aesthetic', 'layout', 'theme', 'color-scheme', 'visual-hierarchy'],
    owningAgentRole: 'Design and Experience Lead',
    requiredTools: ['readFile', 'editFile'],
    priority: 94,
    category: 'design',
    enabled: true,
    systemPromptSnippet: 'Enforce art direction standards: high-conviction typography, disciplined whitespace, curated contrast palettes, and authentic editorial layout.'
  },
  {
    id: 'design-extract',
    name: 'Design System & Token Extraction',
    version: '1.0.4',
    source: 'internal/skills/token-extractor',
    purpose: 'Inspects reference web interfaces to systematically extract color variables, typography scales, contrast ratios, and border radii into clean CSS variables.',
    triggers: ['extract', 'reference', 'inspect-url', 'design-tokens', 'theme-extract', 'website-style'],
    owningAgentRole: 'Design-Reference Researcher',
    requiredTools: ['playwright-cli', 'fetchUrl', 'writeFile'],
    priority: 90,
    category: 'design',
    enabled: true,
    systemPromptSnippet: 'Extract design tokens (colors, font-family, font-sizes, radii, shadows) into tokens.css without copying proprietary assets or copyright content.'
  },
  {
    id: 'react-bits',
    name: 'Micro-Interactions & Component Recipes',
    version: '1.5.0',
    source: 'internal/skills/interactive-recipes',
    purpose: 'Provides accessible animated backgrounds, kinetic text treatments, card hover states, and responsive component recipes.',
    triggers: ['react-bits', 'interactive', 'animated-bg', 'card-hover', 'particle-background', 'text-animation'],
    owningAgentRole: 'UI Designer',
    requiredTools: ['readFile', 'editFile'],
    priority: 88,
    category: 'design',
    enabled: true,
    systemPromptSnippet: 'Leverage proven component recipes for animated backgrounds, kinetic typography, and interactive cards. Avoid reinventing solved UI components.'
  },
  {
    id: 'gsap-skills',
    name: 'Motion Engineering & Timeline Choreography',
    version: '3.12.5',
    source: 'internal/skills/motion-choreography',
    purpose: 'Implements smooth 60fps animations, hardware-accelerated transforms, scroll triggers, and SVG morphs while honoring prefers-reduced-motion.',
    triggers: ['gsap', 'timeline', 'animation', 'scroll-trigger', 'morph', 'motion', 'micro-interaction'],
    owningAgentRole: 'Motion/Interaction Dev',
    requiredTools: ['readFile', 'editFile'],
    priority: 87,
    category: 'motion',
    enabled: true,
    systemPromptSnippet: 'Implement purposeful motion: timeline choreography, GPU-accelerated transforms, and respect window.matchMedia("(prefers-reduced-motion: reduce)").'
  },
  {
    id: 'transitions-dev',
    name: 'Fluid View Transitions & Layout Morphs',
    version: '1.1.0',
    source: 'internal/skills/view-transitions',
    purpose: 'Implements CSS view transitions, FLIP layout morphs, and seamless page state changes without jarring DOM redraws.',
    triggers: ['transition', 'page-transition', 'view-transition', 'flip-animation', 'smooth-motion'],
    owningAgentRole: 'Motion/Interaction Dev',
    requiredTools: ['readFile', 'editFile'],
    priority: 86,
    category: 'motion',
    enabled: true,
    systemPromptSnippet: 'Apply modern view transitions and smooth state morphs. Avoid jarring layout shifts and maintain 60fps frame rates.'
  },
  {
    id: 'playwright-cli',
    name: 'Automated End-to-End Testing & Verification',
    version: '1.49.0',
    source: 'internal/skills/e2e-verification',
    purpose: 'Executes headless browser automation, user journey validation, DOM state assertions, and visual regression snapshot verification.',
    triggers: ['playwright', 'e2e', 'browser', 'screenshot', 'dom-inspect', 'test-flow', 'visual-regression'],
    owningAgentRole: 'E2E Tester',
    requiredTools: ['runCommand', 'readFile', 'writeFile'],
    priority: 92,
    category: 'testing',
    enabled: true,
    systemPromptSnippet: 'Execute automated E2E test flows. Verify critical user journeys, capture failure screenshots, and assert UI state in real browsers.'
  },
  {
    id: 'claude-seo',
    name: 'Technical SEO & Discovery Architecture',
    version: '2.1.0',
    source: 'internal/skills/technical-seo',
    purpose: 'Builds canonical URL structures, semantic HTML hierarchy (H1-H6), JSON-LD structured data, fast Core Web Vitals, and sitemap indexing.',
    triggers: ['seo', 'meta-tags', 'sitemap', 'robots-txt', 'opengraph', 'core-web-vitals', 'search-console'],
    owningAgentRole: 'SEO/GEO Specialist',
    requiredTools: ['readFile', 'editFile', 'runCommand'],
    priority: 85,
    category: 'growth',
    enabled: true,
    systemPromptSnippet: 'Audit technical SEO: verify canonical tags, semantic H1-H6 hierarchy, fast Core Web Vitals, JSON-LD Schema.org, and clean robots.txt.'
  },

  // --- System Design Knowledge Bases ("Architect Brain") ---
  {
    id: 'system-design-primer',
    name: 'Distributed Systems Architecture & Scalability',
    version: '1.0.0',
    source: 'internal/skills/distributed-systems',
    purpose: 'Architects horizontal scalability, load balancing, multi-tier caching, database sharding, replication topologies, and CAP trade-offs.',
    triggers: ['architecture', 'sharding', 'caching', 'load-balancing', 'replication', 'cap-theorem', 'system-design'],
    owningAgentRole: 'Systems Architect',
    requiredTools: ['readFile'],
    priority: 95,
    category: 'system-design',
    enabled: true,
    systemPromptSnippet: 'Apply distributed systems patterns: right-size single nodes first, decouple stateless compute from stateful storage, and explain CAP trade-offs.'
  },
  {
    id: 'karanpratapsingh-system-design',
    name: 'High-Concurrency Blueprints & Rate Limiting',
    version: '1.0.0',
    source: 'internal/skills/high-concurrency',
    purpose: 'Implements token bucket rate limiters, distributed message queues, idempotent retry protocols, and low-latency key-value stores.',
    triggers: ['rate-limiter', 'message-queue', 'key-value-store', 'service-discovery', 'idempotency'],
    owningAgentRole: 'Systems Architect',
    requiredTools: ['readFile'],
    priority: 93,
    category: 'system-design',
    enabled: true,
    systemPromptSnippet: 'Incorporate proven distributed blueprints: token bucket rate limiting, idempotent retry keys, and decoupled publish-subscribe event streams.'
  },
  {
    id: 'bytebytego-system-design-101',
    name: 'Write-Burst Mitigation & Sharded Counters',
    version: '1.0.0',
    source: 'internal/skills/burst-mitigation',
    purpose: 'Handles high-throughput write bursts using hybrid fan-out models, atomic sharded counters, push/pull notification engines, and hot-key mitigation.',
    triggers: ['fanout', 'hot-key', 'atomic-counter', 'write-burst', 'celebrity-traffic', 'bytebytego'],
    owningAgentRole: 'Data/Storage Designer',
    requiredTools: ['readFile'],
    priority: 94,
    category: 'system-design',
    enabled: true,
    systemPromptSnippet: 'Apply burst mitigation: hybrid fan-out for high-volume accounts (write for standard users, read for high-follower accounts) and sharded counters for like bursts.'
  },
  {
    id: 'awesome-scalability',
    name: 'Hyperscale Patterns & Failure Recovery',
    version: '1.0.0',
    source: 'internal/skills/hyperscale-patterns',
    purpose: 'Applies battle-tested production scaling patterns: circuit breakers, bulkhead isolation, write-ahead logs, and graceful degradation during traffic surges.',
    triggers: ['case-study', 'scaling-history', 'real-world-scale', 'instagram-architecture', 'twitter-feed'],
    owningAgentRole: 'Systems Architect',
    requiredTools: ['readFile'],
    priority: 90,
    category: 'system-design',
    enabled: true,
    systemPromptSnippet: 'Ground architectural advice in proven scaling patterns (e.g. database partitioning, timeline hybrid fan-out, and circuit-breaker fault tolerance).'
  },

  // --- Core Standardized Skills ---
  {
    id: 'security-audit',
    name: 'Security Audits & Vulnerability Verification',
    version: '2.0.0',
    source: 'internal/skills/security-audit',
    purpose: 'Performs automated OWASP Top 10 auditing, static secrets detection, dependency vulnerability tracking, input sanitization, and strict CORS/CSP enforcement.',
    triggers: ['security', 'audit', 'vulnerability', 'owasp', 'secret-scan', 'gate-security'],
    owningAgentRole: 'Security Auditor',
    requiredTools: ['runCommand', 'readFile', 'editFile'],
    priority: 100,
    category: 'security',
    enabled: true,
    systemPromptSnippet: 'Mandatory security gate: scan for credentials, verify input sanitization, check dependency CVEs, and block approval on Critical/High findings.'
  },
  {
    id: 'geo-engine',
    name: 'Generative Engine & AI Search Optimization',
    version: '1.0.0',
    source: 'internal/skills/geo',
    purpose: 'Optimizes content structure for AI search engines: llms.txt declarations, structured schema.org entities, and semantic clarity for LLM indexing.',
    triggers: ['geo', 'llms-txt', 'ai-search', 'schema-org', 'entity-clarity', 'ai-overviews'],
    owningAgentRole: 'SEO/GEO Specialist',
    requiredTools: ['readFile', 'editFile', 'writeFile'],
    priority: 84,
    category: 'growth',
    enabled: true,
    systemPromptSnippet: 'Generate llms.txt and structured JSON-LD entities so AI models and answer engines can accurately cite and understand the project.'
  },
  {
    id: 'lean-code',
    name: 'Lean-Code Engineering & Anti-Bloat Protocol',
    version: '1.0.0',
    source: 'internal/skills/lean-code',
    purpose: 'Enforces anti-bloat principles: standard libraries first, maintained package reuse before hand-rolling >15-line utilities, surgical minimal diffs, and YAGNI.',
    triggers: ['lean-code', 'dependency-check', 'anti-bloat', 'yagni', 'minimal-code'],
    owningAgentRole: 'Engineering Lead',
    requiredTools: ['readFile', 'runCommand'],
    priority: 98,
    category: 'core',
    enabled: true,
    systemPromptSnippet: 'Enforce Lean-Code: never hand-roll date parsers, validators, or auth from scratch when maintained packages exist. Reject speculative abstractions.'
  },
  {
    id: 'change-documentation',
    name: 'Change Documentation & Living Specs',
    version: '1.0.0',
    source: 'internal/skills/change-documentation',
    purpose: 'Parses live git diffs to generate docs/AI_CHANGELOG.md records with line numbers, reasons, and rollback plans. Keeps system design docs synchronized.',
    triggers: ['documentation', 'changelog', 'git-diff', 'adr', 'living-docs'],
    owningAgentRole: 'Documentation Steward',
    requiredTools: ['runCommand', 'readFile', 'writeFile', 'editFile'],
    priority: 99,
    category: 'core',
    enabled: true,
    systemPromptSnippet: 'Generate docs/AI_CHANGELOG.md from actual git diffs. Keep README.md, docs/PLAN.md, docs/DESIGN.md, and docs/SYSTEM_DESIGN.md strictly up to date.'
  },
  {
    id: 'system-design-cost',
    name: 'System Design Tier Planning & Cost Modeling',
    version: '1.0.0',
    source: 'internal/skills/system-design-cost',
    purpose: 'Produces Tier 0 (local) to Tier 3 (hyperscale) architecture plans, itemized cloud vs local cost projections, and empirical latency benchmarking plans.',
    triggers: ['system-design-cost', 'tier-plan', 'cost-model', 'benchmark-plan', 'cloud-pricing'],
    owningAgentRole: 'Architecture Lead',
    requiredTools: ['readFile', 'writeFile'],
    priority: 96,
    category: 'system-design',
    enabled: true,
    systemPromptSnippet: 'Produce tiered architectures (Tier 0 local to Tier 3 cloud). Provide itemized monthly cost models and label benchmarks [MEASURED] vs [ESTIMATED].'
  }
];
