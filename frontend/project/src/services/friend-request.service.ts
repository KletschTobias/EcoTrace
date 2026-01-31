import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FriendRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FriendRequestService {
  private apiUrl = 'http://localhost:8081/api/friend-requests';

  constructor(private http: HttpClient) {}

  sendFriendRequest(receiverIdentifier: string): Observable<FriendRequest> {
    return this.http.post<FriendRequest>(this.apiUrl, { receiverIdentifier });
  }

  getReceivedRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/received`);
  }

  getSentRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/sent`);
  }

  acceptRequest(requestId: number): Observable<FriendRequest> {
    return this.http.post<FriendRequest>(`${this.apiUrl}/${requestId}/accept`, {});
  }

  rejectRequest(requestId: number): Observable<FriendRequest> {
    return this.http.post<FriendRequest>(`${this.apiUrl}/${requestId}/reject`, {});
  }

  cancelRequest(requestId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${requestId}`);
  }
}
