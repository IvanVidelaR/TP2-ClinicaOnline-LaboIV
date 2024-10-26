import { Component, inject } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserCredential } from '@angular/fire/auth';
import { Persona } from '../../../models/persona.model';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  private authenticationService = inject(AuthenticationService);

  protected showPassword = false;

  protected togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  protected form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  protected async onSubmit() {

    if(this.form.valid)
    {
      const promise = new Promise<UserCredential>((resolve, reject) => {
        this.authenticationService.signUp(this.form.value as Persona)
        .then((userCredentials) => {
          resolve(userCredentials);
          return userCredentials;   

        })
        .catch((error) => reject(error)); 
        
      });

      toast.promise(promise, {
        loading: 'Creando cuenta...',
        success: (userCredentials: UserCredential) => {
          return 'Bienvenido ' + userCredentials.user.displayName;
        },
        error: '¡ERROR - Correo y/o contraseña inválidos!'
      });
    }
    else
    {
      this.form.markAllAsTouched();
    }
  }
}
