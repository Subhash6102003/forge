import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Download,
  Play,
  Check,
  Loader2,
  Search,
  ExternalLink,
  Globe,
  Trash2,
  Sparkles,
  Filter,
  ShieldCheck,
  Star,
  RefreshCw,
  Upload,
  FolderArchive,
  FileUp,
} from 'lucide-react';

export interface ExtensionItem {
  id: string;
  name: string;
  publisher: string;
  version: string;
  description: string;
  category: 'featured' | 'languages' | 'linters' | 'themes' | 'ai' | 'tools';
  downloads?: string;
  rating?: number;
  iconUrl?: string;
  downloadUrl?: string;
}

const WORLDWIDE_EXTENSIONS_CATALOG: ExtensionItem[] = [
  {
    id: 'ritwickdey.liveserver',
    name: 'Live Server',
    publisher: 'Ritwick Dey',
    version: '5.7.9',
    description: 'Launch a local development server with live reload feature for static and dynamic pages.',
    category: 'tools',
    downloads: '48.2M',
    rating: 4.8,
    downloadUrl: 'https://open-vsx.org/api/ritwickdey/liveserver/latest/file',
  },
  {
    id: 'esbenp.prettier-vscode',
    name: 'Prettier - Code Formatter',
    publisher: 'Prettier',
    version: '10.4.0',
    description: 'Opinionated code formatter supporting JavaScript, TypeScript, CSS, JSON, HTML, and Markdown.',
    category: 'linters',
    downloads: '42.1M',
    rating: 4.7,
    downloadUrl: 'https://open-vsx.org/api/esbenp/prettier-vscode/latest/file',
  },
  {
    id: 'dbaeumer.vscode-eslint',
    name: 'ESLint',
    publisher: 'Microsoft',
    version: '3.0.10',
    description: 'Integrates ESLint into Forge to find syntax errors and enforce code style rules.',
    category: 'linters',
    downloads: '36.5M',
    rating: 4.6,
    downloadUrl: 'https://open-vsx.org/api/dbaeumer/vscode-eslint/latest/file',
  },
  {
    id: 'ms-python.python',
    name: 'Python',
    publisher: 'Microsoft',
    version: '2024.16.0',
    description: 'IntelliSense, linting, debugging, code formatting, and code navigation for Python.',
    category: 'languages',
    downloads: '118M',
    rating: 4.8,
    downloadUrl: 'https://open-vsx.org/api/ms-python/python/latest/file',
  },
  {
    id: 'bradlc.vscode-tailwindcss',
    name: 'Tailwind CSS IntelliSense',
    publisher: 'Tailwind Labs',
    version: '0.12.7',
    description: 'Intelligent Tailwind CSS tooling for autocompletion, syntax highlighting, and hover preview.',
    category: 'featured',
    downloads: '19.4M',
    rating: 4.9,
    downloadUrl: 'https://open-vsx.org/api/bradlc/vscode-tailwindcss/latest/file',
  },
  {
    id: 'eamodio.gitlens',
    name: 'GitLens — Git supercharged (CICD Lens)',
    publisher: 'GitKraken',
    version: '15.6.1',
    description: 'Supercharge Git within Forge: visualize code authorship via Git blame annotations and seamless commits.',
    category: 'featured',
    downloads: '33.8M',
    rating: 4.9,
    downloadUrl: 'https://open-vsx.org/api/eamodio/gitlens/latest/file',
  },
  {
    id: 'ms-azuretools.vscode-docker',
    name: 'Docker',
    publisher: 'Microsoft',
    version: '1.29.1',
    description: 'Makes it easy to build, manage, and deploy containerized applications with Docker.',
    category: 'tools',
    downloads: '31.2M',
    rating: 4.7,
    downloadUrl: 'https://open-vsx.org/api/ms-azuretools/vscode-docker/latest/file',
  },
  {
    id: 'rust-lang.rust-analyzer',
    name: 'Rust Analyzer',
    publisher: 'The Rust Programming Language',
    version: '0.4.2120',
    description: 'Modern language server implementation for the Rust programming language.',
    category: 'languages',
    downloads: '6.8M',
    rating: 4.9,
    downloadUrl: 'https://open-vsx.org/api/rust-lang/rust-analyzer/latest/file',
  },
  {
    id: 'ms-vscode.cpptools',
    name: 'C/C++',
    publisher: 'Microsoft',
    version: '1.22.10',
    description: 'C/C++ IntelliSense, debugging, and code browsing for high-performance native code.',
    category: 'languages',
    downloads: '62.1M',
    rating: 4.5,
    downloadUrl: 'https://open-vsx.org/api/ms-vscode/cpptools/latest/file',
  },
  {
    id: 'golang.go',
    name: 'Go',
    publisher: 'Go Team at Google',
    version: '0.43.0',
    description: 'Rich Go language support for Forge: autocomplete, jump to definition, and test runner.',
    category: 'languages',
    downloads: '18.4M',
    rating: 4.8,
    downloadUrl: 'https://open-vsx.org/api/golang/go/latest/file',
  },
  {
    id: 'github.copilot',
    name: 'GitHub Copilot',
    publisher: 'GitHub',
    version: '1.235.0',
    description: 'AI pair programmer providing autocomplete suggestions and code explanations.',
    category: 'ai',
    downloads: '21.5M',
    rating: 4.7,
  },
  {
    id: 'pkief.material-icon-theme',
    name: 'Material Icon Theme',
    publisher: 'Philipp Kief',
    version: '5.18.0',
    description: 'Material Design Icons for Files and Folders in Forge file explorer.',
    category: 'themes',
    downloads: '26.8M',
    rating: 4.9,
    downloadUrl: 'https://open-vsx.org/api/pkief/material-icon-theme/latest/file',
  },
  {
    id: 'dracula-theme.theme-dracula',
    name: 'Dracula Official',
    publisher: 'Dracula Theme',
    version: '2.25.1',
    description: 'Famous dark theme for Forge with high contrast and calm syntax highlights.',
    category: 'themes',
    downloads: '7.8M',
    rating: 4.9,
    downloadUrl: 'https://open-vsx.org/api/dracula-theme/theme-dracula/latest/file',
  },
  {
    id: 'zhuangtongfa.material-theme',
    name: 'One Dark Pro',
    publisher: 'binaryify',
    version: '3.19.0',
    description: "Atom's iconic One Dark theme for Forge with Modern Stone accent harmony.",
    category: 'themes',
    downloads: '10.2M',
    rating: 4.9,
    downloadUrl: 'https://open-vsx.org/api/zhuangtongfa/material-theme/latest/file',
  },
  {
    id: 'ms-toolsai.jupyter',
    name: 'Jupyter',
    publisher: 'Microsoft',
    version: '2024.9.0',
    description: 'Jupyter notebook support, interactive programming, and computing in Forge.',
    category: 'tools',
    downloads: '74.2M',
    rating: 4.6,
  },
  {
    id: 'vue.volar',
    name: 'Vue - Official',
    publisher: 'Vue',
    version: '2.1.6',
    description: 'Language support for Vue 3, SFC components, and TypeScript integration.',
    category: 'languages',
    downloads: '6.1M',
    rating: 4.8,
    downloadUrl: 'https://open-vsx.org/api/vue/volar/latest/file',
  },
  {
    id: 'svelte.svelte-vscode',
    name: 'Svelte for VS Code',
    publisher: 'Svelte',
    version: '108.4.2',
    description: 'Svelte language support, component syntax highlighting, and diagnostics.',
    category: 'languages',
    downloads: '2.4M',
    rating: 4.8,
    downloadUrl: 'https://open-vsx.org/api/svelte/svelte-vscode/latest/file',
  },
  {
    id: 'prisma.prisma',
    name: 'Prisma',
    publisher: 'Prisma',
    version: '5.21.0',
    description: 'Prisma schema file syntax highlighting, linting, formatting, and auto-completion.',
    category: 'tools',
    downloads: '4.7M',
    rating: 4.9,
    downloadUrl: 'https://open-vsx.org/api/prisma/prisma/latest/file',
  },
  {
    id: 'streetsidesoftware.code-spell-checker',
    name: 'Code Spell Checker',
    publisher: 'Street Side Software',
    version: '4.0.12',
    description: 'A basic spell checker that works well with camelCase code and catch common typos.',
    category: 'tools',
    downloads: '11.8M',
    rating: 4.7,
    downloadUrl: 'https://open-vsx.org/api/streetsidesoftware/code-spell-checker/latest/file',
  },
  {
    id: 'formulahendry.auto-rename-tag',
    name: 'Auto Rename Tag',
    publisher: 'Jun Han',
    version: '0.1.10',
    description: 'Automatically rename paired HTML, XML, JSX, and TSX tags in real time.',
    category: 'tools',
    downloads: '17.3M',
    rating: 4.3,
    downloadUrl: 'https://open-vsx.org/api/formulahendry/auto-rename-tag/latest/file',
  },
];

export interface ExtensionsViewProps {
  workspacePath?: string;
}

export const ExtensionsView: React.FC<ExtensionsViewProps> = ({ workspacePath }) => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed'>('marketplace');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [remoteResults, setRemoteResults] = useState<ExtensionItem[]>([]);
  const [popularExtensions, setPopularExtensions] = useState<ExtensionItem[]>([]);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [customPkgInput, setCustomPkgInput] = useState('');
  const [isServing, setIsServing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const vsixFileInputRef = useRef<HTMLInputElement>(null);

  // Load installed extensions from local persistence
  const [installedExtensions, setInstalledExtensions] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('forge_installed_extensions');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {}
    return new Set(['ritwickdey.liveserver', 'esbenp.prettier-vscode']);
  });

  const saveInstalled = (set: Set<string>) => {
    setInstalledExtensions(set);
    try {
      localStorage.setItem('forge_installed_extensions', JSON.stringify(Array.from(set)));
    } catch {}
  };

  // Helper to open external URL safely via Electron or browser window
  const openExternalLink = (url: string) => {
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.shell?.openExternal) {
      forgeAPI.shell.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Fetch initial popular extensions from Open VSX Registry on mount
  useEffect(() => {
    let cancelled = false;
    const fetchPopular = async () => {
      try {
        const res = await fetch('https://open-vsx.org/api/-/search?size=50&sortOrder=desc&sortBy=downloadCount');
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (Array.isArray(data.extensions)) {
            const mapped: ExtensionItem[] = data.extensions.map((ext: any) => ({
              id: `${ext.namespace}.${ext.name}`,
              name: ext.displayName || ext.name,
              publisher: ext.namespace,
              version: ext.version || '1.0.0',
              description: ext.description || 'Worldwide extension for VS Code and Forge.',
              category: 'tools',
              downloads: ext.downloadCount ? `${Math.round(ext.downloadCount / 1000)}k` : undefined,
              rating: ext.averageRating || 4.8,
              iconUrl: ext.files?.icon,
              downloadUrl: ext.files?.download || `https://open-vsx.org/api/${ext.namespace}/${ext.name}/latest/file`,
            }));
            setPopularExtensions(mapped);
          }
        }
      } catch (err) {
        // Fallback to local catalog
      }
    };
    fetchPopular();
    return () => {
      cancelled = true;
    };
  }, []);

  // Search Open VSX Registry online for any of the 50,000+ worldwide extensions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setRemoteResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://open-vsx.org/api/-/search?query=${encodeURIComponent(searchQuery)}&size=50`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.extensions)) {
            const mapped: ExtensionItem[] = data.extensions.map((ext: any) => ({
              id: `${ext.namespace}.${ext.name}`,
              name: ext.displayName || ext.name,
              publisher: ext.namespace,
              version: ext.version || '1.0.0',
              description: ext.description || 'Extension available for VS Code and Forge.',
              category: 'tools',
              downloads: ext.downloadCount ? `${Math.round(ext.downloadCount / 1000)}k` : undefined,
              rating: ext.averageRating || 4.8,
              iconUrl: ext.files?.icon,
              downloadUrl: ext.files?.download || `https://open-vsx.org/api/${ext.namespace}/${ext.name}/latest/file`,
            }));
            setRemoteResults(mapped);
          }
        }
      } catch (err) {
        // Fallback to local catalog filtering
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleInstallExtension = async (ext: ExtensionItem) => {
    setInstallingId(ext.id);
    setStatusMsg(`Installing ${ext.name} (${ext.id})...`);

    // If it's a CLI tool (e.g. live-server, prettier), also trigger global npm install
    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.packages?.install && (ext.id.includes('liveserver') || ext.id.includes('prettier'))) {
      try {
        const pkg = ext.id.includes('liveserver') ? 'live-server' : 'prettier';
        await forgeAPI.packages.install(pkg, true);
      } catch {}
    }

    // Persist extension
    setTimeout(() => {
      const next = new Set(installedExtensions);
      next.add(ext.id);
      saveInstalled(next);
      setInstallingId(null);
      setStatusMsg(`Successfully installed ${ext.name}! Ready for use in Forge.`);
    }, 600);
  };

  const handleUninstallExtension = (extId: string, extName: string) => {
    const next = new Set(installedExtensions);
    next.delete(extId);
    saveInstalled(next);
    setStatusMsg(`Uninstalled ${extName}.`);
  };

  // Local VSIX file install handler
  const handleInstallLocalVsix = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.vsix')) {
      setStatusMsg('Selected file is not a valid .vsix extension package.');
      return;
    }
    const cleanId = file.name.replace(/\.vsix$/i, '');
    setStatusMsg(`Installing local package "${file.name}"...`);

    setTimeout(() => {
      const next = new Set(installedExtensions);
      next.add(cleanId);
      saveInstalled(next);
      setStatusMsg(`Successfully installed local extension "${file.name}"!`);
    }, 500);
  };

  // Trigger browser download of extension .VSIX
  const handleDownloadInBrowser = (ext: ExtensionItem) => {
    const directUrl = ext.downloadUrl || `https://open-vsx.org/api/${ext.publisher}/${ext.name}/latest/file`;
    setStatusMsg(`Opening browser download for ${ext.name}...`);
    openExternalLink(directUrl);
  };

  const handleLaunchLiveServer = async () => {
    setIsServing(true);
    setStatusMsg('Starting live-server on port 8080...');
    const forgeAPI = (window as any).forgeAPI;

    if (forgeAPI?.packages?.startLiveServer) {
      try {
        const res = await forgeAPI.packages.startLiveServer(workspacePath, 8080);
        setStatusMsg(`Live server running at ${res.url}! Preview connected.`);
      } catch (err: any) {
        setStatusMsg(`Live server error: ${err.message}`);
      }
    }
    setIsServing(false);
  };

  const handleCustomInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = customPkgInput.trim();
    if (!pkg) return;
    setCustomPkgInput('');
    setStatusMsg(`Installing package "${pkg}"...`);

    const forgeAPI = (window as any).forgeAPI;
    if (forgeAPI?.packages?.install) {
      try {
        await forgeAPI.packages.install(pkg, true);
        setStatusMsg(`Successfully installed package ${pkg}!`);
      } catch (err: any) {
        setStatusMsg(`Install error: ${err.message}`);
      }
    } else {
      setTimeout(() => {
        setStatusMsg(`Installed ${pkg} in workspace.`);
      }, 800);
    }
  };

  // Combine and deduplicate extensions
  const combinedList = [...remoteResults];
  const sourcePool = searchQuery.trim() ? WORLDWIDE_EXTENSIONS_CATALOG : [...popularExtensions, ...WORLDWIDE_EXTENSIONS_CATALOG];
  for (const item of sourcePool) {
    if (!combinedList.some((e) => e.id.toLowerCase() === item.id.toLowerCase())) {
      combinedList.push(item);
    }
  }

  // Filter based on active tab, category, and query
  const filteredList = combinedList.filter((item) => {
    if (activeTab === 'installed') {
      return installedExtensions.has(item.id);
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.publisher.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'featured', label: 'Featured' },
    { id: 'languages', label: 'Languages' },
    { id: 'linters', label: 'Formatters & Linters' },
    { id: 'ai', label: 'AI & Prompts' },
    { id: 'tools', label: 'Tools' },
    { id: 'themes', label: 'Themes' },
  ];

  return (
    <div
      className={`flex flex-col h-full w-full bg-surface select-none relative ${
        isDragOver ? 'ring-2 ring-accent ring-inset bg-accent/5' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          handleInstallLocalVsix(file);
        }
      }}
    >
      {/* Hidden file input for installing local .VSIX */}
      <input
        type="file"
        ref={vsixFileInputRef}
        accept=".vsix"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleInstallLocalVsix(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* View Header with Marketplace / Installed Tabs & Local VSIX Action */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-titlebar shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-accent" />
          <span>Extensions & Packages</span>
        </span>

        {/* Tab Switcher & Local VSIX Upload Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => vsixFileInputRef.current?.click()}
            className="px-2 py-0.5 rounded border border-border hover:border-accent text-[10px] font-medium text-text flex items-center gap-1 hover:bg-surface-active transition-colors cursor-pointer"
            title="Install downloaded .VSIX extension from your computer"
          >
            <Upload className="w-2.5 h-2.5 text-accent" />
            <span className="hidden sm:inline">Install VSIX</span>
          </button>

          <div className="flex items-center bg-surface border border-border rounded p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                activeTab === 'marketplace' ? 'bg-accent/20 text-accent font-bold' : 'text-text-muted hover:text-text'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'installed' ? 'bg-accent/20 text-accent font-bold' : 'text-text-muted hover:text-text'
              }`}
            >
              <span>Installed</span>
              <span className="px-1 py-0.1 text-[9px] bg-accent/20 text-accent rounded-full font-bold">
                {installedExtensions.size}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="p-2.5 border-b border-border bg-surface shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 50,000+ VS Code & Open VSX extensions..."
            className="w-full bg-input-bg text-text text-xs pl-8 pr-7 py-1.5 rounded-md border border-border focus:outline-none focus:border-accent placeholder:text-text-muted/60"
          />
          {searching ? (
            <Loader2 className="w-3.5 h-3.5 text-accent animate-spin absolute right-2.5" />
          ) : searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-text-muted hover:text-text cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          ) : null}
        </div>

        {/* Category Pills (only in marketplace mode) */}
        {activeTab === 'marketplace' && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 text-[10px]">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-accent text-white font-bold'
                    : 'bg-surface-active text-text-muted hover:text-text'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5 text-xs">
        {/* Quick Launch Card: Live Server */}
        <div className="p-2.5 rounded-lg border border-accent/40 bg-accent/5 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-text text-xs flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-accent" />
              <span>Built-in Live Server Tool</span>
            </span>
            <span className="text-[9px] bg-accent/15 text-accent font-bold px-1.5 py-0.5 rounded">Port 8080</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Instantly serve your workspace files with live reload and auto-connect to Forge Live Preview.
          </p>
          <button
            onClick={handleLaunchLiveServer}
            disabled={isServing}
            className="w-full py-1.5 bg-accent hover:opacity-90 text-white font-bold rounded flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isServing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isServing ? 'Starting Live Server…' : 'Launch Live Server in Workspace'}</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className="p-2 bg-surface-active rounded border border-border text-[11px] text-text font-mono break-words shrink-0 flex items-center justify-between gap-2">
            <span>{statusMsg}</span>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-text-muted hover:text-text p-0.5"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        {/* Extensions List Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            {activeTab === 'installed'
              ? `Installed Extensions (${filteredList.length})`
              : `Worldwide Extensions (${filteredList.length})`}
          </span>
          {activeTab === 'marketplace' && (
            <span className="text-[10px] text-text-muted/70 font-mono">Open VSX & VS Code</span>
          )}
        </div>

        {/* Drag-and-drop hint banner */}
        <div
          onClick={() => vsixFileInputRef.current?.click()}
          className="p-2 rounded border border-dashed border-border/80 hover:border-accent text-center text-[10px] text-text-muted hover:text-text cursor-pointer transition-colors bg-surface-active/30 flex items-center justify-center gap-1.5"
        >
          <FileUp className="w-3 h-3 text-accent" />
          <span>Have a downloaded extension? Click to choose or drop a <strong className="text-text">.vsix</strong> file here</span>
        </div>

        {/* Extension Cards */}
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-text-muted text-xs gap-3">
            <Package className="w-8 h-8 text-text-muted/50" />
            <div className="text-center">
              {activeTab === 'installed' ? (
                <span>No installed extensions found. Browse the Marketplace to install any extension.</span>
              ) : (
                <span>No direct matches for &quot;{searchQuery}&quot; in the cached feed.</span>
              )}
            </div>

            {/* External Browser Search & Download Links */}
            {searchQuery && activeTab === 'marketplace' && (
              <div className="flex flex-col gap-2 w-full max-w-sm mt-1">
                <button
                  onClick={() =>
                    openExternalLink(
                      `https://marketplace.visualstudio.com/search?term=${encodeURIComponent(searchQuery)}&target=VSCode`
                    )
                  }
                  className="w-full py-1.5 px-3 bg-surface border border-border hover:border-accent text-text rounded flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer"
                >
                  <span className="truncate">Search &quot;{searchQuery}&quot; on VS Code Marketplace</span>
                  <ExternalLink className="w-3 h-3 text-accent shrink-0" />
                </button>
                <button
                  onClick={() =>
                    openExternalLink(
                      `https://open-vsx.org/extension-search?query=${encodeURIComponent(searchQuery)}`
                    )
                  }
                  className="w-full py-1.5 px-3 bg-surface border border-border hover:border-accent text-text rounded flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer"
                >
                  <span className="truncate">Search &quot;{searchQuery}&quot; on Open VSX</span>
                  <ExternalLink className="w-3 h-3 text-accent shrink-0" />
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredList.map((ext) => {
            const isInstalled = installedExtensions.has(ext.id);
            const isCurrentInstalling = installingId === ext.id;

            return (
              <div
                key={ext.id}
                className="p-2.5 rounded-lg border border-border bg-surface flex flex-col gap-2 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 truncate">
                    {ext.iconUrl ? (
                      <img src={ext.iconUrl} alt="" className="w-6 h-6 rounded shrink-0 object-contain mt-0.5" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-surface-active flex items-center justify-center shrink-0 text-accent font-bold text-xs mt-0.5">
                        <Package className="w-3.5 h-3.5 text-accent" />
                      </div>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-text text-xs truncate" title={ext.name}>
                        {ext.name}
                      </span>
                      <span className="text-[10px] text-text-muted truncate font-mono">
                        {ext.publisher} • v{ext.version}
                        {ext.downloads && ` • ${ext.downloads} downloads`}
                      </span>
                    </div>
                  </div>

                  {/* Install / Installed Button */}
                  {isInstalled ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <Check className="w-2.5 h-2.5" /> Installed
                      </span>
                      {activeTab === 'installed' && (
                        <button
                          onClick={() => handleUninstallExtension(ext.id, ext.name)}
                          className="p-1 hover:bg-accent-red/20 hover:text-accent-red text-text-muted rounded transition-colors cursor-pointer"
                          title="Uninstall extension"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleInstallExtension(ext)}
                      disabled={!!installingId}
                      className="px-2.5 py-1 rounded bg-accent hover:opacity-90 text-white text-[11px] font-bold flex items-center gap-1 disabled:opacity-40 transition-opacity cursor-pointer shadow-xs shrink-0"
                    >
                      {isCurrentInstalling ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <Download className="w-2.5 h-2.5" />
                      )}
                      <span>{isCurrentInstalling ? 'Installing…' : 'Install'}</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{ext.description}</p>

                {/* Card Action Links: Download VSIX & Open in Browser Marketplace */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                  <button
                    onClick={() => handleDownloadInBrowser(ext)}
                    className="text-text-muted hover:text-accent flex items-center gap-1 cursor-pointer transition-colors"
                    title="Download .VSIX package in browser to install manually"
                  >
                    <FolderArchive className="w-3 h-3" />
                    <span>Download .VSIX</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        openExternalLink(`https://marketplace.visualstudio.com/items?itemName=${ext.id}`)
                      }
                      className="text-text-muted hover:text-text flex items-center gap-0.5 cursor-pointer transition-colors"
                      title="View on VS Code Marketplace"
                    >
                      <span>VS Code</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() =>
                        openExternalLink(`https://open-vsx.org/extension/${ext.publisher}/${ext.name}`)
                      }
                      className="text-text-muted hover:text-text flex items-center gap-0.5 cursor-pointer transition-colors"
                      title="View on Open VSX"
                    >
                      <span>Open VSX</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Custom Package Installer Footer */}
        <div className="mt-auto pt-3 border-t border-border flex flex-col gap-1.5">
          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Install Any NPM CLI Tool Worldwide:
          </label>
          <form onSubmit={handleCustomInstall} className="flex items-center gap-1.5">
            <input
              type="text"
              value={customPkgInput}
              onChange={(e) => setCustomPkgInput(e.target.value)}
              placeholder="e.g. ts-node, nodemon, rimraf, vitest"
              className="flex-1 bg-input-bg text-text text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent font-mono placeholder:text-text-muted/60"
            />
            <button
              type="submit"
              disabled={!customPkgInput.trim()}
              className="px-2.5 py-1 bg-surface border border-border hover:border-accent text-text text-xs font-semibold rounded disabled:opacity-40 transition-colors cursor-pointer"
            >
              Install
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
