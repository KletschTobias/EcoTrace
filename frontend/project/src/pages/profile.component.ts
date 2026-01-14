import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div class="profile-content" *ngIf="user">
        <div class="profile-card">
          <div class="profile-image-section">
            <div class="profile-image-wrapper">
              <img 
                *ngIf="user.profileImageUrl" 
                [src]="getProfileImageUrl(user.profileImageUrl)" 
                alt="Profile"
                class="profile-image">
              <div 
                *ngIf="!user.profileImageUrl"
                class="profile-avatar"
                [style.background-color]="user.avatarColor">
                {{ (user.fullName || user.username || user.externalId || 'U').charAt(0) }}
              </div>
            </div>
            <button class="change-image-btn" (click)="fileInput.click()">
              {{ user.profileImageUrl ? 'Change' : 'Add' }} Photo
            </button>
            <input 
              #fileInput
              type="file" 
              accept="image/*"
              (change)="onFileSelected($event)"
              style="display: none;">
            <p *ngIf="isUploading" class="upload-status">Uploading...</p>
          </div>

          <div class="profile-form">
            <div class="form-group">
              <label>Username</label>
              <input 
                type="text" 
                [(ngModel)]="editedUsername"
                name="editedUsername"
                class="form-control"
                placeholder="Enter your username">
              <small style="color: #666;">Display name only - Keycloak username stays unchanged</small>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                [value]="user.email || 'N/A'" 
                disabled
                class="form-control">
              <small style="color: #999;">Managed by Keycloak - cannot be edited</small>
            </div>

            <div class="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                [(ngModel)]="editedFullName"
                name="editedFullName"
                class="form-control"
                placeholder="Enter your full name">
              <small style="color: #666;">Will be synced to Keycloak</small>
            </div>

            <div class="form-group">
              <label>Biography</label>
              <textarea 
                [(ngModel)]="editedBiography"
                class="form-control"
                rows="4"
                maxlength="500"
                placeholder="Tell us about yourself..."></textarea>
              <small>{{ editedBiography.length || 0 }}/500 characters</small>
            </div>

            <div class="form-group">
              <label>Eco Features</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="editedHasSolarPanels">
                  <span>☀️ Solar Panels</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="editedHasHeatPump">
                  <span>🌡️ Heat Pump</span>
                </label>
              </div>
            </div>

            <div class="button-group">
              <button (click)="saveProfile()" class="btn-save" [disabled]="isSaving">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button (click)="deleteAccountPrompt()" class="btn-delete">
                🗑️ Delete Account
              </button>
              <button (click)="cancelEdit()" class="btn-cancel">
                Cancel
              </button>
            </div>

            <p *ngIf="successMessage" class="success-message">{{ successMessage }}</p>
            <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Delete Account Confirmation Modal -->
        <div class="modal-overlay" *ngIf="showDeleteConfirmation" (click)="closeDeleteConfirmation()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Delete Account</h2>
              <button class="close-btn" (click)="closeDeleteConfirmation()">×</button>
            </div>
            <div class="modal-body">
              <div class="warning-icon">⚠️</div>
              <p class="warning-title">This action cannot be undone</p>
              <p class="warning-text">Deleting your account will:</p>
              <ul class="warning-list">
                <li>Permanently remove your profile and all personal data</li>
                <li>Delete all your activity records</li>
                <li>Remove you from all friend lists</li>
              </ul>
              <p class="confirm-text">Are you absolutely sure?</p>
            </div>
            <div class="modal-footer">
              <button (click)="closeDeleteConfirmation()" class="btn-modal-cancel">
                No
              </button>
              <button (click)="confirmDeleteAccount()" class="btn-modal-delete" [disabled]="isDeleting">
                {{ isDeleting ? 'Deleting...' : 'Yes' }}
              </button>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h2>Your Environmental Impact</h2>
          <div class="impact-stats">
            <div class="stat-item">
              <span class="stat-icon">🌍</span>
              <div>
                <div class="stat-value">{{ user.totalCo2.toFixed(1) }} kg</div>
                <div class="stat-label">Total CO₂</div>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💧</span>
              <div>
                <div class="stat-value">{{ user.totalWater.toFixed(0) }} L</div>
                <div class="stat-label">Total Water</div>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <div>
                <div class="stat-value">{{ user.totalElectricity.toFixed(1) }} kWh</div>
                <div class="stat-label">Total Electricity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      margin-bottom: 2rem;
    }

    .profile-header h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-card, .stats-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .profile-card {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 2rem;
    }

    .profile-image-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .profile-image-wrapper {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid #10B981;
    }

    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      color: white;
      font-weight: bold;
    }

    .change-image-btn {
      padding: 0.5rem 1.5rem;
      background: #f3f4f6;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }

    .change-image-btn:hover {
      background: #e5e7eb;
    }

    .image-url-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
    }

    .form-group small {
      color: #6b7280;
      font-size: 0.75rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #10B981;
    }

    .form-control:disabled {
      background: #f9fafb;
      cursor: not-allowed;
    }

    textarea.form-control {
      resize: vertical;
      font-family: inherit;
    }

    .checkbox-group {
      display: flex;
      gap: 1.5rem;
      padding: 0.5rem 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      color: #374151;
    }

    .checkbox-label input[type="checkbox"] {
      width: 1.25rem;
      height: 1.25rem;
    }

    .btn-delete {
      padding: 0.75rem 1.5rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-delete:hover {
      background: #dc2626;
    }

    .btn-delete:active {
      transform: scale(0.98);
      accent-color: #10B981;
    }

    .button-group {
      display: flex;
      gap: 1rem;
    }

    .btn-save, .btn-cancel {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-save {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .success-message {
      color: #10B981;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .error-message {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .stats-card h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: #111827;
    }

    .impact-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: linear-gradient(135deg, #f0fdf4, #e0f2fe);
      border-radius: 0.75rem;
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #111827;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .profile-card {
        grid-template-columns: 1fr;
      }

      .profile-image-wrapper {
        width: 150px;
        height: 150px;
      }
    }

    /* Modal Styles */
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
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid #f3f4f6;
    }

    .modal-header h2 {
      margin: 0;
      color: #111827;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .close-btn:hover {
      color: #111827;
      background: #f3f4f6;
      border-radius: 0.5rem;
    }

    .modal-body {
      padding: 2rem 1.5rem;
      text-align: center;
    }

    .warning-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .warning-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #dc2626;
      margin: 0 0 1rem 0;
    }

    .warning-text {
      font-size: 1rem;
      color: #374151;
      margin: 0 0 1rem 0;
      font-weight: 500;
    }

    .warning-list {
      text-align: left;
      list-style: none;
      padding: 1rem;
      background: #fef2f2;
      border-radius: 0.75rem;
      margin: 0 0 1.5rem 0;
      border-left: 4px solid #dc2626;
    }

    .warning-list li {
      color: #7f1d1d;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .warning-list li:last-child {
      margin-bottom: 0;
    }

    .confirm-text {
      font-size: 1rem;
      color: #374151;
      margin: 0;
      font-weight: 600;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 2px solid #f3f4f6;
      justify-content: flex-end;
    }

    .btn-modal-cancel,
    .btn-modal-delete {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }

    .btn-modal-cancel {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-modal-cancel:hover {
      background: #e5e7eb;
    }

    .btn-modal-delete {
      background: #dc2626;
      color: white;
    }

    .btn-modal-delete:hover:not(:disabled) {
      background: #b91c1c;
      box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2);
    }

    .btn-modal-delete:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editedUsername = '';
  editedFullName = '';
  editedBiography = '';
  editedHasSolarPanels = false;
  editedHasHeatPump = false;
  isUploading = false;
  isSaving = false;
  isDeleting = false;
  successMessage = '';
  errorMessage = '';
  showDeleteConfirmation = false;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.editedUsername = this.user.username || '';
      this.editedFullName = this.user.fullName || '';
      this.editedBiography = this.user.biography || '';
      this.editedHasSolarPanels = this.user.hasSolarPanels || false;
      this.editedHasHeatPump = this.user.hasHeatPump || false;
    }
  }

  getProfileImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';

    this.userService.uploadProfileImage(file).subscribe({
      next: (response) => {
        if (this.user) {
          this.userService.updateProfile(this.user.id, { profileImageUrl: response.url }).subscribe({
            next: (updatedUser) => {
              this.user = updatedUser;
              this.authService.updateCurrentUser(updatedUser);
              this.successMessage = 'Profile image updated!';
              this.isUploading = false;
              setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
              console.error('Error updating profile:', error);
              this.errorMessage = 'Failed to update profile';
              this.isUploading = false;
              setTimeout(() => this.errorMessage = '', 3000);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.errorMessage = 'Failed to upload image';
        this.isUploading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  saveProfile(): void {
    if (!this.user) return;

    // Validate username and fullName
    if (!this.editedUsername || this.editedUsername.trim().length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (!this.editedFullName || this.editedFullName.trim().length < 2) {
      this.errorMessage = 'Full name must be at least 2 characters long';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Update all editable fields
    this.userService.updateProfile(this.user.id, {
      username: this.editedUsername.trim(),
      fullName: this.editedFullName.trim(),
      biography: this.editedBiography,
      hasSolarPanels: this.editedHasSolarPanels,
      hasHeatPump: this.editedHasHeatPump
    }).subscribe({
      next: (updatedUser) => {
        // Preserve email from current user (backend doesn't return it in update)
        if (this.user && this.user.email && !updatedUser.email) {
          updatedUser.email = this.user.email;
        }
        this.user = updatedUser;
        this.authService.updateCurrentUser(updatedUser);
        this.successMessage = 'Profile updated successfully!';
        this.isSaving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        const errorMsg = error.error?.message || error.message || 'Failed to update profile';
        if (errorMsg.includes('Username already taken') || errorMsg.includes('already taken')) {
          this.errorMessage = 'This username is already taken. Please choose another one.';
        } else {
          this.errorMessage = errorMsg;
        }
        this.isSaving = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  cancelEdit(): void {
    if (this.user) {
      this.editedUsername = this.user.username || '';
      this.editedFullName = this.user.fullName || '';
      this.editedBiography = this.user.biography || '';
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteAccountPrompt(): void {
    this.showDeleteConfirmation = true;
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
  }

  confirmDeleteAccount(): void {
    if (!this.user) return;

    this.isDeleting = true;
    this.errorMessage = '';

    this.authService.deleteAccount().subscribe({
      next: () => {
        this.successMessage = 'Account deleted successfully. Logging out...';
        this.isDeleting = false;
        this.showDeleteConfirmation = false;
      },
      error: (error: any) => {
        console.error('Error deleting account:', error);
        this.errorMessage = error.error?.message || 'Failed to delete account';
        this.isDeleting = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }
}
