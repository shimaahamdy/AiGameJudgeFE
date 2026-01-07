import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { ApiService } from "../../services/api.service";

@Component({
    selector: "app-register-page",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: "./register-page.component.html",
    styleUrls: ["./register-page.component.css"]
})
export class RegisterPageComponent {
    name = "";
    password = "";
    confirmPassword = "";
    showPassword = signal(false);
    showConfirmPassword = signal(false);
    message: string | null = null;
    isLoading = false;

    constructor(private api: ApiService, private router: Router) { }

    togglePasswordVisibility() {
        this.showPassword.set(!this.showPassword());
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword.set(!this.showConfirmPassword());
    }

    register() {
        // Validation
        if (!this.name || !this.password || !this.confirmPassword) {
            this.message = "Name and password are required";
            return;
        }

        if (this.password.length < 6) {
            this.message = "Password must be at least 6 characters";
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.message = "Passwords do not match";
            return;
        }

        this.isLoading = true;
        this.message = null;
        
        // Call register API with name and password
        this.api.registerUser(this.name, this.password).subscribe({
            next: (res) => {
                // Success - any successful response means registration worked
                this.message = "Registration successful! Redirecting to login...";
                this.isLoading = false;
                
                // Navigate to login after a short delay to show message
                setTimeout(() => {
                    this.router.navigate(["/login"]);
                }, 1200);
            },
            error: (err) => {
                this.message = String(err?.message ?? err);
                this.isLoading = false;
            }
        });
    }
}

