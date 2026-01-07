import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AI Game Judge';
  isLoggedIn$!: any;

  constructor(private auth: AuthService, private router: Router) {
    this.isLoggedIn$ = this.auth.isLoggedIn$;
  }

  logout() {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
