import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GuestService } from '../services/guest.service';
import { FriendshipService } from '../services/friendship.service';
import { LeaderboardService, LeaderboardEntry, PeriodType, ResetTime } from '../services/leaderboard.service';
import { User } from '../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="friends-container">
      <div class="friends-header">
        <h1>Friends & Community</h1>
        <p>Connect with friends and compare your environmental impact</p>
      </div>

      <div class="friends-layout">
        <div class="friends-main">
          <!-- Add Friend Form -->
          <div class="add-friend-wrapper">
            <div class="add-friend-card" [class.blurred]="isGuest">
              <h2>➕ Add Friend</h2>
              <form (ngSubmit)="handleAddFriend()">
                <input 
                  type="email" 
                  [(ngModel)]="friendEmail"
                  name="friendEmail"
                  placeholder="Enter friend's email"
                  class="form-control"
                  required>
                <button type="submit" class="btn-add" [disabled]="isAdding">
                  {{ isAdding ? 'Adding...' : 'Add Friend' }}
                </button>
              </form>
              <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
            </div>
            
            <!-- Guest Overlay -->
            <div *ngIf="isGuest" class="locked-overlay" (click)="goToRegister()">
              <span class="lock-icon">🔒</span>
              <span class="lock-text">Log in to add friends</span>
            </div>
          </div>

          <!-- Friends List -->
          <div class="friends-list-wrapper">
            <div class="friends-list-card" [class.blurred]="isGuest">
              <h2>👥 Your Friends ({{ isGuest ? '0' : friends.length }})</h2>
              
              <!-- Sample friends for guests -->
              <div *ngIf="isGuest" class="friends-grid sample-friends">
                <div class="friend-card">
                  <div class="friend-avatar" style="background-color: #10B981">
                    <span>J</span>
                  </div>
                  <div class="friend-info">
                    <h3>John Doe</h3>
                    <p>&#64;johndoe</p>
                    <div class="friend-stats">
                      <span>8.5 kg CO₂</span>
                    </div>
                  </div>
                </div>
                <div class="friend-card">
                  <div class="friend-avatar" style="background-color: #6366F1">
                    <span>S</span>
                  </div>
                  <div class="friend-info">
                    <h3>Sarah Smith</h3>
                    <p>&#64;sarahs</p>
                    <div class="friend-stats">
                      <span>12.3 kg CO₂</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div *ngIf="!isGuest && friends.length > 0; else noFriends" class="friends-grid">
                <div *ngFor="let friend of friends" class="friend-card" (click)="viewFriendDetail(friend.id)">
                  <div 
                    class="friend-avatar"
                    [style.background-color]="friend.avatarColor">
                    <img 
                      *ngIf="friend.profileImageUrl" 
                      [src]="getProfileImageUrl(friend.profileImageUrl)"
                      [alt]="friend.fullName || friend.username || 'User'"
                      class="avatar-image">
                    <span *ngIf="!friend.profileImageUrl">
                      {{ (friend.fullName || friend.username || 'U').charAt(0) }}
                    </span>
                  </div>
                  <div class="friend-info">
                    <h3>{{ friend.fullName || friend.username || 'User' }}</h3>
                    <p>&#64;{{ friend.username }}</p>
                    <div class="friend-stats">
                      <span>{{ friend.totalCo2.toFixed(1) || '0.0' }} kg CO₂</span>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #noFriends>
                <p *ngIf="!isGuest" class="no-data">No friends added yet. Add friends to compare impacts!</p>
              </ng-template>
            </div>
            
            <!-- Guest Overlay -->
            <div *ngIf="isGuest" class="locked-overlay" (click)="goToRegister()">
              <span class="lock-icon">🔒</span>
              <span class="lock-text">Log in to see your friends</span>
            </div>
          </div>
        </div>

        <!-- Leaderboard Sidebar -->
        <div class="leaderboard-wrapper">
          <div class="leaderboard-card" [class.blurred]="isGuest">
            <h2>🏆 Eco Leaderboard</h2>
            <p class="leaderboard-subtitle">Lowest impact wins!</p>
            
            <!-- View Toggle -->
            <div class="view-toggle">
              <button 
                [class.active]="leaderboardView === 'friends'"
                (click)="switchLeaderboardView('friends')"
                class="toggle-btn">
                👥 Friends
              </button>
              <button 
                [class.active]="leaderboardView === 'global'"
                (click)="switchLeaderboardView('global')"
                class="toggle-btn">
                🌍 Global
              </button>
            </div>
            
            <!-- Period Tabs -->
            <div class="period-tabs">
              <button 
                *ngFor="let period of periods"
                [class.active]="selectedPeriod === period"
                (click)="selectPeriod(period)"
                class="period-tab">
                {{ getPeriodLabel(period) }}
              </button>
            </div>
            
            <!-- Reset Timer -->
            <div *ngIf="resetTime" class="reset-timer">
              <span class="timer-icon">⏱️</span>
              <span>Resets in: <strong>{{ formatTimeRemaining() }}</strong></span>
            </div>
            
            <!-- Your Status -->
            <div *ngIf="userEntry" class="user-status" [class.eligible]="userEntry.isEligible" [class.ineligible]="!userEntry.isEligible">
              <div class="status-header">
                <span class="status-icon">{{ userEntry.isEligible ? '✅' : '⚠️' }}</span>
                <span class="status-text">{{ userEntry.isEligible ? 'Eligible' : 'Not Eligible' }}</span>
              </div>
              <div class="status-details">
                <div class="tracking-progress">
                  <span>Days tracked: {{ userEntry.daysTracked }}/{{ userEntry.daysRequired }}</span>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="(userEntry.daysTracked / userEntry.daysRequired) * 100"></div>
                  </div>
                </div>
                <p *ngIf="!userEntry.isEligible" class="eligibility-hint">
                  Track {{ userEntry.daysRequired - userEntry.daysTracked }} more day(s) to join the leaderboard!
                </p>
                <p *ngIf="userEntry.disqualificationReason" class="disqualification-reason">
                  ❌ {{ userEntry.disqualificationReason }}
                </p>
              </div>
            </div>
            
            <!-- Sample Leaderboard for Guests -->
            <div *ngIf="isGuest" class="leaderboard-list sample-leaderboard">
              <div class="leaderboard-item">
                <div class="rank-badge top3"><span>🥇</span></div>
                <div class="user-avatar" style="background-color: #10B981"><span>E</span></div>
                <div class="user-info">
                  <strong>EcoChamp</strong>
                  <small>5.2 kg CO₂</small>
                </div>
              </div>
              <div class="leaderboard-item">
                <div class="rank-badge top3"><span>🥈</span></div>
                <div class="user-avatar" style="background-color: #6366F1"><span>G</span></div>
                <div class="user-info">
                  <strong>GreenWarrior</strong>
                  <small>7.8 kg CO₂</small>
                </div>
              </div>
              <div class="leaderboard-item">
                <div class="rank-badge top3"><span>🥉</span></div>
                <div class="user-avatar" style="background-color: #F59E0B"><span>S</span></div>
                <div class="user-info">
                  <strong>SustainableSam</strong>
                  <small>9.1 kg CO₂</small>
                </div>
              </div>
            </div>
            
            <!-- Leaderboard List -->
            <div class="leaderboard-count" *ngIf="!isGuest && currentLeaderboard.length > 0">
              <span>{{ currentLeaderboard.length }} participant{{ currentLeaderboard.length !== 1 ? 's' : '' }}</span>
            </div>
            <div *ngIf="!isGuest && currentLeaderboard.length > 0; else noLeaderboard" class="leaderboard-list">
              <div 
                *ngFor="let entry of currentLeaderboard; let i = index" 
                [class.current-user]="entry.userId === currentUser?.id"
                [class.ineligible]="!entry.isEligible || !entry.isValid"
                class="leaderboard-item"
                (click)="viewUserProfile(entry.userId)">
                <div class="rank-badge" [class.top3]="i < 3 && entry.isEligible && entry.isValid">
                  <span *ngIf="i === 0 && entry.isEligible && entry.isValid">🥇</span>
                  <span *ngIf="i === 1 && entry.isEligible && entry.isValid">🥈</span>
                  <span *ngIf="i === 2 && entry.isEligible && entry.isValid">🥉</span>
                  <span *ngIf="i >= 3 || !entry.isEligible || !entry.isValid">#{{ entry.rank }}</span>
                </div>
                <div 
                  class="user-avatar"
                  [style.background-color]="entry.avatarColor">
                  <img 
                    *ngIf="entry.profileImageUrl" 
                    [src]="getProfileImageUrl(entry.profileImageUrl)"
                    [alt]="entry.fullName"
                    class="avatar-image">
                  <span *ngIf="!entry.profileImageUrl">
                    {{ entry.fullName.charAt(0) || entry.username.charAt(0) || '?' }}
                  </span>
                  <span *ngIf="entry.hasSolarPanels" class="eco-badge solar" title="Has Solar Panels">☀️</span>
                  <span *ngIf="entry.hasHeatPump" class="eco-badge pump" title="Has Heat Pump">🔥</span>
                </div>
                <div class="user-info">
                  <strong>{{ entry.userId === currentUser?.id ? 'You' : entry.fullName || entry.username }}</strong>
                  <small>{{ entry.totalCo2.toFixed(1) || '0.0' }} kg CO₂</small>
                  <small *ngIf="!entry.isEligible" class="status-badge ineligible-badge">
                    {{ entry.daysTracked }}/{{ entry.daysRequired }} days
                  </small>
                  <small *ngIf="!entry.isValid" class="status-badge invalid-badge">
                    Disqualified
                  </small>
                </div>
              </div>
            </div>
            <ng-template #noLeaderboard>
              <p *ngIf="!isGuest" class="no-data">No leaderboard data yet. Start tracking to compete!</p>
            </ng-template>
          </div>
          
          <!-- Guest Overlay for Leaderboard -->
          <div *ngIf="isGuest" class="locked-overlay" (click)="goToRegister()">
            <span class="lock-icon">🔒</span>
            <span class="lock-text">Log in to compete</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .friends-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Wrappers for positioning overlays */
    .add-friend-wrapper,
    .friends-list-wrapper,
    .leaderboard-wrapper {
      position: relative;
    }

    /* Guest Mode Styles */
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
      white-space: nowrap;
    }

    .sample-friends, .sample-leaderboard {
      opacity: 0.7;
    }

    .friends-header {
      margin-bottom: 2rem;
    }
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

    .friends-header {
      margin-bottom: 2rem;
    }

    .friends-header h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .friends-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
    }

    .friends-main {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .add-friend-card, .friends-list-card, .leaderboard-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .add-friend-card h2, .friends-list-card h2, .leaderboard-card h2 {
      margin-bottom: 1rem;
      color: #111827;
    }

    .add-friend-card form {
      display: flex;
      gap: 0.75rem;
    }

    .form-control {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #10B981;
    }

    .btn-add {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-add:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      color: #dc2626;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .friends-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .friend-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: linear-gradient(135deg, #f0fdf4, #e0f2fe);
      border-radius: 0.75rem;
      border: 2px solid #10B981;
      transition: all 0.2s;
      cursor: pointer;
    }

    .friend-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      border-color: #059669;
    }

    .friend-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      overflow: hidden;
      position: relative;
    }

    .friend-avatar .avatar-image,
    .user-avatar .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    }

    .friend-info {
      flex: 1;
    }

    .friend-info h3 {
      font-size: 1.125rem;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .friend-info p {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .friend-stats span {
      background: white;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #10B981;
    }

    .leaderboard-card {
      position: sticky;
      top: 2rem;
      max-height: calc(100vh - 4rem);
      overflow-y: auto;
    }

    .leaderboard-subtitle {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      background: #f3f4f6;
      padding: 0.25rem;
      border-radius: 0.5rem;
    }

    .toggle-btn {
      flex: 1;
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      color: #6b7280;
    }

    .toggle-btn.active {
      background: white;
      color: #111827;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .toggle-btn:hover:not(.active) {
      color: #374151;
    }

    .period-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .period-tab {
      padding: 0.5rem 1rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      color: #6b7280;
    }

    .period-tab:hover {
      border-color: #10B981;
      color: #10B981;
    }

    .period-tab.active {
      background: linear-gradient(135deg, #10B981, #06B6D4);
      border-color: transparent;
      color: white;
    }

    .reset-timer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #92400e;
    }

    .timer-icon {
      font-size: 1.25rem;
    }

    .user-status {
      padding: 1rem;
      border-radius: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-status.eligible {
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border: 2px solid #10B981;
    }

    .user-status.ineligible {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 2px solid #f59e0b;
    }

    .status-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .status-icon {
      font-size: 1.25rem;
    }

    .status-text {
      font-weight: 600;
      color: #111827;
    }

    .tracking-progress {
      margin-bottom: 0.5rem;
    }

    .tracking-progress span {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .progress-bar {
      height: 8px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      margin-top: 0.25rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .eligibility-hint {
      font-size: 0.75rem;
      color: #92400e;
      margin: 0;
    }

    .disqualification-reason {
      font-size: 0.75rem;
      color: #dc2626;
      margin: 0.5rem 0 0;
    }

    .leaderboard-count {
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
      font-weight: 500;
    }

    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.5rem;
      transition: all 0.2s;
      cursor: pointer;
    }

    .leaderboard-item:hover {
      background: #e5e7eb;
      transform: translateX(4px);
    }

    .leaderboard-item.current-user {
      background: linear-gradient(135deg, #d1fae5, #cffafe);
      border: 2px solid #10B981;
    }

    .leaderboard-item.current-user:hover {
      transform: translateX(4px);
    }

    .leaderboard-item.ineligible {
      opacity: 0.6;
      background: #f3f4f6;
    }

    .leaderboard-item.ineligible .rank-badge {
      color: #9ca3af;
    }

    .rank-badge {
      font-size: 1.5rem;
      min-width: 40px;
      text-align: center;
    }

    .rank-badge.top3 {
      font-size: 2rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      overflow: hidden;
      position: relative;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .user-info strong {
      color: #111827;
      font-size: 0.875rem;
    }

    .user-info small {
      color: #6b7280;
      font-size: 0.75rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.625rem;
      font-weight: 600;
      margin-top: 0.25rem;
    }

    .ineligible-badge {
      background: #fef3c7;
      color: #92400e;
    }

    .invalid-badge {
      background: #fee2e2;
      color: #dc2626;
    }

    .eco-badge {
      position: absolute;
      font-size: 0.625rem;
      bottom: -2px;
      right: -2px;
    }

    .eco-badge.solar {
      right: -2px;
    }

    .eco-badge.pump {
      right: 10px;
    }

    .no-data {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
      font-style: italic;
    }

    @media (max-width: 1024px) {
      .friends-layout {
        grid-template-columns: 1fr;
      }

      .leaderboard-card {
        position: static;
        max-height: none;
      }
    }

    @media (max-width: 768px) {
      .friends-container {
        padding: 1rem;
      }

      .friends-header h1 {
        font-size: 1.75rem;
      }

      .add-friend-card form {
        flex-direction: column;
      }

      .friends-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FriendsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  friends: User[] = [];
  leaderboard: User[] = [];
  enhancedLeaderboard: LeaderboardEntry[] = [];
  globalLeaderboard: LeaderboardEntry[] = [];
  friendEmail = '';
  isAdding = false;
  errorMessage = '';

  // Guest mode
  isGuest = false;
  showPrompt = false;
  private guestSubscription?: Subscription;

  // Leaderboard period settings
  periods: PeriodType[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
  selectedPeriod: PeriodType = 'WEEKLY';
  leaderboardView: 'friends' | 'global' = 'friends';
  resetTime: ResetTime | null = null;
  userEntry: LeaderboardEntry | null = null;
  private resetTimerInterval: any = null;

  constructor(
    private authService: AuthService,
    private guestService: GuestService,
    private friendshipService: FriendshipService,
    private leaderboardService: LeaderboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isGuest = this.guestService.isGuest();
    this.currentUser = this.authService.getCurrentUser();

    // Subscribe to guest mode changes (for when user logs in)
    this.guestSubscription = this.guestService.isGuestMode$.subscribe(isGuest => {
      this.isGuest = isGuest;
      this.currentUser = this.authService.getCurrentUser();
      if (this.currentUser && !this.isGuest) {
        this.loadFriends();
        this.loadLeaderboard();
        this.loadEnhancedLeaderboard();
        this.startResetTimer();
      }
    });

    if (this.currentUser && !this.isGuest) {
      this.loadFriends();
      this.loadLeaderboard();
      this.loadEnhancedLeaderboard();
      this.startResetTimer();
    }
  }

  ngOnDestroy(): void {
    this.guestSubscription?.unsubscribe();
    if (this.resetTimerInterval) {
      clearInterval(this.resetTimerInterval);
    }
  }

  handleAddFriend(): void {
    if (this.isGuest) {
      this.showPrompt = true;
      return;
    }
    this.addFriend();
  }

  showRegisterPrompt(): void {
    this.showPrompt = true;
  }

  goToRegister(): void {
    this.showPrompt = false;
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'register' } }));
  }

  goToLogin(): void {
    this.showPrompt = false;
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }));
  }

  loadFriends(): void {
    if (!this.currentUser) return;

    this.friendshipService.getUserFriends().subscribe({
      next: (friends: User[]) => {
        this.friends = friends;
      },
      error: (error: any) => console.error('Error loading friends:', error)
    });
  }

  loadLeaderboard(): void {
    if (!this.currentUser) return;

    this.friendshipService.getLeaderboard().subscribe({
      next: (users: User[]) => {
        this.leaderboard = users;
      },
      error: (error: any) => console.error('Error loading leaderboard:', error)
    });
  }

  addFriend(): void {
    if (!this.currentUser || !this.friendEmail) return;

    this.isAdding = true;
    this.errorMessage = '';

    if (this.friendEmail === this.currentUser.email) {
      this.errorMessage = 'You cannot add yourself as a friend!';
      this.isAdding = false;
      return;
    }

    this.friendshipService.addFriend(this.friendEmail).subscribe({
      next: () => {
        this.isAdding = false;
        this.friendEmail = '';
        this.loadFriends();
        this.loadLeaderboard();
      },
      error: (error: any) => {
        this.isAdding = false;
        this.errorMessage = error.error?.message || 'Error adding friend';
        console.error('Error adding friend:', error);
      }
    });
  }

    viewFriendDetail(friendId: number): void {
        this.router.navigate(['/friend', friendId]);
    }

    viewUserProfile(userId: number): void {
        if (userId === this.currentUser?.id) {
            this.router.navigate(['/profile']);
        } else {
            this.router.navigate(['/friend', userId]);
        }
    }

    getProfileImageUrl(url: string | undefined): string {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:8081${url}`;
    }

    // Enhanced Leaderboard Methods
    selectPeriod(period: PeriodType): void {
        this.selectedPeriod = period;
        this.loadEnhancedLeaderboard();
        this.loadResetTime();
    }

    loadEnhancedLeaderboard(): void {
        if (!this.currentUser) return;

        // Load friends leaderboard
        this.leaderboardService.getLeaderboardForUserAndFriends(this.currentUser.id, this.selectedPeriod).subscribe({
            next: (entries) => {
                this.enhancedLeaderboard = entries;
            },
            error: (error) => {
                console.error('Error loading enhanced leaderboard:', error);
                this.enhancedLeaderboard = [];
            }
        });

        // Load global leaderboard
        this.leaderboardService.getLeaderboard(this.selectedPeriod).subscribe({
            next: (entries) => {
                this.globalLeaderboard = entries;
            },
            error: (error) => {
                console.error('Error loading global leaderboard:', error);
                this.globalLeaderboard = [];
            }
        });

        this.leaderboardService.getUserEntry(this.currentUser.id, this.selectedPeriod).subscribe({
            next: (entry) => {
                this.userEntry = entry;
            },
            error: () => {
                this.userEntry = null;
            }
        });
    }

    get currentLeaderboard(): LeaderboardEntry[] {
        return this.leaderboardView === 'friends' ? this.enhancedLeaderboard : this.globalLeaderboard;
    }

    switchLeaderboardView(view: 'friends' | 'global'): void {
        this.leaderboardView = view;
    }

    loadResetTime(): void {
        this.leaderboardService.getTimeUntilReset(this.selectedPeriod).subscribe({
            next: (time) => {
                this.resetTime = time;
            },
            error: (error) => console.error('Error loading reset time:', error)
        });
    }

    startResetTimer(): void {
        this.loadResetTime();

        // Update reset time every second
        this.resetTimerInterval = setInterval(() => {
            if (this.resetTime && this.resetTime.millisUntilReset > 0) {
                this.resetTime.millisUntilReset -= 1000;

                // Recalculate time remaining
                const seconds = Math.floor(this.resetTime.millisUntilReset / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                this.resetTime.timeRemaining = {
                    days,
                    hours: hours % 24,
                    minutes: minutes % 60,
                    seconds: seconds % 60
                };

                // If reset time reached, reload leaderboard
                if (this.resetTime.millisUntilReset <= 0) {
                    this.loadEnhancedLeaderboard();
                    this.loadResetTime();
                }
            }
        }, 1000);
    }

    formatTimeRemaining(): string {
        if (!this.resetTime) return '';
        return this.leaderboardService.formatTimeRemaining(this.resetTime);
    }

    getPeriodLabel(period: PeriodType): string {
        return this.leaderboardService.getPeriodLabel(period);
    }
}
