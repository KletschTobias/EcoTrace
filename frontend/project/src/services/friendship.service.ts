import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Friendship, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  private apiUrl = 'http://localhost:8080/api/users/me/friends';

  constructor(private http: HttpClient) {}

    getUserFriends(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }
  getUserFriendships(): Observable<Friendship[]> {
    return this.http.get<Friendship[]>(`${this.apiUrl}/friendships`);
  }

  getLeaderboard(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/leaderboard`);
  }

  addFriend(friendExternalId: string): Observable<Friendship> {
    return this.http.post<Friendship>(this.apiUrl, { friendExternalId });
  }

  removeFriend(friendshipId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${friendshipId}`);
  }
}
