# Studio Brain Roadmap & Execution Plan
> Living Product Roadmap maintained by the Product Manager (PM)

## 1. Project Goal
Deliver an enterprise-grade, 100% locally-executable software development studio inside Forge, featuring a hierarchical multi-agent orchestration layer (PM $\rightarrow$ Leads $\rightarrow$ Sub-agents), pluggable Skill Registry, multi-brain local debate, and living documentation.

## 2. Scope Boundaries
- **In Scope (Do)**:
  - Local model runtime support (Ollama / llama.cpp / OpenAI-compatible).
  - Pluggable Bring-Your-Own-Key (BYOK) cloud model support for public GitHub users.
  - Multi-brain local debate engine (Architecture vs Security vs Performance vs PM Synthesis).
  - Interactive design consultation (MongoDB, Linear, Custom High-Taste).
  - Mandatory quality gates (Security, Tests, Performance, Lean-Code, Documentation, SEO/GEO).
  - Pre-push secret scanning and clean Git commits.
- **Out of Scope (Don't)**:
  - Hardcoding machine-specific file paths.
  - Mandatory cloud subscriptions or vendor lock-in.
  - Fabricated benchmarks or unverified claims.

## 3. Milestones & Task Status
- [x] **Milestone 1: Skill Ingestion & Manifest Standardization**
  - Ingested 8 design/test skill repos & 4 system design knowledge bases.
  - Unified `SkillManifest` registry with priority ordering.
- [x] **Milestone 2: Modular Agent Roles & Prompts**
  - Configured PM, 4 Leads, and 16 Sub-Agents with Base Preamble and Task Brief/Report formats.
- [x] **Milestone 3: Quality Gates & Living Documentation**
  - Automated secret scanning and OWASP checklist verification.
  - Generators for `AI_CHANGELOG.md`, `README.md`, `PLAN.md`, `DESIGN.md`, `SYSTEM_DESIGN.md`.
- [x] **Milestone 4: Studio UI Panel**
  - Interactive PM Chat with Multi-Brain Debate Accordion.
  - Visual Task Board (`TASK BRIEF` $\rightarrow$ `TASK REPORT`).
  - Pluggable Skill Registry toggle switches.
  - Tiers 0–3 System Design & Itemized Monthly Cost Explorer.
- [x] **Milestone 5: Verification & Zero Regressions**
  - 37/37 Vitest unit tests passing.
  - 65/65 Cloudflare security harness tests passing.
  - Clean production build with exit code 0.
