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
    expect(models.length).toBeGreaterThan(0);
    expect(typeof models[0]).toBe('string');
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
  }, 15000);

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

  it('generates cursor-style inline diff hunk for selected code', async () => {
    const diff = await modelRuntime.generateInlineDiff({
      filePath: 'src/components/Header.tsx',
      fileContent: '<button className="px-4 py-1.5 bg-accent">Start a new project</button>',
      selection: '<button className="px-4 py-1.5 bg-accent">Start a new project</button>',
      prompt: "Update the button text to 'Start building'",
    });

    expect(diff.oldText).toContain('Start a new project');
    expect(diff.newText).toContain('Start building');
    expect(diff.tokensPerSec).toBeGreaterThan(0);
  }, 15000);

  it('generates inline diff with empty selection by extracting from fileContent', async () => {
    const diff = await modelRuntime.generateInlineDiff({
      filePath: 'src/main.tsx',
      fileContent: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nconsole.log("hello");',
      prompt: 'uppercase the code',
    });

    expect(diff.oldText).toBeDefined();
    expect(diff.oldText.length).toBeGreaterThan(0);
    expect(diff.newText).toBeDefined();
    expect(diff.tokensPerSec).toBeGreaterThan(0);
  });

  it('supports streaming callback in generateInlineDiff', async () => {
    const streamedTokens: string[] = [];
    const diff = await modelRuntime.generateInlineDiff(
      {
        filePath: 'src/components/Header.tsx',
        fileContent: '<button>Click me</button>',
        selection: '<button>Click me</button>',
        prompt: 'Start building button',
      },
      (t) => streamedTokens.push(t)
    );

    expect(diff.newText).toContain('Start building');
    expect(diff.tokensPerSec).toBeGreaterThan(0);
  });

  it('provides helpful setup instructions when Ollama daemon is offline', () => {
    const instructions = modelRuntime.getSetupInstructions();
    expect(instructions).toContain('ollama serve');
    expect(instructions).toContain('ollama pull');
  });

  it('tracks active model changes and returns configured model name', () => {
    modelRuntime.setModel('qwen2.5-coder:7b');
    expect(modelRuntime.getModel()).toBe('qwen2.5-coder:7b');
    expect(modelRuntime.getStatus().model).toBe('qwen2.5-coder:7b');
  });
});

