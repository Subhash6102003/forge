# Forge Functional IDE Architecture & Walkthrough

Forge is an enterprise-grade, local-first AI Desktop IDE built with Electron, React 18, TypeScript, Tailwind CSS, Monaco Editor, and xterm.js.

---

## 1. Clean Startup & Workspace Foundation
- **Welcome Screen First (`HomeDashboard`)**: On initial launch without a stored workspace, Forge displays the clean Welcome Screen rather than fabricated demo files or tabs.
- **Persistent Workspace State**: Last opened workspace and recent folders are persisted in a local configuration (`forge-config.json`) in Electron's `userData` directory. Sessions restore automatically on re-launch only if the folder still exists on disk.
- **Native Open Dialogs**:
  - `File: Open Folder` (`Ctrl+O`): Calls `dialog.showOpenDialog({ properties: ['openDirectory'] })`, builds directory tree recursively, saves to recent workspaces, and loads preferred startup files (`README.md`, `package.json`).
  - `File: Open File` (`Ctrl+Shift+O`): Calls `dialog.showOpenDialog({ properties: ['openFile'] })` and opens single files directly in the editor.
  - `Open Recent`: Rapidly switches between verified workspace directories from the welcome screen.
- **Cancel Safety**: Canceling folder or file dialogs safely aborts without injecting invented fallback data.

---

## 2. Path-Safe File Operations & Tree Synchronization
- **Path Traversal Guards**: Every file operation verifies that resolved paths reside strictly within the active workspace root (`assertPathSafe`), blocking directory traversal exploits.
- **Create File**: Validates file names (rejecting path separators and `..`), checks for duplicates, creates parent directories recursively, updates explorer, and opens a new editor tab.
- **Create Folder**: Recursively creates new directories on disk and refreshes the tree.
- **Rename**: Prompts for new name, validates boundaries, renames on disk via `fs.promises.rename`, and synchronizes affected open tabs and explorer tree.
- **Delete**: Displays native `dialog.showMessageBox` confirmation identifying the item name. Upon confirmation, deletes using `fs.promises.rm({ recursive: true, force: true })`, closes open editor tabs, and refreshes the tree.

---

## 3. Project Execution & Dev Server Management
- **Child Process Runner**: Implements `api:run:start(cwd, command)` spawning managed child processes (`child_process.spawn`).
- **Automatic Script Detection**: Inspects `package.json` for `dev`, `start`, or `build` scripts when command is omitted.
- **Live Output Streaming**: Streams `stdout` and `stderr` directly into the `BottomPanel` **Output** tab via `webContents.send('run:output', line)`.
- **Automatic Dev Server URL Detection**: Scans process output with regex patterns (`http://localhost:\d+`, `http://127.0.0.1:\d+`) and notifies the preview engine.
- **Process Termination**: `api:run:stop` terminates child processes and process trees cleanly (`taskkill /F /T /PID` on Windows).
- **Status Bar Integration**: Displays real-time process indicators (`RUNNING`, `STOPPED`, `FAILED`). Duplicate starts are blocked.

---

## 4. Live Preview Engine & Browser Integration
- **Idle State**: Preview URL defaults to empty `""` (idle state), eliminating stale default port errors.
- **Dynamic Port Synchronization**: Subscribes to dev server URL detection events to automatically load running applications.
- **Localhost Confinement**: Restricts preview iframe loading exclusively to localhost URLs.
- **Native Browser Shell Delegation**: "Browser" button invokes `api:shell:openExternal(url)`, validating the localhost whitelist and opening the page in the OS default browser.
- **Viewport Emulation**: Responsive Auto, Mobile (375px), Tablet (768px), and Desktop viewports.

---

## 5. Local & Cloud AI Model Infrastructure
- **Real Ollama Runtime Health**: Queries `GET http://localhost:11434/api/tags` with a 2-second timeout. Shows explicit setup instructions when offline without faking health.
- **Real Inference Speed**: Streams NDJSON lines from `POST /api/generate` and computes tokens/s from Ollama's `eval_duration` and `eval_count` metrics.
- **Cloud AI Adapters**:
  - `OpenAIProvider`: Chat completions with SSE streaming for GPT-4o.
  - `AnthropicProvider`: Message streaming for Claude 3.5 Sonnet.
  - Connection verification testing before first use.
- **Encrypted Keychain Storage**: Stores API keys using Electron's native `safeStorage` (OS DPAPI / Keychain encryption). Keys are never logged or exposed in plaintext.
- **AI Runtime Log Tab**: Real-time logging of health checks, model selections, prompt submissions, token speeds, and cancellations in `BottomPanel` **AI Log**.

---

## 6. Context-Aware AI Chat & Safe Code Diffs
- **Streaming AI Chat**: Routes chat messages to local or cloud models with real-time token rendering.
- **Streaming Stop Control**: Dedicated "Stop" button connected to `modelRuntime.abortCurrentGeneration()`.
- **Automated Context Synthesis**: Attaches active editor content, cursor selection, and file metadata while strictly excluding sensitive files (`.env`, `*.key`, `*.pem`, `node_modules/**`, `dist/**`).
- **Hunk-Based Diff Viewer**: Renders unified diffs with green additions (+), red deletions (-), and controls for Accept Hunk, Reject Hunk, Accept All, and Reject All.
- **Concurrency Conflict Guard**: Compares file `mtime` with disk stats prior to writing diffs, warning the user if the target file was modified externally.

---

## 7. UI Contrast & Command Palette
- **Theme Input Contrast**: Defined global tokens ensuring all inputs, textareas, and selects maintain high contrast against `--color-input-bg` across all 4 themes in light and dark modes.
- **Complete Command Palette**: Every command in `CommandPalette` (`Ctrl+K`) maps to an active handler (Open Folder, Open File, Save, Run Project, Stop Project, Toggle Terminal, Toggle Preview, Toggle Assistant, Ponytail Audit, Themes). All dead commands removed.

---

## 8. Verification Record
- **Vitest Unit Test Suite**:
  ```
  Test Files: 5 passed (5)
  Tests:      27 passed (27)
  ```
- **Full Production Build (`npm run build:all`)**:
  - `npm run build`: Vite compiled application with zero TypeScript errors.
  - `npm run build:electron`: TypeScript compiled Electron main and preload into CommonJS modules in `dist-electron/` with sandbox security enabled.
