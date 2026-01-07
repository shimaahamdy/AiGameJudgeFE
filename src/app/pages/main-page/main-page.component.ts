import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-main-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
    userName = '';
    password = '';
    message: string | null = null;

    constructor(private api: ApiService, private router: Router, private auth: AuthService) { }

    register() {
        if (!this.userName || !this.password) {
            this.message = 'Username and password required';
            return;
        }
        this.api.registerUser(this.userName, this.password).subscribe({
            next: () => { this.message = 'Registration successful'; },
            error: (err) => { this.message = String(err?.message ?? err); }
        });
    }

    login() {
        if (!this.userName || !this.password) {
            this.message = 'Username and password required';
            return;
        }
        this.api.loginUser(this.userName, this.password).subscribe({
            next: (res) => {
                const txt = String(res ?? '');
                const m = txt.match(/token:\s*(.+)/i);
                const token = m ? m[1].trim() : txt.trim();
                if (token) {
                    this.auth.setToken(token as string);
                    // navigate to landing page after login
                    this.router.navigateByUrl('/');
                } else {
                    this.message = 'Login did not return a token';
                }
            },
            error: (err) => { this.message = String(err?.message ?? err); }
        });
    }
}
