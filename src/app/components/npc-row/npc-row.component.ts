import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NPCSummary } from '../../types';
import { NPCBadgeComponent } from '../npc-badge/npc-badge.component';

@Component({
  selector: 'app-npc-row',
  standalone: true,
  imports: [CommonModule, NPCBadgeComponent],
  templateUrl: './npc-row.component.html',
  styleUrls: ['./npc-row.component.css']
})
export class NPCRowComponent {
  @Input() npc!: NPCSummary;
  @Output() viewConversation = new EventEmitter<string>();

  get fairnessColor(): string {
    if (this.npc.fairnessScore >= 7) {
      return "from-green-500 to-cyan-500";
    } else if (this.npc.fairnessScore >= 5) {
      return "from-yellow-500 to-orange-500";
    } else {
      return "from-red-500 to-pink-500";
    }
  }

  get fairnessPercentage(): number {
    return (this.npc.fairnessScore / 10) * 100;
  }

  onViewConversation(): void {
    this.viewConversation.emit(this.npc.npcId);
  }
}
