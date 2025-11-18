import { CanActivateFn } from '@angular/router';
import { inject, } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  else {
    console.warn('⛔ Belum login — redirect ke /login');
    router.navigate(['/login']);
    return false;
  }
  
};
