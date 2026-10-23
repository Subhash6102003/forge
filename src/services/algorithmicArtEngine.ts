export type PaletteKey = 'brand' | 'stone' | 'executive' | 'forest';

export interface ArtConfig {
  seed: number;
  noiseScale: number;
  particleCount: number;
  palette: PaletteKey;
}

export const ART_PALETTES: Record<PaletteKey, string[]> = {
  brand: ['#D97757', '#6A9BCC', '#788C5D', '#FAF9F5', '#141413'],
  stone: ['#4A4A4A', '#707070', '#FAFAF8', '#D97757', '#262626'],
  executive: ['#223A5E', '#405B7D', '#38BDF8', '#F5F7FA', '#0E1726'],
  forest: ['#314D43', '#567265', '#34D399', '#F7F8F6', '#0E1915'],
};

export class AlgorithmicArtEngine {
  /**
   * Linear Congruential Generator (LCG) for deterministic reproducibility.
   * State is isolated and reproducible given the initial seed.
   */
  createRng(seed: number): () => number {
    let s = Math.floor(Math.abs(seed)) || 1;
    return () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  generateSequence(seed: number, count: number): number[] {
    const rng = this.createRng(seed);
    const seq: number[] = [];
    for (let i = 0; i < count; i++) {
      seq.push(rng());
    }
    return seq;
  }

  getPalette(key: PaletteKey): string[] {
    return ART_PALETTES[key] || ART_PALETTES.brand;
  }

  renderToCanvas(canvas: HTMLCanvasElement, config: ArtConfig): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const rng = this.createRng(config.seed);
    const colors = this.getPalette(config.palette);

    // Background fill
    ctx.fillStyle = colors[colors.length - 1];
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1.5;
    for (let i = 0; i < config.particleCount; i++) {
      let x = rng() * width;
      let y = rng() * height;
      const color = colors[Math.floor(rng() * (colors.length - 1))];
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let step = 0; step < 40; step++) {
        const angle = (Math.sin(x * config.noiseScale) + Math.cos(y * config.noiseScale)) * Math.PI * 2;
        x += Math.cos(angle) * 3;
        y += Math.sin(angle) * 3;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

export const algorithmicArtEngine = new AlgorithmicArtEngine();
