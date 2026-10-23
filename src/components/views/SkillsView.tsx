import React, { useState } from 'react';
import { Sparkles, Zap, Shield, Layout, Palette, Scissors, Check, Terminal } from 'lucide-react';
import { Button } from '../ui/Button';

import { PonytailLevel } from '../../services/ponytailEngine';

export interface SkillsViewProps {
  onRunSlashCommand?: (cmd: string) => void;
  ponytailLevel?: PonytailLevel;
  onPonytailLevelChange?: (level: PonytailLevel) => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  onRunSlashCommand,
  ponytailLevel: controlledLevel,
  onPonytailLevelChange,
}) => {
  const [internalLevel, setInternalLevel] = useState<PonytailLevel>('full');
  const ponytailLevel = controlledLevel || internalLevel;

  const handleLevelChange = (lvl: PonytailLevel) => {
    setInternalLevel(lvl);
    onPonytailLevelChange?.(lvl);
  };

  const skills = [
    {
      id: 'subhash-uiux',
      name: 'Subhash UI/UX Calm Enterprise',
      icon: <Layout className="w-4 h-4 text-accent" />,
      desc: '4px grid, 4 themes, 10-point governance scoring, max 5% gradients.',
      active: true,
    },
    {
      id: 'subhash-developer',
      name: 'Subhash Developer Council',
      icon: <Shield className="w-4 h-4 text-accent-blue" />,
      desc: 'Electron sandbox hardening, typed IPC, zero-assumption interfaces.',
      active: true,
    },
    {
      id: 'brand-guidelines',
      name: 'Brand Skin & Tokens',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      desc: 'Dark #141413, Light #faf9f5, Terracotta #d97757, Poppins & Lora.',
      active: true,
    },
    {
      id: 'canvas-design',
      name: 'Canvas Design System',
      icon: <Layout className="w-4 h-4 text-emerald-500" />,
      desc: 'Zero-overlap layouts, single-page viewport harmony.',
      active: true,
    },
    {
      id: 'algorithmic-art',
      name: 'Algorithmic Art Engine',
      icon: <Palette className="w-4 h-4 text-purple-400" />,
      desc: 'p5.js seeded art, reproducible integer seeds, parameter controls.',
      active: true,
    },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Active AI Skills & Engines
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
        {/* Ponytail Lazy Senior Dev Engine Card */}
        <div className="p-3 rounded-lg border border-accent/40 bg-accent/5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-text">
              <Scissors className="w-4 h-4 text-accent" />
              <span>Ponytail Lazy Senior Dev</span>
            </div>
            <span className="text-[10px] bg-accent text-white px-1.5 py-0.2 rounded font-mono font-bold">
              -53% CODE
            </span>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            Eliminates unnecessary wrappers, YAGNI bloat, and delivers the smallest complete change with test-first checks on risky paths.
          </p>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] text-text-muted font-medium">Aggression Level:</span>
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-surface rounded border border-border">
              {(['lite', 'full', 'ultra', 'off'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`text-[11px] py-1 rounded font-medium transition-colors ${
                    ponytailLevel === lvl
                      ? 'bg-accent text-white font-bold'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-border/50">
            <span className="text-[10px] text-text-muted w-full mb-0.5">Slash Commands:</span>
            <button
              onClick={() => onRunSlashCommand?.('/ponytail-audit')}
              className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-border text-[10px] font-mono text-text flex items-center gap-1"
            >
              <Terminal className="w-2.5 h-2.5 text-accent" /> /ponytail-audit
            </button>
            <button
              onClick={() => onRunSlashCommand?.('/ponytail-debt')}
              className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-border text-[10px] font-mono text-text flex items-center gap-1"
            >
              <Terminal className="w-2.5 h-2.5 text-accent" /> /ponytail-debt
            </button>
            <button
              onClick={() => onRunSlashCommand?.('/ponytail-review')}
              className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-border text-[10px] font-mono text-text flex items-center gap-1"
            >
              <Terminal className="w-2.5 h-2.5 text-accent" /> /ponytail-review
            </button>
          </div>
        </div>

        {/* Other Core Skills */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Standard Skill Rulebooks ({skills.length})
          </span>
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-2.5 rounded-lg border border-border bg-surface flex flex-col gap-1 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-text text-xs">
                  {skill.icon}
                  <span>{skill.name}</span>
                </div>
                <Check className="w-3.5 h-3.5 text-accent-green" />
              </div>
              <p className="text-[11px] text-text-muted leading-normal">
                {skill.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
