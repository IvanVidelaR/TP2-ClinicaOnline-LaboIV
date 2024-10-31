import { Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { toast } from 'ngx-sonner';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Persona } from '../../models/persona.model';
import { FirebaseError } from '@angular/fire/app';
import { DatabaseService } from '../../services/database.service';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  private authenticationService = inject(AuthenticationService);
  private databaseService = inject(DatabaseService);

  protected showPassword = false;

  protected togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  completarCredenciales(usuario: string) {
    switch (usuario) {
      case 'Administrador':
        this.form.patchValue({
          email: 'pitej77720@ruhtan.com',
          password: 'pitej777',
        });
        break;
      case 'Paciente':
        this.form.patchValue({
          email: 'pemoce3772@ruhtan.com',
          password: 'pemoce',
        });
        break;
      case 'Especialista':
        this.form.patchValue({
          email: 'nijamam287@nestvia.com',
          password: 'nijamam',
        });
        break;
    }
  }

  protected async onSubmit() {
    if (this.form.valid) {
      const email = this.form.value.email;

      const promise = new Promise<any>(async (resolve, reject) => {
        try {
          const userCredentials = await this.authenticationService.signIn(
            this.form.value as Persona
          );

          if (userCredentials.user.emailVerified) {
            const usuarioDoc: Usuario = await firstValueFrom(
              this.databaseService.getDocumentById('usuarios', email!)
            );

            if (
              usuarioDoc.perfil == 'especialista' &&
              usuarioDoc.habilitado == false
            ) {
              await this.authenticationService.signOut();
              reject(
                new FirebaseError(
                  'auth/especialista-disabled',
                  'El especialista no está habilitado para ingresar - Contacte a la Clínica.'
                )
              );
              return new FirebaseError(
                'auth/especialista-disabled',
                'El especialista no está habilitado para ingresar.'
              );
            }
          }
          else
          {
            await this.authenticationService.signOut();
            reject(
              new FirebaseError(
                'auth/email-not-verified',
                '¡No verifico su email para ingresar!'
              )
            );
            return new FirebaseError(
              'auth/email-not-verified',
              '¡No verifico su email para ingresar!'
            );
          }

          resolve(userCredentials);
          return userCredentials;
        } catch (error) {
          reject(error);
          return error;
        }
      });

      toast.promise(promise, {
        loading: 'Iniciando sesión...',
        success: (userCredentials) => {
          return 'Bienvenido ' + userCredentials.user.displayName;
        },
        error: (error: any) => {
          let message = '';
        
          switch (error.code) {
            case 'auth/invalid-credential':
              message = '¡ERROR! Verifique su correo y contraseña.';
              break;
            case 'auth/especialista-disabled':
              message = error.message;
              break;
            case 'auth/email-not-verified':
              message = error.message;
              break;
            default:
              message = 'ERROR - ' + error.message;
              break;
          }
        
          return message;
        }
        
      });
    }
  }
}
