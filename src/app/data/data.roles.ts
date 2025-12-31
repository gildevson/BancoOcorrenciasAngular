import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1) tem que estar logado
  if (!auth.isLoggedIn()) {
    router.navigate([{ outlets: { modal: ['login'] } }]);
    return false;
  }

  // 2) se não pediu roles, ok
  const allowed: string[] = route.data?.['roles'] ?? [];
  if (allowed.length === 0) return true;

  // 3) verifica se tem alguma role permitida
  const hasAny = allowed.some(r => auth.hasRole(r as any));
  if (!hasAny) {
    router.navigate(['/']); // ou uma página "sem acesso"
    return false;
  }

  return true;
};
