import { Component, inject } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
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
  styleUrl: './auth.component.css'
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
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  completarCredenciales(usuario: string) {
    switch(usuario)
    {
      case 'Administrador':
        this.form.patchValue({email: 'ivan@videlar.com', password: 'ivanvidelar'})
        break;
      case 'Paciente':
        this.form.patchValue({email: 'juan@perez.com', password: 'juanperez'})
        break;
      case 'Especialista':
        this.form.patchValue({email: 'ramon@dino.com', password: 'ramondino'})
        break;
    }
  }

  protected async onSubmit() {
    if (this.form.valid) {
        const email = this.form.value.email;

        const promise = new Promise<any>(async (resolve, reject) => {
            try {
                const userCredentials = await this.authenticationService.signIn(this.form.value as Persona);
                
                const usuarioDoc : Usuario = await firstValueFrom(this.databaseService.getDocumentById('usuarios', email!));
                
                if (usuarioDoc.perfil == 'especialista' && usuarioDoc.habilitado == false) {
                  await this.authenticationService.signOut();
                  reject(new FirebaseError('especialista-noHabilitado', 'El especialista no está habilitado para ingresar - Contacte a la Clínica.'));
                  return new FirebaseError('especialista-noHabilitado', 'El especialista no está habilitado para ingresar.');
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
          success: (userCredentials) =>
          {
            return 'Bienvenido ' + userCredentials.user.displayName
          },
            error: (error: any) => error.message
        });
    }
}

}
