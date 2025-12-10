import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private isGuestMode = new BehaviorSubject<boolean>(false);
  public isGuestMode$ = this.isGuestMode.asObservable();

  enterGuestMode(): void {
    this.isGuestMode.next(true);
  }

  exitGuestMode(): void {
    this.isGuestMode.next(false);
  }

  isGuest(): boolean {
    return this.isGuestMode.getValue();
  }
}
