import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { User } from '@angular/fire/auth';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  return new Promise((resolve) => {
    authenticationService.getAuth().onAuthStateChanged((auth: User | null) => {
      if (!auth)
      {
        router.navigateByUrl('/auth', {replaceUrl: true})
      }
      else
      {
        resolve(true);  
      }
    })
  });

  return true;

};
