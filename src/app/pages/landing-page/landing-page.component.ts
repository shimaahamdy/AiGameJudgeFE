import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
    isLoggedIn$!: any;
    constructor(private auth: AuthService) {
        this.isLoggedIn$ = this.auth.isLoggedIn$;
    }
    features = [
        {
            icon: '🎮',
            title: 'Game Session Analysis',
            description: 'Deep dive into player-NPC interactions with comprehensive behavioral metrics.'
        },
        {
            icon: '⚖️',
            title: 'Fairness Detection',
            description: 'Identify unfair gameplay patterns and detect AI bias in real-time.'
        },
        {
            icon: '📊',
            title: 'Advanced Reports',
            description: 'Generate detailed PDF reports with charts, trends, and actionable insights.'
        },
        {
            icon: '🤖',
            title: 'AI Reporting Agent',
            description: 'Chat-based AI that answers questions about your game sessions intelligently.'
        },
        {
            icon: '📈',
            title: 'Performance Metrics',
            description: 'Track NPC performance, tone, escalation rates, and character consistency.'
        },
        {
            icon: '🔐',
            title: 'Secure & Private',
            description: 'Enterprise-grade security with token-based authentication and data encryption.'
        }
    ];

    benefits = [
        'Real-time performance monitoring',
        'Multi-session analytics',
        'Automated fairness scoring',
        'PDF export capabilities',
        'Interactive dashboards',
        'Expert AI insights'
    ];
}
