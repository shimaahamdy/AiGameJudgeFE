import { Session, NPCSummary, Conversation } from "@/types";

/**
 * Fetch all available sessions
 */
export async function fetchSessions(): Promise<Session[]> {
  // Fetch recent conversation entries and derive unique sessions
  const resp = await fetch(`http://localhost:5034/api/Session`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch sessions: ${resp.status}`);
  }

  const items: Array<Record<string, any>> = await resp.json();

  // Deduplicate by SessionId and pick the latest timestamp
  const map = new Map<string, Record<string, any>>();
  for (const it of items) {
    const sid = String(it.SessionId ?? it.sessionId ?? "");
    if (!sid) continue;
    const tsRaw = it.Timestamp ?? it.timestamp ?? it.CreatedAt ?? it.createdAt ?? null;
    const ts = tsRaw ? new Date(tsRaw).toISOString() : new Date().toISOString();
    const existing = map.get(sid);
    if (!existing || (existing.timestamp && ts > existing.timestamp)) {
      map.set(sid, { id: sid, name: sid, timestamp: ts, playerName: String(it.PlayerId ?? it.playerId ?? "") });
    }
  }

  return Array.from(map.values()) as Session[];
}

/**
 * Fetch NPC summaries for a specific session
 */
export async function fetchNPCSummaries(
  sessionId: string
): Promise<NPCSummary[]> {
  // Call the server API which exposes SessionNpcSummaryDto items
  // Backend endpoint: GET /api/npcs/sessions/summary/{sessionId}
  const resp = await fetch(`/api/npcs/sessions/summary/${encodeURIComponent(
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
  // Backend endpoint: GET /api/npcs/sessions/{sessionId}/{npcId}
  const resp = await fetch(
    `/api/npcs/sessions/${encodeURIComponent(sessionId)}/${encodeURIComponent(
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
    timestamp: typeof t.Timestamp === "string" ? t.Timestamp : (t.Timestamp ? new Date(t.Timestamp).toISOString() : new Date().toISOString()),
    sender: (t.Speaker || t.speaker) === "npc" ? "npc" : "player",
    content: String(t.Message ?? t.message ?? ""),
  }));

  return {
    sessionId,
    npcId,
    npcName: npcId,
    playerName: "",
    messages,
  } as Conversation;
}
