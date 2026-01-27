import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserActivity, CreateUserActivityRequest, Stats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private apiUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {}

  getUserActivities(userId: number): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/${userId}/activities`);
  }

  getUserActivitiesByDateRange(userId: number, startDate: string, endDate: string): Observable<UserActivity[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<UserActivity[]>(`${this.apiUrl}/${userId}/activities/date-range`, { params });
  }

  getUserActivitiesByCategory(userId: number, category: string): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/${userId}/activities/category/${category}`);
  }

  getUserStats(userId: number, startDate: string, endDate: string): Observable<Stats> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<Stats>(`${this.apiUrl}/${userId}/activities/stats`, { params });
  }

  createUserActivity(userId: number, activity: CreateUserActivityRequest): Observable<UserActivity> {
    return this.http.post<UserActivity>(`${this.apiUrl}/${userId}/activities`, activity);
  }

  deleteUserActivity(userId: number, activityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/activities/${activityId}`);
  }
}
