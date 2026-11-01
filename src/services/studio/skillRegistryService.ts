import { SKILL_MANIFESTS, SkillManifest } from '../../../skills/manifests/skillManifests';

export class SkillRegistryService {
  private static instance: SkillRegistryService;
  private skills: Map<string, SkillManifest> = new Map();

  private constructor() {
    this.loadInitialSkills();
  }

  public static getInstance(): SkillRegistryService {
    if (!SkillRegistryService.instance) {
      SkillRegistryService.instance = new SkillRegistryService();
    }
    return SkillRegistryService.instance;
  }

  private loadInitialSkills(): void {
    let savedState: string | null = null;
    try {
      if (typeof localStorage !== 'undefined') {
        savedState = localStorage.getItem('forge_studio_skills_state');
      }
    } catch {}
    const enabledMap: Record<string, boolean> = savedState ? JSON.parse(savedState) : {};

    for (const manifest of SKILL_MANIFESTS) {
      this.skills.set(manifest.id, {
        ...manifest,
        enabled: enabledMap[manifest.id] !== undefined ? enabledMap[manifest.id] : manifest.enabled,
      });
    }
  }

  public getAllSkills(): SkillManifest[] {
    return Array.from(this.skills.values()).sort((a, b) => b.priority - a.priority);
  }

  public getEnabledSkills(): SkillManifest[] {
    return this.getAllSkills().filter((s) => s.enabled);
  }

  public getSkill(id: string): SkillManifest | undefined {
    return this.skills.get(id);
  }

  public toggleSkill(id: string, enabled: boolean): void {
    const skill = this.skills.get(id);
    if (skill) {
      skill.enabled = enabled;
      this.skills.set(id, { ...skill });
      this.persistState();
    }
  }

  public resolveSkillsForRole(roleId: string, queryPrompt?: string): SkillManifest[] {
    const enabled = this.getEnabledSkills();
    const query = (queryPrompt || '').toLowerCase();

    return enabled
      .filter((s) => {
        // Direct assignment to this role
        if (s.owningAgentRole.toLowerCase().includes(roleId.toLowerCase())) return true;
        // Trigger keyword match if query prompt is given
        if (query && s.triggers.some((t) => query.includes(t.toLowerCase()))) return true;
        return false;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  public getPromptSnippetForRole(roleId: string, queryPrompt?: string): string {
    const matched = this.resolveSkillsForRole(roleId, queryPrompt);
    if (matched.length === 0) return '';

    return `\n\nACTIVE REGISTERED SKILLS (Highest Priority First):\n` +
      matched
        .map((s, idx) => `[Skill ${idx + 1}: ${s.name} (v${s.version}, Priority ${s.priority})]\n${s.systemPromptSnippet}`)
        .join('\n\n');
  }

  private persistState(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const state: Record<string, boolean> = {};
      for (const [id, skill] of this.skills.entries()) {
        state[id] = skill.enabled;
      }
      localStorage.setItem('forge_studio_skills_state', JSON.stringify(state));
    } catch {}
  }
}
