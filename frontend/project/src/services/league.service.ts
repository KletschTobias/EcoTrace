import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { League, LeagueMember, CreateLeagueRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {
  private apiUrl = 'http://localhost:8081/api/leagues';

  constructor(private http: HttpClient) {}

  createLeague(request: CreateLeagueRequest): Observable<League> {
    return this.http.post<League>(this.apiUrl, request);
  }

  getPublicLeagues(): Observable<League[]> {
    return this.http.get<League[]>(`${this.apiUrl}/public`);
  }

  getMyLeagues(): Observable<League[]> {
    return this.http.get<League[]>(`${this.apiUrl}/my-leagues`);
  }

  getLeague(leagueId: number): Observable<League> {
    return this.http.get<League>(`${this.apiUrl}/${leagueId}`);
  }

  getLeagueMembers(leagueId: number): Observable<LeagueMember[]> {
    return this.http.get<LeagueMember[]>(`${this.apiUrl}/${leagueId}/members`);
  }

  joinLeague(leagueId: number): Observable<League> {
    return this.http.post<League>(`${this.apiUrl}/${leagueId}/join`, {});
  }

  leaveLeague(leagueId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${leagueId}/leave`);
  }

  inviteUser(leagueId: number, userIdentifier: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${leagueId}/invite`, { userIdentifier });
  }

  acceptInvitation(leagueId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${leagueId}/accept-invitation`, {});
  }

  kickMember(leagueId: number, memberId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${leagueId}/kick/${memberId}`, {});
  }

  refreshStats(leagueId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${leagueId}/refresh-stats`, {});
  }
}
