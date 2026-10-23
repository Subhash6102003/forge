import React, { useState, useEffect, useRef } from 'react';
import { Palette, Dices, Download, Sparkles, Sliders, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { algorithmicArtEngine } from '../../services/algorithmicArtEngine';

export const ArtStudioView: React.FC = () => {
  const [seed, setSeed] = useState<number>(42);
  const [noiseScale, setNoiseScale] = useState<number>(0.02);
  const [particleCount, setParticleCount] = useState<number>(120);
  const [palette, setPalette] = useState<'brand' | 'stone' | 'executive' | 'forest'>('brand');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    algorithmicArtEngine.renderToCanvas(canvas, {
      seed,
      noiseScale,
      particleCount,
      palette,
    });
  };

  useEffect(() => {
    renderArt();
  }, [seed, noiseScale, particleCount, palette]);

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `forge-art-seed-${seed}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Art Studio: Algorithmic Canvas
          </span>
        </div>
        <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.2 rounded font-mono font-medium">
          p5.js Seeded
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
        {/* Canvas Display */}
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-border bg-black shadow-subtle flex items-center justify-center relative group">
          <canvas
            ref={canvasRef}
            width={480}
            height={270}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="px-2 py-1 bg-surface/90 hover:bg-surface text-text rounded text-[10px] font-medium border border-border shadow-xs flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> PNG
            </button>
          </div>
        </div>

        {/* Seed Controller */}
        <div className="p-2.5 rounded-lg border border-border bg-surface flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-semibold uppercase">Reproducible Seed</span>
            <button
              onClick={handleRandomSeed}
              className="text-[10px] text-accent flex items-center gap-1 hover:underline"
            >
              <Dices className="w-3 h-3" /> Randomize
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
              className="w-full bg-input-bg text-text text-xs p-1.5 rounded border border-border font-mono font-bold"
            />
          </div>
        </div>

        {/* Sliders */}
        <div className="p-2.5 rounded-lg border border-border bg-surface flex flex-col gap-2.5">
          <span className="text-[10px] text-text-muted font-semibold uppercase">Parameters</span>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-text">
              <span>Noise Scale</span>
              <span className="font-mono text-text-muted">{noiseScale}</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.08"
              step="0.005"
              value={noiseScale}
              onChange={(e) => setNoiseScale(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-text">
              <span>Particle Density</span>
              <span className="font-mono text-text-muted">{particleCount}</span>
            </div>
            <input
              type="range"
              min="30"
              max="300"
              step="10"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text">Color Harmony</span>
            <div className="grid grid-cols-2 gap-1.5 mt-0.5">
              {(['brand', 'stone', 'executive', 'forest'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPalette(p)}
                  className={`px-2 py-1 text-[11px] rounded border capitalize text-left transition-colors ${
                    palette === p
                      ? 'bg-accent/15 border-accent text-text font-medium'
                      : 'bg-surface border-border text-text-muted hover:text-text'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
