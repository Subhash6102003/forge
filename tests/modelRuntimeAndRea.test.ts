import { describe, it, expect } from 'vitest';
import { modelRuntime } from '../src/services/modelRuntimeService';
import { reaClient } from '../src/services/reaClient';

describe('Model Runtime & REA MCP Integration Suite', () => {
  it('detects system hardware capabilities with recommended local models', () => {
    const hw = modelRuntime.detectHardware();
    expect(hw.cpuCores).toBeGreaterThanOrEqual(1);
    expect(hw.totalMemoryGb).toBeGreaterThanOrEqual(8);
    expect(hw.recommendedModel).toBeDefined();
    expect(hw.gpuName).toContain('DirectML/CUDA');
  });

  it('provides configured local models list', async () => {
    const models = await modelRuntime.listModels();
    expect(models).toContain('llama3.1:8b');
    expect(models).toContain('qwen2.5-coder:7b');
  });

  it('streams tokens and calculates real tokens/sec speed', async () => {
    const tokens: string[] = [];
    const result = await modelRuntime.generate({
      model: 'llama3.1:8b',
      prompt: 'Refactor the Header component with clean dropdown',
      onToken: (t) => tokens.push(t),
    });

    expect(tokens.length).toBeGreaterThan(0);
    expect(result.tokensPerSec).toBeGreaterThan(0);
    expect(result.response).toContain('Header');
  });

  it('REA Client lists active processes and inspects AST / IPC hardening', async () => {
    const processes = await reaClient.listProcesses();
    expect(processes.length).toBeGreaterThanOrEqual(3);
    expect(processes.some((p) => p.name.includes('electron.exe'))).toBe(true);
    expect(processes.some((p) => p.name.includes('ollama.exe'))).toBe(true);

    const inspection = await reaClient.inspectProcess(14088);
    expect(inspection.pid).toBe(14088);
    expect(inspection.astNodesCount).toBeGreaterThan(0);
    expect(inspection.ipcChannels).toContain('api.fs');
    expect(inspection.ipcChannels).toContain('api.rea');
    expect(inspection.securityVerdict).toContain('contextIsolation=true');
  });
});
