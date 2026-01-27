import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Friendship, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  private apiUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {}

  getUserFriends(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}/friends`);
  }

  getUserFriendships(userId: number): Observable<Friendship[]> {
    return this.http.get<Friendship[]>(`${this.apiUrl}/${userId}/friends/friendships`);
  }

  getLeaderboard(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}/friends/leaderboard`);
  }

  addFriend(userId: number, friendEmail: string): Observable<Friendship> {
    return this.http.post<Friendship>(`${this.apiUrl}/${userId}/friends`, { friendEmail });
  }

  removeFriend(userId: number, friendshipId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/friends/${friendshipId}`);
  }
}
