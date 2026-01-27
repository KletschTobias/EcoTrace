import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeagueService } from '../services/league.service';
import { AuthService } from '../services/auth.service';
import { League, User } from '../models/models';

@Component({
  selector: 'app-leagues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="leagues-container">
      <div class="leagues-header">
        <h1>🏆 Leagues</h1>
        <p>Join leagues and compete with others</p>
        <button class="btn-primary" (click)="showCreateModal = true">
          + Create League
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab === 'my-leagues'"
          (click)="activeTab = 'my-leagues'">
          My Leagues ({{ myLeagues.length }})
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'public'"
          (click)="activeTab = 'public'; loadPublicLeagues()">
          Public Leagues
        </button>
      </div>

      <!-- My Leagues -->
      <div *ngIf="activeTab === 'my-leagues'" class="leagues-grid">
        <div *ngFor="let league of myLeagues" class="league-card" (click)="viewLeague(league.id)">
          <div class="league-icon">
            {{ league.isPermanent ? '🌍' : (league.leagueType === 'PUBLIC' ? '🏆' : '🔒') }}
          </div>
          <div class="league-info">
            <h3>{{ league.name }}</h3>
            <p class="league-description">{{ league.description }}</p>
            <div class="league-meta">
              <span class="league-type">{{ league.leagueType }}</span>
              <span class="league-members">{{ league.currentMembers }}/{{ league.maxParticipants }} members</span>
            </div>
            <div class="league-host">
              <span>Host: {{ league.host.username || league.host.fullName }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="myLeagues.length === 0" class="empty-state">
          <p>You haven't joined any leagues yet</p>
          <button class="btn-secondary" (click)="activeTab = 'public'; loadPublicLeagues()">
            Browse Public Leagues
          </button>
        </div>
      </div>

      <!-- Public Leagues -->
      <div *ngIf="activeTab === 'public'" class="leagues-grid">
        <div *ngFor="let league of publicLeagues" class="league-card">
          <div class="league-icon">
            {{ league.isPermanent ? '🌍' : '🏆' }}
          </div>
          <div class="league-info">
            <h3>{{ league.name }}</h3>
            <p class="league-description">{{ league.description }}</p>
            <div class="league-meta">
              <span class="league-members">{{ league.currentMembers }}/{{ league.maxParticipants }} members</span>
              <span *ngIf="league.isFull" class="badge-full">FULL</span>
            </div>
            <div class="league-actions">
              <button 
                *ngIf="!league.isUserMember && !league.isFull" 
                class="btn-primary-sm"
                (click)="joinLeague(league.id)">
                Join League
              </button>
              <button 
                *ngIf="league.isUserMember" 
                class="btn-secondary-sm"
                (click)="viewLeague(league.id)">
                View
              </button>
              <span *ngIf="league.isFull && !league.isUserMember" class="text-muted">
                League is full
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Create League Modal -->
      <div *ngIf="showCreateModal" class="modal-overlay" (click)="showCreateModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Create New League</h2>
            <button class="close-btn" (click)="showCreateModal = false">×</button>
          </div>
          <form (ngSubmit)="createLeague()">
            <div class="form-group">
              <label>League Name *</label>
              <input 
                type="text" 
                [(ngModel)]="newLeague.name" 
                name="name"
                placeholder="Enter league name"
                required>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                [(ngModel)]="newLeague.description"
                name="description"
                placeholder="Describe your league..."
                rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Type *</label>
              <select [(ngModel)]="newLeague.leagueType" name="type" required>
                <option value="PUBLIC">Public (anyone can join)</option>
                <option value="PRIVATE">Private (invite only)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Max Participants</label>
              <input 
                type="number" 
                [(ngModel)]="newLeague.maxParticipants"
                name="maxParticipants"
                min="2"
                max="500"
                placeholder="500">
            </div>

            <div class="form-group">
              <label>Start Date *</label>
              <input 
                type="date" 
                [(ngModel)]="newLeague.startDate"
                name="startDate"
                required>
            </div>

            <div class="form-group">
              <label>End Date (optional)</label>
              <input 
                type="date" 
                [(ngModel)]="newLeague.endDate"
                name="endDate">
            </div>

            <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showCreateModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary" [disabled]="isCreating">
                {{ isCreating ? 'Creating...' : 'Create League' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leagues-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .leagues-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .leagues-header h1 {
      font-size: 2.5rem;
      margin: 0;
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

    .leagues-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .league-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      gap: 1rem;
    }

    .league-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .league-icon {
      font-size: 3rem;
    }

    .league-info {
      flex: 1;
    }

    .league-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
    }

    .league-description {
      color: #6b7280;
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }

    .league-meta {
      display: flex;
      gap: 1rem;
      margin: 0.75rem 0;
    }

    .league-type {
      background: #e5e7eb;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .league-members {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .badge-full {
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .league-host {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }

    .league-actions {
      margin-top: 1rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #6b7280;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-primary, .btn-primary-sm {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-primary-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-secondary, .btn-secondary-sm {
      background: #e5e7eb;
      color: #374151;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-secondary-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .error-message {
      color: #ef4444;
      margin-top: 0.5rem;
    }
  `]
})
export class LeaguesComponent implements OnInit {
  currentUser: User | null = null;
  activeTab: 'my-leagues' | 'public' = 'my-leagues';
  myLeagues: League[] = [];
  publicLeagues: League[] = [];
  
  showCreateModal: boolean = false;
  isCreating: boolean = false;
  errorMessage: string = '';
  
  newLeague: any = {
    name: '',
    description: '',
    leagueType: 'PUBLIC',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    maxParticipants: 500
  };

  constructor(
    private leagueService: LeagueService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadMyLeagues();
      }
    });
  }

  loadMyLeagues(): void {
    this.leagueService.getMyLeagues().subscribe({
      next: (leagues) => this.myLeagues = leagues,
      error: (error) => console.error('Error loading leagues:', error)
    });
  }

  loadPublicLeagues(): void {
    this.leagueService.getPublicLeagues().subscribe({
      next: (leagues) => this.publicLeagues = leagues,
      error: (error) => console.error('Error loading public leagues:', error)
    });
  }

  createLeague(): void {
    this.isCreating = true;
    this.errorMessage = '';

    this.leagueService.createLeague(this.newLeague).subscribe({
      next: (league) => {
        this.isCreating = false;
        this.showCreateModal = false;
        this.loadMyLeagues();
        this.router.navigate(['/league', league.id]);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error creating league';
        this.isCreating = false;
      }
    });
  }

  joinLeague(leagueId: number): void {
    this.leagueService.joinLeague(leagueId).subscribe({
      next: () => {
        this.loadMyLeagues();
        this.loadPublicLeagues();
      },
      error: (error) => console.error('Error joining league:', error)
    });
  }

  viewLeague(leagueId: number): void {
    this.router.navigate(['/league', leagueId]);
  }
}
