import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NPCOverview } from '../../types';
import { ApiService } from '../../services/api.service';


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

    constructor(private api: ApiService) { }

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

    // removed viewDetails — not needed
}
