import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User, Stats } from '../models/models';
import { Chart, registerables } from 'chart.js';
import { format, subDays, startOfDay } from 'date-fns';
import { EcoSmileyComponent, SmileyStatus } from '../components/eco-smiley.component';

Chart.register(...registerables);

@Component({
  selector: 'app-friend-detail',
  standalone: true,
  imports: [CommonModule, EcoSmileyComponent],
  template: `
    <div class="friend-detail-container">
      <div class="friend-header" *ngIf="friend">
        <button class="back-btn" (click)="goBack()">← Back to Friends</button>
        <div class="friend-info">
          <div 
            class="friend-avatar"
            *ngIf="!friend.profileImageUrl"
            [style.background-color]="friend.avatarColor">
            {{ friend.fullName.charAt(0) || friend.email.charAt(0) }}
          </div>
          <img 
            *ngIf="friend.profileImageUrl"
            [src]="getProfileImageUrl(friend.profileImageUrl)"
            class="friend-avatar-img"
            alt="Profile">
          <div>
            <h1>{{ friend.fullName || 'User' }}</h1>
            <p>{{ '@' + friend.username }}</p>
            <div class="badges" *ngIf="friend.hasSolarPanels || friend.hasHeatPump">
              <span *ngIf="friend.hasSolarPanels" class="badge solar">☀️ Solar Panels</span>
              <span *ngIf="friend.hasHeatPump" class="badge heat">🌡️ Heat Pump</span>
            </div>
            <p *ngIf="friend.biography" class="bio">{{ friend.biography }}</p>
          </div>
        </div>
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
      <div class="stats-grid" *ngIf="friend">
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
      </div>

      <!-- Comparison Charts -->
      <div class="comparison-section">
        <h2>Environmental Impact Comparison</h2>
        <p class="comparison-note">Comparing {{ friend?.fullName || 'user' }}'s {{ selectedRange === 'today' ? 'daily' : (selectedRange === 'week' ? 'weekly' : 'monthly') }} impact with global daily averages</p>
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
    </div>
  `,
  styles: [`
    .friend-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .friend-header {
      margin-bottom: 2rem;
    }

    .back-btn {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      margin-bottom: 1rem;
      transition: background 0.3s;
    }

    .back-btn:hover {
      background: #e5e7eb;
    }

    .friend-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .friend-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: white;
      font-weight: bold;
      flex-shrink: 0;
    }

    .friend-avatar-img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .friend-info h1 {
      font-size: 2rem;
      margin-bottom: 0.25rem;
      color: #111827;
    }

    .friend-info p {
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .bio {
      margin-top: 0.5rem;
      font-style: italic;
    }

    .badges {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
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

    .comparison-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .comparison-section h2 {
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
      text-align: center;
    }

    .chart-card canvas {
      max-height: 300px;
    }

    @media (max-width: 768px) {
      .friend-info {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FriendDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('co2Chart') co2ChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('waterChart') waterChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('electricityChart') electricityChartRef!: ElementRef<HTMLCanvasElement>;

  friend: User | null = null;
  stats: Stats = { co2: 0, water: 0, electricity: 0 };
  selectedRange = 'today';

  private co2Chart?: Chart;
  private waterChart?: Chart;
  private electricityChart?: Chart;

  dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const friendId = this.route.snapshot.paramMap.get('id');
    if (friendId) {
      this.loadFriend(Number(friendId));
    }
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  loadFriend(friendId: number): void {
    this.userService.getUserById(friendId).subscribe({
      next: (user) => {
        this.friend = user;
        this.loadStats();
      },
      error: (error) => console.error('Error loading friend:', error)
    });
  }

  loadStats(): void {
    if (!this.friend) return;

    const { startDate, endDate } = this.getDateRange();

    this.userService.getUserStats(this.friend.id, startDate, endDate).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateCharts();
      },
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  setDateRange(range: string): void {
    this.selectedRange = range;
    this.loadStats();
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

  goBack(): void {
    this.router.navigate(['/friends']);
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
        labels: [this.friend?.fullName || 'Friend', 'Global Avg', 'EU Avg'],
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
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 14,
            cornerRadius: 10,
            titleFont: { size: 14, family: 'system-ui', weight: 'bold' },
            bodyFont: { size: 13, family: 'system-ui' },
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            callbacks: { label: (c: any) => `${c.parsed.y} kg CO₂` }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)',
              tickLength: 0
            },
            border: { display: false },
            ticks: {
              font: { size: 11, family: 'system-ui' },
              color: '#64748b',
              padding: 10
            }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 12, weight: 'bold', family: 'system-ui' },
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
        labels: [this.friend?.fullName || 'Friend', 'Global Avg', 'EU Avg'],
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
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 14,
            cornerRadius: 10,
            titleFont: { size: 14, family: 'system-ui', weight: 'bold' },
            bodyFont: { size: 13, family: 'system-ui' },
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            callbacks: { label: (c: any) => `${c.parsed.y} Liters` }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)',
              tickLength: 0
            },
            border: { display: false },
            ticks: {
              font: { size: 11, family: 'system-ui' },
              color: '#64748b',
              padding: 10
            }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 12, weight: 'bold', family: 'system-ui' },
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
        labels: [this.friend?.fullName || 'Friend', 'Global Avg', 'EU Avg'],
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
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 14,
            cornerRadius: 10,
            titleFont: { size: 14, family: 'system-ui', weight: 'bold' },
            bodyFont: { size: 13, family: 'system-ui' },
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            callbacks: { label: (c: any) => `${c.parsed.y} kWh` }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)',
              tickLength: 0
            },
            border: { display: false },
            ticks: {
              font: { size: 11, family: 'system-ui' },
              color: '#64748b',
              padding: 10
            }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 12, weight: 'bold', family: 'system-ui' },
              color: '#334155'
            }
          }
        }
      }
    });
  }

  updateCharts(): void {
    if (this.co2Chart) {
      this.co2Chart.data.datasets[0].data = [this.stats.co2, 12.3, 18.6];
      this.co2Chart.data.labels = [this.friend?.fullName || 'Friend', 'Global Average', 'EU Average'];
      this.co2Chart.update();
    }

    if (this.waterChart) {
      this.waterChart.data.datasets[0].data = [this.stats.water, 243, 144];
      this.waterChart.data.labels = [this.friend?.fullName || 'Friend', 'Global Average', 'EU Average'];
      this.waterChart.update();
    }

    if (this.electricityChart) {
      this.electricityChart.data.datasets[0].data = [this.stats.electricity, 9.6, 11];
      this.electricityChart.data.labels = [this.friend?.fullName || 'Friend', 'Global Average', 'EU Average'];
      this.electricityChart.update();
    }
  }

  getSmileyStatus(value: number, type: 'co2' | 'water' | 'electricity'): SmileyStatus {
    // Thresholds based on global averages
    const thresholds = {
      co2: 12.3,
      water: 243,
      electricity: 9.6
    };

    const avg = thresholds[type];
    
    // Good: < 90% of average
    if (value < avg * 0.9) return 'good';
    // Bad: > 110% of average
    if (value > avg * 1.1) return 'bad';
    // Neutral: within +/- 10% of average
    return 'neutral';
  }

  getProfileImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  }
}
