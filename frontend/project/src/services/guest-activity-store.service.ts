import { Injectable } from '@angular/core';
import { UserActivity } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GuestActivityStoreService {
  private guestActivities: UserActivity[] = [];

  addActivity(activity: UserActivity): void {
    this.guestActivities.push(activity);
    console.log('[GuestActivityStore] Activity added:', activity.activityName);
  }

  getActivities(): UserActivity[] {
    return [...this.guestActivities];
  }

  clearActivities(): void {
    this.guestActivities = [];
    console.log('[GuestActivityStore] All activities cleared');
  }
}
