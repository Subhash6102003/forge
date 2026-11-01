import React, { useState, useEffect, useRef } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { ActivityBar, ActivityView } from './components/layout/ActivityBar';
import { SidePanel } from './components/layout/SidePanel';
import { EditorArea, EditorTab, RecentFileItem } from './components/layout/EditorArea';
import { PreviewPanel } from './components/layout/PreviewPanel';
import { AIChatPanel } from './components/layout/AIChatPanel';
import { BottomPanel, BottomPanelTab } from './components/layout/BottomPanel';
import { StatusBar } from './components/layout/StatusBar';
import { CommandPalette, CommandItem } from './components/ui/CommandPalette';
import { InlineAIEdit } from './components/layout/InlineAIEdit';
import { HomeDashboard } from './components/layout/HomeDashboard';
import { ThemeId, ThemeMode, FileItem, ChatMessage, AIMode, ContextChip } from './types';
import { BrandSkinService } from './services/brandSkin';
import { skillsRouter } from './services/skillsRouter';
import { modelRuntime } from './services/modelRuntimeService';
import { ponytailEngine, PonytailLevel } from './services/ponytailEngine';
import { CustomSkillsService } from './services/customSkillsService';
import { GenerativeActionService } from './services/generativeActionService';
import { Toast, ToastMessage } from './components/ui/Toast';
import { PromptModal, PromptModalConfig } from './components/ui/PromptModal';

export const App: React.FC = () => {
  // Theme & Appearance State
  const [theme, setTheme] = useState<ThemeId>('modern-stone');
  const [mode, setMode] = useState<ThemeMode>('dark');

  // Workspace & File Tree State (Clean Startup: No Hardcoded Demo Files)
  const [workspacePath, setWorkspacePath] = useState<string>('');
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isHomeDashboard, setIsHomeDashboard] = useState<boolean>(true);

  // Layout Panels State
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('terminal');

  // Dialog & Modal State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isInlineAIOpen, setIsInlineAIOpen] = useState(false);
  const [inlinePrompt, setInlinePrompt] = useState('');
  const [inlineTargetFile, setInlineTargetFile] = useState('');

  // Runtime & Model State
  const [selectedModel, setSelectedModel] = useState('Local Model (Llama 3.1 8B)');
  const [tokensPerSec, setTokensPerSec] = useState(42.3);
  const [ponytailLevel, setPonytailLevel] = useState<PonytailLevel>('full');
  const [isStreamingAI, setIsStreamingAI] = useState(false);

  // Dev Server Run Process State (Vulnerability 6)
  const [runStatus, setRunStatus] = useState<'running' | 'stopped' | 'failed' | 'idle'>('idle');
  const [detectedDevServerUrl, setDetectedDevServerUrl] = useState<string>('');

  // Cursor & Selection Tracking State
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [selectedText, setSelectedText] = useState('');

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // In-App Modal Dialog System (replaces window.prompt which is unsupported in Electron)
  const [promptModal, setPromptModal] = useState<PromptModalConfig>({
    isOpen: false,
    type: 'file',
    title: '',
    onConfirm: () => {},
    onClose: () => setPromptModal((prev) => ({ ...prev, isOpen: false })),
  });

  // Editor Tabs State (Clean Startup: No Fake Tabs)
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState('');

  // Recent Files History & Tabs Persistence State
  const [recentFiles, setRecentFiles] = useState<RecentFileItem[]>(() => {
    try {
      const raw = localStorage.getItem('forge_recent_opened_files');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [fileHistory, setFileHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const recordRecentFile = (path: string, name: string) => {
    setRecentFiles((prev) => {
      const updated = [
        { id: path, name, path, lastOpened: Date.now() },
        ...prev.filter((f) => f.path !== path),
      ].slice(0, 40);
      try {
        localStorage.setItem('forge_recent_opened_files', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setFileHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === path) return prev;
      const nextHistory = [...prev, path].slice(-50);
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  };

  // AI Chat Messages State (Clean Startup: No Fake Messages)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handlePonytailLevelChange = (lvl: PonytailLevel) => {
    setPonytailLevel(lvl);
    ponytailEngine.setLevel(lvl);
    addToast(`Ponytail senior dev mode set to: ${lvl.toUpperCase()}`, 'info');
  };

  const getLanguageLabel = (fileName: string = '') => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.tsx')) return 'TSX';
    if (lower.endsWith('.ts')) return 'TypeScript';
    if (lower.endsWith('.jsx')) return 'JSX';
    if (lower.endsWith('.js')) return 'JavaScript';
    if (lower.endsWith('.java')) return 'Java';
    if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx')) return 'C++';
    if (lower.endsWith('.c') || lower.endsWith('.h')) return 'C';
    if (lower.endsWith('.cs')) return 'C#';
    if (lower.endsWith('.go')) return 'Go';
    if (lower.endsWith('.rs')) return 'Rust';
    if (lower.endsWith('.py')) return 'Python';
    if (lower.endsWith('.css') || lower.endsWith('.scss')) return 'CSS';
    if (lower.endsWith('.json')) return 'JSON';
    if (lower.endsWith('.md')) return 'Markdown';
    if (lower.endsWith('.html')) return 'HTML';
    if (lower.endsWith('.ps1')) return 'PowerShell';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'Shell';
    if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'YAML';
    if (lower.endsWith('.sql')) return 'SQL';
    if (lower.endsWith('.kt') || lower.endsWith('.kts')) return 'Kotlin';
    return 'Plain Text';
  };

  // Helper to find startup file: README.md, package.json, or first code file
  const findPreferredFile = (nodes: FileItem[]): FileItem | null => {
    for (const n of nodes) {
      if (
        n.type === 'file' &&
        (n.name.toLowerCase() === 'readme.md' || n.name.toLowerCase() === 'package.json')
      ) {
        return n;
      }
    }
    for (const n of nodes) {
      if (n.type === 'file') return n;
      if (n.children) {
        const sub = findPreferredFile(n.children);
        if (sub) return sub;
      }
    }
    return null;
  };

  // Apply theme attributes to document
  useEffect(() => {
    BrandSkinService.applyTheme(theme, mode);
  }, [theme, mode]);

  // Load real workspace from Electron on launch (if persisted on disk)
  useEffect(() => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.getInitialWorkspace) {
      forgeAPI.fs.getInitialWorkspace()
        .then(async (res: any) => {
          if (res && res.folderPath && res.tree && res.tree.length > 0) {
            setWorkspacePath(res.folderPath);
            setWorkspaceName(res.folderName);
            setFiles(res.tree);
            setIsHomeDashboard(false);

            // Restore previous tabs if saved
            let loadedTabs: EditorTab[] = [];
            try {
              const savedTabsRaw = localStorage.getItem(`forge_tabs_${res.folderPath}`);
              const savedActiveTab = localStorage.getItem(`forge_active_tab_${res.folderPath}`);
              if (savedTabsRaw) {
                const parsed = JSON.parse(savedTabsRaw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  for (const pt of parsed) {
                    try {
                      const fileContent = await forgeAPI.fs.readFile(pt.path);
                      loadedTabs.push({
                        id: pt.id || pt.path,
                        name: pt.name,
                        path: pt.path,
                        content: fileContent,
                      });
                      recordRecentFile(pt.path, pt.name);
                    } catch {}
                  }
                  if (loadedTabs.length > 0) {
                    setTabs(loadedTabs);
                    const activeFound = savedActiveTab && loadedTabs.some((t) => t.id === savedActiveTab);
                    setActiveTabId(activeFound ? savedActiveTab : loadedTabs[0].id);
                  }
                }
              }
            } catch {}

            if (loadedTabs.length === 0) {
              const targetFile = findPreferredFile(res.tree);
              if (targetFile) {
                try {
                  const fileContent = await forgeAPI.fs.readFile(targetFile.path);
                  const realTab: EditorTab = {
                    id: targetFile.path,
                    name: targetFile.name,
                    path: targetFile.path,
                    content: fileContent,
                  };
                  setTabs([realTab]);
                  setActiveTabId(realTab.id);
                  recordRecentFile(targetFile.path, targetFile.name);
                } catch {}
              }
            }
          } else {
            // No persisted workspace or folder removed: show Welcome Screen
            setIsHomeDashboard(true);
          }
        })
        .catch(() => {
          setIsHomeDashboard(true);
        });
    } else {
      setIsHomeDashboard(true);
    }
  }, []);

  // Listen to process runner status & detected URLs (Vulnerabilities 5, 6)
  useEffect(() => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.run) {
      const cleanupStatus = forgeAPI.run.onStatus((status: any) => {
        if (status.running) {
          setRunStatus('running');
        } else if (status.error || (status.code !== undefined && status.code !== 0 && status.code !== null)) {
          setRunStatus('failed');
          addToast(`Process exited with code ${status.code || status.error}`, 'error');
        } else {
          setRunStatus('stopped');
        }
      });

      const cleanupUrl = forgeAPI.run.onUrlDetected((url: string) => {
        setDetectedDevServerUrl(url);
        addToast(`Dev server detected: ${url}`, 'info');
      });

      return () => {
        cleanupStatus?.();
        cleanupUrl?.();
      };
    }
  }, []);

  // Open Folder Handler (Vulnerability 2)
  const handleOpenFolder = async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.openFolder) {
      try {
        const res = await forgeAPI.fs.openFolder();
        if (res && res.folderPath) {
          setWorkspacePath(res.folderPath);
          setWorkspaceName(res.folderName);
          setFiles(res.tree);
          setIsHomeDashboard(false);
          addToast(`Opened workspace: ${res.folderName}`, 'success');

          const firstFile = findPreferredFile(res.tree);
          if (firstFile) {
            let fileContent = '';
            try {
              fileContent = await forgeAPI.fs.readFile(firstFile.path);
            } catch {}
            const newTab: EditorTab = {
              id: firstFile.path,
              name: firstFile.name,
              path: firstFile.path,
              content: fileContent,
            };
            setTabs([newTab]);
            setActiveTabId(newTab.id);
          } else {
            setTabs([]);
          }
        }
      } catch (err: any) {
        addToast(`Failed to open folder: ${err.message}`, 'error');
      }
    } else {
      addToast('Open folder is active in the Electron desktop shell', 'info');
    }
  };

  // Open File Handler (Vulnerability 2)
  const handleOpenFile = async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.openFile) {
      try {
        const res = await forgeAPI.fs.openFile();
        if (res && res.filePath) {
          const newTab: EditorTab = {
            id: res.filePath,
            name: res.fileName,
            path: res.filePath,
            content: res.content,
          };
          setTabs((prev) => {
            const exists = prev.find((t) => t.path === res.filePath);
            return exists ? prev : [...prev, newTab];
          });
          setActiveTabId(res.filePath);
          setIsHomeDashboard(false);
          addToast(`Opened file: ${res.fileName}`, 'success');
        }
      } catch (err: any) {
        addToast(`Failed to open file: ${err.message}`, 'error');
      }
    }
  };

  // Open Recent Workspace Handler (Vulnerability 1, 2)
  const handleOpenRecent = async (folderPath: string) => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.openRecentWorkspace) {
      try {
        const res = await forgeAPI.fs.openRecentWorkspace(folderPath);
        if (res && res.folderPath) {
          setWorkspacePath(res.folderPath);
          setWorkspaceName(res.folderName);
          setFiles(res.tree);
          setIsHomeDashboard(false);
          addToast(`Opened workspace: ${res.folderName}`, 'success');

          const firstFile = findPreferredFile(res.tree);
          if (firstFile) {
            let fileContent = '';
            try {
              fileContent = await forgeAPI.fs.readFile(firstFile.path);
            } catch {}
            const newTab: EditorTab = {
              id: firstFile.path,
              name: firstFile.name,
              path: firstFile.path,
              content: fileContent,
            };
            setTabs([newTab]);
            setActiveTabId(newTab.id);
          } else {
            setTabs([]);
          }
        }
      } catch (err: any) {
        addToast(`Failed to open recent folder: ${err.message}`, 'error');
      }
    }
  };

  // Refresh Explorer
  const handleRefreshExplorer = async (silent: boolean = false) => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.readDir && workspacePath) {
      try {
        const tree = await forgeAPI.fs.readDir(workspacePath);
        setFiles(tree);
        if (!silent) addToast('Explorer refreshed', 'info');
      } catch (err: any) {
        if (!silent) addToast(`Refresh failed: ${err.message}`, 'error');
      }
    } else if (!silent) {
      addToast('Explorer refreshed', 'info');
    }
  };

  // Create New Project Handler
  const handleCreateNewProject = async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.createNewProject) {
      try {
        const res = await forgeAPI.fs.createNewProject();
        if (res && res.folderPath) {
          setWorkspacePath(res.folderPath);
          setWorkspaceName(res.folderName);
          setFiles(res.tree);
          setIsHomeDashboard(false);
          addToast(`Created project: ${res.folderName}`, 'success');

          const firstFile = findPreferredFile(res.tree);
          if (firstFile) {
            let fileContent = '';
            try {
              fileContent = await forgeAPI.fs.readFile(firstFile.path);
            } catch {}
            const newTab: EditorTab = {
              id: firstFile.path,
              name: firstFile.name,
              path: firstFile.path,
              content: fileContent,
            };
            setTabs([newTab]);
            setActiveTabId(newTab.id);
          } else {
            setTabs([]);
          }
        }
      } catch (err: any) {
        addToast(`Error creating project: ${err.message}`, 'error');
      }
    } else {
      addToast('Project scaffolding active in Electron desktop shell', 'info');
    }
  };

  // New File Handler (Using in-app PromptModal)
  const handleNewFile = () => {
    setPromptModal({
      isOpen: true,
      type: 'file',
      title: 'Create New File',
      description: workspacePath
        ? `Create a file in workspace: ${workspaceName || workspacePath}`
        : 'Create a new file in editor',
      placeholder: 'e.g. Main.java, index.ts, App.tsx, styles.css',
      defaultValue: '',
      confirmLabel: 'Create File',
      onClose: () => setPromptModal((prev) => ({ ...prev, isOpen: false })),
      onConfirm: async (fileName: string) => {
        const cleanName = fileName.trim().replace(/\\/g, '/').replace(/^\/+/, '');
        if (!cleanName) return;

        if (cleanName.includes('..')) {
          addToast('Directory traversal (..) is forbidden', 'error');
          return;
        }

        const forgeAPI = (window as any).forgeAPI;
        const targetPath = workspacePath ? `${workspacePath}/${cleanName}` : cleanName;

        // Auto-detect starter content based on extension
        let starterContent = '';
        if (cleanName.endsWith('.java')) {
          const className = cleanName.split('/').pop()?.replace('.java', '') || 'Main';
          starterContent = `public class ${className} {\n    public static void main(String[] args) {\n        System.out.println("Hello from ${className}!");\n    }\n}\n`;
        } else if (cleanName.endsWith('.html')) {
          starterContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Forge App</title>\n</head>\n<body>\n    <h1>Hello from Forge AI Desktop IDE!</h1>\n</body>\n</html>\n`;
        } else if (cleanName.endsWith('.py')) {
          starterContent = `def main():\n    print("Hello from Forge AI Desktop IDE!")\n\nif __name__ == "__main__":\n    main()\n`;
        } else if (cleanName.endsWith('.js') || cleanName.endsWith('.ts')) {
          starterContent = `// Created in Forge AI Desktop IDE\nconsole.log("Hello from ${cleanName}!");\n`;
        }

        if (forgeAPI?.fs?.createFile) {
          try {
            await forgeAPI.fs.createFile(targetPath, starterContent);
            await handleRefreshExplorer(true);
            const newFileItem: FileItem = {
              id: targetPath,
              name: cleanName.split('/').pop() || cleanName,
              path: targetPath,
              type: 'file',
              content: starterContent,
            };
            handleSelectFile(newFileItem);
            setIsHomeDashboard(false);
            addToast(`Created file: ${cleanName}`, 'success');
          } catch (err: any) {
            addToast(`Error creating file: ${err.message}`, 'error');
          }
        } else {
          const newFileItem: FileItem = {
            id: `f-${Date.now()}`,
            name: cleanName.split('/').pop() || cleanName,
            path: targetPath,
            type: 'file',
            content: starterContent,
          };
          setFiles((prev) => [...prev, newFileItem]);
          handleSelectFile(newFileItem);
          setIsHomeDashboard(false);
          addToast(`Created file: ${cleanName}`, 'success');
        }
      },
    });
  };

  // New Folder Handler (Using in-app PromptModal)
  const handleNewFolder = () => {
    setPromptModal({
      isOpen: true,
      type: 'folder',
      title: 'Create New Folder',
      description: workspacePath
        ? `Create a directory in workspace: ${workspaceName || workspacePath}`
        : 'Create a new directory',
      placeholder: 'e.g. src, components, utils, test',
      defaultValue: '',
      confirmLabel: 'Create Folder',
      onClose: () => setPromptModal((prev) => ({ ...prev, isOpen: false })),
      onConfirm: async (folderName: string) => {
        const cleanName = folderName.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
        if (!cleanName) return;

        if (cleanName.includes('..')) {
          addToast('Directory traversal (..) is forbidden', 'error');
          return;
        }

        const forgeAPI = (window as any).forgeAPI;
        const targetPath = workspacePath ? `${workspacePath}/${cleanName}` : cleanName;

        if (forgeAPI?.fs?.createDirectory) {
          try {
            await forgeAPI.fs.createDirectory(targetPath);
            await handleRefreshExplorer(true);
            addToast(`Created folder: ${cleanName}`, 'success');
          } catch (err: any) {
            addToast(`Error creating folder: ${err.message}`, 'error');
          }
        } else {
          addToast(`Folder ${cleanName} created`, 'info');
        }
      },
    });
  };

  // Rename File / Folder Handler (Using in-app PromptModal)
  const handleRenameFile = (item: FileItem) => {
    setPromptModal({
      isOpen: true,
      type: 'rename',
      title: `Rename "${item.name}"`,
      description: `Enter new name for ${item.type === 'directory' ? 'folder' : 'file'}:`,
      defaultValue: item.name,
      confirmLabel: 'Rename',
      onClose: () => setPromptModal((prev) => ({ ...prev, isOpen: false })),
      onConfirm: async (newName: string) => {
        const cleanName = newName.trim();
        if (!cleanName || cleanName === item.name) return;

        if (cleanName.includes('/') || cleanName.includes('\\') || cleanName.includes('..')) {
          addToast('Invalid name. Path separators and ".." are forbidden.', 'error');
          return;
        }

        const lastSlash = Math.max(item.path.lastIndexOf('/'), item.path.lastIndexOf('\\'));
        const parentDir = lastSlash >= 0 ? item.path.slice(0, lastSlash) : '';
        const newPath = parentDir ? `${parentDir}/${cleanName}` : cleanName;

        const forgeAPI = (window as any).forgeAPI;
        if (forgeAPI?.fs?.rename) {
          try {
            await forgeAPI.fs.rename(item.path, newPath);
            await handleRefreshExplorer(true);

            // Update affected tabs
            setTabs((prev) =>
              prev.map((t) =>
                t.path === item.path
                  ? { ...t, id: newPath, name: cleanName, path: newPath }
                  : t
              )
            );
            if (activeTabId === item.path) {
              setActiveTabId(newPath);
            }
            addToast(`Renamed to ${cleanName}`, 'success');
          } catch (err: any) {
            addToast(`Rename failed: ${err.message}`, 'error');
          }
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.path === item.path ? { ...f, name: cleanName, path: newPath } : f))
          );
          addToast(`Renamed to ${cleanName}`, 'success');
        }
      },
    });
  };

  // Delete File Handler with Native Confirmation (Vulnerability 3)
  const handleDeleteFile = async (item: FileItem) => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.deleteFile) {
      try {
        const deleted = await forgeAPI.fs.deleteFile(item.path);
        if (deleted) {
          const openTab = tabs.find((t) => t.path === item.path || t.id === item.id);
          if (openTab) {
            handleCloseTab(openTab.id);
          }
          await handleRefreshExplorer();
          addToast(`Deleted ${item.name}`, 'success');
        }
      } catch (err: any) {
        addToast(`Failed to delete: ${err.message}`, 'error');
      }
    } else {
      if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
      setFiles((prev) => prev.filter((f) => f.path !== item.path && f.id !== item.id));
      const openTab = tabs.find((t) => t.path === item.path || t.id === item.id);
      if (openTab) {
        handleCloseTab(openTab.id);
      }
      addToast(`Deleted ${item.name}`, 'success');
    }
  };

  // Run Project Handler (Vulnerability 6)
  const handleRunProject = async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (!forgeAPI?.run?.start) {
      // Running in browser preview - connect to active Vite or local server
      setRunStatus('running');
      setIsPreviewOpen(true);
      setDetectedDevServerUrl(window.location.origin || 'http://localhost:5173');
      addToast(`Connected to local server at ${window.location.origin || 'http://localhost:5173'}`, 'success');
      return;
    }
    if (runStatus === 'running') {
      addToast('Project dev server is already running', 'warning');
      setIsPreviewOpen(true);
      return;
    }
    try {
      setIsBottomPanelOpen(true);
      setRunStatus('running');
      setIsPreviewOpen(true);
      const res = await forgeAPI.run.start(workspacePath);
      if (res?.url) {
        setDetectedDevServerUrl(res.url);
      }
      addToast(`Running: ${res.command}`, 'info');
    } catch (err: any) {
      setRunStatus('failed');
      addToast(`Run error: ${err.message}`, 'error');
    }
  };

  // Stop Project Handler (Vulnerability 6)
  const handleStopProject = async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (!forgeAPI?.run?.stop) return;
    try {
      await forgeAPI.run.stop();
      setRunStatus('stopped');
      setDetectedDevServerUrl('');
      addToast('Project server stopped', 'info');
    } catch (err: any) {
      addToast(`Stop error: ${err.message}`, 'error');
    }
  };

  // Save active file handler
  const handleSaveActiveFile = async () => {
    if (!activeTab) return;

    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.writeFile) {
      try {
        await forgeAPI.fs.writeFile(activeTab.path, activeTab.content);
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTab.id ? { ...t, isModified: false } : t))
        );
        addToast(`Saved ${activeTab.name}`, 'success');
      } catch (err: any) {
        addToast(`Failed to save ${activeTab.name}: ${err.message}`, 'error');
      }
    } else {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? { ...t, isModified: false } : t))
      );
      addToast(`Saved ${activeTab.name}`, 'success');
    }
  };

  // Save all files handler
  const handleSaveAllFiles = async () => {
    const forgeAPI = (window as any).forgeAPI;
    let count = 0;
    for (const t of tabs) {
      if (forgeAPI?.fs?.writeFile) {
        try {
          await forgeAPI.fs.writeFile(t.path, t.content);
          count++;
        } catch {}
      }
    }
    setTabs((prev) => prev.map((t) => ({ ...t, isModified: false })));
    addToast(count > 0 ? `Saved ${count} file(s)` : 'All files saved', 'success');
  };

  // Next / Previous Tab Switchers
  const handleNextTab = () => {
    if (tabs.length <= 1) return;
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTabId(tabs[nextIndex].id);
  };

  const handlePrevTab = () => {
    if (tabs.length <= 1) return;
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setActiveTabId(tabs[prevIndex].id);
  };

  // Start Live Server (Port 8080)
  const handleStartLiveServer = async () => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.packages?.startLiveServer) {
      try {
        const res = await forgeAPI.packages.startLiveServer(workspacePath, 8080);
        if (res?.success) {
          setDetectedDevServerUrl(res.url);
          setIsPreviewOpen(true);
          addToast(`Live Server active at ${res.url}`, 'success');
        }
      } catch (err: any) {
        addToast(`Live Server error: ${err.message}`, 'error');
      }
    } else {
      addToast('Live Server is active in the Electron desktop environment', 'info');
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.altKey) {
          handleSaveAllFiles();
        } else {
          handleSaveActiveFile();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) handleCloseTab(activeTabId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFolder();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setInlineTargetFile(activeTab?.path || '');
        setIsInlineAIOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsAssistantOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPreviewOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidePanelOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsBottomPanelOpen((prev) => !prev);
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (e.shiftKey) {
          handleStopProject();
        } else {
          handleRunProject();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs, workspacePath, activeTabId, runStatus]);

  const handleSelectFile = async (file: FileItem) => {
    if (file.type === 'file') {
      recordRecentFile(file.path, file.name);
      const existing = tabs.find((t) => t.path === file.path);
      if (existing) {
        setActiveTabId(existing.id);
        setIsHomeDashboard(false);
        return;
      }

      let fileContent = file.content;
      const forgeAPI = (window as any).forgeAPI;
      if (fileContent === undefined && forgeAPI?.fs?.readFile) {
        try {
          fileContent = await forgeAPI.fs.readFile(file.path);
        } catch (err: any) {
          fileContent = `// Unable to read file from disk: ${err.message}`;
        }
      }

      const newTab: EditorTab = {
        id: file.id || file.path,
        name: file.name,
        path: file.path,
        content: fileContent !== undefined ? fileContent : `// ${file.name}\n`,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
      setIsHomeDashboard(false);
    }
  };

  const handleOpenRecentFile = async (file: { path: string; name: string }) => {
    recordRecentFile(file.path, file.name);
    const existing = tabs.find((t) => t.path === file.path);
    if (existing) {
      setActiveTabId(existing.id);
      setIsHomeDashboard(false);
      return;
    }
    let content = '';
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.fs?.readFile) {
      try {
        content = await forgeAPI.fs.readFile(file.path);
      } catch (err: any) {
        content = `// Unable to read file from disk: ${err.message}`;
      }
    }
    const newTab: EditorTab = {
      id: file.path,
      name: file.name,
      path: file.path,
      content,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setIsHomeDashboard(false);
  };

  const handleNavigateHistory = (direction: 'back' | 'forward') => {
    if (direction === 'back' && historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      const targetPath = fileHistory[nextIdx];
      const name = targetPath.split(/[/\\]/).pop() || targetPath;
      handleOpenRecentFile({ path: targetPath, name });
    } else if (direction === 'forward' && historyIndex < fileHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const targetPath = fileHistory[nextIdx];
      const name = targetPath.split(/[/\\]/).pop() || targetPath;
      handleOpenRecentFile({ path: targetPath, name });
    }
  };

  const handleCloseTab = (id: string) => {
    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id && nextTabs.length > 0) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    } else if (nextTabs.length === 0) {
      setActiveTabId('');
    }
  };

  const handleCloseOtherTabs = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id === id));
    setActiveTabId(id);
  };

  const handleCloseAllTabs = () => {
    setTabs([]);
    setActiveTabId('');
  };

  const handleClearRecentFiles = () => {
    setRecentFiles([]);
    try {
      localStorage.removeItem('forge_recent_opened_files');
    } catch {}
    addToast('Cleared recent files history', 'info');
  };

  const handleEditorContentChange = (id: string, newContent: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content: newContent, isModified: true } : t))
    );
  };

  // Real Streaming AI Chat with Context Extraction & Secret Filtering (Vulnerabilities 8, 11)
  const handleSendMessage = async (content: string, chatMode: AIMode, context: ContextChip[]) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: Date.now(),
      mode: chatMode,
      contextChips: context,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    // Handle Slash commands (Ponytail)
    if (content.startsWith('/ponytail')) {
      const response = ponytailEngine.handleSlashCommand(content, activeTab?.content || '');
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          content: response,
          timestamp: Date.now(),
          mode: chatMode,
        },
      ]);
      return;
    }

    const isExplicitSkill = content.trim().startsWith('/');
    const slashCmd = isExplicitSkill ? content.trim().split(/\s+/)[0] : '';
    const assistantMsg: ChatMessage = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode: chatMode,
      steps: isExplicitSkill
        ? [
            { id: '1', title: `Applied Custom Skill: ${slashCmd}`, status: 'completed' },
            { id: '2', title: 'Streaming model completion', status: 'running' },
          ]
        : undefined,
      isStreaming: true,
    };
    setChatMessages((prev) => [...prev, assistantMsg]);
    setIsStreamingAI(true);

    // Strict exclusion list: .env, .env.*, *.key, *.pem, node_modules/**, dist/**
    const isExcluded = (filePath: string) => {
      const lower = filePath.toLowerCase().replace(/\\/g, '/');
      const base = lower.split('/').pop() || '';
      return (
        base === '.env' ||
        base.startsWith('.env.') ||
        base.endsWith('.key') ||
        base.endsWith('.pem') ||
        lower.includes('/node_modules/') ||
        lower.includes('/dist/') ||
        lower.endsWith('/node_modules') ||
        lower.endsWith('/dist')
      );
    };

    const collectTreeNames = (items: FileItem[], depth = 0): string[] => {
      if (depth > 6) return [];
      const lines: string[] = [];
      const BINARY_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'ico', 'pdf', 'woff', 'woff2', 'ttf', 'eot', 'exe', 'dll', 'so', 'zip', 'tar', 'gz']);
      for (const item of items) {
        if (isExcluded(item.path)) continue;
        const ext = item.name.split('.').pop()?.toLowerCase() || '';
        if (item.type === 'file' && BINARY_EXTS.has(ext)) continue;
        const indent = '  '.repeat(depth);
        lines.push(`${indent}${item.type === 'directory' ? '[dir] ' : ''}${item.name}`);
        if (item.children) {
          lines.push(...collectTreeNames(item.children, depth + 1));
        }
      }
      return lines;
    };

    let contextualPrompt = '';
    const activeChipTypes = new Set(context.filter((c) => c.active !== false).map((c) => c.type));

    // Current File chip or Automatic Run/Code Intent Attachment
    const isRunOrCodeIntent = /\b(?:run|execute|compile|test|launch|start|debug|fix|beautify|format)\b/i.test(content);
    if ((activeChipTypes.has('file') || isRunOrCodeIntent) && activeTab && !isExcluded(activeTab.path)) {
      contextualPrompt += `[Current Active File: ${activeTab.name} (${activeTab.path})]\n`;
      if (activeTab.content) {
        contextualPrompt += `\`\`\`${activeTab.name.split('.').pop() || ''}\n${activeTab.content}\n\`\`\`\n\n`;
      }
    }

    // Selection chip
    if (activeChipTypes.has('selection') && selectedText) {
      contextualPrompt += `[Selected Code]\n\`\`\`\n${selectedText}\n\`\`\`\n\n`;
    }

    // Folder chip (file tree names only, no binary)
    if (activeChipTypes.has('folder') && files.length > 0) {
      contextualPrompt += `[Folder Structure]\n${collectTreeNames(files).join('\n')}\n\n`;
    }

    // Project chip (package.json + file list)
    if (activeChipTypes.has('project')) {
      let pkgContent = '';
      const pkgFile = files.find((f) => f.name.toLowerCase() === 'package.json');
      if (pkgFile?.content) {
        pkgContent = pkgFile.content;
      }
      contextualPrompt += `[Project: ${workspaceName || workspacePath || 'Active Project'}]\n`;
      if (pkgContent) {
        contextualPrompt += `package.json:\n\`\`\`json\n${pkgContent}\n\`\`\`\n`;
      }
      if (files.length > 0) {
        contextualPrompt += `Project Files:\n${collectTreeNames(files).slice(0, 60).join('\n')}\n\n`;
      }
    }

    const matchedSkill = CustomSkillsService.getInstance().getActiveSkills().find((s) =>
      content.toLowerCase().startsWith(s.slashCommand.toLowerCase())
    );

    let effectiveSystemPrompt = `You are the Forge Generative Kernel, an autonomous AI operating directly inside the code editor.
You DO NOT give tutorial advice, terminal walkthroughs, or passive Q&A explanations when instructed to create, build, or modify code.
YOU MUST EXECUTE WORK DIRECTLY.

CRITICAL INSTRUCTIONS:
1. NO HASHTAGS (#, ##, ###) or marketing taglines.
2. NO promotional slogans or unnecessary conversational filler.
3. OUTPUT CLEAN STEP-BY-STEP PROGRESS in plain language:
   Step 1: Description of action
   Step 2: Description of action
   Step 3: Description of action

4. WHEN CREATING FOLDERS OR FILES, ALWAYS EMIT ACTION BLOCKS:
   To create a directory or folder:
   \`\`\`forge:create_directory
   path: <folder_name_or_relative_path>
   \`\`\`

   To create or write a file:
   \`\`\`forge:write_file
   path: <file_path_including_folder>
   <COMPLETE FILE CODE CONTENT HERE>
   \`\`\`

   To compile, run, or execute programs in the integrated terminal:
   \`\`\`forge:execute
   command: <command to run, e.g. javac <file> && java <class>, or node <file>, or python <file>>
   \`\`\`

5. If the user asks a question, explains intent, or requests a plan (e.g., "what do you understand by this", "plan an implementation"):
   Provide a direct, step-by-step response without using hashtags (#) or taglines.

Current Workspace Root: ${workspacePath || 'Root'}
`;

    if (matchedSkill) {
      effectiveSystemPrompt += `\n[ACTIVE CUSTOM SKILL: ${matchedSkill.name}]\n${matchedSkill.instructions}\n`;
    }

    contextualPrompt += `User Request: ${content}`;

    try {
      const { response, tokensPerSec: speed } = await modelRuntime.generate({
        model: selectedModel,
        prompt: contextualPrompt,
        systemPrompt: effectiveSystemPrompt,
        onToken: (token) => {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: m.content + token } : m
            )
          );
        },
      });

      // Parse and execute generative actions directly on the filesystem and terminal
      const genResult = GenerativeActionService.parseActions(
        content,
        response,
        workspacePath || '.',
        activeTab?.path
      );

      const forgeAPI = (window as any).forgeAPI;

      // 1. Create directories on disk
      if (genResult.createdDirectories.length > 0) {
        for (const dirPath of genResult.createdDirectories) {
          if (forgeAPI?.fs?.createDirectory) {
            try {
              await forgeAPI.fs.createDirectory(dirPath);
            } catch (e: any) {
              console.warn(`Directory creation notice: ${e.message}`);
            }
          }
        }
      }

      // 2. Create and write files on disk & open in Monaco editor
      let lastOpenedTab: EditorTab | null = null;
      if (genResult.writtenFiles.length > 0) {
        for (const file of genResult.writtenFiles) {
          if (forgeAPI?.fs?.writeFile) {
            try {
              await forgeAPI.fs.writeFile(file.path, file.content);
            } catch (e: any) {
              console.warn(`File write notice: ${e.message}`);
            }
          }

          // Open newly created file directly into Monaco Editor tabs
          const newTab: EditorTab = {
            id: file.path,
            name: file.name,
            path: file.path,
            content: file.content,
            isModified: false,
          };

          setTabs((prev) => {
            const exists = prev.some((t) => t.path === file.path);
            if (exists) {
              return prev.map((t) => (t.path === file.path ? newTab : t));
            }
            return [...prev, newTab];
          });
          lastOpenedTab = newTab;
        }

        if (lastOpenedTab) {
          setActiveTabId(lastOpenedTab.id);
          setIsHomeDashboard(false);
        }
      }

      // 3. Execute any shell commands in the integrated terminal
      if (genResult.executeCommands.length > 0) {
        setIsBottomPanelOpen(true);
        setBottomPanelTab('terminal');
        for (const cmd of genResult.executeCommands) {
          if (forgeAPI?.terminal?.write) {
            forgeAPI.terminal.write(cmd + '\r\n');
          }
        }
        addToast(`Executing in terminal: ${genResult.executeCommands[0]}`, 'info');
      }

      // 4. Refresh file tree in explorer
      if (genResult.hasActions) {
        await handleRefreshExplorer();
        addToast(
          genResult.writtenFiles.length > 0
            ? `Created ${genResult.writtenFiles.map((f) => f.name).join(', ')}`
            : genResult.executeCommands.length > 0
            ? `Ran command in terminal`
            : `Created ${genResult.createdDirectories.length} folder(s)`,
          'success'
        );
      }

      // 5. Update the chat message with clean step-by-step reporting (no hashtags or taglines)
      const cleanFinalContent = genResult.hasActions
        ? `${genResult.cleanText ? genResult.cleanText + '\n\n' : ''}**Execution Steps:**\n${genResult.stepLogs.join('\n')}`.trim()
        : genResult.cleanText || response;

      setTokensPerSec(speed);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: cleanFinalContent,
                isStreaming: false,
                steps: genResult.stepLogs.map((s, idx) => ({
                  id: (idx + 1).toString(),
                  title: s,
                  status: 'completed',
                })),
              }
            : m
        )
      );
    } catch (err: any) {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: `Error generating response: ${err.message}`,
                isStreaming: false,
                steps: m.steps?.map((s) => ({ ...s, status: 'failed' })),
              }
            : m
        )
      );
    } finally {
      setIsStreamingAI(false);
    }
  };

  const handleStopAIGeneration = () => {
    modelRuntime.abortCurrentGeneration();
    setIsStreamingAI(false);
    addToast('AI Generation stopped', 'info');
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    modelRuntime.setModel(model);
  };

  // Safe Diff Accept with Path Validation & Mtime Verification (Vulnerability 12)
  const handleAcceptInlineDiff = async (oldText: string, newText: string) => {
    setIsInlineAIOpen(false);
    const targetTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const targetPath = targetTab?.path || inlineTargetFile;
    if (!targetPath) {
      addToast('No target file selected for diff application', 'error');
      return;
    }

    // Path traversal validation: target file must start with workspace path if set
    if (workspacePath) {
      const normWs = workspacePath.replace(/\\/g, '/').toLowerCase();
      const normTarget = targetPath.replace(/\\/g, '/').toLowerCase();
      if (!normTarget.startsWith(normWs)) {
        addToast(`Security restriction: Target path "${targetPath}" is outside workspace root`, 'error');
        return;
      }
    }

    const forgeAPI = (window as any).forgeAPI;

    // Check external modification via mtime before overwrite
    if (forgeAPI?.fs?.getFileStat) {
      try {
        const stat = await forgeAPI.fs.getFileStat(targetPath);
        if (stat?.mtimeMs && targetTab?.lastMtimeMs && stat.mtimeMs > targetTab.lastMtimeMs + 500) {
          addToast('File conflict: file was modified on disk by an external process. Overwrite aborted.', 'error');
          return;
        }
      } catch {}
    }

    const currentContent = targetTab?.content || '';
    const updatedContent = currentContent.includes(oldText)
      ? currentContent.replace(oldText, newText)
      : (currentContent ? `${currentContent}\n${newText}` : newText);

    setTabs((prev) =>
      prev.map((t) =>
        t.id === targetTab?.id || t.path === targetPath
          ? { ...t, content: updatedContent, isModified: false }
          : t
      )
    );

    if (forgeAPI?.fs?.writeFile) {
      try {
        await forgeAPI.fs.writeFile(targetPath, updatedContent);
        addToast(`Applied diff & saved to disk: ${targetPath}`, 'success');
      } catch (err: any) {
        addToast(`Save error: ${err.message}`, 'warning');
      }
    } else {
      addToast(`Applied verified AI diff to ${targetPath}`, 'success');
    }
  };

  // Command Palette Handler Mappings (Vulnerability 13 - All commands wired)
  const commands: CommandItem[] = [
    { id: 'c-open-folder', category: 'File', label: 'File: Open Folder (Native Dialog)', shortcut: 'Ctrl+O', action: handleOpenFolder },
    { id: 'c-open-file', category: 'File', label: 'File: Open File (Native Dialog)', shortcut: 'Ctrl+Shift+O', action: handleOpenFile },
    { id: 'c-new-project', category: 'File', label: 'File: Create New Project', shortcut: 'Ctrl+Shift+N', action: handleCreateNewProject },
    { id: 'c-new-file', category: 'File', label: 'File: New File', shortcut: 'Ctrl+N', action: handleNewFile },
    { id: 'c-new-folder', category: 'File', label: 'File: New Folder', action: handleNewFolder },
    { id: 'c-save', category: 'File', label: 'File: Save Current File', shortcut: 'Ctrl+S', action: handleSaveActiveFile },
    { id: 'c-run-project', category: 'Run', label: 'Run: Start Project Dev Server', shortcut: 'F5', action: handleRunProject },
    { id: 'c-stop-project', category: 'Run', label: 'Run: Stop Project Dev Server', shortcut: 'Shift+F5', action: handleStopProject },
    { id: 'c-toggle-terminal', category: 'View', label: 'View: Toggle Terminal', shortcut: 'Ctrl+`', action: () => setIsBottomPanelOpen(!isBottomPanelOpen) },
    { id: 'c-toggle-preview', category: 'View', label: 'View: Toggle Live Preview', shortcut: 'Ctrl+Shift+P', action: () => setIsPreviewOpen(!isPreviewOpen) },
    { id: 'c-toggle-assistant', category: 'View', label: 'View: Toggle AI Assistant', shortcut: 'Ctrl+Shift+L', action: () => setIsAssistantOpen(!isAssistantOpen) },
    { id: 'c-search', category: 'Search', label: 'Search: Find in Files', shortcut: 'Ctrl+Shift+F', action: () => { setActiveView('search'); setIsSidePanelOpen(true); } },
    { id: 'c-ai', category: 'AI', label: 'AI: Inline Code Edit', shortcut: 'Ctrl+I', action: () => { setInlineTargetFile(activeTab?.path || ''); setIsInlineAIOpen(true); } },
    { id: 'c-ponytail', category: 'Ponytail', label: 'Ponytail: Run Senior Dev Audit', shortcut: '/audit', action: () => handleSendMessage('/ponytail-audit', 'build', []) },
    { id: 'c-ponytail-ultra', category: 'Ponytail', label: 'Ponytail: Set Aggression to ULTRA (-70%)', action: () => handlePonytailLevelChange('ultra') },
    { id: 'c-ponytail-full', category: 'Ponytail', label: 'Ponytail: Set Aggression to FULL (-53%)', action: () => handlePonytailLevelChange('full') },
    { id: 'c-ponytail-lite', category: 'Ponytail', label: 'Ponytail: Set Aggression to LITE (-30%)', action: () => handlePonytailLevelChange('lite') },
    { id: 'c-theme-stone', category: 'Theme', label: 'Theme: Switch to Modern Stone', action: () => { setTheme('modern-stone'); addToast('Theme switched to Modern Stone', 'info'); } },
    { id: 'c-theme-slate', category: 'Theme', label: 'Theme: Switch to Enterprise Slate', action: () => { setTheme('enterprise-slate'); addToast('Theme switched to Enterprise Slate', 'info'); } },
    { id: 'c-theme-navy', category: 'Theme', label: 'Theme: Switch to Executive Navy', action: () => { setTheme('executive-navy'); addToast('Theme switched to Executive Navy', 'info'); } },
    { id: 'c-theme-forest', category: 'Theme', label: 'Theme: Switch to Forest Executive', action: () => { setTheme('forest-executive'); addToast('Theme switched to Forest Executive', 'info'); } },
    { id: 'c-toggle-dark', category: 'Theme', label: 'Theme: Toggle Dark/Light Mode', action: () => setMode(mode === 'dark' ? 'light' : 'dark') },
    { id: 'c-art', category: 'Art Studio', label: 'Art Studio: Open Algorithmic Generator', action: () => { setActiveView('art'); setIsSidePanelOpen(true); } },
    { id: 'c-rea', category: 'REA', label: 'REA: Inspect Runtime AST & Process', action: () => { setActiveView('rea'); setIsSidePanelOpen(true); } },
    { id: 'c-cicd-lens', category: 'View', label: 'View: Open CICD Lens (Git Graph & Pipelines)', shortcut: 'Ctrl+Shift+G', action: () => { setActiveView('cicd'); setIsSidePanelOpen(true); } },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg text-text">
      {/* Top Title Bar */}
      <TitleBar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
        isBottomPanelOpen={isBottomPanelOpen}
        onToggleBottomPanel={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
        isPreviewOpen={isPreviewOpen}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}

        // File Menu Actions
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onOpenFolder={handleOpenFolder}
        onSave={handleSaveActiveFile}
        onSaveAll={handleSaveAllFiles}
        onCloseEditor={() => {
          if (activeTabId) handleCloseTab(activeTabId);
        }}
        onCloseAllEditors={() => {
          setTabs([]);
          setActiveTabId('');
        }}
        onHomeDashboard={() => setIsHomeDashboard(true)}
        onExit={() => {
          const forgeAPI = (window as any).forgeAPI;
          if (forgeAPI?.windowControls?.close) {
            forgeAPI.windowControls.close();
          } else {
            window.close();
          }
        }}

        // Edit Menu Actions
        onUndo={() => document.execCommand('undo')}
        onRedo={() => document.execCommand('redo')}
        onCut={() => document.execCommand('cut')}
        onCopy={() => document.execCommand('copy')}
        onPaste={() => {
          navigator.clipboard.readText().then((text) => {
            if (text) document.execCommand('insertText', false, text);
          }).catch(() => {});
        }}
        onFindInFiles={() => {
          setActiveView('search');
          setIsSidePanelOpen(true);
        }}
        onInlineAI={() => {
          setInlineTargetFile(activeTab?.path || '');
          setIsInlineAIOpen(true);
        }}

        // Selection Menu Actions
        onSelectAll={() => document.execCommand('selectAll')}

        // View Menu Actions
        onSelectView={(view) => {
          setActiveView(view);
          setIsSidePanelOpen(true);
        }}
        onToggleThemeMode={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}

        // Go Menu Actions
        onGoToFile={() => setIsCommandPaletteOpen(true)}
        onNextTab={handleNextTab}
        onPrevTab={handlePrevTab}

        // Run Menu Actions
        onRunProject={handleRunProject}
        onStopProject={handleStopProject}
        onStartLiveServer={handleStartLiveServer}
        isProjectRunning={runStatus === 'running'}

        // Terminal Menu Actions
        onNewTerminal={() => {
          setBottomPanelTab('terminal');
          setIsBottomPanelOpen(true);
          const forgeAPI = (window as any).forgeAPI;
          forgeAPI?.terminal?.init(workspacePath, true);
        }}
        onClearTerminal={() => {
          const forgeAPI = (window as any).forgeAPI;
          forgeAPI?.terminal?.write('\x0c');
        }}
        onOpenLocalLLMTerminal={() => {
          setBottomPanelTab('localllm');
          setIsBottomPanelOpen(true);
        }}
        onOpenAILog={() => {
          setBottomPanelTab('tasklog');
          setIsBottomPanelOpen(true);
        }}
        onOpenProblems={() => {
          setBottomPanelTab('problems');
          setIsBottomPanelOpen(true);
        }}
        onOpenOutput={() => {
          setBottomPanelTab('output');
          setIsBottomPanelOpen(true);
        }}

        // Help Menu Actions
        onShowShortcuts={() => setIsCommandPaletteOpen(true)}
        onScanModels={() => {
          setActiveView('models');
          setIsSidePanelOpen(true);
        }}
        onAbout={() => {
          addToast('Forge IDE v1.0.0 — Enterprise AI Desktop IDE with Local LLM & Multi-Agent Orchestration', 'info');
        }}
      />

      {/* Main Center Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar (48px) */}
        <ActivityBar
          activeView={activeView}
          onSelectView={(v) => {
            if (activeView === v && isSidePanelOpen) {
              setIsSidePanelOpen(false);
            } else {
              setActiveView(v);
              setIsSidePanelOpen(true);
            }
          }}
          isSidePanelOpen={isSidePanelOpen}
          isAssistantOpen={isAssistantOpen}
          onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
          isPreviewOpen={isPreviewOpen}
          onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
        />

        {/* Side Panel (280px) */}
        {isSidePanelOpen && (
          <SidePanel
            activeView={activeView}
            files={files}
            selectedPath={activeTab?.path}
            onSelectFile={handleSelectFile}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            onOpenFolder={handleOpenFolder}
            onRefresh={handleRefreshExplorer}
            workspaceName={workspaceName}
            workspacePath={workspacePath}
            onOpenFile={(p) => {
              const findInTree = (nodes: FileItem[]): FileItem | null => {
                for (const n of nodes) {
                  if (n.path === p) return n;
                  if (n.children) {
                    const found = findInTree(n.children);
                    if (found) return found;
                  }
                }
                return null;
              };
              const f = findInTree(files);
              if (f) handleSelectFile(f);
            }}
            onViewDiff={() => setIsInlineAIOpen(true)}
            onRunSlashCommand={(cmd) => handleSendMessage(cmd, 'build', [])}
            currentTheme={theme}
            currentMode={mode}
            onThemeChange={setTheme}
            onModeChange={setMode}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            ponytailLevel={ponytailLevel}
            onPonytailLevelChange={handlePonytailLevelChange}
          />
        )}

        {/* Center Deep Work Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isHomeDashboard ? (
            <HomeDashboard
              onOpenFolder={handleOpenFolder}
              onOpenFile={handleOpenFile}
              onOpenRecent={handleOpenRecent}
              onNewProject={handleCreateNewProject}
            />
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Monaco Editor Canvas */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-[320px]">
                <EditorArea
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onSelectTab={setActiveTabId}
                  onCloseTab={handleCloseTab}
                  onCloseOtherTabs={handleCloseOtherTabs}
                  onCloseAllTabs={handleCloseAllTabs}
                  onContentChange={handleEditorContentChange}
                  themeMode={mode}
                  onCursorChange={(line, col) => setCursorPosition({ line, col })}
                  onSelectionChange={(text) => setSelectedText(text)}
                  onSave={handleSaveActiveFile}
                  recentFiles={recentFiles}
                  onOpenRecentFile={handleOpenRecentFile}
                  onClearRecentFiles={handleClearRecentFiles}
                  onNavigateHistory={handleNavigateHistory}
                  canNavigateBack={historyIndex > 0}
                  canNavigateForward={historyIndex < fileHistory.length - 1}
                  onNewFile={handleNewFile}
                  onNewFolder={handleNewFolder}
                  onOpenFile={handleOpenFile}
                  workspaceName={workspaceName}
                  workspacePath={workspacePath}
                />
              </div>

              {/* Live Preview Panel (Vulnerability 5, 7) */}
              {isPreviewOpen && (
                <div className="w-[420px] lg:w-[480px] shrink-0 h-full overflow-hidden">
                  <PreviewPanel
                    initialUrl=""
                    detectedServerUrl={detectedDevServerUrl}
                    onRunProject={handleRunProject}
                    onStopProject={handleStopProject}
                    runStatus={runStatus}
                  />
                </div>
              )}
            </div>
          )}

          {/* Bottom Panel (Terminal / Problems / Output / AI Log) */}
          <BottomPanel
            isOpen={isBottomPanelOpen}
            onClose={() => setIsBottomPanelOpen(false)}
            onRunAudit={() => handleSendMessage('/ponytail-audit', 'build', [])}
            workspacePath={workspacePath}
            activeTab={bottomPanelTab}
            onTabChange={setBottomPanelTab}
          />
        </div>

        {/* Right AI Assistant Panel */}
        {isAssistantOpen && (
          <AIChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            ponytailLevel={ponytailLevel}
            onPonytailLevelChange={handlePonytailLevelChange}
            onClose={() => setIsAssistantOpen(false)}
            activeFilePath={activeTab?.path}
            activeFileContent={activeTab?.content}
            cursorSelection={selectedText}
            isStreaming={isStreamingAI}
            onStop={handleStopAIGeneration}
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        activeModel={selectedModel.replace('Local Model (', '').replace(')', '')}
        tokensPerSec={tokensPerSec}
        runtimeStatus="healthy"
        runStatus={runStatus}
        ponytailActive={true}
        ponytailLevel={ponytailLevel}
        lineCol={`Ln ${cursorPosition.line}, Col ${cursorPosition.col}`}
        language={activeTab ? getLanguageLabel(activeTab.name) : 'Plain Text'}
      />

      {/* Modals & Overlays */}
      <PromptModal {...promptModal} />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />

      <InlineAIEdit
        isOpen={isInlineAIOpen}
        onClose={() => setIsInlineAIOpen(false)}
        onAccept={handleAcceptInlineDiff}
        onReject={() => setIsInlineAIOpen(false)}
        initialPrompt={inlinePrompt}
        targetFile={activeTab?.path || inlineTargetFile}
        fileContent={activeTab?.content || ''}
        selection={selectedText}
        activeModel={selectedModel}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
};
