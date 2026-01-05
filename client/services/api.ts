import { Session, NPCSummary, Conversation } from "@/types";

/**
 * Fetch all available sessions
 * Replace the mock data with real API calls
 */
export async function fetchSessions(): Promise<Session[]> {
  // Mock data - replace with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "session-001",
          name: "Tavern Encounter",
          timestamp: "2024-01-15T14:30:00Z",
          playerName: "Aelindor",
        },
        {
          id: "session-002",
          name: "Dragon's Lair",
          timestamp: "2024-01-14T10:15:00Z",
          playerName: "Aelindor",
        },
        {
          id: "session-003",
          name: "Market Negotiation",
          timestamp: "2024-01-13T16:45:00Z",
          playerName: "Aelindor",
        },
      ]);
    }, 300);
  });
}

/**
 * Fetch NPC summaries for a specific session
 */
export async function fetchNPCSummaries(
  sessionId: string
): Promise<NPCSummary[]> {
  // Call the server API which exposes SessionNpcSummaryDto items
  // Endpoint expected: GET /api/sessions/summary/{sessionId}
  const resp = await fetch(`/api/sessions/summary/${encodeURIComponent(
    sessionId
  )}`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch NPC summaries: ${resp.status}`);
  }

  // Server DTO shape:
  // { NpcId, OverallTone, InCharacter, FairnessScore, EscalationTooFast, Summary }
  const dtoList: Array<Record<string, any>> = await resp.json();

  // Map server DTO to client `NPCSummary` type. Some server fields (npcName, messageCount)
  // are not provided by the DTO, so we set sensible defaults.
  return dtoList.map((d) => ({
    id: `${sessionId}-${d.NpcId}`,
    npcId: d.NpcId,
    npcName: d.NpcId, // server does not return a display name; use id as fallback
    tone:
      d.OverallTone === "friendly" || d.OverallTone === "neutral" ||
      d.OverallTone === "hostile"
        ? d.OverallTone
        : "neutral",
    fairnessScore: Number(d.FairnessScore) || 0,
    inCharacter: Boolean(d.InCharacter),
    escalationTooFast: Boolean(d.EscalationTooFast),
    messageCount: 0,
  } as NPCSummary));
}

/**
 * Fetch full conversation between player and NPC
 */
export async function fetchConversation(
  sessionId: string,
  npcId: string
): Promise<Conversation> {
  // Call the server endpoint returning ConversationTurnDto[]
  // Endpoint: GET /api/sessions/{sessionId}/conversation/{npcId}
  const resp = await fetch(
    `/api/sessions/${encodeURIComponent(sessionId)}/conversation/${encodeURIComponent(
      npcId
    )}`
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch conversation: ${resp.status}`);
  }

  // ConversationTurnDto: { Speaker, Message, Timestamp }
  const turns: Array<Record<string, any>> = await resp.json();

  // Map to client Conversation shape
  const messages = turns.map((t, idx) => ({
    id: `msg-${idx + 1}`,
    timestamp:
      typeof t.Timestamp === "string"
        ? t.Timestamp
        : t.Timestamp?.toString?.() ?? new         pnpm install        pnpm devDate().toISOString(),
    sender: t.Speaker === "npc" ? "npc" : "player",
    content: String(t.Message ?? ""),
  }));

  return {
    sessionId,
    npcId,
    npcName: npcId,
    playerName: "",
    messages,
  } as Conversation;
}
