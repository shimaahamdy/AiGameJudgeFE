import { Routes } from '@angular/router';
import { SessionReviewDashboardComponent } from './pages/session-review-dashboard/session-review-dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: SessionReviewDashboardComponent },
  { path: '**', component: NotFoundComponent }
];
