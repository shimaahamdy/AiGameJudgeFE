import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
    email = '';
    password = '';
    showPassword = signal(false);
    message: string | null = null;
    isLoading = false;

    constructor(private api: ApiService, private router: Router) { }

    togglePasswordVisibility() {
        this.showPassword.set(!this.showPassword());
    }

    login() {
        if (!this.email || !this.password) {
            this.message = 'Email and password required';
            return;
        }

        this.isLoading = true;
        this.api.loginUser(this.email, this.password).subscribe({
            next: (res) => {
                // server returns plain text like: "token: <jwt>"
                const txt = String(res ?? '');
                const m = txt.match(/token:\s*(.+)/i);
                const token = m ? m[1].trim() : txt.trim();
                if (token) {
                    localStorage.setItem('authToken', token);
                    // redirect to landing page
                    this.router.navigateByUrl('/');
                } else {
                    this.message = 'Login failed: no token in response';
                }
                this.isLoading = false;
            },
            error: (err) => {
                this.message = String(err?.message ?? err);
                this.isLoading = false;
            }
        });
    }

    tryDemo() {
        // Pre-fill with demo credentials
        this.email = 'demo@example.com';
        this.password = 'demo123';
        this.message = 'Demo credentials entered. Click Log In to try.';
    }
}
