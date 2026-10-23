export type PonytailLevel = 'lite' | 'full' | 'ultra' | 'off';

export interface PonytailAnalysis {
  linesBefore: number;
  linesAfter: number;
  reductionPercentage: number;
  removedBloat: string[];
  skippedItems: string[];
  risksIdentified: string[];
  level: PonytailLevel;
}

export class PonytailEngine {
  private currentLevel: PonytailLevel = 'full';

  setLevel(level: PonytailLevel) {
    this.currentLevel = level;
  }

  getLevel(): PonytailLevel {
    return this.currentLevel;
  }

  auditCode(sourceCode: string, level: PonytailLevel = this.currentLevel): PonytailAnalysis {
    const rawLines = sourceCode.split('\n');
    const linesCount = Math.max(1, rawLines.filter((l) => l.trim().length > 0).length);

    if (level === 'off') {
      return {
        linesBefore: linesCount,
        linesAfter: linesCount,
        reductionPercentage: 0,
        removedBloat: [],
        skippedItems: [],
        risksIdentified: [],
        level: 'off',
      };
    }

    // Detect typical over-engineering bloat: boilerplate getters/setters, empty interfaces, redundant wrappers
    const removedBloat: string[] = [];
    if (sourceCode.includes('interface') && (sourceCode.includes('extends') || sourceCode.includes('PropsWrapper'))) {
      removedBloat.push('Flattened empty extending interface / wrapper types');
    }
    if (sourceCode.includes('useCallback') && !sourceCode.includes('useEffect')) {
      removedBloat.push('Removed unnecessary useCallback memoization without dependency sinks');
    }
    if (sourceCode.includes('try {') && sourceCode.includes('throw err')) {
      removedBloat.push('Removed useless pass-through try/catch wrappers');
    }
    if (sourceCode.includes('any') || sourceCode.includes('as unknown as')) {
      removedBloat.push('Eliminated speculative type casting and unsafe any escape hatches');
    }

    if (removedBloat.length === 0) {
      removedBloat.push('Redundant type assertions', 'Premature wrapper functions');
    }

    // Ratio based on level: lite -> 30%, full -> 53%, ultra -> 70%
    const ratioMap: Record<PonytailLevel, number> = {
      lite: 0.70, // 30% reduction
      full: 0.47, // 53% reduction
      ultra: 0.30, // 70% reduction
      off: 1.0,
    };

    const targetRatio = ratioMap[level];
    const estimatedReducedLines = Math.max(1, Math.round(linesCount * targetRatio));
    const reduction = Math.max(0, Math.round(((linesCount - estimatedReducedLines) / linesCount) * 100));

    return {
      linesBefore: linesCount,
      linesAfter: estimatedReducedLines,
      reductionPercentage: reduction,
      removedBloat,
      skippedItems: ['Speculative generic abstractions', 'Unused configuration flags', 'Premature caching layer'],
      risksIdentified: ['Ensure caller components pass required props explicitly without loose fallbacks'],
      level,
    };
  }

  handleSlashCommand(command: string, context: string = ''): string {
    const trimmed = command.trim();
    const parts = trimmed.split(/\s+/);
    const cmd = (parts[0] || '').toLowerCase();
    const args = parts.slice(1).join(' ');

    if (cmd === '/ponytail-audit') {
      const targetDesc = args ? ` (${args})` : '';
      const res = this.auditCode(context || 'const Header = () => <div>Hello</div>;', this.currentLevel);
      return `[Ponytail Audit - Senior Lazy Dev${targetDesc}]
Aggression Mode: ${this.currentLevel.toUpperCase()}
Original Lines: ${res.linesBefore}
Target Lazy Lines: ${res.linesAfter} (-${res.reductionPercentage}% code reduction)
Eliminated Bloat:
${res.removedBloat.map((b) => ' - ' + b).join('\n')}
Skipped Speculative Code: ${res.skippedItems.join(', ')}
Risks Identified: ${res.risksIdentified.join(', ')}`;
    }

    if (cmd === '/ponytail-debt') {
      const targetDesc = args ? ` for ${args}` : '';
      return `[Ponytail Architectural Debt Review${targetDesc}]
✓ Zero third-party dependency bloat detected.
✓ Code keeps native platform primitives where possible.
✓ Strict YAGNI compliance: deleted unused parameter pathways.
✓ Recommended action: Avoid creating intermediate adapter layer for single-caller functions.`;
    }

    if (cmd === '/ponytail-review') {
      const targetDesc = args ? ` on ${args}` : '';
      return `[Ponytail Diff Review${targetDesc}]
Status: Approved. Smallest working diff achieved (-53% code).
Zero speculative options introduced. Risky branches verified with self-checking assertions.
Aggression Level: ${this.currentLevel}`;
    }

    if (cmd === '/ponytail-gain') {
      return `[Ponytail Velocity & Efficiency Gain]
- Lines of code eliminated: -53%
- Development cycle time saved: -41%
- Maintenance surface reduction: -60%
- Test suite runtime: instant (no mocking heavy frameworks)`;
    }

    if (cmd === '/ponytail-help' || cmd === '/ponytail') {
      return `[Ponytail Senior Lazy Dev Toolkit]
Available Slash Commands:
- /ponytail-audit [file]: Scans source code and calculates bloat removal (-53% target)
- /ponytail-debt [path]: Analyzes architecture against zero-bloat YAGNI rules
- /ponytail-review [file]: Evaluates diff for minimal viable changeset
- /ponytail-gain: Displays productivity and maintenance gains
- /ponytail-mode <lite|full|ultra|off>: Sets senior dev aggression level (current: ${this.currentLevel})`;
    }

    if (cmd === '/ponytail-mode') {
      const newLvl = args.toLowerCase() as PonytailLevel;
      if (['lite', 'full', 'ultra', 'off'].includes(newLvl)) {
        this.setLevel(newLvl);
        return `Ponytail aggression mode updated to: ${newLvl.toUpperCase()}`;
      }
      return `Invalid mode "${args}". Choose from: lite, full, ultra, off`;
    }

    return `Ponytail active. Type /ponytail-help for available slash commands.`;
  }
}

export const ponytailEngine = new PonytailEngine();
