import { Component, HostListener, inject } from '@angular/core';
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
import { PersonaCredenciales } from '../../models/personaCredenciales.model';
import { useAnimation } from '@angular/animations';

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

  protected showPassword : boolean = false;
  protected isMenuOpen: boolean = false;
  
  protected usuariosPrecargados: Array<PersonaCredenciales> = [
    {
      perfil: 'Administrador',
      email: 'cogitar226@nestvia.com',
      password: 'cogitar',
      imagenDePerfil: 'https://firebasestorage.googleapis.com/v0/b/tp2-clinicaonline-ivanvidelar.appspot.com/o/administradores%2Fcogitar226%40nestvia.com?alt=media&token=b616290a-b510-4114-b889-aa5457d494dc'
    },
    {
      perfil: 'Especialista 1',
      email: 'madexe1773@nestvia.com',
      password: 'madexe',
      imagenDePerfil: 'https://firebasestorage.googleapis.com/v0/b/tp2-clinicaonline-ivanvidelar.appspot.com/o/especialistas%2Fmadexe1773%40nestvia.com?alt=media&token=1d89a1f4-9a37-4be8-bcc9-ed8848d994d6'
    },
    {
      perfil: 'Especialista 2',
      email: 'potagik380@ruhtan.com',
      password: 'potagik',
      imagenDePerfil: 'https://firebasestorage.googleapis.com/v0/b/tp2-clinicaonline-ivanvidelar.appspot.com/o/especialistas%2Fpotagik380%40ruhtan.com?alt=media&token=b2059f8f-52c7-4a40-be26-245b7009fdcf'
    },
    {
      perfil: 'Paciente 1',
      email: 'xemiyo5311@regishub.com',
      password: 'xemiyo',
      imagenDePerfil: 'https://firebasestorage.googleapis.com/v0/b/tp2-clinicaonline-ivanvidelar.appspot.com/o/pacientes%2Fxemiyo5311%40regishub.com?alt=media&token=4c704569-aa50-4145-9c20-a73383a6be13'
    },
    {
      perfil: 'Paciente 2',
      email: 'sofaso5970@ruhtan.com',
      password: 'sofaso',
      imagenDePerfil: 'https://firebasestorage.googleapis.com/v0/b/tp2-clinicaonline-ivanvidelar.appspot.com/o/pacientes%2Fsofaso5970%40ruhtan.com?alt=media&token=cebb4dbf-9289-415b-8505-95637c0a21fc'
    },
    {
      perfil: 'Paciente 3',
      email: 'nabekob942@ruhtan.com',
      password: 'nakekob',
      imagenDePerfil: 'https://firebasestorage.googleapis.com/v0/b/tp2-clinicaonline-ivanvidelar.appspot.com/o/pacientes%2Fnabekob942%40ruhtan.com?alt=media&token=d2244b77-84d9-4ef5-858b-fcd3eb18a5df'
    },
  ]
  
  protected togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  protected toggleMenu() {
    console.log(this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;
  }

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  protected completarCredenciales(usuario: PersonaCredenciales) {
    this.form.patchValue({
      email: usuario.email,
      password: usuario.password,
    });
  }


  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.toggle-menu');
    if (!clickedInside) {
      this.isMenuOpen = false;
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
