import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { GuestService } from '../services/guest.service';
import { ActivityService } from '../services/activity.service';
import { UserActivityService } from '../services/user-activity.service';
import { User, Activity, UserActivity, CreateUserActivityRequest } from '../models/models';
import { format } from 'date-fns';
import { Subscription } from 'rxjs';

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
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportActivities()" title="Export to Excel">
            📥 Export
          </button>
          <button *ngIf="isAdmin" class="btn-secondary btn-admin" (click)="triggerImport()" title="Import from Excel (Admin only)">
            📤 Import
          </button>
          <input 
            type="file" 
            #fileInput 
            (change)="onFileSelected($event)"
            accept=".xlsx,.xls"
            style="display: none;">
          <button class="btn-primary" (click)="toggleForm()">
            {{ showForm ? 'Cancel' : '+ Log Activity' }}
          </button>
        </div>
      </div>
      
      <!-- Import Modal -->
      <div *ngIf="showImportModal" class="modal-overlay" (click)="closeImportModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>📤 Import Activities</h2>
          <p class="modal-description">Choose how to handle the imported activities:</p>
          
          <div class="import-options">
            <label class="import-option" [class.selected]="importMode === 'append'">
              <input type="radio" name="importMode" value="append" [(ngModel)]="importMode">
              <div class="option-content">
                <strong>➕ Append</strong>
                <span>Add new activities, skip duplicates</span>
              </div>
            </label>
            
            <label class="import-option" [class.selected]="importMode === 'overwrite'">
              <input type="radio" name="importMode" value="overwrite" [(ngModel)]="importMode">
              <div class="option-content">
                <strong>🔄 Overwrite</strong>
                <span>Replace all existing activities</span>
              </div>
            </label>
          </div>
          
          <div *ngIf="selectedFile" class="selected-file">
            <span>📄 {{ selectedFile.name }}</span>
          </div>
          
          <div class="modal-actions">
            <button class="btn-cancel" (click)="closeImportModal()">Cancel</button>
            <button class="btn-import" (click)="confirmImport()" [disabled]="isImporting">
              {{ isImporting ? 'Importing...' : 'Import' }}
            </button>
          </div>
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
                  {{ calculateTotalImpact(selectedActivity.co2PerUnit * quantity).toFixed(2) }} kg CO₂
                </span>
                <span *ngIf="selectedActivity.waterPerUnit > 0" class="impact water">
                  {{ calculateTotalImpact(selectedActivity.waterPerUnit * quantity).toFixed(0) }} L Water
                </span>
                <span *ngIf="selectedActivity.electricityPerUnit > 0" class="impact electricity">
                  {{ calculateTotalImpact(selectedActivity.electricityPerUnit * quantity).toFixed(2) }} kWh
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
          <div *ngIf="userActivities.length > 0" class="activity-cards">
            <div *ngFor="let activity of userActivities" class="activity-card" [class.recurring-card]="activity.isRecurring">
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

    .activities-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .btn-secondary {
      padding: 0.75rem 1rem;
      background: white;
      color: #374151;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      border-color: #10B981;
      color: #10B981;
      transform: translateY(-2px);
    }

    .btn-admin {
      border-color: #f59e0b;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
    }

    .btn-admin:hover {
      border-color: #d97706;
      color: #78350f;
      background: linear-gradient(135deg, #fde68a, #fcd34d);
    }

    /* Import Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-content h2 {
      margin-bottom: 0.5rem;
      color: #111827;
    }

    .modal-description {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .import-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .import-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .import-option:hover {
      border-color: #10B981;
    }

    .import-option.selected {
      border-color: #10B981;
      background: rgba(16, 185, 129, 0.05);
    }

    .import-option input {
      accent-color: #10B981;
    }

    .option-content {
      display: flex;
      flex-direction: column;
    }

    .option-content strong {
      color: #111827;
    }

    .option-content span {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .selected-file {
      padding: 0.75rem;
      background: #f3f4f6;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      color: #374151;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .btn-cancel {
      padding: 0.75rem 1.5rem;
      background: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-import {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-import:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-import:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    /* Recurring Activity Styles */
    .recurring-section {
      margin: 1.5rem 0;
      padding: 1rem;
      background: white;
      border-radius: 0.5rem;
      border: 2px solid #e5e7eb;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-weight: 600;
      color: #374151;
    }

    .toggle-checkbox {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: #10B981;
    }

    .toggle-text {
      font-size: 1rem;
    }

    .recurring-options {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .recurring-info {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 0.75rem;
      padding: 0.5rem;
      background: #f3f4f6;
      border-radius: 0.25rem;
    }

    .recurring-info strong {
      color: #10B981;
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

    .activity-card.recurring-card {
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border-left: 4px solid #10B981;
    }

    .recurring-badge {
      display: inline-block;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      padding: 0.15rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      font-weight: 600;
      margin-left: 0.5rem;
      vertical-align: middle;
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  user: User | null = null;
  activities: Activity[] = [];
  private guestSubscription?: Subscription;
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

  // Import/Export
  showImportModal = false;
  importMode: 'append' | 'overwrite' = 'append';
  selectedFile: File | null = null;
  isImporting = false;
  isAdmin = false;

  // Recurring activity
  isRecurring = false;
  timesPerWeek = 1;
  weeksPerYear = 52;

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
    private userActivityService: UserActivityService
  ) {}

  ngOnInit(): void {
    this.isGuest = this.guestService.isGuest();
    this.user = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    
    // Subscribe to guest mode changes (for when user logs in)
    this.guestSubscription = this.guestService.isGuestMode$.subscribe(isGuest => {
      this.isGuest = isGuest;
      this.user = this.authService.getCurrentUser();
      this.isAdmin = this.authService.isAdmin();
      if (this.user && !this.isGuest) {
        this.loadUserActivities();
      }
    });
    
    // Always load activities for display
    this.loadActivities();
    
    if (this.user && !this.isGuest) {
      this.loadUserActivities();
    }
  }

  ngOnDestroy(): void {
    this.guestSubscription?.unsubscribe();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  goToRegister(): void {
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'register' } }));
  }

  goToLogin(): void {
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }));
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
    if (!this.selectedActivity) return;

    // Guest mode - add to temporary preview list
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
        timesPerWeek: this.isRecurring ? this.timesPerWeek : undefined,
        weeksPerYear: this.isRecurring ? this.weeksPerYear : undefined,
        totalCo2Impact: this.selectedActivity.co2PerUnit * this.quantity * multiplier,
        totalWaterImpact: this.selectedActivity.waterPerUnit * this.quantity * multiplier,
        totalElectricityImpact: this.selectedActivity.electricityPerUnit * this.quantity * multiplier
      };
      this.guestActivities.unshift(guestActivity);
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

    const multiplier = this.isRecurring ? this.timesPerWeek * this.weeksPerYear : 1;
    
    this.userActivityService.createUserActivity(this.user.id, request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showForm = false;
        this.resetForm();
        this.loadUserActivities();
        
        // Update user totals (with multiplier for recurring)
        if (this.user) {
          this.authService.updateUser(this.user.id, {
            totalCo2: (this.user.totalCo2 || 0) + (request.co2Impact || 0) * multiplier,
            totalWater: (this.user.totalWater || 0) + (request.waterImpact || 0) * multiplier,
            totalElectricity: (this.user.totalElectricity || 0) + (request.electricityImpact || 0) * multiplier
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
  
  calculateTotalImpact(baseImpact: number): number {
    if (this.isRecurring) {
      return baseImpact * this.timesPerWeek * this.weeksPerYear;
    }
    return baseImpact;
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'MMM dd, yyyy');
  }

  // Import/Export Methods
  exportActivities(): void {
    this.activityService.exportActivities().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activities_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Error exporting activities:', error);
        alert('Failed to export activities. Please try again.');
      }
    });
  }

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.showImportModal = true;
    }
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.selectedFile = null;
    this.importMode = 'append';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  confirmImport(): void {
    if (!this.selectedFile) return;

    this.isImporting = true;
    this.activityService.importActivities(this.selectedFile, this.importMode).subscribe({
      next: (response: any) => {
        this.isImporting = false;
        this.closeImportModal();
        this.loadActivities();
        
        const message = response.message || `Successfully imported activities!`;
        alert(message);
      },
      error: (error: any) => {
        console.error('Error importing activities:', error);
        this.isImporting = false;
        alert('Failed to import activities. Please check the file format and try again.');
      }
    });
  }
}
