import { Component, inject } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Persona } from '../../models/persona.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  private authenticationService = inject(AuthenticationService);

  protected showPassword = false;

  protected togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  protected async onSubmit() {
    // Acá tendría que hacer una promesa con new Promise y hacer el sign in y despues lanzar la otra promesa de setear el documento. Con set get document.
    if(this.form.valid)
    {
      toast.promise(this.authenticationService.signIn(this.form.value as Persona), {
        loading: 'Iniciando sesión...',
        success: (userCredentials) => {
          return 'Bienvenido ' + userCredentials.user.displayName;
        },
        error: '¡ERROR - Correo y/o contraseña inválidos!'
      })
    }
  }
}
