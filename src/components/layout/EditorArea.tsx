import React, { useState, useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import {
  ChevronRight,
  SplitSquareVertical,
  Eye,
  X,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Clock,
  Trash2,
  Search,
  Check,
  FileText,
  FilePlus,
  FolderPlus,
  FolderOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { FileIcon } from '../ui/FileIcon';
import { ThemeMode } from '../../types';

// Ensure Monaco loader uses local bundled monaco instance
loader.config({ monaco });

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  isModified?: boolean;
  lastMtimeMs?: number;
}

export interface RecentFileItem {
  id: string;
  name: string;
  path: string;
  lastOpened: number;
}

export interface EditorAreaProps {
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseOtherTabs?: (id: string) => void;
  onCloseAllTabs?: () => void;
  onContentChange: (id: string, newContent: string) => void;
  themeMode: ThemeMode;
  onCursorChange?: (line: number, col: number) => void;
  onSelectionChange?: (selectedText: string) => void;
  onSave?: () => void;
  recentFiles?: RecentFileItem[];
  onOpenRecentFile?: (file: { path: string; name: string }) => void;
  onClearRecentFiles?: () => void;
  onNavigateHistory?: (direction: 'back' | 'forward') => void;
  canNavigateBack?: boolean;
  canNavigateForward?: boolean;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onOpenFile?: () => void;
  workspaceName?: string;
  workspacePath?: string;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onContentChange,
  themeMode,
  onCursorChange,
  onSelectionChange,
  onSave,
  recentFiles = [],
  onOpenRecentFile,
  onClearRecentFiles,
  onNavigateHistory,
  canNavigateBack = false,
  canNavigateForward = false,
  onNewFile,
  onNewFolder,
  onOpenFile,
  workspaceName,
  workspacePath,
}) => {
  const [minimapEnabled, setMinimapEnabled] = useState(true);
  const [isRecentMenuOpen, setIsRecentMenuOpen] = useState(false);
  const [recentSearchQuery, setRecentSearchQuery] = useState('');
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const recentMenuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // Keep refs up-to-date to prevent stale closures in long-lived Monaco callbacks
  const onSaveRef = useRef(onSave);
  const onCursorChangeRef = useRef(onCursorChange);
  const onSelectionChangeRef = useRef(onSelectionChange);

  onSaveRef.current = onSave;
  onCursorChangeRef.current = onCursorChange;
  onSelectionChangeRef.current = onSelectionChange;

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Close recent menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (recentMenuRef.current && !recentMenuRef.current.contains(e.target as Node)) {
        setIsRecentMenuOpen(false);
      }
    };
    if (isRecentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isRecentMenuOpen]);

  // Scroll active tab into view when activeTabId changes
  useEffect(() => {
    if (tabsScrollRef.current && activeTabId) {
      const activeEl = tabsScrollRef.current.querySelector(`[data-tab-id="${CSS.escape(activeTabId)}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTabId]);

  const breadcrumbs = activeTab
    ? activeTab.path.split(/[/\\]/).filter(Boolean)
    : [];

  const getLanguage = (fileName: string = '') => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.tsx') || lower.endsWith('.ts')) return 'typescript';
    if (lower.endsWith('.jsx') || lower.endsWith('.js') || lower.endsWith('.mjs')) return 'javascript';
    if (lower.endsWith('.java')) return 'java';
    if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx') || lower.endsWith('.c') || lower.endsWith('.h') || lower.endsWith('.hpp')) return 'cpp';
    if (lower.endsWith('.cs')) return 'csharp';
    if (lower.endsWith('.go')) return 'go';
    if (lower.endsWith('.rs')) return 'rust';
    if (lower.endsWith('.py')) return 'python';
    if (lower.endsWith('.css') || lower.endsWith('.scss')) return 'css';
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown';
    if (lower.endsWith('.ps1')) return 'powershell';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'shell';
    if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'yaml';
    if (lower.endsWith('.xml') || lower.endsWith('.svg')) return 'xml';
    if (lower.endsWith('.sql')) return 'sql';
    if (lower.endsWith('.kt') || lower.endsWith('.kts')) return 'kotlin';
    return 'plaintext';
  };

  const [diagnostics, setDiagnostics] = useState<Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    message: string;
    severity: 'error' | 'warning';
  }>>([]);

  const activeTabPathRef = useRef(activeTab?.path);
  activeTabPathRef.current = activeTab?.path;
  const blameDecorationsRef = useRef<string[]>([]);
  const monacoInstanceRef = useRef<any>(null);

  // Real-time syntax error linter
  const validateModelSyntax = (model: any, monacoInst: any, lang: string) => {
    if (!model || !monacoInst) return;
    const content = model.getValue();
    const errors: Array<{
      line: number;
      column: number;
      endLine: number;
      endColumn: number;
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    if (lang === 'json') {
      try {
        JSON.parse(content);
      } catch (e: any) {
        const match = e.message.match(/at position (\d+)/);
        let line = 1, col = 1;
        if (match) {
          const pos = parseInt(match[1], 10);
          const upTo = content.slice(0, pos);
          const lines = upTo.split('\n');
          line = lines.length;
          col = lines[lines.length - 1].length + 1;
        }
        errors.push({
          line,
          column: col,
          endLine: line,
          endColumn: col + 4,
          message: `JSON Syntax Error: ${e.message}`,
          severity: 'error',
        });
      }
    } else {
      // General bracket, quote, and structure analysis for Java, C++, Python, JS, etc.
      const lines = content.split(/\r?\n/);
      const stack: { char: string; line: number; col: number }[] = [];
      const pairMap: Record<string, string> = { '}': '{', ']': '[', ')': '(' };

      for (let l = 0; l < lines.length; l++) {
        const lineText = lines[l];
        let inString: string | null = null;

        for (let c = 0; c < lineText.length; c++) {
          const ch = lineText[c];
          const next = lineText[c + 1];

          // Comments
          if (!inString && ch === '/' && next === '/') break;
          if (!inString && (lang === 'python' || lang === 'shell') && ch === '#') break;

          // Quotes
          if ((ch === '"' || ch === "'" || ch === '`') && (c === 0 || lineText[c - 1] !== '\\')) {
            if (!inString) {
              inString = ch;
            } else if (inString === ch) {
              inString = null;
            }
            continue;
          }

          if (inString) continue;

          // Brackets
          if (ch === '{' || ch === '[' || ch === '(') {
            stack.push({ char: ch, line: l + 1, col: c + 1 });
          } else if (ch === '}' || ch === ']' || ch === ')') {
            if (stack.length === 0) {
              errors.push({
                line: l + 1,
                column: c + 1,
                endLine: l + 1,
                endColumn: c + 2,
                message: `Unexpected closing '${ch}' with no matching opening bracket`,
                severity: 'error',
              });
            } else {
              const top = stack.pop()!;
              if (pairMap[ch] !== top.char) {
                errors.push({
                  line: l + 1,
                  column: c + 1,
                  endLine: l + 1,
                  endColumn: c + 2,
                  message: `Mismatched bracket: '${ch}' does not match '${top.char}' from Line ${top.line}`,
                  severity: 'error',
                });
              }
            }
          }
        }

        // Unterminated quote
        if (inString && inString !== '`') {
          errors.push({
            line: l + 1,
            column: lineText.lastIndexOf(inString) + 1,
            endLine: l + 1,
            endColumn: lineText.length + 1,
            message: `Unterminated string literal (missing quote ${inString})`,
            severity: 'error',
          });
        }
      }

      // Remaining unclosed brackets
      for (const unclosed of stack) {
        errors.push({
          line: unclosed.line,
          column: unclosed.col,
          endLine: unclosed.line,
          endColumn: unclosed.col + 1,
          message: `Unclosed bracket '${unclosed.char}' - missing matching closing bracket`,
          severity: 'error',
        });
      }
    }

    setDiagnostics(errors);

    const markers = errors.map((err) => ({
      startLineNumber: err.line,
      startColumn: err.column,
      endLineNumber: err.endLine,
      endColumn: Math.max(err.endColumn, err.column + 1),
      message: err.message,
      severity:
        err.severity === 'error'
          ? monacoInst.MarkerSeverity.Error
          : monacoInst.MarkerSeverity.Warning,
      source: 'Forge Syntax Linter',
    }));

    monacoInst.editor.setModelMarkers(model, 'forge-syntax-diagnostics', markers);
  };

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;
    monacoInstanceRef.current = monacoInstance;

    // Report initial cursor position
    const pos = editor.getPosition();
    if (pos) {
      onCursorChangeRef.current?.(pos.lineNumber, pos.column);
    }

    // Run initial syntax validation
    const model = editor.getModel();
    if (model && activeTab) {
      validateModelSyntax(model, monacoInstance, getLanguage(activeTab.name));
    }

    // Real-time linting on model content change
    let lintTimer: any = null;
    editor.onDidChangeModelContent(() => {
      if (lintTimer) clearTimeout(lintTimer);
      lintTimer = setTimeout(() => {
        const curModel = editor.getModel();
        if (curModel && activeTab) {
          validateModelSyntax(curModel, monacoInstance, getLanguage(activeTab.name));
        }
      }, 300);
    });

    let blameTimeout: any = null;

    // Cursor position listener + GitLens inline blame
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChangeRef.current?.(e.position.lineNumber, e.position.column);

      if (blameTimeout) clearTimeout(blameTimeout);
      blameTimeout = setTimeout(async () => {
        const forgeAPI = (window as any).forgeAPI;
        const currentPath = activeTabPathRef.current;
        if (!forgeAPI?.git?.getLineBlame || !currentPath) return;

        try {
          const blame = await forgeAPI.git.getLineBlame(currentPath, e.position.lineNumber);
          if (blame && blame.author) {
            blameDecorationsRef.current = editor.deltaDecorations(blameDecorationsRef.current, [
              {
                range: new monacoInstance.Range(e.position.lineNumber, 1, e.position.lineNumber, 1),
                options: {
                  isWholeLine: true,
                  after: {
                    content: `    ${blame.author}, ${blame.relativeTime} • ${blame.summary}`,
                    inlineClassName: 'text-text-muted/40 italic font-mono text-[11px] select-none pointer-events-none',
                  },
                },
              },
            ]);
          } else {
            blameDecorationsRef.current = editor.deltaDecorations(blameDecorationsRef.current, []);
          }
        } catch {
          blameDecorationsRef.current = editor.deltaDecorations(blameDecorationsRef.current, []);
        }
      }, 150);
    });

    // Selection listener for AI context
    editor.onDidChangeCursorSelection((e: any) => {
      const curModel = editor.getModel();
      if (curModel && !e.selection.isEmpty()) {
        const text = curModel.getValueInRange(e.selection);
        onSelectionChangeRef.current?.(text);
      } else {
        onSelectionChangeRef.current?.('');
      }
    });

    // Native Ctrl+S handler inside Monaco
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      onSaveRef.current?.();
    });

    // Native Shift+Alt+F / Beautify handler inside Monaco
    editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.KeyF, () => {
      handleBeautifyCode();
    });
  };

  // Jump cursor to first detected syntax error
  const handleJumpToFirstError = () => {
    if (diagnostics.length > 0 && editorRef.current) {
      const first = diagnostics[0];
      editorRef.current.revealLineInCenter(first.line);
      editorRef.current.setPosition({ lineNumber: first.line, column: first.column });
      editorRef.current.focus();
    }
  };

  // Code Beautifier / Formatter Action
  const handleBeautifyCode = async () => {
    if (!activeTab) return;
    const lang = getLanguage(activeTab.name);

    // 1. Try Monaco's built-in formatDocument action
    if (editorRef.current) {
      try {
        const action = editorRef.current.getAction('editor.action.formatDocument');
        if (action) {
          await action.run();
          const newVal = editorRef.current.getValue();
          if (newVal && newVal !== activeTab.content) {
            onContentChange(activeTab.id, newVal);
            return;
          }
        }
      } catch (err) {
        console.warn('Monaco format action fallback:', err);
      }
    }

    // 2. Fallback smart indentation & structure beautifier
    const currentCode = activeTab.content;
    let beautified = currentCode;

    if (lang === 'json') {
      try {
        beautified = JSON.stringify(JSON.parse(currentCode), null, 2);
      } catch {}
    } else {
      const lines = currentCode.split(/\r?\n/);
      let indentLevel = 0;
      const indentStep = '  ';
      const resultLines: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) {
          if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== '') {
            resultLines.push('');
          }
          continue;
        }

        const startsWithClosing = /^[\}\]\)]/.test(line);
        if (startsWithClosing) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        resultLines.push(indentStep.repeat(indentLevel) + line);

        let openCount = 0;
        let closeCount = 0;
        let inStr: string | null = null;
        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if ((ch === '"' || ch === "'" || ch === '`') && (c === 0 || line[c - 1] !== '\\')) {
            inStr = inStr === ch ? null : inStr || ch;
            continue;
          }
          if (inStr) continue;
          if (ch === '{' || ch === '[' || ch === '(') openCount++;
          if (ch === '}' || ch === ']' || ch === ')') closeCount++;
        }

        if (startsWithClosing) {
          indentLevel += Math.max(0, openCount - (closeCount - 1));
        } else {
          indentLevel = Math.max(0, indentLevel + openCount - closeCount);
        }
      }

      beautified = resultLines.join('\n');
    }

    if (beautified !== currentCode) {
      onContentChange(activeTab.id, beautified);
      if (editorRef.current) {
        editorRef.current.setValue(beautified);
      }
    }
  };

  // Filter recent files for quick switcher dropdown
  const filteredRecentFiles = recentFiles.filter((rf) => {
    if (!recentSearchQuery.trim()) return true;
    const q = recentSearchQuery.toLowerCase();
    return rf.name.toLowerCase().includes(q) || rf.path.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full w-full bg-editor-bg overflow-hidden relative">
      {/* Top Tab Bar matching VS Code & Antigravity layout */}
      <div className="flex items-center justify-between border-b border-border bg-titlebar h-9 select-none shrink-0 relative z-10">
        {/* Scrollable Tabs Row */}
        <div
          ref={tabsScrollRef}
          className="flex items-center flex-1 h-full overflow-x-auto no-scrollbar scroll-smooth"
          onWheel={(e) => {
            if (tabsScrollRef.current) {
              tabsScrollRef.current.scrollLeft += e.deltaY;
            }
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => onSelectTab(tab.id)}
                onMouseDown={(e) => {
                  // Middle click closes tab
                  if (e.button === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }
                }}
                title={tab.path}
                className={`group relative flex items-center gap-1.5 h-full px-3 text-xs border-r border-border cursor-pointer select-none whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'bg-editor-bg text-text font-medium border-t-2 border-t-accent shadow-xs'
                    : 'bg-transparent text-text-muted hover:text-text hover:bg-surface-hover/60'
                }`}
              >
                {/* File Type Badge Icon (TS, TSX, M↓, JS, etc.) */}
                <FileIcon fileName={tab.name} size="xs" />

                {/* Tab File Name */}
                <span className="truncate max-w-[160px] tracking-tight">{tab.name}</span>

                {/* Modified Badge ('M' or dot) matching VS Code / Antigravity screenshot */}
                {tab.isModified && (
                  <span
                    className="text-[10px] font-mono font-bold text-amber-400 group-hover:hidden px-0.5"
                    title="Modified"
                  >
                    M
                  </span>
                )}

                {/* Close '×' button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className={`p-0.5 rounded text-text-muted hover:text-text hover:bg-surface-active transition-opacity ml-0.5 ${
                    isActive ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Close (Ctrl+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {tabs.length === 0 && (
            <div className="px-3 text-xs text-text-muted italic flex items-center gap-1">
              <span>No open files</span>
            </div>
          )}
        </div>

        {/* Right Action Icons: History Back/Forward, Split, Minimap, Recent Files Menu */}
        <div className="flex items-center gap-0.5 px-2 shrink-0 border-l border-border bg-titlebar h-full">
          {/* History Navigation Back */}
          <IconButton
            size="xs"
            disabled={!canNavigateBack}
            tooltip="Go Back in Opened Files"
            onClick={() => onNavigateHistory?.('back')}
          >
            <ArrowLeft className="w-3 h-3" />
          </IconButton>

          {/* History Navigation Forward */}
          <IconButton
            size="xs"
            disabled={!canNavigateForward}
            tooltip="Go Forward in Opened Files"
            onClick={() => onNavigateHistory?.('forward')}
          >
            <ArrowRight className="w-3 h-3" />
          </IconButton>

          {/* Split Editor Right */}
          <IconButton
            size="xs"
            tooltip="Split Editor Right"
          >
            <SplitSquareVertical className="w-3 h-3" />
          </IconButton>

          {/* Toggle Minimap */}
          <IconButton
            size="xs"
            active={minimapEnabled}
            tooltip="Toggle Minimap"
            onClick={() => setMinimapEnabled(!minimapEnabled)}
          >
            <Eye className="w-3 h-3" />
          </IconButton>

          {/* Recent Files & Opened Files Switcher Menu (...) */}
          <div className="relative">
            <IconButton
              size="xs"
              active={isRecentMenuOpen}
              tooltip="Opened & Previously Opened Files (1-Click Switcher)"
              onClick={() => {
                setIsRecentMenuOpen(!isRecentMenuOpen);
                setRecentSearchQuery('');
              }}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </IconButton>

            {/* Quick Switcher Floating Dropdown */}
            {isRecentMenuOpen && (
              <div
                ref={recentMenuRef}
                className="absolute right-0 top-full mt-1 w-80 max-h-96 bg-surface border border-border rounded-lg shadow-xl flex flex-col z-50 text-xs overflow-hidden"
              >
                {/* Search Bar */}
                <div className="p-2 border-b border-border bg-surface-active/30 flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-text-muted shrink-0" />
                  <input
                    type="text"
                    value={recentSearchQuery}
                    onChange={(e) => setRecentSearchQuery(e.target.value)}
                    placeholder="Search opened & recent files..."
                    autoFocus
                    className="w-full bg-transparent text-text text-xs focus:outline-none placeholder:text-text-muted/60"
                  />
                  {recentSearchQuery && (
                    <button
                      onClick={() => setRecentSearchQuery('')}
                      className="text-text-muted hover:text-text"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto max-h-72 p-1 divide-y divide-border/40">
                  {/* Currently Open Tabs Section */}
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted/80 flex items-center justify-between">
                      <span>Open Editors ({tabs.length})</span>
                      {tabs.length > 1 && onCloseOtherTabs && activeTab && (
                        <button
                          onClick={() => {
                            onCloseOtherTabs(activeTab.id);
                            setIsRecentMenuOpen(false);
                          }}
                          className="hover:text-text hover:underline text-[9px] lowercase font-normal"
                        >
                          close others
                        </button>
                      )}
                    </div>
                    {tabs.map((tab) => {
                      const isActive = tab.id === activeTabId;
                      return (
                        <div
                          key={`tab-menu-${tab.id}`}
                          onClick={() => {
                            onSelectTab(tab.id);
                            setIsRecentMenuOpen(false);
                          }}
                          className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-accent/15 text-accent font-semibold'
                              : 'text-text hover:bg-surface-hover'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileIcon fileName={tab.name} size="xs" />
                            <span className="truncate">{tab.name}</span>
                            {tab.isModified && (
                              <span className="text-[9px] font-mono font-bold text-amber-400">M</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isActive && <Check className="w-3 h-3 text-accent" />}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(tab.id);
                              }}
                              className="p-0.5 hover:bg-surface-active rounded text-text-muted hover:text-text"
                              title="Close"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Previously Opened Files Section */}
                  {filteredRecentFiles.length > 0 && (
                    <div className="pt-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted/80 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-accent" />
                          <span>Previously Opened Files ({filteredRecentFiles.length})</span>
                        </span>
                        {onClearRecentFiles && (
                          <button
                            onClick={() => {
                              onClearRecentFiles();
                              setIsRecentMenuOpen(false);
                            }}
                            className="hover:text-accent-red text-text-muted p-0.5"
                            title="Clear recent files history"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      {filteredRecentFiles.map((rf) => {
                        const isOpen = tabs.some((t) => t.path === rf.path);
                        return (
                          <div
                            key={`recent-menu-${rf.path}`}
                            onClick={() => {
                              onOpenRecentFile?.({ path: rf.path, name: rf.name });
                              setIsRecentMenuOpen(false);
                            }}
                            className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-text hover:bg-surface-hover transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileIcon fileName={rf.name} size="xs" />
                              <div className="flex flex-col truncate">
                                <span className="truncate text-xs">{rf.name}</span>
                                <span className="text-[10px] text-text-muted truncate font-mono">
                                  {rf.path}
                                </span>
                              </div>
                            </div>
                            {isOpen ? (
                              <span className="text-[9px] text-accent px-1.5 py-0.5 rounded bg-accent/10 font-medium shrink-0">
                                Open
                              </span>
                            ) : (
                              <span className="text-[9px] text-text-muted/70 px-1 py-0.5 shrink-0">
                                1-Click
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-1.5 border-t border-border bg-surface-active/20 flex items-center justify-between text-[11px]">
                  {onCloseAllTabs && tabs.length > 0 && (
                    <button
                      onClick={() => {
                        onCloseAllTabs();
                        setIsRecentMenuOpen(false);
                      }}
                      className="px-2 py-0.5 text-text-muted hover:text-accent-red rounded transition-colors"
                    >
                      Close All Tabs
                    </button>
                  )}
                  <span className="text-[10px] text-text-muted/60 font-mono ml-auto">
                    Click any file to open
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs Navigation & Code Quality Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-surface/50 border-b border-border text-xs text-text-muted select-none h-7 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar font-mono text-[11px]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-text-muted/60 shrink-0" />}
                {isLast && activeTab && (
                  <FileIcon fileName={activeTab.name} size="xs" className="mr-0.5" />
                )}
                <span
                  className={
                    isLast
                      ? 'text-text font-medium'
                      : 'text-text-muted hover:text-text cursor-pointer transition-colors'
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        {activeTab && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Syntax Diagnostics Indicator */}
            {diagnostics.length > 0 ? (
              <button
                type="button"
                onClick={handleJumpToFirstError}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-mono hover:bg-red-500/25 transition-colors cursor-pointer"
                title={`Click to jump to line ${diagnostics[0].line}: ${diagnostics[0].message}`}
              >
                <AlertCircle className="w-3 h-3 text-red-400 shrink-0 animate-pulse" />
                <span>
                  {diagnostics.length} {diagnostics.length === 1 ? 'Error' : 'Errors'}
                </span>
              </button>
            ) : (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20 text-[10px] font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>0 Errors</span>
              </span>
            )}

            {/* Code Beautifier / Formatter Button */}
            <button
              type="button"
              onClick={handleBeautifyCode}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 text-[10px] font-medium transition-colors cursor-pointer"
              title="Beautify / Format Code (Shift+Alt+F)"
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Beautify</span>
            </button>

            {/* Language Tag */}
            <div className="text-[10px] text-text-muted/70 font-mono px-1.5 py-0.5 rounded bg-surface border border-border/50 uppercase">
              {getLanguage(activeTab.name)}
            </div>
          </div>
        )}
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full relative">
        {activeTab ? (
          <Editor
            height="100%"
            path={activeTab.path}
            language={getLanguage(activeTab.name)}
            theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
            value={activeTab.content}
            onMount={handleEditorDidMount}
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
              automaticLayout: true,
              bracketPairColorization: {
                enabled: true,
                independentColorPoolPerBracketType: true,
              },
              guides: {
                bracketPairs: true,
                bracketPairsHorizontal: true,
                indentation: true,
                highlightActiveIndentation: true,
              },
              renderLineHighlight: 'all',
              renderLineHighlightOnlyWhenFocus: false,
              formatOnPaste: true,
              formatOnType: true,
              glyphMargin: true,
              folding: true,
              showFoldingControls: 'always',
              matchBrackets: 'always',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              colorDecorators: true,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-muted text-xs gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-active/80 border border-border flex items-center justify-center text-accent">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-center max-w-sm">
              <div className="font-medium text-text text-sm mb-1">No file is currently open</div>
              <div className="text-text-muted text-[11px] leading-relaxed">
                {workspaceName ? (
                  <>
                    Working in <span className="text-text font-medium">{workspaceName}</span>. Create a new file or open an existing file to start editing.
                  </>
                ) : (
                  <>Click any file in Explorer or choose a file from the <span className="font-mono text-accent">...</span> menu above.</>
                )}
              </div>
            </div>

            {/* Direct Quick Actions */}
            <div className="flex items-center gap-2 mt-2">
              {onNewFile && (
                <button
                  type="button"
                  onClick={onNewFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>New File</span>
                </button>
              )}
              {onNewFolder && (
                <button
                  type="button"
                  onClick={onNewFolder}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:border-accent text-text text-xs font-medium hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New Folder</span>
                </button>
              )}
              {onOpenFile && (
                <button
                  type="button"
                  onClick={onOpenFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:border-border-hover text-text-muted hover:text-text text-xs font-medium transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open File...</span>
                </button>
              )}
            </div>

            {/* Scoped Recent Files */}
            {(() => {
              const normWorkspace = (workspacePath || '').replace(/\\/g, '/').toLowerCase();
              const validRecent = recentFiles.filter((rf) => {
                if (!normWorkspace) return true;
                const normPath = rf.path.replace(/\\/g, '/').toLowerCase();
                return normPath.startsWith(normWorkspace);
              });

              if (validRecent.length === 0 || !onOpenRecentFile) return null;

              return (
                <div className="flex flex-col items-center gap-1.5 mt-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/60">
                    Recent Files in Workspace
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-w-md justify-center">
                    {validRecent.slice(0, 5).map((rf) => (
                      <button
                        key={rf.path}
                        onClick={() => onOpenRecentFile({ path: rf.path, name: rf.name })}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border hover:border-accent text-text text-xs transition-colors cursor-pointer"
                      >
                        <FileIcon fileName={rf.name} size="xs" />
                        <span>{rf.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
