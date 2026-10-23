import { describe, it, expect } from 'vitest';
import { algorithmicArtEngine, ART_PALETTES } from '../src/services/algorithmicArtEngine';

describe('Algorithmic Art Reproducibility Test Suite', () => {
  it('guarantees identical output sequences for identical seeds across multiple runs', () => {
    const seed = 42891;
    const run1 = algorithmicArtEngine.generateSequence(seed, 100);
    const run2 = algorithmicArtEngine.generateSequence(seed, 100);

    expect(run1).toEqual(run2);
    expect(run1.length).toBe(100);
  });

  it('produces distinct sequences for different seeds', () => {
    const runA = algorithmicArtEngine.generateSequence(12345, 50);
    const runB = algorithmicArtEngine.generateSequence(54321, 50);

    expect(runA).not.toEqual(runB);
  });

  it('provides all 4 brand and theme color harmony palettes', () => {
    expect(ART_PALETTES.brand).toBeDefined();
    expect(ART_PALETTES.stone).toBeDefined();
    expect(ART_PALETTES.executive).toBeDefined();
    expect(ART_PALETTES.forest).toBeDefined();

    for (const [key, palette] of Object.entries(ART_PALETTES)) {
      expect(palette.length).toBeGreaterThanOrEqual(4);
      for (const color of palette) {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('handles negative or zero seed gracefully without NaN', () => {
    const seqZero = algorithmicArtEngine.generateSequence(0, 10);
    expect(seqZero.every((v) => !isNaN(v) && v >= 0 && v <= 1)).toBe(true);

    const seqNeg = algorithmicArtEngine.generateSequence(-999, 10);
    expect(seqNeg.every((v) => !isNaN(v) && v >= 0 && v <= 1)).toBe(true);
  });
});
