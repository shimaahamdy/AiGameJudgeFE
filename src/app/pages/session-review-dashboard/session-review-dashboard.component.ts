import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsService } from '../../services/sessions.service';
import { Conversation } from '../../types';
import { SessionSelectorComponent } from '../../components/session-selector/session-selector.component';
import { NPCRowComponent } from '../../components/npc-row/npc-row.component';
import { ViewConversationModalComponent } from '../../components/view-conversation-modal/view-conversation-modal.component';

@Component({
  selector: 'app-session-review-dashboard',
  standalone: true,
  imports: [CommonModule, SessionSelectorComponent, NPCRowComponent, ViewConversationModalComponent],
  templateUrl: './session-review-dashboard.component.html',
  styleUrls: ['./session-review-dashboard.component.css']
})
export class SessionReviewDashboardComponent implements OnInit {
  isModalOpen = false;
  selectedConversation: Conversation | null = null;
  isLoadingConversation = false;

  constructor(public sessionsService: SessionsService) { }

  get sessions$() {
    return this.sessionsService.sessions$;
  }

  get selectedSessionId$() {
    return this.sessionsService.selectedSessionId$;
  }

  get npcSummaries$() {
    return this.sessionsService.npcSummaries$;
  }

  get loading$() {
    return this.sessionsService.loading$;
  }

  get error$() {
    return this.sessionsService.error$;
  }

  ngOnInit(): void {
    // Service initialization is handled in the service constructor
  }

  onSelectSession(sessionId: string): void {
    this.sessionsService.selectSession(sessionId);
  }

  async onViewConversation(npcId: string): Promise<void> {
    this.isLoadingConversation = true;
    this.sessionsService.loadConversation(npcId).subscribe({
      next: (conversation) => {
        this.selectedConversation = conversation;
        this.isLoadingConversation = false;
        this.isModalOpen = true;
      },
      error: () => {
        this.isLoadingConversation = false;
      }
    });
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    setTimeout(() => {
      this.selectedConversation = null;
    }, 300);
  }
}
