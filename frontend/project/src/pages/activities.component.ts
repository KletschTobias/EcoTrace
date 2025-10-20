import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ActivityService } from '../services/activity.service';
import { UserActivityService } from '../services/user-activity.service';
import { User, Activity, UserActivity, CreateUserActivityRequest } from '../models/models';
import { format } from 'date-fns';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="activities-container">
      <div class="activities-header">
        <div>
          <h1>Track Your Activities</h1>
          <p>Log your daily actions and see their environmental impact</p>
        </div>
        <button class="btn-primary" (click)="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ Log Activity' }}
        </button>
      </div>

      <!-- Activity Form -->
      <div *ngIf="showForm" class="activity-form">
        <h2>Log New Activity</h2>
        <form (ngSubmit)="submitActivity()">
          <div class="form-group">
            <label>Search Activity</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              name="searchTerm"
              (input)="filterActivities()"
              (focus)="showDropdown = true"
              placeholder="Type to search activities..."
              class="form-control">
            
            <div *ngIf="showDropdown && filteredActivities.length > 0" class="activities-dropdown">
              <div 
                *ngFor="let activity of filteredActivities"
                (click)="selectActivity(activity)"
                class="activity-option">
                <div>
                  <strong>{{ activity.name }}</strong>
                  <span class="category-badge">{{ activity.category }}</span>
                </div>
                <small>{{ activity.description }}</small>
              </div>
            </div>
          </div>

          <div *ngIf="selectedActivity" class="selected-activity">
            <h3>{{ selectedActivity.name }}</h3>
            <p>{{ selectedActivity.description }}</p>
            
            <div class="form-row">
              <div class="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  [(ngModel)]="quantity"
                  name="quantity"
                  min="0.1"
                  step="0.1"
                  class="form-control"
                  required>
                <small>Unit: {{ selectedActivity.unit }}</small>
              </div>

              <div class="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  [(ngModel)]="date"
                  name="date"
                  class="form-control"
                  required>
              </div>
            </div>

            <div class="impact-preview">
              <h4>Estimated Impact:</h4>
              <div class="impacts">
                <span *ngIf="selectedActivity.co2PerUnit > 0" class="impact co2">
                  {{ (selectedActivity.co2PerUnit * quantity).toFixed(2) }} kg CO₂
                </span>
                <span *ngIf="selectedActivity.waterPerUnit > 0" class="impact water">
                  {{ (selectedActivity.waterPerUnit * quantity).toFixed(0) }} L Water
                </span>
                <span *ngIf="selectedActivity.electricityPerUnit > 0" class="impact electricity">
                  {{ (selectedActivity.electricityPerUnit * quantity).toFixed(2) }} kWh
                </span>
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save Activity' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Category Filter -->
      <div class="category-filter">
        <button 
          *ngFor="let cat of categories"
          [class.active]="selectedCategory === cat.value"
          (click)="filterByCategory(cat.value)"
          class="category-btn">
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>

      <!-- Activities List -->
      <div class="activities-list">
        <h2>Your Activities</h2>
        <div *ngIf="userActivities.length > 0; else noActivities" class="activity-cards">
          <div *ngFor="let activity of userActivities" class="activity-card">
            <div class="activity-main">
              <div>
                <h3>{{ activity.activityName }}</h3>
                <p>{{ activity.quantity }} {{ activity.unit }} • {{ formatDate(activity.date) }}</p>
              </div>
              <button class="btn-delete" (click)="deleteActivity(activity.id)">🗑️</button>
            </div>
            <div class="activity-impacts">
              <span *ngIf="activity.co2Impact > 0" class="impact co2">
                {{ activity.co2Impact.toFixed(1) }} kg CO₂
              </span>
              <span *ngIf="activity.waterImpact > 0" class="impact water">
                {{ activity.waterImpact.toFixed(0) }} L
              </span>
              <span *ngIf="activity.electricityImpact > 0" class="impact electricity">
                {{ activity.electricityImpact.toFixed(1) }} kWh
              </span>
            </div>
          </div>
        </div>
        <ng-template #noActivities>
          <p class="no-data">No activities logged yet. Click "Log Activity" to get started!</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .activities-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .activities-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .activities-header h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .activity-form {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .activity-form h2 {
      margin-bottom: 1.5rem;
      color: #111827;
    }

    .form-group {
      margin-bottom: 1.5rem;
      position: relative;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #10B981;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .activities-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 2px solid #10B981;
      border-top: none;
      border-radius: 0 0 0.5rem 0.5rem;
      max-height: 300px;
      overflow-y: auto;
      z-index: 10;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .activity-option {
      padding: 1rem;
      cursor: pointer;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.2s;
    }

    .activity-option:hover {
      background: #f9fafb;
    }

    .activity-option strong {
      color: #111827;
      margin-right: 0.5rem;
    }

    .category-badge {
      background: #dbeafe;
      color: #1e40af;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      text-transform: capitalize;
    }

    .selected-activity {
      background: #f0fdf4;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
    }

    .selected-activity h3 {
      color: #065f46;
      margin-bottom: 0.5rem;
    }

    .impact-preview {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }

    .impact-preview h4 {
      margin-bottom: 0.75rem;
      color: #374151;
    }

    .impacts {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .impact {
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      font-weight: 600;
      font-size: 0.875rem;
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

    .btn-submit {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .category-filter {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 2rem;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .category-btn:hover {
      border-color: #10B981;
    }

    .category-btn.active {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border-color: transparent;
    }

    .activities-list {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .activities-list h2 {
      margin-bottom: 1.5rem;
      color: #111827;
    }

    .activity-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-card {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 0.5rem;
      transition: transform 0.2s;
    }

    .activity-card:hover {
      transform: translateX(4px);
    }

    .activity-main {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .activity-main h3 {
      font-size: 1.125rem;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .activity-main p {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .btn-delete {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .btn-delete:hover {
      opacity: 1;
    }

    .activity-impacts {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .no-data {
      text-align: center;
      color: #6b7280;
      padding: 3rem;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .activities-container {
        padding: 1rem;
      }

      .activities-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ActivitiesComponent implements OnInit {
  user: User | null = null;
  activities: Activity[] = [];
  userActivities: UserActivity[] = [];
  filteredActivities: Activity[] = [];
  
  showForm = false;
  showDropdown = false;
  selectedActivity: Activity | null = null;
  searchTerm = '';
  quantity = 1;
  date = format(new Date(), 'yyyy-MM-dd');
  selectedCategory = 'all';
  isSubmitting = false;

  categories = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'home', label: 'Home', icon: '🏠' },
    { value: 'food', label: 'Food', icon: '🍽️' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'other', label: 'Other', icon: '♻️' }
  ];

  constructor(
    private authService: AuthService,
    private activityService: ActivityService,
    private userActivityService: UserActivityService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.loadActivities();
      this.loadUserActivities();
    }
  }

  loadActivities(): void {
    this.activityService.getAllActivities().subscribe({
      next: (activities: Activity[]) => {
        this.activities = activities;
        this.filteredActivities = activities;
      },
      error: (error: any) => console.error('Error loading activities:', error)
    });
  }

  loadUserActivities(): void {
    if (!this.user) return;

    if (this.selectedCategory === 'all') {
      this.userActivityService.getUserActivities(this.user.id).subscribe({
        next: (activities: UserActivity[]) => {
          this.userActivities = activities;
        },
        error: (error: any) => console.error('Error loading user activities:', error)
      });
    } else {
      this.userActivityService.getUserActivitiesByCategory(this.user.id, this.selectedCategory).subscribe({
        next: (activities: UserActivity[]) => {
          this.userActivities = activities;
        },
        error: (error: any) => console.error('Error loading user activities:', error)
      });
    }
  }

  filterActivities(): void {
    if (!this.searchTerm) {
      this.filteredActivities = this.activities;
    } else {
      this.filteredActivities = this.activities.filter(a =>
        a.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectActivity(activity: Activity): void {
    this.selectedActivity = activity;
    this.searchTerm = activity.name;
    this.showDropdown = false;
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.loadUserActivities();
  }

  submitActivity(): void {
    if (!this.user || !this.selectedActivity) return;

    this.isSubmitting = true;
    const request: CreateUserActivityRequest = {
      activityName: this.selectedActivity.name,
      category: this.selectedActivity.category,
      quantity: this.quantity,
      unit: this.selectedActivity.unit,
      co2Impact: this.selectedActivity.co2PerUnit * this.quantity,
      waterImpact: this.selectedActivity.waterPerUnit * this.quantity,
      electricityImpact: this.selectedActivity.electricityPerUnit * this.quantity,
      date: this.date
    };

    this.userActivityService.createUserActivity(this.user.id, request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showForm = false;
        this.resetForm();
        this.loadUserActivities();
        
        // Update user totals
        if (this.user) {
          this.authService.updateUser(this.user.id, {
            totalCo2: (this.user.totalCo2 || 0) + (request.co2Impact || 0),
            totalWater: (this.user.totalWater || 0) + (request.waterImpact || 0),
            totalElectricity: (this.user.totalElectricity || 0) + (request.electricityImpact || 0)
          } as any).subscribe();
        }
      },
      error: (error: any) => {
        console.error('Error creating activity:', error);
        this.isSubmitting = false;
      }
    });
  }

  deleteActivity(activityId: number): void {
    if (!this.user || !confirm('Delete this activity?')) return;

    this.userActivityService.deleteUserActivity(this.user.id, activityId).subscribe({
      next: () => {
        this.loadUserActivities();
      },
      error: (error: any) => console.error('Error deleting activity:', error)
    });
  }

  resetForm(): void {
    this.selectedActivity = null;
    this.searchTerm = '';
    this.quantity = 1;
    this.date = format(new Date(), 'yyyy-MM-dd');
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'MMM dd, yyyy');
  }
}
