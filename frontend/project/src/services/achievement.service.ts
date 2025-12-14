import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Achievement } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getUserAchievements(userId: number): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}/users/${userId}/achievements`);
  }

  checkAndUnlockAchievements(userId: number): Observable<Achievement[]> {
    return this.http.post<Achievement[]>(`${this.apiUrl}/users/${userId}/achievements/check`, {});
  }

  markAchievementsAsViewed(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/achievements/mark-viewed`, {});
  }
}
