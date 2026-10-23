# Architecture Specification: Forge AI Desktop IDE

## 1. System Architecture

Forge is structured as a hardened dual-process Electron desktop application:
1. **Main Process (Node.js Environment)**:
   - Manages OS-level capabilities: Local file system operations, terminal processes (PTY), local model daemon discovery (Ollama/llama.cpp/OpenAI endpoints), and REA MCP reverse-engineering bridges.
   - Strictly isolates renderer from Node.js primitives via `contextIsolation: true` and `nodeIntegration: false`.
2. **Renderer Process (React + TypeScript + Monaco Editor)**:
   - High-performance UI shell rendered with Vite, Tailwind CSS tokens, and Monaco Editor.
   - Communicates with Main process solely via schema-validated typed IPC channels.
3. **Core Services**:
   - `modelRuntimeService`: Orchestrates local model execution, tokens/sec benchmarking, and streaming responses.
   - `skillsRouter`: Semantic router mapping user intents to specific skill rulebooks (`subhash-uiux`, `subhash-developer`, `ponytail`, `canvas-design`, `algorithmic-art`).
   - `ponytailEngine`: Zero-bloat lazy senior developer optimization layer reducing lines of code (-53% rule) and enforcing tests for risky logic.
   - `reaBridge`: MCP bridge to reverse-engineer binaries, processes, runtime webviews, and UI component hierarchies.
   - `artStudioEngine`: Generative algorithmic art engine using p5.js with deterministic integer seeds and real-time canvas parameter controls.

## 2. Directory Layout
```
forge/
├── electron/
│   ├── main.ts              # Hardened window creation, CSP, IPC handlers
│   ├── preload.ts           # Context bridge exposing typed window.forgeAPI
│   └── ipc/                 # IPC handlers (fs, models, rea, terminal)
├── skills/                  # Core skill documents
│   ├── subhash-uiux.md
│   ├── subhash-developer.md
│   ├── brand-guidelines.md
│   ├── canvas-design.md
│   ├── algorithmic-art.md
│   └── ponytail.md
├── docs/                    # Architectural & design specifications
├── src/
│   ├── styles/              # Design tokens, brand tokens, 4 themes
│   ├── types/               # Type definitions
│   ├── services/            # Model runtime, skills router, ponytail, rea, art
│   ├── components/
│   │   ├── ui/              # Design system primitive components
│   │   ├── layout/          # Activity bar, panels, status bar, palettes
│   │   └── views/           # Explorer, search, git, REA, art studio
│   ├── App.tsx              # Main IDE container
│   └── main.tsx             # React entrypoint
└── tests/                   # Vitest unit & integration test suites
```
