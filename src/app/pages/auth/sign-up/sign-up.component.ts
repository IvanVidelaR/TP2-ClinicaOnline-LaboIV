import { Component, inject } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserCredential } from '@angular/fire/auth';
import { Persona } from '../../../models/persona.model';
import { ActivatedRoute } from '@angular/router';
import { Paciente } from '../../../models/paciente.model';
import { Especialista } from '../../../models/especialista.model';

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
  protected perfil: string = '';
  protected isOtherSpecialty: boolean = false;

  protected especialidades: string[] = ['Cardiología', 'Pediatría', 'Neurología', 'Ginecología', 'Odontología', 'Traumatología', 'Radiología', 'Nutrición', 'Oftalmología'];

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.perfil = params['perfil'];

      if (this.perfil === 'especialista') {
        this.form.get('especialidad')?.setValidators([Validators.required]); 
        this.form.get('especialidad')?.updateValueAndValidity(); 
      } else if (this.perfil === 'paciente') {
        this.form.get('obraSocial')?.setValidators([Validators.required]); 
        this.form.get('obraSocial')?.updateValueAndValidity(); 
        this.form.get('segundaImagenDePerfil')?.setValidators([Validators.required]); 
        this.form.get('segundaImagenDePerfil')?.updateValueAndValidity(); 
      }
    });
  }

  onSpecialtyChange(event: Event) {
      const value = (event.target as HTMLSelectElement).value;
      this.isOtherSpecialty = value === 'otra';

      // Si se selecciona "Otra", se puede limpiar el control de la especialidad
      if (this.isOtherSpecialty) {
          this.form.get('otraEspecialidad')?.setValidators([Validators.required]); 
          this.form.get('otraEspecialidad')?.updateValueAndValidity(); 
      }
  }

  protected togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  protected form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    edad: new FormControl(null, [Validators.required]),
    dni: new FormControl(null, [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    imagenDePerfil: new FormControl('', [Validators.required]),
    especialidad: new FormControl(''), 
    otraEspecialidad: new FormControl(''),
    obraSocial: new FormControl(''), 
    segundaImagenDePerfil: new FormControl('')
  });

  protected async onSubmit() {

    if(this.form.valid)
    {
      const promise = new Promise<UserCredential>((resolve, reject) => {
        this.authenticationService.signUp(this.perfil == 'especialista' ? this.form.value as Especialista : this.form.value as Paciente)
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
