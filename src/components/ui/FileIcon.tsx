import React from 'react';
import {
  FileText,
  FileJson,
  FileImage,
  GitBranch,
  Lock,
  Settings,
} from 'lucide-react';

export interface FileIconProps {
  fileName: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const FileIcon: React.FC<FileIconProps> = ({ fileName, className = '', size = 'sm' }) => {
  const lower = fileName.toLowerCase();

  const iconClasses = size === 'xs' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4.5 h-4.5' : 'w-4 h-4';
  const badgeClasses =
    size === 'xs'
      ? 'text-[8.5px] h-3.5 min-w-[14px] px-0.5 leading-none'
      : size === 'md'
      ? 'text-[11px] h-4.5 min-w-[18px] px-1 leading-none'
      : 'text-[9.5px] h-4 min-w-[16px] px-0.5 leading-none';

  // Git files (.gitignore, .gitattributes, .gitmodules, .gitkeep, etc.)
  if (
    lower === '.gitignore' ||
    lower === '.gitattributes' ||
    lower === '.gitmodules' ||
    lower === '.gitkeep' ||
    lower.startsWith('.git')
  ) {
    return (
      <GitBranch
        className={`${iconClasses} text-[#f05032] shrink-0 ${className}`}
        aria-label="Git"
      />
    );
  }

  // Lock files (package-lock.json, yarn.lock, pnpm-lock.yaml, Cargo.lock)
  if (lower.includes('lock') && (lower.endsWith('.json') || lower.endsWith('.yaml') || lower.endsWith('.yml') || lower.endsWith('.lock'))) {
    return (
      <Lock
        className={`${iconClasses} text-[#94a3b8] shrink-0 ${className}`}
        aria-label="Lockfile"
      />
    );
  }

  // Environment files (.env, .env.local, .env.production, etc.)
  if (lower.startsWith('.env')) {
    return (
      <Settings
        className={`${iconClasses} text-[#eab308] shrink-0 ${className}`}
        aria-label="Config"
      />
    );
  }

  // Config / linter files (.prettierrc, .eslintrc, .editorconfig, .npmrc)
  if (
    lower.includes('prettier') ||
    lower.includes('eslint') ||
    lower === '.editorconfig' ||
    lower === '.npmrc'
  ) {
    return (
      <Settings
        className={`${iconClasses} text-[#94a3b8] shrink-0 ${className}`}
        aria-label="Settings"
      />
    );
  }

  // Images
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.ico')
  ) {
    return (
      <FileImage
        className={`${iconClasses} text-[#10b981] shrink-0 ${className}`}
        aria-label="Image"
      />
    );
  }

  // TypeScript (excluding declaration files)
  if (lower.endsWith('.ts') && !lower.endsWith('.d.ts')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#3178c6]/20 text-[#3178c6] border border-[#3178c6]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="TypeScript"
      >
        TS
      </span>
    );
  }

  // TypeScript React & Declaration files
  if (lower.endsWith('.tsx') || lower.endsWith('.d.ts')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="TypeScript JSX"
      >
        TSX
      </span>
    );
  }

  // JavaScript
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#f7df1e]/20 text-[#eab308] border border-[#f7df1e]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="JavaScript"
      >
        JS
      </span>
    );
  }

  // JavaScript React
  if (lower.endsWith('.jsx')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#61dafb]/20 text-[#00b4d8] border border-[#61dafb]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="JavaScript JSX"
      >
        JSX
      </span>
    );
  }

  // JSON
  if (lower.endsWith('.json') || lower.endsWith('.jsonc') || lower.endsWith('.json5')) {
    return (
      <FileJson
        className={`${iconClasses} text-[#f59e0b] shrink-0 ${className}`}
        aria-label="JSON"
      />
    );
  }

  // Markdown
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#4a90e2]/20 text-[#60a5fa] border border-[#4a90e2]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="Markdown"
      >
        M↓
      </span>
    );
  }

  // CSS / SCSS / LESS
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.less')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#ec4899]/20 text-[#ec4899] border border-[#ec4899]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="Stylesheet"
      >
        #
      </span>
    );
  }

  // HTML
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="HTML"
      >
        {'<>'}
      </span>
    );
  }

  // YAML
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="YAML"
      >
        YML
      </span>
    );
  }

  // Python
  if (lower.endsWith('.py') || lower.endsWith('.pyw')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="Python"
      >
        PY
      </span>
    );
  }

  // PowerShell / Shell
  if (lower.endsWith('.ps1') || lower.endsWith('.bat') || lower.endsWith('.cmd')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="PowerShell"
      >
        &gt;_
      </span>
    );
  }

  if (lower.endsWith('.sh') || lower.endsWith('.bash') || lower.endsWith('.zsh')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="Shell Script"
      >
        $_
      </span>
    );
  }

  // Rust
  if (lower.endsWith('.rs')) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-[2px] bg-[#ea580c]/20 text-[#fb923c] border border-[#ea580c]/30 select-none shrink-0 ${badgeClasses} ${className}`}
        title="Rust"
      >
        RS
      </span>
    );
  }

  // Default File - Clean, authentic VS Code grey file icon
  return (
    <FileText
      className={`${iconClasses} text-text-muted shrink-0 ${className}`}
      aria-label="File"
    />
  );
};
