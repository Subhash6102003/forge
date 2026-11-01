# Forge AI Desktop IDE — Detailed Repair Plan

This plan outlines the sequential execution phases to resolve all 13 identified vulnerabilities while strictly preserving existing tests, theme tokens, and system capabilities.

---

## Phase 1: Workspace Foundation (Vulnerabilities 1, 2, 3)

### 1.1 Persistent Config & Native File Dialogs (`electron/main.ts`)
- Implement a JSON-based workspace config manager using `app.getPath('userData')/forge-config.json`.
- Methods: `loadConfig()`, `saveConfig()`, tracking `lastWorkspacePath` and `recentWorkspaces: string[]`.
- Update `api:fs:getInitialWorkspace`:
  - If `lastWorkspacePath` exists on disk and is a valid directory, return `{ folderPath, folderName, tree }`.
  - If no workspace or missing, return `null`.
- Update `api:fs:openFolder`:
  - Invoke `dialog.showOpenDialog({ properties: ['openDirectory'] })`.
  - If canceled, return `null`.
  - Validate folder exists; save to `forge-config.json`; add to `recentWorkspaces`; return tree.
- Implement `api:fs:openFile`:
  - Invoke `dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'All Files', extensions: ['*'] }] })`.
  - Return `{ filePath, fileName, content }` or `null`.

### 1.2 File Operations & Path Traversal Guards (`electron/main.ts`)
- Ensure all file operations (`createFile`, `createDirectory`, `rename`, `deleteFile`, `readFile`, `writeFile`, `getFileStat`) check path safety:
  - Resolve absolute path: `const resolved = path.resolve(filePath);`
  - In workspace context, ensure `resolved.startsWith(path.resolve(currentWorkspacePath))` to prevent directory traversal.
- Implement `api:fs:rename`:
  - `fs.promises.rename(oldPath, newPath)` after validation.
- Implement `api:fs:deleteFile`:
  - Invoke `dialog.showMessageBox` confirming deletion of target item name.
  - Delete only if confirmed using `fs.promises.rm({ recursive: true, force: true })`.
- Implement `api:fs:getFileStat`:
  - Return `{ mtimeMs: stat.mtimeMs, size: stat.size }` for concurrency conflict detection.

### 1.3 Preload & Global Types (`electron/preload.ts`, `src/types/forgeAPI.d.ts`)
- Expose `openFile`, `rename`, `getFileStat`, `getRecentWorkspaces`.

### 1.4 Welcome Screen & Real State (`src/App.tsx`, `HomeDashboard.tsx`)
- Remove hardcoded `initialFiles`, tabs, and chat messages.
- On launch, if `getInitialWorkspace` returns `null`, set `isHomeDashboard = true` and `files = []`, `tabs = []`.
- `HomeDashboard.tsx` binds Open Folder, Open File, Open Recent, and New Project to real IPC operations.

---

## Phase 2: Execution & Preview Engine (Vulnerabilities 5, 6, 7)

### 2.1 Child Process Execution Manager (`electron/main.ts`)
- Maintain a running process tracker:
  - `activeRunProcess: child_process.ChildProcess | null`.
- Implement `api:run:start(cwd, command)`:
  - If command not provided, inspect `package.json` in `cwd` for `scripts.dev`, `scripts.start`, `scripts.build`.
  - Spawn child process with standard streams.
  - Stream `stdout` and `stderr` to renderer via `webContents.send('run:output', text)`.
  - Scan output stream with regex: `Local:\s+(https?://localhost:\d+)` or `(https?://127.0.0.1:\d+)`.
  - Emit `run:url-detected` with detected URL.
- Implement `api:run:stop`:
  - On Windows: `child_process.execSync(\`taskkill /F /T /PID ${pid}\`)`.
  - On Unix: `process.kill(-pid, 'SIGKILL')`.
  - Send status updates: `run:status` ('stopped', 'running', 'failed').

### 2.2 Preview Panel URL Synchronization (`src/components/layout/PreviewPanel.tsx`)
- Default URL is `''` (idle).
- Listen to `forgeAPI.run.onUrlDetected((url) => setUrl(url))` to automatically transition to live preview.
- Restrict iframe `src` to localhost URLs (`http://localhost:*`, `http://127.0.0.1:*`).
- Wire "Open in Browser" button to `forgeAPI.shell.openExternal(url)`.

### 2.3 Safe External Shell IPC (`electron/main.ts`)
- Implement `api:shell:openExternal(url)`:
  - Validate URL starts with `http://localhost:` or `http://127.0.0.1:`.
  - Call Electron's `shell.openExternal(url)`.

---

## Phase 3: AI Infrastructure & Real Models (Vulnerabilities 8, 9, 10)

### 3.1 Local Ollama Health & Streaming (`src/services/modelRuntimeService.ts`)
- Real health check against `http://localhost:11434/api/tags` with 2s timeout.
- Return explicit error state if offline with installation instructions.
- Real streaming completions via NDJSON from `/api/generate`.
- Calculate real speed from `eval_count` and `eval_duration`.

### 3.2 Cloud AI Key Storage & Providers (`src/services/providers/*`, `electron/main.ts`)
- Implement secure API key storage in `electron/main.ts`:
  - Use Electron `safeStorage` (encrypted with OS keychain/DPAPI).
  - IPC: `api:keychain:set(keyName, value)` and `api:keychain:get(keyName)`.
  - Provide `api:keychain:hasKey(keyName)` to renderer so plaintext keys are never returned unnecessarily.
- Create `src/services/providers/OpenAIProvider.ts` and `src/services/providers/AnthropicProvider.ts` with streaming SSE support.
- Add SettingsView UI to input, validate, and store OpenAI and Anthropic keys.

### 3.3 Real-Time AI Logging (`electron/main.ts`, `src/components/layout/BottomPanel.tsx`)
- Emit `ai:log` events on model calls, token speed updates, and provider errors.
- Display "AI Log" tab in `BottomPanel.tsx` with live streaming output.

---

## Phase 4: AI-Assisted Editing & Safe Diff Application (Vulnerabilities 11, 12)

### 4.1 Real AI Chat Streaming & Context Synthesis (`src/components/layout/AIChatPanel.tsx`, `src/App.tsx`)
- Route messages to `modelRuntimeService.stream()`.
- Context resolution:
  - Current File: active editor content.
  - Selection: selected code snippet.
  - Project: file tree (names only) + package.json scripts.
  - Exclude `.env`, `.env.*`, `*.key`, `node_modules`, `dist`.
- Provide streaming "Stop" button linked to `AbortController`.

### 4.2 Safe Diff Viewer & Hunk Application (`src/components/ui/DiffViewer.tsx`, `src/components/layout/InlineAIEdit.tsx`, `src/App.tsx`)
- Parse model response into unified diff or hunks.
- Render additions (+ green) and deletions (- red).
- Support Accept All, Reject All, Accept Hunk, Reject Hunk.
- Prior to saving:
  - Verify target file is inside workspace.
  - Compare file `mtime` with disk stat to detect external modifications.
  - Prompt conflict warning if `mtime` does not match.

---

## Phase 5: UI & Design System Polishing (Vulnerability 13 + Controls)

### 5.1 Input Token Fixes (`src/styles/tokens.css`, `src/styles/index.css`)
- Inject global input styling:
  ```css
  input, textarea, select {
    background-color: var(--color-input-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
  input::placeholder, textarea::placeholder {
    color: var(--color-text-muted);
  }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--color-accent);
  }
  ```
- Ensure `--color-input-bg` is defined across all light/dark theme variants in `themes.css`.

### 5.2 Command Palette Handlers (`src/App.tsx`, `src/components/ui/CommandPalette.tsx`)
- Wire all commands to actual functional implementations:
  - Open File (`handleOpenFile`)
  - Open Folder (`handleOpenFolder`)
  - Save (`handleSaveActiveFile`)
  - Run Project (`handleRunProject`)
  - Stop Project (`handleStopProject`)
  - Show/Hide Terminal (`toggleBottomPanel`)
  - Show/Hide Preview (`togglePreviewPanel`)
- Remove all dummy or unimplemented entries.

---

## Phase 6: Verification & Test Execution
- Run Vitest test suite (`npm test`).
- Run production build (`npm run build:all`).
- Update documentation and audit records.
