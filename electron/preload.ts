import { contextBridge, ipcRenderer } from 'electron';

export const forgeAPI = {
  fs: {
    getInitialWorkspace: () => ipcRenderer.invoke('api:fs:getInitialWorkspace'),
    openFolder: () => ipcRenderer.invoke('api:fs:openFolder'),
    openFile: () => ipcRenderer.invoke('api:fs:openFile'),
    getRecentWorkspaces: () => ipcRenderer.invoke('api:fs:getRecentWorkspaces'),
    openRecentWorkspace: (folderPath: string) => ipcRenderer.invoke('api:fs:openRecentWorkspace', folderPath),
    readDir: (dirPath: string) => ipcRenderer.invoke('api:fs:readDir', dirPath),
    readFile: (path: string) => ipcRenderer.invoke('api:fs:readFile', path),
    writeFile: (path: string, content: string) => ipcRenderer.invoke('api:fs:writeFile', path, content),
    createFile: (path: string, content?: string) => ipcRenderer.invoke('api:fs:createFile', path, content),
    createDirectory: (path: string) => ipcRenderer.invoke('api:fs:createDirectory', path),
    rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('api:fs:rename', oldPath, newPath),
    deleteFile: (path: string) => ipcRenderer.invoke('api:fs:deleteFile', path),
    getFileStat: (path: string) => ipcRenderer.invoke('api:fs:getFileStat', path),
    createNewProject: (projectName?: string) => ipcRenderer.invoke('api:fs:createNewProject', projectName),
  },
  terminal: {
    init: (cwd?: string, forceRestart?: boolean) => ipcRenderer.invoke('terminal:init', cwd, forceRestart),
    create: (id: string, name?: string, cwd?: string) => ipcRenderer.invoke('terminal:create', id, name, cwd),
    kill: (id: string) => ipcRenderer.invoke('terminal:kill', id),
    list: () => ipcRenderer.invoke('terminal:list'),
    write: (arg1: string, arg2?: string) => {
      if (arg2 !== undefined) {
        ipcRenderer.send('terminal:write', arg1, arg2);
      } else {
        ipcRenderer.send('terminal:write', arg1);
      }
    },
    resize: (arg1: any, arg2?: any, arg3?: any) => {
      if (arg3 !== undefined) {
        ipcRenderer.send('terminal:resize', arg1, arg2, arg3);
      } else {
        ipcRenderer.send('terminal:resize', arg1, arg2);
      }
    },
    onData: (callback: (data: any) => void) => {
      const listener = (_event: any, data: any) => callback(data);
      ipcRenderer.on('terminal:data', listener);
      return () => {
        ipcRenderer.removeListener('terminal:data', listener);
      };
    },
    onExit: (callback: (payload: { id: string; exitCode: number }) => void) => {
      const listener = (_event: any, payload: any) => callback(payload);
      ipcRenderer.on('terminal:exit', listener);
      return () => {
        ipcRenderer.removeListener('terminal:exit', listener);
      };
    },
    writeLocalLLM: (data: string) => ipcRenderer.send('local-llm:write', data),
    getLocalLLMHistory: () => ipcRenderer.invoke('api:models:getLocalLLMHistory'),
    onLocalLLMData: (callback: (data: string) => void) => {
      const listener = (_event: any, data: string) => callback(data);
      ipcRenderer.on('local-llm:data', listener);
      return () => {
        ipcRenderer.removeListener('local-llm:data', listener);
      };
    },
  },
  run: {
    start: (cwd?: string, command?: string) => ipcRenderer.invoke('api:run:start', cwd, command),
    stop: () => ipcRenderer.invoke('api:run:stop'),
    getStatus: () => ipcRenderer.invoke('api:run:getStatus'),
    onOutput: (callback: (data: string) => void) => {
      const listener = (_event: any, data: string) => callback(data);
      ipcRenderer.on('run:output', listener);
      return () => {
        ipcRenderer.removeListener('run:output', listener);
      };
    },
    onUrlDetected: (callback: (url: string) => void) => {
      const listener = (_event: any, url: string) => callback(url);
      ipcRenderer.on('run:url-detected', listener);
      return () => {
        ipcRenderer.removeListener('run:url-detected', listener);
      };
    },
    onStatus: (callback: (status: { running: boolean; command?: string; url?: string; code?: number; error?: string }) => void) => {
      const listener = (_event: any, status: any) => callback(status);
      ipcRenderer.on('run:status', listener);
      return () => {
        ipcRenderer.removeListener('run:status', listener);
      };
    },
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('api:shell:openExternal', url),
  },
  windowControls: {
    minimize: () => ipcRenderer.invoke('api:window:minimize'),
    maximize: () => ipcRenderer.invoke('api:window:maximize'),
    close: () => ipcRenderer.invoke('api:window:close'),
  },
  keychain: {
    setKey: (key: string, value: string) => ipcRenderer.invoke('api:keychain:set', key, value),
    getKey: (key: string) => ipcRenderer.invoke('api:keychain:get', key),
    hasKey: (key: string) => ipcRenderer.invoke('api:keychain:hasKey', key),
  },
  ai: {
    log: (entry: any) => ipcRenderer.invoke('api:ai:log', entry),
    onLog: (callback: (entry: any) => void) => {
      const listener = (_event: any, entry: any) => callback(entry);
      ipcRenderer.on('ai:log', listener);
      return () => {
        ipcRenderer.removeListener('ai:log', listener);
      };
    },
  },
  models: {
    checkHealth: () => ipcRenderer.invoke('api:models:checkHealth'),
    detectOllama: () => ipcRenderer.invoke('api:models:detectOllama'),
    startOllama: () => ipcRenderer.invoke('api:models:startOllama'),
    stopOllama: () => ipcRenderer.invoke('api:models:stopOllama'),
    getCustomModels: () => ipcRenderer.invoke('api:models:getCustomModels'),
    saveCustomModel: (model: any) => ipcRenderer.invoke('api:models:saveCustomModel', model),
    deleteCustomModel: (modelId: string) => ipcRenderer.invoke('api:models:deleteCustomModel', modelId),
    scanPorts: () => ipcRenderer.invoke('api:models:scanPorts'),
  },
  packages: {
    install: (packageName: string, isGlobal = true) => ipcRenderer.invoke('api:packages:install', packageName, isGlobal),
    startLiveServer: (customPath?: string, port = 8080) => ipcRenderer.invoke('api:packages:startLiveServer', customPath, port),
  },
  git: {
    getBranchInfo: () => ipcRenderer.invoke('api:git:getBranchInfo'),
    getCommits: (limit?: number) => ipcRenderer.invoke('api:git:getCommits', limit),
    getWorkingChanges: () => ipcRenderer.invoke('api:git:getWorkingChanges'),
    getLineBlame: (filePath: string, lineNumber: number) => ipcRenderer.invoke('api:git:getLineBlame', filePath, lineNumber),
    commit: (message: string) => ipcRenderer.invoke('api:git:commit', message),
    sync: (action: 'push' | 'pull' | 'fetch') => ipcRenderer.invoke('api:git:sync', action),
  },
  rea: {
    inspectProcess: (pid: number) => ipcRenderer.invoke('api:rea:inspectProcess', pid),
  },
  voice: {
    start: () => ipcRenderer.invoke('api:voice:start'),
    stop: () => ipcRenderer.invoke('api:voice:stop'),
    onTranscript: (callback: (payload: { text: string; isFinal: boolean }) => void) => {
      const listener = (_event: any, payload: any) => callback(payload);
      ipcRenderer.on('voice:transcript', listener);
      return () => {
        ipcRenderer.removeListener('voice:transcript', listener);
      };
    },
    onError: (callback: (error: string) => void) => {
      const listener = (_event: any, error: string) => callback(error);
      ipcRenderer.on('voice:error', listener);
      return () => {
        ipcRenderer.removeListener('voice:error', listener);
      };
    },
    onStopped: (callback: () => void) => {
      const listener = () => callback();
      ipcRenderer.on('voice:stopped', listener);
      return () => {
        ipcRenderer.removeListener('voice:stopped', listener);
      };
    },
  },
};

contextBridge.exposeInMainWorld('forgeAPI', forgeAPI);
