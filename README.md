# Forge: Enterprise AI Desktop IDE with Studio Brain

> **Forge** is an open-source, local-first AI Desktop IDE featuring **Studio Brain**—a hierarchical multi-agent orchestration layer (Product Manager $\rightarrow$ Team Leads $\rightarrow$ Sub-Agents) powered by a pluggable 17-skill registry and multi-brain local debate.

[![Tests](https://img.shields.io/badge/tests-37%2F37%20passing-brightgreen)]()
[![Security Audit](https://img.shields.io/badge/security--audit-65%2F65%20passing-brightgreen)]()
[![Local-First](https://img.shields.io/badge/runtime-100%25%20Local%20%7C%20BYOK%20Cloud-orange)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 🌟 Key Capabilities

1. **Studio Brain (Hierarchical Multi-Agent Orchestrator)**:
   - **Product Manager (PM)**: Single point of contact, intake, decomposition, milestone tracking, and final acceptance. Never writes code directly.
   - **Architecture Lead**: Systems Architect, Storage Designer, Performance Engineer, Cost Analyst (Tiers 0–3 architecture).
   - **Engineering Lead**: Frontend Dev, Backend Dev, DB/Infra Engineer, Test Engineer (Enforces Lean-Code policy).
   - **Design & Experience Lead**: UI Designer, Motion Dev, Design Researcher (`impeccable`, `taste-skill`, `react-bits`, `gsap-skills`, `transitions.dev`, `design-extract`).
   - **Quality, Security & Growth Lead**: Security Auditor, E2E Tester, SEO/GEO Specialist, Regression Reviewer, Documentation Steward.
2. **100% Local Multi-Brain Debate**:
   - Sub-brains debate locally (Architecture proposes $\iff$ Security challenges $\iff$ Performance optimizes) to produce verified, scale-ready code on local models (Ollama, llama.cpp) without context bloat.
3. **Pluggable BYOK Cloud Support**:
   - 100% local-first default with zero subscriptions. Public GitHub users can optionally plug in their own API keys (Claude, OpenAI, Gemini, Groq, OpenRouter) via the secure settings.
4. **Mandatory Quality Gates**:
   - Pre-push secret scanning, OWASP Top 10 validation, unit tests, latency benchmarks, and Lean-Code audits.
5. **Living Documentation Engine**:
   - `docs/AI_CHANGELOG.md` updated automatically from real Git diffs with line ranges, before/after excerpts, and rollback commands.
   - `docs/PLAN.md`, `docs/DESIGN.md`, and `docs/SYSTEM_DESIGN.md` kept permanently in sync.

---

## 🚀 Quickstart & Local Installation

Anyone can clone and run Forge locally in under 2 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/forge.git
cd forge

# 2. Install dependencies
npm install

# 3. Start development server (Vite + Electron)
npm run electron:dev
```

To run purely in the browser for web development:
```bash
npm run dev
```

---

## 🧪 Testing & Verification

Forge comes with a comprehensive two-tier test suite:

```bash
# Run Vitest unit & integration tests (37 tests)
npm test

# Run Cloudflare security-audit harness tests (65 tests)
npm run test:skills

# Run all test suites
npm run test:all

# Production bundle build (Vite + Electron)
npm run build:all
```

---

## 📂 Project Structure

```text
forge/
├── electron/              # Hardened Electron shell (PTY terminal, Git IPC, safeStorage)
├── src/
│   ├── components/
│   │   ├── layout/        # ActivityBar, SidePanel, Monaco EditorArea, PreviewPanel, BottomPanel
│   │   ├── ui/            # Unified FileIcon, Button, Tree, Modal, Toast
│   │   └── views/         # StudioView, FileExplorerView, GitView, SearchView, ModelStudioView
│   ├── services/
│   │   ├── studio/        # Studio Brain Orchestrator, SkillRegistry, QualityGates, LivingDocs
│   │   ├── providers/     # Local Ollama, OpenAI, Anthropic, Gemini provider abstraction
│   │   └── modelRuntimeService.ts
├── skills/
│   ├── manifests/         # 17 standardized Skill Manifests with priority ordering
│   ├── patterns/          # System design pattern cards (Hybrid Fan-Out, Sharded Counters, etc.)
│   └── security-audit/    # Cloudflare vulnerability discovery harness
├── docs/
│   ├── PLAN.md            # Product roadmap and execution milestones
│   ├── DESIGN.md          # Design tokens and visual aesthetic guidelines
│   ├── SYSTEM_DESIGN.md   # Tiers 0-3 architecture, Mermaid diagrams, cost models
│   └── AI_CHANGELOG.md    # Living line-by-line Git diff changelog
└── tests/                 # Vitest test suites
```

---

## ⚙️ Configuration & Environment Variables

Forge stores API keys securely in the operating system's native credential store (`safeStorage` via Electron):
- `OPENAI_API_KEY` (Optional for cloud models)
- `ANTHROPIC_API_KEY` (Optional for Claude models)
- `GEMINI_API_KEY` (Optional for Gemini models)
- `OLLAMA_BASE_URL` (Defaults to `http://localhost:11434`)

No secrets or credentials are ever committed to files or repositories.

---

## 📜 Recent Changes
All changes are documented line-by-line with real Git diff excerpts in [docs/AI_CHANGELOG.md](file:///d:/don't_know/forge/docs/AI_CHANGELOG.md).
