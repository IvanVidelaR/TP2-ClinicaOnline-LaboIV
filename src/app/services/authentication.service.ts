import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateCurrentUser, updateProfile, UserCredential } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private auth: Auth = inject(Auth);

  constructor() { }

  public getAuth() : Auth
  {
    return this.auth;
  }

  public signIn(email: string, password: string) : Promise<UserCredential>
  {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  public signUp(email: string, password: string) : Promise<UserCredential>
  {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  public updateUser(displayName: string) : Promise<void>
  {
    return updateProfile(this.auth.currentUser!, {displayName})
  }
}
