import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GuestService } from '../services/guest.service';
import { User } from '../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="layout-container">
      <header class="header">
        <div class="header-content">
          <div class="logo" (click)="navigateTo('/dashboard')">
            <span class="logo-icon">🌱</span>
            <span class="logo-text">EcoTrace</span>
          </div>

          <nav class="nav">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="active"
              class="nav-link">
              📊 Dashboard
            </a>
            <a 
              routerLink="/activities" 
              routerLinkActive="active"
              class="nav-link">
              ⚡ Activities
            </a>
            <a 
              routerLink="/friends" 
              routerLinkActive="active"
              class="nav-link">
              👥 Friends
            </a>
            <a 
              *ngIf="!isGuest"
              routerLink="/achievements" 
              routerLinkActive="active"
              class="nav-link">
              🏆 Achievements
            </a>
            <a 
              *ngIf="!isGuest"
              routerLink="/profile" 
              routerLinkActive="active"
              class="nav-link">
              👤 Profile
            </a>
          </nav>

          <!-- Logged in user menu -->
          <div *ngIf="!isGuest" class="user-menu">
            <div class="user-info" (click)="navigateTo('/profile')">
              <div 
                class="user-avatar"
                [style.background-color]="currentUser?.avatarColor || '#10B981'">
                <img 
                  *ngIf="currentUser?.profileImageUrl" 
                  [src]="getProfileImageUrl(currentUser?.profileImageUrl || '')"
                  [alt]="currentUser?.username || 'User'"
                  class="avatar-image">
                <span *ngIf="!currentUser?.profileImageUrl">
                  {{ (currentUser?.username || currentUser?.externalId || 'U').charAt(0) }}
                </span>
              </div>
              <div class="user-details">
                <strong>{{ currentUser?.username || currentUser?.externalId }}</strong>
              </div>
            </div>
            <button class="btn-logout" (click)="logout()">
              🚪 Logout
            </button>
          </div>

          <!-- Guest user - Login/Register buttons top right -->
          <div *ngIf="isGuest" class="guest-menu">
            <button class="btn-login" (click)="login()">
              🔓 Sign In
            </button>
            <button class="btn-login" (click)="register()">
              📝 Sign Up
            </button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <p>© 2025 EcoTrace - Track your environmental impact</p>
        <p class="footer-links">
          <a href="https://github.com/yourusername/ecotrace" target="_blank">GitHub</a>
          <span>•</span>
          <a href="#privacy">Privacy</a>
          <span>•</span>
          <a href="#terms">Terms</a>
        </p>
      </footer>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #e0f2fe 0%, #d1fae5 100%);
    }

    .header {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 1.5rem;
      font-weight: 700;
      transition: transform 0.2s;
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav {
      display: flex;
      gap: 1rem;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      color: #6b7280;
      font-weight: 600;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .nav-link.active {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: background 0.3s;
    }

    .user-info:hover {
      background: #f3f4f6;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.25rem;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .user-avatar:hover {
      transform: scale(1.1);
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-details strong {
      color: #111827;
      font-size: 0.875rem;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 180px;
      margin-top: 0.5rem;
    }

    .dropdown-btn {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-weight: 500;
      color: #374151;
      transition: all 0.2s;
      border-bottom: 1px solid #f3f4f6;
    }

    .dropdown-btn:last-child {
      border-bottom: none;
    }

    .dropdown-btn:hover {
      background: #f9fafb;
      color: #10B981;
    }

    .dropdown-btn.danger:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-login {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-login:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .btn-logout {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .footer {
      background: white;
      padding: 2rem;
      text-align: center;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-wrap: wrap;
        padding: 1rem;
      }

      .nav {
        order: 3;
        width: 100%;
        gap: 0.5rem;
      }

      .nav-link {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }

      .user-details {
        display: none;
      }

      .main-content {
        padding: 1rem;
      }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isGuest = false;
  currentUser: User | null = null;
  profileMenuOpen = false;
  private subscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private guestService: GuestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      this.isGuest = this.guestService.isGuest();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getProfileImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.profileMenuOpen = false;
  }

  login(): void {
    // Redirect zu Keycloak Login
    this.authService.login();
  }

  register(): void {
    // Redirect zu Keycloak Registration
    this.authService.register();
  }

  logout(): void {
    this.authService.logout();
    this.profileMenuOpen = false;
    this.guestService.exitGuestMode();
    this.router.navigate(['/home']);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  deleteAccount(): void {
    if (confirm('⚠️ Are you sure you want to delete your account? This cannot be undone!')) {
      this.authService.deleteAccount();
      this.router.navigate(['/']);
    }
    this.profileMenuOpen = false;
  }
}