import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserActivityService } from '../services/user-activity.service';
import { User, Stats, UserActivity } from '../models/models';
import { format, subDays, startOfDay } from 'date-fns';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Welcome back, Eco Warrior! 🌱</h1>
        <p>Here's your environmental impact summary</p>
      </div>

      <!-- Date Range Selector -->
      <div class="date-selector">
        <button 
          *ngFor="let range of dateRanges" 
          [class.active]="selectedRange === range.value"
          (click)="setDateRange(range.value)"
          class="date-btn">
          {{ range.label }}
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div *ngIf="isLoading" class="loading-state">Loading your data...</div>
        <ng-container *ngIf="!isLoading">
        <div class="stat-card co2">
          <div class="stat-icon">🌍</div>
          <div class="stat-content">
            <h3>CO₂ Emissions</h3>
            <div class="stat-value">{{ stats.co2.toFixed(1) }}</div>
            <span class="stat-unit">kg</span>
          </div>
        </div>

        <div class="stat-card water">
          <div class="stat-icon">💧</div>
          <div class="stat-content">
            <h3>Water Usage</h3>
            <div class="stat-value">{{ stats.water.toFixed(0) }}</div>
            <span class="stat-unit">liters</span>
          </div>
        </div>

        <div class="stat-card electricity">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <h3>Electricity</h3>
            <div class="stat-value">{{ stats.electricity.toFixed(1) }}</div>
            <span class="stat-unit">kWh</span>
          </div>
        </div>
        </ng-container>
      </div>

      <!-- Comparison -->
      <div class="comparison-section">
        <h2>Your Impact vs Averages</h2>
        <div class="comparison-grid">
          <div class="comparison-card">
            <h3>Global Average (Daily)</h3>
            <div class="comparison-items">
              <div class="comparison-item">
                <span>CO₂:</span>
                <span [class.better]="stats.co2 < 12.3" [class.worse]="stats.co2 >= 12.3">
                  {{ getPercentageDiff(stats.co2, 12.3) }}%
                </span>
              </div>
              <div class="comparison-item">
                <span>Water:</span>
                <span [class.better]="stats.water < 243" [class.worse]="stats.water >= 243">
                  {{ getPercentageDiff(stats.water, 243) }}%
                </span>
              </div>
              <div class="comparison-item">
                <span>Electricity:</span>
                <span [class.better]="stats.electricity < 9.6" [class.worse]="stats.electricity >= 9.6">
                  {{ getPercentageDiff(stats.electricity, 9.6) }}%
                </span>
              </div>
            </div>
          </div>

          <div class="comparison-card">
            <h3>EU Average (Daily)</h3>
            <div class="comparison-items">
              <div class="comparison-item">
                <span>CO₂:</span>
                <span [class.better]="stats.co2 < 18.6" [class.worse]="stats.co2 >= 18.6">
                  {{ getPercentageDiff(stats.co2, 18.6) }}%
                </span>
              </div>
              <div class="comparison-item">
                <span>Water:</span>
                <span [class.better]="stats.water < 144" [class.worse]="stats.water >= 144">
                  {{ getPercentageDiff(stats.water, 144) }}%
                </span>
              </div>
              <div class="comparison-item">
                <span>Electricity:</span>
                <span [class.better]="stats.electricity < 11" [class.worse]="stats.electricity >= 11">
                  {{ getPercentageDiff(stats.electricity, 11) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="recent-activities">
        <h2>Recent Activities</h2>
        <div class="activities-list" *ngIf="recentActivities.length > 0; else noActivities">
          <div *ngFor="let activity of recentActivities" class="activity-item">
            <div class="activity-info">
              <h4>{{ activity.activityName }}</h4>
              <p>{{ activity.quantity }} {{ activity.unit }} • {{ formatDate(activity.date) }}</p>
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
        <ng-template #noActivities>
          <p class="no-data">No activities logged yet. Start tracking your impact!</p>
        </ng-template>
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
      margin-bottom: 1.5rem;
      color: #111827;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .comparison-card {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 0.5rem;
    }

    .comparison-card h3 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
      color: #374151;
    }

    .comparison-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .comparison-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .comparison-item span:last-child {
      font-weight: bold;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
    }

    .comparison-item .better {
      background: #d1fae5;
      color: #065f46;
    }

    .comparison-item .worse {
      background: #fee2e2;
      color: #991b1b;
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
export class DashboardComponent implements OnInit {
  user: User | null = null;
  stats: Stats = { co2: 0, water: 0, electricity: 0 };
  recentActivities: UserActivity[] = [];
  selectedRange = 'today';
  isLoading = true;

  dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ];

  constructor(
    private authService: AuthService,
    private userActivityService: UserActivityService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.loadData();
    }
  }

  setDateRange(range: string): void {
    this.selectedRange = range;
    this.loadData();
  }

  loadData(): void {
    if (!this.user) return;

    this.isLoading = true;
    const { startDate, endDate } = this.getDateRange();

    // Load stats and activities in parallel
    forkJoin({
      stats: this.userActivityService.getUserStats(startDate, endDate),
      activities: this.userActivityService.getUserActivitiesByDateRange(startDate, endDate)
    }).subscribe({
      next: (result) => {
        this.stats = result.stats;
        this.recentActivities = result.activities.slice(0, 10);
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
}
