import { Routes } from '@angular/router';
import { SessionReviewDashboardComponent } from './pages/session-review-dashboard/session-review-dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { NPCSummaryComponent } from './pages/npc-summary/npc-summary.component';
import { ReportingAIChatComponent } from './components/reporting-ai-chat/reporting-ai-chat.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'sessions', component: SessionReviewDashboardComponent, canActivate: [AuthGuard] },
  { path: 'npc-summary', component: NPCSummaryComponent, canActivate: [AuthGuard] },
  { path: 'reporting-ai', component: ReportingAIChatComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent }
];
