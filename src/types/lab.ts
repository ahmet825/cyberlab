export type DifficultyLevel = 'Apprentice' | 'Practitioner' | 'Expert';

export type VulnerabilityCategory = 'Recon' | 'XSS' | 'SQLi' | 'Auth' | 'AI-Workflow';

export type HubView = 'landing' | 'arena' | 'tracks' | 'profile' | 'arsenal' | 'disclaimer' | 'kvkk' | 'hotel-breach';

export interface LabHint {
  level: number;
  title: string;
  content: string;
}

export interface PuzzleStage {
  id: number;
  title: string;
  objective: string;
  guidance: string;
  isCompleted: boolean;
}

export interface LabItem {
  id: string;
  title: string;
  trackId: string;
  category: VulnerabilityCategory;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  description: string;
  objective: string;
  startingUrl: string;
  tags: string[];
  hints: LabHint[];
  stages: PuzzleStage[];
  solutionExplanation: string;
  defenseMechanisms: string[];
  flagHash: string;
  initialState?: Record<string, any>;
}

export interface LabTrack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  level: string;
  labs: LabItem[];
}

export interface HttpRequestLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  durationMs: number;
}

export interface TerminalHistoryItem {
  command: string;
  output: string;
  type?: 'standard' | 'error' | 'success' | 'system' | 'table';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'copy-command' | 'open-devtools' | 'view-hint';
    payload: string;
  };
}

export interface UserProgressData {
  solvedLabIds: string[];
  stageProgress: Record<string, number[]>; // labId -> array of completed stage numbers [1, 2]
  capturedFlags: Record<string, { flag: string; solvedAt: string }>;
  lastActiveLabId?: string;
}

