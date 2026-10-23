# Security Specification & Threat Model: Forge AI Desktop IDE

## 1. Electron Process Hardening
- **Context Isolation**: `contextIsolation: true` is strictly enforced on all browser windows and webviews.
- **Node Integration Disabled**: `nodeIntegration: false` ensures no renderer script can execute unvetted Node primitives.
- **Window Open Restrictions**: `setWindowOpenHandler` denies all unhandled window opening attempts.
- **Navigation Lock**: Renderer windows are locked to authorized origins; navigation to arbitrary external web URLs inside the main frame is blocked.

## 2. Content Security Policy (CSP)
- CSP is strictly configured via HTTP headers and `<meta>` tags:
  ```http
  default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:* https://fonts.googleapis.com https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  ```

## 3. IPC Channel Validation & Sandboxing
- All messages sent over `window.forgeAPI` pass through schema validators.
- File system operations (`api.fs.readFile`, `api.fs.writeFile`, `api.fs.listDirectory`) reject path traversal attacks (e.g., `../../etc/passwd` or `..\..\Windows`).
- Model runtime commands are restricted to local endpoints (`http://localhost:11434`, `http://127.0.0.1:*`).

## 4. Local-First Privacy Guarantee
- Code, prompt context, and reverse-engineered ASTs remain entirely within the local machine.
- No outbound telemetry is sent without explicit cryptographic user opt-in.
