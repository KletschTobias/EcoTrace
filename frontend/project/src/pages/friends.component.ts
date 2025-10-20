import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FriendshipService } from '../services/friendship.service';
import { User } from '../models/models';

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
          <div class="add-friend-card">
            <h2>➕ Add Friend</h2>
            <form (ngSubmit)="addFriend()">
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

          <!-- Friends List -->
          <div class="friends-list-card">
            <h2>👥 Your Friends ({{ friends.length }})</h2>
            <div *ngIf="friends.length > 0; else noFriends" class="friends-grid">
              <div *ngFor="let friend of friends" class="friend-card">
                <div 
                  class="friend-avatar"
                  [style.background-color]="friend.avatarColor">
                  {{ friend.fullName?.charAt(0) || friend.email?.charAt(0) }}
                </div>
                <div class="friend-info">
                  <h3>{{ friend.fullName || 'User' }}</h3>
                  <p>&#64;{{ friend.username }}</p>
                  <div class="friend-stats">
                    <span>{{ friend.totalCo2?.toFixed(1) || '0.0' }} kg CO₂</span>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noFriends>
              <p class="no-data">No friends added yet. Add friends to compare impacts!</p>
            </ng-template>
          </div>
        </div>

        <!-- Leaderboard Sidebar -->
        <div class="leaderboard-card">
          <h2>🏆 Eco Leaderboard</h2>
          <p class="leaderboard-subtitle">Lowest impact wins!</p>
          <div *ngIf="leaderboard.length > 0" class="leaderboard-list">
            <div 
              *ngFor="let user of leaderboard; let i = index" 
              [class.current-user]="user.id === currentUser?.id"
              class="leaderboard-item">
              <div class="rank-badge" [class.top3]="i < 3">
                <span *ngIf="i === 0">🥇</span>
                <span *ngIf="i === 1">🥈</span>
                <span *ngIf="i === 2">🥉</span>
                <span *ngIf="i >= 3">#{{ i + 1 }}</span>
              </div>
              <div 
                class="user-avatar"
                [style.background-color]="user.avatarColor">
                {{ user.fullName?.charAt(0) || user.email?.charAt(0) }}
              </div>
              <div class="user-info">
                <strong>{{ user.id === currentUser?.id ? 'You' : user.fullName || 'User' }}</strong>
                <small>{{ user.totalCo2?.toFixed(1) || '0.0' }} kg CO₂</small>
              </div>
            </div>
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
      transition: transform 0.2s;
    }

    .friend-card:hover {
      transform: translateY(-2px);
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
      margin-bottom: 1.5rem;
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
    }

    .leaderboard-item:hover {
      background: #f3f4f6;
    }

    .leaderboard-item.current-user {
      background: linear-gradient(135deg, #d1fae5, #cffafe);
      border: 2px solid #10B981;
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
export class FriendsComponent implements OnInit {
  currentUser: User | null = null;
  friends: User[] = [];
  leaderboard: User[] = [];
  friendEmail = '';
  isAdding = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private friendshipService: FriendshipService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadFriends();
      this.loadLeaderboard();
    }
  }

  loadFriends(): void {
    if (!this.currentUser) return;

    this.friendshipService.getUserFriends(this.currentUser.id).subscribe({
      next: (friends: User[]) => {
        this.friends = friends;
      },
      error: (error: any) => console.error('Error loading friends:', error)
    });
  }

  loadLeaderboard(): void {
    if (!this.currentUser) return;

    this.friendshipService.getLeaderboard(this.currentUser.id).subscribe({
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

    this.friendshipService.addFriend(this.currentUser.id, this.friendEmail).subscribe({
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
}
