import { CanActivateFn } from '@angular/router';

export const signUpGuard: CanActivateFn = (route, state) => {
  return true;
};
