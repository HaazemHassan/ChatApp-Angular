import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginRequest } from '../../models/auth/requests/login-request';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  login(): void {
    if (this.loginForm.valid) {
      const credentials: LoginRequest = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          if (response.succeeded) {
            console.log('Login successful');
          } else {
            console.error('Login failed:', response.message);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
        },
      });
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  // Helper method to mark all form fields as touched to show validation errors
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for easy access to form controls in template
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
