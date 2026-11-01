import { describe, it, expect, beforeEach } from 'vitest';
import { SkillRegistryService } from '../src/services/studio/skillRegistryService';
import { QualityGateService } from '../src/services/studio/qualityGateService';
import { LivingDocsService } from '../src/services/studio/livingDocsService';
import { StudioOrchestratorService } from '../src/services/studio/orchestratorService';
import { AGENT_ROLES } from '../src/services/studio/roles/agentRoles';
import { SYSTEM_DESIGN_PATTERNS } from '../skills/patterns/patternCards';

describe('Studio Brain Multi-Agent & Skill System', () => {
  beforeEach(() => {
    // Reset any local state mocks
  });

  describe('Skill Registry', () => {
    it('registers all 17 skills with proper priorities and categories', () => {
      const registry = SkillRegistryService.getInstance();
      const allSkills = registry.getAllSkills();

      expect(allSkills.length).toBe(17);

      // Verify essential skills exist
      const skillIds = allSkills.map((s) => s.id);
      expect(skillIds).toContain('impeccable');
      expect(skillIds).toContain('taste-skill');
      expect(skillIds).toContain('design-extract');
      expect(skillIds).toContain('react-bits');
      expect(skillIds).toContain('gsap-skills');
      expect(skillIds).toContain('transitions-dev');
      expect(skillIds).toContain('playwright-cli');
      expect(skillIds).toContain('claude-seo');
      expect(skillIds).toContain('system-design-primer');
      expect(skillIds).toContain('karanpratapsingh-system-design');
      expect(skillIds).toContain('bytebytego-system-design-101');
      expect(skillIds).toContain('awesome-scalability');
      expect(skillIds).toContain('security-audit');
      expect(skillIds).toContain('geo-engine');
      expect(skillIds).toContain('lean-code');
      expect(skillIds).toContain('change-documentation');
      expect(skillIds).toContain('system-design-cost');

      // Verify priority ordering: Security (100) must be highest priority
      expect(allSkills[0].id).toBe('security-audit');
      expect(allSkills[0].priority).toBe(100);
    });

    it('resolves skills dynamically for agent roles and query prompts', () => {
      const registry = SkillRegistryService.getInstance();
      const designSkills = registry.resolveSkillsForRole('UI Designer', 'create modern high contrast layout');

      expect(designSkills.length).toBeGreaterThan(0);
      const names = designSkills.map((s) => s.id);
      expect(names).toContain('impeccable');
    });

    it('generates active prompt snippet with priority ordering', () => {
      const registry = SkillRegistryService.getInstance();
      const snippet = registry.getPromptSnippetForRole('UI Designer', 'polish layout');

      expect(snippet).toContain('ACTIVE REGISTERED SKILLS');
      expect(snippet).toContain('UI/UX Design Systems & Precision Heuristics');
    });
  });

  describe('Architect Brain & Knowledge Base Pattern Cards', () => {
    it('includes essential distributed systems patterns with concrete tiers', () => {
      expect(SYSTEM_DESIGN_PATTERNS.length).toBeGreaterThanOrEqual(4);

      const fanout = SYSTEM_DESIGN_PATTERNS.find((p) => p.id === 'hybrid-fanout');
      expect(fanout).toBeDefined();
      expect(fanout?.concreteImplementation.tier0Local).toContain('SQLite');
      expect(fanout?.concreteImplementation.tier3Hyperscale).toContain('Kafka');

      const counters = SYSTEM_DESIGN_PATTERNS.find((p) => p.id === 'sharded-distributed-counters');
      expect(counters).toBeDefined();
      expect(counters?.whenToUse[0]).toContain('Viral');
    });
  });

  describe('Agent Roles & Modular Prompts', () => {
    it('defines PM, 4 Leads, and 16 Sub-Agents without gaps', () => {
      const roles = Object.keys(AGENT_ROLES);
      expect(roles.length).toBe(21); // 1 PM + 4 Leads + 16 Sub-Agents

      // Verify PM
      expect(AGENT_ROLES['pm'].name).toContain('Product Manager');
      expect(AGENT_ROLES['pm'].systemPrompt).toContain('You never write code');

      // Verify Leads
      expect(AGENT_ROLES['arch-lead']).toBeDefined();
      expect(AGENT_ROLES['eng-lead']).toBeDefined();
      expect(AGENT_ROLES['design-lead']).toBeDefined();
      expect(AGENT_ROLES['quality-lead']).toBeDefined();

      // Verify Documentation Steward
      expect(AGENT_ROLES['doc-steward']).toBeDefined();
      expect(AGENT_ROLES['doc-steward'].systemPrompt).toContain('AI_CHANGELOG.md');
    });
  });

  describe('Quality Gate Service & Secret Scanner', () => {
    it('accurately catches exposed API keys and private credentials', () => {
      const gate = QualityGateService.getInstance();

      const badContent = `const key = "sk-abcdef1234567890abcdef1234567890";`;
      const badScan = gate.scanForSecrets(badContent);
      expect(badScan.found).toBe(true);
      expect(badScan.matches[0]).toContain('OpenAI API Key');

      const ghContent = `const token = "ghp_123456789012345678901234567890123456";`;
      const ghScan = gate.scanForSecrets(ghContent);
      expect(ghScan.found).toBe(true);
      expect(ghScan.matches[0]).toContain('GitHub Token');

      const cleanContent = `const port = process.env.PORT || 3000;`;
      const cleanScan = gate.scanForSecrets(cleanContent);
      expect(cleanScan.found).toBe(false);
    });
  });

  describe('Living Documentation Service', () => {
    it('generates markdown changelog with line ranges and verification', () => {
      const docs = LivingDocsService.getInstance();
      const md = docs.generateChangelogMarkdown({
        taskTitle: 'Initialize Local Storage Quota',
        agentRole: 'DB & Infra Engineer',
        modelUsed: 'llama3.1:8b (Local)',
        planItem: 'P-01',
        filesChanged: [
          {
            path: 'src/server/db.ts',
            action: 'created',
            linesChanged: '1-45',
            summary: 'Added SQLite WAL database with quota checks',
            diffExcerpt: '+export const db = new Database();',
          },
        ],
        verificationResult: 'All 12 unit tests passed',
        gateResults: 'Security: PASS, Tests: PASS',
      }, 'Entry-001');

      expect(md).toContain('[Entry-001]');
      expect(md).toContain('`src/server/db.ts`');
      expect(md).toContain('diff');
      expect(md).toContain('Rollback');
    });

    it('generates complete SYSTEM_DESIGN template with Tiers 0-3 and cost tables', () => {
      const docs = LivingDocsService.getInstance();
      const sysDoc = docs.generateSystemDesignTemplate('Moments App', 'Private photo sharing for 5 friends', 'local');

      expect(sysDoc).toContain('System Design: Moments App');
      expect(sysDoc).toContain('Tier 0 (Local)');
      expect(sysDoc).toContain('Tier 3 (Hyperscale)');
      expect(sysDoc).toContain('[MEASURED: 100% offline local runtime]');
    });
  });

  describe('Studio Orchestrator Workflow Engine', () => {
    it('executes Workflow A with Multi-Brain debate and design theme selection', async () => {
      const orchestrator = StudioOrchestratorService.getInstance();

      await orchestrator.startNewProject('Build a private photo sharing app for 5 friends');
      const state1 = orchestrator.getState();

      expect(state1.stage).toBe('design-choice');
      expect(state1.debateTurns.length).toBe(4);
      expect(state1.debateTurns[0].perspective).toBe('Architecture');
      expect(state1.debateTurns[1].perspective).toBe('Security & QA');

      // Step 2: Select theme
      orchestrator.selectDesignTheme('MongoDB Dark Emerald');
      const state2 = orchestrator.getState();
      expect(state2.stage).toBe('plan-approval');
      expect(state2.selectedTheme).toBe('MongoDB Dark Emerald');
      expect(state2.tasks.length).toBe(3);

      // Step 3: Approve plan
      orchestrator.approvePlan();
      const state3 = orchestrator.getState();
      expect(state3.stage).toBe('execution');
      expect(state3.planApproved).toBe(true);

      // Step 4: Progress a task
      await orchestrator.completeTask('T-001', 'Setup SQLite database', ['src/server/db.ts']);
      const state4 = orchestrator.getState();
      expect(state4.tasks[0].status).toBe('done');
      expect(state4.latestGateReport?.overallPassed).toBe(true);
    });
  });
});
