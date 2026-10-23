import React, { useState } from 'react';
import { Terminal as TerminalIcon, AlertTriangle, FileText, Cpu, Plus, Trash2, X, ChevronDown, SplitSquareVertical, ArrowRight } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export type BottomPanelTab = 'terminal' | 'problems' | 'output' | 'tasklog';

export interface BottomPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAudit?: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ isOpen, onClose, onRunAudit }) => {
  const [activeTab, setActiveTab] = useState<BottomPanelTab>('terminal');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState<Array<{ text: string; type?: 'cmd' | 'info' | 'success' | 'warn' | 'error' }>>([
    { text: 'PS C:\\projects\\my-ai-app> npm run dev', type: 'cmd' },
    { text: '> my-ai-app@0.1.0 dev', type: 'info' },
    { text: '> vite', type: 'info' },
    { text: 'VITE v5.1.0 ready in 342 ms', type: 'success' },
    { text: '➜ Local: http://localhost:5173/', type: 'info' },
    { text: 'Type "help" for a list of available commands.', type: 'info' },
  ]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newLines = [...terminalLines, { text: `PS C:\\projects\\my-ai-app> ${cmd}`, type: 'cmd' as const }];
    const lower = cmd.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setTerminalLines([]);
      setTerminalInput('');
      return;
    }

    if (lower === 'help') {
      newLines.push(
        { text: 'Forge Interactive CLI v1.0.0', type: 'info' },
        { text: '  help            - List available commands', type: 'info' },
        { text: '  status          - Show model runtime & memory status', type: 'info' },
        { text: '  ponytail        - Run Ponytail senior lazy dev audit', type: 'info' },
        { text: '  models          - List configured local models', type: 'info' },
        { text: '  npm test        - Execute test suite', type: 'info' },
        { text: '  clear           - Clear terminal buffer', type: 'info' }
      );
    } else if (lower === 'status') {
      newLines.push(
        { text: '[Runtime Status] Ollama Daemon: Healthy (http://localhost:11434)', type: 'success' },
        { text: '[Hardware] GPU Accelerated (DirectML/CUDA), Allocated VRAM: 5.8 GB', type: 'info' },
        { text: '[Ponytail] Mode: FULL (-53% code bloat target)', type: 'info' }
      );
    } else if (lower === 'ponytail' || lower.includes('audit')) {
      newLines.push(
        { text: '[Ponytail Senior Dev Audit] Scanning project...', type: 'info' },
        { text: '✓ 3 redundant wrapper interfaces eliminated', type: 'success' },
        { text: '✓ Overall code footprint reduction: -53%', type: 'success' }
      );
      onRunAudit?.();
    } else if (lower === 'models') {
      newLines.push(
        { text: 'Configured local models:', type: 'info' },
        { text: ' - llama3.1:8b (Active)', type: 'success' },
        { text: ' - qwen2.5-coder:7b', type: 'info' },
        { text: ' - mistral:7b', type: 'info' }
      );
    } else if (lower === 'npm test') {
      newLines.push(
        { text: 'RUN vitest run', type: 'info' },
        { text: '✓ tests/algorithmicArt.test.ts (4 tests)', type: 'success' },
        { text: '✓ tests/ponytailEngine.test.ts (7 tests)', type: 'success' },
        { text: '✓ tests/skillsRouter.test.ts (4 tests)', type: 'success' },
        { text: '✓ tests/themes.test.ts (2 tests)', type: 'success' },
        { text: 'Test Files: 4 passed | Tests: 17 passed', type: 'success' }
      );
    } else {
      newLines.push({ text: `'${cmd}' is recognized as an internal Forge command. Executed successfully.`, type: 'info' });
    }

    setTerminalLines(newLines);
    setTerminalInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="h-[220px] w-full bg-surface border-t border-border flex flex-col shrink-0 select-none overflow-hidden z-20">
      {/* Panel Tab Bar */}
      <div className="flex items-center justify-between px-3 border-b border-border bg-titlebar h-8 shrink-0">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'terminal' ? 'bg-surface text-text shadow-xs border border-border/50' : 'text-text-muted hover:text-text'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'problems' ? 'bg-surface text-text shadow-xs border border-border/50' : 'text-text-muted hover:text-text'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Problems</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/15 text-amber-500 font-bold">2</span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'output' ? 'bg-surface text-text shadow-xs border border-border/50' : 'text-text-muted hover:text-text'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>

          <button
            onClick={() => setActiveTab('tasklog')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'tasklog' ? 'bg-surface text-text shadow-xs border border-border/50' : 'text-text-muted hover:text-text'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-accent" />
            <span>AI Task Log</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {activeTab === 'terminal' && (
            <div className="flex items-center gap-1 text-[11px] text-text-muted mr-2">
              <span className="font-mono bg-surface-active px-1.5 py-0.5 rounded text-[10px]">interactive</span>
              <IconButton size="xs" tooltip="Clear Terminal" onClick={() => setTerminalLines([])}>
                <Trash2 className="w-3 h-3" />
              </IconButton>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 bg-editor-bg p-3 overflow-y-auto font-mono text-xs text-text flex flex-col">
        {activeTab === 'terminal' && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-1 leading-relaxed">
              {terminalLines.map((line, idx) => {
                let color = 'text-text-muted';
                if (line.type === 'cmd') color = 'text-text font-bold';
                if (line.type === 'success') color = 'text-emerald-400 font-medium';
                if (line.type === 'warn') color = 'text-amber-400 font-medium';
                if (line.type === 'error') color = 'text-rose-400 font-medium';
                return (
                  <div key={idx} className={color}>
                    {line.text}
                  </div>
                );
              })}
            </div>

            {/* Interactive Terminal Command Line */}
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-1 pt-2 border-t border-border/40 mt-2 shrink-0">
              <span className="text-accent font-bold text-xs select-none">PS&gt;</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="type a command (e.g. help, status, ponytail, npm test, clear)..."
                className="flex-1 bg-transparent border-none text-text text-xs focus:outline-none font-mono"
              />
            </form>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="flex flex-col gap-2 font-sans">
            <div className="flex items-center gap-2 p-1.5 rounded hover:bg-surface-hover cursor-pointer border border-border">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>'searchOpen' is declared but its value is never read.</span>
                <span className="font-mono text-[10px] text-text-muted">src/components/Header.tsx [7, 10]</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded hover:bg-surface-hover cursor-pointer border border-border">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>Missing dependency in useEffect array: 'renderArt'.</span>
                <span className="font-mono text-[10px] text-text-muted">src/components/views/ArtStudioView.tsx [82, 6]</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="flex flex-col gap-0.5 text-text-muted">
            <div>[18:24:02] [Forge Engine] Workspace loaded: 43 files, 6 folders</div>
            <div>[18:24:03] [ModelRuntime] Local endpoint checked: Ollama v0.40.4 detected at localhost:11434</div>
            <div>[18:24:03] [ModelRuntime] Selected active model: llama3.1:8b (context window: 8192 tokens)</div>
            <div>[18:24:04] [REA Bridge] Native inspector initialized. PID 14088 attached.</div>
            <div>[18:24:05] [DevServer] Live preview proxy active on port 5173</div>
          </div>
        )}

        {activeTab === 'tasklog' && (
          <div className="flex flex-col gap-1 text-text-muted">
            <div className="text-text font-bold">[Task 101] Plan & Build Header dropdown</div>
            <div className="text-emerald-400">✓ Step 1: Synthesize prompt with Ponytail mode (-53% code rule)</div>
            <div className="text-emerald-400">✓ Step 2: Generated unified diff for src/components/Header.tsx (+12, -4)</div>
            <div className="text-emerald-400">✓ Step 3: Verified zero breaking changes to navbar callers</div>
            <div className="text-text-muted">Status: Waiting for user diff confirmation (Ctrl+I)</div>
          </div>
        )}
      </div>
    </div>
  );
};
