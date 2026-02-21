import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GuestService } from '../services/guest.service';
import { UserActivityService } from '../services/user-activity.service';
import { User, Stats, UserActivity } from '../models/models';
import { format, subDays, startOfDay } from 'date-fns';
import { forkJoin } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { EcoSmileyComponent, SmileyStatus } from '../components/eco-smiley.component';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EcoSmileyComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>{{ isGuest ? 'Welcome to EcoTrace! 🌱' : ('Welcome back, ' + (user?.fullName || 'Eco Warrior') + '!') }}</h1>
        <div class="badges" *ngIf="!isGuest && (user?.hasSolarPanels || user?.hasHeatPump)">
          <span *ngIf="user?.hasSolarPanels" class="badge solar">☀️ Solar Panels</span>
          <span *ngIf="user?.hasHeatPump" class="badge heat">🌡️ Heat Pump</span>
        </div>
        <p>{{ isGuest ? 'See what you can track with EcoTrace' : 'Here\\'s your environmental impact summary' }}</p>
      </div>

      <!-- Date Range Selector -->
      <div class="date-selector" [class.blurred]="isGuest">
        <button 
          *ngFor="let range of dateRanges" 
          [class.active]="selectedRange === range.value"
          (click)="handleGuestAction('date-range') || setDateRange(range.value)"
          class="date-btn">
          {{ range.label }}
        </button>
      </div>

      <!-- Stats Overview -->
        <div class="stats-grid-wrapper">
            <div class="stats-grid" [class.blurred]="isGuest">
        <div class="stat-card co2">
          <div class="stat-icon">🌍</div>
          <div class="stat-content">
            <h3>CO₂ Emissions</h3><div class="stat-value">{{ isGuest ? '12.4' : stats.co2.toFixed(1) }}</div>
            <span class="stat-unit">kg</span>
          </div>
        </div>

          <div class="stat-card water">
            <div class="stat-icon">💧</div>
            <div class="stat-content">
              <h3>Water Usage</h3>
              <div class="stat-value">{{ isGuest ? '156' : stats.water.toFixed(0) }}</div>
              <span class="stat-unit">liters</span>
            </div>
          </div>

          <div class="stat-card electricity">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <h3>Electricity</h3>
              <div class="stat-value">{{ isGuest ? '8.2' : stats.electricity.toFixed(1) }}</div>
              <span class="stat-unit">kWh</span>
            </div>
          </div>
        </div>
        
        <!-- Guest Overlay for Stats -->
        <div *ngIf="isGuest" class="locked-overlay" (click)="showRegisterPrompt('View your real stats')">
          <span class="lock-icon">🔒</span>
          <span class="lock-text">Log in to view your stats</span>
        </div>
      </div>

      <!-- Comparison -->
      <div class="comparison-wrapper">
        <div class="comparison-section" [class.blurred]="isGuest">
          <h2>Your Impact vs Averages</h2>
          <p class="comparison-note">Comparing your {{ selectedRange === 'today' ? 'daily' : (selectedRange === 'week' ? 'weekly' : 'monthly') }} totals with scaled {{ selectedRange === 'today' ? 'daily' : (selectedRange === 'week' ? 'weekly' : 'monthly') }} averages</p>
          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-header">
                <h3>CO₂ Emissions (kg/day)</h3>
                <app-eco-smiley [status]="getSmileyStatus(stats.co2, 'co2')"></app-eco-smiley>
              </div>
              <canvas #co2Chart></canvas>
            </div>
            <div class="chart-card">
              <div class="chart-header">
                <h3>Water Usage (liters/day)</h3>
                <app-eco-smiley [status]="getSmileyStatus(stats.water, 'water')"></app-eco-smiley>
              </div>
              <canvas #waterChart></canvas>
            </div>
            <div class="chart-card">
              <div class="chart-header">
                <h3>Electricity (kWh/day)</h3>
                <app-eco-smiley [status]="getSmileyStatus(stats.electricity, 'electricity')"></app-eco-smiley>
              </div>
              <canvas #electricityChart></canvas>
            </div>
          </div>
        </div>
        
        <!-- Guest Overlay for Charts -->
        <div *ngIf="isGuest" class="locked-overlay" (click)="showRegisterPrompt('See your impact charts')">
          <span class="lock-icon">🔒</span>
          <span class="lock-text">Log in to see your charts</span>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="recent-wrapper">
        <div class="recent-activities" [class.blurred]="isGuest">
          <h2>Recent Activities</h2>
          <div class="activities-list" *ngIf="!isGuest && recentActivities.length > 0; else noActivities">
            <div *ngFor="let activity of recentActivities" class="activity-item">
              <div class="activity-info">
                <h4>{{ activity.activityName }}</h4>
                <p>{{ activity.quantity | number:'1.0-1' }} {{ activity.unit }} • {{ formatDate(activity.date) }}</p>
              </div>
              <div class="activity-impacts">
                <span *ngIf="activity.co2Impact > 0" class="impact co2">
                  {{ activity.co2Impact.toFixed(1) }}kg CO₂
                </span>
                <span *ngIf="activity.waterImpact > 0" class="impact water">
                  {{ activity.waterImpact.toFixed(0) }}L
                </span>
                <span *ngIf="activity.electricityImpact > 0" class="impact electricity">
                  {{ activity.electricityImpact.toFixed(1) }}kWh
                </span>
              </div>
            </div>
          </div>
          
          <!-- Sample activities for guests -->
          <div *ngIf="isGuest" class="activities-list sample-activities">
            <div class="activity-item">
              <div class="activity-info">
                <h4>🚗 Car Commute</h4>
                <p>25 km • Today</p>
              </div>
              <div class="activity-impacts">
                <span class="impact co2">4.2kg CO₂</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-info">
                <h4>🚿 Shower</h4>
                <p>10 min • Today</p>
              </div>
              <div class="activity-impacts">
                <span class="impact water">80L</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-info">
                <h4>💡 Lighting</h4>
                <p>5 hours • Today</p>
              </div>
              <div class="activity-impacts">
                <span class="impact electricity">0.5kWh</span>
              </div>
            </div>
          </div>
          
          <ng-template #noActivities>
            <p class="no-data">No activities logged yet. Start tracking your impact!</p>
          </ng-template>
        </div>
        
        <!-- Guest Overlay for Activities -->
        <div *ngIf="isGuest" class="guest-activities-overlay">
          <span class="lock-icon">🔒</span>
          <p class="lock-text">Ready to track your environmental impact?</p>
          <button class="btn-start-tracking" (click)="startTracking()">
            🚀 Start Tracking
          </button>
          <p class="login-prompt">Or <button class="link-button" (click)="goToLogin()">sign in</button> if you already have an account</p>
        </div>
      </div>
    </div>
    
    <!-- Registration Prompt Modal -->
    <div *ngIf="showPrompt" class="prompt-overlay" (click)="showPrompt = false">
      <div class="prompt-content" (click)="$event.stopPropagation()">
        <button class="prompt-close" (click)="showPrompt = false">×</button>
        <div class="prompt-icon">🌱</div>
        <h2>{{ promptTitle }}</h2>
        <p>Create a free account to unlock all features and start tracking your environmental impact!</p>
        <div class="prompt-features">
          <div class="feature">✅ Track daily activities</div>
          <div class="feature">✅ Compare with global averages</div>
          <div class="feature">✅ Compete with friends</div>
          <div class="feature">✅ View detailed charts</div>
        </div>
        <div class="prompt-buttons">
          <button class="btn-register" (click)="goToRegister()">Create Free Account</button>
          <button class="btn-login" (click)="goToLogin()">Already have an account? Sign In</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    /* Wrapper for positioning overlays */
    .stats-grid-wrapper,
    .comparison-wrapper,
    .recent-wrapper {
      position: relative;
    }

    /* Guest Mode Blur Styles */
    .blurred {
      filter: blur(5px);
      pointer-events: none;
      user-select: none;
    }

    /* Locked Overlay - simple text over blur */
    .locked-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.95);
      padding: 1rem 2rem;
      border-radius: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .locked-overlay:hover {
      transform: translate(-50%, -50%) scale(1.05);
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
    }

    .locked-overlay .lock-icon {
      font-size: 1.5rem;
    }

    .locked-overlay .lock-text {
      font-weight: 600;
      color: #374151;
      font-size: 1rem;
    }

    .sample-activities {
      opacity: 0.7;
    }

    /* Guest Activities Overlay */
    .guest-activities-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.98);
      padding: 2rem 2.5rem;
      border-radius: 1.5rem;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 350px;
    }

    .guest-activities-overlay .lock-icon {
      font-size: 2rem;
    }

    .guest-activities-overlay .lock-text {
      font-weight: 600;
      color: #374151;
      font-size: 1rem;
      margin: 0;
    }

    .btn-start-tracking {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 0.5rem 0;
    }

    .btn-start-tracking:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }

    .login-prompt {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .link-button {
      background: none;
      border: none;
      color: #10B981;
      cursor: pointer;
      font-weight: 600;
      padding: 0;
      text-decoration: underline;
      transition: color 0.3s ease;
    }

    .link-button:hover {
      color: #059669;
    }

    /* Registration Prompt Modal */
    .prompt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .prompt-content {
      background: white;
      border-radius: 1.5rem;
      padding: 2.5rem;
      max-width: 450px;
      width: 90%;
      text-align: center;
      position: relative;
    }

    .prompt-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
    }

    .prompt-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .prompt-content h2 {
      font-size: 1.5rem;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .prompt-content > p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .prompt-features {
      text-align: left;
      background: #f0fdf4;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .feature {
      padding: 0.5rem 0;
      color: #065f46;
      font-weight: 500;
    }

    .prompt-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .prompt-buttons .btn-register {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .prompt-buttons .btn-register:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .prompt-buttons .btn-login {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .prompt-buttons .btn-login:hover {
      color: #10B981;
    }

    .badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .badge.solar {
      background: #fef3c7;
      color: #d97706;
      border: 1px solid #fcd34d;
    }

    .badge.heat {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fca5a5;
    }

    .date-selector {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .date-btn {
      padding: 0.5rem 1.5rem;
      border: 2px solid #e5e7eb;
      border-radius: 2rem;
      background: white;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }

    .date-btn:hover {
      border-color: #10B981;
    }

    .date-btn.active {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border-color: transparent;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-icon {
      font-size: 3rem;
    }

    .stat-content h3 {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #111827;
    }

    .stat-unit {
      font-size: 0.875rem;
      color: #6b7280;
      margin-left: 0.5rem;
    }

    .comparison-section, .recent-activities {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .comparison-section h2, .recent-activities h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #111827;
    }

    .comparison-note {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .chart-card {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 0.5rem;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .chart-card h3 {
      font-size: 1rem;
      margin-bottom: 0;
      color: #374151;
    }

    .chart-card canvas {
      max-height: 300px;
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.5rem;
      transition: background 0.2s;
    }

    .activity-item:hover {
      background: #f3f4f6;
    }

    .activity-info h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: #111827;
    }

    .activity-info p {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .activity-impacts {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .impact {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .impact.co2 {
      background: #fee2e2;
      color: #991b1b;
    }

    .impact.water {
      background: #dbeafe;
      color: #1e40af;
    }

    .impact.electricity {
      background: #fef3c7;
      color: #92400e;
    }

    .no-data {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
      font-style: italic;
    }

    .loading-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2rem;
      color: #6b7280;
      font-size: 1.125rem;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header h1 {
        font-size: 1.75rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .date-selector {
        flex-wrap: wrap;
      }

      .activity-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('co2Chart') co2ChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('waterChart') waterChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('electricityChart') electricityChartRef!: ElementRef<HTMLCanvasElement>;

    user: User | null = null;
    stats: Stats = {co2: 0, water: 0, electricity: 0};
    recentActivities: UserActivity[] = [];
    selectedRange = 'today';
    isLoading = true;

    // Guest mode
    isGuest = false;
    showPrompt = false;
    promptTitle = '';
    private guestSubscription?: Subscription;

    private co2Chart?: Chart;
    private waterChart?: Chart;
    private electricityChart?: Chart;

    dateRanges = [
        {value: 'today', label: 'Today'},
        {value: 'week', label: 'Week'},
        {value: 'month', label: 'Month'}
    ];

    constructor(
        private authService: AuthService,
        private guestService: GuestService,
        private userActivityService: UserActivityService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.isGuest = this.guestService.isGuest();
        this.user = this.authService.getCurrentUser();

        // Subscribe to guest mode changes (for when user logs in)
        this.guestSubscription = this.guestService.isGuestMode$.subscribe(isGuest => {
            this.isGuest = isGuest;
            this.user = this.authService.getCurrentUser();
            if (this.user && !this.isGuest) {
                this.loadData();
            }
        });

        if (this.user && !this.isGuest) {
            this.loadData();
        }
    }

    ngOnDestroy(): void {
        this.guestSubscription?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.createCharts();
    }

    setDateRange(range: string): void {
        this.selectedRange = range;
        this.loadData();
    }

    loadData(): void {
        if (!this.user) return;

        this.isLoading = true;
        const {startDate, endDate} = this.getDateRange();

        // Load stats and activities in parallel
        forkJoin({
            stats: this.userActivityService.getUserStats(startDate, endDate),
            activities: this.userActivityService.getUserActivitiesByDateRange(startDate, endDate)
        }).subscribe({
            next: (result) => {
                this.stats = result.stats;
                this.recentActivities = result.activities.filter((a: UserActivity) => !a.sourceRecurringId).slice(0, 10);
                this.updateCharts();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading data:', error);
                this.isLoading = false;
            }
        });
    }

    getDateRange(): { startDate: string; endDate: string } {
        const today = startOfDay(new Date());
        let startDate: Date;

        switch (this.selectedRange) {
            case 'week':
                startDate = subDays(today, 7);
                break;
            case 'month':
                startDate = subDays(today, 30);
                break;
            default:
                startDate = today;
        }

        return {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd')
        };
    }

    getPercentageDiff(value: number, average: number): string {
        const diff = ((value - average) / average) * 100;
        return (diff >= 0 ? '+' : '') + diff.toFixed(1);
    }

    formatDate(dateString: string): string {
        return format(new Date(dateString), 'MMM dd, yyyy');
    }

    createCharts(): void {
        this.createCo2Chart();
        this.createWaterChart();
        this.createElectricityChart();
    }

    createCo2Chart(): void {
        const ctx = this.co2ChartRef.nativeElement.getContext('2d');
        if (!ctx) return;

        // You - Emerald
        const gradYou = ctx.createLinearGradient(0, 0, 0, 400);
        gradYou.addColorStop(0, '#34D399');
        gradYou.addColorStop(1, '#059669');

        // Global - Blue
        const gradGlobal = ctx.createLinearGradient(0, 0, 0, 400);
        gradGlobal.addColorStop(0, '#60A5FA');
        gradGlobal.addColorStop(1, '#2563EB');

        // EU - Violet
        const gradEU = ctx.createLinearGradient(0, 0, 0, 400);
        gradEU.addColorStop(0, '#A78BFA');
        gradEU.addColorStop(1, '#7C3AED');

        // Hover Gradients
        const gradYouHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradYouHover.addColorStop(0, '#6EE7B7');
        gradYouHover.addColorStop(1, '#10B981');

        const gradGlobalHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradGlobalHover.addColorStop(0, '#93C5FD');
        gradGlobalHover.addColorStop(1, '#3B82F6');

        const gradEUHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradEUHover.addColorStop(0, '#C4B5FD');
        gradEUHover.addColorStop(1, '#8B5CF6');

        this.co2Chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['You', 'Global Avg', 'EU Avg'],
                datasets: [{
                    label: 'CO₂ Emissions (kg)',
                    data: [this.stats.co2, 12.3, 18.6],
                    backgroundColor: [gradYou, gradGlobal, gradEU],
                    hoverBackgroundColor: [gradYouHover, gradGlobalHover, gradEUHover],
                    borderColor: ['#059669', '#2563EB', '#7C3AED'],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff',
                    borderRadius: 12,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {display: false},
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 14,
                        cornerRadius: 10,
                        titleFont: {size: 14, family: 'system-ui', weight: 'bold'},
                        bodyFont: {size: 13, family: 'system-ui'},
                        displayColors: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        usePointStyle: true,
                        callbacks: {label: (c: any) => `${c.parsed.y} kg CO₂`}
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)',
                            tickLength: 0
                        },
                        border: {display: false},
                        ticks: {
                            font: {size: 11, family: 'system-ui'},
                            color: '#64748b',
                            padding: 10
                        }
                    },
                    x: {
                        grid: {display: false},
                        border: {display: false},
                        ticks: {
                            font: {size: 12, weight: 'bold', family: 'system-ui'},
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }

    createWaterChart(): void {
        const ctx = this.waterChartRef.nativeElement.getContext('2d');
        if (!ctx) return;

        // You - Cyan
        const gradYou = ctx.createLinearGradient(0, 0, 0, 400);
        gradYou.addColorStop(0, '#22D3EE');
        gradYou.addColorStop(1, '#0891B2');

        // Global - Blue
        const gradGlobal = ctx.createLinearGradient(0, 0, 0, 400);
        gradGlobal.addColorStop(0, '#60A5FA');
        gradGlobal.addColorStop(1, '#2563EB');

        // EU - Violet
        const gradEU = ctx.createLinearGradient(0, 0, 0, 400);
        gradEU.addColorStop(0, '#A78BFA');
        gradEU.addColorStop(1, '#7C3AED');

        // Hover Gradients
        const gradYouHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradYouHover.addColorStop(0, '#67E8F9');
        gradYouHover.addColorStop(1, '#06B6D4');

        const gradGlobalHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradGlobalHover.addColorStop(0, '#93C5FD');
        gradGlobalHover.addColorStop(1, '#3B82F6');

        const gradEUHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradEUHover.addColorStop(0, '#C4B5FD');
        gradEUHover.addColorStop(1, '#8B5CF6');

        this.waterChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['You', 'Global Avg', 'EU Avg'],
                datasets: [{
                    label: 'Water Usage (liters)',
                    data: [this.stats.water, 243, 144],
                    backgroundColor: [gradYou, gradGlobal, gradEU],
                    hoverBackgroundColor: [gradYouHover, gradGlobalHover, gradEUHover],
                    borderColor: ['#0891B2', '#2563EB', '#7C3AED'],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff',
                    borderRadius: 12,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {display: false},
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 14,
                        cornerRadius: 10,
                        titleFont: {size: 14, family: 'system-ui', weight: 'bold'},
                        bodyFont: {size: 13, family: 'system-ui'},
                        displayColors: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        usePointStyle: true,
                        callbacks: {label: (c: any) => `${c.parsed.y} Liters`}
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)',
                            tickLength: 0
                        },
                        border: {display: false},
                        ticks: {
                            font: {size: 11, family: 'system-ui'},
                            color: '#64748b',
                            padding: 10
                        }
                    },
                    x: {
                        grid: {display: false},
                        border: {display: false},
                        ticks: {
                            font: {size: 12, weight: 'bold', family: 'system-ui'},
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }

    createElectricityChart(): void {
        const ctx = this.electricityChartRef.nativeElement.getContext('2d');
        if (!ctx) return;

        // You - Amber
        const gradYou = ctx.createLinearGradient(0, 0, 0, 400);
        gradYou.addColorStop(0, '#FBBF24');
        gradYou.addColorStop(1, '#D97706');

        // Global - Blue
        const gradGlobal = ctx.createLinearGradient(0, 0, 0, 400);
        gradGlobal.addColorStop(0, '#60A5FA');
        gradGlobal.addColorStop(1, '#2563EB');

        // EU - Violet
        const gradEU = ctx.createLinearGradient(0, 0, 0, 400);
        gradEU.addColorStop(0, '#A78BFA');
        gradEU.addColorStop(1, '#7C3AED');

        // Hover Gradients
        const gradYouHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradYouHover.addColorStop(0, '#FCD34D');
        gradYouHover.addColorStop(1, '#F59E0B');

        const gradGlobalHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradGlobalHover.addColorStop(0, '#93C5FD');
        gradGlobalHover.addColorStop(1, '#3B82F6');

        const gradEUHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradEUHover.addColorStop(0, '#C4B5FD');
        gradEUHover.addColorStop(1, '#8B5CF6');

        this.electricityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['You', 'Global Avg', 'EU Avg'],
                datasets: [{
                    label: 'Electricity Usage (kWh)',
                    data: [this.stats.electricity, 9.6, 11],
                    backgroundColor: [gradYou, gradGlobal, gradEU],
                    hoverBackgroundColor: [gradYouHover, gradGlobalHover, gradEUHover],
                    borderColor: ['#D97706', '#2563EB', '#7C3AED'],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff',
                    borderRadius: 12,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {display: false},
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 14,
                        cornerRadius: 10,
                        titleFont: {size: 14, family: 'system-ui', weight: 'bold'},
                        bodyFont: {size: 13, family: 'system-ui'},
                        displayColors: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        usePointStyle: true,
                        callbacks: {label: (c: any) => `${c.parsed.y} kWh`}
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)',
                            tickLength: 0
                        },
                        border: {display: false},
                        ticks: {
                            font: {size: 11, family: 'system-ui'},
                            color: '#64748b',
                            padding: 10
                        }
                    },
                    x: {
                        grid: {display: false},
                        border: {display: false},
                        ticks: {
                            font: {size: 12, weight: 'bold', family: 'system-ui'},
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }

    updateCharts(): void {
        // Calculate the multiplier based on selected range
        // Daily averages need to be scaled to weekly/monthly for fair comparison
        const daysInPeriod = this.getDaysInPeriod();

        // Daily averages (per person per day)
        const dailyAvgCo2Global = 12.3;   // kg
        const dailyAvgCo2EU = 18.6;       // kg
        const dailyAvgWaterGlobal = 243;  // liters
        const dailyAvgWaterEU = 144;      // liters
        const dailyAvgElecGlobal = 9.6;   // kWh
        const dailyAvgElecEU = 11;        // kWh

        // Scale averages to match the period
        const scaledCo2Global = dailyAvgCo2Global * daysInPeriod;
        const scaledCo2EU = dailyAvgCo2EU * daysInPeriod;
        const scaledWaterGlobal = dailyAvgWaterGlobal * daysInPeriod;
        const scaledWaterEU = dailyAvgWaterEU * daysInPeriod;
        const scaledElecGlobal = dailyAvgElecGlobal * daysInPeriod;
        const scaledElecEU = dailyAvgElecEU * daysInPeriod;

        if (this.co2Chart) {
            this.co2Chart.data.datasets[0].data = [this.stats.co2, scaledCo2Global, scaledCo2EU];
            this.co2Chart.update();
        }

        if (this.waterChart) {
            this.waterChart.data.datasets[0].data = [this.stats.water, scaledWaterGlobal, scaledWaterEU];
            this.waterChart.update();
        }

        if (this.electricityChart) {
            this.electricityChart.data.datasets[0].data = [this.stats.electricity, scaledElecGlobal, scaledElecEU];
            this.electricityChart.update();
        }
    }

    getDaysInPeriod(): number {
        switch (this.selectedRange) {
            case 'week':
                return 7;
            case 'month':
                return 30;
            default:
                return 1; // today
        }
    }

    getSmileyStatus(value: number, type: 'co2' | 'water' | 'electricity'): SmileyStatus {
        // Daily thresholds (base values)
        const dailyThresholds = {
            co2: 12.3,
            water: 243,
            electricity: 9.6
        };

        // Scale threshold by the period
        const daysInPeriod = this.getDaysInPeriod();
        const avg = dailyThresholds[type] * daysInPeriod;

        // Good: < 90% of average
        if (value < avg * 0.9) return 'good';
        // Bad: > 110% of average
        if (value > avg * 1.1) return 'bad';
        // Neutral: within +/- 10% of average
        return 'neutral';
    }

    // Guest mode methods
  startTracking(): void {
    this.router.navigate(['/activities']);
  }

  handleGuestAction(feature: string): boolean {
    if (this.isGuest) {
      this.showRegisterPrompt(`Access ${feature}`);
      return true;
    }
    return false;
  }

  showRegisterPrompt(message: string): void {
    this.promptTitle = message;
    this.showPrompt = true;
  }

  goToRegister(): void {
    this.showPrompt = false;
    this.authService.register();
  }

  goToLogin(): void {
    this.showPrompt = false;
    this.authService.login();
  }
}
