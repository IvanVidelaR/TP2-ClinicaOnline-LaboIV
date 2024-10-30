import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateCurrentUser, updateProfile, User, UserCredential } from '@angular/fire/auth';
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

  public async signUp(persona: Persona) : Promise<UserCredential>
  {
    const userCredential = await createUserWithEmailAndPassword(this.auth, persona.email, persona.password);

    if (this.auth.currentUser) {
      await updateProfile(this.auth.currentUser, { displayName: persona.perfil });
    }
    
    return userCredential;  
  }

  public async signOut(): Promise<void>
  {
    return this.auth.signOut();
  }
}
