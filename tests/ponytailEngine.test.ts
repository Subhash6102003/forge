import { describe, it, expect, beforeEach } from 'vitest';
import { ponytailEngine } from '../src/services/ponytailEngine';

describe('Ponytail Engine Integration Test Suite', () => {
  beforeEach(() => {
    ponytailEngine.setLevel('full');
  });

  const sampleOverEngineeredCode = `
interface IHeaderPropsWrapper extends React.HTMLAttributes<HTMLDivElement> {
  customConfig?: any;
}

export function Header(props: IHeaderPropsWrapper) {
  const [data, setData] = useState<string>('');

  const memoizedHandler = useCallback(() => {
    console.log('Clicked');
  }, []);

  try {
    return (
      <header className="p-4">
        <h1>Forge</h1>
      </header>
    );
  } catch (err) {
    throw err;
  }
}
  `;

  it('audits over-engineered code and targets ~53% code reduction in full mode', () => {
    const analysis = ponytailEngine.auditCode(sampleOverEngineeredCode);
    expect(analysis.reductionPercentage).toBeGreaterThanOrEqual(50);
    expect(analysis.removedBloat.length).toBeGreaterThan(0);
    expect(analysis.risksIdentified.length).toBeGreaterThan(0);
    expect(analysis.level).toBe('full');
  });

  it('adjusts code reduction ratio according to level: lite, full, ultra, and off', () => {
    const lite = ponytailEngine.auditCode(sampleOverEngineeredCode, 'lite');
    expect(lite.reductionPercentage).toBeCloseTo(30, -1);

    const full = ponytailEngine.auditCode(sampleOverEngineeredCode, 'full');
    expect(full.reductionPercentage).toBeCloseTo(53, -1);

    const ultra = ponytailEngine.auditCode(sampleOverEngineeredCode, 'ultra');
    expect(ultra.reductionPercentage).toBeCloseTo(70, -1);

    const off = ponytailEngine.auditCode(sampleOverEngineeredCode, 'off');
    expect(off.reductionPercentage).toBe(0);
  });

  it('handles /ponytail-audit slash command with arguments', () => {
    const reply = ponytailEngine.handleSlashCommand('/ponytail-audit src/components/Header.tsx', sampleOverEngineeredCode);
    expect(reply).toContain('[Ponytail Audit - Senior Lazy Dev (src/components/Header.tsx)]');
    expect(reply).toContain('Target Lazy Lines:');
    expect(reply).toMatch(/-\d+% code reduction/);
  });

  it('handles /ponytail-debt slash command', () => {
    const reply = ponytailEngine.handleSlashCommand('/ponytail-debt', '');
    expect(reply).toContain('[Ponytail Architectural Debt Review]');
    expect(reply).toContain('Zero third-party dependency bloat');
  });

  it('handles /ponytail-review slash command', () => {
    const reply = ponytailEngine.handleSlashCommand('/ponytail-review', '');
    expect(reply).toContain('[Ponytail Diff Review]');
    expect(reply).toContain('Smallest working diff achieved');
  });

  it('handles /ponytail-gain and /ponytail-help commands', () => {
    const gainReply = ponytailEngine.handleSlashCommand('/ponytail-gain');
    expect(gainReply).toContain('[Ponytail Velocity & Efficiency Gain]');
    expect(gainReply).toContain('-53%');

    const helpReply = ponytailEngine.handleSlashCommand('/ponytail-help');
    expect(helpReply).toContain('[Ponytail Senior Lazy Dev Toolkit]');
    expect(helpReply).toContain('/ponytail-audit');
  });

  it('handles /ponytail-mode switching', () => {
    const modeReply = ponytailEngine.handleSlashCommand('/ponytail-mode ultra');
    expect(modeReply).toContain('ULTRA');
    expect(ponytailEngine.getLevel()).toBe('ultra');

    const invalid = ponytailEngine.handleSlashCommand('/ponytail-mode turbo');
    expect(invalid).toContain('Invalid mode');
  });

  it('handles empty code input without crash', () => {
    const emptyAnalysis = ponytailEngine.auditCode('');
    expect(emptyAnalysis.linesBefore).toBeGreaterThanOrEqual(1);
    expect(emptyAnalysis.linesAfter).toBeGreaterThanOrEqual(1);
    expect(emptyAnalysis.reductionPercentage).toBeGreaterThanOrEqual(0);
  });
});
