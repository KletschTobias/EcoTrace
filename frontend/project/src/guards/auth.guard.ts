import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wenn nicht eingeloggt → Hero
  if (!authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  const path = state.url.split('?')[0];

  // Wenn eingeloggt und versucht "/" oder "" aufzurufen → Activities
  if (path === '/' || path === '') {
    return router.parseUrl('/activities');
  }

  return true;
};
