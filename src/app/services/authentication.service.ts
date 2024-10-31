import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, updateCurrentUser, updateProfile, User, UserCredential } from '@angular/fire/auth';
import { Persona } from '../models/persona.model';
import { Observable } from 'rxjs';

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

  public getCurrentUser(): Observable<User | null> {
    return new Observable<User | null>((observer) => {
      this.auth.onAuthStateChanged((user: User | null) => {
        observer.next(user);
      });
    });
  }
  
  public signIn(persona: Persona) : Promise<UserCredential>
  {
    return signInWithEmailAndPassword(this.auth, persona.email, persona.password);
  }

  public async signUp(persona: Persona) : Promise<void>
  {
    const userCredentials = await createUserWithEmailAndPassword(this.auth, persona.email, persona.password);

    await updateProfile(userCredentials.user, { displayName: persona.perfil });
    
    await sendEmailVerification(userCredentials.user);
    
    await this.signOut();
  }

  public sendEmailVerification(user: User): Promise<void> {
    return sendEmailVerification(user);
  }
  
  public async signOut(): Promise<void>
  {
    return this.auth.signOut();
  }
}
