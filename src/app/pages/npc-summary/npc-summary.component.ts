import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NPCOverview } from '../../types';
import { ApiService } from '../../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-npc-summary',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './npc-summary.component.html',
    styleUrls: ['./npc-summary.component.css']
})
export class NPCSummaryComponent implements OnInit {
    overviews: NPCOverview[] = [];
    loading = false;
    error: string | null = null;

    constructor(private api: ApiService, private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.loadOverview();
    }

    loadOverview() {
        this.loading = true;
        this.error = null;
        this.api.fetchNPCOverviewAll().subscribe({
            next: (list) => {
                this.overviews = list as NPCOverview[];
                this.loading = false;
            },
            error: (err) => {
                this.error = String(err?.message ?? err);
                this.loading = false;
            }
        });
    }

    displayName(id: string) {
        if (!id) return '';
        // remove "npc_" prefix and capitalize words
        const parts = id.replace(/^npc[_-]/i, '').split(/[_-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1));
        return parts.join(' ');
    }

    iconForNPC(id: string) {
        // simple inline SVG icons per type; keep lightweight and framework-agnostic
        const key = (id || '').toLowerCase();
        if (key.includes('blacksmith') || key.includes('smith')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18" stroke="#fff" stroke-opacity="0"/></svg><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12l6 6 6-6" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }
        if (key.includes('villager') || key.includes('vill')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" stroke="#60a5fa" stroke-width="1.2"></circle><path d="M6 20c1.333-3 4.667-4 6-4s4.667 1 6 4" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/></svg>`;
        }
        // fallback avatar
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" stroke="#94a3b8" stroke-width="1.2"></circle><path d="M4 20c2-4 6-6 8-6s6 2 8 6" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/></svg>`;
    }

    getCharacterImage(npcId: string): string {
        // Return a cool game character image based on NPC type
        const key = (npcId || '').toLowerCase();

        // Using placeholder service with game character theme
        if (key.includes('blacksmith') || key.includes('smith')) {
            return 'https://api.placeholder.com/400x300?text=Blacksmith&bg=8B4513&fg=FFD700';
        }
        if (key.includes('villager') || key.includes('vill')) {
            return 'https://api.placeholder.com/400x300?text=Villager&bg=4CAF50&fg=FFFFFF';
        }
        if (key.includes('merchant') || key.includes('trader')) {
            return 'https://api.placeholder.com/400x300?text=Merchant&bg=9C27B0&fg=FFFFFF';
        }
        if (key.includes('guard') || key.includes('soldier')) {
            return 'https://api.placeholder.com/400x300?text=Guard&bg=FF6F00&fg=FFFFFF';
        }
        if (key.includes('mage') || key.includes('wizard')) {
            return 'https://api.placeholder.com/400x300?text=Mage&bg=2196F3&fg=FFFFFF';
        }
        // Default fantasy character
        return 'https://api.placeholder.com/400x300?text=Character&bg=1a1a2e&fg=FFFFFF';
    }

    dominantToneLabel(o: NPCOverview) {
        const t = o.toneDistribution ?? { friendly: 0, neutral: 0, hostile: 0 };
        const max = Math.max(t.friendly ?? 0, t.neutral ?? 0, t.hostile ?? 0);
        if (max === t.friendly) return 'Friendly';
        if (max === t.hostile) return 'Hostile';
        return 'Neutral';
    }

    viewConversation(npcId: string) {
        // Navigate to sessions page and pass npcId as a query param; SessionReviewDashboard will open the conversation if provided
        this.router.navigate(['/sessions'], { queryParams: { npcId } });
    }

    // removed viewDetails — not needed
}
