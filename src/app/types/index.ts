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
  messageCount: number;
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
