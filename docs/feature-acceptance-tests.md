# Forge AI Desktop IDE — Feature Acceptance Tests

This document defines the acceptance criteria and verification procedures for each repaired vulnerability in Forge.

---

## Acceptance Test Matrix

### Test FAT-01: Welcome Screen & Initial Startup (Vulnerability 1)
- **Preconditions**: Stored configuration is empty or pointing to a non-existent path.
- **Action**: Launch application.
- **Expected Results**:
  1. The application displays `HomeDashboard` (Welcome Screen).
  2. No hardcoded sample files (`my-ai-app`), tabs (`App.tsx`, `Header.tsx`), or chat messages appear.
  3. Action cards are present: Open Folder, Open File, New Project.
  4. File tree and editor canvas are empty until the user opens a real workspace.

### Test FAT-02: Native Open Folder & Open File (Vulnerability 2)
- **Action 1**: Click "Open Folder" or press `Ctrl+O`.
- **Expected Result 1**: Native Electron directory picker opens. Selecting a valid directory loads its real tree into the explorer, sets the workspace name, and opens the root text file (`README.md` or `package.json`).
- **Action 2**: Cancel the folder selection dialog.
- **Expected Result 2**: The operation aborts cleanly without loading any fake demo data.
- **Action 3**: Click "Open File".
- **Expected Result 3**: Native file picker opens. Selected file opens as an active tab in the editor with syntax highlighting.
- **Action 4**: Restart the application.
- **Expected Result 4**: The last opened folder is restored automatically if it still exists on disk.

### Test FAT-03: Real File Management & Traversal Guards (Vulnerability 3)
- **Action 1**: In the file explorer, click "New File" and enter `test-create.ts`.
- **Expected Result 1**: File is written to disk, appears in the tree, and opens in a tab.
- **Action 2**: Attempt to create a file with invalid characters (`../escape.txt` or `foo/bar`).
- **Expected Result 2**: Name validation fails and a descriptive error toast is shown.
- **Action 3**: Click "New Folder" and enter `test-folder`.
- **Expected Result 3**: Directory is created on disk and displayed in the tree.
- **Action 4**: Click "Rename" on `test-create.ts` and change it to `test-renamed.ts`.
- **Expected Result 4**: File is renamed on disk; active tab updates to the new path.
- **Action 5**: Click "Delete" on `test-renamed.ts`.
- **Expected Result 5**: Native confirmation dialog appears naming `test-renamed.ts`. Upon confirmation, file is removed from disk, removed from the explorer tree, and closed in the editor.

### Test FAT-05: Dev Server URL Detection & Preview Isolation (Vulnerability 5)
- **Action 1**: Observe preview panel before running any dev server.
- **Expected Result 1**: Preview is in "Idle" state with URL empty `""`. No `http://localhost:5173` connection error is shown.
- **Action 2**: Start a dev server in a project.
- **Expected Result 2**: Standard output is parsed for `http://localhost:PORT`. Once detected, preview URL updates automatically and loads the running application.
- **Action 3**: Attempt to enter an external URL in the preview bar (e.g., `https://google.com`).
- **Expected Result 3**: Navigation is rejected; only detected localhost ports can be rendered.

### Test FAT-06: Project Process Execution: Run / Build / Stop (Vulnerability 6)
- **Action 1**: Open a Node.js project containing a `package.json` with a `"dev"` script. Click "Run Project" in Command Palette or UI.
- **Expected Result 1**: Child process spawns `npm run dev`. Real stdout streams into the Output/Terminal tab. Status bar reflects "Running".
- **Action 2**: Click "Stop Project".
- **Expected Result 2**: Process tree is terminated (`taskkill` on Windows / SIGKILL on Unix). Output logs session end and status bar changes to "Stopped".
- **Action 3**: Trigger duplicate "Run Project" while already running.
- **Expected Result 3**: Prevented with warning notification; no orphan child processes are spawned.

### Test FAT-07: External Browser Integration (Vulnerability 7)
- **Action 1**: With a detected localhost server running, click "Browser" in the Preview header.
- **Expected Result 1**: Calls Electron's `shell.openExternal(url)`. The page opens in the OS default browser.
- **Action 2**: Attempt to invoke open external with a non-localhost URL.
- **Expected Result 2**: IPC rejects the call for security.

### Test FAT-08: Local Ollama Runtime Health & Streaming (Vulnerability 8)
- **Action 1**: Check model runtime when Ollama daemon is not running.
- **Expected Result 1**: Real health check returns offline within 2 seconds. UI displays instructions to start Ollama (`ollama serve`), never showing simulated "healthy".
- **Action 2**: Start Ollama with `llama3.1:8b` installed.
- **Expected Result 2**: `/api/tags` lists installed models; streaming from `/api/generate` produces real tokens. Status bar displays genuine tokens/sec.

### Test FAT-09: Cloud AI Key Management & Provider Integration (Vulnerability 9)
- **Action 1**: Navigate to Settings -> Cloud AI Providers.
- **Expected Result 1**: Input fields for OpenAI and Anthropic API keys are displayed with dark-themed inputs.
- **Action 2**: Save an OpenAI API key.
- **Expected Result 2**: Key is securely encrypted via Electron `safeStorage` (OS DPAPI/keychain). The key is never displayed back in plaintext.
- **Action 3**: Select OpenAI model in chat and send a message.
- **Expected Result 3**: Connects to OpenAI API, streams SSE responses, and displays tokens in real-time.

### Test FAT-10: Real-Time AI Runtime Logging (Vulnerability 10)
- **Action 1**: Open BottomPanel -> AI Log tab.
- **Action 2**: Trigger a model completion or health check.
- **Expected Result 2**: Genuine timestamped logs appear: health checks, prompt submission, token generation progress, and duration. No fabricated log lines.

### Test FAT-11: Full Context AI Chat (Vulnerability 11)
- **Action 1**: Select code in the editor and click "Selection" context chip.
- **Action 2**: Send a prompt in AI Chat.
- **Expected Result 2**: The prompt payload includes the exact selected code snippet and file metadata.
- **Action 3**: Check context exclusions.
- **Expected Result 3**: Any `.env` or credential files are strictly excluded from automated context bundles.
- **Action 4**: Click "Stop" during generation.
- **Expected Result 4**: Generation immediately ceases; stream aborts cleanly.

### Test FAT-12: AI Code Diff Application & Conflict Safety (Vulnerability 12)
- **Action 1**: Request an inline edit in Monaco.
- **Expected Result 1**: Proposed diff is rendered in `DiffViewer` with distinct additions (green) and deletions (red).
- **Action 2**: Modify the target file externally before accepting the diff.
- **Action 3**: Click "Accept Diff".
- **Expected Result 3**: mtime mismatch is detected. The IDE displays a conflict warning without overwriting the file.
- **Action 4**: Accept a diff without conflict.
- **Expected Result 4**: File is validated within workspace boundaries and written to disk.

### Test FAT-13: UI Theme Contrast & Command Palette Integrity (Vulnerability 13)
- **Action 1**: Switch between all 4 themes (Modern Stone, Enterprise Slate, Executive Navy, Forest Executive) in both Dark and Light modes.
- **Expected Result 1**: All inputs, textareas, and select elements have dark backgrounds in dark mode and light backgrounds in light mode with high-contrast text. No unreadable white inputs in dark mode.
- **Action 2**: Open Command Palette (`Ctrl+K`). Test each listed command:
  - File: Open Folder
  - File: Open File
  - File: Save Current File
  - Project: Run Project
  - Project: Stop Project
  - View: Toggle Terminal
  - View: Toggle Preview
- **Expected Result 2**: Every command executes its functional handler. No broken or dead commands exist in the palette.
