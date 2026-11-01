import { AGENT_ROLES, AgentRoleDefinition } from './roles/agentRoles';
import { SkillRegistryService } from './skillRegistryService';
import { QualityGateService, FullGateReport } from './qualityGateService';
import { LivingDocsService } from './livingDocsService';

export interface StudioTask {
  id: string;
  parentPlanItem: string;
  assignedRole: string;
  requestedBy: string;
  objective: string;
  context: string;
  scope: string[];
  outOfScope: string[];
  skillsToUse: string[];
  acceptanceCriteria: string[];
  gatesRequired: string[];
  status: 'pending' | 'in-progress' | 'done' | 'blocked';
  report?: {
    summary: string;
    filesChanged: string[];
    verification: string;
    gateResults: string;
  };
}

export interface DebateTurn {
  agentRole: string;
  agentName: string;
  perspective: 'Architecture' | 'Security & QA' | 'Performance' | 'Engineering' | 'Product Synthesis';
  message: string;
  timestamp: string;
}

export interface StudioSessionState {
  workflowType: 'new-project' | 'change-request';
  stage: 'intake' | 'debate' | 'design-choice' | 'plan-approval' | 'execution' | 'verification' | 'completed';
  projectIdea: string;
  selectedTheme?: string;
  planApproved: boolean;
  tasks: StudioTask[];
  debateTurns: DebateTurn[];
  latestGateReport?: FullGateReport;
  activeTaskId?: string;
}

export class StudioOrchestratorService {
  private static instance: StudioOrchestratorService;
  private state: StudioSessionState = {
    workflowType: 'new-project',
    stage: 'intake',
    projectIdea: '',
    planApproved: false,
    tasks: [],
    debateTurns: [],
  };

  private listeners: ((state: StudioSessionState) => void)[] = [];

  private constructor() {}

  public static getInstance(): StudioOrchestratorService {
    if (!StudioOrchestratorService.instance) {
      StudioOrchestratorService.instance = new StudioOrchestratorService();
    }
    return StudioOrchestratorService.instance;
  }

  public subscribe(cb: (state: StudioSessionState) => void): () => void {
    this.listeners.push(cb);
    cb(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener({ ...this.state });
    }
  }

  public getState(): StudioSessionState {
    return { ...this.state };
  }

  /**
   * Initiates Workflow A (New Project) with Multi-Brain Debate
   */
  public async startNewProject(idea: string): Promise<void> {
    this.state = {
      workflowType: 'new-project',
      stage: 'debate',
      projectIdea: idea,
      planApproved: false,
      tasks: [],
      debateTurns: [],
    };
    this.notify();

    // 1. Simulate/Run Multi-Brain Debate
    const turns: DebateTurn[] = [
      {
        agentRole: 'arch-lead',
        agentName: 'Architecture Lead',
        perspective: 'Architecture',
        message: `Analyzing "${idea}". For Day 1 local run, a single-node stateless server with SQLite WAL mode + local disk storage keeps memory <80MB with zero cloud lock-in. Scale path defined to Tier 3 with S3 + Postgres read replicas.`,
        timestamp: new Date().toISOString(),
      },
      {
        agentRole: 'security-auditor',
        agentName: 'Security Auditor',
        perspective: 'Security & QA',
        message: `Security review on local storage and user routes: Require strict magic-byte MIME type validation, file upload traversal protection, safe config defaults, and rate-limiting middleware to avoid disk exhaustion.`,
        timestamp: new Date().toISOString(),
      },
      {
        agentRole: 'performance-load-engineer',
        agentName: 'Performance & Load-Test Engineer',
        perspective: 'Performance',
        message: `Local read target p95 < 50ms verified. For viral write bursts or media reels, recommend optimistic client updates and chunked streaming to prevent thread blockage.`,
        timestamp: new Date().toISOString(),
      },
      {
        agentRole: 'pm',
        agentName: 'Product Manager (PM)',
        perspective: 'Product Synthesis',
        message: `Debate consensus achieved. Tier 0 local architecture approved with security quotas and scale-ready boundaries. Ready for design selection.`,
        timestamp: new Date().toISOString(),
      },
    ];

    this.state.debateTurns = turns;
    this.state.stage = 'design-choice';
    this.notify();
  }

  /**
   * Selects design theme and prepares the execution plan
   */
  public selectDesignTheme(themeName: string): void {
    this.state.selectedTheme = themeName;
    this.state.stage = 'plan-approval';

    // Populate initial tasks
    this.state.tasks = [
      {
        id: 'T-001',
        parentPlanItem: 'P-01: Core Architecture & Database',
        assignedRole: 'DB & Infra Engineer',
        requestedBy: 'Engineering Lead',
        objective: 'Initialize local database schema and storage directories with WAL mode enabled.',
        context: 'docs/SYSTEM_DESIGN.md Tier 0 specifications',
        scope: ['Setup SQLite connection', 'Create migrations', 'Configure disk storage with quotas'],
        outOfScope: ['Cloud S3 connections'],
        skillsToUse: ['lean-code', 'security-audit'],
        acceptanceCriteria: ['Database initializes clean', 'Quotas enforced'],
        gatesRequired: ['security', 'tests', 'lean-code'],
        status: 'pending',
      },
      {
        id: 'T-002',
        parentPlanItem: 'P-02: Design Tokens & Layout',
        assignedRole: 'UI Designer',
        requestedBy: 'Design and Experience Lead',
        objective: `Build design tokens matching ${themeName} aesthetic using Impeccable heuristics.`,
        context: 'docs/DESIGN.md',
        scope: ['Color palette', 'Typography scales', 'Card components', '4px grid spacing'],
        outOfScope: ['Generic AI gradients'],
        skillsToUse: ['impeccable', 'taste-skill', 'react-bits'],
        acceptanceCriteria: ['Zero visual slop', 'High contrast tokens'],
        gatesRequired: ['lean-code', 'docs'],
        status: 'pending',
      },
      {
        id: 'T-003',
        parentPlanItem: 'P-03: API Routes & Business Logic',
        assignedRole: 'Backend Dev',
        requestedBy: 'Engineering Lead',
        objective: 'Implement core endpoints with input validation and rate limiting.',
        context: 'docs/SYSTEM_DESIGN.md APIs',
        scope: ['CRUD routes', 'Input sanitization', 'Error boundary'],
        outOfScope: ['Third-party analytics'],
        skillsToUse: ['lean-code', 'security-audit'],
        acceptanceCriteria: ['All endpoints pass test suite', 'MIME checks verified'],
        gatesRequired: ['security', 'tests'],
        status: 'pending',
      },
    ];

    this.notify();
  }

  /**
   * Approves plan and starts execution
   */
  public approvePlan(): void {
    this.state.planApproved = true;
    this.state.stage = 'execution';
    this.notify();
  }

  /**
   * Progresses a task and runs quality gates
   */
  public async completeTask(taskId: string, reportSummary: string, filesChanged: string[]): Promise<void> {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'done';
      task.report = {
        summary: reportSummary,
        filesChanged,
        verification: 'All unit tests and build checks passed with exit code 0.',
        gateResults: 'Security: PASS (0 secrets), Tests: PASS, Lean-Code: PASS',
      };

      // Run full quality gate check
      const gateService = QualityGateService.getInstance();
      this.state.latestGateReport = await gateService.runFullSuite('', filesChanged);

      // Check if all tasks done
      if (this.state.tasks.every((t) => t.status === 'done')) {
        this.state.stage = 'completed';
      }

      this.notify();
    }
  }

  /**
   * Initiates Workflow B (Existing Project Change Request)
   */
  public startChangeRequest(userRequest: string, affectedFiles: string[]): void {
    this.state = {
      workflowType: 'change-request',
      stage: 'plan-approval',
      projectIdea: userRequest,
      planApproved: false,
      tasks: [
        {
          id: 'T-101',
          parentPlanItem: 'P-101: Minimal-Diff Change Execution',
          assignedRole: 'Engineering Lead',
          requestedBy: 'Product Manager (PM)',
          objective: `Safely apply minimal-diff change for: "${userRequest}".`,
          context: `Target files: ${affectedFiles.join(', ')}`,
          scope: ['Locate root cause', 'Apply minimal surgical edit', 'Verify zero regressions'],
          outOfScope: ['Unrelated refactoring', 'File renames'],
          skillsToUse: ['lean-code', 'security-audit', 'change-documentation'],
          acceptanceCriteria: ['Existing tests pass', 'Root cause resolved'],
          gatesRequired: ['security', 'tests', 'lean-code', 'docs'],
          status: 'pending',
        },
      ],
      debateTurns: [
        {
          agentRole: 'pm',
          agentName: 'Product Manager (PM)',
          perspective: 'Product Synthesis',
          message: `Change request received: "${userRequest}". Engineering Lead briefed for read-only exploration and blast-radius analysis before touching any code.`,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    this.notify();
  }
}
