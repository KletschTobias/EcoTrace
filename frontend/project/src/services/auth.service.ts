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
    this.watchKeycloakAuthChanges();
  }

  /**
   * Extract profile information from Keycloak token
   */
  private getProfileFromToken(): Partial<User> {
    const token = this.kc?.idTokenParsed || this.kc?.tokenParsed;
    if (!token) return {};

    const preferredUsername = token['preferred_username'] || token['name'] || token['given_name'] || token['sub'];
    const fullName = token['name'] || token['given_name'] || token['preferred_username'];
    const email = token['email'];

    return {
      username: preferredUsername,
      fullName,
      email,
    };
  }

  /**
   * Merge backend user with profile data from token
   */
  private enrichUser(user: User | null): User | null {
    if (!user) return null;
    return { ...user, ...this.getProfileFromToken() };
  }

  /**
   * Watch for Keycloak authentication state changes
   * Since Keycloak.init() with check-sso is async, we poll for authenticated state
   */
  private watchKeycloakAuthChanges(): void {
    let lastAuthState = this.kc?.authenticated ?? false;
    console.log('[Auth][watcher] starting. kc.authenticated =', this.kc?.authenticated, 'token?', !!this.kc?.token, 'tokenParsed?', !!this.kc?.tokenParsed);

    const authCheckInterval = setInterval(() => {
      const currentAuthState = this.kc?.authenticated ?? false;

      // ALSO check if we have a valid token, even if Keycloak says not authenticated
      // (can happen when nonce validation fails but token is still valid)
      const hasValidToken = !!this.kc?.token && this.kc?.tokenParsed;
      if (!currentAuthState) {
        console.log('[Auth][watcher] kc.authenticated=false; token?', !!this.kc?.token, 'tokenParsed?', !!this.kc?.tokenParsed);
      }
      const effectiveAuthState = currentAuthState || hasValidToken;

      if (effectiveAuthState && !lastAuthState) {
        // Keycloak just authenticated (or we detected a valid token)
        const username = this.kc?.idTokenParsed?.['preferred_username'] || this.kc?.idTokenParsed?.['sub'] || this.kc?.tokenParsed?.['sub'] || 'Unknown';
        console.log('[Auth] ✅ Authentication detected! User:', username);
        console.log('[Auth] Token exists:', !!this.kc?.token);
        lastAuthState = effectiveAuthState;

        // Fetch user from backend with the new token
        this.fetchCurrentUser().subscribe(
          user => {
            const enrichedUser = this.enrichUser(user);
            this.currentUserSubject.next(enrichedUser);
            localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
            console.log('[Auth] ✅ User synchronized from backend');
          },
          error => {
            console.error('[Auth] ❌ Failed to sync user:', error);
            // Still mark as authenticated even if fetch fails
            const userData: User = {
              id: 0,
              externalId: username,
              avatarColor: '#000000',
              totalCo2: 0,
              totalWater: 0,
              totalElectricity: 0
            };
            const enrichedUser = this.enrichUser(userData);
            this.currentUserSubject.next(enrichedUser);
            localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
          }
        );
      } else if (!effectiveAuthState && lastAuthState) {
        // Keycloak logged out
        console.log('[Auth] User logged out');
        lastAuthState = effectiveAuthState;
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
      }
    }, 1000); // Check every 1 second for auth state changes
  }

  /**
   * Initialize current user from Keycloak JWT or localStorage
   */
  private initializeUser(): void {
    // Try to load from localStorage first
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      const enrichedUser = this.enrichUser(parsedUser);
      this.currentUserSubject.next(enrichedUser);
      localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
      console.log('[Auth] Loaded user from localStorage');
    }

    // If Keycloak is authenticated, fetch fresh user from backend
    if (this.kc && this.kc.authenticated) {
      console.log('[Auth] Keycloak authenticated, fetching user from backend...');
      this.fetchCurrentUser().subscribe(
        user => {
          const enrichedUser = this.enrichUser(user);
          this.currentUserSubject.next(enrichedUser);
          localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
          console.log('[Auth] User loaded from backend:', enrichedUser?.externalId);
        },
        error => {
          console.error('[Auth] Failed to fetch current user:', error);
        }
      );
    } else {
      console.log('[Auth] Keycloak not authenticated yet');
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
    if (this.kc) {
      console.log('[Auth] Initiating Keycloak login...');
      // Redirect to /activities after login
      this.kc.login({ redirectUri: window.location.origin + '/activities' });
    } else {
      console.warn('[Auth] Keycloak not initialized');
    }
  }

  /**
   * Redirect to Keycloak registration page
   */
  register(): void {
    if (this.kc) {
      console.log('[Auth] Redirecting to Keycloak registration...');
      this.kc.register({ redirectUri: window.location.origin + '/activities' });
    } else {
      console.warn('[Auth] Keycloak not initialized');
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
  updateCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    const isAuth = this.kc?.authenticated === true;
    if (!isAuth && this.kc) {
      console.log('[Auth] Not authenticated. kc.authenticated =', this.kc.authenticated, 'kc.token =', !!this.kc.token);
    }
    return isAuth;
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
        const enrichedUser = this.enrichUser(user);
        localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
        this.currentUserSubject.next(enrichedUser);
      })
    );
  }

  /**
   * Delete user account (triggers backend deletion)
   */
  deleteAccount(): Observable<any> {
    console.log('[Auth] 🗑️ Calling DELETE /api/auth/me...');
    console.log('[Auth] URL:', `${this.apiUrl}/me`);
    // Call backend to delete user and all related data
    return this.http.delete(`${this.apiUrl}/me`).pipe(
      tap(() => {
        console.log('[Auth] ✅ Account deleted successfully from backend');
        // After successful deletion, log out
        this.logout();
      }),
      catchError((error) => {
        console.error('[Auth] ❌ Failed to delete account:', error);
        console.error('[Auth] Error status:', error.status);
        console.error('[Auth] Error message:', error.message);
        // Log out anyway even if backend call fails
        this.logout();
        return throwError(() => error);
      })
    );
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
