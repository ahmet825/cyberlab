export interface Mission {
  id: number;
  section: number;
  sectionTitle: string;
  name: string;
  storySnippet: string;
  objective: string;
  startDir: string;
  relatedFiles: string[];
  hint?: string;
  learnedConcept: string;
  conceptSummary: string;
  checkCondition: (ctx: MissionCheckContext) => boolean;
  nextMissionId: number | null;
}

export interface MissionCheckContext {
  lastCommand: string;
  lastArgs: string[];
  lastOutput: string;
  lastExitCode: number;
  currentDir: string;
  currentUser: string;
  visitedDirs: Set<string>;
  readFiles: Set<string>;
  executedFiles: Set<string>;
  vfs: LinuxVfsState;
}

export interface VfsNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  permissions: number; // e.g. 0o755, 0o644, 0o600
  owner: string;       // e.g. 'x', 'root'
  group: string;       // e.g. 'x', 'root'
  mtime: Date;
  children?: Record<string, VfsNode>;
}

export interface LinuxVfsState {
  root: VfsNode;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  newCwd?: string;
  newUser?: string;
}

export type EngineMode = 'cheerpx' | 'posix-sandbox';
