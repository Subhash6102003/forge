import React from 'react';
import { ThemeId, ThemeMode } from '../../types';
import { Palette, Cpu, HardDrive, Shield, Sun, Moon } from 'lucide-react';

export interface SettingsViewProps {
  currentTheme: ThemeId;
  currentMode: ThemeMode;
  onThemeChange: (theme: ThemeId) => void;
  onModeChange: (mode: ThemeMode) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  currentMode,
  onThemeChange,
  onModeChange,
  selectedModel,
  onModelChange,
}) => {
  const themes: Array<{ id: ThemeId; label: string; primary: string; accent: string }> = [
    { id: 'modern-stone', label: 'Modern Stone (Default)', primary: '#4A4A4A', accent: '#D97757' },
    { id: 'enterprise-slate', label: 'Enterprise Slate', primary: '#2F3A45', accent: '#2563EB' },
    { id: 'executive-navy', label: 'Executive Navy', primary: '#223A5E', accent: '#38BDF8' },
    { id: 'forest-executive', label: 'Forest Executive', primary: '#314D43', accent: '#34D399' },
  ];

  const models = [
    { id: 'llama3.1:8b', name: 'Llama 3.1 8B (Recommended)', ram: '8 GB' },
    { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B', ram: '7 GB' },
    { id: 'codellama:13b', name: 'CodeLlama 13B', ram: '14 GB' },
    { id: 'mistral:7b', name: 'Mistral 7B', ram: '8 GB' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          IDE & Runtime Settings
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 text-xs">
        {/* Appearance & Themes */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-text font-semibold">
            <Palette className="w-4 h-4 text-accent" />
            <span>Theme & Visual System</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-surface">
            <span className="text-text-muted">Mode</span>
            <div className="flex items-center gap-1 bg-surface-active p-0.5 rounded">
              <button
                onClick={() => onModeChange('light')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  currentMode === 'light' ? 'bg-surface text-text shadow-xs font-medium' : 'text-text-muted hover:text-text'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
              </button>
              <button
                onClick={() => onModeChange('dark')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  currentMode === 'dark' ? 'bg-surface text-text shadow-xs font-medium' : 'text-text-muted hover:text-text'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-accent-blue" /> Dark
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-text-muted font-semibold uppercase">Preset Palettes</span>
            <div className="grid grid-cols-1 gap-1.5">
              {themes.map((th) => (
                <div
                  key={th.id}
                  onClick={() => onThemeChange(th.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                    currentTheme === th.id
                      ? 'bg-accent/10 border-accent text-text font-medium'
                      : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1">
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: th.primary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: th.accent }} />
                    </div>
                    <span>{th.label}</span>
                  </div>
                  {currentTheme === th.id && (
                    <span className="text-[10px] text-accent font-bold">ACTIVE</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Local Model Runtime Settings */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-text font-semibold">
            <Cpu className="w-4 h-4 text-accent-blue" />
            <span>Local AI Model Runtime</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-text-muted font-semibold uppercase">Active Local Model</label>
            <div className="flex flex-col gap-1">
              {models.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onModelChange(m.id)}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    selectedModel === m.id
                      ? 'bg-accent-blue/10 border-accent-blue/40 text-text font-medium'
                      : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <span>{m.name}</span>
                  <span className="text-[10px] font-mono text-text-muted">{m.ram}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-surface flex flex-col gap-1 text-[11px] text-text-muted">
            <div className="flex justify-between">
              <span>Endpoint:</span>
              <span className="font-mono text-text">http://localhost:11434</span>
            </div>
            <div className="flex justify-between">
              <span>Hardware Acceleration:</span>
              <span className="text-emerald-500 font-semibold">GPU (CUDA/DirectML) Active</span>
            </div>
            <div className="flex justify-between">
              <span>VRAM Allocated:</span>
              <span className="font-mono text-text">5.8 GB / 12.0 GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
