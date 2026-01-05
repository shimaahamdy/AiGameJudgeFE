import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Session, NPCSummary, Conversation } from '../types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * Fetch all available sessions
   */
  fetchSessions(): Observable<Session[]> {
    // Mock data - replace with real API call
    return of([
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
  }

  /**
   * Fetch NPC summaries for a specific session
   */
  fetchNPCSummaries(sessionId: string): Observable<NPCSummary[]> {
    return this.http.get<Array<Record<string, any>>>(`/api/sessions/summary/${encodeURIComponent(sessionId)}`)
      .pipe(
        map((dtoList) => {
          return dtoList.map((d) => {
            const npcId = d['NpcId'] as string;
            const overallTone = d['OverallTone'] as string;
            return {
              id: `${sessionId}-${npcId}`,
              npcId: npcId,
              npcName: npcId,
              tone:
                overallTone === "friendly" || overallTone === "neutral" ||
                overallTone === "hostile"
                  ? (overallTone as "friendly" | "neutral" | "hostile")
                  : "neutral",
              fairnessScore: Number(d['FairnessScore']) || 0,
              inCharacter: Boolean(d['InCharacter']),
              escalationTooFast: Boolean(d['EscalationTooFast']),
              messageCount: 0,
            };
          });
        }),
        catchError((err) => {
          return throwError(() => new Error(`Failed to fetch NPC summaries: ${err.status || 'Unknown error'}`));
        })
      );
  }

  /**
   * Fetch full conversation between player and NPC
   */
  fetchConversation(sessionId: string, npcId: string): Observable<Conversation> {
    return this.http.get<Array<Record<string, any>>>(
      `/api/sessions/${encodeURIComponent(sessionId)}/conversation/${encodeURIComponent(npcId)}`
    )
      .pipe(
        map((turns) => {
          const messages = turns.map((t, idx) => {
            const timestamp = typeof t['Timestamp'] === "string"
              ? t['Timestamp'] as string
              : (t['Timestamp']?.toString?.() ?? new Date().toISOString());
            const speaker = t['Speaker'] as string;
            const sender: "player" | "npc" = speaker === "npc" ? "npc" : "player";
            
            return {
              id: `msg-${idx + 1}`,
              timestamp: timestamp,
              sender: sender,
              content: String(t['Message'] ?? ""),
            };
          });

          return {
            sessionId,
            npcId,
            npcName: npcId,
            playerName: "",
            messages,
          };
        }),
        catchError((err) => {
          return throwError(() => new Error(`Failed to fetch conversation: ${err.status || 'Unknown error'}`));
        })
      );
  }
}
