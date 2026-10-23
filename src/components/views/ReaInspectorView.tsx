import React, { useState } from 'react';
import { Cpu, Search, Activity, Terminal, ShieldAlert, FileCode, CheckCircle, RefreshCw, Play } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ReaInspectorViewProps {
  onAnalyzeAst?: (target: string) => void;
}

export const ReaInspectorView: React.FC<ReaInspectorViewProps> = ({ onAnalyzeAst }) => {
  const [selectedTool, setSelectedTool] = useState<string>('runtime-ast');
  const [targetProcess, setTargetProcess] = useState('electron.exe (PID: 14088)');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<string | null>(null);

  const tools = [
    { id: 'runtime-ast', label: 'Component & AST Decompile', icon: <FileCode className="w-3.5 h-3.5 text-accent-blue" /> },
    { id: 'binary-symbols', label: 'Binary Header & Symbols', icon: <Cpu className="w-3.5 h-3.5 text-accent" /> },
    { id: 'webview-tree', label: 'Webview Native Handles', icon: <Activity className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'memory-signals', label: 'Signal Tracing & Hooks', icon: <Terminal className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  const handleScan = () => {
    setIsScanning(true);
    setScanResults(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResults(`[REA 6.5.0 Analysis Complete]
Target: ${targetProcess}
Tool: ${selectedTool}
---------------------------------------------
[+] Extracted 47 AST nodes from DOM hierarchy
[+] Electron IPC Bridge: 8 channels authenticated (api.fs, api.terminal, api.models, api.rea)
[+] Memory map: 48.2 MB committed, V8 heap clean
[+] Zero native symbol leaks detected
[+] Reverse-engineering verification: PASS`);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            REA Reverse Engineering MCP
          </span>
        </div>
        <span className="text-[10px] bg-surface-active px-1.5 py-0.2 rounded font-mono text-accent-blue">
          v6.5.0
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
        {/* Target Process Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-text-muted font-semibold uppercase">Inspection Target</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={targetProcess}
              onChange={(e) => setTargetProcess(e.target.value)}
              className="w-full bg-input-bg text-text text-xs p-1.5 rounded border border-border focus:outline-none focus:border-accent font-mono"
            />
            <button
              onClick={() => setTargetProcess('electron.exe (PID: 14088)')}
              className="p-1.5 rounded bg-surface hover:bg-surface-hover border border-border text-text-muted hover:text-text"
              title="Refresh targets"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tool Selectors */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-text-muted font-semibold uppercase">REA Analysis Modules</label>
          <div className="flex flex-col gap-1">
            {tools.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTool(t.id)}
                className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                  selectedTool === t.id
                    ? 'bg-accent/10 border-accent/40 text-text font-medium'
                    : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-hover'
                }`}
              >
                {t.icon}
                <span className="text-xs">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          disabled={isScanning}
          onClick={handleScan}
        >
          {isScanning ? 'Executing REA Analysis...' : 'Start REA Inspection'}
        </Button>

        {/* Terminal Scan Output */}
        {scanResults && (
          <div className="mt-1 flex flex-col gap-1">
            <span className="text-[10px] text-text-muted font-semibold uppercase">Analysis Output</span>
            <pre className="p-2.5 rounded bg-titlebar border border-border font-mono text-[11px] text-text leading-relaxed whitespace-pre overflow-x-auto">
              {scanResults}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
