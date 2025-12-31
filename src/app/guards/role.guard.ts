import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Role } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed = (route.data?.['roles'] as Role[]) ?? [];

  // se não estiver logado, manda pro modal login
  if (!auth.isLoggedIn()) {
    router.navigate([{ outlets: { modal: ['login'] } }]);
    return false;
  }

  // se não exigiu roles, libera
  if (allowed.length === 0) return true;

  // verifica se tem pelo menos uma role permitida
  const ok = allowed.some(r => auth.hasRole(r));
  if (ok) return true;

  // sem permissão
  router.navigate(['/']);
  return false;
};
