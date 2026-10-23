export type ThemeId = 'modern-stone' | 'enterprise-slate' | 'executive-navy' | 'forest-executive';
export type ThemeMode = 'light' | 'dark';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileItem[];
  content?: string;
  isModified?: boolean;
}

export type AIMode = 'plan' | 'build' | 'ask';

export interface ContextChip {
  id: string;
  label: string;
  type: 'file' | 'selection' | 'folder' | 'project' | 'skill';
  value: string;
  active?: boolean;
}

export interface ChatStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode?: AIMode;
  steps?: ChatStep[];
  contextChips?: ContextChip[];
  codeDiff?: {
    file: string;
    original: string;
    modified: string;
  };
  isStreaming?: boolean;
}

export type PreviewDevice = 'responsive' | 'mobile' | 'tablet' | 'desktop';

export interface InlineEditDiff {
  id: string;
  filePath: string;
  prompt: string;
  originalCode: string;
  proposedCode: string;
  lineNumber: number;
}

export interface ModelRuntimeStatus {
  provider: 'ollama' | 'llamacpp' | 'openai';
  model: string;
  status: 'healthy' | 'warning' | 'offline' | 'downloading';
  tokensPerSecond: number;
  memoryUsageMb?: number;
  gpuAccelerated?: boolean;
}

export interface ReaInspectionTarget {
  id: string;
  name: string;
  type: 'process' | 'binary' | 'webview' | 'ast';
  details: Record<string, any>;
}

export interface AlgorithmicArtConfig {
  seed: number;
  noiseScale: number;
  particleCount: number;
  palette: string[];
  complexity: number;
  speed: number;
}
