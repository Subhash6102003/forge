import { contextBridge, ipcRenderer } from 'electron';

export const forgeAPI = {
  fs: {
    readFile: (path: string) => ipcRenderer.invoke('api:fs:readFile', path),
    writeFile: (path: string, content: string) => ipcRenderer.invoke('api:fs:writeFile', path, content),
  },
  models: {
    checkHealth: () => ipcRenderer.invoke('api:models:checkHealth'),
  },
  rea: {
    inspectProcess: (pid: number) => ipcRenderer.invoke('api:rea:inspectProcess', pid),
  },
};

contextBridge.exposeInMainWorld('forgeAPI', forgeAPI);
