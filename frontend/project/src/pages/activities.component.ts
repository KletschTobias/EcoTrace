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

        <div *ngIf="importResultMessage" class="toast success-toast">
          {{ importResultMessage }}
        </div>
      <div class="activities-header">
        <div>
          <h1>Track Your Activities</h1>
          <p>Log your daily actions and see their environmental impact</p>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button class="btn-primary" (click)="toggleForm()">
            {{ showForm ? 'Cancel' : '+ Log Activity' }}
          </button>
          <button *ngIf="isAdmin" class="btn-admin" (click)="showImportExportMenu = !showImportExportMenu">
            ⚙️ Activities verwalten
          </button>
        </div>
        <input #fileInput type="file" accept=".csv,.xls,.xlsx" (change)="onFileSelected($event)" style="display: none;">
      </div>

      <!-- Admin Import/Export Menu -->
      <div *ngIf="isAdmin && showImportExportMenu" class="admin-menu">
        <div class="admin-menu-content">
          <h3>Activities verwalten</h3>
          <button class="menu-btn" (click)="triggerFileUpload()">📥 Importieren</button>
          <button class="menu-btn" (click)="showExportDialog = true">📤 Exportieren</button>
          <button class="menu-btn close-btn" (click)="showImportExportMenu = false">Schließen</button>
        </div>
      </div>

      <!-- Import Options Dialog -->
      <div *ngIf="showImportDialog" class="modal-overlay" (click)="showImportDialog = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Activities importieren</h2>
          <p>Wie sollen die Activities behandelt werden?</p>
          <div class="import-options">
            <button class="option-btn append" (click)="confirmImport(false)">
              <span class="icon">➕</span>
              <span class="label">Hinzufügen</span>
              <span class="desc">Neue Activities hinzufügen, bestehende behalten</span>
            </button>
            <button class="option-btn replace" (click)="confirmImport(true)">
              <span class="icon">🔄</span>
              <span class="label">Ersetzen</span>
              <span class="desc">Alle Activities ersetzen</span>
            </button>
          </div>
          <button class="btn-cancel" (click)="showImportDialog = false">Abbrechen</button>
        </div>
      </div>

      <!-- Export Options Dialog -->
      <div *ngIf="showExportDialog" class="modal-overlay" (click)="showExportDialog = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Activities exportieren</h2>
          <p>Wähle das Dateiformat:</p>
          <div class="export-options">
            <button class="option-btn csv" (click)="exportActivitiesAsCSV()">
              <span class="icon">📄</span>
              <span class="label">CSV</span>
              <span class="desc">Comma-separated Values</span>
            </button>
            <button class="option-btn xlsx" (click)="exportActivitiesAsXLSX()">
              <span class="icon">📊</span>
              <span class="label">XLSX</span>
              <span class="desc">Excel Format</span>
            </button>
          </div>
          <button class="btn-cancel" (click)="showExportDialog = false">Abbrechen</button>
        </div>
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

            <!-- Recurring Activity Toggle -->
            <div class="recurring-section">
              <label class="toggle-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="isRecurring"
                  name="isRecurring"
                  class="toggle-checkbox">
                <span class="toggle-text">🔄 Recurring Activity</span>
              </label>
              
              <div *ngIf="isRecurring" class="recurring-options">
                <div class="form-row">
                  <div class="form-group">
                    <label>Times per Week</label>
                    <input 
                      type="number" 
                      [(ngModel)]="timesPerWeek"
                      name="timesPerWeek"
                      min="1"
                      max="21"
                      class="form-control"
                      required>
                  </div>
                  <div class="form-group">
                    <label>Weeks per Year</label>
                    <input 
                      type="number" 
                      [(ngModel)]="weeksPerYear"
                      name="weeksPerYear"
                      min="1"
                      max="52"
                      class="form-control"
                      required>
                  </div>
                </div>
                <p class="recurring-info">
                  📊 Total occurrences: <strong>{{ timesPerWeek * weeksPerYear }}</strong> times/year
                </p>
              </div>
            </div>

            <div class="impact-preview">
              <h4>Estimated Impact{{ isRecurring ? ' (per year)' : '' }}:</h4>
              <div class="impacts">
                <span *ngIf="selectedActivity.co2PerUnit > 0" class="impact co2">
                  {{ (selectedActivity.co2PerUnit * quantity * (isRecurring ? timesPerWeek * weeksPerYear : 1)).toFixed(1) }} kg CO₂
                </span>
                <span *ngIf="selectedActivity.waterPerUnit > 0" class="impact water">
                  {{ (selectedActivity.waterPerUnit * quantity * (isRecurring ? timesPerWeek * weeksPerYear : 1)).toFixed(0) }} L Water
                </span>
                <span *ngIf="selectedActivity.electricityPerUnit > 0" class="impact electricity">
                  {{ (selectedActivity.electricityPerUnit * quantity * (isRecurring ? timesPerWeek * weeksPerYear : 1)).toFixed(1) }} kWh
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
          <div *ngFor="let activity of guestActivities" class="activity-card" [class.recurring-card]="activity.isRecurring">
            <div class="activity-main">
              <div>
                <h3>
                  {{ activity.activityName }}
                  <span *ngIf="activity.isRecurring" class="recurring-badge">🔄 {{ activity.timesPerWeek }}x/week</span>
                </h3>
                <p>{{ activity.quantity }} {{ activity.unit }} - {{ formatDate(activity.date) }}</p>
              </div>
              <button class="btn-delete" (click)="removeGuestActivity(activity.id)">X</button>
            </div>
            <div class="activity-impacts">
              <span *ngIf="(activity.totalCo2Impact || activity.co2Impact) > 0" class="impact co2">
                {{ (activity.totalCo2Impact || activity.co2Impact).toFixed(1) }} kg CO2
                <small *ngIf="activity.isRecurring">/year</small>
              </span>
              <span *ngIf="(activity.totalWaterImpact || activity.waterImpact) > 0" class="impact water">
                {{ (activity.totalWaterImpact || activity.waterImpact).toFixed(0) }} L
                <small *ngIf="activity.isRecurring">/year</small>
              </span>
              <span *ngIf="(activity.totalElectricityImpact || activity.electricityImpact) > 0" class="impact electricity">
                {{ (activity.totalElectricityImpact || activity.electricityImpact).toFixed(1) }} kWh
                <small *ngIf="activity.isRecurring">/year</small>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activities List -->
      <div class="activities-list-wrapper">
        <!-- Logged-in User Activities -->
        <div *ngIf="!isGuest" class="activities-list">
          <h2>Your Activities</h2>
          <div *ngIf="visibleUserActivities.length > 0" class="activity-cards">
            <div *ngFor="let activity of visibleUserActivities" class="activity-card" [class.recurring-card]="activity.isRecurring">
              <div class="activity-main">
                <div>
                  <h3>
                    {{ activity.activityName }}
                    <span *ngIf="activity.isRecurring" class="recurring-badge">🔄 {{ activity.timesPerWeek }}x/week</span>
                  </h3>
                  <p>{{ activity.quantity }} {{ activity.unit }} - {{ formatDate(activity.date) }}</p>
                </div>
                <button class="btn-delete" (click)="deleteActivity(activity.id)">X</button>
              </div>
              <div class="activity-impacts">
                <span *ngIf="(activity.totalCo2Impact || activity.co2Impact) > 0" class="impact co2">
                  {{ (activity.totalCo2Impact || activity.co2Impact).toFixed(1) }} kg CO2
                  <small *ngIf="activity.isRecurring">/year</small>
                </span>
                <span *ngIf="(activity.totalWaterImpact || activity.waterImpact) > 0" class="impact water">
                  {{ (activity.totalWaterImpact || activity.waterImpact).toFixed(0) }} L
                  <small *ngIf="activity.isRecurring">/year</small>
                </span>
                <span *ngIf="(activity.totalElectricityImpact || activity.electricityImpact) > 0" class="impact electricity">
                  {{ (activity.totalElectricityImpact || activity.electricityImpact).toFixed(1) }} kWh
                  <small *ngIf="activity.isRecurring">/year</small>
                </span>
              </div>
            </div>
          </div>
          <p *ngIf="visibleUserActivities.length === 0" class="no-data">No activities logged yet. Click "Log Activity" to get started!</p>
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

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 1.25rem;
    }

    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid #e5e7eb;
      border-top-color: #10B981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-container p { color: #6b7280; font-size: 0.95rem; }

    /* Toast */
    .toast { padding: 0.85rem 1.5rem; border-radius: 0.75rem; margin-bottom: 1rem; font-weight: 600; font-size: 0.9rem; }
    .success-toast { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }

    /* Header */
    .activities-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .activities-header h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .activities-header p { color: #6b7280; font-size: 0.9rem; }

    /* Buttons */
    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }

    .btn-admin {
      padding: 0.75rem 1.5rem;
      background: #f3f4f6;
      color: #374151;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }
    .btn-admin:hover { background: #e5e7eb; }

    /* Admin menu */
    .admin-menu {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 500;
    }
    .admin-menu-content {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      min-width: 280px;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    .admin-menu-content h3 { color: #111827; margin-bottom: 0.5rem; font-size: 1.2rem; }
    .menu-btn {
      padding: 0.75rem 1rem;
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      color: #374151;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .menu-btn:hover { background: #f0fdf4; border-color: #10B981; color: #10B981; }
    .close-btn { background: #fff5f5; border-color: #fca5a5; color: #ef4444; }
    .close-btn:hover { background: #fee2e2; }

    /* Modals */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    .modal-content h2 { color: #111827; margin-bottom: 0.5rem; font-size: 1.35rem; }
    .modal-content p  { color: #6b7280; margin-bottom: 1.25rem; font-size: 0.9rem; }

    .import-options, .export-options { display: flex; gap: 1rem; margin-bottom: 1.25rem; }

    .option-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 1.25rem 1rem;
      border-radius: 0.75rem;
      cursor: pointer;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
      color: #374151;
      transition: all 0.2s;
    }
    .option-btn:hover { background: #f0fdf4; border-color: #10B981; }
    .option-btn .icon { font-size: 1.75rem; }
    .option-btn .label { font-weight: 700; font-size: 0.95rem; color: #10B981; }
    .option-btn .desc  { font-size: 0.75rem; color: #6b7280; text-align: center; }
    .option-btn.replace:hover, .option-btn.xlsx:hover { background: #eff6ff; border-color: #06B6D4; }
    .option-btn.replace .label, .option-btn.xlsx .label { color: #0891b2; }

    .btn-cancel {
      width: 100%;
      padding: 0.75rem;
      background: #f3f4f6;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      color: #374151;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-cancel:hover { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }

    /* Guest banner */
    .guest-info-banner {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 0.75rem;
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .guest-info-banner .info-icon { font-size: 1.2rem; }
    .guest-info-banner span { color: #92400e; font-weight: 500; font-size: 0.9rem; }
    .guest-info-banner .btn-sign-up {
      margin-left: auto;
      padding: 0.45rem 1rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.85rem;
    }
    .guest-info-banner .btn-sign-up:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35); }
    .guest-note { color: #6b7280; font-size: 0.85rem; margin-top: 0.75rem; font-style: italic; }

    /* Activity Form */
    .activity-form {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .activity-form h2 {
      font-size: 1.3rem;
      color: #111827;
      margin-bottom: 1.5rem;
    }

    .form-group { margin-bottom: 1.25rem; position: relative; }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }
    .form-group small { font-size: 0.78rem; color: #6b7280; margin-top: 0.35rem; display: block; }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      color: #111827;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .form-control:focus { outline: none; border-color: #10B981; }
    .form-control::placeholder { color: #9ca3af; }
    .form-control:disabled { background: #f9fafb; cursor: not-allowed; color: #6b7280; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    /* Dropdown */
    .activities-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 2px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 0.75rem 0.75rem;
      max-height: 280px;
      overflow-y: auto;
      z-index: 20;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    .activity-option {
      padding: 0.85rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.15s;
    }
    .activity-option:hover { background: #f0fdf4; }
    .activity-option:last-child { border-bottom: none; }
    .activity-option strong { color: #111827; margin-right: 0.5rem; font-size: 0.95rem; }
    .activity-option small  { color: #6b7280; font-size: 0.8rem; display: block; margin-top: 0.2rem; }

    .category-badge {
      background: #e0f2fe;
      color: #0891b2;
      padding: 0.2rem 0.5rem;
      border-radius: 0.3rem;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .selected-activity {
      background: #f0fdf4;
      border: 2px solid #bbf7d0;
      padding: 1.25rem;
      border-radius: 0.75rem;
      margin-top: 1rem;
    }
    .selected-activity h3 { color: #065f46; margin-bottom: 0.4rem; font-size: 1rem; font-weight: 600; }
    .selected-activity p  { color: #6b7280; font-size: 0.875rem; }

    .impact-preview {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    .impact-preview h4 { margin-bottom: 0.7rem; color: #374151; font-size: 0.875rem; }

    .impacts { display: flex; gap: 0.65rem; flex-wrap: wrap; }

    .activity-impacts { display: flex; gap: 0.65rem; flex-wrap: wrap; margin-top: 0.5rem; }

    .impact {
      padding: 0.3rem 0.8rem;
      border-radius: 1rem;
      font-weight: 600;
      font-size: 0.8rem;
    }
    .impact.co2         { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .impact.water       { background: #e0f2fe; color: #0891b2; border: 1px solid #7dd3fc; }
    .impact.electricity { background: #fef9c3; color: #ca8a04; border: 1px solid #fde047; }

    /* Recurring */
    .recurring-section {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    .toggle-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      color: #1d4ed8;
      margin-bottom: 0;
    }
    .toggle-checkbox { width: 1.15rem; height: 1.15rem; cursor: pointer; accent-color: #06B6D4; }
    .toggle-text { user-select: none; font-size: 0.9rem; }

    .recurring-options {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
      border-left: 3px solid #06B6D4;
    }
    .recurring-info {
      margin-top: 1rem;
      padding: 0.7rem 1rem;
      background: #f0fdf4;
      border-radius: 0.4rem;
      font-size: 0.875rem;
      color: #15803d;
      border-left: 3px solid #10B981;
    }

    .recurring-card { border-left: 3px solid #06B6D4 !important; }
    .recurring-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0891b2;
      border: 1px solid #7dd3fc;
      padding: 0.2rem 0.5rem;
      border-radius: 0.3rem;
      font-size: 0.72rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .btn-submit {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Category filter */
    .category-filter {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .category-btn {
      padding: 0.5rem 1.5rem;
      border: 2px solid #e5e7eb;
      border-radius: 2rem;
      background: white;
      color: #374151;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
      font-size: 0.85rem;
    }
    .category-btn:hover { border-color: #10B981; color: #10B981; }
    .category-btn.active {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border-color: transparent;
    }

    /* Activities lists */
    .guest-preview-list {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .guest-preview-list h2 { color: #111827; margin-bottom: 0.4rem; font-size: 1.25rem; }
    .preview-note { color: #6b7280; font-size: 0.85rem; margin-bottom: 1rem; font-style: italic; }

    .activities-list-wrapper { position: relative; }

    .blurred { filter: blur(5px); pointer-events: none; user-select: none; }

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
    .locked-overlay:hover { transform: translate(-50%, -50%) scale(1.05); box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2); }
    .locked-overlay .lock-text { font-weight: 600; color: #374151; font-size: 0.95rem; }

    .sample-activities { opacity: 0.6; }

    .activities-list {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .activities-list h2 {
      font-size: 1.5rem;
      color: #111827;
      margin-bottom: 1.25rem;
    }

    .activity-cards { display: flex; flex-direction: column; gap: 0.75rem; }

    .activity-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.1rem 1.25rem;
      transition: all 0.2s;
    }
    .activity-card:hover { background: #f0fdf4; border-color: #bbf7d0; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1); }

    .activity-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    .activity-main h3 { font-size: 0.95rem; font-weight: 600; color: #111827; margin-bottom: 0.2rem; }
    .activity-main p  { font-size: 0.8rem; color: #6b7280; }

    .btn-delete {
      padding: 0.35rem 0.75rem;
      background: #fff5f5;
      border: 1px solid #fca5a5;
      border-radius: 0.375rem;
      color: #ef4444;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.8rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .btn-delete:hover { background: #fee2e2; border-color: #ef4444; }

    .no-data { text-align: center; color: #6b7280; padding: 2rem; font-style: italic; }

    @media (max-width: 768px) {
      .activities-container { padding: 1rem; }
      .activities-header { flex-direction: column; align-items: flex-start; }
      .form-row { grid-template-columns: 1fr; }
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

  // Only show recurring templates and one-off entries — hide auto-generated daily entries
  get visibleUserActivities(): UserActivity[] {
    return this.userActivities.filter(a => !a.sourceRecurringId);
  }
  
  showForm = false;
  showDropdown = false;
  selectedActivity: Activity | null = null;
  searchTerm = '';
  quantity = 1;
  date = format(new Date(), 'yyyy-MM-dd');
  selectedCategory = 'all';
  isSubmitting = false;
  isAdmin = false;
  showImportExportMenu = false;
  showImportDialog = false;
  showExportDialog = false;
  pendingFile: File | null = null;
  importResultMessage: string | null = null;
  private importResultTimeout?: any;

  // Recurring activity fields
  isRecurring = false;
  timesPerWeek = 1;
  weeksPerYear = 52;

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
    this.isAdmin = this.authService.hasRole('et-admin');

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

  triggerFileUpload(): void {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // XLSX/XLS file - show dialog for append/replace
        this.pendingFile = file;
        this.showImportDialog = true;
      } else if (fileName.endsWith('.csv')) {
        // CSV file - parse locally, show dialog
        this.pendingFile = file;
        this.showImportDialog = true;
      } else {
        alert('Please select a valid CSV, XLS, or XLSX file');
      }
    }
  }

  confirmImport(overwrite: boolean): void {
    if (!this.pendingFile) return;

    const fileName = this.pendingFile.name.toLowerCase();
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      this.uploadExcelFile(this.pendingFile, overwrite);
    } else if (fileName.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const csv = e.target?.result as string;
          this.importActivitiesFromCSV(csv, overwrite);
        } catch (error) {
          console.error('Error reading CSV:', error);
          alert('Error reading CSV file');
        }
      };
      reader.readAsText(this.pendingFile);
    }

    this.showImportDialog = false;
    this.pendingFile = null;
  }

  uploadExcelFile(file: File, overwrite: boolean = false): void {
    console.log('Uploading file:', file.name, 'overwrite:', overwrite);
    console.log('isAdmin:', this.isAdmin);
    console.log('Has et-admin role:', this.authService.hasRole('et-admin'));
    
    // Debug: Log the entire token to see what's inside
    const kc = (this.authService as any).kc;
    if (kc && kc.tokenParsed) {
      console.log('Full tokenParsed:', kc.tokenParsed);
      console.log('realm_access:', kc.tokenParsed.realm_access);
      console.log('resource_access:', kc.tokenParsed.resource_access);
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwrite', overwrite.toString());

    this.activityService.importExcelFile(formData).subscribe({
      next: (result: any) => {
        console.log('Import result:', result);
        const message = `Import abgeschlossen: ${result.importedCount} neu, ${result.updatedCount} aktualisiert, ${result.duplicateCount} Duplikate übersprungen${result.skippedCount > 0 ? `, ${result.skippedCount} Fehler` : ''}`;
        this.showImportResult(message);
        if (result.errors && result.errors.length > 0) {
          console.warn('Import errors:', result.errors);
        }
        this.loadActivities();
        this.showImportDialog = false;
        this.showImportExportMenu = false;
        this.pendingFile = null;
      },
      error: (error: any) => {
        console.error('Error uploading file - Full error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error);
        
        let errorMsg = 'Unknown error';
        if (error.status === 403) {
          errorMsg = 'Zugriff verweigert. Bitte als Admin einloggen.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        alert('Error uploading file: ' + errorMsg);
      }
    });
  }

  importActivitiesFromCSV(csv: string, overwrite: boolean = false): void {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      alert('CSV must have at least a header row and one data row');
      return;
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['activity', 'quantity', 'date'];
    const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
    
    if (!hasRequiredHeaders) {
      alert(`CSV must contain columns: ${requiredHeaders.join(', ')}`);
      return;
    }

    // Parse data
    let successCount = 0;
    let errorCount = 0;
    const totalRows = lines.length - 1;

    // If overwrite, delete all activities first
    if (overwrite) {
      for (const activity of this.userActivities) {
        this.userActivityService.deleteUserActivity(activity.id).subscribe();
      }
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const activityName = values[headers.indexOf('activity')];
      const quantityStr = values[headers.indexOf('quantity')];
      const dateStr = values[headers.indexOf('date')];

      if (!activityName || !quantityStr || !dateStr) {
        errorCount++;
        continue;
      }

      // Find activity by name
      const activity = this.activities.find(a => 
        a.name.toLowerCase() === activityName.toLowerCase()
      );

      if (!activity) {
        console.warn(`Activity not found: ${activityName}`);
        errorCount++;
        continue;
      }

      const quantity = parseFloat(quantityStr);
      if (isNaN(quantity) || quantity <= 0) {
        errorCount++;
        continue;
      }

      const request: CreateUserActivityRequest = {
        activityName: activity.name,
        category: activity.category,
        quantity: quantity,
        unit: activity.unit,
        co2Impact: activity.co2PerUnit * quantity,
        waterImpact: activity.waterPerUnit * quantity,
        electricityImpact: activity.electricityPerUnit * quantity,
        date: dateStr
      };

      this.userActivityService.createUserActivity(request).subscribe({
        next: () => {
          successCount++;
          if (successCount + errorCount === totalRows) {
            this.showImportResult(`Import abgeschlossen: ${successCount} neue Activities${errorCount > 0 ? `, ${errorCount} Fehler` : ''}`);
            this.loadUserActivities();
            this.showImportDialog = false;
            this.showImportExportMenu = false;
            this.pendingFile = null;
          }
        },
        error: () => {
          errorCount++;
          if (successCount + errorCount === totalRows) {
            this.showImportResult(`Import abgeschlossen: ${successCount} neue Activities${errorCount > 0 ? `, ${errorCount} Fehler` : ''}`);
            this.loadUserActivities();
            this.showImportDialog = false;
            this.showImportExportMenu = false;
            this.pendingFile = null;
          }
        }
      });
    }
  }

  showImportResult(message: string): void {
    this.importResultMessage = message;
    if (this.importResultTimeout) {
      clearTimeout(this.importResultTimeout);
    }
    this.importResultTimeout = setTimeout(() => {
      this.importResultMessage = null;
    }, 4500);
  }

  exportActivitiesAsXLSX(): void {
    this.activityService.exportActivities().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activities-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showExportDialog = false;
        this.showImportExportMenu = false;
      },
      error: (error: any) => {
        console.error('Error exporting activities:', error);
        alert('Fehler beim Exportieren der Activities');
      }
    });
  }

  exportActivitiesAsCSV(): void {
    // Get all activities and convert to CSV
    const rows: string[] = [];
    rows.push(['Name', 'Category', 'CO2 per Unit', 'Water per Unit', 'Electricity per Unit', 'Unit', 'Icon', 'Description'].join(','));
    
    this.activities.forEach(activity => {
      rows.push([
        activity.name,
        activity.category,
        activity.co2PerUnit || 0,
        activity.waterPerUnit || 0,
        activity.electricityPerUnit || 0,
        activity.unit,
        activity.icon || '',
        activity.description || ''
      ].map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(','));
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.showExportDialog = false;
    this.showImportExportMenu = false;
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
      const multiplier = this.isRecurring ? this.timesPerWeek * this.weeksPerYear : 1;
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
        date: this.date,
        isRecurring: this.isRecurring,
        timesPerWeek: this.timesPerWeek,
        weeksPerYear: this.weeksPerYear,
        totalCo2Impact: this.selectedActivity.co2PerUnit * this.quantity * multiplier,
        totalWaterImpact: this.selectedActivity.waterPerUnit * this.quantity * multiplier,
        totalElectricityImpact: this.selectedActivity.electricityPerUnit * this.quantity * multiplier
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
      date: this.date,
      isRecurring: this.isRecurring,
      timesPerWeek: this.isRecurring ? this.timesPerWeek : undefined,
      weeksPerYear: this.isRecurring ? this.weeksPerYear : undefined
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
    this.isRecurring = false;
    this.timesPerWeek = 1;
    this.weeksPerYear = 52;
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'MMM dd, yyyy');
  }
}
