import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeagueService } from '../services/league.service';
import { AuthService } from '../services/auth.service';
import { League, LeagueMember, User } from '../models/models';

@Component({
  selector: 'app-league-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="league-detail-container" *ngIf="league">
      <div class="league-header-section">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <div class="league-title-area">
          <h1>{{ league.name }}</h1>
          <span class="league-type-badge" [class.public]="league.leagueType === 'PUBLIC'">
            {{ league.leagueType }}
          </span>
        </div>
        <p class="league-desc">{{ league.description }}</p>
        
        <div class="league-stats">
          <div class="stat">
            <span class="stat-value">{{ league.currentMembers }}/{{ league.maxParticipants }}</span>
            <span class="stat-label">Members</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ league.host.username }}</span>
            <span class="stat-label">Host</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ formatDate(league.startDate) }}</span>
            <span class="stat-label">Started</span>
          </div>
        </div>

        <div class="league-actions" *ngIf="isHost">
          <button class="btn-secondary" (click)="showInviteModal = true">
            Invite Member
          </button>
          <button class="btn-secondary" (click)="refreshStats()">
            Refresh Stats
          </button>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="leaderboard-section">
        <h2>🏆 Leaderboard</h2>
        <div class="leaderboard">
          <div 
            *ngFor="let member of members; let i = index" 
            class="leaderboard-item"
            [class.user-entry]="member.user.id === currentUser?.id"
            (click)="viewMemberProfile(member.user.id)">
            <div class="rank" [class.top3]="i < 3">
              {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : member.rank }}
            </div>
            <div class="member-avatar" [style.background-color]="member.user.avatarColor">
              <img 
                *ngIf="member.user.profileImageUrl" 
                [src]="getProfileImageUrl(member.user.profileImageUrl)"
                alt="Profile">
              <span *ngIf="!member.user.profileImageUrl">
                {{ (member.user.fullName || member.user.username || 'U').charAt(0) }}
              </span>
            </div>
            <div class="member-info">
              <h3>{{ member.user.fullName || member.user.username }}</h3>
              <p>Score: {{ member.score.toFixed(0) }} pts</p>
            </div>
            <div class="member-stats">
              <div class="stat-item">
                <span class="stat-icon">💨</span>
                <span>{{ member.totalCo2.toFixed(1) }} kg</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💧</span>
                <span>{{ member.totalWater.toFixed(0) }} L</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">⚡</span>
                <span>{{ member.totalElectricity.toFixed(1) }} kWh</span>
              </div>
            </div>
            <div class="member-actions" *ngIf="isHost && member.user.id !== currentUser?.id">
              <button 
                class="btn-kick" 
                (click)="kickMember($event, member.id)"
                title="Kick member">
                ⚠️
              </button>
            </div>
          </div>

          <div *ngIf="members.length === 0" class="empty-state">
            <p>No members yet in this league</p>
          </div>
        </div>
      </div>

      <!-- Invite Modal -->
      <div *ngIf="showInviteModal" class="modal-overlay" (click)="showInviteModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Invite Member</h2>
            <button class="close-btn" (click)="showInviteModal = false">×</button>
          </div>
          <form (ngSubmit)="inviteMember()">
            <div class="form-group">
              <label>Username or Email</label>
              <input 
                type="text" 
                [(ngModel)]="inviteIdentifier"
                name="identifier"
                placeholder="Enter username or email"
                required>
            </div>
            <p *ngIf="inviteError" class="error-message">{{ inviteError }}</p>
            <p *ngIf="inviteSuccess" class="success-message">{{ inviteSuccess }}</p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showInviteModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary" [disabled]="isInviting">
                {{ isInviting ? 'Inviting...' : 'Send Invite' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .league-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .back-btn {
      background: none;
      border: none;
      font-size: 1rem;
      color: #6b7280;
      cursor: pointer;
      margin-bottom: 1rem;
    }

    .league-header-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .league-title-area {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .league-title-area h1 {
      margin: 0;
      font-size: 2rem;
    }

    .league-type-badge {
      background: #e5e7eb;
      padding: 0.375rem 0.875rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .league-type-badge.public {
      background: #10b981;
      color: white;
    }

    .league-desc {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .league-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      margin: 1.5rem 0;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #10b981;
    }

    .stat-label {
      display: block;
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .league-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .leaderboard-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .leaderboard-section h2 {
      margin: 0 0 1.5rem 0;
    }

    .leaderboard {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .leaderboard-item:hover {
      background: #f3f4f6;
      transform: translateX(4px);
    }

    .leaderboard-item.user-entry {
      background: #d1fae5;
      border: 2px solid #10b981;
    }

    .rank {
      font-size: 1.25rem;
      font-weight: 700;
      width: 40px;
      text-align: center;
    }

    .rank.top3 {
      font-size: 1.75rem;
    }

    .member-avatar {
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
    }

    .member-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .member-info {
      flex: 1;
    }

    .member-info h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .member-info p {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .member-stats {
      display: flex;
      gap: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .stat-icon {
      font-size: 1.25rem;
    }

    .member-actions {
      margin-left: 1rem;
    }

    .btn-kick {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.25rem;
    }

    .btn-kick:hover {
      background: #fee2e2;
    }

    .btn-primary {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .empty-state {
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
      max-width: 400px;
      width: 90%;
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

    .form-group input {
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

    .error-message {
      color: #ef4444;
      margin-top: 0.5rem;
    }

    .success-message {
      color: #10b981;
      margin-top: 0.5rem;
    }
  `]
})
export class LeagueDetailComponent implements OnInit {
  currentUser: User | null = null;
  league: League | null = null;
  members: LeagueMember[] = [];
  leagueId: number = 0;
  
  showInviteModal: boolean = false;
  inviteIdentifier: string = '';
  isInviting: boolean = false;
  inviteError: string = '';
  inviteSuccess: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leagueService: LeagueService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.leagueId = +params['id'];
      this.loadLeague();
      this.loadMembers();
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadLeague(): void {
    this.leagueService.getLeague(this.leagueId).subscribe({
      next: (league) => this.league = league,
      error: (error) => console.error('Error loading league:', error)
    });
  }

  loadMembers(): void {
    this.leagueService.getLeagueMembers(this.leagueId).subscribe({
      next: (members) => this.members = members,
      error: (error) => console.error('Error loading members:', error)
    });
  }

  inviteMember(): void {
    this.isInviting = true;
    this.inviteError = '';
    this.inviteSuccess = '';

    this.leagueService.inviteUser(this.leagueId, this.inviteIdentifier).subscribe({
      next: () => {
        this.inviteSuccess = 'Invitation sent!';
        this.inviteIdentifier = '';
        this.isInviting = false;
        setTimeout(() => {
          this.showInviteModal = false;
          this.inviteSuccess = '';
        }, 2000);
      },
      error: (error) => {
        this.inviteError = error.error?.message || 'Error sending invitation';
        this.isInviting = false;
      }
    });
  }

  kickMember(event: Event, memberId: number): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to kick this member?')) {
      this.leagueService.kickMember(this.leagueId, memberId).subscribe({
        next: () => this.loadMembers(),
        error: (error) => console.error('Error kicking member:', error)
      });
    }
  }

  refreshStats(): void {
    this.leagueService.refreshStats(this.leagueId).subscribe({
      next: () => this.loadMembers(),
      error: (error) => console.error('Error refreshing stats:', error)
    });
  }

  viewMemberProfile(userId: number): void {
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/leagues']);
  }

  get isHost(): boolean {
    return this.league?.host.id === this.currentUser?.id;
  }
}
