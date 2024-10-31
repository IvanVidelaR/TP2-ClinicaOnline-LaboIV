import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { User } from '@angular/fire/auth';
import { DatabaseService } from '../services/database.service';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../models/usuario.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  const databaseService = inject(DatabaseService);

  const router = inject(Router);

  return new Promise((resolve) => {
    authenticationService.getAuth().onAuthStateChanged(async (auth : User | null) => {
      if (auth && auth.emailVerified)
      {
        const usuarioDoc: Usuario = await firstValueFrom(
          databaseService.getDocumentById('usuarios', auth.email!)
        );

        if (
          usuarioDoc.perfil == 'especialista' &&
          usuarioDoc.habilitado == false
        )
        {
          resolve(true);
        }
        else
        {
          router.navigateByUrl('/welcome-page', {replaceUrl: true});
        }
      } 
      else
      {
        resolve(true);  
      }
    })
  })
  
};
