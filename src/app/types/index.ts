/**
 * Session types
 */
export interface Session {
  id: string;
  name: string;
  timestamp: string;
  playerName: string;
}

/**
 * NPC Summary for a session
 */
export interface NPCSummary {
  id: string;
  npcId: string;
  npcName: string;
  tone: "friendly" | "neutral" | "hostile";
  fairnessScore: number; // 0-10
  inCharacter: boolean;
  escalationTooFast: boolean;
  summary?: string;
  /** original overall tone string returned by session summary API */
  overallTone?: string;
}

/**
 * NPC overview returned by the overview API
 */
export interface NPCOverview {
  npcId: string;
  totalSessions: number;
  averageFairness: number;
  toneDistribution: {
    friendly: number;
    neutral: number;
    hostile: number;
  };
  inCharacterRate: number;
  escalationRate: number;
}

/**
 * NPC summary for a single session
 */
export interface NPCSessionSummary {
  npcId: string;
  overallTone: 'friendly' | 'neutral' | 'hostile' | string;
  inCharacter: boolean;
  fairnessScore: number;
  escalationTooFast: boolean;
  summary: string;
}

/**
 * Individual message in a conversation
 */
export interface Message {
  id: string;
  timestamp: string;
  sender: "player" | "npc";
  content: string;
}

/**
 * Full conversation between player and NPC
 */
export interface Conversation {
  sessionId: string;
  npcId: string;
  npcName: string;
  playerName: string;
  messages: Message[];
}

/**
 * Charts and report DTOs returned by the developer AI endpoint
 */
export interface ChartDto {
  type: 'bar' | 'pie' | 'line' | string;
  title: string;
  labels: string[];
  values: number[];
}

export interface ReportDto {
  fileName: string;
  // backend sends byte[] which is JSON-serialized as base64 string; allow string or number[]
  fileContent: string | number[];
}

export interface ChartsAgentChatResponse {
  text: string;
  charts: ChartDto[];
  report?: ReportDto | null;
  summary?: string;
}

export interface DeveloperMessageWithResponseDto {
  role: string;
  response: ChartsAgentChatResponse | null;
  messageText?: string | null;
  timestamp: string;
}
