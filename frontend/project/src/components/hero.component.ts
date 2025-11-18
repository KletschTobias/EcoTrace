import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Daily consumption targets
const DAILY_TARGETS = {
  water: 11_000_000_000_000, // 11 km³ in liters
  electricity: 75_000_000_000, // 75 billion kWh
  co2: 100_000_000 // 100 million tonnes
};

type TimePeriod = 'daily' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="hero-section">
      <div class="animated-background">
        <div class="floating-particles">
          <div class="particle" *ngFor="let particle of particles; trackBy: trackParticle" 
               [style.left.px]="particle.x" 
               [style.top.px]="particle.y"
               [style.animation-delay.s]="particle.delay">
          </div>
        </div>
        <div class="wave-animation">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="wave-path"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="wave-path"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="wave-path"></path>
          </svg>
        </div>
      </div>
      
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="eco">Eco</span><span class="trace">Trace</span>
          </h1>
          <p class="hero-subtitle">Track Your Environmental Impact</p>
          <p class="hero-description">
            Discover your carbon footprint, monitor water usage, and track electricity consumption. 
            Join the movement towards a sustainable future with real-time environmental insights.
          </p>
          <div class="cta-buttons">
            <button class="btn-primary" (click)="showAuthModal = true">Start Tracking</button>
          </div>
        </div>
        
        <div class="hero-stats">
          <!-- Period Selector -->
          <div class="period-selector">
            <button 
              class="period-btn" 
              [class.active]="selectedPeriod === 'daily'"
              (click)="setPeriod('daily')">Daily</button>
            <button 
              class="period-btn" 
              [class.active]="selectedPeriod === 'week'"
              (click)="setPeriod('week')">Week</button>
            <button 
              class="period-btn" 
              [class.active]="selectedPeriod === 'month'"
              (click)="setPeriod('month')">Month</button>
            <button 
              class="period-btn" 
              [class.active]="selectedPeriod === 'year'"
              (click)="setPeriod('year')">Year</button>
          </div>
          
          <div class="stat-card co2">
            <div class="stat-icon">🌍</div>
            <div class="stat-content">
              <h3>Global CO₂</h3>
              <div class="stat-value">{{ globalStats.co2 | number:'1.0-0' }}</div>
              <span class="stat-unit">tons {{ periodLabel }}</span>
              <div class="stat-trend" [class.increasing]="true">↗ Live</div>
            </div>
          </div>
          
          <div class="stat-card electricity">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <h3>Energy Usage</h3>
              <div class="stat-value">{{ globalStats.electricity | number:'1.0-0' }}</div>
              <span class="stat-unit">kWh {{ periodLabel }}</span>
              <div class="stat-trend" [class.increasing]="true">↗ Live</div>
            </div>
          </div>
          
          <div class="stat-card water">
            <div class="stat-icon">💧</div>
            <div class="stat-content">
              <h3>Water Consumption</h3>
              <div class="stat-value">{{ globalStats.water | number:'1.0-0' }}</div>
              <span class="stat-unit">liters {{ periodLabel }}</span>
              <div class="stat-trend" [class.increasing]="true">↗ Live</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Auth Modal -->
      <div class="modal-overlay" *ngIf="showAuthModal" (click)="showAuthModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="showAuthModal = false">✕</button>
          
          <div class="auth-tabs">
            <button 
              class="tab-btn"
              [class.active]="authMode === 'login'"
              (click)="authMode = 'login'">Login</button>
            <button 
              class="tab-btn"
              [class.active]="authMode === 'register'"
              (click)="authMode = 'register'">Register</button>
          </div>

          <!-- Login Form -->
          <form *ngIf="authMode === 'login'" (ngSubmit)="login()" class="auth-form">
            <h2>Welcome Back!</h2>
            <p class="form-subtitle">Sign in to continue tracking your impact</p>
            
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                [(ngModel)]="loginData.email"
                name="loginEmail"
                placeholder="your@email.com"
                required>
            </div>
            
            <div class="form-group">
              <label>Password</label>
              <input 
                type="password" 
                [(ngModel)]="loginData.password"
                name="loginPassword"
                placeholder="••••••••"
                required>
            </div>

            <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

            <button type="submit" class="submit-btn" [disabled]="isLoading">
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>

            <p class="demo-hint">
              💡 Try demo account: <strong>demo&#64;ecotrace.com</strong> / <strong>demo123</strong>
            </p>
          </form>

          <!-- Register Form -->
          <form *ngIf="authMode === 'register'" (ngSubmit)="register()" class="auth-form">
            <h2>Join EcoTrace</h2>
            <p class="form-subtitle">Start your journey to a sustainable future</p>
            
            <div class="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                [(ngModel)]="registerData.fullName"
                name="registerFullName"
                placeholder="John Doe"
                required>
            </div>

            <div class="form-group">
              <label>Username</label>
              <input 
                type="text" 
                [(ngModel)]="registerData.username"
                name="registerUsername"
                placeholder="johndoe"
                required>
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                [(ngModel)]="registerData.email"
                name="registerEmail"
                placeholder="your@email.com"
                required>
            </div>
            
            <div class="form-group">
              <label>Password</label>
              <input 
                type="password" 
                [(ngModel)]="registerData.password"
                name="registerPassword"
                placeholder="••••••••"
                required>
            </div>

            <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

            <button type="submit" class="submit-btn" [disabled]="isLoading">
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .animated-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .floating-particles {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
      50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
    }

    .wave-animation {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 120px;
    }

    .wave-animation svg {
      width: 100%;
      height: 100%;
    }

    .wave-path {
      fill: rgba(255, 255, 255, 0.1);
      animation: wave 3s ease-in-out infinite;
    }

    @keyframes wave {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-25px); }
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 1200px;
      width: 100%;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-text {
      color: white;
    }

    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.1;
    }

    .eco {
      color: #4ade80;
      text-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
    }

    .trace {
      color: #60a5fa;
      text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
    }

    .hero-subtitle {
      font-size: 1.5rem;
      font-weight: 300;
      margin-bottom: 1.5rem;
      opacity: 0.9;
    }

    .hero-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      opacity: 0.8;
    }

    .cta-buttons {
      display: flex;
      justify-content: flex-start;
    }

    .btn-primary, .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-primary {
      background: linear-gradient(45deg, #4ade80, #22c55e);
      color: white;
      box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(74, 222, 128, 0.6);
    }

    .hero-stats {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .period-selector {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      justify-content: center;
    }

    .period-btn {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .period-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .period-btn.active {
      background: linear-gradient(45deg, #4ade80, #22c55e);
      border-color: #22c55e;
      box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
    }

    .period-selector {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      justify-content: center;
    }

    .period-btn {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .period-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .period-btn.active {
      background: linear-gradient(45deg, #4ade80, #22c55e);
      border-color: #22c55e;
      box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      animation: slideInRight 0.8s ease-out;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .stat-card.co2 { animation-delay: 0.2s; }
    .stat-card.electricity { animation-delay: 0.4s; }
    .stat-card.water { animation-delay: 0.6s; }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .stat-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
    }

    .stat-content {
      flex: 1;
      color: white;
    }

    .stat-content h3 {
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-unit {
      font-size: 0.8rem;
      opacity: 0.7;
      margin-left: 0.5rem;
    }

    .stat-trend {
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .stat-trend.increasing {
      color: #fbbf24;
    }

    .stat-trend.decreasing {
      color: #4ade80;
    }

    /* Auth Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      max-width: 450px;
      width: 90%;
      position: relative;
      animation: slideUp 0.3s ease;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #111827;
    }

    .auth-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .tab-btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      background: #f3f4f6;
      color: #6b7280;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .auth-form h2 {
      color: #111827;
      margin-bottom: 0;
    }

    .form-subtitle {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: -1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-group input {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #10B981;
    }

    .submit-btn {
      padding: 1rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      color: #dc2626;
      font-size: 0.875rem;
      text-align: center;
      padding: 0.5rem;
      background: #fee2e2;
      border-radius: 8px;
    }

    .demo-hint {
      text-align: center;
      font-size: 0.875rem;
      color: #6b7280;
      background: #f0fdf4;
      padding: 0.75rem;
      border-radius: 8px;
      margin-top: -0.5rem;
    }

    .demo-hint strong {
      color: #10B981;
    }

    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
      }

      .hero-title {
        font-size: 3rem;
      }

      .cta-buttons {
        justify-content: center;
      }

      .modal-content {
        padding: 2rem;
      }
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  particles: Array<{x: number, y: number, delay: number}> = [];
  globalStats = {
    co2: 0,
    electricity: 0,
    water: 0
  };
  
  selectedPeriod: TimePeriod = 'daily';
  periodLabel = 'today';
  
  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';
  isLoading = false;
  errorMessage = '';

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    fullName: '',
    username: '',
    email: '',
    password: ''
  };
  
  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.generateParticles();
    this.updateStats();
    this.subscription = interval(100).subscribe(() => this.updateStats());
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  setPeriod(period: TimePeriod) {
    this.selectedPeriod = period;
    this.periodLabel = period === 'daily' ? 'today' : `this ${period}`;
    this.updateStats();
  }

  updateStats() {
    const now = new Date();
    const { progress, totalDays } = this.calculatePeriodProgress(now, this.selectedPeriod);
    
    // Calculate total consumption for the period
    const periodMultiplier = totalDays;
    
    this.globalStats.water = Math.floor(DAILY_TARGETS.water * periodMultiplier * progress);
    this.globalStats.electricity = Math.floor(DAILY_TARGETS.electricity * periodMultiplier * progress);
    this.globalStats.co2 = Math.floor(DAILY_TARGETS.co2 * periodMultiplier * progress);
  }

  private calculatePeriodProgress(now: Date, period: TimePeriod): { progress: number, totalDays: number } {
    switch (period) {
      case 'daily': {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        const msElapsed = now.getTime() - startOfDay.getTime();
        const totalMs = 24 * 60 * 60 * 1000; // 24 hours in ms
        
        return {
          progress: msElapsed / totalMs,
          totalDays: 1
        };
      }
      
      case 'week': {
        // Week starts on Monday (1) and ends on Sunday (0)
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is start
        startOfWeek.setDate(now.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const msElapsed = now.getTime() - startOfWeek.getTime();
        const totalMs = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
        
        return {
          progress: msElapsed / totalMs,
          totalDays: 7
        };
      }
      
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const msElapsed = now.getTime() - startOfMonth.getTime();
        const totalMs = endOfMonth.getTime() - startOfMonth.getTime();
        
        return {
          progress: msElapsed / totalMs,
          totalDays: endOfMonth.getDate()
        };
      }
      
      case 'year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear() + 1, 0, 0);
        
        const msElapsed = now.getTime() - startOfYear.getTime();
        const totalMs = endOfYear.getTime() - startOfYear.getTime();
        
        const isLeapYear = ((now.getFullYear() % 4 === 0) && (now.getFullYear() % 100 !== 0)) || (now.getFullYear() % 400 === 0);
        
        return {
          progress: msElapsed / totalMs,
          totalDays: isLeapYear ? 366 : 365
        };
      }
    }
  }

  private getConsumptionPattern(date: Date): number {
    const hour = date.getHours();
    
    // Realistic consumption patterns throughout the day
    // Peak hours: 8-18 (business hours), Lower at night: 22-6
    if (hour >= 8 && hour <= 18) {
      return 1.2; // 20% higher during business hours
    } else if (hour >= 19 && hour <= 21) {
      return 1.1; // Evening peak
    } else if (hour >= 22 || hour <= 5) {
      return 0.7; // 30% lower during night
    } else {
      return 1.0; // Normal consumption
    }
  }

  generateParticles() {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        delay: Math.random() * 6
      });
    }
  }

  trackParticle(index: number, particle: any) {
    return index;
  }

  login(): void {
    this.errorMessage = '';
    this.isLoading = true;
    
    // Redirect to Keycloak login
    try {
      this.authService.login();
    } catch (error) {
      console.error('Login error:', error);
      this.isLoading = false;
      this.errorMessage = 'Failed to initiate login. Please try again.';
    }
  }

  register(): void {
    this.errorMessage = '';
    this.isLoading = true;
    
    // Redirect to Keycloak registration
    try {
      this.authService.register();
    } catch (error) {
      console.error('Registration error:', error);
      this.isLoading = false;
      this.errorMessage = 'Failed to initiate registration. Please try again.';
    }
  }
}