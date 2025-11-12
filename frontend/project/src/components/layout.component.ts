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
          </nav>

          <div class="user-menu">
            <div class="user-info">
              <div 
                class="user-avatar"
                [style.background-color]="currentUser?.avatarColor">
                {{ currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0) }}
              </div>
              <div class="user-details">
                <strong>{{ currentUser?.fullName || 'User' }}</strong>
                <small>{{ currentUser?.email }}</small>
              </div>
            </div>
            <button class="btn-logout" (click)="logout()">
              🚪 Logout
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

    .btn-logout {
      padding: 0.75rem 1.5rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: #dc2626;
      transform: translateY(-2px);
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
        font-size: 0.875rem;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
