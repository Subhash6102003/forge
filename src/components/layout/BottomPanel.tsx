import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  AlertTriangle,
  FileText,
  Cpu,
  Trash2,
  X,
  RefreshCw,
  Play,
  Square,
  Copy,
  Check,
  Plus,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export type BottomPanelTab = 'terminal' | 'problems' | 'output' | 'localllm' | 'tasklog';

export interface AILogEntry {
  id?: string;
  timestamp: number;
  type: string;
  message: string;
  details?: any;
}

export interface BottomPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAudit?: () => void;
  workspacePath?: string;
  activeTab?: BottomPanelTab;
  onTabChange?: (tab: BottomPanelTab) => void;
}

export interface TerminalTabItem {
  id: string;
  name: string;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  isOpen,
  onClose,
  onRunAudit,
  workspacePath,
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<BottomPanelTab>('terminal');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const setActiveTab = (tab: BottomPanelTab) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  // Multi-Terminal Sessions State (VS Code / Cursor style)
  const [terminalTabs, setTerminalTabs] = useState<TerminalTabItem[]>([
    { id: 'term-1', name: '1: powershell (Frontend)' },
  ]);
  const [activeTermId, setActiveTermId] = useState<string>('term-1');

  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [aiLogs, setAiLogs] = useState<AILogEntry[]>([]);
  const [isStartingOllama, setIsStartingOllama] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Map of active terminal instances for multi-session support
  const termInstancesMap = useRef<
    Map<
      string,
      {
        term: Terminal;
        fitAddon: FitAddon;
        container: HTMLElement;
        cleanup: () => void;
      }
    >
  >(new Map());

  // References for Local LLM running terminal
  const localLlmContainerRef = useRef<HTMLDivElement | null>(null);
  const localLlmTermInstanceRef = useRef<Terminal | null>(null);
  const localLlmFitAddonRef = useRef<FitAddon | null>(null);

  const outputScrollRef = useRef<HTMLDivElement | null>(null);
  const aiLogScrollRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to real output from child process runner (npm run dev / start / build / live-server)
  useEffect(() => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.run?.onOutput) {
      const cleanup = forgeAPI.run.onOutput((text: string) => {
        setOutputLogs((prev) => [...prev.slice(-500), text]);
      });
      return cleanup;
    }
  }, []);

  // Subscribe to real AI runtime logs
  useEffect(() => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.ai?.onLog) {
      const cleanup = forgeAPI.ai.onLog((entry: AILogEntry) => {
        setAiLogs((prev) => [...prev.slice(-300), entry]);
      });
      return cleanup;
    }
  }, []);

  // Auto-scroll output and aiLogs
  useEffect(() => {
    if (outputScrollRef.current) {
      outputScrollRef.current.scrollTop = outputScrollRef.current.scrollHeight;
    }
  }, [outputLogs]);

  useEffect(() => {
    if (aiLogScrollRef.current) {
      aiLogScrollRef.current.scrollTop = aiLogScrollRef.current.scrollHeight;
    }
  }, [aiLogs]);

  // Terminal Theme Configuration
  const termTheme = {
    background: '#141413',
    foreground: '#E6E4D9',
    cursor: '#D97757',
    selectionBackground: 'rgba(217, 119, 87, 0.3)',
    black: '#141413',
    brightBlack: '#73726C',
    red: '#E06C75',
    brightRed: '#E06C75',
    green: '#98C379',
    brightGreen: '#98C379',
    yellow: '#E5C07B',
    brightYellow: '#E5C07B',
    blue: '#61AFEF',
    brightBlue: '#61AFEF',
    magenta: '#C678DD',
    brightMagenta: '#C678DD',
    cyan: '#56B6C2',
    brightCyan: '#56B6C2',
    white: '#E6E4D9',
    brightWhite: '#FFFFFF',
  };

  // Setup Clipboard for an xterm instance
  const attachClipboardHandlers = (term: Terminal, container: HTMLElement, sendInput: (data: string) => void) => {
    term.attachCustomKeyEventHandler((e: KeyboardEvent) => {
      // Ctrl+C / Cmd+C: If text is highlighted, copy cleanly to OS clipboard
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (term.hasSelection()) {
          if (e.type === 'keydown') {
            const selection = term.getSelection();
            navigator.clipboard.writeText(selection);
          }
          return false; // prevent sending interrupt ^C
        }
      }

      // Ctrl+V / Cmd+V: Paste from OS clipboard
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        if (e.type === 'keydown') {
          navigator.clipboard.readText().then((text) => {
            if (text) {
              sendInput(text);
            }
          }).catch(() => {});
        }
        return false;
      }
      return true;
    });

    const handleContextMenu = async (e: MouseEvent) => {
      e.preventDefault();
      if (term.hasSelection()) {
        const text = term.getSelection();
        await navigator.clipboard.writeText(text);
      } else {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            sendInput(text);
          }
        } catch {}
      }
    };

    container.addEventListener('contextmenu', handleContextMenu);
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
    };
  };

  // Mount/Initialize a PowerShell session for a given terminal ID
  const initOrMountTerminal = (termId: string, containerEl: HTMLElement) => {
    if (termInstancesMap.current.has(termId)) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 12,
      lineHeight: 1.25,
      theme: termTheme,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerEl);

    const forgeAPI = (window as any).forgeAPI;

    const handleResize = () => {
      try {
        fitAddon.fit();
        forgeAPI?.terminal?.resize?.(termId, term.cols, term.rows);
      } catch {}
    };

    const fitTimer = setTimeout(handleResize, 80);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerEl);

    const resizeSub = term.onResize(({ cols, rows }) => {
      forgeAPI?.terminal?.resize?.(termId, cols, rows);
    });

    const cleanupClipboard = attachClipboardHandlers(term, containerEl, (data) => {
      if (forgeAPI?.terminal?.write) {
        forgeAPI.terminal.write(termId, data);
      }
    });

    const termDataSub = term.onData((data: string) => {
      if (forgeAPI?.terminal?.write) {
        forgeAPI.terminal.write(termId, data);
      } else {
        // Web Simulation Mode
        term.write(data);
      }
    });

    if (forgeAPI?.terminal) {
      if (termId === 'term-1') {
        forgeAPI.terminal.init(workspacePath, false);
      } else {
        forgeAPI.terminal.create?.(termId, undefined, workspacePath);
      }
    } else {
      term.writeln('\x1b[38;2;217;119;87mForge PowerShell Terminal (Web Simulation Mode)\x1b[0m');
      term.write(`\r\n\x1b[32mPS ${workspacePath || 'workspace'}>\x1b[0m `);
    }

    termInstancesMap.current.set(termId, {
      term,
      fitAddon,
      container: containerEl,
      cleanup: () => {
        clearTimeout(fitTimer);
        resizeObserver.disconnect();
        resizeSub.dispose();
        cleanupClipboard();
        termDataSub.dispose();
        term.dispose();
      },
    });
  };

  const activeTermIdRef = useRef(activeTermId);
  activeTermIdRef.current = activeTermId;

  // Multi-terminal incoming data dispatcher
  useEffect(() => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.terminal?.onData) {
      const cleanup = forgeAPI.terminal.onData((payload: any) => {
        if (typeof payload === 'object' && payload?.id && typeof payload?.data === 'string') {
          const inst = termInstancesMap.current.get(payload.id);
          if (inst) {
            inst.term.write(payload.data);
          }
        } else if (typeof payload === 'string') {
          // Broadcast to active or primary terminal
          const currentId = activeTermIdRef.current || 'term-1';
          const inst = termInstancesMap.current.get(currentId) || termInstancesMap.current.get('term-1');
          if (inst) {
            inst.term.write(payload);
          }
        }
      });
      return cleanup;
    }
  }, []);

  // Handle terminal session exit
  useEffect(() => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.terminal?.onExit) {
      const cleanup = forgeAPI.terminal.onExit(({ id, exitCode }: { id: string; exitCode: number }) => {
        const inst = termInstancesMap.current.get(id);
        if (inst) {
          inst.term.writeln(`\r\n\x1b[33m[Process completed with code ${exitCode}]\x1b[0m\r\n`);
        }
      });
      return cleanup;
    }
  }, []);

  // Re-fit active terminal whenever activeTab or activeTermId changes
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      try {
        if (activeTab === 'terminal') {
          const inst = termInstancesMap.current.get(activeTermId);
          if (inst) {
            inst.fitAddon.fit();
            inst.term.focus();
            const forgeAPI = (window as any).forgeAPI;
            forgeAPI?.terminal?.resize?.(activeTermId, inst.term.cols, inst.term.rows);
          }
        } else if (activeTab === 'localllm') {
          localLlmFitAddonRef.current?.fit();
          localLlmTermInstanceRef.current?.focus();
        }
      } catch {}
    }, 60);
    return () => clearTimeout(timer);
  }, [activeTab, activeTermId, isOpen]);

  // 2. Initialize Dedicated Local LLM Terminal
  useEffect(() => {
    if (!isOpen || !localLlmContainerRef.current) return;

    if (localLlmTermInstanceRef.current) {
      localLlmTermInstanceRef.current.dispose();
      localLlmTermInstanceRef.current = null;
    }

    const localTerm = new Terminal({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 12,
      lineHeight: 1.25,
      theme: {
        ...termTheme,
        cursor: '#10B981',
      },
      convertEol: true,
    });

    const localFitAddon = new FitAddon();
    localTerm.loadAddon(localFitAddon);
    localTerm.open(localLlmContainerRef.current);

    localLlmTermInstanceRef.current = localTerm;
    localLlmFitAddonRef.current = localFitAddon;

    const fitTimer = setTimeout(() => {
      try {
        localFitAddon.fit();
      } catch {}
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      try {
        localFitAddon.fit();
      } catch {}
    });
    resizeObserver.observe(localLlmContainerRef.current);

    const forgeAPI = (window as any).forgeAPI;

    let cleanupLocalLLMListener: (() => void) | undefined;
    let cleanupClipboard: (() => void) | undefined;

    localTerm.writeln('\x1b[38;2;16;185;129m[Forge Local LLM Runtime Console]\x1b[0m');
    localTerm.writeln('Dedicated execution stream for Ollama, Air-LLM, and local model servers.');
    localTerm.writeln('------------------------------------------------------------------------');

    if (forgeAPI?.terminal?.onLocalLLMData) {
      cleanupClipboard = attachClipboardHandlers(localTerm, localLlmContainerRef.current, (data) => {
        forgeAPI.terminal.writeLocalLLM?.(data);
      });

      cleanupLocalLLMListener = forgeAPI.terminal.onLocalLLMData((data: string) => {
        localTerm.write(data);
      });

      forgeAPI.terminal.getLocalLLMHistory?.().then((hist: string) => {
        if (hist) {
          localTerm.write(hist);
        }
      }).catch(() => {});

      const termDataSub = localTerm.onData((data: string) => {
        forgeAPI.terminal.writeLocalLLM?.(data);
      });

      return () => {
        clearTimeout(fitTimer);
        resizeObserver.disconnect();
        cleanupLocalLLMListener?.();
        cleanupClipboard?.();
        termDataSub.dispose();
        localTerm.dispose();
        localLlmTermInstanceRef.current = null;
        localLlmFitAddonRef.current = null;
      };
    } else {
      localTerm.writeln('[Ollama] Ready to connect to http://127.0.0.1:11434');
      return () => {
        clearTimeout(fitTimer);
        resizeObserver.disconnect();
        localTerm.dispose();
        localLlmTermInstanceRef.current = null;
        localLlmFitAddonRef.current = null;
      };
    }
  }, [isOpen]);

  // Add new PowerShell terminal instance
  const handleAddTerminal = async () => {
    const nextNum = terminalTabs.length + 1;
    const newId = `term-${Date.now()}`;
    const defaultName = `${nextNum}: powershell ${nextNum === 2 ? '(Backend)' : ''}`.trim();

    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.terminal?.create) {
      await forgeAPI.terminal.create(newId, defaultName, workspacePath);
    }

    setTerminalTabs((prev) => [...prev, { id: newId, name: defaultName }]);
    setActiveTermId(newId);
    setActiveTab('terminal');
  };

  // Close / kill terminal instance
  const handleKillTerminal = async (termIdToKill: string) => {
    if (terminalTabs.length <= 1) {
      handleRestartTerminal();
      return;
    }

    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.terminal?.kill) {
      await forgeAPI.terminal.kill(termIdToKill);
    }

    const instance = termInstancesMap.current.get(termIdToKill);
    if (instance) {
      instance.cleanup();
      termInstancesMap.current.delete(termIdToKill);
    }

    setTerminalTabs((prev) => {
      const next = prev.filter((t) => t.id !== termIdToKill);
      if (activeTermId === termIdToKill) {
        setActiveTermId(next[0].id);
      }
      return next;
    });
  };

  const handleClear = () => {
    if (activeTab === 'terminal') {
      const inst = termInstancesMap.current.get(activeTermId);
      inst?.term.clear();
      const forgeAPI = (window as any).forgeAPI;
      forgeAPI?.terminal?.write?.(activeTermId, '\x0c');
    } else if (activeTab === 'output') {
      setOutputLogs([]);
    } else if (activeTab === 'tasklog') {
      setAiLogs([]);
    } else if (activeTab === 'localllm') {
      localLlmTermInstanceRef.current?.clear();
    }
  };

  const handleRestartTerminal = () => {
    const forgeAPI = (window as any).forgeAPI;
    const inst = termInstancesMap.current.get(activeTermId);
    if (inst) {
      inst.term.clear();
    }
    if (forgeAPI?.terminal?.init) {
      forgeAPI.terminal.init(workspacePath, true);
    }
  };

  const handleStartOllamaServer = async () => {
    setIsStartingOllama(true);
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.models?.startOllama) {
      try {
        await forgeAPI.models.startOllama();
      } catch (err: any) {
        if (localLlmTermInstanceRef.current) {
          localLlmTermInstanceRef.current.writeln(`\r\n\x1b[31m[Error] Failed to start Ollama: ${err.message}\x1b[0m\r\n`);
        }
      }
    }
    setIsStartingOllama(false);
  };

  const handleStopOllamaServer = async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.models?.stopOllama) {
      await forgeAPI.models.stopOllama();
    }
  };

  const handleCopyAiLogs = async () => {
    const text = aiLogs.map((l) => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.type}] ${l.message}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedLogId('all');
    setTimeout(() => setCopiedLogId(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="h-[240px] w-full bg-surface border-t border-border flex flex-col shrink-0 select-none overflow-hidden z-20">
      {/* Crisp Single-Line Tab Bar (No Uneven Wrapping) */}
      <div className="flex items-center justify-between px-2.5 border-b border-border bg-titlebar h-9 shrink-0">
        <div className="flex items-center gap-1 text-xs overflow-x-auto no-scrollbar py-0.5">
          {/* Button 1: PowerShell Terminal */}
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'terminal'
                ? 'bg-surface text-text shadow-xs border border-border/60'
                : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="whitespace-nowrap">PowerShell</span>
            {terminalTabs.length > 1 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-accent/20 text-accent font-bold">
                {terminalTabs.length}
              </span>
            )}
          </button>

          {/* Button 2: Problems */}
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'problems'
                ? 'bg-surface text-text shadow-xs border border-border/60'
                : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="whitespace-nowrap">Problems</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/15 text-amber-500 font-bold">0</span>
          </button>

          {/* Button 3: Output */}
          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'output'
                ? 'bg-surface text-text shadow-xs border border-border/60'
                : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-accent-blue shrink-0" />
            <span className="whitespace-nowrap">Output</span>
            {outputLogs.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />}
          </button>

          {/* Button 4: Local LLM Running Terminal */}
          <button
            onClick={() => setActiveTab('localllm')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'localllm'
                ? 'bg-surface text-emerald-400 shadow-xs border border-emerald-500/40'
                : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Local LLM</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </button>

          {/* Button 5: AI Log */}
          <button
            onClick={() => setActiveTab('tasklog')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'tasklog'
                ? 'bg-surface text-text shadow-xs border border-border/60'
                : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="whitespace-nowrap">AI Log</span>
            {aiLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-accent/15 text-accent font-bold shrink-0">
                {aiLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Controls for Current Tab & Terminal Management */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeTab === 'terminal' && (
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              {/* Quick Add Terminal Button in Header */}
              <button
                onClick={handleAddTerminal}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-accent hover:bg-accent/15 font-semibold border border-accent/30 transition-colors"
                title="Add New PowerShell Terminal (Frontend/Backend)"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Add Terminal</span>
              </button>

              <IconButton size="xs" tooltip="Restart PowerShell" onClick={handleRestartTerminal}>
                <RefreshCw className="w-3 h-3" />
              </IconButton>
              <IconButton size="xs" tooltip="Clear Terminal" onClick={handleClear}>
                <Trash2 className="w-3 h-3" />
              </IconButton>
            </div>
          )}

          {activeTab === 'localllm' && (
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <button
                onClick={handleStartOllamaServer}
                disabled={isStartingOllama}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-[10px] font-semibold transition-colors"
                title="Start Ollama Local Runtime"
              >
                <Play className="w-2.5 h-2.5 fill-current" /> Start
              </button>
              <button
                onClick={handleStopOllamaServer}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent-red/20 text-accent-red hover:bg-accent-red/30 text-[10px] font-semibold transition-colors"
                title="Stop Ollama Local Runtime"
              >
                <Square className="w-2.5 h-2.5 fill-current" /> Stop
              </button>
              <IconButton size="xs" tooltip="Clear Local LLM Terminal" onClick={handleClear}>
                <Trash2 className="w-3 h-3" />
              </IconButton>
            </div>
          )}

          {activeTab === 'tasklog' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyAiLogs}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border hover:border-accent text-[10px] text-text font-medium"
                title="Copy all AI logs to clipboard"
              >
                {copiedLogId === 'all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLogId === 'all' ? 'Copied' : 'Copy'}</span>
              </button>
              <IconButton size="xs" tooltip="Clear AI Log" onClick={handleClear}>
                <Trash2 className="w-3 h-3" />
              </IconButton>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="flex items-center gap-1">
              <IconButton size="xs" tooltip="Clear Output" onClick={handleClear}>
                <Trash2 className="w-3 h-3" />
              </IconButton>
            </div>
          )}

          <div className="h-3.5 w-px bg-border mx-0.5" />

          {/* Close Panel Button */}
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1 hover:bg-surface-hover rounded transition-colors"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 bg-editor-bg overflow-hidden relative">
        {/* Tab 1: Multi-Session PowerShell Terminals (VS Code / Cursor Style) */}
        <div className={`w-full h-full flex overflow-hidden ${activeTab === 'terminal' ? 'flex' : 'hidden'}`}>
          {/* Main Active Terminal Canvas */}
          <div className="flex-1 h-full p-2 relative overflow-hidden bg-[#141413]">
            {terminalTabs.map((t) => (
              <div
                key={t.id}
                ref={(el) => {
                  if (el) initOrMountTerminal(t.id, el);
                }}
                className={`w-full h-full ${activeTermId === t.id ? 'block' : 'hidden'}`}
              />
            ))}
          </div>

          {/* Right Sidebar: Active Terminals List & Addon Interface */}
          <div className="w-48 border-l border-border bg-titlebar/90 flex flex-col shrink-0 select-none">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border text-[11px] font-semibold text-text-muted">
              <span className="tracking-wide">TERMINALS</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddTerminal}
                  className="p-1 hover:bg-surface-hover hover:text-text text-text-muted rounded transition-colors"
                  title="New PowerShell Terminal (e.g. Backend / Frontend)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleKillTerminal(activeTermId)}
                  className="p-1 hover:bg-accent-red/20 hover:text-accent-red text-text-muted rounded transition-colors"
                  title="Kill Active Terminal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List of active terminals with add-on buttons */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {terminalTabs.map((t) => {
                const isActive = activeTermId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTermId(t.id)}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-surface text-accent font-semibold shadow-xs border border-accent/25'
                        : 'text-text-muted hover:bg-surface-hover hover:text-text'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <TerminalIcon
                        className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`}
                      />
                      <span className="truncate text-[11px]">{t.name}</span>
                    </div>

                    {terminalTabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKillTerminal(t.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-accent-red hover:text-white rounded text-text-muted transition-all shrink-0 ml-1"
                        title="Close this terminal session"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab 2: Problems */}
        {activeTab === 'problems' && (
          <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2 text-xs">
            <AlertTriangle className="w-6 h-6 text-emerald-500 opacity-60" />
            <span>No problems detected in workspace</span>
            {onRunAudit && (
              <button
                onClick={onRunAudit}
                className="mt-1 px-3 py-1 bg-surface-active hover:bg-surface-hover text-text text-xs rounded border border-border"
              >
                Run Ponytail Code Quality Audit
              </button>
            )}
          </div>
        )}

        {/* Tab 3: Output */}
        {activeTab === 'output' && (
          <div
            ref={outputScrollRef}
            className="w-full h-full p-3 font-mono text-xs text-text overflow-y-auto whitespace-pre-wrap select-text leading-relaxed"
          >
            {outputLogs.length === 0 ? (
              <div className="italic text-text-muted/60">No process output. Run a project command or install packages to see logs.</div>
            ) : (
              outputLogs.map((log, i) => (
                <div key={i} className="py-0.5">
                  {log}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Local LLM Running Terminal */}
        <div
          className={`w-full h-full p-2.5 overflow-hidden ${activeTab === 'localllm' ? 'block' : 'hidden'}`}
          ref={localLlmContainerRef}
        />

        {/* Tab 5: AI Log */}
        {activeTab === 'tasklog' && (
          <div
            ref={aiLogScrollRef}
            className="w-full h-full p-3 font-mono text-xs text-text overflow-y-auto select-text space-y-1.5"
          >
            {aiLogs.length === 0 ? (
              <div className="italic text-text-muted/60">No AI agent logs recorded. Initiate a chat prompt to view live agent traces.</div>
            ) : (
              aiLogs.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2 border-b border-border/40 pb-1.5">
                  <span className="text-[10px] text-text-muted/70 shrink-0 mt-0.5">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0 ${
                      entry.type === 'error'
                        ? 'bg-accent-red/20 text-accent-red'
                        : entry.type === 'model'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {entry.type}
                  </span>
                  <span className="flex-1 text-text whitespace-pre-wrap">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
