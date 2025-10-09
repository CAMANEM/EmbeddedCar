import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, LoginCredentials } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  onLogin() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const credentials: LoginCredentials = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authSubscription = this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response && response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response?.message || 'Login failed. Please check your credentials.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Connection error. Please try again later.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Fallback method for demo purposes (remove in production)
  onDemoLogin() {
    if (this.loginForm.get('username')?.value === 'admin' && 
        this.loginForm.get('password')?.value === 'admin') {
      // Simulate successful login for demo
      const demoUser = {
        id: 'demo-user',
        username: 'admin',
        email: 'admin@carcontroller.com',
        role: 'admin',
        permissions: ['car:control', 'car:monitor', 'system:admin']
      };
      
      // Create a demo token (in real implementation, this comes from server)
      const demoToken = 'demo-jwt-token-' + Date.now();
      
      // Manually set session for demo
      localStorage.setItem('car_controller_token', demoToken);
      localStorage.setItem('car_controller_user', JSON.stringify(demoUser));
      
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Demo credentials: admin / admin';
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  get usernameError(): string {
    const control = this.loginForm.get('username');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Username is required';
      if (control.errors['minlength']) return 'Username must be at least 3 characters';
    }
    return '';
  }

  get passwordError(): string {
    const control = this.loginForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Password is required';
      if (control.errors['minlength']) return 'Password must be at least 6 characters';
    }
    return '';
  }
}
