import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, Check, X, Terminal, Scissors } from 'lucide-react';
import { CustomSkillsService, CustomSkill } from '../../services/customSkillsService';
import { PonytailLevel } from '../../services/ponytailEngine';

export interface SkillsViewProps {
  onRunSlashCommand?: (cmd: string) => void;
  ponytailLevel?: PonytailLevel;
  onPonytailLevelChange?: (level: PonytailLevel) => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  onRunSlashCommand,
  ponytailLevel = 'full',
  onPonytailLevelChange,
}) => {
  const [skills, setSkills] = useState<CustomSkill[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlash, setNewSlash] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  useEffect(() => {
    const service = CustomSkillsService.getInstance();
    setSkills(service.getSkills());
    const unsub = service.subscribe(() => {
      setSkills(service.getSkills());
    });
    return unsub;
  }, []);

  const handleToggle = (id: string) => {
    CustomSkillsService.getInstance().toggleSkill(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    CustomSkillsService.getInstance().deleteSkill(id);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlash.trim() || !newInstructions.trim()) return;

    CustomSkillsService.getInstance().addSkill({
      name: newName.trim(),
      slashCommand: newSlash.trim().startsWith('/') ? newSlash.trim() : `/${newSlash.trim()}`,
      description: newDesc.trim() || newName.trim(),
      instructions: newInstructions.trim(),
      active: true,
    });

    setNewName('');
    setNewSlash('');
    setNewDesc('');
    setNewInstructions('');
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* View Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-titlebar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Claude-Style AI Skills</span>
        </span>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-white text-[10px] font-bold hover:opacity-90 transition-opacity"
        >
          {showAddForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          <span>{showAddForm ? 'Cancel' : 'Add Skill'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
        {/* Add Skill Form */}
        {showAddForm && (
          <form onSubmit={handleAddSkill} className="p-3 bg-surface-active rounded-lg border border-accent/40 flex flex-col gap-2 animate-slide-up">
            <span className="font-bold text-text text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-accent" /> Create New AI Skill
            </span>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-text-muted font-semibold">Skill Title:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Tailwind Specialist, Algorithm Engine, Security Auditor"
                className="w-full bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-text-muted font-semibold">Slash Command Trigger:</label>
              <input
                type="text"
                value={newSlash}
                onChange={(e) => setNewSlash(e.target.value)}
                placeholder="e.g. /tailwind, /algo, /audit"
                className="w-full bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent font-mono"
                required
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-text-muted font-semibold">Short Description:</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What this skill specializes in..."
                className="w-full bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-text-muted font-semibold">Instructions / Behavioral Guidelines:</label>
              <textarea
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                placeholder="Exact guidelines and constraints the AI will follow when this skill is invoked..."
                rows={3}
                className="w-full bg-input-bg text-text text-xs p-2 rounded border border-border focus:outline-none focus:border-accent resize-none"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-accent text-white font-bold text-xs rounded hover:opacity-90 transition-opacity"
              >
                Save Skill
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-surface border border-border rounded text-xs text-text-muted hover:text-text"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Ponytail Mode Aggression Setting */}
        <div className="p-2.5 rounded-lg border border-accent/30 bg-accent/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-text text-xs">
              <Scissors className="w-3.5 h-3.5 text-accent" />
              <span>Ponytail Optimization Target</span>
            </div>
            <span className="text-[9px] bg-accent text-white px-1.5 py-0.2 rounded font-mono font-bold">
              -53% CODE
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 p-0.5 bg-surface rounded border border-border text-[10px]">
            {(['lite', 'full', 'ultra', 'off'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onPonytailLevelChange?.(lvl)}
                className={`py-0.5 rounded font-mono font-bold uppercase transition-colors ${
                  ponytailLevel === lvl
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* List of Skills */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Configured Skills ({skills.length})
            </span>
            <span className="text-[10px] text-text-muted">Type / in chat to trigger</span>
          </div>

          {skills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => handleToggle(skill.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                skill.active
                  ? 'bg-surface border-accent/50 shadow-xs'
                  : 'bg-surface/50 border-border opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    skill.active ? 'bg-accent border-accent text-white' : 'border-border'
                  }`}>
                    {skill.active && <Check className="w-3 h-3" />}
                  </div>
                  <span className="font-semibold text-text text-xs">{skill.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRunSlashCommand?.(skill.slashCommand);
                    }}
                    className="px-1.5 py-0.5 bg-accent/10 hover:bg-accent/20 text-accent font-mono text-[10px] font-bold rounded border border-accent/30 flex items-center gap-1"
                    title="Insert command into AI Assistant"
                  >
                    <Terminal className="w-2.5 h-2.5" />
                    <span>{skill.slashCommand}</span>
                  </button>

                  {!skill.isBuiltIn && (
                    <button
                      onClick={(e) => handleDelete(skill.id, e)}
                      className="p-1 text-text-muted hover:text-accent-red rounded transition-colors"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-text-muted leading-relaxed pl-6">
                {skill.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
