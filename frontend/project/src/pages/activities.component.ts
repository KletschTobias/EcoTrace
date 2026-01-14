import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { GuestService } from '../services/guest.service';
import { ActivityService } from '../services/activity.service';
import { UserActivityService } from '../services/user-activity.service';
import { GuestActivityStoreService } from '../services/guest-activity-store.service';
import { User, Activity, UserActivity, CreateUserActivityRequest } from '../models/models';
import { format } from 'date-fns';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="activities-container">
      <!-- Loading Spinner -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading activities...</p>
      </div>

      <div *ngIf="!isLoading" class="activities-content">
      <div class="activities-header">
        <div>
          <h1>Track Your Activities</h1>
          <p>Log your daily actions and see their environmental impact</p>
        </div>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm ? 'Cancel' : '+ Log Activity' }}
        </button>
      </div>
      
      <!-- Guest Info Banner -->
      <div *ngIf="isGuest" class="guest-info-banner">
        <span class="info-icon">ℹ️</span>
        <span>Preview mode - your activities won't be saved after refresh</span>
        <button class="btn-sign-up" (click)="goToRegister()">Sign up to save</button>
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
              {{ isSubmitting ? 'Adding...' : (isGuest ? '👁️ Preview Impact' : 'Save Activity') }}
            </button>
            
            <p *ngIf="isGuest" class="guest-note">
              <strong>Preview only</strong> - Sign up to permanently save your activities!
            </p>
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

      <!-- Guest Preview Activities (NOT blurred) -->
      <div *ngIf="isGuest && guestActivities.length > 0" class="activities-list guest-preview-list">
        <h2>Your Preview Activities</h2>
        <p class="preview-note">These activities are temporary and will disappear on refresh</p>
        <div class="activity-cards">
          <div *ngFor="let activity of guestActivities" class="activity-card">
            <div class="activity-main">
              <div>
                <h3>{{ activity.activityName }}</h3>
                <p>{{ activity.quantity }} {{ activity.unit }} - {{ formatDate(activity.date) }}</p>
              </div>
              <button class="btn-delete" (click)="removeGuestActivity(activity.id)">X</button>
            </div>
            <div class="activity-impacts">
              <span *ngIf="activity.co2Impact > 0" class="impact co2">{{ activity.co2Impact.toFixed(1) }} kg CO2</span>
              <span *ngIf="activity.waterImpact > 0" class="impact water">{{ activity.waterImpact.toFixed(0) }} L</span>
              <span *ngIf="activity.electricityImpact > 0" class="impact electricity">{{ activity.electricityImpact.toFixed(1) }} kWh</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activities List -->
      <div class="activities-list-wrapper">
        <!-- Logged-in User Activities -->
        <div *ngIf="!isGuest" class="activities-list">
          <h2>Your Activities</h2>
          <div *ngIf="userActivities.length > 0" class="activity-cards">
            <div *ngFor="let activity of userActivities" class="activity-card">
              <div class="activity-main">
                <div>
                  <h3>{{ activity.activityName }}</h3>
                  <p>{{ activity.quantity }} {{ activity.unit }} - {{ formatDate(activity.date) }}</p>
                </div>
                <button class="btn-delete" (click)="deleteActivity(activity.id)">X</button>
              </div>
              <div class="activity-impacts">
                <span *ngIf="activity.co2Impact > 0" class="impact co2">{{ activity.co2Impact.toFixed(1) }} kg CO2</span>
                <span *ngIf="activity.waterImpact > 0" class="impact water">{{ activity.waterImpact.toFixed(0) }} L</span>
                <span *ngIf="activity.electricityImpact > 0" class="impact electricity">{{ activity.electricityImpact.toFixed(1) }} kWh</span>
              </div>
            </div>
          </div>
          <p *ngIf="userActivities.length === 0" class="no-data">No activities logged yet. Click "Log Activity" to get started!</p>
        </div>
        
        <!-- Guest: Blurred sample with overlay -->
        <div *ngIf="isGuest" class="activities-list blurred">
          <h2>Saved Activities</h2>
          <div class="activity-cards sample-activities">
            <div class="activity-card">
              <div class="activity-main"><div><h3>Car Commute</h3><p>25 km - Today</p></div></div>
              <div class="activity-impacts"><span class="impact co2">4.2 kg CO2</span></div>
            </div>
            <div class="activity-card">
              <div class="activity-main"><div><h3>Hot Shower</h3><p>10 min - Today</p></div></div>
              <div class="activity-impacts"><span class="impact water">80 L</span></div>
            </div>
          </div>
        </div>
        
        <!-- Guest Overlay -->
        <div *ngIf="isGuest" class="locked-overlay" (click)="goToRegister()">
          <span class="lock-text">🔒 Log in to save your activities</span>
        </div>
      </div>
      </div>
    </div>
  `,
  styles: [`
    .activities-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Guest Info Banner */
    .guest-info-banner {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 1px solid #f59e0b;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .guest-info-banner .info-icon {
      font-size: 1.25rem;
    }

    .guest-info-banner span {
      color: #92400e;
      font-weight: 500;
    }

    .guest-info-banner .btn-sign-up {
      margin-left: auto;
      padding: 0.5rem 1rem;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .guest-info-banner .btn-sign-up:hover {
      background: #d97706;
    }

    .guest-note {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 0.75rem;
      font-style: italic;
    }

    /* Guest Preview List */
    .guest-preview-list {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
      border: 2px solid #10B981;
    }

    .guest-preview-list h2 {
      color: #10B981;
      margin-bottom: 0.5rem;
    }

    .preview-note {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      font-style: italic;
    }

    /* Wrapper for positioning overlays */
    .activities-list-wrapper {
      position: relative;
    }

    /* Guest Mode Styles */
    .blurred {
      filter: blur(5px);
      pointer-events: none;
      user-select: none;
    }

    /* Locked Overlay */
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

    .locked-overlay .lock-text {
      font-weight: 600;
      color: #374151;
      font-size: 1rem;
    }

    .sample-activities {
      opacity: 0.7;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 1rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e5e7eb;
      border-top-color: #10B981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-container p {
      color: #6b7280;
      font-size: 1rem;
    }

    .activities-content {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
export class ActivitiesComponent implements OnInit, OnDestroy {
  user: User | null = null;
  activities: Activity[] = [];
  private guestSubscription?: Subscription;
  private userSubscription?: Subscription;
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

  // Guest mode
  isGuest = false;
  showPrompt = false;
  guestActivities: UserActivity[] = [];
  isLoading = true;

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
    private guestService: GuestService,
    private activityService: ActivityService,
    private userActivityService: UserActivityService,
    private guestActivityStore: GuestActivityStoreService
  ) {}

  ngOnInit(): void {
    this.isGuest = this.guestService.isGuest();
    this.user = this.authService.getCurrentUser();

    // Load all activities available
    this.loadActivities();

    // Subscribe to user changes - when user logs in, save guest activities to DB
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      
      if (user && !this.isGuest) {
        // USER JUST LOGGED IN - check if this was a signup or login
        console.log('[Activities] User logged in, checking for pending guest activities...');
        
        const isSignup = sessionStorage.getItem('isSignup') === 'true';
        const savedActivities = sessionStorage.getItem('guestActivities');
        
        if (isSignup && savedActivities) {
          // This was a SIGNUP - save guest activities to DB
          try {
            const pendingActivities = JSON.parse(savedActivities);
            if (pendingActivities.length > 0) {
              console.log('[Activities] Signup detected! Saving ' + pendingActivities.length + ' guest activities to database...');
              this.saveGuestActivitiesFromService(pendingActivities);
            }
          } catch (e) {
            console.error('[Activities] Failed to parse guest activities from sessionStorage');
          }
        } else if (!isSignup && savedActivities) {
          // This was a LOGIN - just clear sessionStorage without saving
          console.log('[Activities] Login detected, clearing guest activities without saving');
          sessionStorage.removeItem('guestActivities');
        }
        
        // Clear signup flag
        sessionStorage.removeItem('isSignup');
        
        this.loadUserActivities();
      }
    });

    // Subscribe to guest mode changes
    this.guestSubscription = this.guestService.isGuestMode$.subscribe(isGuest => {
      console.log('[Activities] Guest mode changed:', isGuest);
      this.isGuest = isGuest;
    });

    if (this.user && !this.isGuest) {
      this.loadUserActivities();
    }
  }

  saveGuestActivitiesFromService(activitiesToSave: UserActivity[]): void {
    if (activitiesToSave.length === 0) {
      console.log('[Activities] No guest activities to save');
      return;
    }

    console.log('[Activities] Starting to save ' + activitiesToSave.length + ' guest activities...');
    
    activitiesToSave.forEach((activity, index) => {
      setTimeout(() => {
        const request: CreateUserActivityRequest = {
          activityName: activity.activityName,
          category: activity.category,
          quantity: activity.quantity,
          unit: activity.unit,
          co2Impact: activity.co2Impact,
          waterImpact: activity.waterImpact,
          electricityImpact: activity.electricityImpact,
          date: activity.date
        };

        this.userActivityService.createUserActivity(request).subscribe({
          next: () => {
            console.log('[Activities] ✅ Guest activity saved to DB: ' + activity.activityName);
            
            // After all activities are saved
            if (index === activitiesToSave.length - 1) {
              setTimeout(() => {
                console.log('[Activities] All guest activities saved, clearing service + sessionStorage...');
                this.guestActivityStore.clearActivities();
                sessionStorage.removeItem('guestActivities');
                this.loadUserActivities();
              }, 500);
            }
          },
          error: (error: any) => {
            console.error('[Activities] ❌ Failed to save guest activity:', error);
          }
        });
      }, index * 300); // 300ms delay between each
    });
  }

  ngOnDestroy(): void {
    this.guestSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  loadUserActivities(): void {
    if (!this.user || this.isGuest) {
      this.userActivities = [];
      return;
    }

    this.userActivityService.getUserActivities().subscribe({
      next: (activities: UserActivity[]) => {
        this.userActivities = activities;
      },
      error: (error: any) => {
        console.error('Error loading user activities:', error);
        this.userActivities = [];
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  goToRegister(): void {
    // Set flag that this is a signup (not login)
    sessionStorage.setItem('isSignup', 'true');
    this.authService.register();
  }

  goToLogin(): void {
    // Clear guest activities on login (user already has account)
    sessionStorage.removeItem('guestActivities');
    sessionStorage.removeItem('isSignup');
    this.authService.login();
  }

  loadActivities(): void {
    this.activityService.getAllActivities().subscribe({
      next: (activities: Activity[]) => {
        this.activities = activities;
        this.filteredActivities = activities;
      },
      error: (error: any) => {
        console.error('Error loading activities:', error);
        this.activities = [];
        this.filteredActivities = [];
      }
    });

    // Subscribe to currentUser$ and load user activities
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.isLoading = false;
        return;
      }

      this.user = user;
      this.isLoading = true;

      // Check if user just registered (no activities created yet)
      const isNewUser = !user.totalCo2 && !user.totalWater && !user.totalElectricity;

      if (isNewUser) {
        // Neuer User nach Registration - zeige sofort leere Liste
        this.userActivities = [];
        this.isLoading = false;
        return;
      }

      // Load user activities
      this.userActivityService.getUserActivities().subscribe({
        next: (activities: UserActivity[]) => {
          this.userActivities = activities;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading user activities:', error);
          this.userActivities = [];
          this.isLoading = false;
        }
      });
    });
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

    if (this.selectedCategory === 'all') {
      this.userActivityService.getUserActivities().subscribe({
        next: (activities: UserActivity[]) => {
          this.userActivities = activities;
        },
        error: (error: any) => console.error('Error loading user activities:', error)
      });
    } else {
      this.userActivityService.getUserActivitiesByCategory(this.selectedCategory).subscribe({
        next: (activities: UserActivity[]) => {
          this.userActivities = activities;
        },
        error: (error: any) => console.error('Error loading user activities:', error)
      });
    }
  }

  submitActivity(): void {
    if (!this.selectedActivity) return;

    // Guest mode - add to temporary preview list and service
    if (this.isGuest) {
      const guestActivity: UserActivity = {
        id: Date.now(), // temporary ID
        userId: 0, // guest user
        activityName: this.selectedActivity.name,
        category: this.selectedActivity.category,
        quantity: this.quantity,
        unit: this.selectedActivity.unit,
        co2Impact: this.selectedActivity.co2PerUnit * this.quantity,
        waterImpact: this.selectedActivity.waterPerUnit * this.quantity,
        electricityImpact: this.selectedActivity.electricityPerUnit * this.quantity,
        date: this.date
      };
      this.guestActivities.unshift(guestActivity);
      
      // Save to service AND sessionStorage for signup redirect
      this.guestActivityStore.addActivity(guestActivity);
      sessionStorage.setItem('guestActivities', JSON.stringify(this.guestActivityStore.getActivities()));
      console.log('[Activities] Guest activity saved to service + sessionStorage');
      
      this.showForm = false;
      this.resetForm();
      return;
    }

    if (!this.user) return;

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

    this.userActivityService.createUserActivity(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showForm = false;
        this.resetForm();
        // Reload user activities
        if (this.selectedCategory === 'all') {
          this.userActivityService.getUserActivities().subscribe({
            next: (activities: UserActivity[]) => {
              this.userActivities = activities;
            },
            error: (error: any) => console.error('Error loading user activities:', error)
          });
        } else {
          this.userActivityService.getUserActivitiesByCategory(this.selectedCategory).subscribe({
            next: (activities: UserActivity[]) => {
              this.userActivities = activities;
            },
            error: (error: any) => console.error('Error loading user activities:', error)
          });
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

    this.userActivityService.deleteUserActivity(activityId).subscribe({
      next: () => {
        // Reload user activities
        if (this.selectedCategory === 'all') {
          this.userActivityService.getUserActivities().subscribe({
            next: (activities: UserActivity[]) => {
              this.userActivities = activities;
            },
            error: (error: any) => console.error('Error loading user activities:', error)
          });
        } else {
          this.userActivityService.getUserActivitiesByCategory(this.selectedCategory).subscribe({
            next: (activities: UserActivity[]) => {
              this.userActivities = activities;
            },
            error: (error: any) => console.error('Error loading user activities:', error)
          });
        }
      },
      error: (error: any) => console.error('Error deleting activity:', error)
    });
  }

  removeGuestActivity(activityId: number): void {
    this.guestActivities = this.guestActivities.filter(a => a.id !== activityId);
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
