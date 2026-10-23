import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Tabs, TabItem } from '../ui/Tabs';
import { ChevronRight, SplitSquareVertical, MapPin, Eye, FileCode } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { ThemeMode } from '../../types';

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  isModified?: boolean;
}

export interface EditorAreaProps {
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onContentChange: (id: string, newContent: string) => void;
  themeMode: ThemeMode;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onContentChange,
  themeMode,
}) => {
  const [minimapEnabled, setMinimapEnabled] = useState(true);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const breadcrumbs = activeTab ? activeTab.path.split('/') : ['src', 'components', 'Header.tsx'];

  const tabItems: TabItem[] = tabs.map((t) => ({
    id: t.id,
    label: t.name,
    icon: <FileCode className="w-3.5 h-3.5 text-accent-blue" />,
    closable: true,
  }));

  const getLanguage = (fileName: string = '') => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return 'typescript';
    if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  return (
    <div className="flex flex-col h-full w-full bg-editor-bg overflow-hidden">
      {/* Top Tabs */}
      <Tabs
        tabs={tabItems}
        activeId={activeTabId}
        onChange={onSelectTab}
        onClose={onCloseTab}
        variant="editor"
      />

      {/* Breadcrumbs & Editor Action Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-surface/50 border-b border-border text-xs text-text-muted select-none">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar font-mono text-[11px]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-text-muted/60 shrink-0" />}
              <span className={idx === breadcrumbs.length - 1 ? 'text-text font-medium' : 'text-text-muted hover:text-text cursor-pointer'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            size="xs"
            active={minimapEnabled}
            tooltip="Toggle Minimap"
            onClick={() => setMinimapEnabled(!minimapEnabled)}
          >
            <Eye className="w-3 h-3" />
          </IconButton>
          <IconButton
            size="xs"
            tooltip="Split Editor Right"
          >
            <SplitSquareVertical className="w-3 h-3" />
          </IconButton>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full relative">
        {activeTab ? (
          <Editor
            height="100%"
            language={getLanguage(activeTab.name)}
            theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
            value={activeTab.content}
            onChange={(val) => onContentChange(activeTab.id, val || '')}
            options={{
              minimap: { enabled: minimapEnabled },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              lineNumbers: 'on',
              lineHeight: 20,
              padding: { top: 12 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              tabSize: 2,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-xs">
            No file open
          </div>
        )}
      </div>
    </div>
  );
};
