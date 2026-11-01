export interface RoutedSkill {
  skillId: string;
  confidence: number;
  systemPromptSnippet: string;
}

export class SkillsRouter {
  route(prompt: string): RoutedSkill[] {
    const lower = prompt.toLowerCase();
    const skills: RoutedSkill[] = [];

    // Ponytail detection
    if (
      lower.includes('ponytail') ||
      lower.includes('lazy') ||
      lower.includes('simple') ||
      lower.includes('clean') ||
      lower.includes('yagni') ||
      lower.includes('bloat') ||
      lower.includes('/ponytail')
    ) {
      skills.push({
        skillId: 'ponytail',
        confidence: 0.95,
        systemPromptSnippet: 'You are in Ponytail mode. Deliver the smallest complete change that fully works (-53% code). Omit unnecessary abstractions and YAGNI code.',
      });
    }

    // UI/UX & Design system
    if (
      lower.includes('ui') ||
      lower.includes('theme') ||
      lower.includes('color') ||
      lower.includes('style') ||
      lower.includes('spacing') ||
      lower.includes('layout')
    ) {
      skills.push({
        skillId: 'subhash-uiux',
        confidence: 0.92,
        systemPromptSnippet: 'Enforce Subhash UI/UX Calm Enterprise design system: 4px grid, 4 themes, 10-point governance scoring, and max 5% gradients.',
      });
    }

    // Algorithmic Art / p5.js
    if (lower.includes('art') || lower.includes('p5') || lower.includes('generative') || lower.includes('seed')) {
      skills.push({
        skillId: 'algorithmic-art',
        confidence: 0.90,
        systemPromptSnippet: 'Apply Algorithmic Art engine rules: reproducible integer seeds, noise scales, and brand skin palettes.',
      });
    }

    // REA Reverse engineering
    if (lower.includes('rea') || lower.includes('reverse') || lower.includes('decompile') || lower.includes('inspect') || lower.includes('binary')) {
      skills.push({
        skillId: 'rea',
        confidence: 0.94,
        systemPromptSnippet: 'Integrate REA MCP reverse engineering capabilities: inspect native handles, extract AST, and analyze runtime memory.',
      });
    }

    // Security audit harness detection
    if (
      lower.includes('security-audit') ||
      lower.includes('/security-audit') ||
      lower.includes('security audit') ||
      lower.includes('vulnerability') ||
      lower.includes('pen-test') ||
      lower.includes('pentest') ||
      lower.includes('coverage ledger') ||
      lower.includes('cve')
    ) {
      skills.push({
        skillId: 'security-audit',
        confidence: 0.95,
        systemPromptSnippet: 'Orchestrate Cloudflare 6-phase vulnerability audit harness: reconnaissance (architecture.md & coverage-ledger.json), coverage-led hunting, adversarial candidate validation, findings.json report schema validation, independent source verification, and target-neutral reporting.',
      });
    }

    // Default to Subhash Developer council if empty
    if (skills.length === 0) {
      skills.push({
        skillId: 'subhash-developer',
        confidence: 0.85,
        systemPromptSnippet: 'Follow Subhash Developer engineering standards: typed IPC, zero-assumption interfaces, defensive validation.',
      });
    }

    return skills;
  }
}

export const skillsRouter = new SkillsRouter();
