import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, Role } from '../service/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed = (route.data['roles'] as Role[] | undefined) ?? [];

  if (!auth.isLoggedIn()) {
    router.navigate([{ outlets: { modal: ['login'] } }]);
    return false;
  }

  if (allowed.length === 0) return true;

  const ok = allowed.some(r => auth.hasRole(r));
  if (!ok) router.navigate(['/']);
  return ok;
};
