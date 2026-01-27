import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserActivity, CreateUserActivityRequest, Stats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private apiUrl = 'http://localhost:8081/api/users/me/activities';

  constructor(private http: HttpClient) {}

  getUserActivities(): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(this.apiUrl);
  }

  getUserActivitiesByDateRange(startDate: string, endDate: string): Observable<UserActivity[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<UserActivity[]>(`${this.apiUrl}/date-range`, { params });
  }

  getUserActivitiesByCategory(category: string): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/category/${category}`);
  }

  getUserStats(startDate: string, endDate: string): Observable<Stats> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<Stats>(`${this.apiUrl}/stats`, { params });
  }

  createUserActivity(activity: CreateUserActivityRequest): Observable<UserActivity> {
    return this.http.post<UserActivity>(this.apiUrl, activity);
  }

  deleteUserActivity(activityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${activityId}`);
  }
}
