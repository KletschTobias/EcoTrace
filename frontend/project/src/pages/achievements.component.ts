import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Achievement } from '../models/models';
import { AchievementService } from '../services/achievement.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="achievements-page">
      <div class="header">
        <h1>🏆 Your Achievements</h1>
        <p class="subtitle">Unlock achievements by taking eco-friendly actions!</p>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">{{unlockedCount}}</div>
            <div class="stat-label">Unlocked</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{totalPoints}}</div>
            <div class="stat-label">Total Points</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{Math.round((unlockedCount / achievements.length) * 100)}}%</div>
            <div class="stat-label">Completion</div>
          </div>
        </div>
      </div>

      <div class="category-tabs">
        <button 
          *ngFor="let cat of categories" 
          [class.active]="selectedCategory === cat"
          (click)="selectedCategory = cat"
          class="tab-btn">
          {{cat}}
        </button>
      </div>

      <div class="achievements-grid">
        <div 
          *ngFor="let achievement of filteredAchievements" 
          class="achievement-card"
          [class.unlocked]="achievement.isUnlocked"
          [class.locked]="!achievement.isUnlocked"
          [class.new]="achievement.isNew">
          
          <div class="badge" [style.background]="achievement.isUnlocked ? achievement.badgeColor : '#374151'">
            <div class="icon">{{achievement.icon}}</div>
            <div *ngIf="achievement.isNew" class="new-badge">NEW!</div>
          </div>

          <div class="content">
            <h3>{{achievement.name}}</h3>
            <p class="description">{{achievement.description}}</p>
            
            <div class="progress-section" *ngIf="!achievement.isUnlocked">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="achievement.progress"></div>
              </div>
              <div class="progress-text">{{achievement.progress}}% Complete</div>
            </div>

            <div class="unlocked-info" *ngIf="achievement.isUnlocked">
              <span class="unlock-date">✓ Unlocked {{formatDate(achievement.unlockedAt)}}</span>
              <span class="points">+{{achievement.points}} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .achievements-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 1.125rem;
      color: #6b7280;
      margin-bottom: 2rem;
    }

    .stats {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .stat-card {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 1.5rem 2.5rem;
      border-radius: 1rem;
      color: white;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .category-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .tab-btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      color: #6b7280;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      border-color: #10b981;
      color: #10b981;
    }

    .tab-btn.active {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .achievement-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1rem;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .achievement-card.unlocked {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .achievement-card.unlocked:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }

    .achievement-card.locked {
      opacity: 0.6;
    }

    .achievement-card.new::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #ef4444);
    }

    .badge {
      width: 80px;
      height: 80px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .icon {
      font-size: 2.5rem;
    }

    .new-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ef4444;
      color: white;
      font-size: 0.625rem;
      font-weight: 800;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .content {
      flex: 1;
    }

    .content h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .description {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .progress-section {
      margin-top: 1rem;
    }

    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      transition: width 0.3s;
    }

    .progress-text {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: right;
    }

    .unlocked-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .unlock-date {
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 600;
    }

    .points {
      font-size: 0.875rem;
      color: #f59e0b;
      font-weight: 700;
    }
  `]
})
export class AchievementsComponent implements OnInit {
  achievements: Achievement[] = [];
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'MILESTONE', 'ACTIVITY', 'STREAK', 'SOCIAL', 'CO2_REDUCTION'];
  Math = Math;

  constructor(
    private achievementService: AchievementService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAchievements();
  }

  loadAchievements() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.achievementService.getUserAchievements(currentUser.id).subscribe({
        next: (achievements) => {
          this.achievements = achievements;
        },
        error: (error) => console.error('Error loading achievements:', error)
      });
    }
  }

  get filteredAchievements(): Achievement[] {
    if (this.selectedCategory === 'All') {
      return this.achievements;
    }
    return this.achievements.filter(a => a.category === this.selectedCategory);
  }

  get unlockedCount(): number {
    return this.achievements.filter(a => a.isUnlocked).length;
  }

  get totalPoints(): number {
    return this.achievements
      .filter(a => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
