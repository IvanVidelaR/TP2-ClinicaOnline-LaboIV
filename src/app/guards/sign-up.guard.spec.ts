import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { signUpGuard } from './sign-up.guard';

describe('signUpGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => signUpGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
