import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaderboardEntry {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  avatarColor: string;
  profileImageUrl: string | null;
  hasSolarPanels: boolean;
  hasHeatPump: boolean;
  
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  periodStart: string;
  periodEnd: string;
  
  totalCo2: number;
  totalWater: number;
  totalElectricity: number;
  
  daysTracked: number;
  daysRequired: number;
  isEligible: boolean;
  isValid: boolean;
  disqualificationReason: string | null;
  
  rank: number;
}

export interface ResetTime {
  periodType: string;
  millisUntilReset: number;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/leaderboard';

  getLeaderboard(periodType: PeriodType): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/${periodType}`);
  }

  getLeaderboardForUserAndFriends(userId: number, periodType: PeriodType): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/${periodType}/friends/${userId}`);
  }

  getUserEntry(userId: number, periodType: PeriodType): Observable<LeaderboardEntry> {
    return this.http.get<LeaderboardEntry>(`${this.apiUrl}/${periodType}/user/${userId}`);
  }

  getTimeUntilReset(periodType: PeriodType): Observable<ResetTime> {
    return this.http.get<ResetTime>(`${this.apiUrl}/${periodType}/reset-time`);
  }

  recalculateUserLeaderboard(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/recalculate/${userId}`, {});
  }

  formatTimeRemaining(resetTime: ResetTime): string {
    const { days, hours, minutes, seconds } = resetTime.timeRemaining;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getPeriodLabel(periodType: PeriodType): string {
    switch (periodType) {
      case 'DAILY': return 'Today';
      case 'WEEKLY': return 'This Week';
      case 'MONTHLY': return 'This Month';
      case 'YEARLY': return 'This Year';
    }
  }

  getDaysRequiredLabel(periodType: PeriodType): string {
    switch (periodType) {
      case 'DAILY': return '1 day';
      case 'WEEKLY': return '7 days';
      case 'MONTHLY': return 'all days this month';
      case 'YEARLY': return 'all days this year';
    }
  }
}
