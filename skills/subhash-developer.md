---
name: subhash-developer
description: Engineering Council standards for robust, scalable, typed, enterprise-grade architecture.
version: 1.0.0
---

# Subhash Developer Engineering Standards

## Core Engineering Council Tenets
1. **Security-First Architecture**:
   - Electron security: `contextIsolation: true`, `nodeIntegration: false`, strict CSP, sandboxing.
   - IPC communication must be strictly typed, schema-validated, and prevent path traversal / arbitrary code injection.
2. **Defensive Coding & Zero-Assumption Interfaces**:
   - Every external payload (model output, IPC message, file read) must be validated with runtime guards before consumption.
   - Graceful degradation: If a local model or daemon (e.g. Ollama) is offline, the IDE presents actionable recovery guides rather than crashing.
3. **Local-First & Privacy Sovereign**:
   - All code generation, model execution, and diff computation run locally on the user's workstation.
   - Telemetry-free, sovereign storage for checkpoints and settings.
4. **Clean Code & Test Integrity**:
   - Never weaken or skip tests to make a build pass.
   - Implement real unit, integration, and contract tests.
   - Deterministic and reproducible outputs.
