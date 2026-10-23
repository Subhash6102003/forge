import { describe, it, expect } from 'vitest';
import { skillsRouter } from '../src/services/skillsRouter';

describe('Skills Router Test Suite', () => {
  it('correctly routes ponytail / lazy / yagni requests to ponytail skill', () => {
    const r1 = skillsRouter.route('Help me refactor with ponytail mode');
    expect(r1.some((s) => s.skillId === 'ponytail')).toBe(true);

    const r2 = skillsRouter.route('Remove all bloat and keep it simple yagni');
    expect(r2.some((s) => s.skillId === 'ponytail')).toBe(true);

    const r3 = skillsRouter.route('/ponytail-audit this component');
    expect(r3.some((s) => s.skillId === 'ponytail')).toBe(true);
  });

  it('correctly routes styling / theme requests to subhash-uiux skill', () => {
    const r = skillsRouter.route('Change the button theme colors and 4px spacing');
    expect(r.some((s) => s.skillId === 'subhash-uiux')).toBe(true);
  });

  it('correctly routes art and p5 requests to algorithmic-art skill', () => {
    const r = skillsRouter.route('Generate a seeded generative art canvas with p5');
    expect(r.some((s) => s.skillId === 'algorithmic-art')).toBe(true);
  });

  it('correctly routes reverse engineering and inspection requests to rea skill', () => {
    const r = skillsRouter.route('Decompile the AST and inspect process handles with REA');
    expect(r.some((s) => s.skillId === 'rea')).toBe(true);
  });
});
