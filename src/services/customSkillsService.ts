export interface CustomSkill {
  id: string;
  name: string;
  slashCommand: string;
  description: string;
  instructions: string;
  active: boolean;
  isBuiltIn?: boolean;
}

const DEFAULT_SKILLS: CustomSkill[] = [
  {
    id: 'skill-uiux',
    name: 'UI/UX Calm Enterprise',
    slashCommand: '/design',
    description: 'Subhash UI/UX design tokens, 4px grid, high contrast, clean typography, responsive layout.',
    instructions: 'Follow Subhash UI/UX Calm Enterprise design system: 4px grid spacing, consistent theme CSS variables, high contrast, responsive layouts, no unnecessary gradients or visual clutter.',
    active: true,
    isBuiltIn: true,
  },
  {
    id: 'skill-debug',
    name: 'Bug Finder & Trace Debugger',
    slashCommand: '/debug',
    description: 'Deep stack-trace inspection, boundary condition verification, and defensive null/undefined safety.',
    instructions: 'Act as a Senior Debugger. Perform root-cause analysis, verify boundary values, add defensive checks for null/undefined, and provide minimal, surgical bug fixes.',
    active: true,
    isBuiltIn: true,
  },
  {
    id: 'skill-security',
    name: 'Security & Hardening Architect',
    slashCommand: '/security',
    description: 'Electron sandbox isolation, typed validated IPC, anti-path traversal, secure OS keychain.',
    instructions: 'Enforce strict security standards: contextIsolation: true, nodeIntegration: false, sanitize and assert all filesystem paths against path traversal, encrypt sensitive credentials.',
    active: true,
    isBuiltIn: true,
  },
  {
    id: 'skill-ponytail',
    name: 'Ponytail Senior Dev (-53% Bloat)',
    slashCommand: '/audit',
    description: 'Zero YAGNI bloat, test-first on risky logic, -53% code size target.',
    instructions: 'Enforce the Ponytail rule: eliminate redundant abstraction wrappers, state machines where simple booleans suffice, and deliver the cleanest minimal working change.',
    active: true,
    isBuiltIn: true,
  },
  {
    id: 'skill-security-audit',
    name: 'Cloudflare Security Audit Harness',
    slashCommand: '/security-audit',
    description: 'Cloudflare 6-phase vulnerability discovery harness: Reconnaissance, Hunting, Adversarial Validation, Structured Output, Verification, and Reporting.',
    instructions: 'Execute Cloudflare 6-phase vulnerability harness: 1) Reconnaissance (map trust boundaries and input surfaces into architecture.md & coverage-ledger.json); 2) Coverage-Led Hunting (systematic attack classes); 3) Candidate Validation (adversarial verifiers disproving bugs); 4) Structured Output (findings.json checked by validate-findings.cjs); 5) Independent Record Verification; 6) Target-Neutral Reporting (REPORT.md & FINDINGS-DETAIL.md).',
    active: true,
    isBuiltIn: true,
  },
];

const STORAGE_KEY = 'forge_custom_skills';

export class CustomSkillsService {
  private static instance: CustomSkillsService;
  private skills: CustomSkill[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.load();
  }

  static getInstance(): CustomSkillsService {
    if (!CustomSkillsService.instance) {
      CustomSkillsService.instance = new CustomSkillsService();
    }
    return CustomSkillsService.instance;
  }

  load(): CustomSkill[] {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.skills = parsed;
            return this.skills;
          }
        }
      }
    } catch {}
    this.skills = [...DEFAULT_SKILLS];
    this.save();
    return this.skills;
  }

  save(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.skills));
      }
    } catch {}
    this.notify();
  }

  getSkills(): CustomSkill[] {
    return [...this.skills];
  }

  getActiveSkills(): CustomSkill[] {
    return this.skills.filter((s) => s.active);
  }

  addSkill(skill: Omit<CustomSkill, 'id'>): CustomSkill {
    const cleanCmd = skill.slashCommand.startsWith('/') ? skill.slashCommand.toLowerCase() : `/${skill.slashCommand.toLowerCase()}`;
    const newSkill: CustomSkill = {
      ...skill,
      slashCommand: cleanCmd,
      id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    this.skills.push(newSkill);
    this.save();
    return newSkill;
  }

  toggleSkill(id: string): void {
    this.skills = this.skills.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    this.save();
  }

  deleteSkill(id: string): void {
    this.skills = this.skills.filter((s) => s.id !== id);
    this.save();
  }

  subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
