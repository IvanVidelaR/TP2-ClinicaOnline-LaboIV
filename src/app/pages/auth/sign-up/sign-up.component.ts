import { Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  FormArray,
} from '@angular/forms';
import { toast } from 'ngx-sonner';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserCredential } from '@angular/fire/auth';
import { Persona } from '../../../models/persona.model';
import { ActivatedRoute } from '@angular/router';
import { Paciente } from '../../../models/paciente.model';
import { Especialista } from '../../../models/especialista.model';
import { DatabaseService } from '../../../services/database.service';
import { StorageService } from '../../../services/storage.service';
import { FirebaseError } from '@angular/fire/app';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  private authenticationService = inject(AuthenticationService);
  private databaseService = inject(DatabaseService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  protected profileImage? : Event;
  protected secondProfileImage? : Event;
  protected showPassword = false;
  protected perfil: string = '';
  protected isOtherSpecialty: boolean = false;

  protected especialidades: string[] = [
    'Cardiología',
    'Pediatría',
    'Neurología',
    'Ginecología',
    'Odontología',
    'Traumatología',
    'Radiología',
    'Nutrición',
    'Oftalmología',
  ];

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.perfil = params['perfil'];

      if (this.perfil === 'especialista') {
        this.form.get('especialidad')?.setValidators([Validators.required]);
        this.form.get('especialidad')?.updateValueAndValidity();
      } else if (this.perfil === 'paciente') {
        this.form.get('obraSocial')?.setValidators([Validators.required]);
        this.form.get('obraSocial')?.updateValueAndValidity();
        this.form
          .get('segundaImagenDePerfil')
          ?.setValidators([Validators.required]);
        this.form.get('segundaImagenDePerfil')?.updateValueAndValidity();
      }
      else
      {
        this.router.navigateByUrl('/error');
      }
    });
  }

  protected onSpecialtyChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(selectElement.selectedOptions).map(
      (option) => option.value
    );

    const especialidadArray = this.form.get('especialidad') as FormArray;
    especialidadArray.clear();
    selectedOptions.forEach((option) => {
      especialidadArray.push(new FormControl(option));
    });
  }

  protected addSpecialty() {
    if (this.form.value.otraEspecialidad == '') return;

    if (this.form.value.otraEspecialidad)
    {
      const specialty = this.capitalizeFirstLetter(this.form.value.otraEspecialidad.trim());
      this.especialidades.push(specialty);
    }
    
    this.form.controls.otraEspecialidad.setValue('');
  }

  protected togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  protected capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  protected form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    edad: new FormControl(null, [Validators.required]),
    dni: new FormControl(null, [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    imagenDePerfil: new FormControl('', [Validators.required]),
    especialidad: new FormArray([]),
    otraEspecialidad: new FormControl(''),
    obraSocial: new FormControl(''),
    segundaImagenDePerfil: new FormControl(''),
  });

  protected async onSubmit() {
    if (this.form.valid) {
      const promise = new Promise<any>((resolve, reject) => {
        this.authenticationService
          .signUp(
            this.perfil == 'especialista'
              ? (this.form.value as Especialista)
              : (this.form.value as Paciente)
          )
          .then(async (userCredentials) => {
            await this.saveFormData();
            this.form.reset();
            resolve(userCredentials);
            return userCredentials;
          })
          .catch((error: FirebaseError) => {
            this.form.reset();
            reject(error);
            return error;
          });
      });

      toast.promise(promise, {
        loading: 'Creando cuenta...',
        success: (userCredentials: UserCredential) => {
          return 'Bienvenido ' + userCredentials.user.displayName;
        },
        error: (error: any) => {
          let message = '';

          switch (error.code) {
            case 'auth/email-already-in-use':
              message = "Este correo ya está en uso.";
              break;
            case 'auth/invalid-email':
              message = "Correo inválido.";
              break;
            default:
              message = "ERROR - " + error.message;
              break;
          }

          return message;
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  protected async saveFormData() : Promise<void>{
    const formData = { ...this.form.value };

    const personaData: Persona = {
      nombre: formData.nombre!,
      apellido: formData.apellido!,
      edad: formData.edad!,
      dni: formData.dni!,
      email: formData.email!,
      password: formData.password!,
      imagenDePerfil: '',
    };

    if (this.perfil == 'especialista') 
    {
      const urlImage = await this.loadImage(this.profileImage!, 'especialistas', personaData);
      personaData.imagenDePerfil = urlImage;

      const especialistaData: Especialista = {
        ...personaData,
        especialidad: formData.especialidad!,
      };

      await this.databaseService.setDocument('especialistas', especialistaData, personaData.dni!);
    } 
    else if (this.perfil == 'paciente') 
    {
      console.log('hola');
      
      const urlImage = await this.loadImage(this.profileImage!, 'pacientes', personaData);
      personaData.imagenDePerfil = urlImage;

      console.log('Primera imagen: ' + urlImage);

      const urlSecondImage = await this.loadImage(this.secondProfileImage!, 'pacientes', personaData, true);

      console.log('Segunda imagen: ' + urlSecondImage);

      const pacienteData: Paciente = {
        ...personaData,
        obraSocial: formData.obraSocial!,
        segundaImagenDePerfil: urlSecondImage,
      };

      await this.databaseService.setDocument('pacientes', pacienteData, personaData.dni!);
    }
  }

  protected async loadImage($event : Event, collection: string, data: Persona, secondProfileImage: boolean = false): Promise<string>
  {
    const inputElement = $event!.target as HTMLInputElement;

    if (inputElement.files && inputElement.files[0]) {
      const file = inputElement.files[0];
      
      const blob = new Blob([file], {
        type: file.type
      });

      // Devuelve el la url de la imagen.
      return await this.storageService.uploadImage(blob, collection, data.dni!, secondProfileImage); 
    }

    return '';
  }
}
