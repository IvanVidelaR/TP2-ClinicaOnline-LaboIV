import { Component, inject, OnInit } from '@angular/core';
import { LoaderComponent } from "../../components/loader/loader.component";
import { CommonModule, TitleCasePipe } from '@angular/common';
import { DatabaseService } from '../../services/database.service';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../models/usuario.model';
import { Disponibilidad } from '../../models/disponibilidad.model';
import { User } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-mis-horarios',
  standalone: true,
  imports: [LoaderComponent, TitleCasePipe, ReactiveFormsModule, CommonModule],
  templateUrl: './mis-horarios.component.html',
  styleUrl: './mis-horarios.component.css'
})
export class MisHorariosComponent implements OnInit{
  protected loading: boolean = false;
  private fb = inject(FormBuilder);
  private user?: User | null;
  private authenticationService = inject(AuthenticationService);
  private databaseService = inject(DatabaseService);
  protected usuario?: Usuario;

  protected disponibilidadForm = this.fb.group({
    lunes: this.fb.group({
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
    }),
    martes: this.fb.group({
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
    }),
    miercoles: this.fb.group({
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
    }),
    jueves: this.fb.group({
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
    }),
    viernes: this.fb.group({
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
    })
  });

  protected disponibilidad: Disponibilidad[] = [];
  protected horarios: string[] = [];

  constructor() {
    this.generarHorarios();
  }

  ngOnInit(): void {
    this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
      this.traerUsuario();
    });
  }

  async traerUsuario()
  {
    this.loading = true;
    try
    {
      if (this.user && this.user.email)
      {
        this.usuario = await firstValueFrom(this.databaseService.getDocumentById('usuarios', this.user.email));
        if (this.usuario && this.usuario.disponibilidad)
        {
          this.cargarDisponibilidad(this.usuario.disponibilidad);
        }
        else
        {
          this.establecerValoresPredeterminados();
        }
      }
    }
    catch(error: any)
    {
      console.log('Error' + error);
    }
    finally
    {
      this.loading = false;
    }
  }

  generarHorarios() {
    const startTime = new Date();
    startTime.setHours(8, 0, 0, 0);
    const endTime = new Date();
    endTime.setHours(19, 0, 0, 0);
    const interval = 30; 

    while (startTime <= endTime) {
      const hours = startTime.getHours().toString().padStart(2, '0');
      const minutes = startTime.getMinutes().toString().padStart(2, '0');
      this.horarios.push(`${hours}:${minutes}`);
      startTime.setMinutes(startTime.getMinutes() + interval);
    }
  }

  async guardarDisponibilidad() {
    if(this.disponibilidadForm.valid)
    {
      const promise = new Promise(async (resolve, reject) => {
        try {
          const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
          this.disponibilidad = [];

          dias.forEach(dia => {
            const diaData = this.disponibilidadForm.get(dia)?.value;
            if (diaData && diaData.inicio && diaData.fin) {
              this.disponibilidad.push({
                dia: dia.charAt(0).toUpperCase() + dia.slice(1),
                horarioInicio: diaData.inicio,
                horarioFin: diaData.fin
              });
            }
          });

          if (this.user)
          {
            await this.databaseService.updateDocumentField('usuarios', this.user.email!, 'disponibilidad', this.disponibilidad);
          }
          resolve('');
        } catch (error) {
          reject();
        }
      });
  
      toast.promise(promise, {
        loading: 'Guardando horarios...',
        success: 'Horarios guardados correctamente.',
        error: 'ERROR - No se pudo guardar horarios.'
      });

      
    }
  }

  
  cargarDisponibilidad(disponibilidadGuardada: Disponibilidad[]) {
    disponibilidadGuardada.forEach(diaData => {
      const diaLowerCase = diaData.dia.toLowerCase(); 
      this.disponibilidadForm.get(diaLowerCase)?.patchValue({
        inicio: diaData.horarioInicio,
        fin: diaData.horarioFin
      });
    });
  }

  establecerValoresPredeterminados() {
    this.disponibilidadForm.patchValue({
      lunes: { inicio: '08:00', fin: '19:00' },
      martes: { inicio: '08:00', fin: '19:00' },
      miercoles: { inicio: '08:00', fin: '19:00' },
      jueves: { inicio: '08:00', fin: '19:00' },
      viernes: { inicio: '08:00', fin: '19:00' }
    });
  }
}
