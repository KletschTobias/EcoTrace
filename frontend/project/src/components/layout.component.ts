import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout-container">
      <header class="header">
        <div class="header-content">
          <div class="logo" (click)="navigateTo('/dashboard')">
            <span class="logo-icon">🌱</span>
            <span class="logo-text">EcoTrace</span>
          </div>

          <nav class="nav" *ngIf="isAuthenticated">
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
          </nav>

          <div class="user-menu">
            <ng-container *ngIf="isAuthenticated">
              <div class="user-info">
                <div 
                  class="user-avatar"
                  [style.background-color]="currentUser?.avatarColor || '#10B981'"
                  (click)="toggleProfileMenu()">
                  {{ ((currentUser?.username || currentUser?.fullName || currentUser?.externalId || '').charAt(0) || '?').toUpperCase() }}
                </div>
                <div class="user-details">
                  <strong>{{ currentUser?.username || currentUser?.fullName || currentUser?.externalId || '' }}</strong>
                  <small>{{ currentUser?.email || currentUser?.externalId || '' }}</small>
                </div>
              </div>

              <div class="dropdown-menu" *ngIf="profileMenuOpen">
                <button class="dropdown-btn" (click)="openProfileEdit()">
                  ⚙️ Edit Profile
                </button>
                <button class="dropdown-btn danger" (click)="deleteAccount()">
                  🗑️ Delete Account
                </button>
                <button class="dropdown-btn" (click)="logout()">
                  🚪 Logout
                </button>
              </div>
            </ng-container>

            <ng-container *ngIf="!isAuthenticated">
              <button class="btn-login" (click)="login()">
                🔓 Login
              </button>
              <button class="btn-register" (click)="register()">
                📝 Register
              </button>
            </ng-container>
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
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

    .user-details small {
      color: #6b7280;
      font-size: 0.75rem;
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

    .btn-login,
    .btn-register,
    .btn-logout {
      padding: 0.75rem 1.5rem;
      background: #10B981;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout {
      background: #ef4444;
      padding: 0.75rem 1rem;
      font-size: 1.2rem;
    }

    .btn-logout:hover {
      background: #dc2626;
    }

    .btn-login:hover,
    .btn-register:hover {
      background: #059669;
      transform: translateY(-2px);
    }

    .btn-register {
      background: #06B6D4;
    }

    .btn-register:hover {
      background: #0891b2;
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .footer {
      background: white;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    }

    .footer p {
      margin: 0.5rem 0;
      color: #6b7280;
    }

    .footer-links {
      display: flex;
      gap: 1rem;
      justify-content: center;
      align-items: center;
    }

    .footer-links a {
      color: #10B981;
      text-decoration: none;
      font-weight: 600;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }

    @media (max-width: 1024px) {
      .header-content {
        padding: 1rem;
      }

      .nav {
        gap: 0.5rem;
      }

      .nav-link {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }

      .user-details {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-wrap: wrap;
      }

      .nav {
        order: 3;
        width: 100%;
        justify-content: space-around;
      }

      .nav-link {
        flex: 1;
        justify-content: center;
        padding: 0.5rem;
      }

      .user-menu {
        flex-direction: row-reverse;
      }

      .btn-logout {
        padding: 0.5rem 1rem;
        font-size: 1rem;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;
  profileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = this.authService.isAuthenticated();
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.profileMenuOpen = false;
  }

  login(): void {
    this.authService.login();
  }

  register(): void {
    this.authService.register();
  }

  logout(): void {
    this.authService.logout();
    this.profileMenuOpen = false;
    this.router.navigate(['/']);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  openProfileMenu(): void {
    this.profileMenuOpen = true;
  }

  openProfileEdit(): void {
    this.router.navigate(['/profile']);
    this.profileMenuOpen = false;
  }

  deleteAccount(): void {
    if (confirm('⚠️ Are you sure you want to delete your account? This cannot be undone!')) {
      this.authService.deleteAccount();
      this.router.navigate(['/']);
    }
    this.profileMenuOpen = false;
  }
}