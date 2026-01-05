import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Session, NPCSummary, Conversation, NPCSessionSummary } from '../types';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private sessionsSubject = new BehaviorSubject<Session[]>([]);
  private selectedSessionIdSubject = new BehaviorSubject<string | null>(null);
  private npcSummariesSubject = new BehaviorSubject<NPCSummary[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  sessions$ = this.sessionsSubject.asObservable();
  selectedSessionId$ = this.selectedSessionIdSubject.asObservable();
  npcSummaries$ = this.npcSummariesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadSessions();
  }

  get sessions(): Session[] {
    return this.sessionsSubject.value;
  }

  get selectedSessionId(): string | null {
    return this.selectedSessionIdSubject.value;
  }

  get npcSummaries(): NPCSummary[] {
    return this.npcSummariesSubject.value;
  }

  get loading(): boolean {
    return this.loadingSubject.value;
  }

  get error(): string | null {
    return this.errorSubject.value;
  }

  get selectedSession(): Session | undefined {
    const sessionId = this.selectedSessionId;
    return sessionId ? this.sessions.find(s => s.id === sessionId) : undefined;
  }

  private loadSessions(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.apiService.fetchSessions().pipe(
      catchError(err => {
        this.errorSubject.next(err instanceof Error ? err.message : 'Failed to load sessions');
        return of([]);
      }),
      tap(() => this.loadingSubject.next(false))
    ).subscribe(sessions => {
      this.sessionsSubject.next(sessions);
      if (sessions.length > 0) {
        this.selectSession(sessions[0].id);
      }
    });
  }

  selectSession(sessionId: string): void {
    this.selectedSessionIdSubject.next(sessionId);
    this.loadNPCSummaries(sessionId);
  }

  private loadNPCSummaries(sessionId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.apiService.fetchNPCSessionSummaries(sessionId).pipe(
      catchError(err => {
        this.errorSubject.next(err instanceof Error ? err.message : 'Failed to load NPC summaries');
        return of([] as Array<Record<string, any>>);
      }),
      tap(() => this.loadingSubject.next(false))
    ).subscribe((list) => {
      // map into existing NPCSummary shape for UI components
      const mapped: NPCSummary[] = (list || []).map((d: any, idx: number) => {
        const npcId = String(d['npcId'] ?? d['NpcId'] ?? `npc-${idx}`);
        const overallTone = String(d['overallTone'] ?? d['OverallTone'] ?? 'neutral');
        return {
          id: `${sessionId}-${npcId}`,
          npcId,
          npcName: npcId,
          tone: (overallTone === 'friendly' || overallTone === 'neutral' || overallTone === 'hostile') ? overallTone as 'friendly' | 'neutral' | 'hostile' : 'neutral',
          overallTone: overallTone,
          fairnessScore: Number(d['fairnessScore'] ?? d['FairnessScore'] ?? 0),
          inCharacter: Boolean(d['inCharacter'] ?? d['InCharacter']),
          escalationTooFast: Boolean(d['escalationTooFast'] ?? d['EscalationTooFast']),
          summary: String(d['summary'] ?? d['Summary'] ?? '')
        };
      });

      this.npcSummariesSubject.next(mapped);
    });
  }

  loadConversation(npcId: string): Observable<Conversation | null> {
    const sessionId = this.selectedSessionId;
    if (!sessionId) {
      return of(null);
    }

    return this.apiService.fetchConversation(sessionId, npcId).pipe(
      catchError(err => {
        this.errorSubject.next(err instanceof Error ? err.message : 'Failed to load conversation');
        return of(null);
      })
    );
  }
}
