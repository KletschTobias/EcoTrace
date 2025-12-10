import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Stats } from '../models/models';

export interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
  biography?: string;
  profileImageUrl?: string;
  hasSolarPanels?: boolean;
  hasHeatPump?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/users';
  private uploadUrl = 'http://localhost:8081/api/upload';

  constructor(private http: HttpClient) {}

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: number, request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/profile`, request);
  }

  uploadProfileImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ url: string }>(`${this.uploadUrl}/profile-image`, formData);
  }

  getUserStats(userId: number, startDate: string, endDate: string): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/${userId}/stats`, {
      params: { startDate, endDate }
    });
  }
}
