import { Routes } from '@angular/router';
import { SessionReviewDashboardComponent } from './pages/session-review-dashboard/session-review-dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { NPCSummaryComponent } from './pages/npc-summary/npc-summary.component';
import { ReportingAIChatComponent } from './components/reporting-ai-chat/reporting-ai-chat.component';

export const routes: Routes = [
  { path: '', component: SessionReviewDashboardComponent },
  { path: 'npc-summary', component: NPCSummaryComponent },
  { path: 'reporting-ai', component: ReportingAIChatComponent },
  { path: '**', component: NotFoundComponent }
];
