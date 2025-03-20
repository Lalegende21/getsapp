import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!token) {
    // Redirige manuellement
    window.location.href = '/login';
    return false;
  }

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  return true;
};
