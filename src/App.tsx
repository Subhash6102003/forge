import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { ActivityBar, ActivityView } from './components/layout/ActivityBar';
import { SidePanel } from './components/layout/SidePanel';
import { EditorArea, EditorTab } from './components/layout/EditorArea';
import { PreviewPanel } from './components/layout/PreviewPanel';
import { AIChatPanel } from './components/layout/AIChatPanel';
import { BottomPanel } from './components/layout/BottomPanel';
import { StatusBar } from './components/layout/StatusBar';
import { CommandPalette, CommandItem } from './components/ui/CommandPalette';
import { InlineAIEdit } from './components/layout/InlineAIEdit';
import { HomeDashboard } from './components/layout/HomeDashboard';
import { ThemeId, ThemeMode, FileItem, ChatMessage, AIMode, ContextChip } from './types';
import { BrandSkinService } from './services/brandSkin';
import { skillsRouter } from './services/skillsRouter';
import { modelRuntime } from './services/modelRuntimeService';
import { ponytailEngine, PonytailLevel } from './services/ponytailEngine';
import { Toast, ToastMessage } from './components/ui/Toast';

const initialFiles: FileItem[] = [
  {
    id: 'f-forge',
    name: '.forge',
    path: '.forge',
    type: 'directory',
    children: [
      { id: 'f-forge-config', name: 'config.json', path: '.forge/config.json', type: 'file', content: '{\n  "version": "1.0.0"\n}' },
    ],
  },
  {
    id: 'f-vscode',
    name: '.vscode',
    path: '.vscode',
    type: 'directory',
    children: [
      { id: 'f-vscode-settings', name: 'settings.json', path: '.vscode/settings.json', type: 'file', content: '{\n  "editor.formatOnSave": true\n}' },
    ],
  },
  {
    id: 'f-public',
    name: 'public',
    path: 'public',
    type: 'directory',
    children: [
      { id: 'f-favicon', name: 'favicon.ico', path: 'public/favicon.ico', type: 'file', content: '' },
    ],
  },
  {
    id: 'f-src',
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      {
        id: 'f-components',
        name: 'components',
        path: 'src/components',
        type: 'directory',
        children: [
          {
            id: 'f-header',
            name: 'Header.tsx',
            path: 'src/components/Header.tsx',
            type: 'file',
            content: `import { useState } from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">Forge</span>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </button>
          {searchOpen && (
            <Input
              placeholder="Search files, components, or commands..."
              className="w-64"
            />
          )}
        </div>
      </div>
    </header>
  );
}`,
          },
          {
            id: 'f-sidebar',
            name: 'Sidebar.tsx',
            path: 'src/components/Sidebar.tsx',
            type: 'file',
            content: `export function Sidebar() {\n  return <aside className="w-64 border-r">Sidebar</aside>;\n}`,
          },
          {
            id: 'f-chatinput',
            name: 'ChatInput.tsx',
            path: 'src/components/ChatInput.tsx',
            type: 'file',
            content: `export function ChatInput() {\n  return <input placeholder="Ask anything..." />;\n}`,
          },
        ],
      },
      {
        id: 'f-pages',
        name: 'pages',
        path: 'src/pages',
        type: 'directory',
        children: [
          { id: 'f-home', name: 'Home.tsx', path: 'src/pages/Home.tsx', type: 'file', content: `export default function Home() { return <div>Home</div>; }` },
          { id: 'f-settings', name: 'Settings.tsx', path: 'src/pages/Settings.tsx', type: 'file', content: `export default function Settings() { return <div>Settings</div>; }` },
        ],
      },
      {
        id: 'f-lib',
        name: 'lib',
        path: 'src/lib',
        type: 'directory',
        children: [
          { id: 'f-ai', name: 'ai.ts', path: 'src/lib/ai.ts', type: 'file', content: `export const generate = async () => {};` },
          { id: 'f-utils', name: 'utils.ts', path: 'src/lib/utils.ts', type: 'file', content: `export const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');` },
        ],
      },
      {
        id: 'f-styles',
        name: 'styles',
        path: 'src/styles',
        type: 'directory',
        children: [
          { id: 'f-globals', name: 'globals.css', path: 'src/styles/globals.css', type: 'file', content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;` },
          { id: 'f-theme', name: 'theme.ts', path: 'src/styles/theme.ts', type: 'file', content: `export const theme = { stone: '#4A4A4A' };` },
        ],
      },
      {
        id: 'f-app',
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        content: `import { Header } from './components/Header';\n\nexport default function App() {\n  return <Header />;\n}`,
      },
      { id: 'f-main', name: 'main.tsx', path: 'src/main.tsx', type: 'file', content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);` },
    ],
  },
  { id: 'f-pkg', name: 'package.json', path: 'package.json', type: 'file', content: '{\n  "name": "my-ai-app",\n  "version": "0.1.0"\n}' },
  { id: 'f-readme', name: 'README.md', path: 'README.md', type: 'file', content: '# My AI App\nCreated with Forge AI Desktop IDE' },
];

export const App: React.FC = () => {
  // Theme & Appearance State (Default: Modern Stone Dark matching reference)
  const [theme, setTheme] = useState<ThemeId>('modern-stone');
  const [mode, setMode] = useState<ThemeMode>('dark');

  // Layout Panels State
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [activeView, setActiveView] = useState<ActivityView>('explorer');

  // Dialog & Modal State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isInlineAIOpen, setIsInlineAIOpen] = useState(false);
  const [inlinePrompt, setInlinePrompt] = useState("Update the button text to 'Start building'");
  const [inlineTargetFile, setInlineTargetFile] = useState('src/components/Header.tsx');
  const [isHomeDashboard, setIsHomeDashboard] = useState(false);

  // Runtime & Model State
  const [selectedModel, setSelectedModel] = useState('Local Model (Llama 3.1 8B)');
  const [tokensPerSec, setTokensPerSec] = useState(42.3);
  const [ponytailLevel, setPonytailLevel] = useState<PonytailLevel>('full');

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // Editor Tabs State
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
      id: 'f-app',
      name: 'App.tsx',
      path: 'src/App.tsx',
      content: `import { Header } from './components/Header';\n\nexport default function App() {\n  return <Header />;\n}`,
    },
    {
      id: 'f-header',
      name: 'Header.tsx',
      path: 'src/components/Header.tsx',
      content: initialFiles[3].children![0].children![0].content || '',
    },
    {
      id: 'f-globals',
      name: 'globals.css',
      path: 'src/styles/globals.css',
      content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --color-accent: #D97757;\n}`,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('f-header');

  // AI Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      content: 'Update the header component to add a user menu dropdown with profile, settings and logout options.',
      timestamp: Date.now() - 300000,
      mode: 'plan',
      contextChips: [
        { id: 'c1', label: 'Header.tsx', type: 'file', value: 'Header.tsx' },
        { id: 'c2', label: 'src/components/', type: 'folder', value: 'src/components/' },
      ],
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      content: "I'll update the Header component to add a user menu dropdown. Here's the plan:",
      timestamp: Date.now() - 240000,
      mode: 'build',
      steps: [
        { id: 's1', title: 'Add dropdown state and toggle logic', status: 'completed' },
        { id: 's2', title: 'Create user menu with profile, settings, and logout options', status: 'completed' },
        { id: 's3', title: 'Add click outside handler', status: 'completed' },
        { id: 's4', title: 'Update the UI with proper styling', status: 'completed' },
      ],
      isStreaming: false,
    },
  ]);

  // Apply theme attributes to document
  useEffect(() => {
    BrandSkinService.applyTheme(theme, mode);
  }, [theme, mode]);

  // Global Keyboard Shortcuts (Ctrl+K, Ctrl+I, Ctrl+B, Ctrl+`)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInlineAIOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidePanelOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsBottomPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectFile = (file: FileItem) => {
    if (file.type === 'file') {
      const existing = tabs.find((t) => t.path === file.path);
      if (existing) {
        setActiveTabId(existing.id);
      } else {
        const newTab: EditorTab = {
          id: file.id,
          name: file.name,
          path: file.path,
          content: file.content || `// ${file.name}\n`,
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
      }
    }
  };

  const handleCloseTab = (id: string) => {
    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id && nextTabs.length > 0) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  const handleEditorContentChange = (id: string, newContent: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content: newContent, isModified: true } : t))
    );
  };

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
      const response = ponytailEngine.handleSlashCommand(content, tabs.find((t) => t.id === activeTabId)?.content || '');
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

    // Dynamic routing & model generation
    const routedSkills = skillsRouter.route(content);
    const assistantMsg: ChatMessage = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode: chatMode,
      steps: [
        { id: '1', title: `Routed to ${routedSkills[0]?.skillId || 'developer'} skill`, status: 'completed' },
        { id: '2', title: 'Synthesized context with Ponytail -53% zero-bloat rule', status: 'completed' },
        { id: '3', title: 'Generating verified diff hunk', status: 'running' },
      ],
      isStreaming: true,
    };
    setChatMessages((prev) => [...prev, assistantMsg]);

    const { response, tokensPerSec: speed } = await modelRuntime.generate({
      model: selectedModel,
      prompt: content,
      onToken: (token) => {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: m.content + token } : m
          )
        );
      },
    });

    setTokensPerSec(speed);
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMsg.id
          ? {
              ...m,
              isStreaming: false,
              steps: m.steps?.map((s) => ({ ...s, status: 'completed' })),
            }
          : m
      )
    );
  };

    const handleAcceptInlineDiff = (oldText: string, newText: string) => {
      setIsInlineAIOpen(false);
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTabId || t.path === inlineTargetFile) {
            const updated = t.content.includes(oldText)
              ? t.content.replace(oldText, newText)
              : t.content + `\n// Applied: ${newText}`;
            return { ...t, content: updated, isModified: true };
          }
          return t;
        })
      );
      addToast(`Applied verified AI diff to ${inlineTargetFile}`, 'success');
    };

    const handleSelectElement = (el: string) => {
      // Visual-to-Code: Jump to Header.tsx tab
      const headerTab = tabs.find((t) => t.path.includes('Header.tsx'));
      if (headerTab) {
        setActiveTabId(headerTab.id);
      }
      setInlineTargetFile('src/components/Header.tsx');
      setInlinePrompt(`Update element: ${el}`);
      setIsInlineAIOpen(true);
      handleSendMessage(`Visual-to-Code inspection: ${el}`, 'build', [
        { id: 'el-1', label: el.split(':')[0], type: 'selection', value: el },
      ]);
      addToast(`Selected ${el} -> opened in Header.tsx`, 'info');
    };

    const commands: CommandItem[] = [
      { id: 'c-new', category: 'File', label: 'File: New File', shortcut: 'Ctrl+N', action: () => addToast('New file created in workspace', 'info') },
      { id: 'c-open', category: 'File', label: 'File: Open Folder / Dashboard', shortcut: 'Ctrl+O', action: () => setIsHomeDashboard(!isHomeDashboard) },
      { id: 'c-save', category: 'File', label: 'File: Save Current File', shortcut: 'Ctrl+S', action: () => addToast('File saved successfully', 'success') },
      { id: 'c-search', category: 'Search', label: 'Search: Find in Files', shortcut: 'Ctrl+Shift+F', action: () => { setActiveView('search'); setIsSidePanelOpen(true); } },
      { id: 'c-ai', category: 'AI', label: 'AI: Inline Code Edit', shortcut: 'Ctrl+I', action: () => setIsInlineAIOpen(true) },
      { id: 'c-ponytail', category: 'Ponytail', label: 'Ponytail: Run Lazy Senior Dev Audit', shortcut: '/audit', action: () => handleSendMessage('/ponytail-audit', 'build', []) },
      { id: 'c-ponytail-ultra', category: 'Ponytail', label: 'Ponytail: Set Aggression to ULTRA (-70%)', action: () => handlePonytailLevelChange('ultra') },
      { id: 'c-ponytail-full', category: 'Ponytail', label: 'Ponytail: Set Aggression to FULL (-53%)', action: () => handlePonytailLevelChange('full') },
      { id: 'c-ponytail-lite', category: 'Ponytail', label: 'Ponytail: Set Aggression to LITE (-30%)', action: () => handlePonytailLevelChange('lite') },
      { id: 'c-git', category: 'Git', label: 'Git: Commit Changes', shortcut: 'Ctrl+Enter', action: () => { setActiveView('git'); setIsSidePanelOpen(true); } },
      { id: 'c-theme-stone', category: 'Theme', label: 'Theme: Switch to Modern Stone', action: () => { setTheme('modern-stone'); addToast('Theme switched to Modern Stone', 'info'); } },
      { id: 'c-theme-slate', category: 'Theme', label: 'Theme: Switch to Enterprise Slate', action: () => { setTheme('enterprise-slate'); addToast('Theme switched to Enterprise Slate', 'info'); } },
      { id: 'c-theme-navy', category: 'Theme', label: 'Theme: Switch to Executive Navy', action: () => { setTheme('executive-navy'); addToast('Theme switched to Executive Navy', 'info'); } },
      { id: 'c-theme-forest', category: 'Theme', label: 'Theme: Switch to Forest Executive', action: () => { setTheme('forest-executive'); addToast('Theme switched to Forest Executive', 'info'); } },
      { id: 'c-toggle-dark', category: 'Theme', label: 'Theme: Toggle Dark/Light Mode', action: () => setMode(mode === 'dark' ? 'light' : 'dark') },
      { id: 'c-art', category: 'Art Studio', label: 'Art Studio: Open Algorithmic Generator', action: () => { setActiveView('art'); setIsSidePanelOpen(true); } },
      { id: 'c-rea', category: 'REA', label: 'REA: Inspect Runtime AST & Process', action: () => { setActiveView('rea'); setIsSidePanelOpen(true); } },
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
          />

          {/* Side Panel (280px) */}
          {isSidePanelOpen && (
            <SidePanel
              activeView={activeView}
              files={initialFiles}
              selectedPath={tabs.find((t) => t.id === activeTabId)?.path}
              onSelectFile={handleSelectFile}
              onOpenFile={(p) => {
                const f = initialFiles.find((x) => x.path === p);
                if (f) handleSelectFile(f);
              }}
              onViewDiff={() => setIsInlineAIOpen(true)}
              onRunSlashCommand={(cmd) => handleSendMessage(cmd, 'build', [])}
              currentTheme={theme}
              currentMode={mode}
              onThemeChange={setTheme}
              onModeChange={setMode}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              ponytailLevel={ponytailLevel}
              onPonytailLevelChange={handlePonytailLevelChange}
            />
          )}

          {/* Center Deep Work Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {isHomeDashboard ? (
              <HomeDashboard
                onOpenProject={() => setIsHomeDashboard(false)}
                onNewProject={() => setIsHomeDashboard(false)}
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
                    onContentChange={handleEditorContentChange}
                    themeMode={mode}
                  />
                </div>

                {/* Live Preview Panel */}
                <div className="w-[420px] lg:w-[480px] shrink-0 h-full overflow-hidden">
                  <PreviewPanel onSelectElement={handleSelectElement} />
                </div>
              </div>
            )}

            {/* Bottom Panel (Terminal / Problems / Output / AI Task Log) */}
            <BottomPanel
              isOpen={isBottomPanelOpen}
              onClose={() => setIsBottomPanelOpen(false)}
              onRunAudit={() => handleSendMessage('/ponytail-audit', 'build', [])}
            />
          </div>

          {/* Right AI Assistant Panel */}
          {isAssistantOpen && (
            <AIChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              ponytailLevel={ponytailLevel}
              onPonytailLevelChange={handlePonytailLevelChange}
              onClose={() => setIsAssistantOpen(false)}
            />
          )}
        </div>

        {/* Bottom Status Bar */}
        <StatusBar
          activeModel={selectedModel.replace('Local Model (', '').replace(')', '')}
          tokensPerSec={tokensPerSec}
          runtimeStatus="healthy"
          ponytailActive={true}
          ponytailLevel={ponytailLevel}
        />

        {/* Modals & Overlays */}
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
          targetFile={inlineTargetFile}
        />

        {/* Toast Notification Container */}
        <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      </div>
    );
};
