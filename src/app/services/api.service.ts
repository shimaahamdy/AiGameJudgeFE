import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Session, NPCSummary, Conversation } from '../types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  /**
   * Fetch all available sessions
   */
  fetchSessions(): Observable<Session[]> {
    return this.http.get<Array<Record<string, any>>>('http://localhost:5034/api/Session')
      .pipe(
        map((dtoList) => {
          return dtoList.map((d) => {
            return {
              id: d['sessionId'] as string,
              name: d['sessionId'] as string,
              timestamp: d['createdAt'] as string,
              playerName: "Player",
            };
          });
        }),
        catchError((err) => {
          return throwError(() => new Error(`Failed to fetch sessions: ${err.status || 'Unknown error'}`));
        })
      );
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
    // NEW endpoint format: http://localhost:5034/api/Session/session-conversation/{session_id}/{npc_id}
    return this.http.get<Array<Record<string, any>>>(
      `http://localhost:5034/api/Session/session-conversation/${encodeURIComponent(sessionId)}/${encodeURIComponent(npcId)}`
    )
      .pipe(
        map((turns) => {
          const messages = (turns || []).map((t, idx) => {
            const timestamp = typeof t['timestamp'] === 'string'
              ? (t['timestamp'] as string)
              : (t['Timestamp'] as string) || new Date().toISOString();
            const speaker = String(t['speaker'] ?? t['Speaker'] ?? '').toLowerCase();
            const sender: 'player' | 'npc' = speaker === 'npc' ? 'npc' : 'player';

            return {
              id: `msg-${idx + 1}`,
              timestamp,
              sender,
              content: String(t['message'] ?? t['Message'] ?? ''),
            };
          });

          return {
            sessionId,
            npcId,
            npcName: npcId,
            playerName: '',
            messages,
          } as Conversation;
        }),
        catchError((err) => {
          return throwError(() => new Error(`Failed to fetch conversation: ${err.status || 'Unknown error'}`));
        })
      );
  }

  /**
   * Fetch NPC overview for all NPCs
   */
  fetchNPCOverviewAll(): Observable<any[]> {
    return this.http.get<Array<Record<string, any>>>('http://localhost:5034/api/npcs/overview/all')
      .pipe(
        map((list) => {
          return list.map((d) => ({
            npcId: String(d['npcId'] ?? d['NpcId'] ?? d['npcID'] ?? ''),
            totalSessions: Number(d['totalSessions'] ?? 0),
            averageFairness: Number(d['averageFairness'] ?? d['averageFairness'] ?? 0),
            toneDistribution: d['toneDistribution'] ?? d['toneDistribution'] ?? { friendly: 0, neutral: 0, hostile: 0 },
            inCharacterRate: Number(d['inCharacterRate'] ?? 0),
            escalationRate: Number(d['escalationRate'] ?? 0),
          }));
        }),
        catchError((err) => {
          return throwError(() => new Error(`Failed to fetch NPC overview: ${err.status || 'Unknown error'}`));
        })
      );
  }

  /**
   * Send a message to the reporting AI agent and receive structured response
   */
  postReportingAgentChat(message: string): Observable<any> {
    const payload = { message };
    return this.http.post<Record<string, any>>('http://localhost:5034/api/reporting-agent/chat', payload)
      .pipe(
        catchError((err) => {
          return throwError(() => new Error(`Failed to call reporting agent: ${err.status || 'Unknown error'}`));
        })
      );
  }

  /**
   * Fetch NPC summaries for a specific session (session-level NPC output)
   */
  fetchNPCSessionSummaries(sessionId: string): Observable<Array<Record<string, any>>> {
    return this.http.get<Array<Record<string, any>>>(`http://localhost:5034/api/npcs/sessions/summary/${encodeURIComponent(sessionId)}`)
      .pipe(
        catchError((err) => {
          return throwError(() => new Error(`Failed to fetch NPC session summaries: ${err.status || 'Unknown error'}`));
        })
      );
  }

  /**
   * Register a new user
   * POST http://localhost:5034/api/User
   * body: { userName: string, password: string }
   */
  registerUser(userName: string, password: string): Observable<string> {
    const url = 'http://localhost:5034/api/User';
    // Server returns plain text (e.g. Ok("created")), request as text to avoid JSON parse error
    return this.http.post<string>(url, { userName, password }, { responseType: 'text' as 'json' }).pipe(
      catchError((err) => {
        const msg = err?.error ?? err?.message ?? `Failed to register: ${err.status || 'Unknown error'}`;
        return throwError(() => new Error(String(msg)));
      })
    );
  }

  /**
   * Login user
   * POST http://localhost:5034/api/User/Login
   * returns { token: string }
   */
  loginUser(userName: string, password: string): Observable<string> {
    const url = 'http://localhost:5034/api/User/Login';
    // Server returns plain text like: token: <jwt>
    return this.http.post<string>(url, { userName, password }, { responseType: 'text' as 'json' }).pipe(
      catchError((err) => {
        const msg = err?.error ?? err?.message ?? `Failed to login: ${err.status || 'Unknown error'}`;
        return throwError(() => new Error(String(msg)));
      })
    );
  }

  /**
   * Fetch previous messages from DeveloperAi with pagination
   * GET http://localhost:5034/api/DeveloperAi?page=1&pageSize=20
   */
  fetchPreviousMessages(page: number, pageSize: number = 20): Observable<Array<Record<string, any>>> {
    const url = `http://localhost:5034/api/DeveloperAi?page=${page}&pageSize=${pageSize}`;
    return this.http.get<Array<Record<string, any>>>(url).pipe(
      catchError((err) => {
        return throwError(() => new Error(`Failed to fetch previous messages: ${err.status || 'Unknown error'}`));
      })
    );
  }
}
