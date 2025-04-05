import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  user_id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://seahorse-app-dr62o.ondigitalocean.app/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Load user from localStorage on service initialization (browser only)
    if (this.isBrowser) {
      this.loadStoredUser();
    }
  }

  private loadStoredUser(): void {
    if (!this.isBrowser) return;

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  public get token(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            this.setSession(response.token, response.user);
          }
        })
      );
  }

  signup(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { name, email, password }, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            this.setSession(response.token, response.user);
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setSession(token: string, user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  // Verify if the token is valid by accessing a protected endpoint
  verifyToken(): Observable<boolean> {
    if (!this.token) {
      return of(false);
    }
    
    // Using a different endpoint that's protected by the token_required decorator
    return this.http.get<{ success: boolean, chats: any[] }>(`${this.apiUrl}/user/chats`, {
      withCredentials: true
    }).pipe(
      map(response => true), // If we get here, the token is valid
      catchError(error => {
        console.error('Token verification error:', error);
        if (error.status === 401) {
          // Token is invalid or expired
          this.logout();
        }
        return of(false);
      })
    );
  }
} 