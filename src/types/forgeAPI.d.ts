import { FileItem } from './index';

export interface ForgeFSAPI {
  getInitialWorkspace: () => Promise<{ folderPath: string; folderName: string; tree: FileItem[] } | null>;
  openFolder: () => Promise<{ folderPath: string; folderName: string; tree: FileItem[] } | null>;
  openFile: () => Promise<{ filePath: string; fileName: string; content: string } | null>;
  getRecentWorkspaces: () => Promise<string[]>;
  openRecentWorkspace: (folderPath: string) => Promise<{ folderPath: string; folderName: string; tree: FileItem[] } | null>;
  readDir: (dirPath: string) => Promise<FileItem[]>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<boolean>;
  createFile: (filePath: string, content?: string) => Promise<boolean>;
  createDirectory: (dirPath: string) => Promise<boolean>;
  rename: (oldPath: string, newPath: string) => Promise<boolean>;
  deleteFile: (filePath: string) => Promise<boolean>;
  getFileStat: (filePath: string) => Promise<{ mtimeMs: number; size: number } | null>;
  createNewProject: (projectName?: string) => Promise<{ folderPath: string; folderName: string; tree: FileItem[] } | null>;
}

export interface ForgeTerminalAPI {
  init: (cwd?: string, forceRestart?: boolean) => Promise<boolean>;
  create?: (id: string, name?: string, cwd?: string) => Promise<{ id: string; name: string; cwd: string }>;
  kill?: (id: string) => Promise<boolean>;
  list?: () => Promise<Array<{ id: string; name: string; cwd: string }>>;
  write: (arg1: string, arg2?: string) => void;
  resize?: (arg1: any, arg2?: any, arg3?: any) => void;
  onData: (callback: (data: any) => void) => () => void;
  onExit?: (callback: (payload: { id: string; exitCode: number }) => void) => () => void;
  writeLocalLLM?: (data: string) => void;
  getLocalLLMHistory?: () => Promise<string>;
  onLocalLLMData?: (callback: (data: string) => void) => () => void;
}

export interface ForgeRunAPI {
  start: (cwd?: string, command?: string) => Promise<{ started: boolean; command: string }>;
  stop: () => Promise<boolean>;
  getStatus: () => Promise<{ running: boolean; url: string }>;
  onOutput: (callback: (data: string) => void) => () => void;
  onUrlDetected: (callback: (url: string) => void) => () => void;
  onStatus: (callback: (status: { running: boolean; command?: string; url?: string; code?: number; error?: string }) => void) => () => void;
}

export interface ForgeShellAPI {
  openExternal: (url: string) => Promise<boolean>;
}

export interface ForgeKeychainAPI {
  setKey: (key: string, value: string) => Promise<boolean>;
  getKey: (key: string) => Promise<string | null>;
  hasKey: (key: string) => Promise<boolean>;
}

export interface ForgeAIAPI {
  log: (entry: any) => Promise<boolean>;
  onLog: (callback: (entry: any) => void) => () => void;
}

export interface GitBranchInfo {
  branch: string;
  upstream: string;
  ahead: number;
  behind: number;
  error?: string;
}

export interface GitCommitItem {
  hash: string;
  shortHash: string;
  author: string;
  email: string;
  timestamp: number;
  relativeTime: string;
  message: string;
  isUnpushed: boolean;
  cicdStatus: 'passed' | 'failed' | 'pending';
}

export interface GitWorkingChanges {
  count: number;
  files: Array<{ status: string; filePath: string }>;
}

export interface GitBlameInfo {
  author: string;
  authorTime: number;
  summary: string;
  hash: string;
  relativeTime: string;
}

export interface ForgeGitAPI {
  getBranchInfo: () => Promise<GitBranchInfo>;
  getCommits: (limit?: number) => Promise<GitCommitItem[]>;
  getWorkingChanges: () => Promise<GitWorkingChanges>;
  getLineBlame: (filePath: string, lineNumber: number) => Promise<GitBlameInfo | null>;
  commit: (message: string) => Promise<string>;
  sync: (action: 'push' | 'pull' | 'fetch') => Promise<{ success: boolean; output: string }>;
}

export interface ForgeVoiceAPI {
  start: () => Promise<{ success: boolean; error?: string }>;
  stop: () => Promise<boolean>;
  onTranscript: (callback: (payload: { text: string; isFinal: boolean }) => void) => () => void;
  onError: (callback: (error: string) => void) => () => void;
  onStopped: (callback: () => void) => () => void;
}

export interface ForgeAPI {
  fs: ForgeFSAPI;
  terminal: ForgeTerminalAPI;
  run: ForgeRunAPI;
  shell: ForgeShellAPI;
  windowControls?: {
    minimize: () => Promise<boolean>;
    maximize: () => Promise<boolean>;
    close: () => Promise<boolean>;
  };
  keychain: ForgeKeychainAPI;
  ai: ForgeAIAPI;
  models: {
    checkHealth: () => Promise<{ ok: boolean; status: string; error?: string }>;
    detectOllama: () => Promise<{ installed: boolean; binaryPath: string | null; running: boolean; models: any[] }>;
    startOllama: () => Promise<{ success: boolean; message: string }>;
    stopOllama: () => Promise<boolean>;
    getCustomModels: () => Promise<any[]>;
    saveCustomModel: (model: any) => Promise<boolean>;
    deleteCustomModel: (modelId: string) => Promise<boolean>;
    scanPorts?: () => Promise<Array<{ port: number; service: string; running: boolean; endpoint: string; models: string[] }>>;
  };
  packages?: {
    install: (packageName: string, isGlobal?: boolean) => Promise<{ success: boolean; message: string }>;
    startLiveServer: (customPath?: string, port?: number) => Promise<{ success: boolean; url: string }>;
  };
  git: ForgeGitAPI;
  rea: {
    inspectProcess: (pid: number) => Promise<any>;
  };
  voice?: ForgeVoiceAPI;
}

declare global {
  interface Window {
    forgeAPI?: ForgeAPI;
  }
}
