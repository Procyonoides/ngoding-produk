import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data?.['role'] as string | undefined;
  const role = auth.getRole();

  if (!auth.isLoggedIn()) {
    console.warn('⛔ Belum login — redirect ke /login');
    router.navigate(['/login']);
    return false;
  }

  if (!expectedRole) return true; // no role required

  if (role === expectedRole) return true;

  // role mismatch -> redirect to their default page
  console.warn(`⚠️ Role mismatch: expected=${expectedRole}, user=${role}`);
  if (role === 'admin') router.navigate(['/admin/product-list']);
  else router.navigate(['/user/user-view']);
  return false;
};
