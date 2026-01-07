import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-container">
      <!-- Blurred Dashboard Preview -->
      <div class="blurred-content">
        <!-- Header Preview -->
        <div class="preview-header">
          <div class="logo">
            <span class="logo-icon">🌱</span>
            <span class="logo-text">EcoTrace</span>
          </div>
          <div class="nav-preview">
            <span class="nav-item">📊 Dashboard</span>
            <span class="nav-item">⚡ Activities</span>
            <span class="nav-item">👥 Friends</span>
            <span class="nav-item">👤 Profile</span>
          </div>
        </div>

        <!-- Dashboard Preview -->
        <div class="dashboard-preview">
          <h1 class="preview-title">Welcome back, Eco Warrior! 🌱</h1>
          
          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card co2">
              <div class="stat-icon">🌍</div>
              <div class="stat-content">
                <h3>CO₂ Emissions</h3>
                <div class="stat-value">12.4</div>
                <span class="stat-unit">kg</span>
              </div>
            </div>
            <div class="stat-card water">
              <div class="stat-icon">💧</div>
              <div class="stat-content">
                <h3>Water Usage</h3>
                <div class="stat-value">156</div>
                <span class="stat-unit">liters</span>
              </div>
            </div>
            <div class="stat-card electricity">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <h3>Electricity</h3>
                <div class="stat-value">8.2</div>
                <span class="stat-unit">kWh</span>
              </div>
            </div>
          </div>

          <!-- Charts Preview -->
          <div class="charts-preview">
            <div class="chart-card">
              <h3>CO₂ Emissions</h3>
              <div class="chart-bars">
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 45%"></div>
              </div>
            </div>
            <div class="chart-card">
              <h3>Water Usage</h3>
              <div class="chart-bars">
                <div class="bar water" style="height: 70%"></div>
                <div class="bar water" style="height: 55%"></div>
                <div class="bar water" style="height: 90%"></div>
              </div>
            </div>
            <div class="chart-card">
              <h3>Electricity</h3>
              <div class="chart-bars">
                <div class="bar electric" style="height: 50%"></div>
                <div class="bar electric" style="height: 65%"></div>
                <div class="bar electric" style="height: 40%"></div>
              </div>
            </div>
          </div>

          <!-- Activities Preview -->
          <div class="activities-preview">
            <h2>Recent Activities</h2>
            <div class="activity-item">
              <span>🚗 Drove to work</span>
              <span class="activity-impact">+2.5 kg CO₂</span>
            </div>
            <div class="activity-item">
              <span>🚿 Morning shower</span>
              <span class="activity-impact">+45 L water</span>
            </div>
            <div class="activity-item">
              <span>💡 Working from home</span>
              <span class="activity-impact">+1.2 kWh</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Login Overlay -->
      <div class="login-overlay">
        <div class="overlay-content">
          <div class="lock-icon">🔒</div>
          <h2>Unlock Your Dashboard</h2>
          <p>Sign in to track your environmental impact, compare with friends, and join the leaderboard!</p>
          
          <div class="features-list">
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Track CO₂, Water & Electricity</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🏆</span>
              <span>Compete on Leaderboards</span>
            </div>
            <div class="feature">
              <span class="feature-icon">👥</span>
              <span>Connect with Friends</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📈</span>
              <span>View Your Progress</span>
            </div>
          </div>

          <div class="cta-buttons">
            <button class="btn-primary" (click)="goToLogin()">
              Sign In
            </button>
            <button class="btn-secondary" (click)="goToLogin()">
              Create Account
            </button>
          </div>

          <button class="btn-back" (click)="goBack()">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
    }

    .blurred-content {
      filter: blur(8px);
      pointer-events: none;
      user-select: none;
      opacity: 0.7;
      min-height: 100vh;
      background: linear-gradient(135deg, #e0f2fe 0%, #d1fae5 100%);
      padding: 0;
    }

    .preview-header {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-preview {
      display: flex;
      gap: 1.5rem;
    }

    .nav-item {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border-radius: 0.5rem;
      font-size: 0.9rem;
    }

    .dashboard-preview {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .preview-title {
      font-size: 2rem;
      color: #111827;
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-card.co2 { border-left: 4px solid #10B981; }
    .stat-card.water { border-left: 4px solid #06B6D4; }
    .stat-card.electricity { border-left: 4px solid #F59E0B; }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
    }

    .stat-unit {
      color: #6b7280;
    }

    .charts-preview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .chart-card h3 {
      margin-bottom: 1rem;
      color: #374151;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 150px;
      gap: 1rem;
    }

    .bar {
      width: 40px;
      background: linear-gradient(to top, #10B981, #34D399);
      border-radius: 8px 8px 0 0;
    }

    .bar.water {
      background: linear-gradient(to top, #0891B2, #22D3EE);
    }

    .bar.electric {
      background: linear-gradient(to top, #D97706, #FBBF24);
    }

    .activities-preview {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .activities-preview h2 {
      margin-bottom: 1rem;
      color: #111827;
    }

    .activity-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .activity-impact {
      color: #6b7280;
      font-size: 0.9rem;
    }

    /* Login Overlay */
    .login-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      background: rgba(0, 0, 0, 0.3);
    }

    .overlay-content {
      background: white;
      padding: 3rem;
      border-radius: 1.5rem;
      text-align: center;
      max-width: 450px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .lock-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .overlay-content h2 {
      font-size: 1.75rem;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .overlay-content p {
      color: #6b7280;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .features-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 2rem;
      text-align: left;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f0fdf4;
      border-radius: 0.5rem;
      font-size: 0.9rem;
    }

    .feature-icon {
      font-size: 1.25rem;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .btn-primary {
      flex: 1;
      padding: 1rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }

    .btn-secondary {
      flex: 1;
      padding: 1rem;
      background: white;
      color: #10B981;
      border: 2px solid #10B981;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      background: #f0fdf4;
    }

    .btn-back {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      font-size: 0.9rem;
      margin-top: 1rem;
      transition: color 0.3s;
    }

    .btn-back:hover {
      color: #111827;
    }

    @media (max-width: 768px) {
      .stats-grid,
      .charts-preview {
        grid-template-columns: 1fr;
      }

      .nav-preview {
        display: none;
      }

      .features-list {
        grid-template-columns: 1fr;
      }

      .cta-buttons {
        flex-direction: column;
      }

      .overlay-content {
        margin: 1rem;
        padding: 2rem;
      }
    }
  `]
})
export class PreviewComponent {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/home']);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
