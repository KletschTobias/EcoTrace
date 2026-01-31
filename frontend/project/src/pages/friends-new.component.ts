import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FriendshipService } from '../services/friendship.service';
import { FriendRequestService } from '../services/friend-request.service';
import { User, FriendRequest } from '../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="friends-container">
      <div class="friends-header">
        <h1>👥 Friends</h1>
        <p>Connect with friends and send requests</p>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="successMessage" class="toast success-toast">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="toast error-toast">
        {{ errorMessage }}
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab === 'friends'"
          (click)="activeTab = 'friends'">
          Friends ({{ friends.length }})
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'received'"
          (click)="activeTab = 'received'">
          Requests ({{ pendingCount }})
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'sent'"
          (click)="activeTab = 'sent'">
          Sent ({{ sentRequests.length }})
        </button>
      </div>

      <!-- Add Friend Section -->
      <div class="add-friend-section">
        <h2>➕ Add Friend</h2>
        <form (ngSubmit)="sendFriendRequest()" class="add-friend-form">
          <input 
            type="text" 
            [(ngModel)]="friendIdentifier"
            name="friendIdentifier"
            placeholder="Enter username or email"
            class="form-control"
            required>
          <button type="submit" class="btn-primary" [disabled]="isAdding">
            {{ isAdding ? 'Sending...' : 'Send Request' }}
          </button>
        </form>
      </div>

      <!-- Friends List -->
      <div *ngIf="activeTab === 'friends'" class="content-section">
        <h2>Your Friends</h2>
        <div class="friends-grid" *ngIf="friends.length > 0; else noFriends">
          <div 
            *ngFor="let friend of friends" 
            class="friend-card"
            (click)="viewFriendDetail(friend.id)">
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
                <span>💨 {{ friend.totalCo2.toFixed(1) }} kg CO₂</span>
              </div>
            </div>
          </div>
        </div>
        <ng-template #noFriends>
          <div class="empty-state">
            <p>You don't have any friends yet. Send some friend requests!</p>
          </div>
        </ng-template>
      </div>

      <!-- Received Requests -->
      <div *ngIf="activeTab === 'received'" class="content-section">
        <h2>Friend Requests</h2>
        <div class="requests-list" *ngIf="receivedRequests.length > 0; else noRequests">
          <div *ngFor="let request of receivedRequests" class="request-card">
            <div 
              class="friend-avatar"
              [style.background-color]="request.sender.avatarColor">
              <img 
                *ngIf="request.sender.profileImageUrl" 
                [src]="getProfileImageUrl(request.sender.profileImageUrl)"
                alt="Profile">
              <span *ngIf="!request.sender.profileImageUrl">
                {{ (request.sender.fullName || request.sender.username || 'U').charAt(0) }}
              </span>
            </div>
            <div class="request-info">
              <h3>{{ request.sender.fullName || request.sender.username }}</h3>
              <p>&#64;{{ request.sender.username }}</p>
              <p class="request-date">{{ request.createdAt | date:'short' }}</p>
            </div>
            <div class="request-actions">
              <button class="btn-accept" (click)="acceptRequest(request.id)">
                ✓ Accept
              </button>
              <button class="btn-reject" (click)="rejectRequest(request.id)">
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
        <ng-template #noRequests>
          <div class="empty-state">
            <p>No pending friend requests</p>
          </div>
        </ng-template>
      </div>

      <!-- Sent Requests -->
      <div *ngIf="activeTab === 'sent'" class="content-section">
        <h2>Sent Requests</h2>
        <div class="requests-list" *ngIf="sentRequests.length > 0; else noSentRequests">
          <div *ngFor="let request of sentRequests" class="request-card">
            <div 
              class="friend-avatar"
              [style.background-color]="request.receiver.avatarColor">
              <img 
                *ngIf="request.receiver.profileImageUrl" 
                [src]="getProfileImageUrl(request.receiver.profileImageUrl)"
                alt="Profile">
              <span *ngIf="!request.receiver.profileImageUrl">
                {{ (request.receiver.fullName || request.receiver.username || 'U').charAt(0) }}
              </span>
            </div>
            <div class="request-info">
              <h3>{{ request.receiver.fullName || request.receiver.username }}</h3>
              <p>&#64;{{ request.receiver.username }}</p>
              <p class="request-date">Sent {{ request.createdAt | date:'short' }}</p>
            </div>
            <div class="request-actions">
              <button class="btn-cancel" (click)="cancelRequest(request.id)">
                Cancel
              </button>
            </div>
          </div>
        </div>
        <ng-template #noSentRequests>
          <div class="empty-state">
            <p>No pending sent requests</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .friends-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .friends-header {
      margin-bottom: 2rem;
    }

    .friends-header h1 {
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
    }

    .friends-header p {
      color: #6b7280;
      margin: 0;
    }

    .toast {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      animation: slideIn 0.3s ease-out;
    }

    .success-toast {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #10b981;
    }

    .error-toast {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #ef4444;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .tab {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-size: 1rem;
      color: #6b7280;
      transition: all 0.2s;
    }

    .tab.active {
      color: #10b981;
      border-bottom-color: #10b981;
    }

    .add-friend-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .add-friend-section h2 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
    }

    .add-friend-form {
      display: flex;
      gap: 1rem;
    }

    .form-control {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
    }

    .btn-primary {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      white-space: nowrap;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .content-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .content-section h2 {
      margin: 0 0 1.5rem 0;
    }

    .friends-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .friend-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .friend-card:hover {
      background: #f3f4f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .friend-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.25rem;
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .friend-info {
      flex: 1;
      min-width: 0;
    }

    .friend-info h3 {
      margin: 0;
      font-size: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .friend-info p {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .friend-stats {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #10b981;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .request-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .request-info {
      flex: 1;
    }

    .request-info h3 {
      margin: 0;
      font-size: 1rem;
    }

    .request-info p {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .request-date {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .request-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-accept, .btn-reject, .btn-cancel {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .btn-accept {
      background: #10b981;
      color: white;
    }

    .btn-reject {
      background: #ef4444;
      color: white;
    }

    .btn-cancel {
      background: #e5e7eb;
      color: #374151;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }
  `]
})
export class FriendsNewComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  friends: User[] = [];
  receivedRequests: FriendRequest[] = [];
  sentRequests: FriendRequest[] = [];
  
  activeTab: 'friends' | 'received' | 'sent' = 'friends';
  friendIdentifier: string = '';
  isAdding: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private friendshipService: FriendshipService,
    private friendRequestService: FriendRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadFriends();
        this.loadRequests();
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  loadFriends(): void {
    this.friendshipService.getUserFriends().subscribe({
      next: (friends) => this.friends = friends,
      error: (error) => console.error('Error loading friends:', error)
    });
  }

  loadRequests(): void {
    this.friendRequestService.getReceivedRequests().subscribe({
      next: (requests) => this.receivedRequests = requests,
      error: (error) => console.error('Error loading received requests:', error)
    });

    this.friendRequestService.getSentRequests().subscribe({
      next: (requests) => this.sentRequests = requests,
      error: (error) => console.error('Error loading sent requests:', error)
    });
  }

  sendFriendRequest(): void {
    if (!this.friendIdentifier.trim()) return;

    this.isAdding = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.friendRequestService.sendFriendRequest(this.friendIdentifier).subscribe({
      next: () => {
        this.successMessage = 'Friend request sent!';
        this.friendIdentifier = '';
        this.isAdding = false;
        this.loadRequests();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error sending friend request';
        this.isAdding = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  acceptRequest(requestId: number): void {
    this.friendRequestService.acceptRequest(requestId).subscribe({
      next: () => {
        this.successMessage = 'Friend request accepted!';
        this.loadFriends();
        this.loadRequests();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error accepting request';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  rejectRequest(requestId: number): void {
    this.friendRequestService.rejectRequest(requestId).subscribe({
      next: () => {
        this.loadRequests();
      },
      error: (error) => console.error('Error rejecting request:', error)
    });
  }

  cancelRequest(requestId: number): void {
    this.friendRequestService.cancelRequest(requestId).subscribe({
      next: () => {
        this.loadRequests();
      },
      error: (error) => console.error('Error canceling request:', error)
    });
  }

  viewFriendDetail(friendId: number): void {
    this.router.navigate(['/friend', friendId]);
  }

  getProfileImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  }

  get pendingCount(): number {
    return this.receivedRequests.length;
  }
}
