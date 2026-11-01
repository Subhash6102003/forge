---
name: security-audit
description: Cloudflare 6-phase vulnerability discovery harness: Reconnaissance, Coverage-led Hunting, Candidate Validation, Structured Output, Independent Record Verification, and Target-Neutral Reporting.
argument-hint: "[recon|hunt|validate|output|verify|report|full]"
license: Apache-2.0
---

# Cloudflare Security Audit Harness

A coding-agent skill that turns your agent into an enterprise-grade security auditor. It orchestrates isolated agents through reconnaissance, coverage-led hunting, candidate validation, structured output, independent record verification, and target-neutral reporting.

This skill is seeded from Cloudflare's vulnerability discovery harness, described in [Build your own vulnerability harness](https://blog.cloudflare.com/build-your-own-vulnerability-harness).

## The Six Audit Phases

```
Phase 1: Reconnaissance ──► architecture.md & coverage-ledger.json
Phase 2: Hunting        ──► coverage units assigned to isolated hunters
Phase 3: Validation     ──► adversarial verifier attempts to disprove candidate
Phase 4: Output         ──► findings.json validated by validate-findings.cjs
Phase 5: Verification   ──► fresh agents independently verify source claims
Phase 6: Reporting      ──► REPORT.md, FINDINGS-DETAIL.md, NEEDS-VALIDATION.md
```

### Phase 1: Reconnaissance
Map architecture, trust boundaries, input surfaces, prior evidence, and deterministic coverage in `architecture.md` and `coverage-ledger.json`.
- Validate the ledger: `node skills/security-audit/validate-coverage-ledger.cjs coverage-ledger.json`

### Phase 2: Coverage-Led Hunting
Assign isolated hunters from ledger units, record their checks, and use coverage critics to find gaps. Reference attack classes from `skills/security-audit/ATTACK-CLASSES.md`:
- `AI-AND-LLM.md`: Prompt injection, model extraction, training poisoning, MCP tool abuse.
- `CLIENT-SIDE.md`: DOM XSS, prototype pollution, CSP bypass, postMessage attacks.
- `CLOUD-AND-DEPLOYMENT.md`: IAM misconfigs, SSRF to metadata endpoints, container escapes.
- `DATA-ISOLATION-AND-LIFECYCLE.md`: IDOR, tenant crosstalk, race conditions, memory leaks.
- `DESKTOP-MOBILE-AND-LOCAL-IPC.md`: Electron context bridge bypass, shell command injection, deep link exploits.
- `MEMORY-SAFETY-AND-BINARY.md`: Buffer overflows, use-after-free, unsafe pointer dereferences.
- `PROTOCOLS-RPC-AND-MESSAGING.md`: WebSocket hijacking, gRPC deserialization, event queue tampering.
- `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md`: ReDoS, memory exhaustion, zip bombs, slowloris.
- `SUPPLY-CHAIN-AND-RELEASE.md`: Malicious dependencies, typosquatting, CI/CD secret leaks.
- `WEB-PROTOCOL-AND-AUTH.md`: JWT manipulation, OAuth misconfiguration, CORS origin reflection.

### Phase 3: Candidate Validation
Give every unique candidate to a fresh verifier that actively tries to **disprove** it. Verifiers must establish an unbroken trace from an attacker-controlled entry point to a vulnerable sink with demonstrated bounded impact.

### Phase 4: Structured Output
Write confirmed, needs_validation, and rejected records to `findings.json` and validate them against `skills/security-audit/report-schema.json`.
- Validate findings: `node skills/security-audit/validate-findings.cjs findings.json`

### Phase 5: Independent Record Verification
Fresh agents verify final source claims. Material replacements receive another independent verifier. If claims fail verification, they are rejected or demoted to `needs_validation`.

### Phase 6: Target-Neutral Reporting
Derive `REPORT.md`, `FINDINGS-DETAIL.md`, and `NEEDS-VALIDATION.md` directly from the verified records and coverage ledger.

## Findings Verdict Taxonomy
- **`confirmed`**: Complete source trace with verified bounded impact and proven exploitability.
- **`needs_validation`**: Plausible vulnerability where preconditions or full execution trace could not be confirmed in an isolated environment.
- **`rejected`**: Disproved by verifier or mitigated by existing controls/defenses.

## Slash Commands
- `/security-audit`: Run a full end-to-end security audit on the workspace.
- `/security-audit recon`: Map codebase trust boundaries into `architecture.md` and initialize `coverage-ledger.json`.
- `/security-audit hunt`: Run coverage-led hunting using attack class guides.
- `/security-audit validate`: Adversarially validate finding candidates.
- `/security-audit report`: Generate `findings.json`, `REPORT.md`, and `FINDINGS-DETAIL.md`.
