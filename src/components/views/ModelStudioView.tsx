import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Check, ExternalLink, Play, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

export interface ModelPortInfo {
  port: number;
  service: string;
  running: boolean;
  endpoint: string;
  models: string[];
}

export interface ModelStudioViewProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const ModelStudioView: React.FC<ModelStudioViewProps> = ({ selectedModel, onModelChange }) => {
  const [ports, setPorts] = useState<ModelPortInfo[]>([
    { port: 11434, service: 'Ollama Engine', running: false, endpoint: 'http://127.0.0.1:11434', models: [] },
    { port: 8000, service: 'Air-LLM / vLLM / FastAPI', running: false, endpoint: 'http://127.0.0.1:8000', models: [] },
    { port: 1234, service: 'LM Studio Runtime', running: false, endpoint: 'http://127.0.0.1:1234', models: [] },
    { port: 5000, service: 'LocalAI / WebUI', running: false, endpoint: 'http://127.0.0.1:5000', models: [] },
    { port: 8080, service: 'llama.cpp Server', running: false, endpoint: 'http://127.0.0.1:8080', models: [] },
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [customPortInput, setCustomPortInput] = useState('');

  const scanPorts = async () => {
    setIsScanning(true);
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.models?.scanPorts) {
      try {
        const results = await forgeAPI.models.scanPorts();
        if (Array.isArray(results)) {
          setPorts(results);
        }
      } catch (err) {
        console.error('Failed to scan ports:', err);
      }
    } else {
      // Browser fallback simulation
      try {
        const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
          const data = await res.json();
          setPorts((prev) =>
            prev.map((p) => (p.port === 11434 ? { ...p, running: true, models: (data.models || []).map((m: any) => m.name) } : p))
          );
        }
      } catch {}
    }
    setIsScanning(false);
  };

  useEffect(() => {
    scanPorts();
    const interval = setInterval(scanPorts, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCustomPort = async (e: React.FormEvent) => {
    e.preventDefault();
    const portNum = parseInt(customPortInput.trim(), 10);
    if (!portNum || isNaN(portNum)) return;

    const newEndpoint = `http://127.0.0.1:${portNum}`;
    const newPortItem: ModelPortInfo = {
      port: portNum,
      service: `Custom Local LLM (Port ${portNum})`,
      running: false,
      endpoint: newEndpoint,
      models: [],
    };

    setPorts((prev) => [...prev, newPortItem]);
    setCustomPortInput('');
    scanPorts();
  };

  const handleSelectModel = (modelId: string, endpoint: string) => {
    onModelChange(modelId);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* View Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-titlebar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-accent" />
          <span>Local Model Studio & Ports</span>
        </span>
        <button
          onClick={scanPorts}
          disabled={isScanning}
          className="p-1 hover:bg-surface-hover rounded text-text-muted hover:text-text transition-colors"
          title="Scan Local Ports"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
        {/* Intro */}
        <p className="text-[11px] text-text-muted leading-relaxed">
          Monitor open-source local LLMs running on your machine (Air-LLM, Ollama, LM Studio, vLLM). Select any model to power the code generation assistant.
        </p>

        {/* Add Custom Port Input */}
        <form onSubmit={handleAddCustomPort} className="flex items-center gap-1.5 p-1.5 bg-surface-active rounded border border-border">
          <input
            type="number"
            value={customPortInput}
            onChange={(e) => setCustomPortInput(e.target.value)}
            placeholder="Add custom port (e.g. 8001)"
            className="flex-1 bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent font-mono"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-accent text-white text-[11px] font-bold rounded hover:opacity-90 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </form>

        {/* Port Status List */}
        <div className="flex flex-col gap-2">
          {ports.map((item) => (
            <div
              key={item.port}
              className={`p-2.5 rounded-lg border flex flex-col gap-2 transition-all ${
                item.running ? 'bg-surface border-emerald-500/40 shadow-xs' : 'bg-surface/50 border-border opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.running ? 'bg-emerald-500 animate-pulse' : 'bg-text-muted/40'}`} />
                  <span className="font-semibold text-text text-xs">{item.service}</span>
                </div>
                <span className="font-mono text-[10px] text-text-muted bg-surface-active px-1.5 py-0.5 rounded border border-border">
                  Port {item.port}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="font-mono text-[10px]">{item.endpoint}</span>
                <span className={`font-semibold text-[10px] ${item.running ? 'text-emerald-400' : 'text-text-muted/60'}`}>
                  {item.running ? 'Online & Listening' : 'Offline / Inactive'}
                </span>
              </div>

              {/* Models Detected */}
              {item.running && item.models.length > 0 && (
                <div className="flex flex-col gap-1 pt-1 border-t border-border/50">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Available Models:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.models.map((mod) => {
                      const modelKey = item.port === 11434 ? `ollama:${mod}` : `custom:${mod}`;
                      const isSelected = selectedModel === modelKey || selectedModel.includes(mod);
                      return (
                        <button
                          key={mod}
                          onClick={() => handleSelectModel(modelKey, item.endpoint)}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-medium flex items-center gap-1 transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'bg-surface hover:bg-surface-hover text-text border border-border'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                          <span>{mod}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {item.running && item.models.length === 0 && (
                <div className="text-[10px] text-amber-400/90 italic pt-0.5">
                  Service active, but no model pulled or loaded into memory.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
