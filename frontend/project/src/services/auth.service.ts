import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { User } from '../models/models';
import { of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Optional() @Inject('KEYCLOAK') private kc: any) {
    this.initializeUser();
  }

  /**
   * Initialize current user from Keycloak JWT or localStorage
   */
  private initializeUser(): void {
    // Try to load from localStorage first
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }

    // If Keycloak is authenticated, fetch fresh user from backend
    if (this.kc && this.kc.authenticated) {
      this.fetchCurrentUser().subscribe(
        user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        },
        error => console.error('Failed to fetch current user:', error)
      );
    }
  }

  /**
   * Fetch current user from backend (/api/auth/me)
   */
  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  /**
   * Redirect to Keycloak login page
   */
  login(): void {
    if (this.kc && this.kc.authenticated === false) {
      console.log('Redirecting to Keycloak login...');
      this.kc.login({ redirectUri: window.location.origin });
    } else {
      console.warn('Keycloak not initialized or already authenticated');
    }
  }

  /**
   * Redirect to Keycloak registration page
   */
  register(): void {
    if (this.kc && this.kc.authenticated === false) {
      console.log('Redirecting to Keycloak registration...');
      this.kc.register({ redirectUri: window.location.origin });
    } else {
      console.warn('Keycloak not initialized or already authenticated');
    }
  }

  /**
   * Logout from Keycloak and clear local state
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    if (this.kc) {
      this.kc.logout({ redirectUri: window.location.origin });
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.kc?.authenticated === true;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    if (!this.kc || !this.kc.tokenParsed) return false;
    const realmAccess = this.kc.tokenParsed.realm_access || {};
    return (realmAccess.roles || []).includes(role);
  }

  /**
   * Update user's avatar color
   */
  updateAvatarColor(avatarColor: string): Observable<User> {
    const body = { avatarColor };
    return this.http.patch<User>(`${this.apiUrl}/me/avatar`, body).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Delete user account (triggers backend deletion via webhook)
   */
  deleteAccount(): Observable<void> {
    // Note: Actual deletion happens via Keycloak webhook
    // Frontend just needs to log out
    this.logout();
    return of(void 0);
  }

  /**
   * Get all users (ADMIN only)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /**
   * Get user by ID (ADMIN only)
   */
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }
}
