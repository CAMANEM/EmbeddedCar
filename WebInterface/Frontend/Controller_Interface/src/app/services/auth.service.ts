import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'http://localhost:3000/api/security';
  private readonly TOKEN_KEY = 'auth_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Login user with credentials
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<any>(`${this.API_BASE_URL}/login`, credentials, this.httpOptions)
      .pipe(
        map(response => {
          // Normalize response to match our interface
          const normalizedResponse: AuthResponse = {
            success: response.success !== false, // Default to true for 200 responses
            token: response.token || response.accessToken || response.access_token,
            message: response.message || 'Login successful'
          };
          
          return normalizedResponse;
        }),
        tap(response => {
          if (response.success && response.token) {
            this.setToken(response.token);
          }
        }),
        catchError(this.handleError<AuthResponse>('login', { success: false, message: 'Login failed' }))
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get HTTP headers with authentication token
   */
  getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
    return { headers };
  }

  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clear authentication token
   */
  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check if token exists
   */
  private hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Error handling
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      if (error.status === 401) {
        this.clearToken();
      }
      
      return of(result as T);
    };
  }
}