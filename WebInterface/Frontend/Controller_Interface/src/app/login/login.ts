import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  errorMessage: string = '';

  constructor(private router: Router) {}

  onLogin(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
  const username = (form["username"] as HTMLInputElement).value;
  const password = (form["password"] as HTMLInputElement).value;

    
    if (username === 'admin' && password === 'admin') {
      this.errorMessage = '';
      this.router.navigate(['/dashboard']);

    } else {
      this.errorMessage = 'Usuario o contraseña incorrectos';
    }
  }
}
