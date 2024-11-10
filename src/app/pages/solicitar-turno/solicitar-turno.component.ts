import { Component, inject, OnInit } from '@angular/core';
import { LoaderComponent } from "../../components/loader/loader.component";
import { DatabaseService } from '../../services/database.service';
import { Especialidad } from '../../models/especialidad.model';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { Especialista } from '../../models/especialista.model';
import { DatePipe } from '@angular/common';
import { DiasDisponibles } from '../../models/diasDisponibles.model';
import { Turno } from '../../models/turno.model';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '@angular/fire/auth';
import { toast } from 'ngx-sonner';
import { Paciente } from '../../models/paciente.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [LoaderComponent, DatePipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit{
  private databaseService = inject(DatabaseService);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  protected especialidades: Especialidad[] = [];
  protected especialistas: Especialista[] = [];
  protected especialistasEspecialidad: Especialista[] = [];
  protected especialidadSeleccionada: string = '';
  protected especialistaSeleccionado: Especialista | null = null;
  protected loading: boolean = false;
  protected diasDisponibles: DiasDisponibles[] = [];
  protected turnoSeleccionado: Turno | null = null; 
  protected user?: User | null;
  
  protected pacientes: Paciente[] = [];
  protected pacienteSeleccionado: Paciente | null = null;

  ngOnInit(): void {
    this.authenticationService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
      if (this.user?.displayName == 'administrador')
        this.traerPacientes();
      this.traerEspecialidades();
    });
  }

  async traerPacientes()
  {
    try
    {
      this.loading = true;
      const usuarios: any = await firstValueFrom(this.databaseService.getDocument('usuarios'));
      this.pacientes = usuarios.filter((usuario: any) => usuario.perfil == 'paciente');
      console.log(this.pacientes);
    }
    catch (error)
    {
      console.log(error);
    }
    finally
    {
      this.loading = false;
    }
  }

  async traerEspecialidades()
  {
    try
    {
      this.loading = true;
      this.especialidades = await firstValueFrom(this.databaseService.getDocument('especialidades')); 
      const usuarios: any = await firstValueFrom(this.databaseService.getDocument('usuarios'));
      this.especialistas = usuarios.filter((usuario: any) => usuario.perfil == 'especialista');
    }
    catch (error)
    {
      console.log(error);
    }
    finally
    {
      this.loading = false;
    }
  }

  seleccionarEspecialidad(tipoEspecialidad : string)
  {
    this.especialistasEspecialidad = [];
    this.especialistaSeleccionado = null;
    this.turnoSeleccionado = null;

    this.especialistas.forEach((especialista: Especialista) => {
      this.especialidadSeleccionada = tipoEspecialidad;
      if (especialista.especialidad.includes(tipoEspecialidad)) {
        this.especialistasEspecialidad.push(especialista);
      }
    });
  }

  seleccionarEspecialista(especialista : Especialista)
  {
    this.especialistaSeleccionado = especialista;
    this.diasDisponibles = this.generateAvailableDatesAndTimes();
    this.turnoSeleccionado = null;
  }

  seleccionarPaciente(paciente: Paciente)
  {
    this.pacienteSeleccionado = paciente;
    this.especialidadSeleccionada = '';
    this.especialistaSeleccionado = null;
    this.turnoSeleccionado = null;
  }

  seleccionarTurno(turno: any)
  {
    this.turnoSeleccionado = turno;
    console.log(this.turnoSeleccionado);  
  }

  generateAvailableDatesAndTimes() {
    const dias: DiasDisponibles[] = [];
    const hoy = new Date();
  
    for (let i = 0; i < 15; i++) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() + i);
  
      if (dia.getDay() !== 0) {
        dias.push({
          dia,
          turnos: this.generateTimesForDay(dia)
        });
      }
    }
  
    return dias;
  }
  
  generateTimesForDay(date: Date) {
    const turnos: Turno[] = [];
    
    let especialista = this.especialistaSeleccionado;
  
    const dayIndex = date.getDay(); 
    
    const schedule = especialista!.disponibilidad[dayIndex - 1];
  
    if (schedule) {
      const { horarioInicio, horarioFin } = schedule;
      const [startHour, startMinute] = horarioInicio.split(':').map(Number);
      const [endHour, endMinute] = horarioFin.split(':').map(Number);
  
      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);
  
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);
  
      while (currentTime < endTime) {
        if (this.user?.displayName == 'administrador')
        {
          turnos.push({ hora: new Date(currentTime), especialistaEmail: this.especialistaSeleccionado!.email, pacienteEmail: this.pacienteSeleccionado!.email!, especialidad: this.especialidadSeleccionada});
        }
        else
        {
          turnos.push({ hora: new Date(currentTime), especialistaEmail: this.especialistaSeleccionado!.email, pacienteEmail: this.user!.email!, especialidad: this.especialidadSeleccionada});
        }
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
    }
  
    return turnos;
  }
  
  solicitarTurno()
  {
    const promise = new Promise(async (resolve, reject) => {
      try {
        await this.databaseService.setDocument('turnos', this.turnoSeleccionado);
        resolve('');
      } catch (error) {
        reject();
      }
    });

    toast.promise(promise, {
      loading: 'Agendando turno...',
      success: () => {
        this.router.navigateByUrl('/mi-perfil');
        return 'Turno agendado correctamente.'
      },
      error: 'ERROR - No se pudo agendar el turno.'
    });
  }
}
