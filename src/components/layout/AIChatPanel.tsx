import React, { useState, useEffect, useCallback } from 'react';
import { AIMode, ChatMessage as ChatMessageType, ContextChip as ContextChipType } from '../../types';
import { ChatMessage } from '../ui/ChatMessage';
import { ContextChip } from '../ui/ContextChip';
import {
  Send, Paperclip, ChevronDown, Bot, Scissors, X, Square,
  Loader2, AlertTriangle, ExternalLink, Key, RefreshCw, CheckCircle2, Plus, Trash2, Cpu,
  Play, Terminal, Sparkles, Mic, MicOff
} from 'lucide-react';
import { PonytailLevel } from '../../services/ponytailEngine';
import { CustomSkillsService, CustomSkill } from '../../services/customSkillsService';

export interface AIChatPanelProps {
  messages: ChatMessageType[];
  onSendMessage: (content: string, mode: AIMode, context: ContextChipType[]) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  ponytailLevel?: PonytailLevel;
  onPonytailLevelChange?: (level: PonytailLevel) => void;
  onClose?: () => void;
  activeFilePath?: string;
  activeFileContent?: string;
  cursorSelection?: string;
  isStreaming?: boolean;
  onStop?: () => void;
}

interface ModelEntry {
  id: string;
  short: string;
  desc: string;
  badge: 'Local' | 'Cloud' | 'Custom';
  badgeColor: string;
  isCustom?: boolean;
}

interface OllamaModel {
  name: string;
  size?: number;
}

interface CustomModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  baseUrl?: string;
  apiKey?: string;
}

const PROVIDER_PRESETS: Record<string, { name: string; defaultBaseUrl: string; defaultModel: string; keyUrl: string }> = {
  openai: {
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    keyUrl: 'https://console.anthropic.com/keys',
  },
  gemini: {
    name: 'Google Gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-flash',
    keyUrl: 'https://aistudio.google.com/app/apikey',
  },
  deepseek: {
    name: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
  groq: {
    name: 'Groq (Ultra-Fast)',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    keyUrl: 'https://console.groq.com/keys',
  },
  mistral: {
    name: 'Mistral AI',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'codestral-latest',
    keyUrl: 'https://console.mistral.ai/api-keys',
  },
  openrouter: {
    name: 'OpenRouter (All Models)',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    keyUrl: 'https://openrouter.ai/keys',
  },
  custom: {
    name: 'Custom (OpenAI-Compatible)',
    defaultBaseUrl: 'http://localhost:1234/v1',
    defaultModel: 'local-model',
    keyUrl: '',
  },
};

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  messages,
  onSendMessage,
  selectedModel,
  onModelChange,
  ponytailLevel = 'full',
  onPonytailLevelChange,
  onClose,
  activeFilePath,
  activeFileContent,
  cursorSelection,
  isStreaming = false,
  onStop,
}) => {
  // Unified single interface (automatically responds to planning, building, or questions)
  const defaultMode: AIMode = 'build';
  const [input, setInput] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Ollama model detection
  const [ollamaModels, setOllamaModels] = useState<ModelEntry[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline' | 'idle'>('idle');
  const [ollamaInstalled, setOllamaInstalled] = useState<boolean>(false);
  const [isStartingOllama, setIsStartingOllama] = useState<boolean>(false);

  // Custom models saved by user
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);

  // Claude-Style Custom Skills & Slash Suggestions
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([]);
  const [showSlashPopup, setShowSlashPopup] = useState(false);

  useEffect(() => {
    const service = CustomSkillsService.getInstance();
    setCustomSkills(service.getActiveSkills());
    const unsub = service.subscribe(() => {
      setCustomSkills(service.getActiveSkills());
    });
    return unsub;
  }, []);

  // Voice Input SpeechRecognition (Native Windows SAPI Bridge + Browser Web Speech Fallback)
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const voiceCleanupRef = React.useRef<(() => void) | null>(null);

  const stopVoice = useCallback(() => {
    setIsListening(false);
    setInterimTranscript('');
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.voice?.stop) {
      forgeAPI.voice.stop().catch(() => {});
    }
    if (voiceCleanupRef.current) {
      voiceCleanupRef.current();
      voiceCleanupRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const toggleVoiceInput = useCallback(async () => {
    if (isListening) {
      stopVoice();
      return;
    }

    setVoiceError(null);
    setInterimTranscript('');
    const forgeAPI = (window as any).forgeAPI;

    // 1. If running in Electron: use Native Windows SAPI Dictation Engine
    if (forgeAPI?.voice?.start) {
      try {
        setIsListening(true);
        const unsubs: Array<() => void> = [];

        unsubs.push(
          forgeAPI.voice.onTranscript(({ text, isFinal }: { text: string; isFinal: boolean }) => {
            if (isFinal) {
              setInterimTranscript('');
              if (text && text.trim()) {
                setInput((prev) => {
                  const trimmed = prev.trim();
                  return trimmed ? `${trimmed} ${text.trim()}` : text.trim();
                });
              }
            } else {
              setInterimTranscript(text.trim());
            }
          })
        );

        unsubs.push(
          forgeAPI.voice.onError((err: string) => {
            console.warn('Voice recognition warning:', err);
            setVoiceError(err);
            stopVoice();
          })
        );

        unsubs.push(
          forgeAPI.voice.onStopped(() => {
            setIsListening(false);
            setInterimTranscript('');
          })
        );

        voiceCleanupRef.current = () => {
          unsubs.forEach((u) => u());
        };

        const res = await forgeAPI.voice.start();
        if (!res.success) {
          setVoiceError(res.error || 'Microphone audio input unavailable');
          stopVoice();
        }
      } catch (err: any) {
        console.error('Failed to start native voice dictation:', err);
        setVoiceError(err.message || 'Microphone error');
        stopVoice();
      }
      return;
    }

    // 2. Web Browser Fallback (Vite preview in Chrome/Edge)
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceError('Microphone SpeechRecognition is not supported in this browser. Please use Chrome/Edge or Forge Desktop.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }
        if (final.trim()) {
          setInput((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${final.trim()}` : final.trim();
          });
          setInterimTranscript('');
        } else if (interim.trim()) {
          setInterimTranscript(interim.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error !== 'no-speech') {
          setVoiceError(`Microphone error: ${event.error}`);
        }
        stopVoice();
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setVoiceError(err.message || 'Microphone failed to start');
      stopVoice();
    }
  }, [isListening, stopVoice]);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  // Add model form state
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [newModelProvider, setNewModelProvider] = useState<string>('gemini');
  const [newModelName, setNewModelName] = useState<string>('Google Gemini Flash');
  const [newModelApiKey, setNewModelApiKey] = useState<string>('');
  const [newModelId, setNewModelId] = useState<string>('gemini-1.5-flash');
  const [newModelBaseUrl, setNewModelBaseUrl] = useState<string>('https://generativelanguage.googleapis.com/v1beta');
  const [isSavingModel, setIsSavingModel] = useState(false);

  const openUrl = (u: string) => {
    if (!u) return;
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.shell?.openExternal) {
      forgeAPI.shell.openExternal(u).catch(() => window.open(u, '_blank'));
    } else {
      window.open(u, '_blank');
    }
  };

  const fileLabel = activeFilePath ? `Current File (${activeFilePath.split(/[/\\]/).pop()})` : 'Current File';
  const [activeChips, setActiveChips] = useState<ContextChipType[]>([
    { id: '1', label: fileLabel, type: 'file', value: activeFileContent || '', active: !!activeFilePath },
    { id: '2', label: cursorSelection ? `Selection (${cursorSelection.length}c)` : 'Selection', type: 'selection', value: cursorSelection || '', active: !!cursorSelection },
    { id: '3', label: 'Folder', type: 'folder', value: 'folder', active: false },
    { id: '4', label: 'Project', type: 'project', value: 'project', active: true },
  ]);

  useEffect(() => {
    const currentName = activeFilePath ? `Current File (${activeFilePath.split(/[/\\]/).pop()})` : 'Current File';
    setActiveChips((prev) => [
      { id: '1', label: currentName, type: 'file', value: activeFileContent || '', active: prev.find((c) => c.id === '1')?.active ?? !!activeFilePath },
      { id: '2', label: cursorSelection ? `Selection (${cursorSelection.length}c)` : 'Selection', type: 'selection', value: cursorSelection || '', active: prev.find((c) => c.id === '2')?.active ?? !!cursorSelection },
      { id: '3', label: 'Folder', type: 'folder', value: 'folder', active: prev.find((c) => c.id === '3')?.active ?? false },
      { id: '4', label: 'Project', type: 'project', value: 'project', active: prev.find((c) => c.id === '4')?.active ?? true },
    ]);
  }, [activeFilePath, activeFileContent, cursorSelection]);

  // Load custom models
  const loadCustomModels = useCallback(async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.models?.getCustomModels) {
      try {
        const list = await forgeAPI.models.getCustomModels();
        if (Array.isArray(list)) {
          setCustomModels(list);
        }
      } catch {}
    }
  }, []);

  // Detect live Ollama models
  const checkOllama = useCallback(async () => {
    setOllamaStatus('checking');
    const forgeAPI = (window as any).forgeAPI;

    // Detect if binary is on disk
    if (forgeAPI?.models?.detectOllama) {
      try {
        const res = await forgeAPI.models.detectOllama();
        if (res?.installed) {
          setOllamaInstalled(true);
        }
      } catch {}
    }

    try {
      const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('non-200');
      const data = await res.json();
      const models: OllamaModel[] = data.models || [];
      if (models.length === 0) {
        setOllamaModels([]);
        setOllamaStatus('online');
      } else {
        setOllamaModels(
          models.map((m) => ({
            id: `ollama:${m.name}`,
            short: m.name.replace(':latest', ''),
            desc: `${m.size ? Math.round(m.size / 1e9) + 'B params — ' : ''}Local Ollama`,
            badge: 'Local' as const,
            badgeColor: 'text-emerald-500',
          }))
        );
        setOllamaStatus('online');
        if (!selectedModel || selectedModel.startsWith('Local Model (')) {
          onModelChange(`ollama:${models[0].name}`);
        }
      }
    } catch {
      setOllamaStatus('offline');
      setOllamaModels([]);
    }
  }, [selectedModel, onModelChange]);

  const handleStartOllama = async () => {
    setIsStartingOllama(true);
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.models?.startOllama) {
      try {
        await forgeAPI.models.startOllama();
        // Wait and poll until Ollama server answers
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 1200));
          try {
            const res = await fetch('http://localhost:11434/api/tags');
            if (res.ok) {
              await checkOllama();
              break;
            }
          } catch {}
        }
      } catch (err: any) {
        console.error('Failed to start Ollama:', err);
      }
    }
    setIsStartingOllama(false);
  };

  useEffect(() => {
    checkOllama();
    loadCustomModels();
  }, [checkOllama, loadCustomModels]);

  // When changing provider in Add Model form, update defaults
  const handleProviderSelect = (prov: string) => {
    setNewModelProvider(prov);
    const preset = PROVIDER_PRESETS[prov];
    if (preset) {
      setNewModelName(preset.name);
      setNewModelBaseUrl(preset.defaultBaseUrl);
      setNewModelId(preset.defaultModel);
    }
  };

  const handleSaveCustomModel = async () => {
    if (!newModelName.trim() || !newModelId.trim()) return;
    setIsSavingModel(true);
    const forgeAPI = (window as any).forgeAPI;
    const modelToSave: CustomModel = {
      id: `m-${Date.now()}`,
      name: newModelName.trim(),
      provider: newModelProvider,
      modelId: newModelId.trim(),
      baseUrl: newModelBaseUrl.trim() || undefined,
      apiKey: newModelApiKey.trim() || undefined,
    };

    if (forgeAPI?.models?.saveCustomModel) {
      try {
        await forgeAPI.models.saveCustomModel(modelToSave);
        await loadCustomModels();
        onModelChange(modelToSave.id);
        setShowAddModelModal(false);
        setNewModelApiKey('');
      } catch (err: any) {
        alert(`Error saving model: ${err.message}`);
      }
    } else {
      setCustomModels((prev) => [...prev, modelToSave]);
      onModelChange(modelToSave.id);
      setShowAddModelModal(false);
    }
    setIsSavingModel(false);
  };

  const handleDeleteCustomModel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.models?.deleteCustomModel) {
      try {
        await forgeAPI.models.deleteCustomModel(id);
        await loadCustomModels();
        if (selectedModel === id) {
          onModelChange(ollamaModels[0]?.id || 'Local Model (Llama 3.1 8B)');
        }
      } catch {}
    } else {
      setCustomModels((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const allModelEntries: ModelEntry[] = [
    // Custom models added by user
    ...customModels.map((m) => ({
      id: m.id,
      short: m.name,
      desc: `${m.provider.toUpperCase()} (${m.modelId})`,
      badge: 'Custom' as const,
      badgeColor: 'text-accent',
      isCustom: true,
    })),
    // Live Ollama local models
    ...ollamaModels,
  ];

  const currentEntry = allModelEntries.find((m) => m.id === selectedModel);
  const displayName = currentEntry?.short || selectedModel.replace('Local Model (', '').replace(')', '').replace('ollama:', '');

  const toggleChip = (chip: ContextChipType) => {
    setActiveChips((prev) =>
      prev.map((c) => (c.id === chip.id ? { ...c, active: !c.active } : c))
    );
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    if (customModels.length === 0 && (ollamaStatus === 'offline' || ollamaModels.length === 0)) {
      setShowAddModelModal(true);
      return;
    }
    onSendMessage(input, defaultMode, activeChips.filter((c) => c.active));
    setInput('');
  };

  const filteredSkills = customSkills.filter((s) => {
    if (!input.startsWith('/')) return false;
    const query = input.slice(1).toLowerCase().trim();
    if (!query) return true;
    return s.slashCommand.toLowerCase().includes(query) || s.name.toLowerCase().includes(query);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith('/') && !val.includes(' ')) {
      setShowSlashPopup(true);
    } else {
      setShowSlashPopup(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashPopup && (e.key === 'Tab' || (e.key === 'Enter' && filteredSkills.length > 0 && input.trim() === '/'))) {
      e.preventDefault();
      if (filteredSkills[0]) {
        setInput(`${filteredSkills[0].slashCommand} `);
        setShowSlashPopup(false);
      }
      return;
    }
    if (e.key === 'Escape') {
      setShowSlashPopup(false);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setShowSlashPopup(false);
      handleSend();
    }
  };

  return (
    <div className="w-[360px] h-full bg-surface border-l border-border flex flex-col shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-titlebar">
        <div className="flex items-center gap-1.5 font-bold text-xs text-text">
          <Bot className="w-4 h-4 text-accent" />
          <span>AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {onClose && (
            <button onClick={onClose} className="text-text-muted hover:text-text p-1 rounded transition-colors" title="Close AI Panel">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Controls: Ponytail & Model Selection */}
      <div className="p-2.5 border-b border-border/80 flex flex-col gap-2 relative">

        {/* Ponytail Mode Aggression Pill */}
        <div className="flex items-center justify-between p-1.5 bg-accent/5 rounded border border-accent/30 text-[11px]">
          <div className="flex items-center gap-1.5 font-medium text-text">
            <Scissors className="w-3.5 h-3.5 text-accent" />
            <span>Ponytail Mode:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['lite', 'full', 'ultra', 'off'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onPonytailLevelChange?.(lvl)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                  ponytailLevel === lvl
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-text-muted hover:text-text bg-surface'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Universal Model Selector */}
        <div className="relative">
          <div
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center justify-between px-2 py-1.5 bg-input-bg rounded border border-border text-xs text-text cursor-pointer hover:border-accent/60 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                ollamaStatus === 'checking' ? 'bg-amber-500 animate-pulse' :
                isStreaming ? 'bg-accent animate-ping' :
                currentEntry?.badge === 'Custom' ? 'bg-accent' :
                ollamaStatus === 'online' ? 'bg-emerald-500' :
                'bg-amber-500'
              }`} />
              <span className="font-medium truncate">{displayName}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {ollamaStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin text-text-muted" />}
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </div>
          </div>

          {isModelDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-modal p-1 flex flex-col gap-0.5 animate-slide-up text-xs max-h-72 overflow-y-auto">
              {/* Add Custom Model Button */}
              <button
                onClick={() => { setIsModelDropdownOpen(false); setShowAddModelModal(true); }}
                className="flex items-center justify-between p-2 rounded bg-accent/10 border border-accent/30 text-accent font-semibold hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Any AI Key (Gemini, Claude, DeepSeek...)</span>
                </div>
                <Key className="w-3.5 h-3.5" />
              </button>

              {/* Custom Models Section */}
              {customModels.length > 0 && (
                <>
                  <div className="px-2 py-1 text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">
                    Your Configured Models ({customModels.length})
                  </div>
                  {customModels.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => { onModelChange(m.id); setIsModelDropdownOpen(false); }}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedModel === m.id ? 'bg-accent/15 text-text font-medium' : 'hover:bg-surface-hover text-text-muted hover:text-text'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-semibold text-text truncate">{m.name}</span>
                        <span className="text-[10px] text-text-muted font-mono truncate">{m.provider.toUpperCase()} &bull; {m.modelId}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-accent px-1 rounded bg-accent/10">Custom</span>
                        <button
                          onClick={(e) => handleDeleteCustomModel(m.id, e)}
                          className="p-1 text-text-muted hover:text-accent-red rounded"
                          title="Delete model"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Local Ollama Section */}
              <div className="px-2 py-1 text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center justify-between border-t border-border mt-1 pt-1.5">
                <span>Local Models (Ollama)</span>
                <button
                  onClick={(e) => { e.stopPropagation(); checkOllama(); }}
                  className="p-0.5 hover:text-text rounded transition-colors text-text-muted"
                  title="Refresh Ollama models"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {ollamaStatus === 'checking' && (
                <div className="flex items-center gap-2 p-2 text-text-muted">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Checking local Ollama…</span>
                </div>
              )}

              {ollamaStatus === 'offline' && (
                <div className="p-2 flex flex-col gap-1.5 bg-surface-active rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{ollamaInstalled ? 'Ollama Detected (Stopped)' : 'Local Ollama is offline'}</span>
                    </div>
                    {ollamaInstalled && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-1 rounded">Installed</span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {ollamaInstalled
                      ? 'Ollama was detected on disk. Click below to start the server.'
                      : 'Start Ollama with ollama serve in terminal or download it below.'}
                  </p>
                  {ollamaInstalled ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartOllama(); }}
                      disabled={isStartingOllama}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {isStartingOllama ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                      {isStartingOllama ? 'Starting in Terminal…' : 'Start Local LLM (ollama serve)'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); openUrl('https://ollama.com/download'); }}
                        className="flex items-center gap-1 text-accent-blue hover:underline text-[10px] font-semibold cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" /> Download Ollama
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openUrl('https://ollama.com/library'); }}
                        className="flex items-center gap-1 text-accent-blue hover:underline text-[10px] font-semibold cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" /> Model Library
                      </button>
                    </div>
                  )}
                </div>
              )}

              {ollamaStatus === 'online' && ollamaModels.length === 0 && (
                <div className="p-2 flex flex-col gap-1 bg-surface-active rounded">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Ollama online, but no models pulled</span>
                  </div>
                  <p className="text-[10px] text-text-muted">
                    Pull a model via terminal: <code className="font-mono bg-surface px-1 rounded">ollama pull qwen2.5-coder:7b</code>
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); openUrl('https://ollama.com/library'); }}
                    className="flex items-center gap-1 text-accent-blue hover:underline text-[10px] font-semibold mt-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Browse Ollama Models
                  </button>
                </div>
              )}

              {ollamaModels.map((m) => (
                <div
                  key={m.id}
                  onClick={() => { onModelChange(m.id); setIsModelDropdownOpen(false); }}
                  className={`flex flex-col p-2 rounded cursor-pointer transition-colors ${
                    selectedModel === m.id ? 'bg-accent/15 text-text font-medium' : 'hover:bg-surface-hover text-text-muted hover:text-text'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">{m.short}</span>
                    <span className={`text-[10px] font-mono font-bold ${m.badgeColor}`}>{m.badge}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">{m.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context Selector Chips */}
        <div className="flex flex-wrap gap-1 mt-0.5">
          {activeChips.map((chip) => (
            <ContextChip key={chip.id} chip={chip} onToggle={toggleChip} />
          ))}
        </div>
      </div>

      {/* Modal / Form: Add ANY AI Key / Provider */}
      {showAddModelModal && (
        <div className="border-b border-border p-3 bg-surface-active flex flex-col gap-2.5 text-xs animate-slide-up">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="font-bold text-text flex items-center gap-1.5 text-xs">
              <Cpu className="w-4 h-4 text-accent" /> Configure Any AI Model
            </span>
            <button onClick={() => setShowAddModelModal(false)} className="text-text-muted hover:text-text">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Provider Select Grid */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-muted uppercase font-bold">Select AI Provider:</span>
            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto p-0.5">
              {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleProviderSelect(key)}
                  className={`p-1.5 rounded text-left text-[11px] font-medium border transition-colors truncate ${
                    newModelProvider === key
                      ? 'bg-accent/15 border-accent text-accent font-bold'
                      : 'bg-surface border-border text-text-muted hover:text-text'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name Input */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-text-muted font-semibold">Display Name:</label>
            <input
              type="text"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="e.g. Gemini 1.5 Pro, Work DeepSeek, Claude 3.5"
              className="w-full bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
            />
          </div>

          {/* API Key Input */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-text-muted font-semibold">API Key:</label>
              {PROVIDER_PRESETS[newModelProvider]?.keyUrl && (
                <button
                  type="button"
                  onClick={() => openUrl(PROVIDER_PRESETS[newModelProvider].keyUrl)}
                  className="text-[10px] text-accent-blue hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> Get key from {PROVIDER_PRESETS[newModelProvider].name}
                </button>
              )}
            </div>
            <input
              type="password"
              value={newModelApiKey}
              onChange={(e) => setNewModelApiKey(e.target.value)}
              placeholder="Paste your API key here (sk-..., AIza...)"
              className="w-full bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent font-mono"
            />
          </div>

          {/* Model ID Input */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-text-muted font-semibold">Model ID:</label>
            <input
              type="text"
              value={newModelId}
              onChange={(e) => setNewModelId(e.target.value)}
              placeholder="e.g. gemini-1.5-pro, gpt-4o, deepseek-chat"
              className="w-full bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent font-mono"
            />
          </div>

          {/* Optional Base URL Input */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-text-muted font-semibold">Base URL (API Endpoint):</label>
            <input
              type="text"
              value={newModelBaseUrl}
              onChange={(e) => setNewModelBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full bg-input-bg text-text text-[11px] px-2 py-1 rounded border border-border focus:outline-none focus:border-accent font-mono text-text-muted"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSaveCustomModel}
              disabled={isSavingModel || !newModelName.trim() || !newModelId.trim()}
              className="flex-1 py-1.5 bg-accent text-white rounded text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {isSavingModel ? 'Saving…' : 'Save & Use Model'}
            </button>
            <button
              onClick={() => setShowAddModelModal(false)}
              className="px-3 py-1.5 bg-surface border border-border rounded text-xs text-text-muted hover:text-text"
            >
              Cancel
            </button>
          </div>
          <p className="text-[10px] text-text-muted">
            Keys are encrypted using Windows DPAPI keychain. Never sent to third parties.
          </p>
        </div>
      )}

      {/* Chat Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 ? (
          customModels.length === 0 && (ollamaStatus === 'offline' || ollamaModels.length === 0) ? (
            <div className="flex-1 flex flex-col p-3 text-text-muted gap-3 justify-center">
              <div className="text-center flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent mb-1">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-text">Connect an AI Model</h3>
                <p className="text-[11px] text-text-muted">
                  Forge requires either a cloud API key or local Ollama to generate code.
                </p>
              </div>

              {/* Option 1: Cloud API Key */}
              <div className="p-3 bg-surface-active rounded-lg border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-accent" /> Cloud API Key
                  </span>
                  <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-semibold">Recommended</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Use any key: Google Gemini, DeepSeek, OpenAI, Groq, Mistral, or OpenRouter.
                </p>
                <button
                  onClick={() => setShowAddModelModal(true)}
                  className="w-full py-1.5 bg-accent text-white font-bold text-xs rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add API Key
                </button>
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/40 text-[10px]">
                  <button
                    onClick={() => openUrl('https://aistudio.google.com/app/apikey')}
                    className="text-accent-blue hover:underline flex items-center gap-0.5"
                  >
                    <ExternalLink className="w-2.5 h-2.5" /> Free Gemini Key
                  </button>
                  <span className="text-border">•</span>
                  <button
                    onClick={() => openUrl('https://console.groq.com/keys')}
                    className="text-accent-blue hover:underline flex items-center gap-0.5"
                  >
                    <ExternalLink className="w-2.5 h-2.5" /> Free Groq Key
                  </button>
                  <span className="text-border">•</span>
                  <button
                    onClick={() => openUrl('https://platform.deepseek.com/api_keys')}
                    className="text-accent-blue hover:underline flex items-center gap-0.5"
                  >
                    <ExternalLink className="w-2.5 h-2.5" /> DeepSeek Key
                  </button>
                </div>
              </div>

              {/* Option 2: Local AI (Ollama) */}
              <div className="p-3 bg-surface-active rounded-lg border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" /> Local AI (Ollama)
                  </span>
                  {ollamaInstalled ? (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Detected on PC
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-mono">100% Private</span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted">
                  {ollamaInstalled
                    ? 'Ollama was detected on your computer! Launch local runtime with 1 click.'
                    : 'Run models entirely on your GPU/CPU with no API costs.'}
                </p>

                {ollamaInstalled ? (
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={handleStartOllama}
                      disabled={isStartingOllama}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isStartingOllama ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isStartingOllama ? 'Booting Ollama in Terminal…' : 'Start Local LLM (ollama serve)'}
                    </button>
                    <div className="flex items-center justify-between text-[10px] text-text-muted pt-0.5">
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-accent" /> Streams to Terminal
                      </span>
                      <button
                        onClick={() => openUrl('https://ollama.com/library')}
                        className="text-accent-blue hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Model Library
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openUrl('https://ollama.com/download')}
                      className="flex-1 py-1.5 bg-surface border border-border hover:border-accent text-text text-xs font-semibold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-accent" /> Download Ollama
                    </button>
                    <button
                      onClick={() => openUrl('https://ollama.com/library')}
                      className="flex-1 py-1.5 bg-surface border border-border hover:border-accent text-text text-xs font-semibold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-accent" /> Model Library
                    </button>
                  </div>
                )}

                <button
                  onClick={checkOllama}
                  disabled={ollamaStatus === 'checking'}
                  className="text-[10px] text-text-muted hover:text-text flex items-center justify-center gap-1 py-1"
                >
                  <RefreshCw className={`w-3 h-3 ${ollamaStatus === 'checking' ? 'animate-spin' : ''}`} />
                  Re-check local Ollama
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-text-muted">
              <Bot className="w-8 h-8 mb-2 opacity-30 text-accent" />
              <span className="text-xs font-semibold text-text mb-1">AI Assistant Ready</span>
              <p className="text-[11px] max-w-[210px] mb-3">
                Connected to <strong>{displayName}</strong>. Ask anything or propose changes to your code.
              </p>
              <button
                onClick={() => setShowAddModelModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-accent/15 text-accent border border-accent/30 text-[11px] font-semibold hover:bg-accent/25 transition-colors cursor-pointer"
              >
                <Key className="w-3 h-3" /> Add Another Model / Key
              </button>
            </div>
          )
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
      </div>

      {/* Chat Input Box */}
      <div className="p-3 border-t border-border bg-titlebar flex flex-col gap-2">
        <div className="relative">
          {/* Claude-Style Slash Command Autocomplete Popover */}
          {showSlashPopup && filteredSkills.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-surface border border-accent/40 rounded-lg shadow-modal p-1.5 flex flex-col gap-1 z-50 animate-slide-up text-xs max-h-48 overflow-y-auto">
              <div className="px-1.5 py-0.5 text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1 border-b border-border/40 pb-1">
                <Sparkles className="w-3 h-3" /> Select Custom AI Skill (Tab to apply)
              </div>
              {filteredSkills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => {
                    setInput(`${skill.slashCommand} `);
                    setShowSlashPopup(false);
                  }}
                  className="flex items-center justify-between p-1.5 hover:bg-surface-active rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-accent font-bold">{skill.slashCommand}</span>
                    <span className="text-text font-medium">{skill.name}</span>
                  </div>
                  <span className="text-[10px] text-text-muted truncate max-w-[130px]">{skill.description}</span>
                </div>
              ))}
            </div>
          )}

          {isListening && (
            <div className="flex items-center gap-2 mb-1.5 px-2.5 py-1.5 rounded-md bg-accent/15 border border-accent/40 text-[11px] text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping inline-block shrink-0"></span>
              <span className="truncate flex-1">
                {interimTranscript ? (
                  <span className="text-text font-medium italic">&quot;{interimTranscript}&quot;</span>
                ) : (
                  <span>Listening to microphone… Speak prompt clearly</span>
                )}
              </span>
              <button
                type="button"
                onClick={stopVoice}
                className="ml-auto px-2 py-0.5 rounded bg-accent text-white text-[10px] font-semibold hover:opacity-90 cursor-pointer shrink-0"
              >
                Done
              </button>
            </div>
          )}

          {voiceError && (
            <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-1 rounded bg-accent-red/10 border border-accent-red/30 text-[11px] text-accent-red">
              <span className="flex-1 truncate">{voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="text-text-muted hover:text-text cursor-pointer ml-1 text-xs"
              >
                ×
              </button>
            </div>
          )}

          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Guide AI to create, build, plan, or explain code… (Voice or Text)"
            rows={2}
            disabled={isStreaming}
            className="w-full bg-input-bg text-text text-xs p-2.5 pr-20 rounded-md border border-border focus:outline-none focus:border-accent resize-none placeholder:text-text-muted/60 disabled:opacity-70"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-1 rounded transition-all cursor-pointer ${
                isListening
                  ? 'bg-accent text-white animate-pulse'
                  : 'text-text-muted hover:text-text'
              }`}
              title={isListening ? 'Stop listening (Voice active)' : 'Voice input (Speak prompt)'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <button className="text-text-muted hover:text-text p-1 transition-colors" title="Attach file or context">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            {isStreaming ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1 px-2 py-1 rounded bg-accent-red text-white hover:opacity-90 text-[10px] font-bold"
                title="Stop generation"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-1 rounded bg-accent text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
