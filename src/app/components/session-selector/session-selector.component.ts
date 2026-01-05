import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../types';

@Component({
  selector: 'app-session-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-selector.component.html',
  styleUrls: ['./session-selector.component.css']
})
export class SessionSelectorComponent {
  @Input() sessions: Session[] = [];
  @Input() selectedSessionId: string | null = null;
  @Output() selectSession = new EventEmitter<string>();

  get selectedSession(): Session | undefined {
    return this.sessions.find(s => s.id === this.selectedSessionId);
  }

  onSessionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectSession.emit(target.value);
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString();
  }

  formatFullDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
