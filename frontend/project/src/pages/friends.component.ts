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
      max-width: 1200px; margin: 0 auto; padding: 2rem;
      animation: fadeUp 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .friends-header { margin-bottom: 2rem; }
    .friends-header h1 {
      font-family: 'Fraunces', Georgia, serif; font-size: 2.25rem; font-weight: 700;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 0.3rem; letter-spacing: -0.03em;
    }
    .friends-header p { color: rgba(122,173,138,0.65); font-size: 0.9rem; }

    .friends-layout { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; align-items: start; }

    .friends-main { display: flex; flex-direction: column; gap: 1.5rem; }

    /* Cards */
    .add-friend-wrapper, .friends-list-wrapper { position: relative; }

    .add-friend-card, .friends-list-card {
      background: rgba(14,35,22,0.75); border: 1px solid rgba(16,185,129,0.15);
      border-radius: 1.25rem; padding: 1.75rem;
      backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .add-friend-card h2, .friends-list-card h2 {
      font-family: 'Fraunces',serif; font-size: 1.2rem; color: #d4eedc;
      margin-bottom: 1.25rem; letter-spacing: -0.02em;
    }

    .add-friend-card form { display: flex; gap: 0.75rem; align-items: flex-end; }

    .form-control {
      flex: 1; padding: 0.7rem 1rem;
      background: rgba(7,20,12,0.8); border: 1px solid rgba(16,185,129,0.2);
      border-radius: 0.5rem; font-size: 0.95rem; color: #d4eedc;
      transition: border-color 0.2s; font-family: inherit;
    }
    .form-control:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
    .form-control::placeholder { color: rgba(122,173,138,0.4); }

    .btn-add {
      padding: 0.7rem 1.4rem;
      background: linear-gradient(135deg, #10B981, #06B6D4);
      color: #071410; border: none; border-radius: 0.5rem;
      font-weight: 700; font-size: 0.9rem; cursor: pointer;
      transition: all 0.25s; white-space: nowrap; font-family: inherit;
    }
    .btn-add:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }

    .error-message { color: #f87171; font-size: 0.875rem; margin-top: 0.75rem; }

    /* Friends grid */
    .friends-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem; margin-top: 0.5rem;
    }
    .friend-card {
      background: rgba(7,20,12,0.7); border: 1px solid rgba(16,185,129,0.12);
      border-radius: 1rem; padding: 1.25rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.65rem;
      cursor: pointer; transition: all 0.25s; text-align: center;
    }
    .friend-card:hover {
      background: rgba(16,185,129,0.09); border-color: rgba(16,185,129,0.3);
      transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .friend-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 1.3rem;
      border: 2px solid rgba(16,185,129,0.3); overflow: hidden;
    }
    .avatar-image { width: 100%; height: 100%; object-fit: cover; }
    .friend-info h3 { font-size: 0.9rem; font-weight: 600; color: #d4eedc; margin-bottom: 0.2rem; }
    .friend-info p  { font-size: 0.78rem; color: rgba(122,173,138,0.55); }
    .friend-stats span {
      font-size: 0.78rem; color: #4ade80;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(16,185,129,0.1); padding: 0.2rem 0.55rem;
      border-radius: 0.4rem; border: 1px solid rgba(16,185,129,0.2);
    }
    .sample-friends { opacity: 0.5; }

    .no-data { color: rgba(122,173,138,0.5); font-style: italic; padding: 1.5rem 0; font-size: 0.9rem; }

    /* Pending Requests */
    .pending-requests {
      margin-top: 1.25rem; padding-top: 1.25rem;
      border-top: 1px solid rgba(16,185,129,0.1);
    }
    .pending-requests h3 { color: #d4eedc; font-size: 1rem; margin-bottom: 1rem; }
    .request-card {
      background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
      border-radius: 0.75rem; padding: 1rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.75rem; margin-bottom: 0.6rem;
    }
    .request-info h4 { font-size: 0.9rem; color: #d4eedc; }
    .request-info p  { font-size: 0.78rem; color: rgba(122,173,138,0.6); }
    .request-actions { display: flex; gap: 0.5rem; }
    .btn-accept {
      padding: 0.4rem 0.9rem; background: rgba(16,185,129,0.2);
      border: 1px solid rgba(16,185,129,0.4); border-radius: 0.4rem;
      color: #4ade80; cursor: pointer; font-weight: 600;
      font-size: 0.82rem; transition: all 0.2s; font-family: inherit;
    }
    .btn-accept:hover { background: rgba(16,185,129,0.35); }
    .btn-reject {
      padding: 0.4rem 0.9rem; background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2); border-radius: 0.4rem;
      color: #f87171; cursor: pointer; font-weight: 600;
      font-size: 0.82rem; transition: all 0.2s; font-family: inherit;
    }
    .btn-reject:hover { background: rgba(239,68,68,0.2); }

    /* Success message */
    .success-message { color: #4ade80; font-size: 0.875rem; margin-top: 0.75rem; }

    /* Leaderboard sidebar */
    .leaderboard-wrapper { position: sticky; top: 90px; }

    .leaderboard-card {
      background: rgba(14,35,22,0.75); border: 1px solid rgba(16,185,129,0.15);
      border-radius: 1.25rem; padding: 1.75rem;
      backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .leaderboard-card h2 {
      font-family: 'Fraunces',serif; font-size: 1.2rem; color: #d4eedc;
      margin-bottom: 0.25rem; letter-spacing: -0.02em;
    }
    .leaderboard-subtitle { color: rgba(122,173,138,0.6); font-size: 0.82rem; margin-bottom: 1.25rem; }

    .view-toggle { display: flex; gap: 0.4rem; margin-bottom: 1rem; }
    .toggle-btn {
      flex: 1; padding: 0.5rem 0.75rem;
      background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15);
      border-radius: 0.5rem; color: rgba(122,173,138,0.65);
      cursor: pointer; font-size: 0.82rem; font-weight: 600;
      transition: all 0.2s; font-family: inherit;
    }
    .toggle-btn.active {
      background: rgba(16,185,129,0.18); color: #4ade80;
      border-color: rgba(16,185,129,0.4);
    }
    .toggle-btn:hover:not(.active) { background: rgba(16,185,129,0.1); color: #d4eedc; }

    .period-tabs { display: flex; gap: 0.35rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .period-tab {
      padding: 0.35rem 0.85rem;
      background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.12);
      border-radius: 1rem; color: rgba(122,173,138,0.6);
      cursor: pointer; font-size: 0.78rem; font-weight: 600;
      transition: all 0.2s; font-family: inherit;
    }
    .period-tab.active {
      background: rgba(16,185,129,0.18); color: #4ade80;
      border-color: rgba(16,185,129,0.4);
    }

    .leaderboard-list { display: flex; flex-direction: column; gap: 0.5rem; }

    .leaderboard-entry {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0.75rem 1rem; border-radius: 0.75rem;
      background: rgba(7,20,12,0.6); border: 1px solid rgba(16,185,129,0.08);
      transition: all 0.2s;
    }
    .leaderboard-entry:hover { background: rgba(16,185,129,0.07); border-color: rgba(16,185,129,0.18); }
    .leaderboard-entry.is-you {
      background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.35);
      box-shadow: 0 0 12px rgba(16,185,129,0.15);
    }

    .entry-rank {
      font-family: 'JetBrains Mono', monospace; font-weight: 700;
      font-size: 0.9rem; color: rgba(122,173,138,0.6); min-width: 24px; text-align: center;
    }
    .entry-rank.top-1 { color: #fbbf24; }
    .entry-rank.top-2 { color: #94a3b8; }
    .entry-rank.top-3 { color: #cd7c3a; }

    .entry-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 0.9rem;
      border: 1px solid rgba(16,185,129,0.2); overflow: hidden; flex-shrink: 0;
    }
    .entry-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .entry-name { flex: 1; font-size: 0.875rem; font-weight: 600; color: #d4eedc; }
    .you-label { font-size: 0.7rem; color: #4ade80; font-weight: 600; }

    .entry-score {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem; color: #4ade80; font-weight: 600;
    }

    .next-reset {
      margin-top: 1rem; padding: 0.65rem 1rem;
      background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.15);
      border-radius: 0.5rem; font-size: 0.78rem; color: rgba(122,173,138,0.6);
      text-align: center;
    }
    .next-reset span { color: #22d3ee; font-weight: 600; font-family: 'JetBrains Mono', monospace; }

    /* Guest overlays */
    .locked-overlay {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); z-index: 10;
      display: flex; align-items: center; gap: 0.75rem;
      background: rgba(10,26,15,0.96); border: 1px solid rgba(16,185,129,0.35);
      padding: 0.85rem 2rem; border-radius: 2rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5); cursor: pointer;
      transition: all 0.3s; backdrop-filter: blur(8px);
    }
    .locked-overlay:hover { transform: translate(-50%, -50%) scale(1.04); }
    .lock-icon { font-size: 1.35rem; }
    .lock-text { font-weight: 600; color: #4ade80; font-size: 0.95rem; }
    .blurred { filter: blur(5px); pointer-events: none; user-select: none; }

    .no-leaderboard {
      text-align: center; color: rgba(122,173,138,0.5);
      padding: 1.5rem 0; font-size: 0.875rem; font-style: italic;
    }

    @media (max-width: 900px) {
      .friends-layout { grid-template-columns: 1fr; }
      .leaderboard-wrapper { position: static; }
    }
    @media (max-width: 640px) {
      .friends-container { padding: 1rem; }
      .friends-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
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
