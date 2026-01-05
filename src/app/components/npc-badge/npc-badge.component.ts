import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NPCSummary } from '../../types';

@Component({
  selector: 'app-npc-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './npc-badge.component.html',
  styleUrls: ['./npc-badge.component.css']
})
export class NPCBadgeComponent {
  @Input() tone!: NPCSummary['tone'];

  get toneConfig() {
    const configs = {
      friendly: {
        label: "Friendly",
        className: "tone-friendly",
      },
      neutral: {
        label: "Neutral",
        className: "tone-neutral",
      },
      hostile: {
        label: "Hostile",
        className: "tone-hostile",
      },
    };
    return configs[this.tone];
  }
}
