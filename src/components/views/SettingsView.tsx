import React, { useState, useEffect } from 'react';
import { ThemeId, ThemeMode } from '../../types';
import { Palette, Cpu, Key, Check, ShieldCheck, AlertCircle, Sun, Moon } from 'lucide-react';
import { OpenAIProvider } from '../../services/providers/OpenAIProvider';
import { AnthropicProvider } from '../../services/providers/AnthropicProvider';

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
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [hasAnthropicKey, setHasAnthropicKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [isTestingAnthropic, setIsTestingAnthropic] = useState(false);

  useEffect(() => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.keychain?.hasKey) {
      forgeAPI.keychain.hasKey('openai').then((has: boolean) => setHasOpenaiKey(has));
      forgeAPI.keychain.hasKey('anthropic').then((has: boolean) => setHasAnthropicKey(has));
    }
  }, []);

  const handleSaveOpenAI = async () => {
    if (!openaiKey.trim()) return;
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.keychain?.setKey) {
      await forgeAPI.keychain.setKey('openai', openaiKey.trim());
      setHasOpenaiKey(true);
      setOpenaiKey('');
      setStatusMessage({ text: 'OpenAI API key saved securely in OS Keychain', type: 'success' });
    }
  };

  const handleTestOpenAI = async () => {
    setIsTestingOpenAI(true);
    setStatusMessage(null);
    try {
      const forgeAPI = (window as any).forgeAPI;
      const keyToTest = openaiKey.trim() || (forgeAPI?.keychain?.getKey ? await forgeAPI.keychain.getKey('openai') : '');
      if (!keyToTest) {
        setStatusMessage({ text: 'Please enter an OpenAI API key to test', type: 'error' });
        return;
      }
      const res = await OpenAIProvider.testConnection(keyToTest);
      if (res.ok) {
        setStatusMessage({ text: 'OpenAI connection verified successfully!', type: 'success' });
      } else {
        setStatusMessage({ text: `OpenAI Auth Error: ${res.error}`, type: 'error' });
      }
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  const handleSaveAnthropic = async () => {
    if (!anthropicKey.trim()) return;
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.keychain?.setKey) {
      await forgeAPI.keychain.setKey('anthropic', anthropicKey.trim());
      setHasAnthropicKey(true);
      setAnthropicKey('');
      setStatusMessage({ text: 'Anthropic API key saved securely in OS Keychain', type: 'success' });
    }
  };

  const handleTestAnthropic = async () => {
    setIsTestingAnthropic(true);
    setStatusMessage(null);
    try {
      const forgeAPI = (window as any).forgeAPI;
      const keyToTest = anthropicKey.trim() || (forgeAPI?.keychain?.getKey ? await forgeAPI.keychain.getKey('anthropic') : '');
      if (!keyToTest) {
        setStatusMessage({ text: 'Please enter an Anthropic API key to test', type: 'error' });
        return;
      }
      const res = await AnthropicProvider.testConnection(keyToTest);
      if (res.ok) {
        setStatusMessage({ text: 'Anthropic connection verified successfully!', type: 'success' });
      } else {
        setStatusMessage({ text: `Anthropic Auth Error: ${res.error}`, type: 'error' });
      }
    } finally {
      setIsTestingAnthropic(false);
    }
  };

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
    { id: 'gpt-4o (OpenAI)', name: 'OpenAI GPT-4o (Cloud)', ram: 'Cloud API' },
    { id: 'claude-3-5-sonnet (Anthropic)', name: 'Anthropic Claude 3.5 Sonnet (Cloud)', ram: 'Cloud API' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          IDE & Runtime Settings
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 text-xs">
        {/* Status Toast in Settings */}
        {statusMessage && (
          <div
            className={`p-2.5 rounded-md border flex items-center gap-2 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-accent-green/10 border-accent-green/40 text-emerald-400'
                : 'bg-accent-red/10 border-accent-red/40 text-rose-400'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

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

        {/* Cloud AI Providers & Keychain Storage (Vulnerability 9) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-text font-semibold">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Cloud AI Providers (Encrypted Keychain)</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OS SafeStorage</span>
            </div>
          </div>

          {/* OpenAI Key */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text">OpenAI API Key</span>
              {hasOpenaiKey && (
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Key Saved
                </span>
              )}
            </div>
            <input
              type="password"
              placeholder={hasOpenaiKey ? '•••••••••••••••••••••••• (Key saved)' : 'sk-...'}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-border bg-input-bg text-text focus:outline-none focus:border-accent"
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleSaveOpenAI}
                disabled={!openaiKey.trim()}
                className="px-2.5 py-1 bg-accent text-white rounded text-[11px] font-medium disabled:opacity-50 hover:opacity-90"
              >
                Save Key
              </button>
              <button
                onClick={handleTestOpenAI}
                disabled={isTestingOpenAI || (!openaiKey.trim() && !hasOpenaiKey)}
                className="px-2.5 py-1 bg-surface-active text-text rounded text-[11px] font-medium border border-border hover:bg-surface-hover disabled:opacity-50"
              >
                {isTestingOpenAI ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {/* Anthropic Key */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text">Anthropic API Key</span>
              {hasAnthropicKey && (
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Key Saved
                </span>
              )}
            </div>
            <input
              type="password"
              placeholder={hasAnthropicKey ? '•••••••••••••••••••••••• (Key saved)' : 'sk-ant-...'}
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-border bg-input-bg text-text focus:outline-none focus:border-accent"
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleSaveAnthropic}
                disabled={!anthropicKey.trim()}
                className="px-2.5 py-1 bg-accent text-white rounded text-[11px] font-medium disabled:opacity-50 hover:opacity-90"
              >
                Save Key
              </button>
              <button
                onClick={handleTestAnthropic}
                disabled={isTestingAnthropic || (!anthropicKey.trim() && !hasAnthropicKey)}
                className="px-2.5 py-1 bg-surface-active text-text rounded text-[11px] font-medium border border-border hover:bg-surface-hover disabled:opacity-50"
              >
                {isTestingAnthropic ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        </div>

        {/* Local Model Runtime Settings */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-text font-semibold">
            <Cpu className="w-4 h-4 text-accent-blue" />
            <span>AI Model Runtime Selection</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-text-muted font-semibold uppercase">Active Model</label>
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
              <span>Local Ollama:</span>
              <span className="font-mono text-text">http://localhost:11434</span>
            </div>
            <div className="flex justify-between">
              <span>Hardware Acceleration:</span>
              <span className="text-emerald-500 font-semibold">GPU (CUDA/DirectML) Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
