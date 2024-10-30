import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { User } from '@angular/fire/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  return new Promise((resolve) => {
    authenticationService.getAuth().onAuthStateChanged((auth : User | null) => {
      if (auth)
      {
        router.navigateByUrl('/welcome-page', {replaceUrl: true});
      }
      else
      {
        resolve(true);  
      }
    })
  })
  
};
