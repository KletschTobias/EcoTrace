import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GuestService } from '../services/guest.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const guestService = inject(GuestService);
  const router = inject(Router);

  // If authenticated, allow full access
  if (authService.isAuthenticated()) {
    guestService.exitGuestMode();
    return true;
  }

  // If not authenticated, enter guest mode and allow access
  // Users can browse the app but some features are locked
  guestService.enterGuestMode();
  return true;
};
