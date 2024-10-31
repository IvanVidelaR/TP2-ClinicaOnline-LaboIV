import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const noAuthAdminGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  return new Promise((resolve) => {
    authenticationService.getAuth().onAuthStateChanged((auth) => {
      if(!auth || auth.displayName !== 'administrador')
      {
        router.navigateByUrl('/auth', {replaceUrl: true});
      }
      else
      {
        resolve(true);
      }
    })
  })
};
